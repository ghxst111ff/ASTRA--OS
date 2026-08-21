/* =========================================
   ASTRA BACKTESTING MODULE v2.2
   Candle engine + strategy runner + saved backtest trade sync
========================================= */

const BacktestingModule = (()=>{
    let candles=[];
    let trades=[];
    let results=null;
    const JOURNAL_KEY="ASTRA_JOURNAL";

    function normalize(trade){
        if(!trade || typeof trade!=="object") return null;
        return {...trade, tradeType:trade.tradeType||trade.source||"backtest"};
    }

    function readSavedBacktests(){
        try{
            const journal=ASTRA?.modules?.journal?.getData?.();
            const all=Array.isArray(journal?.trades)?journal.trades:[];
            return all.filter(t=>String(t.tradeType||t.source||"").toLowerCase()==="backtest").map(normalize).filter(Boolean);
        }catch(e){}
        try{
            const data=JSON.parse(localStorage.getItem(JOURNAL_KEY)||'{"trades":[]}');
            const all=Array.isArray(data.trades)?data.trades:[];
            return all.filter(t=>String(t.tradeType||t.source||"").toLowerCase()==="backtest").map(normalize).filter(Boolean);
        }catch(e){ return []; }
    }

    function mergeSavedTrades(){
        const saved=readSavedBacktests();
        const merged=[];
        const seen=new Set();
        [...trades,...saved].forEach(t=>{
            const key=t?.id || `${t?.date||t?.testDate||""}|${t?.pair||""}|${t?.direction||t?.side||""}|${t?.entry||""}|${t?.pnl||""}`;
            if(!seen.has(key)){ seen.add(key); merged.push(t); }
        });
        trades=merged;
        return trades.slice();
    }

    function setData(data=[]){ candles=Array.isArray(data)?data.slice():[]; return candles.length; }
    function addCandle(candle){ candles.push(candle); return candle; }
    function getCandles(){ return candles.slice(); }
    function clear(){ candles=[]; trades=[]; results=null; }

    function record(trade){
        if(!trade || typeof trade!=="object") throw new Error("Invalid trade.");
        const normalized=normalize(trade);
        if(normalized.pnl!=null) normalized.pnl=Number(normalized.pnl);
        if(normalized.id && trades.some(t=>t.id===normalized.id)) return normalized;
        trades.push(normalized);
        return normalized;
    }

    function getTrades(){
        mergeSavedTrades();
        return trades.slice();
    }

    function syncSavedTrades(){ return mergeSavedTrades(); }

    function run(strategy,data){
        const series=Array.isArray(data)?data:candles;
        if(typeof strategy!=="function") throw new Error("Backtest strategy must be a function.");
        if(series.length<2) return {ready:false,reason:"At least 2 candles are required.",trades:getTrades(),stats:null};
        trades=[];
        let equity=0,wins=0,losses=0,peak=0,maxDrawdown=0;
        for(let i=1;i<series.length;i++){
            const signal=strategy(series[i],series.slice(0,i),i);
            if(!signal || !signal.side) continue;
            const entry=Number(signal.entry ?? series[i].close);
            const exit=Number(signal.exit ?? series[i+1]?.close ?? series[i].close);
            const size=Number(signal.size ?? 1);
            const pnl=signal.side.toLowerCase()==="long"?(exit-entry)*size:(entry-exit)*size;
            record({index:i,time:series[i].time ?? null,side:signal.side,entry,exit,size,pnl,tradeType:"backtest"});
            equity+=pnl;
            if(pnl>0) wins++; else if(pnl<0) losses++;
            peak=Math.max(peak,equity);
            maxDrawdown=Math.max(maxDrawdown,peak-equity);
        }
        const count=trades.length;
        const grossProfit=trades.filter(t=>t.pnl>0).reduce((s,t)=>s+t.pnl,0);
        const grossLoss=Math.abs(trades.filter(t=>t.pnl<0).reduce((s,t)=>s+t.pnl,0));
        const stats={trades:count,wins,losses,winRate:count?wins/count*100:0,netPnl:equity,grossProfit,grossLoss,profitFactor:grossLoss?grossProfit/grossLoss:null,maxDrawdown};
        results={ready:true,trades:getTrades(),stats};
        return {...results,trades:getTrades(),stats:{...stats}};
    }

    function status(){
        const saved=readSavedBacktests();
        return {online:true,candles:candles.length,trades:getTrades().length,savedTrades:saved.length,ready:candles.length>1};
    }

    document.addEventListener("astra:journal-trade-added",event=>{
        const trade=event?.detail;
        if(String(trade?.tradeType||trade?.source||"").toLowerCase()==="backtest") record(trade);
    });

    return {name:"Backtesting Module",version:"2.2",setData,addCandle,getCandles,clear,record,getTrades,syncSavedTrades,run,status};
})();

ASTRA.registerModule("BacktestingModule",BacktestingModule);
ASTRA.registerModule("backtesting",BacktestingModule);
console.log("ASTRA Backtesting Module v2.2 Loaded");