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



console.log(
"ASTRA CORE v2.0 ONLINE"
);

