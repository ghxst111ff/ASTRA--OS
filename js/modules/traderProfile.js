/* =========================================
   ASTRA TRADER PROFILE / TRADING INTELLIGENCE
   v1.2 — NATURAL LANGUAGE + LIVE/BACKTEST SEPARATION
========================================= */

const TraderProfileModule = (() => {
    const STORAGE_KEY = "ASTRA_TRADER_PROFILE";
    const defaults = {
        version: "1.2", lastScan: null,
        system: { name: "Jay Fractal Market Delivery System", philosophy: [], framework: {}, rules: [] },
        preferences: {},
        liveTrading: { markets: [], setups: [], strengths: [], weaknesses: [], developmentGoals: [], tradeCount: 0 },
        backtesting: { markets: [], setups: [], strengths: [], weaknesses: [], developmentGoals: [], tradeCount: 0 },
        evidence: { liveJournalTrades: 0, backtestingTrades: 0, memories: 0 }
    };

    function mergeDefaults(saved) {
        const fresh = JSON.parse(JSON.stringify(defaults));
        return Object.assign(fresh, saved || {}, {
            system: Object.assign(fresh.system, saved?.system || {}),
            preferences: Object.assign(fresh.preferences, saved?.preferences || {}),
            liveTrading: Object.assign(fresh.liveTrading, saved?.liveTrading || {}),
            backtesting: Object.assign(fresh.backtesting, saved?.backtesting || {}),
            evidence: Object.assign(fresh.evidence, saved?.evidence || {})
        });
    }

    function load() {
        try { return mergeDefaults(JSON.parse(localStorage.getItem(STORAGE_KEY))); }
        catch (e) { return mergeDefaults({}); }
    }

    let profile = load();
    const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    const unique = values => [...new Set((values || []).filter(Boolean).map(String))];

    function scanTradingStrategy() {
        const trading = ASTRA.modules.trading;
        if (!trading?.strategy) return;
        const strategy = trading.strategy;
        profile.system = {
            name: trading.name || profile.system.name,
            philosophy: unique(strategy.philosophy),
            framework: strategy.framework || {},
            rules: unique(strategy.rules)
        };
    }

    function scanLiveTrading() {
        const journal = ASTRA.modules.journal;
        const trades = journal?.getData?.()?.trades || [];
        profile.evidence.liveJournalTrades = trades.length;
        profile.liveTrading.tradeCount = trades.length;
        profile.liveTrading.markets = unique(trades.map(t => t.pair));
        profile.liveTrading.setups = unique(trades.map(t => t.setup || t.notes));
    }

    function scanBacktesting() {
        const backtesting = ASTRA.modules.BacktestingModule || ASTRA.modules.backtesting;
        let trades = [];
        if (backtesting?.getTrades) trades = backtesting.getTrades() || [];
        else if (Array.isArray(backtesting?.trades)) trades = backtesting.trades;
        profile.evidence.backtestingTrades = trades.length;
        profile.backtesting.tradeCount = trades.length;
        profile.backtesting.markets = unique(trades.map(t => t.pair || t.symbol));
        profile.backtesting.setups = unique(trades.map(t => t.setup || t.notes));
    }

    function scanMemory() {
        const memory = ASTRA.modules.memory;
        if (!memory) return;
        if (memory.getMemories) profile.evidence.memories = memory.getMemories().length;
        if (memory.database?.preferences) profile.preferences = Object.assign({}, profile.preferences, memory.database.preferences);
    }

    function scan() {
        scanTradingStrategy();
        scanLiveTrading();
        scanBacktesting();
        scanMemory();
        profile.lastScan = new Date().toISOString();
        save();
        return getProfile();
    }

    const getProfile = () => JSON.parse(JSON.stringify(profile));

    function getContext() {
        return {
            traderProfile: getProfile(),
            liveTrading: JSON.parse(JSON.stringify(profile.liveTrading)),
            backtesting: JSON.parse(JSON.stringify(profile.backtesting)),
            source: "ASTRA Trader Profile — live and backtesting separated"
        };
    }

    function show() {
        scan();
        const l = profile.liveTrading, b = profile.backtesting, s = profile.system;
        AstraReply(`
🧠 ASTRA TRADER PROFILE

TRADING SYSTEM
${s.name || "Not established"}

🔴 LIVE TRADING
Trades: ${l.tradeCount}
Markets: ${l.markets.length ? l.markets.join(", ") : "None recorded"}
Setups: ${l.setups.length ? l.setups.join(" • ") : "None recorded"}

🟡 BACKTESTING
Trades: ${b.tradeCount}
Markets: ${b.markets.length ? b.markets.join(", ") : "None recorded"}
Setups: ${b.setups.length ? b.setups.join(" • ") : "None recorded"}

These are separate progress tracks.
        `);
    }

    function showLive() {
        scan();
        const l = profile.liveTrading;
        AstraReply(`🔴 LIVE TRADING PROGRESS\n\nTrades: ${l.tradeCount}\nMarkets: ${l.markets.length ? l.markets.join(", ") : "None recorded"}\nSetups: ${l.setups.length ? l.setups.join(" • ") : "None recorded"}`);
    }

    function showBacktesting() {
        scan();
        const b = profile.backtesting;
        AstraReply(`🟡 BACKTESTING PROGRESS\n\nTrades: ${b.tradeCount}\nMarkets: ${b.markets.length ? b.markets.join(", ") : "None recorded"}\nSetups: ${b.setups.length ? b.setups.join(" • ") : "None recorded"}`);
    }

    // Natural-language intent. No exact command is required.
    function handleNaturalLanguage(text) {
        const q = String(text || "").toLowerCase();
        const hasProgress = /\b(progress|doing|performance|results|going|development|improving|improvement)\b/.test(q);
        const hasLive = /\b(live|real|actual)\s+(trading|trades?)\b|\blive trading\b/.test(q);
        const hasBacktest = /\b(backtest|backtesting|back test|back testing|simulated)\b/.test(q);

        if (!hasProgress && !hasLive && !hasBacktest) return false;

        if (hasBacktest && !hasLive) {
            showBacktesting();
            return true;
        }

        if (hasLive && !hasBacktest) {
            showLive();
            return true;
        }

        show();
        return true;
    }

    function status() {
        return {
            name: "Trader Profile", version: "1.2", lastScan: profile.lastScan,
            liveTradingTrades: profile.evidence.liveJournalTrades,
            backtestingTrades: profile.evidence.backtestingTrades,
            memories: profile.evidence.memories, separation: true
        };
    }

    return { name: "Trader Profile", version: "1.2", scan, getProfile, getContext, show, showLive, showBacktesting, handleNaturalLanguage, status };
})();

ASTRA.modules.traderProfile = TraderProfileModule;

ASTRA.commands.push({ trigger: "scan my trading history", action() { TraderProfileModule.scan(); AstraReply("Trader profile scanned. Live and backtesting remain separated."); } });
ASTRA.commands.push({ trigger: "scan my trading profile", action() { TraderProfileModule.scan(); AstraReply("Trader profile scanned. Live and backtesting remain separated."); } });
ASTRA.commands.push({ trigger: "show trader profile", action() { TraderProfileModule.show(); } });
ASTRA.commands.push({ trigger: "show live trading progress", action() { TraderProfileModule.showLive(); } });
ASTRA.commands.push({ trigger: "show backtesting progress", action() { TraderProfileModule.showBacktesting(); } });
ASTRA.commands.push({ trigger: "how am I doing", action() { TraderProfileModule.show(); } });
