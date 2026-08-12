/* =========================================
   ASTRA NATURAL INTENT ENGINE v1.0
   Universal conversational routing
========================================= */

const NaturalIntent = {
    normalize(message) {
        return String(message || "").toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9\s?]/g, " ").replace(/\s+/g, " ").trim();
    },
    has(text, words) { return words.some(word => text.includes(word)); },
    resolve(message) {
        const text = this.normalize(message);
        if (!text) return { intent: "empty", confidence: 1 };
        const live = this.has(text, ["live trading", "live trade", "real trading", "real trades"]);
        const backtest = this.has(text, ["backtesting", "backtest", "paper testing", "historical testing"]);
        if (live && this.has(text, ["progress", "doing", "performance", "results", "how am i", "how are my", "status"])) return { intent: "live_trading_progress", confidence: .98 };
        if (backtest && this.has(text, ["progress", "doing", "performance", "results", "how am i", "how are my", "status"])) return { intent: "backtesting_progress", confidence: .98 };
        if (this.has(text, ["trader profile", "trading profile", "trading journey", "how am i doing as a trader"])) return { intent: "trader_profile", confidence: .95 };
        if (this.has(text, ["journal", "my trades", "trade history"]) && this.has(text, ["show", "what", "look", "review", "check", "how", "progress", "history"])) return { intent: "journal_review", confidence: .94 };
        if (backtest && this.has(text, ["trade", "trades", "result", "history", "progress", "show", "review"])) return { intent: "backtesting_progress", confidence: .96 };
        if (this.has(text, ["screen", "chart", "what am i looking at", "look at my screen"]) && this.has(text, ["see", "look", "show", "analyze", "analyse", "view", "watch", "what"])) return { intent: "screen_analysis", confidence: .94 };
        if (this.has(text, ["screen", "screen sharing", "screen view"]) && this.has(text, ["open", "start", "turn on", "view", "share"])) return { intent: "screen_open", confidence: .96 };
        if (this.has(text, ["screen", "screen sharing", "screen view"]) && this.has(text, ["close", "stop", "turn off"])) return { intent: "screen_close", confidence: .96 };
        if (this.has(text, ["voice", "microphone", "listening"]) && this.has(text, ["start", "listen", "turn on", "activate"])) return { intent: "voice_start", confidence: .96 };
        if (this.has(text, ["voice", "microphone", "listening"]) && this.has(text, ["stop", "turn off", "mute"])) return { intent: "voice_stop", confidence: .96 };
        if (this.has(text, ["memory", "remember", "forget", "what do you know about me"])) return { intent: "memory", confidence: .92 };
        if (this.has(text, ["performance", "win rate", "equity", "stats", "statistics"])) return { intent: "performance", confidence: .92 };
        if (this.has(text, ["risk", "risk management", "position size", "drawdown"])) return { intent: "risk", confidence: .90 };
        if (this.has(text, ["psychology", "mindset", "discipline", "emotion", "emotional"])) return { intent: "psychology", confidence: .90 };
        if (this.has(text, ["strategy", "trading system", "my system", "how do i trade", "how i trade"])) return { intent: "strategy", confidence: .94 };
        if (this.has(text, ["api", "connection", "connected", "gateway"]) && this.has(text, ["status", "working", "configured", "connection", "connected"])) return { intent: "api_status", confidence: .95 };
        if (this.has(text, ["module", "modules"]) && this.has(text, ["working", "online", "status", "available"])) return { intent: "module_status", confidence: .90 };
        return { intent: "conversation", confidence: .50 };
    },
    handle(message) {
        const result = this.resolve(message), modules = ASTRA.modules;
        switch (result.intent) {
            case "live_trading_progress": modules.traderProfile?.showLive?.(); return true;
            case "backtesting_progress": modules.traderProfile?.showBacktesting?.(); return true;
            case "trader_profile": modules.traderProfile?.show?.(); return true;
            case "journal_review": modules.journal?.show?.(); return true;
            case "screen_analysis": modules.screen?.analyze?.(); return true;
            case "screen_open": modules.screen?.open?.(); return true;
            case "screen_close": modules.screen?.close?.(); return true;
            case "voice_start": modules.voice?.start?.(); return true;
            case "voice_stop": modules.voice?.stop?.(); return true;
            case "performance": modules.performance?.show?.(); return true;
            case "risk": modules.risk?.show?.(); return true;
            case "psychology": modules.psychology?.show?.(); return true;
            case "strategy": modules.trading?.show?.(); return true;
            case "api_status": AstraReply(JSON.stringify(modules.api?.status?.() || {configured:false}, null, 2)); return true;
            case "module_status": AstraReply(JSON.stringify(ASTRA.modules.moduleManager?.status?.() || ASTRA.modules.moduleManager?.list?.() || [], null, 2)); return true;
            case "memory": if (modules.memory?.show) { modules.memory.show(); return true; } break;
        }
        return false;
    }
};
ASTRA.registerModule("naturalIntent", NaturalIntent);
console.log("ASTRA Natural Intent Engine Loaded");
