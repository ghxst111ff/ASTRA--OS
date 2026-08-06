

/* =========================================
   ASTRA JOURNAL MODULE v2.0
========================================= */


const JournalModule = (()=>{


let journal = JSON.parse(

localStorage.getItem("ASTRA_JOURNAL")

) || {


trades:[]


};



function save(){

localStorage.setItem(

"ASTRA_JOURNAL",

  JSON.stringify(journal)

);

}




let report =
"Trading Journal:<br><br>";



journal.trades.forEach((trade,index)=>{


report +=

`
Trade ${index+1}<br>
Pair: ${trade.pair || "N/A"}<br>
Direction: ${trade.direction || "N/A"}<br>
Result: ${trade.result || "N/A"}<br>
Notes: ${trade.notes || "None"}<br><br>
`;

});

function addTrade(trade){

    journal.trades.push(trade);
  
if (ASTRA.modules.performance) {
    ASTRA.modules.performance.addResult(trade.result);
}
    save();

    ASTRA.learn(
        "journal",
        trade
    );

    AstraReply(
        "Trade added to journal."
    );

}
  
  function show(){

    let report = 
    "Trading Journal:<br><br>";

    journal.trades.forEach((trade,index)=>{

        report += `
        Trade ${index+1}<br>
        Pair: ${trade.pair || "N/A"}<br>
        Direction: ${trade.direction || "N/A"}<br>
        Result: ${trade.result || "N/A"}<br>
        Notes: ${trade.notes || "None"}<br><br>
        `;

    });

    AstraReply(report);

}
  
/* STATS */

function stats(){


let total =
journal.trades.length;


let wins =
journal.trades.filter(

t=>t.result === "win"

).length;



let losses =
journal.trades.filter(

t=>t.result === "loss"

).length;



let winRate =
total ?

Math.round(
(wins / total) * 100
)

:0;



AstraReply(

`
Journal Statistics:

Trades:
${total}

Wins:
${wins}

Losses:
${losses}

Win Rate:
${winRate}%

`

);


}



function getData(){

return journal;

}



return{

addTrade,

show,

stats,

getData

};


})();



/* REGISTER MODULE */


ASTRA.modules.journal =
JournalModule;




/* JOURNAL COMMANDS */


ASTRA.commands.push({

trigger:"show journal",

action(){

JournalModule.show();

}

});



ASTRA.commands.push({

trigger:"journal stats",

action(){

JournalModule.stats();

}

});



console.log(
"Journal Module Loaded"
);