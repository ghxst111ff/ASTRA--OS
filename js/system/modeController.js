/* =========================================
   ASTRA MODE CONTROLLER v2.1
   Single source of truth for mode/module assignments.
========================================= */

const ModeController = {
    modes: {
        TRADING: [],
        BACKTEST: [],
        BUILD: [],
        VISION: [],
        VOICE: []
    },

    load(){
        try{
            const saved = JSON.parse(localStorage.getItem("ASTRA_MODE_MODULES") || "null");
            if(saved && typeof saved === "object"){
                Object.keys(this.modes).forEach(mode => {
                    this.modes[mode] = Array.isArray(saved[mode]) ? [...new Set(saved[mode])] : [];
                });
            }
        }catch(error){
            console.warn("ASTRA mode state could not be loaded", error);
        }
        return this.modes;
    },

    persist(){
        localStorage.setItem("ASTRA_MODE_MODULES", JSON.stringify(this.modes));
    },

    assign(mode, module){
        mode = String(mode || "").toUpperCase();
        if(!this.modes[mode]) return false;
        if(!this.modes[mode].includes(module)){
            this.modes[mode].push(module);
            this.persist();
        }
        return true;
    },

    unassign(mode, module){
        mode = String(mode || "").toUpperCase();
        if(!this.modes[mode]) return false;
        const before = this.modes[mode].length;
        this.modes[mode] = this.modes[mode].filter(item => item !== module);
        if(this.modes[mode].length !== before) this.persist();
        return true;
    },

    getActiveModules(mode){
        mode = String(mode || "").toUpperCase();
        return this.modes[mode] ? [...this.modes[mode]] : [];
    }
};

ModeController.load();
ASTRA.registerModule("modeController", ModeController);
console.log("ASTRA Mode Controller v2.1 Loaded — single mode registry");
