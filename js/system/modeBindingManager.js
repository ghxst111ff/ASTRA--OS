
/* =========================================
   ASTRA MODE BINDING MANAGER v1.0
========================================= */

const ModeBindingManager = {


    bindings:{


        TRADING:[

            "Journal",

            "Performance",

            "TradingModule"

        ],


        BACKTEST:[

            "BacktestingModule",

            "BacktestJournal",

            "BacktestPerformance"

        ],


        BUILD:[

            "UpdateModule",

            "CodeGenerator",

            "BuildExecutor"

        ],


        VISION:[

            "ScreenModule"

        ],


        VOICE:[

            "VoiceModule"

        ]

    },



    bind(mode, module){


        mode =
        mode.toUpperCase();


        if(!this.bindings[mode]){

            this.bindings[mode]=[];

        }


        if(
            !this.bindings[mode].includes(module)
        ){

            this.bindings[mode].push(module);

        }


        localStorage.setItem(
            "ASTRA_MODE_BINDINGS",
            JSON.stringify(this.bindings)
        );


        AstraReply(

`MODE BINDING CREATED

Mode:
${mode}

Module:
${module}`

        );


    },



    getBindings(mode){

        return this.bindings[
            mode.toUpperCase()
        ] || [];

    }


};

ASTRA.registerModule(
    "modeBinding",
    ModeBindingManager
);


console.log(
"ASTRA Mode Binding Manager Loaded"
);

