
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


ASTRA.registerModule(
    "modeSwitcher",
    ModeSwitcher
);


console.log(
"ASTRA Mode Switcher v2.0 Loaded"
