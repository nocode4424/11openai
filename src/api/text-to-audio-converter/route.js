async function handler({ text }) {
  if (!text) {
    return { error: "Text input is required" };
  }

  const VOICE_ID = "Xb7hH8MSUJpSbSDYk0k2";
  const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");

    return {
      success: true,
      audioContent: base64Audio,
      contentType: "audio/mpeg",
    };
  } catch (error) {
    return {
      error: "Failed to convert text to audio",
      details: error.message,
    };
  }
}
export async function POST(request) {
  return handler(await request.json());
}