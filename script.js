

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


ASTRA.modules.blueprints =
ModuleBlueprints;


console.log(
"ASTRA Module Blueprint System Loaded"
);



/* =========================================
   ASTRA BUILD MEMORY SYSTEM v1.0
========================================= */

const BuildMemory = {


    history:

    JSON.parse(
        localStorage.getItem(
            "ASTRA_BUILD_MEMORY"
        )
    ) || [],



    saveBuild(build){


        this.history.push({

            feature: build.feature,

            module: build.module,

            files: build.files,

            status: build.status,

            date:
            new Date().toLocaleString()

        });


        localStorage.setItem(
            "ASTRA_BUILD_MEMORY",
            JSON.stringify(this.history)
        );


    },



    getHistory(){

        return this.history;

    },



    find(feature){

        return this.history.filter(
            item =>
            item.feature
            .toLowerCase()
            .includes(
                feature.toLowerCase()
            )
        );

    }


};



ASTRA.modules.buildMemory =
BuildMemory;


console.log(
"ASTRA Build Memory Loaded"
);



/* =========================================
   ASTRA RISK MANAGEMENT MODULE v2.0
========================================= */


const RiskModule = (()=>{


const rules = {

riskPerTrade:"1%",

minimumRR:"1:3",

maxDailyLosses:2,

maxWeeklyLosses:5

};



function getLossCount(){


let journal =
ASTRA.modules.journal.getData();


let lossesToday = 0;


let today =
new Date().toLocaleDateString();



journal.trades.forEach(trade=>{


if(

trade.date.includes(today)

&&

trade.result === "loss"

){

lossesToday++;

}


});


return lossesToday;

}




function checkRisk(){


let losses =
getLossCount();



if(losses >= rules.maxDailyLosses){


AstraReply(

`
⚠️ ASTRA RISK ALERT

Daily loss limit reached.

Losses:
${losses}/${rules.maxDailyLosses}

Trading paused.

Protect capital first.
`

);


return false;

}



AstraReply(

`
🛡️ RISK CHECK

Risk:
${rules.riskPerTrade}

Minimum RR:
${rules.minimumRR}

Losses Today:
${losses}/${rules.maxDailyLosses}

Status:
Trading Allowed ✅
`

);



return true;


}





function showRules(){


AstraReply(

`
ASTRA RISK RULES


Risk Per Trade:
${rules.riskPerTrade}


Minimum Reward:
${rules.minimumRR}


Maximum Daily Losses:
${rules.maxDailyLosses}


Maximum Weekly Losses:
${rules.maxWeeklyLosses}


Rule:
Protect capital before chasing profit.

`

);


}



function getRules(){

return rules;

}



return{

checkRisk,

showRules,

getRules

};


})();



/* REGISTER MODULE */


ASTRA.modules.risk =
RiskModule;



/* COMMANDS */


ASTRA.commands.push({

trigger:"check risk",

action(){

RiskModule.checkRisk();

}

});



ASTRA.commands.push({

trigger:"risk rules",

action(){

RiskModule.showRules();

}

});



console.log(
"Risk Module Loaded"
);


/* =========================================
   ASTRA BUILD PLANNER
========================================= */

const BuildPlanner = {

    plan(update){

        return {

            feature:update.feature,

            module:update.module,

            version:update.version,

            priority:update.priority || "normal",

            estimatedFiles:[

                "Module",

                "Commands",

                "Context Engine",

                "UI"

            ],

            status:"Awaiting Approval"

        };

    }

};

ASTRA.modules.buildPlanner =
BuildPlanner;

console.log(
"ASTRA Build Planner Loaded"
);
/* =========================================
   ASTRA UPDATE ANALYZER v2.0
========================================= */

const UpdateAnalyzer = {


    analyze(command){


        let text =
        command
        .toLowerCase()
        .replace("add","")
        .replace("create","")
        .replace("build","")
        .trim();



        let feature =
        text
        .replace(/\bmode\b/g,"")
        .trim();



        let module =
        feature
        .split(" ")
        .map(word =>
            word.charAt(0).toUpperCase()
            + word.slice(1)
        )
        .join("")
        +
        "Module";



        // Special names

        if(feature.includes("backtest")){

            module =
            "BacktestingModule";

        }


        if(feature.includes("trade replay")){

            module =
            "TradeReplayModule";

        }


        if(feature.includes("screen")){

            module =
            "ScreenIntelligenceModule";

        }


        if(feature.includes("voice")){

            module =
            "VoiceModule";

        }



        return {


            version:"1.0",

            feature:
            feature
            .replace(/\b\w/g,
            c=>c.toUpperCase()),


            module:module,


            changes:
            "Generated by ASTRA Build System"


        };


    }


};


ASTRA.modules.updateAnalyzer =
UpdateAnalyzer;


console.log(
"ASTRA Update Analyzer v2.0 Loaded"
);



function getModuleType(feature){

    feature =
    feature.toLowerCase();


    if(feature.includes("trade")
    || feature.includes("backtest")){

        return "trading";

    }


    if(feature.includes("screen")
    || feature.includes("analysis")){

        return "analysis";

    }


    if(feature.includes("voice")
    || feature.includes("assistant")){

        return "ai";

    }


    return "core";

}


/* =========================================
   ASTRA CODE GENERATOR v2.0
========================================= */

const CodeGenerator = {


    generate(update){


        let result = {


            module:update.module,

            feature:update.feature,

            files:[]


        };



        if(
            update.feature
            .toLowerCase()
            .includes("backtesting")
        ){

            result.files.push({

                name:"BacktestingModule.js",

                code:`

const BacktestingModule = {

trades:[],

addTrade(trade){

this.trades.push(trade);

},

getTrades(){

return this.trades;

}

};


ASTRA.modules.backtesting =
BacktestingModule;

`

            });


        }



        else if(
            update.feature
            .toLowerCase()
            .includes("screen")
        ){

            result.files.push({

                name:"ScreenModule.js",

                code:`

const ScreenModule = {

analyze(){

return "Screen analysis ready";

}

};


ASTRA.modules.screen =
ScreenModule;

`

            });


        }



        else if(
            update.feature
            .toLowerCase()
            .includes("voice")
        ){

            result.files.push({

                name:"VoiceModule.js",

                code:`

const VoiceModule = {

listen(){

return "Voice ready";

}

};


ASTRA.modules.voice =
VoiceModule;

`

            });


        }


if(
    update.feature
    .toLowerCase()
    .includes("trade replay")
){

    result.files.push({

        name:"TradeReplayModule.js",

        code:`

const TradeReplayModule = {


trades:[],


record(trade){

this.trades.push(trade);

},


getTrades(){

return this.trades;

}


};


ASTRA.modules.tradeReplay =
TradeReplayModule;

`

    });

}
      
        else {


const type =
getModuleType(update.feature);


const blueprint =
ASTRA.modules.blueprints[type];



result.files =
blueprint.files.map(file=>({


name:
update.module +
"_" +
file.replace(/\s/g,"") +
".js",



code:
`// ASTRA Generated Module

Module:
${update.module}

Component:
${file}

`

}));


}



        return result;


    }


};


ASTRA.modules.codeGenerator =
CodeGenerator;


console.log(
"ASTRA Code Generator v2.0 Loaded"
);
              

/* =========================================
   ASTRA PSYCHOLOGY MODULE v2.0
========================================= */


const PsychologyModule = (()=>{


let emotions = JSON.parse(

localStorage.getItem("ASTRA_EMOTIONS")

) || [];



function save(){

localStorage.setItem(

"ASTRA_EMOTIONS",

JSON.stringify(emotions)

);

}



/* LOG EMOTION */

function logEmotion(emotion){


emotions.push({

emotion,

date:new Date().toLocaleString()

});


save();


AstraReply(

"Emotion recorded: " + emotion

);


}




/* CHECK MINDSET */

function checkMindset(){


if(emotions.length === 0){


AstraReply(

"No mindset records yet. Stay aware of your emotions."

);


return;

}



let latest =
emotions[emotions.length-1];



AstraReply(

`
🧠 ASTRA MINDSET CHECK


Latest Emotion:
${latest.emotion}


Recorded:
${latest.date}


Remember:
Process over outcome.

`

);


}





/* DETECT EMOTIONAL TRADING */

function analyze(command){


command =
command.toLowerCase();



if(

command.includes("revenge")

){


AstraReply(

"⚠️ Revenge trading detected. Stop and review your rules before entering."

);


return true;

}




if(

command.includes("fomo")

||

command.includes("fear missing")

){


AstraReply(

"⚠️ FOMO detected. Wait for confirmation."

);


return true;

}




if(

command.includes("overtrade")

){


AstraReply(

"⚠️ Overtrading warning. Protect your discipline."

);


return true;

}



return false;


}




function getData(){

return emotions;

}




return{

logEmotion,

checkMindset,

analyze,

getData

};


})();



/* REGISTER MODULE */


ASTRA.modules.psychology =
PsychologyModule;



/* COMMANDS */


ASTRA.commands.push({

trigger:"log emotion",

action(command){


let emotion =
command.replace(
"log emotion",
""
).trim();



PsychologyModule.logEmotion(emotion);


}

});



ASTRA.commands.push({

trigger:"check mindset",

action(){

PsychologyModule.checkMindset();

}

});



console.log(
"Psychology Module Loaded"
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
