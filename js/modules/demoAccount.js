/* ASTRA DEMO ACCOUNT MODULE v1.2
   Simulated brokerage ledger for demo practice.
   Backtest trades are intentionally excluded.
   Reconciles dashboard data when journal trades are added, edited, or deleted.
*/
const DemoAccountModule = (() => {
  const KEY = "ASTRA_DEMO_ACCOUNT";
  const STARTING_BALANCE = 10000;
  const DAILY_LOSS_LIMIT = 2;
  const WEEKLY_LOSS_LIMIT = 5;

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
  function wins(){ return account.closedTrades.filter(t => Number(t.pnl || 0) > 0).length; }
  function losses(){ return account.closedTrades.filter(t => Number(t.pnl || 0) < 0).length; }
  function winRate(){ return account.closedTrades.length ? Math.round((wins()/account.closedTrades.length)*100) : 0; }
  function drawdown(){
    const peak = Math.max(account.startingBalance, ...account.closedTrades.map(t => Number(t.balanceAfter || account.startingBalance)));
    return peak > 0 ? Math.max(0, ((peak - account.balance) / peak) * 100) : 0;
  }

  function isBacktest(trade){ return trade?.source === "backtest" || trade?.isBacktest === true || trade?.tradeType === "backtest"; }
  function usableTrades(){
    try {
      const trades = ASTRA.modules.journal?.getData?.().trades || [];
      return trades.filter(t => !isBacktest(t));
    } catch { return []; }
  }
  function localDayKey(value){
    const d = new Date(value || Date.now());
    return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
  }
  function weekKey(value){
    const d = new Date(value || Date.now());
    const day = d.getDay();
    const monday = new Date(d);
    monday.setHours(0,0,0,0);
    monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    return localDayKey(monday);
  }
  function calculatePeriodPL(trades, period){
    const key = period === "week" ? weekKey(Date.now()) : localDayKey(Date.now());
    return trades.reduce((sum, trade) => {
      const tradeKey = period === "week" ? weekKey(trade.date) : localDayKey(trade.date);
      return tradeKey === key ? sum + Number(trade.pnl || 0) : sum;
    }, 0);
  }
  function calculatePeriodLosses(trades, period){
    const key = period === "week" ? weekKey(Date.now()) : localDayKey(Date.now());
    return trades.filter(trade => {
      const tradeKey = period === "week" ? weekKey(trade.date) : localDayKey(trade.date);
      return tradeKey === key && Number(trade.pnl || 0) < 0;
    }).length;
  }
  function calculatePeriodTrades(trades, period){
    const key = period === "week" ? weekKey(Date.now()) : localDayKey(Date.now());
    return trades.filter(trade => {
      const tradeKey = period === "week" ? weekKey(trade.date) : localDayKey(trade.date);
      return tradeKey === key;
    }).length;
  }

  function snapshot(){
    const trades = usableTrades();
    const todayPL = calculatePeriodPL(trades, "day");
    const weeklyPL = calculatePeriodPL(trades, "week");
    return {
      ...account,
      equity: account.balance,
      buyingPower: account.balance,
      pnl: pnl(),
      todayPL,
      weeklyPL,
      dailyLosses: calculatePeriodLosses(trades, "day"),
      weeklyLosses: calculatePeriodLosses(trades, "week"),
      trades: account.closedTrades.length,
      tradesToday: calculatePeriodTrades(trades, "day"),
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

  function renderRisk(s){
    const dailyLosses = Number(s.dailyLosses || 0);
    const weeklyLosses = Number(s.weeklyLosses || 0);
    const dailyPct = Math.min(100, Math.round((dailyLosses / DAILY_LOSS_LIMIT) * 100));
    const riskLevel = dailyLosses >= DAILY_LOSS_LIMIT || weeklyLosses >= WEEKLY_LOSS_LIMIT
      ? "HIGH"
      : dailyLosses > 0 || weeklyLosses > 0
        ? "ELEVATED"
        : "LOW";
    const set = (id, value) => { const el=document.getElementById(id); if(el) el.textContent=value; };
    set("riskTrade", "1%");
    set("dailyLoss", `${dailyLosses}/${DAILY_LOSS_LIMIT}`);
    set("weeklyLoss", `${weeklyLosses}/${WEEKLY_LOSS_LIMIT}`);
    set("riskLevel", riskLevel);
    set("riskPct", `${dailyPct}%`);
    const ring=document.getElementById("riskRing");
    if(ring){
      ring.style.setProperty("--risk-pct", `${dailyPct}%`);
      ring.setAttribute("aria-label", `Daily loss usage ${dailyPct}%`);
    }
  }

  function render(){
    const s = snapshot();
    const set = (id, value) => { const el=document.getElementById(id); if(el) el.textContent=value; };
    set("accountBalance", money(s.balance));
    set("equity", money(s.equity));
    set("buyingPower", money(s.buyingPower));
    set("tradesToday", s.tradesToday);
    set("winRate", `${s.winRate}%`);

    const pl = document.getElementById("todayPL");
    if(pl){
      pl.classList.toggle("positive", s.todayPL >= 0);
      pl.classList.toggle("negative", s.todayPL < 0);
      pl.innerHTML = `${s.todayPL >= 0 ? "+" : "-"}$${Math.abs(s.todayPL).toFixed(2)} <small>${s.startingBalance ? ((s.todayPL/s.startingBalance)*100).toFixed(2) : "0.00"}%</small>`;
    }

    const perf = document.getElementById("perfReturn");
    if(perf){
      const pct = s.startingBalance ? (s.pnl / s.startingBalance) * 100 : 0;
      perf.textContent = `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
      perf.classList.toggle("negative", pct < 0);
      perf.classList.toggle("big-positive", pct >= 0);
    }

    const status=document.getElementById("demoStatus");
    if(status) status.textContent = account.enabled ? "ACTIVE ›" : "PAUSED ›";
    const msg=document.getElementById("demoAccountSummary");
    if(msg) msg.textContent = `Demo equity ${money(s.equity)} · ${s.trades} closed trade${s.trades===1?"":"s"} · ${s.winRate}% win rate`;
    renderRisk(s);
    document.dispatchEvent(new CustomEvent("astra:demo-account-updated", {detail:s}));
  }

  function reconcile(){
    const trades = usableTrades();
    const previousOpen = account.openPositions || [];
    account.closedTrades = trades.map((trade, index) => {
      const pnlValue = Number(trade?.pnl ?? 0);
      const cumulative = STARTING_BALANCE + trades.slice(0, index + 1).reduce((sum, t) => sum + Number(t?.pnl || 0), 0);
      return {
        id: trade.id || `demo-${index}`,
        pair: String(trade.pair || "N/A").toUpperCase(),
        direction: trade.direction || "N/A",
        pnl: pnlValue,
        result: trade.result || (pnlValue > 0 ? "win" : pnlValue < 0 ? "loss" : "breakeven"),
        date: trade.date || new Date().toISOString(),
        balanceAfter: cumulative
      };
    });
    account.balance = STARTING_BALANCE + trades.reduce((sum, t) => sum + Number(t?.pnl || 0), 0);
    account.openPositions = previousOpen;
    save();
    render();
    return snapshot();
  }

  function recordClosedTrade(trade){
    if(!account.enabled || isBacktest(trade)) return snapshot();
    return reconcile();
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
    reconcile();
    document.addEventListener("astra:journal-trade-added", () => reconcile());
    document.addEventListener("astra:journal-trade-updated", () => reconcile());
    document.addEventListener("astra:journal-trade-deleted", () => reconcile());
    console.log("ASTRA Demo Account v1.2 Loaded");
  }

  const api={name:"Demo Account",version:"1.2",getData,recordClosedTrade,openPosition,closePosition,reset,setEnabled,render,reconcile};
  ASTRA.registerModule("demoAccount", api);
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true}); else init();
  return api;
})();
