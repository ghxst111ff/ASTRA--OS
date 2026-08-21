/* =========================================
   ASTRA MODE BINDING MANAGER v1.1
   Compatibility layer. ModeController is the single source of truth.
========================================= */

const ModeBindingManager = {
    bind(mode, module){
        const controller = ASTRA?.modules?.modeController;
        if(!controller || typeof controller.assign !== "function"){
            console.warn("ASTRA ModeController is not available.");
            return false;
        }
        return controller.assign(mode, module);
    },

    getBindings(mode){
        const controller = ASTRA?.modules?.modeController;
        if(!controller || typeof controller.getActiveModules !== "function") return [];
        return controller.getActiveModules(mode);
    }
};

ASTRA.registerModule("modeBinding", ModeBindingManager);
console.log("ASTRA Mode Binding Manager v1.1 Loaded — compatibility layer");
