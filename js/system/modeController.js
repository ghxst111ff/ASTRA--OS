
/* =========================================
   ASTRA MODE CONTROLLER v2.0
========================================= */

const ModeController = {


    modes:{

        TRADING:[],

        BACKTEST:[],

        BUILD:[],

        VISION:[],

        VOICE:[]

    },


    assign(mode, module){


        mode =
        mode.toUpperCase();


        if(!this.modes[mode]){

            AstraReply(
                "Mode does not exist."
            );

            return;

        }


        this.modes[mode].push(module);


        localStorage.setItem(
            "ASTRA_MODE_MODULES",
            JSON.stringify(this.modes)
        );


        AstraReply(

`MODULE ASSIGNED

Mode:
${mode}

Module:
${module}`

        );

    },


    getActiveModules(mode){


        return this.modes[
            mode.toUpperCase()
        ] || [];

    }


};

ASTRA.registerModule(
    "modeController",
    ModeController
);


console.log(
"ASTRA Mode Controller Loaded"
);