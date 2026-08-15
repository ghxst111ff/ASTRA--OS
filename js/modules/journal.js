

/* =========================================
   ASTRA JOURNAL MODULE v2.1
========================================= */

const JournalModule = (()=>{
  let journal = JSON.parse(localStorage.getItem("ASTRA_JOURNAL")) || {trades:[]};

  function save(){ localStorage.setItem("ASTRA_JOURNAL", JSON.stringify(journal)); }

  function addTrade(trade){
    const normalized={...trade, source:trade?.source || "journal"};
    journal.trades.push(normalized);
    if (ASTRA.modules.performance) ASTRA.modules.performance.addResult(normalized.result);
    save();
    if (ASTRA.modules.learning?.learn) ASTRA.modules.learning.learn("journal", normalized);

    // A journaled live/demo trade updates the Demo Account exactly once.
    // Backtest records must pass source:"backtest" and are ignored by the account.
    document.dispatchEvent(new CustomEvent("astra:journal-trade-added", {detail:normalized}));
    AstraReply("Trade added to journal.");
  }

  function show(){
    let report="Trading Journal:<br><br>";
    journal.trades.forEach((trade,index)=>{
      report += `Trade ${index+1}<br>Pair: ${trade.pair || "N/A"}<br>Direction: ${trade.direction || "N/A"}<br>Result: ${trade.result || "N/A"}<br>Notes: ${trade.notes || "None"}<br><br>`;
    });
    AstraReply(report);
  }

  function stats(){
    const total=journal.trades.length;
    const wins=journal.trades.filter(t=>t.result==="win").length;
    const losses=journal.trades.filter(t=>t.result==="loss").length;
    const winRate=total ? Math.round((wins/total)*100) : 0;
    AstraReply(`Journal Statistics:\n\nTrades:\n${total}\n\nWins:\n${wins}\n\nLosses:\n${losses}\n\nWin Rate:\n${winRate}%`);
  }

  function getData(){ return journal; }

  return {addTrade,show,stats,getData};
})();

ASTRA.modules.journal=JournalModule;
ASTRA.commands.push({trigger:"show journal",action(){JournalModule.show();}});
ASTRA.commands.push({trigger:"journal stats",action(){JournalModule.stats();}});
console.log("Journal Module Loaded");