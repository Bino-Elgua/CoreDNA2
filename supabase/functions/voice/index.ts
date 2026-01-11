import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    const { provider, model, text, voice } = await req.json();

    if (!provider || !model || !text) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: provider, model, text" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get(`${provider.toUpperCase()}_API_KEY`);
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: `API key not configured for ${provider}` }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    let response;

    switch (provider.toLowerCase()) {
      case "elevenlabs":
        response = await callElevenLabs(apiKey, model, text, voice);
        break;
      case "openai":
      case "openai_tts":
        response = await callOpenAITTS(apiKey, model, text, voice);
        break;
      case "playht":
        response = await callPlayHT(apiKey, model, text, voice);
        break;
      case "cartesia":
        response = await callCartesia(apiKey, model, text, voice);
        break;
      case "google":
      case "google_tts":
        response = await callGoogleTTS(apiKey, model, text, voice);
        break;
      default:
        response = await callOpenAICompatible(apiKey, provider, model, text, voice);
    }

    return new Response(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

async function callElevenLabs(
  apiKey: string,
  model: string,
  text: string,
  voice: string = "21m00Tcm4TlvDq8ikWAM"
) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: model,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${error}`);
  }

  const blob = await response.blob();
  const audioUrl = URL.createObjectURL(blob);

  return {
    provider: "elevenlabs",
    model,
    audioUrl,
  };
}

async function callOpenAITTS(
  apiKey: string,
  model: string,
  text: string,
  voice: string = "alloy"
) {
  const response = await fetch(
    "https://api.openai.com/v1/audio/speech",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: text,
        voice,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI TTS error: ${error}`);
  }

  const blob = await response.blob();
  const audioUrl = URL.createObjectURL(blob);

  return {
    provider: "openai",
    model,
    audioUrl,
  };
}

async function callPlayHT(
  apiKey: string,
  model: string,
  text: string,
  voice: string = "s3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/female-cs/manifest.json"
) {
  const response = await fetch(
    "https://api.play.ht/api/v2/tts",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-USER-ID": "user_id",
      },
      body: JSON.stringify({
        text,
        voice,
        output_format: "mp3",
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PlayHT API error: ${error}`);
  }

  const blob = await response.blob();
  const audioUrl = URL.createObjectURL(blob);

  return {
    provider: "playht",
    model,
    audioUrl,
  };
}

async function callCartesia(
  apiKey: string,
  model: string,
  text: string,
  voice: string = "a0e99841-438c-4a64-b679-ae501e7d6091"
) {
  const response = await fetch(
    "https://api.cartesia.ai/tts/bytes",
    {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Cartesia-Version": "2024-06-10",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model_id: model,
        transcript: text,
        voice: {
          mode: "id",
          id: voice,
        },
        output_format: {
          container: "raw",
          encoding: "pcm_f32le",
          sample_rate: 44100,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cartesia API error: ${error}`);
  }

  const blob = await response.blob();
  const audioUrl = URL.createObjectURL(blob);

  return {
    provider: "cartesia",
    model,
    audioUrl,
  };
}

async function callGoogleTTS(
  apiKey: string,
  model: string,
  text: string,
  voice: string = "en-US-Neural2-A"
) {
  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: "en-US",
          name: voice,
        },
        audioConfig: { audioEncoding: "MP3" },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google TTS error: ${error}`);
  }

  const data = await response.json();
  return {
    provider: "google",
    model,
    audioContent: data.audioContent,
    audioUrl: `data:audio/mp3;base64,${data.audioContent}`,
  };
}

async function callOpenAICompatible(
  apiKey: string,
  provider: string,
  model: string,
  text: string,
  voice: string
) {
  const endpoints: { [key: string]: string } = {
    deepgram: "https://api.deepgram.com/v1",
    rime: "https://api.rime.ai/v1",
  };

  const endpoint = endpoints[provider.toLowerCase()] || `https://api.${provider}.com/v1`;

  const response = await fetch(`${endpoint}/tts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model,
      voice,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`${provider} API error: ${error}`);
  }

  const blob = await response.blob();
  const audioUrl = URL.createObjectURL(blob);

  return {
    provider,
    model,
    audioUrl,
  };
}
