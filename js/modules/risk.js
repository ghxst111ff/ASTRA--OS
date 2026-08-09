
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

ASTRA.registerModule(
    "risk",
    RiskModule
);



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
