/* =========================================
   ASTRA NATURAL INTENT ENGINE v4.0
   Conversational routing — exact commands are optional
   Intent is inferred from meaning + context before command matching.
========================================= */
const NaturalIntent = (() => {
    const intents = [
        { name: "observer_start", concepts: [["watch", "monitor", "keep an eye", "stay with me"], ["chart", "screen", "market", "trade"]] },
        { name: "observer_stop", concepts: [["stop", "pause", "end"], ["watching", "monitoring", "observing"]] },
        { name: "observer_observe", concepts: [["see", "notice", "missing", "spot", "looking at"], ["screen", "chart", "market"]] },
        { name: "live_trading_progress", concepts: [["live", "current"], ["trading", "trades", "positions"], ["progress", "doing", "performance", "going"]] },
        { name: "backtesting_progress", concepts: [["backtest", "backtesting", "historical"], ["progress", "doing", "performance", "going"]] },
        { name: "trader_profile", concepts: [["trader", "trading"], ["profile", "journey", "patterns", "improving", "doing"]] },
        { name: "journal_review", concepts: [["journal", "trade history", "trades"], ["review", "look", "show", "history"]] },
        { name: "screen_analysis", concepts: [["chart", "screen", "market"], ["analyze", "analyse", "look", "happening", "seeing"]] },
        { name: "screen_open", concepts: [["share", "show", "open", "start", "turn on"], ["screen", "screen sharing", "display"]] },
        { name: "screen_close", concepts: [["stop", "close", "turn off"], ["screen", "screen sharing", "sharing"]] },
        { name: "voice_start", concepts: [["start", "turn on", "activate", "listen"], ["voice", "listening"]] },
        { name: "voice_stop", concepts: [["stop", "turn off", "mute"], ["voice", "listening"]] },
        { name: "memory", concepts: [["remember", "memory", "know", "save", "forget"], ["this", "me", "that"]] },
        { name: "performance", concepts: [["performance", "win rate", "equity", "stats", "statistics", "returns", "results"], ["how", "show", "what"]] },
        { name: "risk", concepts: [["risk", "position size", "drawdown", "loss"], ["check", "how", "too much", "management"]] },
        { name: "psychology", concepts: [["psychology", "mindset", "emotional", "emotion", "discipline", "patience"], ["how", "am i", "check", "doing"]] },
        { name: "strategy", concepts: [["strategy", "system", "rules", "setup", "plan"], ["fit", "say", "trade", "trading"]] },
        { name: "api_status", concepts: [["api", "gateway", "connection"], ["working", "connected", "status", "check"]] },
        { name: "module_status", concepts: [["modules", "system", "astra", "everything"], ["working", "online", "status", "properly"]] }
    ];

    function normalize(message) {
        return String(message || "")
            .toLowerCase()
            .replace(/[’']/g, "'")
            .replace(/[^a-z0-9\s?%/.-]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function contains(text, term) {
        return text.includes(term);
    }

    function conceptScore(text, concepts) {
        if (!Array.isArray(concepts) || !concepts.length) return 0;
        const matchedGroups = concepts.filter(group => group.some(term => contains(text, term)));
        return matchedGroups.length / concepts.length;
    }

    function resolve(message) {
        const text = normalize(message);
        if (!text) return { intent: "empty", confidence: 1 };

        // Research is semantic/slot based and is always checked before legacy routing.
        // This means "what's coming for the pound?" and "red folder news for GBP"
        // are the same intent even though the wording is different.
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
            const confidence = conceptScore(text, candidate.concepts);
            if (confidence > best.confidence) best = { intent: candidate.name, confidence };
        }

        // Intent routing should help the conversation, not hijack it. Ambiguous
        // language falls through to the AI gateway instead of demanding a command.
        if (best.confidence < .66) return { intent: "conversation", confidence: .5 };
        return best;
    }

    function handle(message) {
        const result = resolve(message);
        const m = ASTRA.modules;

        switch (result.intent) {
            case "web_research": m.research?.ask?.(message, { classification: result.classification }); return true;
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
            case "module_status": AstraReply(JSON.stringify(m.moduleManager?.list?.() || [], null, 2)); return true;
            case "memory": if (m.memory?.show) { m.memory.show(); return true; } break;
        }
        return false;
    }

    return { name: "Natural Intent Engine", version: "4.0", normalize, resolve, handle };
})();

ASTRA.registerModule("naturalIntent", NaturalIntent);
console.log("ASTRA Natural Intent Engine v4.0 Loaded");
