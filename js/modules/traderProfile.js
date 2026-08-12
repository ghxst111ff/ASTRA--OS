/* =========================================
   ASTRA TRADER PROFILE / TRADING INTELLIGENCE
   v1.0
========================================= */

const TraderProfileModule = (() => {

    const STORAGE_KEY = "ASTRA_TRADER_PROFILE";

    const defaults = {
        version: "1.0",
        lastScan: null,
        confidence: {},
        system: {
            name: "Jay Fractal Market Delivery System",
            philosophy: [],
            framework: {},
            rules: []
        },
        preferences: {},
        observedMarkets: [],
        observedSetups: [],
        strengths: [],
        weaknesses: [],
        developmentGoals: [],
        evidence: {
            journalTrades: 0,
            backtestingTrades: 0,
            memories: 0
        }
    };

    function load() {
        try {
            return Object.assign({}, defaults,
                JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
            );
        } catch (e) {
            return JSON.parse(JSON.stringify(defaults));
        }
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

    function scanJournal() {
        const journal = ASTRA.modules.journal;
        const data = journal && typeof journal.getData === "function"
            ? journal.getData()
            : { trades: [] };

        const trades = data.trades || [];
        profile.evidence.journalTrades = trades.length;

        const markets = trades.map(t => t.pair).filter(Boolean);
        profile.observedMarkets = unique(
            profile.observedMarkets.concat(markets)
        );

        const setupNotes = trades
            .map(t => t.setup || t.notes)
            .filter(Boolean);
        profile.observedSetups = unique(
            profile.observedSetups.concat(setupNotes)
        );
    }

    function scanBacktesting() {
        const backtesting = ASTRA.modules.BacktestingModule ||
            ASTRA.modules.backtesting;

        if (!backtesting) return;

        let trades = [];
        if (typeof backtesting.getTrades === "function") {
            trades = backtesting.getTrades() || [];
        } else if (Array.isArray(backtesting.trades)) {
            trades = backtesting.trades;
        }

        profile.evidence.backtestingTrades = trades.length;
        profile.observedMarkets = unique(
            profile.observedMarkets.concat(
                trades.map(t => t.pair || t.symbol).filter(Boolean)
            )
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
        scanJournal();
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
            source: "ASTRA Trader Profile"
        };
    }

    function show() {
        const p = profile;
        const system = p.system || {};

        AstraReply(`
🧠 ASTRA TRADER PROFILE

Trading System:
${system.name || "Not established"}

Observed Markets:
${p.observedMarkets.length ? p.observedMarkets.join(", ") : "None recorded yet"}

Journal Trades:
${p.evidence.journalTrades}

Backtesting Trades:
${p.evidence.backtestingTrades}

Memories:
${p.evidence.memories}

Strategy Rules:
${(system.rules || []).map(r => "• " + r).join("\n") || "None recorded"}

Last Scan:
${p.lastScan || "Never"}
        `);
    }

    function status() {
        return {
            name: "Trader Profile",
            version: "1.0",
            lastScan: profile.lastScan,
            evidence: Object.assign({}, profile.evidence),
            markets: profile.observedMarkets.length
        };
    }

    return {
        name: "Trader Profile",
        version: "1.0",
        scan,
        getProfile,
        getContext,
        show,
        status
    };
})();

ASTRA.modules.traderProfile = TraderProfileModule;

ASTRA.commands.push({
    trigger: "scan my trading history",
    action() {
        TraderProfileModule.scan();
        AstraReply("Trader profile scanned and updated.");
    }
});

ASTRA.commands.push({
    trigger: "scan my trading profile",
    action() {
        TraderProfileModule.scan();
        AstraReply("Trader profile scanned and updated.");
    }
});

ASTRA.commands.push({
    trigger: "show trader profile",
    action() {
        TraderProfileModule.scan();
        TraderProfileModule.show();
    }
});

ASTRA.commands.push({
    trigger: "how am I doing",
    action() {
        TraderProfileModule.scan();
        TraderProfileModule.show();
    }
});
