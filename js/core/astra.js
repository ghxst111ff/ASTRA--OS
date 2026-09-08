/* =========================================
   VEGA v2.0 CORE ENGINE
   Public identity: VEGA
   Compatibility namespace: ASTRA
========================================= */

const ASTRA = {

    name:"VEGA",

    version:"2.0",

    owner:"Jay",

    modules:{},

    commands:[],


    registerModule(name,module){

        this.modules[name] = module;

        console.log(
            "VEGA MODULE LOADED:",
            name
        );

    },


    registerCommand(trigger,action){

        this.commands.push({

            trigger,

            action

        });

    },


    runCommand(input){

        input =
        input.toLowerCase().trim();


        for(const command of this.commands){

            if(
                input.startsWith(command.trigger)
            ){

                command.action(input);

                return true;

            }

        }


        return false;

    }

};

// VEGA is the public identity. Keep window.ASTRA as a compatibility alias so
// existing modules continue working without a breaking namespace migration.
window.VEGA = ASTRA;
window.ASTRA = ASTRA;


console.log(
"VEGA CORE v2.0 ONLINE"
);
