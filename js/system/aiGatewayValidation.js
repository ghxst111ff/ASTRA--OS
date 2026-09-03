/* =========================================
   ASTRA AI GATEWAY VALIDATION v1.0
   Configuration, request, response, and provider validation.
========================================= */
const AIGatewayValidation = (() => {
    function validateConfiguration() {
        const api = ASTRA.modules.api;
        if (!api?.status) return { passed: false, checks: ["API Connection module unavailable."] };
        const status = api.status();
        const checks = [];
        let passed = true;
        if (status.configured && /^https?:\/\//.test(status.url || "")) checks.push("API URL configured ✅");
        else { checks.push("API URL missing or invalid ❌"); passed = false; }
        checks.push(status.hasToken ? "API token configured" : "API token not configured (allowed for public worker endpoints)");
        return { passed, checks, status };
    }

    function validateResponse(data) {
        const answer = ASTRA.modules.ai?.extractAnswer?.(data);
        const passed = typeof answer === "string" && answer.trim().length > 0;
        return { passed, answer: passed ? answer : null, checks: [passed ? "Response contains readable answer ✅" : "Response does not contain a readable answer ❌"] };
    }

    async function probe() {
        const config = validateConfiguration();
        if (!config.passed) return { passed: false, stage: "configuration", ...config };
        const api = ASTRA.modules.api;
        const started = Date.now();
        try {
            const data = await api.request("", { method: "POST", body: JSON.stringify({ question: "Return a short health check for ASTRA.", context: { validation: true } }) });
            const response = validateResponse(data);
            return { passed: response.passed, stage: "live-request", latencyMs: Date.now() - started, configuration: config, response };
        } catch (error) {
            ASTRA.modules.errorRecovery?.record?.(error, { source: "aiGatewayValidation.probe" });
            return { passed: false, stage: "live-request", latencyMs: Date.now() - started, configuration: config, error: error.message || String(error) };
        }
    }

    function status() { return { name: "AI Gateway Validation", version: "1.0", configuration: validateConfiguration(), ready: true }; }

    ASTRA.registerCommand("ai gateway status", () => AstraReply(JSON.stringify(status(), null, 2)));
    ASTRA.registerCommand("validate ai gateway", async () => {
        const result = await probe();
        AstraReply(`AI GATEWAY VALIDATION<br><br>${result.passed ? "PASSED ✅" : "FAILED ❌"}<br>Stage: ${result.stage}<br>${result.error || result.response?.checks?.join("<br>") || result.checks?.join("<br>") || ""}`);
    });

    return { name: "AI Gateway Validation", version: "1.0", validateConfiguration, validateResponse, probe, status };
})();
ASTRA.registerModule("aiValidation", AIGatewayValidation);
console.log("ASTRA AI Gateway Validation v1.0 Loaded");
