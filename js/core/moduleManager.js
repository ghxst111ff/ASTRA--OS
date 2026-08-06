
/* =========================================
   ASTRA v2.0 MODULE MANAGER
========================================= */


const ModuleManager = {


    load(name){

        const module =
        ASTRA.modules[name];


        if(!module){

            console.log(
                "Module not found:",
                name
            );

            return;

        }


        if(module.start){

            module.start();

        }


        console.log(
            "Started module:",
            name
        );

    },


    list(){

        return Object.keys(
            ASTRA.modules
        );

    },


    stop(name){

        const module =
        ASTRA.modules[name];


        if(
            module &&
            module.stop
        ){

            module.stop();

        }


        console.log(
            "Stopped module:",
            name
        );

    }

};



ASTRA.registerModule(
"moduleManager",
ModuleManager
);