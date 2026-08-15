/* =========================================================
   ASTRA TTS WORKER
   Cloudflare Worker -> OpenAI Speech API

   Required secret:
     OPENAI_API_KEY

   Optional variables:
     ASTRA_TTS_MODEL (default: gpt-4o-mini-tts)
     ASTRA_TTS_VOICE (default: coral)

   The API key never reaches the browser.
========================================================= */

const DEFAULT_MODEL = "gpt-4o-mini-tts";
const DEFAULT_VOICE = "coral";

function corsHeaders(origin) {
  const allowed = origin || "*";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin"
  };
}

function json(data, status = 200, origin = "*") {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(origin)
    }
  });
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 12000);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "*";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const url = new URL(request.url);
    if (url.pathname !== "/tts" || request.method !== "POST") {
      return json({ ok: false, error: "ASTRA TTS endpoint not found." }, 404, origin);
    }

    if (!env.OPENAI_API_KEY) {
      return json({ ok: false, error: "OPENAI_API_KEY is not configured on the TTS worker." }, 503, origin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: "Invalid JSON request." }, 400, origin);
    }

    const text = cleanText(body?.text);
    if (!text) return json({ ok: false, error: "Text is required." }, 400, origin);

    const model = env.ASTRA_TTS_MODEL || DEFAULT_MODEL;
    const voice = body?.voice || env.ASTRA_TTS_VOICE || DEFAULT_VOICE;
    const instructions = body?.instructions ||
      "Speak like a calm, experienced trading mentor sitting beside the trader. Warm, natural, clear, confident, conversational pacing. Use brief pauses between thoughts. Do not sound like a command reader or announcer.";

    try {
      const upstream = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          voice,
          input: text,
          instructions,
          response_format: "mp3"
        })
      });

      if (!upstream.ok) {
        const detail = await upstream.text();
        return json({
          ok: false,
          error: "OpenAI TTS request failed.",
          status: upstream.status,
          detail: detail.slice(0, 1200)
        }, 502, origin);
      }

      const bytes = new Uint8Array(await upstream.arrayBuffer());
      let binary = "";
      const chunkSize = 0x8000;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }

      return json({
        ok: true,
        audioData: btoa(binary),
        format: "mp3",
        model,
        voice
      }, 200, origin);
    } catch (error) {
      return json({ ok: false, error: error?.message || "TTS request failed." }, 502, origin);
    }
  }
};
