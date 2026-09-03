/* =========================================
   ASTRA KNOWLEDGE BASE ENGINE v1.0
   Persistent structured lessons, notes, and searchable knowledge.
========================================= */
const KnowledgeBase = (() => {
    const STORAGE_KEY = "ASTRA_KNOWLEDGE_BASE";
    const MAX_ENTRIES = 500;
    let entries = [];

    try { entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch (_) { entries = []; }

    function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES))); }

    function add(title, content, metadata = {}) {
        if (!String(title || "").trim() || !String(content || "").trim()) throw new Error("Knowledge title and content are required.");
        const entry = {
            id: `kb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            title: String(title).trim(),
            content: String(content).trim(),
            tags: Array.isArray(metadata.tags) ? metadata.tags.map(String) : [],
            source: String(metadata.source || "ASTRA"),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        entries.push(entry); save(); return entry;
    }

    function update(id, patch = {}) {
        const entry = entries.find(item => item.id === id);
        if (!entry) return null;
        if (patch.title !== undefined) entry.title = String(patch.title).trim();
        if (patch.content !== undefined) entry.content = String(patch.content).trim();
        if (patch.tags !== undefined) entry.tags = Array.isArray(patch.tags) ? patch.tags.map(String) : [];
        if (patch.source !== undefined) entry.source = String(patch.source);
        entry.updatedAt = new Date().toISOString(); save(); return entry;
    }

    function search(query, limit = 10) {
        const terms = String(query || "").toLowerCase().split(/\s+/).filter(Boolean);
        if (!terms.length) return entries.slice(-limit).reverse();
        return entries.map(entry => {
            const haystack = `${entry.title} ${entry.content} ${(entry.tags || []).join(" ")}`.toLowerCase();
            const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
            return { entry, score };
        }).filter(item => item.score > 0).sort((a, b) => b.score - a.score || b.entry.updatedAt.localeCompare(a.entry.updatedAt)).slice(0, limit).map(item => item.entry);
    }

    function get(id) { return entries.find(item => item.id === id) || null; }
    function remove(id) { const before = entries.length; entries = entries.filter(item => item.id !== id); save(); return entries.length !== before; }
    function all() { return entries.slice(); }
    function status() { return { name: "Knowledge Base Engine", version: "1.0", entries: entries.length, ready: true, persistent: true }; }

    ASTRA.registerCommand("knowledge status", () => AstraReply(JSON.stringify(status(), null, 2)));
    ASTRA.registerCommand("search knowledge", input => {
        const query = String(input || "").replace(/^search knowledge\s*/i, "").trim();
        const results = search(query, 8);
        AstraReply(results.map(item => `<b>${item.title}</b><br>${item.content}`).join("<br><br>") || "No matching knowledge found.");
    });

    return { name: "Knowledge Base Engine", version: "1.0", add, update, search, get, remove, all, status };
})();
ASTRA.registerModule("knowledgeBase", KnowledgeBase);
console.log("ASTRA Knowledge Base Engine v1.0 Loaded");
