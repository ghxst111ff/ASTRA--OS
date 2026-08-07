
/* =========================================
   ASTRA MODE SWITCHER v2.0
========================================= */

const ModeSwitcher = {


    current:
    localStorage.getItem(
        "ASTRA_CURRENT_MODE"
    ) || "TRADING",



    switch(mode){


        mode =
        mode.toUpperCase();



        const modules =
        ASTRA.modules.modeBinding.getBindings(
            mode
        );



        this.current = mode;



        localStorage.setItem(
            "ASTRA_CURRENT_MODE",
            mode
        );



        localStorage.setItem(
            "ASTRA_ACTIVE_MODULES",
            JSON.stringify(modules)
        );



        AstraReply(

`ASTRA MODE CHANGED

Mode:
${mode}

Active Systems:

${modules.join("<br>")}`

        );


    },



    getMode(){

        return this.current;

    }


};


ASTRA.modules.modeSwitcher =
ModeSwitcher;


console.log(
"ASTRA Mode Switcher v2.0 Loaded"
);

/* =========================================
   ASTRA MODULE BLUEPRINT SYSTEM v1.0
========================================= */

const ModuleBlueprints = {


    core:{

        files:[

            "Core Logic",

            "Commands",

            "Context Connection",

            "Memory Connection"

        ]

    },


    trading:{

        files:[

            "Trading Engine",

            "Journal",

            "Performance"

        ]

    },


    analysis:{

        files:[

            "Analysis Engine",

            "Data Processing",

            "Context Connection"

        ]

    },


    ai:{

        files:[

            "AI Logic",

            "Memory Connection",

            "Conversation"

        ]

    }


};


ASTRA.registerModule(
    "modeSwitcher",
    ModeSwitcher
);


console.log(
"ASTRA Module Blueprint System Loaded"
);

