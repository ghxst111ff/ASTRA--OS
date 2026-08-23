/* =========================================
   ASTRA v2.0 CORE ENGINE
========================================= */
 

const ASTRA = {

    name:"ASTRA",

    version:"2.0",

    owner:"Jay",

    modules:{},

    commands:[],


    registerModule(name,module){

        this.modules[name] = module;

        console.log(
            "ASTRA MODULE LOADED:",
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

// Expose the core on window as well. ASTRA is declared with const, which does not
// automatically become window.ASTRA; older UI scripts use the window reference.
window.ASTRA = ASTRA;



console.log(
"ASTRA CORE v2.0 ONLINE"
);
