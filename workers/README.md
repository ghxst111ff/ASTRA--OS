# ASTRA Neural TTS Worker

This worker gives ASTRA a secure server-side speech path so the browser never receives the OpenAI API key.

## Deploy

Deploy `workers/tts.js` as a Cloudflare Worker and add this secret:

- `OPENAI_API_KEY`

Optional Worker variables:

- `ASTRA_TTS_MODEL` — defaults to `gpt-4o-mini-tts`
- `ASTRA_TTS_VOICE` — defaults to `coral`

The worker exposes:

`POST /tts`

with JSON such as:

```json
{
  "text": "GBP is approaching the level we marked earlier.",
  "voice": "coral",
  "instructions": "Warm, calm, natural trading mentor."
}
```

It returns JSON containing base64 MP3 audio for ASTRA's `Voice Conversation Engine`.

## ASTRA configuration

ASTRA's voice engine already tries the gateway TTS path first in `auto` mode and falls back to the browser's best installed natural voice if the gateway is unavailable.

The current API gateway base URL is used for the `/tts` request. If the TTS worker is deployed separately, configure the voice TTS path/endpoint in the ASTRA voice settings rather than exposing an API key in the frontend.

## Security

Do not put `OPENAI_API_KEY` in `index.html`, `script.js`, `localStorage`, or any browser-delivered JavaScript. Keep it as a Cloudflare Worker secret.
