/* =========================================
   ASTRA CORE REGISTRY v1.0

   Canonical registry for core subsystem IDs.
   This preserves the core registry responsibility from the
   legacy monolithic script without duplicating module logic.
========================================= */

const CoreRegistry = {

    modules: [
        "journal",
        "performance",
        "context",
        "memory",
        "command",
        "mode"
    ],

    displayNames: {
        journal: "Journal",
        performance: "Performance",
        context: "Context Engine",
        memory: "Memory System",
        command: "Command Router",
        mode: "Mode Manager"
    },

    has(name) {
        return this.modules.includes(String(name).toLowerCase());
    },

    list() {
        return [...this.modules];
    },

    getDisplayName(name) {
        return this.displayNames[String(name).toLowerCase()] || name;
    }

};

ASTRA.core = CoreRegistry;

console.log("ASTRA Core Registry Loaded");
