/* =========================================
   ASTRA PROACTIVE MARKET OBSERVER v1.0
   Conversational chart co-pilot
========================================= */

const ProactiveMarketObserver = (() => {
    let watching = false;
    let timer = null;
    let lastObservation = null;
    let lastSpoken = "";

    const CONFIG = {
        intervalMs: 5000,
        cooldownMs: 15000
    };

    function strategy() {
        return ASTRA.modules.trading?.strategy || {};
    }

    function getScreenAnalysis() {
        const screen = ASTRA.modules.screen;
        if (!screen) return null;
        if (typeof screen.getAnalysis === "function") return screen.getAnalysis();
        return null;
    }

    function buildObservation(analysis) {
        if (!analysis || analysis.ready === false) return null;

        const framework = strategy().framework || {};
        const rules = strategy().rules || [];
        const observations = [];

        if (analysis.liquidity || analysis.liquidityAreas) {
            observations.push({
                type: "liquidity",
                message: "I’m seeing a liquidity-related area on the chart. Check that it is included in your current liquidity model."
            });
        }

        if (analysis.supply || analysis.supplyZones) {
            observations.push({
                type: "supply",
                message: "I’m seeing a possible supply area. I’d want to verify the structure and context before treating it as a valid zone."
            });
        }

        if (analysis.demand || analysis.demandZones) {
            observations.push({
                type: "demand",
                message: "I’m seeing a possible demand area. I’d want to verify the higher-timeframe context before treating it as a valid zone."
            });
        }

        if (analysis.structure || analysis.marketStructure || analysis.structureShift) {
            observations.push({
                type: "structure",
                message: "I’m seeing a potential structure change. Compare it with your higher-timeframe context before using it for execution."
            });
        }

        return {
            observations,
            framework,
            rules,
            timestamp: Date.now()
        };
    }

    function shouldSpeak(observation) {
        if (!observation || !observation.observations.length) return false;
        const signature = observation.observations.map(o => o.type).join("|");
        if (signature === lastSpoken && Date.now() - (lastObservation?.timestamp || 0) < CONFIG.cooldownMs) {
            return false;
        }
        return true;
    }

    function observe() {
        const analysis = getScreenAnalysis();
        const observation = buildObservation(analysis);
        if (!observation) return null;

        lastObservation = observation;

        if (shouldSpeak(observation)) {
            lastSpoken = observation.observations.map(o => o.type).join("|");
            const message = observation.observations[0].message;
            if (typeof AstraReply === "function") AstraReply(message);
        }

        return observation;
    }

    function start() {
        if (watching) return status();
        watching = true;
        observe();
        timer = setInterval(observe, CONFIG.intervalMs);
        return status();
    }

    function stop() {
        watching = false;
        if (timer) clearInterval(timer);
        timer = null;
        return status();
    }

    function status() {
        return {
            watching,
            intervalMs: CONFIG.intervalMs,
            lastObservation
        };
    }

    return {
        name: "Proactive Market Observer",
        version: "1.0",
        start,
        stop,
        observe,
        status
    };
})();

ASTRA.modules.proactiveMarketObserver = ProactiveMarketObserver;

console.log("ASTRA Proactive Market Observer Loaded");
