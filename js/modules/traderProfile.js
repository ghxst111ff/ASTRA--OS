/* =========================================
   ASTRA TRADER PROFILE / TRADING INTELLIGENCE
   v1.1 — LIVE vs BACKTESTING SEPARATION
========================================= */

const TraderProfileModule = (() => {

    const STORAGE_KEY = "ASTRA_TRADER_PROFILE";

    const defaults = {
        version: "1.1",
        lastScan: null,
        system: {
            name: "Jay Fractal Market Delivery System",
            philosophy: [],
            framework: {},
            rules: []
        },
        preferences: {},
        liveTrading: {
            markets: [],
            setups: [],
            strengths: [],
            weaknesses: [],
            developmentGoals: [],
            tradeCount: 0
        },
        backtesting: {
            markets: [],
            setups: [],
            strengths: [],
            weaknesses: [],
            developmentGoals: [],
            tradeCount: 0
        },
        evidence: {
            liveJournalTrades: 0,
            backtestingTrades: 0,
            memories: 0
        }
    };

    function load() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return mergeDefaults(saved || {});
        } catch (e) {
            return JSON.parse(JSON.stringify(defaults));
        }
    }

    function mergeDefaults(saved) {
        const fresh = JSON.parse(JSON.stringify(defaults));
        return Object.assign(fresh, saved, {
            system: Object.assign(fresh.system, saved.system || {}),
            preferences: Object.assign(fresh.preferences, saved.preferences || {}),
            liveTrading: Object.assign(fresh.liveTrading, saved.liveTrading || {}),
            backtesting: Object.assign(fresh.backtesting, saved.backtesting || {}),
            evidence: Object.assign(fresh.evidence, saved.evidence || {})
        });
    }

    let profile = load();

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }

    function unique(values) {
        return [...new Set((values || []).filter(Boolean).map(String))];
    }

    function scanTradingStrategy() {
        const trading = ASTRA.modules.trading;
        if (!trading || !trading.strategy) return;

        const strategy = trading.strategy;
        profile.system = {
            name: trading.name || profile.system.name,
            philosophy: unique(strategy.philosophy),
            framework: strategy.framework || {},
            rules: unique(strategy.rules)
        };
    }

    // LIVE TRADING ONLY: journal data belongs to live trading progress.
    function scanLiveTrading() {
        const journal = ASTRA.modules.journal;
        const data = journal && typeof journal.getData === "function"
            ? journal.getData()
            : { trades: [] };

        const trades = data.trades || [];
        profile.evidence.liveJournalTrades = trades.length;
        profile.liveTrading.tradeCount = trades.length;

        profile.liveTrading.markets = unique(
            trades.map(t => t.pair).filter(Boolean)
        );

        profile.liveTrading.setups = unique(
            trades.map(t => t.setup || t.notes).filter(Boolean)
        );
    }

    // BACKTESTING ONLY: never merge these trades into live trading data.
    function scanBacktesting() {
        const backtesting = ASTRA.modules.BacktestingModule ||
            ASTRA.modules.backtesting;

        if (!backtesting) {
            profile.evidence.backtestingTrades = 0;
            profile.backtesting.tradeCount = 0;
            return;
        }

        let trades = [];
        if (typeof backtesting.getTrades === "function") {
            trades = backtesting.getTrades() || [];
        } else if (Array.isArray(backtesting.trades)) {
            trades = backtesting.trades;
        }

        profile.evidence.backtestingTrades = trades.length;
        profile.backtesting.tradeCount = trades.length;

        profile.backtesting.markets = unique(
            trades.map(t => t.pair || t.symbol).filter(Boolean)
        );

        profile.backtesting.setups = unique(
            trades.map(t => t.setup || t.notes).filter(Boolean)
        );
    }

    function scanMemory() {
        const memory = ASTRA.modules.memory;
        if (!memory) return;

        if (typeof memory.getMemories === "function") {
            profile.evidence.memories = memory.getMemories().length;
        }

        if (memory.database && memory.database.preferences) {
            profile.preferences = Object.assign(
                {},
                profile.preferences,
                memory.database.preferences
            );
        }
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

    function getProfile() {
        return JSON.parse(JSON.stringify(profile));
    }

    function getContext() {
        return {
            traderProfile: getProfile(),
            liveTrading: JSON.parse(JSON.stringify(profile.liveTrading)),
            backtesting: JSON.parse(JSON.stringify(profile.backtesting)),
            source: "ASTRA Trader Profile — live and backtesting separated"
        };
    }

    function show() {
        const p = profile;
        const system = p.system || {};
        const live = p.liveTrading || {};
        const backtest = p.backtesting || {};

        AstraReply(`
🧠 ASTRA TRADER PROFILE

TRADING SYSTEM
${system.name || "Not established"}

━━━━━━━━━━━━━━━━━━━━
🔴 LIVE TRADING PROGRESS
━━━━━━━━━━━━━━━━━━━━

Live Trades: ${live.tradeCount || 0}
Live Markets: ${live.markets.length ? live.markets.join(", ") : "None recorded"}

Live Setups:
${live.setups.length ? live.setups.map(s => "• " + s).join("\n") : "None recorded"}

━━━━━━━━━━━━━━━━━━━━
🟡 BACKTESTING PROGRESS
━━━━━━━━━━━━━━━━━━━━

Backtest Trades: ${backtest.tradeCount || 0}
Backtest Markets: ${backtest.markets.length ? backtest.markets.join(", ") : "None recorded"}

Backtest Setups:
${backtest.setups.length ? backtest.setups.map(s => "• " + s).join("\n") : "None recorded"}

━━━━━━━━━━━━━━━━━━━━
🧠 STRATEGY
━━━━━━━━━━━━━━━━━━━━

Rules:
${(system.rules || []).map(r => "• " + r).join("\n") || "None recorded"}

Last Scan:
${p.lastScan || "Never"}
        `);
    }

    function showLive() {
        scan();
        const live = profile.liveTrading;
        AstraReply(`
🔴 LIVE TRADING PROGRESS

Trades: ${live.tradeCount}
Markets: ${live.markets.length ? live.markets.join(", ") : "None recorded"}

Setups:
${live.setups.length ? live.setups.map(s => "• " + s).join("\n") : "None recorded"}
        `);
    }

    function showBacktesting() {
        scan();
        const backtest = profile.backtesting;
        AstraReply(`
🟡 BACKTESTING PROGRESS

Trades: ${backtest.tradeCount}
Markets: ${backtest.markets.length ? backtest.markets.join(", ") : "None recorded"}

Setups:
${backtest.setups.length ? backtest.setups.map(s => "• " + s).join("\n") : "None recorded"}
        `);
    }

    function status() {
        return {
            name: "Trader Profile",
            version: "1.1",
            lastScan: profile.lastScan,
            liveTradingTrades: profile.evidence.liveJournalTrades,
            backtestingTrades: profile.evidence.backtestingTrades,
            memories: profile.evidence.memories,
            separation: true
        };
    }

    return {
        name: "Trader Profile",
        version: "1.1",
        scan,
        getProfile,
        getContext,
        show,
        showLive,
        showBacktesting,
        status
    };
})();

ASTRA.modules.traderProfile = TraderProfileModule;

ASTRA.commands.push({
    trigger: "scan my trading history",
    action() {
        TraderProfileModule.scan();
        AstraReply("Trader profile scanned. Live trading and backtesting remain separated.");
    }
});

ASTRA.commands.push({
    trigger: "scan my trading profile",
    action() {
        TraderProfileModule.scan();
        AstraReply("Trader profile scanned. Live trading and backtesting remain separated.");
    }
});

ASTRA.commands.push({
    trigger: "show trader profile",
    action() {
        TraderProfileModule.show();
    }
});

ASTRA.commands.push({
    trigger: "show live trading progress",
    action() {
        TraderProfileModule.showLive();
    }
});

ASTRA.commands.push({
    trigger: "show backtesting progress",
    action() {
        TraderProfileModule.showBacktesting();
    }
});

ASTRA.commands.push({
    trigger: "how am I doing",
    action() {
        TraderProfileModule.show();
    }
});
