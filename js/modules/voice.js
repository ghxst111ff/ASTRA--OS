/* =========================================================
   ASTRA VOICE / CONVERSATION ENGINE v2.0
   Natural speech, conversational pacing, better voice selection,
   interruption handling, and provider-ready TTS architecture.

   Design goals:
   - Sound conversational rather than like a raw browser command reader.
   - Prefer installed neural / natural voices.
   - Speak in short conversational chunks with controlled pauses.
   - Keep listening and speaking states separate to prevent echo loops.
   - Allow a future gateway TTS provider without exposing provider keys.
   - Fall back cleanly to native browser speech when remote TTS is unavailable.
========================================================= */
const VoiceModule = (() => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    let recognition = null;
    let listening = false;
    let speaking = false;
    let restarting = false;
    let voices = [];
    let restartTimer = null;
    let speechQueue = [];
    let queueRunning = false;
    let currentUtterance = null;
    let ignoreRecognitionUntil = 0;

    const STORAGE = {
        voice: "ASTRA_VOICE_NAME",
        provider: "ASTRA_VOICE_PROVIDER",
        rate: "ASTRA_VOICE_RATE",
        pitch: "ASTRA_VOICE_PITCH",
        ttsPath: "ASTRA_VOICE_TTS_PATH"
    };

    const settings = {
        provider: localStorage.getItem(STORAGE.provider) || "auto",
        voiceName: localStorage.getItem(STORAGE.voice) || "",
        rate: Number(localStorage.getItem(STORAGE.rate) || 0.96),
        pitch: Number(localStorage.getItem(STORAGE.pitch) || 1.0),
        ttsPath: localStorage.getItem(STORAGE.ttsPath) || "/tts"
    };

    const NATURAL_PATTERNS = [
        "online (natural)",
        "online natural",
        "neural",
        "natural",
        "premium",
        "enhanced",
        "wavenet",
        "studio",
        "journey",
        "aria",
        "jenny",
        "ava",
        "samantha",
        "karen",
        "google us english",
        "microsoft"
    ];

    const VOICE_RANK = [
        "microsoft aria online (natural)",
        "microsoft jenny online (natural)",
        "microsoft ava online (natural)",
        "microsoft sara online (natural)",
        "microsoft guy online (natural)",
        "google us english",
        "samantha",
        "karen",
        "ava",
        "aria",
        "jenny",
        "daniel"
    ];

    function supported() {
        return !!Recognition;
    }

    function loadVoices() {
        if (!window.speechSynthesis) return [];
        voices = window.speechSynthesis.getVoices() || [];
        return voices;
    }

    function voiceScore(voice) {
        const name = String(voice?.name || "").toLowerCase();
        const lang = String(voice?.lang || "").toLowerCase();
        if (!/^en(-|_)/i.test(lang)) return -1000;

        let score = 0;
        if (voice.default) score += 8;
        if (lang === "en-us") score += 20;
        if (lang.startsWith("en-us")) score += 8;

        VOICE_RANK.forEach((preferred, index) => {
            if (name.includes(preferred)) score += 120 - index * 5;
        });

        NATURAL_PATTERNS.forEach(pattern => {
            if (name.includes(pattern)) score += 35;
        });

        return score;
    }

    function pickVoice() {
        loadVoices();

        if (settings.voiceName) {
            const saved = voices.find(v => v.name === settings.voiceName);
            if (saved) return saved;
        }

        return voices
            .filter(v => /^en(-|_)/i.test(v.lang))
            .sort((a, b) => voiceScore(b) - voiceScore(a))[0] || null;
    }

    function clearRestart() {
        if (restartTimer) {
            clearTimeout(restartTimer);
            restartTimer = null;
        }
        restarting = false;
    }

    function scheduleRestart(delay = 250) {
        if (!listening || speaking || restarting || !recognition) return;
        restarting = true;
        restartTimer = setTimeout(() => {
            restartTimer = null;
            restarting = false;
            if (!listening || speaking || !recognition) return;
            try {
                recognition.start();
            } catch (error) {
                scheduleRestart(700);
            }
        }, delay);
    }

    function cleanForSpeech(text) {
        let clean = String(text ?? "")
            .replace(/<[^>]*>/g, " ")
            .replace(/```[\s\S]*?```/g, " ")
            .replace(/[*_#`]/g, "")
            .replace(/\s+/g, " ")
            .trim();

        // Make common trading notation sound natural when spoken.
        clean = clean
            .replace(/\bGBP\/USD\b/gi, "British pound versus US dollar")
            .replace(/\bEUR\/USD\b/gi, "euro versus US dollar")
            .replace(/\bUSD\/JPY\b/gi, "US dollar versus Japanese yen")
            .replace(/\bGBP\b/gi, "British pound")
            .replace(/\bUSD\b/gi, "US dollar")
            .replace(/\bEUR\b/gi, "euro")
            .replace(/\bJPY\b/gi, "Japanese yen")
            .replace(/\bAUD\b/gi, "Australian dollar")
            .replace(/\bCAD\b/gi, "Canadian dollar")
            .replace(/\bCHF\b/gi, "Swiss franc")
            .replace(/\bNZD\b/gi, "New Zealand dollar")
            .replace(/\b(\d+(?:\.\d+)?)%\b/g, "$1 percent")
            .replace(/\s*\/\s*/g, " versus ");

        return clean;
    }

    function splitForConversation(text) {
        const clean = cleanForSpeech(text);
        if (!clean) return [];

        // Keep short answers conversational. Avoid reading huge research payloads
        // as one giant synthetic sentence.
        const sentences = clean
            .replace(/\s*\n+\s*/g, ". ")
            .match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [clean];

        const chunks = [];
        let buffer = "";

        for (const sentence of sentences) {
            const part = sentence.trim();
            if (!part) continue;

            if ((buffer + " " + part).trim().length <= 190) {
                buffer = (buffer + " " + part).trim();
            } else {
                if (buffer) chunks.push(buffer);
                buffer = part;
            }
        }

        if (buffer) chunks.push(buffer);
        return chunks.slice(0, 12);
    }

    function stopSpeaking(options = {}) {
        speechQueue = [];
        queueRunning = false;
        currentUtterance = null;

        if (window.speechSynthesis) {
            try { window.speechSynthesis.cancel(); } catch (error) {}
        }

        speaking = false;
        ignoreRecognitionUntil = Date.now() + Number(options.ignoreMs || 1000);
        clearRestart();
    }

    function nativeSpeakChunk(chunk, index, chunks) {
        if (!window.speechSynthesis || !chunk) return false;

        const voice = pickVoice();
        const utterance = new SpeechSynthesisUtterance(chunk);
        currentUtterance = utterance;

        if (voice) utterance.voice = voice;
        utterance.rate = Math.max(0.82, Math.min(1.08, settings.rate));
        utterance.pitch = Math.max(0.88, Math.min(1.12, settings.pitch));
        utterance.volume = 1;

        utterance.onstart = () => {
            speaking = true;
        };

        utterance.onend = () => {
            if (currentUtterance !== utterance) return;
            currentUtterance = null;

            const next = speechQueue.shift();
            if (next) {
                // A tiny human-like turn pause between sentences.
                setTimeout(() => nativeSpeakChunk(next.text, next.index, chunks), next.pause);
                return;
            }

            queueRunning = false;
            speaking = false;
            ignoreRecognitionUntil = Date.now() + 1100;
            if (listening && recognition) scheduleRestart(650);
        };

        utterance.onerror = () => {
            if (currentUtterance !== utterance) return;
            currentUtterance = null;
            speechQueue = [];
            queueRunning = false;
            speaking = false;
            ignoreRecognitionUntil = Date.now() + 1100;
            if (listening && recognition) scheduleRestart(650);
        };

        try {
            window.speechSynthesis.speak(utterance);
            return true;
        } catch (error) {
            console.error("ASTRA native voice output:", error);
            return false;
        }
    }

    async function remoteSpeak(text) {
        const api = ASTRA.modules.api;
        if (!api?.status?.().configured) return false;

        try {
            const payload = {
                text,
                voice: settings.voiceName || null,
                provider: "natural",
                format: "mp3",
                instructions: "Conversational, warm, clear, natural pacing. Do not sound like a command reader.",
                responseFormat: "json"
            };

            const data = await api.request(settings.ttsPath, {
                method: "POST",
                body: JSON.stringify(payload)
            });

            const audioUrl = data?.audioUrl || data?.url || data?.audio_url;
            const audioData = data?.audioData || data?.audio || data?.audio_base64;

            if (!audioUrl && !audioData) return false;

            const audio = new Audio(audioUrl || `data:audio/mpeg;base64,${audioData}`);
            speaking = true;
            ignoreRecognitionUntil = Date.now() + 1200;
            await audio.play();
            await new Promise(resolve => {
                audio.onended = resolve;
                audio.onerror = resolve;
            });
            speaking = false;
            ignoreRecognitionUntil = Date.now() + 1100;
            if (listening && recognition) scheduleRestart(650);
            return true;
        } catch (error) {
            console.warn("ASTRA remote TTS unavailable; using native voice:", error);
            speaking = false;
            return false;
        }
    }

    async function speak(text) {
        if (!listening || !text) return false;

        const chunks = splitForConversation(text);
        if (!chunks.length) return false;

        stopSpeaking({ ignoreMs: 800 });

        if (settings.provider === "gateway" || settings.provider === "auto") {
            if (await remoteSpeak(cleanForSpeech(text))) return true;
        }

        if (!window.speechSynthesis) return false;

        speechQueue = chunks.slice(1).map((chunk, index) => ({
            text: chunk,
            index: index + 1,
            pause: /[?]$/.test(chunks[index]) ? 330 : 210
        }));
        queueRunning = true;

        return nativeSpeakChunk(chunks[0], 0, chunks);
    }

    function start() {
        if (!supported()) {
            AstraReply("Voice recognition is not supported by this browser.");
            return false;
        }

        if (listening) return true;

        loadVoices();
        clearRestart();
        ignoreRecognitionUntil = Date.now() + 900;

        recognition = new Recognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = event => {
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const text = result[0].transcript.trim();

                if (speaking || Date.now() < ignoreRecognitionUntil) continue;
                if (!result.isFinal || !text) continue;

                ASTRA.modules.response?.user?.(text);
                ASTRA.modules.command?.process?.(text);
            }
        };

        recognition.onerror = event => {
            console.warn("ASTRA voice recognition:", event.error);
            if (listening && event.error !== "not-allowed" && event.error !== "service-not-allowed") {
                scheduleRestart(350);
            }
        };

        recognition.onend = () => {
            if (listening && !speaking) scheduleRestart(650);
        };

        try {
            listening = true;
            recognition.start();
            AstraReply("Voice is ready.");
            return true;
        } catch (error) {
            console.error("ASTRA voice start:", error);
            listening = false;
            recognition = null;
            return false;
        }
    }

    function stop() {
        listening = false;
        clearRestart();
        stopSpeaking({ ignoreMs: 500 });

        if (recognition) {
            try { recognition.stop(); } catch (error) {}
            recognition = null;
        }

        AstraReply("Voice is off.");
    }

    function toggle() {
        return listening ? (stop(), false) : start();
    }

    function setVoice(name) {
        loadVoices();
        const voice = voices.find(v => v.name === name);
        if (!voice) return false;
        settings.voiceName = voice.name;
        localStorage.setItem(STORAGE.voice, voice.name);
        return true;
    }

    function setProvider(provider) {
        const value = String(provider || "auto").toLowerCase();
        if (!["auto", "native", "gateway"].includes(value)) return false;
        settings.provider = value;
        localStorage.setItem(STORAGE.provider, value);
        return true;
    }

    function setRate(rate) {
        const value = Number(rate);
        if (!Number.isFinite(value)) return false;
        settings.rate = Math.max(0.82, Math.min(1.08, value));
        localStorage.setItem(STORAGE.rate, String(settings.rate));
        return true;
    }

    function setPitch(pitch) {
        const value = Number(pitch);
        if (!Number.isFinite(value)) return false;
        settings.pitch = Math.max(0.88, Math.min(1.12, value));
        localStorage.setItem(STORAGE.pitch, String(settings.pitch));
        return true;
    }

    function getVoices() {
        loadVoices();
        return voices
            .filter(v => /^en(-|_)/i.test(v.lang))
            .map(v => ({
                name: v.name,
                lang: v.lang,
                default: v.default,
                naturalScore: voiceScore(v)
            }))
            .sort((a, b) => b.naturalScore - a.naturalScore);
    }

    function status() {
        const voice = pickVoice();
        return {
            supported: supported(),
            listening,
            speaking,
            restarting,
            provider: settings.provider,
            voice: voice?.name || null,
            voiceNaturalScore: voice ? voiceScore(voice) : null,
            rate: settings.rate,
            pitch: settings.pitch,
            ttsPath: settings.ttsPath,
            gatewayConfigured: !!ASTRA.modules.api?.status?.().configured,
            conversationalPacing: true,
            interruptionProtection: true
        };
    }

    if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return {
        name: "Voice Conversation Engine",
        version: "2.0",
        supported,
        start,
        stop,
        toggle,
        speak,
        stopSpeaking,
        setVoice,
        setProvider,
        setRate,
        setPitch,
        getVoices,
        status
    };
})();

ASTRA.registerModule("voice", VoiceModule);
ASTRA.commands.push({ trigger: "start voice", action: () => VoiceModule.start() });
ASTRA.commands.push({ trigger: "stop voice", action: () => VoiceModule.stop() });
ASTRA.commands.push({ trigger: "voice status", action: () => AstraReply(JSON.stringify(VoiceModule.status(), null, 2)) });
console.log("ASTRA Voice Conversation Engine v2.0 Loaded");
