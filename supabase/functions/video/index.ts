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
    const { provider, model, prompt, duration = 5 } = await req.json();

    if (!provider || !model || !prompt) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: provider, model, prompt" }),
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
      case "runway":
        response = await callRunway(apiKey, model, prompt, duration);
        break;
      case "luma":
        response = await callLuma(apiKey, model, prompt);
        break;
      case "ltx2":
        response = await callLTX(apiKey, model, prompt, duration);
        break;
      case "sora2":
        response = await callSora(apiKey, model, prompt, duration);
        break;
      case "veo3":
        response = await callVeo(apiKey, model, prompt, duration);
        break;
      case "kling":
        response = await callKling(apiKey, model, prompt, duration);
        break;
      case "pika":
        response = await callPika(apiKey, model, prompt);
        break;
      case "heygen":
        response = await callHeyGen(apiKey, model, prompt);
        break;
      default:
        throw new Error(`Video provider ${provider} not implemented`);
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

async function callRunway(
  apiKey: string,
  model: string,
  prompt: string,
  duration: number
) {
  // First, create a task
  const createResponse = await fetch(
    "https://api.runwayml.com/v1/image-to-video",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        promptText: prompt,
      }),
    }
  );

  if (!createResponse.ok) {
    const error = await createResponse.text();
    throw new Error(`Runway API error: ${error}`);
  }

  const data = await createResponse.json();
  const taskId = data.id;

  // Poll for result (max 120 attempts, 5s intervals)
  for (let i = 0; i < 120; i++) {
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const statusResponse = await fetch(
      `https://api.runwayml.com/v1/tasks/${taskId}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    );

    if (!statusResponse.ok) continue;

    const statusData = await statusResponse.json();

    if (statusData.status === "SUCCEEDED") {
      return {
        provider: "runway",
        model,
        videoUrl: statusData.output[0],
      };
    }

    if (statusData.status === "FAILED") {
      throw new Error("Runway generation failed");
    }
  }

  throw new Error("Runway generation timeout");
}

async function callLuma(
  apiKey: string,
  model: string,
  prompt: string
) {
  const createResponse = await fetch(
    "https://api.lumalabs.ai/dream-machine/v1/generations",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    }
  );

  if (!createResponse.ok) {
    const error = await createResponse.text();
    throw new Error(`Luma API error: ${error}`);
  }

  const data = await createResponse.json();
  const generationId = data.id;

  // Poll for result
  for (let i = 0; i < 120; i++) {
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const statusResponse = await fetch(
      `https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    );

    if (!statusResponse.ok) continue;

    const statusData = await statusResponse.json();

    if (statusData.state === "completed") {
      return {
        provider: "luma",
        model,
        videoUrl: statusData.video.url,
      };
    }

    if (statusData.state === "failed") {
      throw new Error("Luma generation failed");
    }
  }

  throw new Error("Luma generation timeout");
}

async function callLTX(
  apiKey: string,
  model: string,
  prompt: string,
  duration: number
) {
  const response = await fetch(
    "https://api.ltx.studio/v1/generate",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        model,
        num_frames: Math.ceil(25 * duration),
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LTX API error: ${error}`);
  }

  const data = await response.json();
  return {
    provider: "ltx",
    model,
    videoUrl: data.video_url,
  };
}

async function callSora(
  apiKey: string,
  model: string,
  prompt: string,
  duration: number
) {
  const response = await fetch(
    "https://api.openai.com/v1/video/generations",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sora-2024-12-01",
        prompt,
        duration,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Sora API error: ${error}`);
  }

  const data = await response.json();
  return {
    provider: "openai",
    model: "sora-2024-12-01",
    videoUrl: data.data[0].url,
  };
}

async function callVeo(
  apiKey: string,
  model: string,
  prompt: string,
  duration: number
) {
  const response = await fetch(
    `https://aiplatform.googleapis.com/v1/projects/{PROJECT_ID}/locations/us-central1/publishers/google/models/veo-001:predict`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instances: [
          {
            prompt,
          },
        ],
        parameters: {
          duration: Math.min(duration, 60),
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Veo API error: ${error}`);
  }

  const data = await response.json();
  return {
    provider: "google",
    model: "veo-001",
    videoUrl: data.predictions[0].videoUrl,
  };
}

async function callKling(
  apiKey: string,
  model: string,
  prompt: string,
  duration: number
) {
  const response = await fetch(
    "https://api.klingai.com/v1/videos/generation",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt,
        duration_in_seconds: Math.min(duration, 10),
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Kling API error: ${error}`);
  }

  const data = await response.json();
  return {
    provider: "kling",
    model,
    videoUrl: data.data.task_id,
  };
}

async function callPika(
  apiKey: string,
  model: string,
  prompt: string
) {
  const response = await fetch(
    "https://api.pika.art/v1/videos/generations",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        aspect_ratio: "16:9",
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Pika API error: ${error}`);
  }

  const data = await response.json();
  return {
    provider: "pika",
    model,
    videoId: data.id,
  };
}

async function callHeyGen(
  apiKey: string,
  model: string,
  prompt: string
) {
  const response = await fetch(
    "https://api.heygen.com/v2/video/generate",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HeyGen API error: ${error}`);
  }

  const data = await response.json();
  return {
    provider: "heygen",
    model,
    videoId: data.video_id,
  };
}
