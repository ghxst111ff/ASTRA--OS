
/* =========================================
   ASTRA JOURNAL MODULE v2.2
   Reliable persistence for Live, Demo and Backtest trades.
========================================= */

const JournalModule = (()=>{
  let journal;
  try { journal = JSON.parse(localStorage.getItem("ASTRA_JOURNAL")) || {trades:[]}; }
  catch(e) { journal = {trades:[]}; }
  if(!Array.isArray(journal.trades)) journal.trades=[];

  function save(){
    localStorage.setItem("ASTRA_JOURNAL", JSON.stringify(journal));
    return true;
  }

  function addTrade(trade){
    const normalized={
      ...trade,
      id: trade?.id || `trade_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
      source: trade?.source || "journal",
      date: trade?.date || new Date().toISOString()
    };

    // Persist first. Optional integrations must never prevent the trade from saving.
    journal.trades.push(normalized);
    save();

    try {
      if (ASTRA.modules.performance) ASTRA.modules.performance.addResult(normalized.result);
    } catch(err) { console.error("Journal performance update failed", err); }

    try {
      if (ASTRA.modules.learning?.learn) ASTRA.modules.learning.learn("journal", normalized);
    } catch(err) { console.error("Journal learning update failed", err); }

    try {
      document.dispatchEvent(new CustomEvent("astra:journal-trade-added", {detail:normalized}));
    } catch(err) { console.error("Journal event dispatch failed", err); }

    try {
      if (typeof AstraReply === "function") AstraReply("Trade added to journal.");
    } catch(err) { console.error("Journal reply failed", err); }

    return normalized;
  }

  function show(){
    let report="Trading Journal:<br><br>";
    journal.trades.forEach((trade,index)=>{
      report += `Trade ${index+1}<br>Pair: ${trade.pair || "N/A"}<br>Direction: ${trade.direction || "N/A"}<br>Result: ${trade.result || "N/A"}<br>Notes: ${trade.notes || "None"}<br><br>`;
    });
    if(typeof AstraReply === "function") AstraReply(report);
  }

  function stats(){
    const total=journal.trades.length;
    const wins=journal.trades.filter(t=>t.result==="win").length;
    const losses=journal.trades.filter(t=>t.result==="loss").length;
    const winRate=total ? Math.round((wins/total)*100) : 0;
    if(typeof AstraReply === "function") AstraReply(`Journal Statistics:\n\nTrades:\n${total}\n\nWins:\n${wins}\n\nLosses:\n${losses}\n\nWin Rate:\n${winRate}%`);
  }

  function getData(){ return {trades:[...journal.trades]}; }

  return {addTrade,show,stats,getData};
})();

ASTRA.modules.journal=JournalModule;
ASTRA.commands.push({trigger:"show journal",action(){JournalModule.show();}});
ASTRA.commands.push({trigger:"journal stats",action(){JournalModule.stats();}});
console.log("Journal Module Loaded v2.2");