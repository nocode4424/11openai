/**
 * ElevenLabs Text-to-Speech proxy for Twilio <Play>.
 * Accepts GET?text=... and streams back audio/mpeg.
 */
export async function GET(request) {
  const url = new URL(request.url);
  const text = url.searchParams.get('text') || '';
  if (!text) {
    return new Response('Missing text', { status: 400 });
  }
  // ElevenLabs API voice ID (can be overridden via env)
  const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'Xb7hH8MSUJpSbSDYk0k2';
  const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`;
  // Call ElevenLabs TTS
  const tlResponse = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Accept: 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.0, use_speaker_boost: true },
    }),
  });
  if (!tlResponse.ok) {
    const msg = await tlResponse.text();
    return new Response(msg, { status: tlResponse.status });
  }
  const audioBuffer = await tlResponse.arrayBuffer();
  return new Response(audioBuffer, { headers: { 'Content-Type': 'audio/mpeg' } });
}