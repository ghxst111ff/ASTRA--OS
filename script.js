

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
// ASTRA AI GATEWAY
// ===================================

async function askAI(userMessage){

    const context = ASTRA.modules.context.build();

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



