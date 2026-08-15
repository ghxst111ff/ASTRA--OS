/* =========================================
   ASTRA NATURAL INTENT ENGINE v3.0
   Conversational routing — exact commands are optional
========================================= */
const NaturalIntent = (() => {
    const intents = [
        { name: "observer_start", words: ["watch my chart", "watch the chart", "watch my screen", "keep an eye on my chart", "watch while i trade", "watch this with me", "monitor my chart"] },
        { name: "observer_stop", words: ["stop watching", "stop monitoring", "you can stop watching"] },
        { name: "observer_observe", words: ["what are you seeing", "what do you see", "see anything", "am i missing anything", "what did you notice", "do you notice anything", "what can you see on my screen"] },
        { name: "live_trading_progress", words: ["live trading progress", "how am i doing live", "how are my live trades", "how is my live trading going"] },
        { name: "backtesting_progress", words: ["backtesting progress", "backtest progress", "how is my backtesting going", "how am i doing in backtesting", "how is the backtest going"] },
        { name: "trader_profile", words: ["trader profile", "trading profile", "trading journey", "how am i doing as a trader", "what patterns do you see in my trading"] },
        { name: "journal_review", words: ["review my journal", "look at my journal", "what is in my journal", "look at my trade history", "what have i traded"] },
        { name: "screen_analysis", words: ["look at my chart", "analyze my chart", "analyse my chart", "look at my screen", "what am i looking at", "what is happening on my chart"] },
        { name: "screen_open", words: ["open my screen", "start screen sharing", "share my screen", "turn on screen view", "let me show you my screen"] },
        { name: "screen_close", words: ["close screen view", "stop screen sharing", "stop sharing my screen", "turn off screen view"] },
        { name: "voice_start", words: ["start listening", "start voice", "turn on voice", "listen to me", "activate voice"] },
        { name: "voice_stop", words: ["stop listening", "stop voice", "turn off voice", "mute yourself"] },
        { name: "memory", words: ["what do you remember", "what do you know about me", "remember this", "save this", "forget this", "do you remember"] },
        { name: "performance", words: ["how is my performance", "how am i performing", "show my performance", "what is my win rate", "how is my equity", "what are my stats", "my statistics"] },
        { name: "risk", words: ["how is my risk", "am i taking too much risk", "what is my risk", "check my risk", "risk management", "position size", "drawdown"] },
        { name: "psychology", words: ["how is my psychology", "am i getting emotional", "am i emotional", "how is my mindset", "am i being disciplined", "my discipline", "trading psychology"] },
        { name: "strategy", words: ["what does my strategy say", "does this fit my system", "does this fit my trading system", "what is my trading system", "what are my trading rules", "how do i trade"] },
        { name: "api_status", words: ["is the api working", "is the api connected", "is everything connected", "is the gateway working", "check the api", "check my connection"] },
        { name: "module_status", words: ["are your modules working", "what modules are online", "is everything working", "system status", "how is astra doing", "are you working properly"] }
    ];

    function normalize(message) {
        return String(message || "")
            .toLowerCase()
            .replace(/[’']/g, "'")
            .replace(/[^a-z0-9\s?%/.-]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function score(text, phrase) {
        if (text.includes(phrase)) return phrase.length > 12 ? 1 : .8;
        const words = phrase.split(" ").filter(Boolean);
        const hits = words.filter(word => text.includes(word)).length;
        return hits / Math.max(words.length, 1) * .65;
    }

    function resolve(message) {
        const text = normalize(message);
        if (!text) return { intent: "empty", confidence: 1 };

        // Research is semantic/slot based, not phrase based. This is deliberately
        // evaluated before the legacy intent list so natural market/news questions
        // reach the research system even when the wording is completely new.
        const research = ASTRA.modules.research;
        if (research?.isResearchRequest?.(message)) {
            const classification = research.classify(message);
            return {
                intent: "web_research",
                confidence: Math.max(.72, classification.confidence || .72),
                classification
            };
        }

        let best = { intent: "conversation", confidence: 0 };
        for (const candidate of intents) {
            const confidence = Math.max(...candidate.words.map(phrase => score(text, phrase)));
            if (confidence > best.confidence) best = { intent: candidate.name, confidence };
        }
        if (best.confidence < .62) return { intent: "conversation", confidence: .5 };
        return best;
    }

    function handle(message) {
        const result = resolve(message);
        const m = ASTRA.modules;

        switch (result.intent) {
            case "web_research":
                m.research?.ask?.(message);
                return true;
            case "observer_start": m.proactiveMarketObserver?.start?.(); return true;
            case "observer_stop": m.proactiveMarketObserver?.stop?.(); return true;
            case "observer_observe":
                if (m.screen?.sharing && m.proactiveMarketObserver?.askAboutCurrentScreen) {
                    m.proactiveMarketObserver.askAboutCurrentScreen(message);
                    return true;
                }
                m.proactiveMarketObserver?.observe?.();
                return true;
            case "live_trading_progress": m.traderProfile?.showLive?.(); return true;
            case "backtesting_progress": m.traderProfile?.showBacktesting?.(); return true;
            case "trader_profile": m.traderProfile?.show?.(); return true;
            case "journal_review": m.journal?.show?.(); return true;
            case "screen_analysis": m.screen?.showAnalysis?.(); return true;
            case "screen_open": m.screen?.startCapture?.(); return true;
            case "screen_close": m.screen?.close?.(); return true;
            case "voice_start": m.voice?.start?.(); return true;
            case "voice_stop": m.voice?.stop?.(); return true;
            case "performance": m.performance?.show?.(); return true;
            case "risk": m.risk?.show?.(); return true;
            case "psychology": m.psychology?.show?.(); return true;
            case "strategy": m.trading?.show?.(); return true;
            case "api_status": AstraReply(JSON.stringify(m.api?.status?.() || { configured: false }, null, 2)); return true;
            case "module_status": AstraReply(JSON.stringify(ASTRA.modules.moduleManager?.list?.() || [], null, 2)); return true;
            case "memory": if (m.memory?.show) { m.memory.show(); return true; } break;
        }
        return false;
    }

    return { name: "Natural Intent Engine", version: "3.0", normalize, resolve, handle };
})();

ASTRA.registerModule("naturalIntent", NaturalIntent);
console.log("ASTRA Natural Intent Engine v3.0 Loaded");
