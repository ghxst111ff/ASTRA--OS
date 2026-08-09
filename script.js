

/* =========================================
   TRADING COMMANDS
========================================= */


ASTRA.commands.push({

trigger:"show strategy",

action(){

TradingModule.show();

}

});

ASTRA.commands.push({

trigger:"show strategy",

action(){

TradingModule.showStrategy();

}

});

ASTRA.commands.push({

trigger:"my trading system",

action(){

TradingModule.show();

}

});

/* =========================================
   ASTRA COMMAND ROUTER MODULE v2.0
========================================= */


const CommandModule = (()=>{


function registerCommand(trigger, action){

    ASTRA.commands.push({

        trigger,

        action

    });

}



/* MAIN COMMAND PROCESSOR */

function process(command){


command =
command.toLowerCase().trim();



/* SYSTEM COMMANDS */


if(command === "astra version"){

    AstraReply(
        "ASTRA version " + ASTRA.version
    );

    return;

}



if(command === "astra modules"){

    AstraReply(

        "Loaded modules: " +

        Object.keys(ASTRA.modules)
        .join(", ")

    );

    return;

}



/* MODULE COMMANDS */
/* PSYCHOLOGY AUTO DETECTION */

if(ASTRA.modules.psychology){

    if(
        ASTRA.modules.psychology.analyze(command)
    ){

        return;

    }

}

for(
let cmd of ASTRA.commands
){

    if(
        command.includes(cmd.trigger)
    ){

        cmd.action(command);

        return;

    }

}



/* IF NOTHING MATCHES */

AstraReply(
"I don't recognize that command yet."
);


}



return{

    registerCommand,

    process

};


})();


    // =========================
// ASTRA INTENT DETECTOR
// =========================

function detectIntent(message){

    const text = message.toLowerCase().trim();

    const panels = [
        "journal",
        "trading",
        "memory",
        "screen",
        "performance"
    ];


    for(const panel of panels){

        if(
            text.includes("open") &&
            text.includes(panel)
        ){
            return {
                action:"open",
                panel:panel
            };
        }


        if(
            text.includes("close") &&
            text.includes(panel)
        ){
            return {
                action:"close",
                panel:panel
            };
        }

    }


    return {
        action:"ai",
        panel:null
    };

}






/* =========================================
   ASTRA CORE REGISTRY
========================================= */

ASTRA.core = {


    modules:[

        "Journal",

        "Performance",

        "Context Engine",

        "Memory System",

        "Command Router",

        "Mode Manager"

    ]

};


console.log(
"ASTRA Core Registry Loaded"
);
















// ===================================
// ASTRA CONTEXT ENGINE
// ===================================

function buildContext(){

    return {

        memory:
            JSON.parse(
                localStorage.getItem("ASTRA_MEMORY")
            ) || {},

        journal:
            JSON.parse(
                localStorage.getItem("ASTRA_JOURNAL")
            ) || {},

        performance:
            ASTRA.modules.performance
            ? ASTRA.modules.performance.getData()
            : {},

        screen:
            JSON.parse(
                localStorage.getItem("ASTRA_SCREEN")
            ) || {},

        trading:
            JSON.parse(
                localStorage.getItem("ASTRA_TRADING")
            ) || {}

    };

}


/* =========================================
   ASTRA UI COMMAND BRIDGE v1.0
========================================= */

window.addEventListener("DOMContentLoaded",()=>{


const sendBtn =
document.getElementById("sendBtn");


const input =
document.getElementById("commandInput");


if(!sendBtn || !input){

console.log(
"ASTRA UI bridge missing elements"
);

return;

}



sendBtn.addEventListener("click",()=>{


const command =
input.value.trim();


if(
    ASTRA &&
    ASTRA.modules &&
    ASTRA.modules.command
){

    ASTRA.modules.command.process(command);

} else {
  
    AstraReply("Command system not loaded.");

}



input.value="";


});

 

input.addEventListener("keydown",(e)=>{


if(e.key==="Enter"){

sendBtn.click();

}


});


console.log(
"ASTRA UI Command Bridge Loaded"
);


});

// =========================================
// ASTRA PANEL BUTTON CONNECTIONS
// =========================================

document.getElementById("journal")
?.addEventListener("click",()=>{


});


document.getElementById("trading")
?.addEventListener("click",()=>{

});


document.getElementById("memory")
?.addEventListener("click",()=>{


});


document.getElementById("performance")
?.addEventListener("click",()=>{

});


document.getElementById("screen")
?.addEventListener("click",()=>{


});



// ASTRA MODULE BUTTON CONTROL

document.querySelectorAll(".module-btn").forEach(button => {

    button.addEventListener("click", () => {

        const panelName = button.innerText
            .toLowerCase()
            .trim();

        const panel = document.getElementById(panelName);

        if (!panel) return;

        panel.classList.toggle("active");

    });

});





// ===================================
// ASTRA LEARNING ENGINE
// ===================================

ASTRA.learn = function(type, data){

    const key = "ASTRA_LEARNING";

    let database = [];

    try{

        database = JSON.parse(
            localStorage.getItem(key)
        ) || [];

    }catch{

        database = [];

    }


    if(!Array.isArray(database)){
        database = [];
    }


    database.push({

        time: new Date().toISOString(),

        data: data

    });


    localStorage.setItem(
        key,
        JSON.stringify(database)
    );

};




// ===================================
// ASTRA AI GATEWAY
// ===================================

async function askAI(userMessage){

    const context = buildContext();

    const payload = {

        question: userMessage,

        context: context

    };

    console.log("AI PAYLOAD", payload);

    // API will be connected here later

    AstraReply(
        "AI Gateway Ready."
    );

}









/* =========================================
   ASTRA BACKUP SYSTEM v2.0
========================================= */

const BackupModule = {

    create(){

        const backup = {

            version:"ASTRA_BACKUP_V2.0",

            date:
            new Date().toISOString(),

            mode:
            localStorage.getItem("ASTRA_MODE") || "TRADING",

            databases:{

                memory:
                JSON.parse(
                    localStorage.getItem("ASTRA_MEMORY")
                ) || {},


                journal:
                JSON.parse(
                    localStorage.getItem("ASTRA_JOURNAL")
                ) || {},


                performance:
                JSON.parse(
                    localStorage.getItem("ASTRA_PERFORMANCE")
                ) || {},


                updates:
                JSON.parse(
                    localStorage.getItem("ASTRA_UPDATES")
                ) || {}

            }

        };


        localStorage.setItem(
            "ASTRA_BACKUP_V2.0",
            JSON.stringify(backup)
        );


        AstraReply(
            "ASTRA backup V2.0 created successfully."
        );


    },


    restore(){

        const backup =
        JSON.parse(
            localStorage.getItem("ASTRA_BACKUP_V2.0")
        );


        if(!backup){

            AstraReply(
                "No ASTRA backup found."
            );

            return;

        }


        AstraReply(
            "Backup found from " + backup.date
        );

    }


};


ASTRA.modules.backup =
BackupModule;


console.log(
"ASTRA Backup System Loaded"
);
