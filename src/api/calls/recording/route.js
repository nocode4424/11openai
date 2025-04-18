/**
 * Twilio webhook to process user recordings:
 * 1) Downloads the RecordingUrl
 * 2) Sends audio to OpenAI Whisper for transcription
 * 3) Appends the user transcript to the call record
 * 4) Calls ChatGPT for the assistant reply
 * 5) Appends assistant reply, updates DB
 * 6) Returns new TwiML to Play TTS and Record again
 */
export async function POST(request) {
  const url = new URL(request.url);
  const callId = url.searchParams.get('callId');
  const turn = parseInt(url.searchParams.get('turn') || '0', 10);
  if (!callId) {
    return new Response('Missing callId', { status: 400 });
  }
  // Parse Twilio form-encoded body
  const bodyText = await request.text();
  const params = new URLSearchParams(bodyText);
  const recordingUrl = params.get('RecordingUrl');
  if (!recordingUrl) {
    return new Response('No recording URL', { status: 200 });
  }
  // Fetch the WAV audio
  const audioRes = await fetch(`${recordingUrl}.wav`);
  const audioBuffer = await audioRes.arrayBuffer();
  // Send to Whisper
  const formData = new FormData();
  formData.append('file', new Blob([audioBuffer]), 'recording.wav');
  formData.append('model', 'whisper-1');
  const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: formData,
  });
  const whisperData = await whisperRes.json();
  const userText = (whisperData.text || '').trim();
  // Load existing call
  const [call] = await sql`
    SELECT transcript, goal, target_context, instructions, tone_description
    FROM calls
    WHERE id = ${callId}
  `;
  const transcript = Array.isArray(call.transcript) ? call.transcript : [];
  // Append user entry
  transcript.push({ speaker: 'user', text: userText });
  // Build ChatGPT messages
  const systemPrompt = `You are an AI assistant on a phone call.
Goal: ${call.goal}
Context: ${call.target_context}
Instructions: ${call.instructions}
Tone: ${call.tone_description}`;
  const messages = [{ role: 'system', content: systemPrompt }];
  for (const entry of transcript) {
    messages.push({
      role: entry.speaker === 'assistant' ? 'assistant' : 'user',
      content: entry.text,
    });
  }
  // Call ChatGPT
  const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: 'gpt-3.5-turbo', messages }),
  });
  const chatData = await chatRes.json();
  const assistantText = (chatData.choices?.[0]?.message?.content || '').trim();
  transcript.push({ speaker: 'assistant', text: assistantText });
  // Persist transcript
  await sql`
    UPDATE calls
    SET transcript = ${transcript}
    WHERE id = ${callId}
  `;
  // Prepare next TwiML: play assistantText, then record next user response
  const ttsUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/tts?text=${encodeURIComponent(
    assistantText
  )}`;
  const nextAction = `${process.env.NEXT_PUBLIC_BASE_URL}/api/calls/recording?callId=${callId}&turn=${turn + 1}`;
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${ttsUrl}</Play>
  <Record action="${nextAction}" playBeep="true" timeout="3" maxLength="30" />
</Response>`;
  return new Response(twiml, { headers: { 'Content-Type': 'text/xml' } });
}