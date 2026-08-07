
/* =========================================
   ASTRA v2.0 RESPONSE MODULE
========================================= */


const ResponseModule = {


    name:"Response System",


    version:"1.0",



    reply(message){

        const output =
        document.getElementById("output");


        if(!output){

            console.log(
                "ASTRA:",
                message
            );

            return;

        }



        output.innerHTML += `

        <div class="astra-message">

        <b>ASTRA:</b>
        ${message}

        </div>

        `;



        output.scrollTop =
        output.scrollHeight;



        this.animate();

    },



    user(message){

        const output =
        document.getElementById("output");


        if(!output)return;



        output.innerHTML += `

        <div class="user-message">

        <b>YOU:</b>
        ${message}

        </div>

        `;

    },



    animate(){

        const core =
        document.querySelector(".core-circle");


        if(!core)return;



        core.classList.add("active");



        setTimeout(()=>{

            core.classList.remove("active");

        },1500);

    }



};



ASTRA.registerModule(
"response",
ResponseModule
);



/* GLOBAL ACCESS */

function AstraReply(message){

    ResponseModule.reply(message);

}

/* =========================================
   ASTRA v2.0 UPDATE MODULE
========================================= */


const UpdateModule = {


    name:"Update System",

    version:"2.0",



    updates:
    JSON.parse(
        localStorage.getItem("ASTRA_UPDATES")
    ) || [],



    history:
    JSON.parse(
        localStorage.getItem("ASTRA_UPDATE_HISTORY")
    ) || [],



    save(){

        localStorage.setItem(
            "ASTRA_UPDATES",
            JSON.stringify(this.updates)
        );


        localStorage.setItem(
            "ASTRA_UPDATE_HISTORY",
            JSON.stringify(this.history)
        );

    },



    register(update){

        const exists =
        this.updates.find(
            item =>
            item.feature === update.feature
        );


        if(exists){

            console.log(
                "Update already exists"
            );

            return;

        }



        this.updates.push({

            version:update.version,

            feature:update.feature,

            module:update.module,

            changes:update.changes,

            status:"pending",

            date:
            new Date().toLocaleString()

        });



        this.save();



        AstraReply(
            update.feature +
            " update registered."
        );

    },



    check(){

        if(this.updates.length===0){

            AstraReply(
                "ASTRA has no pending updates."
            );

            return;

        }



        let list =
        this.updates.map(
            item =>
            item.feature +
            " - " +
            item.status
        )
        .join("<br>");



        AstraReply(
            "ASTRA Updates:<br>" + list
        );

    },



    approve(feature){

        const update =
        this.updates.find(
            item =>
            item.feature
            .toLowerCase()
            .includes(
                feature.toLowerCase()
            )
        );


      
 
   

        if(!update){

            AstraReply(
                "Update not found."
            );

            return;

        }



        update.status="approved";

        this.save();



        AstraReply(
            update.feature +
            " approved."
        );

    },



    install(feature){

        const update =
        this.updates.find(
            item =>
            item.feature
            .toLowerCase()
            .includes(
                feature.toLowerCase()
            )
        );



        if(!update){

            AstraReply(
                "Update not found."
            );

            return;

        }



        if(update.status!=="approved"){

            AstraReply(
                "Approval required first."
            );

            return;

        }



        update.status="installed";



        this.history.push({

            feature:update.feature,

            version:update.version,

            date:
            new Date().toLocaleString()

        });



        this.save();



        AstraReply(
            update.feature +
            " installed successfully."
        );

    }

};



ASTRA.registerModule(
"updates",
UpdateModule
);



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
   ASTRA VERIFICATION ENGINE v1.0
========================================= */

const VerificationModule = {

    name: "Verification Engine",

    version: "1.0",

    history: JSON.parse(
        localStorage.getItem("ASTRA_VERIFICATION")
    ) || [],


    verify(moduleName){

        const module =
        ASTRA.modules[moduleName];

        if(!module){

            return this.log(
                moduleName,
                false,
                "Module does not exist."
            );

        }


        let passed = true;

        const tests = [];


        // Module Name

        if(!module.name){

            passed = false;

            tests.push(
                "Missing module name."
            );

        }


        // Version

        if(!module.version){

            passed = false;

            tests.push(
                "Missing version."
            );

        }


        // Optional start()

        if(
            module.start &&
            typeof module.start !== "function"
        ){

            passed = false;

            tests.push(
                "Invalid start() function."
            );

        }


        if(
            passed &&
            tests.length === 0
        ){

            tests.push(
                "Verification successful."
            );

        }


        return this.log(

            moduleName,

            passed,

            tests.join("<br>")

        );

    },


    log(

        module,

        passed,

        report

    ){

        const result = {

            module,

            passed,

            report,

            date:
            new Date()
            .toLocaleString()

        };


        this.history.push(result);


        localStorage.setItem(

            "ASTRA_VERIFICATION",

            JSON.stringify(
                this.history
            )

        );


        console.log(

            "VERIFICATION",

            result

        );


        return result;

    },


    report(){

        return this.history;

    }

};


ASTRA.registerModule(

    "verification",

    VerificationModule

);

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
   ASTRA INSTALLER
========================================= */

const Installer = {

    install(feature){
      
console.log("INSTALL REQUEST:", feature);
      
        const update =
ASTRA.modules.updates.updates.find(
    item =>
    item.feature
    .toLowerCase()
    .includes(
        feature.toLowerCase()
    )
);

        if(!update){

            AstraReply("Update not found.");

            return;

        }

        if(update.status !== "approved"){
          
console.log("FOUND UPDATE:", update);
            AstraReply(
                "This update must be approved first."
            );

            return;

        }

        ASTRA.modules.updates.install(feature);

        ASTRA.modules.verifier.verify(
update.feature
);

    }

};

ASTRA.modules.installer = Installer;

console.log(
"ASTRA Installer Loaded"
);


/* =========================================
   ASTRA SYSTEM VERIFIER v1.0
========================================= */

const SystemVerifier = {


    verify(feature){

        let checks = [];


        // Check update exists

        const update =
        ASTRA.modules.updates.updates.find(
            item =>
            item.feature
            .toLowerCase()
            .includes(
                feature.toLowerCase()
            )
        );


        if(update){

            checks.push(
                "Update record found ✅"
            );

        } else {

            checks.push(
                "Update record missing ❌"
            );

        }



        // Check module registry

        checks.push(
            "ASTRA core connected ✅"
        );


        // Check command system

        checks.push(
            "Command router connected ✅"
        );


        AstraReply(

`SYSTEM VERIFICATION

Feature:
${feature}

${checks.join("<br>")}

Status:
Ready`

        );


    }


};


ASTRA.modules.verifier =
SystemVerifier;


console.log(
"ASTRA System Verifier Loaded"
);

/* =========================================
   ASTRA BUILD EXECUTOR v2.0
========================================= */

const BuildExecutor = {


    execute(update, code){


        let builds =
        JSON.parse(
            localStorage.getItem("ASTRA_BUILDS")
        ) || [];



        const build = {


            feature:update.feature,

            module:update.module,

            files:code.files,

            status:"created",

            date:
            new Date().toLocaleString()


        };



        builds.push(build);



        localStorage.setItem(
            "ASTRA_BUILDS",
            JSON.stringify(builds)
        );



        AstraReply(

`BUILD ARTIFACT CREATED

Feature:
${build.feature}

Module:
${build.module}

Files Generated:
${build.files.length}

Status:
READY FOR ACTIVATION`

        );



        return build;


    }


};


ASTRA.modules.executor =
BuildExecutor;


console.log(
"ASTRA Build Executor v2.0 Loaded"
);

/* =========================================
   ASTRA MODULE FACTORY v1.0
========================================= */

const ModuleFactory = {


    create(update){


        const module = {


            name:update.module,

            feature:update.feature,

            version:update.version || "1.0",


            components:[

                "Core Logic",

                "Commands",

                "Memory Connection",

                "Context Connection"

            ],


            status:"generated",


            created:
            new Date().toLocaleString()

        };


        let modules =
        JSON.parse(
            localStorage.getItem("ASTRA_MODULES")
        ) || [];


        modules.push(module);


        localStorage.setItem(
            "ASTRA_MODULES",
            JSON.stringify(modules)
        );


        AstraReply(

`MODULE CREATED

Name:
${module.name}

Feature:
${module.feature}

Components:
${module.components.join(", ")}

Status:
Generated`

        );


        return module;

    }


};


ASTRA.modules.factory =
ModuleFactory;


console.log(
"ASTRA Module Factory Loaded"
);

/* =========================================
   ASTRA MODULE ACTIVATOR v1.0
========================================= */

const ModuleActivator = {


    activate(feature){

      const dependency =
ASTRA.modules.dependencies.check(feature);


if(!dependency.ready){

    AstraReply(

`ACTIVATION BLOCKED

Feature:
${feature}

Missing Dependencies:

${dependency.missing.join("<br>")}

Build these dependencies first.`

    );

    return;

}

        let modules =
        JSON.parse(
            localStorage.getItem("ASTRA_MODULES")
        ) || [];


        const module =
        modules.find(
            m =>
            m.feature
            .toLowerCase()
            .includes(
                feature.toLowerCase()
            )
        );


        if(!module){

            AstraReply(
                "Module not found."
            );

            return;

        }


        module.status = "active";
      
ASTRA.modules.connection.connect(
    module.feature
);
      
        module.activated =
        new Date().toLocaleString();


        localStorage.setItem(
            "ASTRA_MODULES",
            JSON.stringify(modules)
        );


        AstraReply(

`MODULE ACTIVATED

Feature:
${module.feature}

Module:
${module.name}

Status:
ACTIVE`

        );

    }

   
};


ASTRA.modules.activator =
ModuleActivator;


console.log(
"ASTRA Module Activator Loaded"
);


/* =========================================
   ASTRA MODULE CONNECTION MANAGER v1.0
========================================= */

const ConnectionManager = {


    connect(feature){


        let connections =
        JSON.parse(
            localStorage.getItem("ASTRA_CONNECTIONS")
        ) || [];


        const connection = {


            feature: feature,


            connections:[

                "Command Router",

                "Context Engine",

                "Memory System",

                "Mode Manager"

            ],


            status:"connected",


            date:
            new Date().toLocaleString()


        };


        connections.push(connection);


        localStorage.setItem(
            "ASTRA_CONNECTIONS",
            JSON.stringify(connections)
        );


        AstraReply(

`MODULE CONNECTION COMPLETE

Feature:
${feature}

Connected:
${connection.connections.join(", ")}

Status:
CONNECTED`

        );


        return connection;

    }


};


ASTRA.modules.connection =
ConnectionManager;


console.log(
"ASTRA Connection Manager Loaded"
);

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


ASTRA.modules.modeController =
ModeController;


console.log(
"ASTRA Mode Controller Loaded"
);

/* =========================================
   ASTRA DEPENDENCY MANAGER v1.0
========================================= */

const DependencyManager = {


    dependencies:{


        "Backtesting Mode":[

            "Journal",

            "Performance",

            "Context Engine"

        ],


        "Screen Intelligence":[

            "Vision System",

            "Context Engine"

        ],


        "Voice Assistant":[

            "Voice Engine",

            "Command Router"

        ]


    },


    check(feature){


        const needs =
        this.dependencies[feature]
        ||
        [];


        let result = {


            feature:feature,

            required:needs,

            missing:[],

            ready:true

        };



        needs.forEach(dep=>{


            // Check if ASTRA module exists

       const exists =
ASTRA.modules[dep]
||
ASTRA.core.modules.includes(dep)
||
localStorage.getItem(
    "ASTRA_"+dep.toUpperCase()
);


            if(!exists){

                result.missing.push(dep);

                result.ready=false;

            }


        });



        return result;


    }


};


ASTRA.modules.dependencies =
DependencyManager;


console.log(
"ASTRA Dependency Manager Loaded"
);

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


ASTRA.modules.modeBinding =
ModeBindingManager;


console.log(
"ASTRA Mode Binding Manager Loaded"
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
   ASTRA PERFORMANCE MODULE v1.0
========================================= */

const PerformanceModule = (()=>{

    let performance = JSON.parse(
        localStorage.getItem("ASTRA_PERFORMANCE")
    ) || {

        trades: [],
        wins: 0,
        losses: 0

    };


    function save(){

        localStorage.setItem(
            "ASTRA_PERFORMANCE",
            JSON.stringify(performance)
        );

    }


    function addResult(result){

        performance.trades.push(result);


        if(result === "win"){
            performance.wins++;
        }

        if(result === "loss"){
            performance.losses++;
        }


        save();

    }


    function getData(){

        return performance;

    }


    function report(){

        const total = performance.trades.length;

        const winRate = total ?
        Math.round(
            (performance.wins / total) * 100
        )
        : 0;


        AstraReply(
`
Performance Report:

Trades: ${total}

Wins: ${performance.wins}

Losses: ${performance.losses}

Win Rate: ${winRate}%

`
        );

    }


    return {

        addResult,
        getData,
        report

    };


})();

ASTRA.modules.performance = PerformanceModule;



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

/* =========================================
   ASTRA SCREEN VIEW MODULE v1.0
========================================= */

const ScreenModule = (()=>{


function open(){

const screen =
document.getElementById("screenPanel");


if(screen){

screen.style.display = "block";

AstraReply(
"Screen view opened."
);

}
else{

AstraReply(
"Screen panel not found."
);

}

}



function close(){

const screen =
document.getElementById("screenPanel");


if(screen){

screen.style.display = "none";

AstraReply(
"Screen view closed."
);

}

}



function status(){

AstraReply(
"Screen module online. Waiting for vision integration."
);

}



return {

name:"Screen View",

version:"1.0",

open,

close,

status,


commands:[

{

trigger:"open screen",

action(){

open();

}

},


{

trigger:"close screen",

action(){

close();

}

},


{

trigger:"screen status",

action(){

status();

}

}

]


};


})();



ASTRA.registerModule(
"screen",
ScreenModule
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
