import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

serve(async (req) => {
  // Handle CORS
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
    const { provider, model, messages, temperature = 0.7, maxTokens = 2048 } = await req.json();

    // Validate inputs
    if (!provider || !model || !messages) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: provider, model, messages" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get API key from environment
    const apiKey = Deno.env.get(`${provider.toUpperCase()}_API_KEY`);
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: `API key not configured for ${provider}` }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Route to appropriate provider
    let response;

    switch (provider.toLowerCase()) {
      case "openai":
        response = await callOpenAI(apiKey, model, messages, temperature, maxTokens);
        break;
      case "anthropic":
        response = await callAnthropic(apiKey, model, messages, temperature, maxTokens);
        break;
      case "google":
        response = await callGoogle(apiKey, model, messages, temperature, maxTokens);
        break;
      case "groq":
        response = await callGroq(apiKey, model, messages, temperature, maxTokens);
        break;
      case "deepseek":
        response = await callDeepSeek(apiKey, model, messages, temperature, maxTokens);
        break;
      case "mistral":
        response = await callMistral(apiKey, model, messages, temperature, maxTokens);
        break;
      default:
        response = await callOpenAICompatible(apiKey, provider, model, messages, temperature, maxTokens);
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

async function callOpenAI(
  apiKey: string,
  model: string,
  messages: any[],
  temperature: number,
  maxTokens: number
) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return {
    provider: "openai",
    model,
    content: data.choices[0].message.content,
    usage: data.usage,
    raw: data,
  };
}

async function callAnthropic(
  apiKey: string,
  model: string,
  messages: any[],
  temperature: number,
  maxTokens: number
) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();
  return {
    provider: "anthropic",
    model,
    content: data.content[0].text,
    usage: data.usage,
    raw: data,
  };
}

async function callGoogle(
  apiKey: string,
  model: string,
  messages: any[],
  temperature: number,
  maxTokens: number
) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: messages.map((msg) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        })),
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google API error: ${error}`);
  }

  const data = await response.json();
  return {
    provider: "google",
    model,
    content: data.candidates[0].content.parts[0].text,
    raw: data,
  };
}

async function callGroq(
  apiKey: string,
  model: string,
  messages: any[],
  temperature: number,
  maxTokens: number
) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${error}`);
  }

  const data = await response.json();
  return {
    provider: "groq",
    model,
    content: data.choices[0].message.content,
    usage: data.usage,
    raw: data,
  };
}

async function callDeepSeek(
  apiKey: string,
  model: string,
  messages: any[],
  temperature: number,
  maxTokens: number
) {
  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${error}`);
  }

  const data = await response.json();
  return {
    provider: "deepseek",
    model,
    content: data.choices[0].message.content,
    usage: data.usage,
    raw: data,
  };
}

async function callMistral(
  apiKey: string,
  model: string,
  messages: any[],
  temperature: number,
  maxTokens: number
) {
  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mistral API error: ${error}`);
  }

  const data = await response.json();
  return {
    provider: "mistral",
    model,
    content: data.choices[0].message.content,
    usage: data.usage,
    raw: data,
  };
}

async function callOpenAICompatible(
  apiKey: string,
  provider: string,
  model: string,
  messages: any[],
  temperature: number,
  maxTokens: number
) {
  const endpoints: { [key: string]: string } = {
    together: "https://api.together.xyz/v1",
    cerebras: "https://api.cerebras.ai/v1",
    hyperbolic: "https://api.hyperbolic.xyz/v1",
  };

  const endpoint = endpoints[provider.toLowerCase()] || `https://api.${provider}.com/v1`;

  const response = await fetch(`${endpoint}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
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
    content: data.choices[0].message.content,
    usage: data.usage,
    raw: data,
  };
}
