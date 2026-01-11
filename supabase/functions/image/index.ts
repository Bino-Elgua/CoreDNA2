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
    const { provider, model, prompt, size = "1024x1024", quality = "standard" } = await req.json();

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
      case "dalle3":
      case "dalle4":
        response = await callDallE(apiKey, model, prompt, size, quality);
        break;
      case "sd3":
      case "stability":
        response = await callStabilityAI(apiKey, model, prompt, size);
        break;
      case "flux":
        response = await callFlux(apiKey, model, prompt, size);
        break;
      case "midjourney":
        response = await callMidjourney(apiKey, model, prompt);
        break;
      default:
        response = await callOpenAICompatible(apiKey, provider, model, prompt, size);
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

async function callDallE(
  apiKey: string,
  model: string,
  prompt: string,
  size: string,
  quality: string
) {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt,
      size,
      quality,
      n: 1,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DALL-E API error: ${error}`);
  }

  const data = await response.json();
  return {
    provider: "openai",
    model,
    imageUrl: data.data[0].url,
    revisedPrompt: data.data[0].revised_prompt,
  };
}

async function callStabilityAI(
  apiKey: string,
  model: string,
  prompt: string,
  size: string
) {
  const formData = new FormData();
  formData.append("prompt", prompt);
  formData.append("model", model);
  formData.append("output_format", "png");

  const response = await fetch(
    "https://api.stability.ai/v2beta/stable-image/generate/sd3",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "image/*",
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Stability AI error: ${error}`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  return {
    provider: "stability",
    model,
    imageUrl: url,
  };
}

async function callFlux(
  apiKey: string,
  model: string,
  prompt: string,
  size: string
) {
  const response = await fetch(
    "https://api.bfl.ml/v1/images/generations",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        model,
        width: 1024,
        height: 1024,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Flux API error: ${error}`);
  }

  const data = await response.json();
  return {
    provider: "flux",
    model,
    imageUrl: data.result.sample,
  };
}

async function callMidjourney(
  apiKey: string,
  model: string,
  prompt: string
) {
  const response = await fetch("https://api.thenextleg.io/v2/imagine", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      msg: prompt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Midjourney API error: ${error}`);
  }

  const data = await response.json();
  // Note: Midjourney is async, you'll need to poll for results
  return {
    provider: "midjourney",
    model,
    messageId: data.messageId,
    status: "processing",
  };
}

async function callOpenAICompatible(
  apiKey: string,
  provider: string,
  model: string,
  prompt: string,
  size: string
) {
  const endpoints: { [key: string]: string } = {
    runware: "https://api.runware.ai/v1",
    prodia: "https://api.prodia.com/v1",
    segmind: "https://api.segmind.com/v1",
  };

  const endpoint = endpoints[provider.toLowerCase()] || `https://api.${provider}.com/v1`;

  const response = await fetch(`${endpoint}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      model,
      size,
      n: 1,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`${provider} API error: ${error}`);
  }

  const data = await response.json();
  return {
    provider,
    model,
    imageUrl: data.data?.[0]?.url || data.result?.sample,
  };
}
