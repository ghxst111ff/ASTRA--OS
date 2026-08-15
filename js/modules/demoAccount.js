/* ASTRA DEMO ACCOUNT MODULE v1.0
   Simulated brokerage ledger for live/demo practice.
   Backtest trades are intentionally excluded.
*/
const DemoAccountModule = (() => {
  const KEY = "ASTRA_DEMO_ACCOUNT";
  const STARTING_BALANCE = 10000;

  const defaults = {
    enabled: true,
    startingBalance: STARTING_BALANCE,
    balance: STARTING_BALANCE,
    openPositions: [],
    closedTrades: [],
    dayStartBalance: STARTING_BALANCE,
    weekStartBalance: STARTING_BALANCE,
    lastReset: null
  };

  function load(){
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      return saved ? {...defaults, ...saved} : {...defaults};
    } catch { return {...defaults}; }
  }

  let account = load();

  function save(){ localStorage.setItem(KEY, JSON.stringify(account)); }
  function pnl(){ return account.balance - account.startingBalance; }
  function todayPL(){ return account.balance - account.dayStartBalance; }
  function weeklyPL(){ return account.balance - account.weekStartBalance; }
  function wins(){ return account.closedTrades.filter(t => Number(t.pnl || 0) > 0).length; }
  function losses(){ return account.closedTrades.filter(t => Number(t.pnl || 0) < 0).length; }
  function winRate(){ return account.closedTrades.length ? Math.round((wins()/account.closedTrades.length)*100) : 0; }
  function drawdown(){
    const peak = Math.max(account.startingBalance, ...account.closedTrades.map(t => Number(t.balanceAfter || account.startingBalance)));
    return peak > 0 ? Math.max(0, ((peak - account.balance) / peak) * 100) : 0;
  }

  function snapshot(){
    return {
      ...account,
      equity: account.balance,
      buyingPower: account.balance,
      pnl: pnl(),
      todayPL: todayPL(),
      weeklyPL: weeklyPL(),
      trades: account.closedTrades.length,
      wins: wins(),
      losses: losses(),
      winRate: winRate(),
      drawdown: drawdown()
    };
  }

  function money(value){
    const n = Number(value || 0);
    return `${n < 0 ? "-" : ""}$${Math.abs(n).toFixed(2)}`;
  }

  function render(){
    const s = snapshot();
    const set = (id, value) => { const el=document.getElementById(id); if(el) el.textContent=value; };
    set("accountBalance", money(s.balance));
    set("equity", money(s.equity));
    set("buyingPower", money(s.buyingPower));
    set("tradesToday", s.trades);
    set("winRate", `${s.winRate}%`);
    const pl = document.getElementById("todayPL");
    if(pl){ pl.classList.toggle("positive", s.todayPL >= 0); pl.classList.toggle("negative", s.todayPL < 0); pl.innerHTML = `${s.todayPL >= 0 ? "+" : "-"}$${Math.abs(s.todayPL).toFixed(2)} <small>${s.dayStartBalance ? ((s.todayPL/s.dayStartBalance)*100).toFixed(2) : "0.00"}%</small>`; }
    const status=document.getElementById("demoStatus");
    if(status) status.textContent = account.enabled ? "ACTIVE ›" : "PAUSED ›";
    const msg=document.getElementById("demoAccountSummary");
    if(msg) msg.textContent = `Demo equity ${money(s.equity)} · ${s.trades} closed trade${s.trades===1?"":"s"} · ${s.winRate}% win rate`;
    document.dispatchEvent(new CustomEvent("astra:demo-account-updated", {detail:s}));
  }

  function recordClosedTrade(trade){
    if(!account.enabled) return snapshot();
    if(trade?.source === "backtest" || trade?.isBacktest) return snapshot();
    const pnlValue = Number(trade?.pnl ?? 0);
    const entry = {
      id: trade.id || `demo-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      pair: String(trade.pair || "N/A").toUpperCase(),
      direction: trade.direction || "N/A",
      pnl: pnlValue,
      result: trade.result || (pnlValue > 0 ? "win" : pnlValue < 0 ? "loss" : "breakeven"),
      date: trade.date || new Date().toISOString()
    };
    account.balance += pnlValue;
    entry.balanceAfter = account.balance;
    account.closedTrades.push(entry);
    save();
    render();
    return snapshot();
  }

  function openPosition(position){
    if(!account.enabled) return false;
    account.openPositions.push({...position, id:position.id || `open-${Date.now()}`});
    save(); render(); return true;
  }

  function closePosition(id, pnlValue=0, extra={}){
    const index=account.openPositions.findIndex(p=>p.id===id);
    if(index < 0) return false;
    const position=account.openPositions.splice(index,1)[0];
    recordClosedTrade({...position,...extra,pnl:pnlValue});
    return true;
  }

  function reset(){
    account={...defaults, lastReset:new Date().toISOString()};
    save(); render();
    return snapshot();
  }

  function setEnabled(enabled){ account.enabled=!!enabled; save(); render(); return account.enabled; }
  function getData(){ return snapshot(); }

  function init(){
    render();
    document.addEventListener("astra:journal-trade-added", e => recordClosedTrade(e.detail || {}));
    console.log("ASTRA Demo Account v1.0 Loaded");
  }

  const api={name:"Demo Account",version:"1.0",getData,recordClosedTrade,openPosition,closePosition,reset,setEnabled,render};
  ASTRA.registerModule("demoAccount", api);
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true}); else init();
  return api;
})();
