/* =========================================
   ASTRA MODE SWITCHER v2.1
   Reads one deduplicated mode registry.
========================================= */

const ModeSwitcher = {
    current: localStorage.getItem("ASTRA_CURRENT_MODE") || "TRADING",

    switch(mode){
        mode = String(mode || "TRADING").toUpperCase();
        const controller = ASTRA?.modules?.modeController;
        const modules = controller?.getActiveModules?.(mode) || [];

        this.current = mode;
        localStorage.setItem("ASTRA_CURRENT_MODE", mode);
        localStorage.setItem("ASTRA_ACTIVE_MODULES", JSON.stringify(modules));
        document.dispatchEvent(new CustomEvent("astra:mode-changed", {
            detail: { mode, modules: [...modules] }
        }));
        return { mode, modules: [...modules] };
    },

    getMode(){ return this.current; }
};

ASTRA.registerModule("modeSwitcher", ModeSwitcher);
console.log("ASTRA Mode Switcher v2.1 Loaded — unified registry");
