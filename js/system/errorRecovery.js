/* =========================================
   ASTRA ERROR RECOVERY SYSTEM v1.0
   Detect, record, recover, and report expected runtime failures.
========================================= */
const ErrorRecovery = (() => {
    const STORAGE_KEY = "ASTRA_ERROR_RECOVERY";
    const MAX_HISTORY = 100;
    let history = [];

    try { history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch (_) { history = []; }

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-MAX_HISTORY)));
    }

    function record(error, context = {}) {
        const entry = {
            id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            message: String(error?.message || error || "Unknown error"),
            name: String(error?.name || "Error"),
            context: context && typeof context === "object" ? context : {},
            recovered: false,
            recovery: null,
            date: new Date().toISOString()
        };
        history.push(entry);
        save();
        console.error("ASTRA ERROR", entry);
        return entry;
    }

    function markRecovered(id, strategy, details = "") {
        const entry = history.find(item => item.id === id);
        if (!entry) return false;
        entry.recovered = true;
        entry.recovery = { strategy: String(strategy), details: String(details), date: new Date().toISOString() };
        save();
        return true;
    }

    async function recover(error, options = {}) {
        const entry = record(error, options.context || {});
        const strategies = [];

        if (typeof options.retry === "function") {
            try {
                const result = await options.retry();
                markRecovered(entry.id, "retry", "Retry completed successfully.");
                return { recovered: true, strategy: "retry", result, entry };
            } catch (retryError) {
                strategies.push(`retry failed: ${retryError.message || retryError}`);
            }
        }

        if (options.restoreBackup && ASTRA.modules.backup?.restore) {
            try {
                const result = ASTRA.modules.backup.restore();
                markRecovered(entry.id, "backup", "Backup restoration completed.");
                return { recovered: true, strategy: "backup", result, entry };
            } catch (backupError) {
                strategies.push(`backup failed: ${backupError.message || backupError}`);
            }
        }

        entry.recovery = { strategy: "none", details: strategies.join("; ") || "No recovery strategy succeeded.", date: new Date().toISOString() };
        save();
        return { recovered: false, strategy: null, error: entry, attempts: strategies };
    }

    function recent(limit = 20) { return history.slice(-Math.max(1, Number(limit) || 20)); }
    function clear() { history = []; save(); }
    function status() {
        return { name: "Error Recovery System", version: "1.0", recordedErrors: history.length, recoveredErrors: history.filter(item => item.recovered).length, ready: true };
    }

    ASTRA.registerCommand("error recovery status", () => AstraReply(JSON.stringify(status(), null, 2)));
    ASTRA.registerCommand("show recent errors", () => AstraReply(recent(10).map(item => `${item.date} — ${item.message} — ${item.recovered ? "RECOVERED" : "UNRECOVERED"}`).join("<br>") || "No recorded errors."));

    window.addEventListener("error", event => record(event.error || event.message, { source: "window.error" }));
    window.addEventListener("unhandledrejection", event => record(event.reason, { source: "unhandledrejection" }));

    return { name: "Error Recovery System", version: "1.0", record, recover, markRecovered, recent, clear, status };
})();
ASTRA.registerModule("errorRecovery", ErrorRecovery);
console.log("ASTRA Error Recovery System v1.0 Loaded");
