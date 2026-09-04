/* =========================================
   ASTRA JOURNAL MODULE v2.3
   Reliable persistence for Live, Demo and Backtest trades.
   Supports editing and deleting existing journal entries.
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

  function updateTrade(id, changes){
    const index=journal.trades.findIndex(t=>String(t.id)===String(id));
    if(index<0) return null;
    const existing=journal.trades[index];
    const updated={
      ...existing,
      ...changes,
      id: existing.id,
      source: changes?.source || existing.source || "journal",
      updatedAt: new Date().toISOString()
    };
    journal.trades[index]=updated;
    save();
    try { document.dispatchEvent(new CustomEvent("astra:journal-trade-updated", {detail:updated})); }
    catch(err) { console.error("Journal update event failed", err); }
    return updated;
  }

  function deleteTrade(id){
    const index=journal.trades.findIndex(t=>String(t.id)===String(id));
    if(index<0) return null;
    const removed=journal.trades.splice(index,1)[0];
    save();
    try { document.dispatchEvent(new CustomEvent("astra:journal-trade-deleted", {detail:removed})); }
    catch(err) { console.error("Journal delete event failed", err); }
    return removed;
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

  return {addTrade,updateTrade,deleteTrade,show,stats,getData};
})();

ASTRA.modules.journal=JournalModule;
ASTRA.commands.push({trigger:"show journal",action(){JournalModule.show();}});
ASTRA.commands.push({trigger:"journal stats",action(){JournalModule.stats();}});
console.log("Journal Module Loaded v2.3");