/* =========================================================
   ASTRA RESEARCH / WEB INTELLIGENCE MODULE v1.1
   Natural-language research routing + market/news intelligence

   Design:
   - User language is interpreted by meaning and slots, not exact commands.
   - Research requests become structured intents before reaching the gateway.
   - All external research remains behind the canonical ASTRA API gateway.
   - Current claims require source/date grounding; ASTRA never fabricates a web result.
========================================================= */
const ResearchModule = (() => {
    const CURRENCIES = {
        GBP: ["gbp", "pound", "pounds", "sterling", "british pound", "uk", "britain", "united kingdom"],
        USD: ["usd", "dollar", "dollars", "us dollar", "united states", "america", "fed"],
        EUR: ["eur", "euro", "euros", "eurozone", "europe", "ecb"],
        JPY: ["jpy", "yen", "japanese yen", "japan", "boj"],
        AUD: ["aud", "australian dollar", "australia", "rba"],
        CAD: ["cad", "canadian dollar", "canada", "boc"],
        CHF: ["chf", "swiss franc", "switzerland"],
        NZD: ["nzd", "new zealand dollar", "new zealand", "rbnz"]
    };

    const RESEARCH_WORDS = [
        "news", "headline", "headlines", "calendar", "economic calendar", "event", "events",
        "coming out", "comes out", "coming up", "upcoming", "release", "releases", "data",
        "announcement", "announcements", "update", "updates", "latest", "today", "tonight",
        "this week", "this month", "what happened", "what is happening", "what's happening",
        "what is coming", "what's coming", "anything coming", "anything out", "anything important",
        "red folder", "high impact", "high-impact", "economic news", "market news", "fundamental",
        "fundamentals", "catalyst", "catalysts", "driver", "drivers", "moving", "moved"
    ];

    const QUESTION_WORDS = [
        "what", "whats", "what's", "any", "which", "when", "where", "is there", "are there",
        "tell me", "show me", "give me", "anything", "what do you see", "what should i know",
        "should i know", "do i need to know", "why is", "why did"
    ];

    const TIME_WORDS = {
        today: ["today", "tonight", "now", "right now"],
        week: ["this week", "coming week", "next few days", "next week"],
        month: ["this month", "coming month", "next month"],
        upcoming: ["coming", "upcoming", "next", "scheduled", "ahead"]
    };

    const TOPIC_WORDS = {
        macro: ["inflation", "cpi", "ppi", "gdp", "jobs", "employment", "payroll", "nfp", "unemployment", "pmi", "retail sales", "central bank", "interest rate", "rates", "boe", "fed", "ecb", "boj", "rba", "boc", "rbnz"],
        market: ["market", "forex", "fx", "currency", "pair", "trading", "trade", "price", "volatility", "moving", "moved", "driver", "catalyst"],
        politics: ["election", "government", "budget", "tariff", "trade war", "geopolitical", "politics"]
    };

    function normalize(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/[’']/g, "'")
            .replace(/[^a-z0-9$%./'\s-]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function includesAny(text, list) {
        return list.some(term => text.includes(term));
    }

    function detectCurrency(text) {
        const normalized = normalize(text);
        const pair = normalized.match(/\b(gbp|usd|eur|jpy|aud|cad|chf|nzd)\s*[/.-]\s*(gbp|usd|eur|jpy|aud|cad|chf|nzd)\b/);
        if (pair) return pair[1].toUpperCase();
        for (const [currency, aliases] of Object.entries(CURRENCIES)) {
            if (includesAny(normalized, aliases)) return currency;
        }
        return null;
    }

    function detectPair(text) {
        const normalized = normalize(text);
        const pair = normalized.match(/\b(gbp|usd|eur|jpy|aud|cad|chf|nzd)\s*[/.-]\s*(gbp|usd|eur|jpy|aud|cad|chf|nzd)\b/);
        return pair ? `${pair[1].toUpperCase()}/${pair[2].toUpperCase()}` : null;
    }

    function detectTimeWindow(text) {
        const normalized = normalize(text);
        for (const [window, words] of Object.entries(TIME_WORDS)) {
            if (includesAny(normalized, words)) return window;
        }
        return "current";
    }

    function detectRequestType(text) {
        const normalized = normalize(text);
        const calendar = includesAny(normalized, ["calendar", "coming out", "coming up", "upcoming", "release", "scheduled", "red folder", "high impact", "event"]);
        const news = includesAny(normalized, ["news", "headline", "headlines", "what happened", "latest", "announcement", "update"]);
        if (calendar && news) return "calendar_and_news";
        if (calendar) return "calendar";
        if (news) return "news";
        if (includesAny(normalized, ["moving", "moved", "driver", "catalyst", "why is", "why did"])) return "market_drivers";
        return "research";
    }

    function detectTopic(text) {
        const normalized = normalize(text);
        for (const [topic, words] of Object.entries(TOPIC_WORDS)) {
            if (includesAny(normalized, words)) return topic;
        }
        return "general";
    }

    function isResearchRequest(message, extra = {}) {
        if (extra.research || extra.webSearch || extra.currentInformation) return true;
        const text = normalize(message);
        if (!text) return false;
        const researchScore = RESEARCH_WORDS.filter(word => text.includes(word)).length;
        const questionScore = QUESTION_WORDS.filter(word => text.includes(word)).length;
        const currency = detectCurrency(text);
        const marketContext = includesAny(text, ["forex", "fx", "market", "trading", "trade", "pair", "currency", "sterling", "pound", "dollar", "euro", "yen"]);
        return (researchScore >= 1 && (questionScore >= 1 || currency || marketContext))
            || (currency && questionScore >= 1 && includesAny(text, ["important", "matters", "know", "happening", "coming", "out"]));
    }

    function classify(message) {
        const text = normalize(message);
        const currency = detectCurrency(text);
        const pair = detectPair(text);
        const highImpact = includesAny(text, ["red folder", "high impact", "high-impact"]);
        const requestType = detectRequestType(text);
        const topic = detectTopic(text);
        const timeWindow = detectTimeWindow(text);
        const score = RESEARCH_WORDS.filter(word => text.includes(word)).length
            + QUESTION_WORDS.filter(word => text.includes(word)).length * 0.5
            + (currency ? 1 : 0)
            + (pair ? 1 : 0);
        return {
            intent: isResearchRequest(message) ? "web_research" : "conversation",
            confidence: Math.min(1, Math.max(.5, score / 4)),
            currency,
            pair,
            topic,
            requestType,
            timeWindow,
            highImpact,
            normalized: text
        };
    }

    function buildQuery(message, classification = classify(message)) {
        const parts = [String(message || "").trim()];
        if (classification.currency) parts.push(`Focus currency: ${classification.currency}`);
        if (classification.pair) parts.push(`Focus pair: ${classification.pair}`);
        parts.push(`Research type: ${classification.requestType}. Time window: ${classification.timeWindow}.`);
        if (classification.highImpact) parts.push("Prioritize high-impact economic calendar events and major releases.");
        if (classification.topic === "macro") parts.push("Prioritize official economic releases, central-bank information, and reputable financial news.");
        if (classification.topic === "market") parts.push("Explain the market relevance and likely trading impact without presenting speculation as fact.");
        parts.push("Use current information. Include publication/event dates. Distinguish scheduled events from already-released news. Cite the sources used.");
        return parts.join(" ");
    }

    function extractAnswer(data) {
        if (typeof data === "string") return data;
        if (data?.answer) return data.answer;
        if (data?.message) return data.message;
        if (data?.output_text) return data.output_text;
        const response = data?.response || data;
        if (typeof response === "string") return response;
        if (response?.output_text) return response.output_text;
        if (Array.isArray(response?.output)) {
            const text = response.output
                .flatMap(item => Array.isArray(item?.content) ? item.content : [])
                .filter(item => item?.type === "output_text" && typeof item?.text === "string")
                .map(item => item.text)
                .join("\n");
            if (text) return text;
        }
        if (Array.isArray(data?.choices)) return data.choices.map(choice => choice?.message?.content || "").filter(Boolean).join("\n");
        return JSON.stringify(data || {});
    }

    function extractSources(data) {
        if (Array.isArray(data?.sources)) return data.sources;
        if (Array.isArray(data?.citations)) return data.citations;
        const response = data?.response || data;
        if (Array.isArray(response?.sources)) return response.sources;
        if (Array.isArray(response?.citations)) return response.citations;
        return [];
    }

    async function ask(message, options = {}) {
        const classification = options.classification || classify(message);
        const query = buildQuery(message, classification);
        const api = ASTRA.modules.api;
        if (!api?.status?.().configured) {
            const answer = "I understand that as a research question, but the web research connection isn't configured yet.";
            if (!options.silent) AstraReply(answer);
            return { configured: false, answer, classification };
        }

        const context = {
            research: {
                enabled: true,
                mode: "web_intelligence",
                intent: classification.intent,
                requestType: classification.requestType,
                currency: classification.currency,
                pair: classification.pair,
                topic: classification.topic,
                timeWindow: classification.timeWindow,
                highImpact: classification.highImpact,
                requireCurrentInformation: true,
                requireDates: true,
                requireSources: true,
                instruction: "Use live/current web information when available. Do not invent headlines, release times, source names, or citations. If search is unavailable, say so plainly. Prefer official economic agencies and central banks for releases, and reputable financial news for market context. Clearly label scheduled events, released data, confirmed facts, and analysis."
            },
            tradingSystem: ASTRA.modules.ai?.getTradingSystem?.() || null,
            currentMarketSession: ASTRA.modules.memory?.currentMarketSession?.() || null
        };

        const payload = {
            question: query,
            mode: "research",
            research: context.research,
            context,
            webSearch: { enabled: true, providerPreference: "native", maxUses: Number(options.maxUses || 5) },
            tools: [{ type: "web_search_preview" }]
        };

        try {
            const data = await api.request(options.path || "", { method: "POST", body: JSON.stringify(payload) });
            const answer = extractAnswer(data);
            const sources = extractSources(data);
            const result = {
                configured: true,
                answer,
                sources,
                classification,
                query,
                webGrounded: Boolean(sources.length || data?.webGrounded || data?.research?.webGrounded)
            };
            if (!options.silent) AstraReply(answer);
            return result;
        } catch (error) {
            console.error("ASTRA Research:", error);
            const answer = "I couldn't complete the web research request right now. I don't want to guess at current news.";
            if (!options.silent) AstraReply(answer);
            return { configured: true, error: error.message, answer, classification, webGrounded: false };
        }
    }

    function status() {
        return {
            online: true,
            gatewayConfigured: !!ASTRA.modules.api?.status?.().configured,
            mode: "web_intelligence",
            naturalLanguage: true,
            currentInformationRequired: true,
            sourceGroundingRequired: true
        };
    }

    return {
        name: "ASTRA Research / Web Intelligence",
        version: "1.1",
        normalize,
        detectCurrency,
        detectPair,
        detectTimeWindow,
        detectRequestType,
        detectTopic,
        isResearchRequest,
        classify,
        buildQuery,
        ask,
        status
    };
})();

ASTRA.registerModule("research", ResearchModule);
console.log("ASTRA Research / Web Intelligence v1.1 Loaded");
