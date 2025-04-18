/**
 * Twilio webhook endpoint to supply initial TwiML when the outbound call connects.
 * Responds with a Play + Record sequence, playing an ElevenLabs TTS greeting.
 */
export async function POST(request) {
  const url = new URL(request.url);
  const callId = url.searchParams.get('callId');
  if (!callId) {
    return new Response('Missing callId', { status: 400 });
  }
  // Fetch the call details to build a custom greeting
  const [call] = await sql`
    SELECT goal, target_context
    FROM calls
    WHERE id = ${callId}
  `;
  if (!call) {
    return new Response('Call not found', { status: 404 });
  }
  const greeting = `Hello, I'm your AI assistant calling to ${call.goal}. Please speak after the beep.`;
  // Generate TTS via ElevenLabs proxy
  const ttsUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/tts?text=${encodeURIComponent(
    greeting
  )}`;
  // Tell Twilio to play the greeting, then record the user's reply
  const recordAction = `${process.env.NEXT_PUBLIC_BASE_URL}/api/calls/recording?callId=${callId}&turn=0`;
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${ttsUrl}</Play>
  <Record action="${recordAction}" playBeep="true" timeout="3" maxLength="30" />
</Response>`;
  return new Response(twiml, {
    headers: { 'Content-Type': 'text/xml' },
  });
}