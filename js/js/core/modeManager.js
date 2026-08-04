/* =========================================
   ASTRA MODE MANAGER v1.0
========================================= */

const ModeManager = {

    current: "TRADING",

    setMode(mode) {

        this.current = mode.toUpperCase();

        localStorage.setItem(
            "ASTRA_MODE",
            this.current
        );

        AstraReply(
            "ASTRA mode changed to " + this.current
        );

    },

    getMode() {

        return this.current;

    }

};

ASTRA.modules.mode = ModeManager;

console.log(
    "ASTRA Mode Manager Loaded"
);