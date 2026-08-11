/* =========================================
   ASTRA MARKET DATA INTERFACE v1.0
========================================= */

const MarketDataModule = (()=>{

    let symbol = null;
    let source = "manual";
    let timeframe = null;
    let candles = [];

    function normalizeCandle(candle){

        if(!candle || typeof candle !== "object"){
            throw new Error("Invalid candle.");
        }

        const normalized = {
            time: candle.time ?? candle.timestamp ?? null,
            open: Number(candle.open),
            high: Number(candle.high),
            low: Number(candle.low),
            close: Number(candle.close),
            volume:
                candle.volume == null
                    ? null
                    : Number(candle.volume)
        };

        if(
            !Number.isFinite(normalized.open) ||
            !Number.isFinite(normalized.high) ||
            !Number.isFinite(normalized.low) ||
            !Number.isFinite(normalized.close)
        ){
            throw new Error("Candle OHLC values must be numeric.");
        }

        if(normalized.high < normalized.low){
            throw new Error("Candle high cannot be below low.");
        }

        return normalized;
    }

    function setData(data = {}){

        symbol = data.symbol ?? symbol;
        source = data.source ?? source;
        timeframe = data.timeframe ?? timeframe;

        const incoming =
            Array.isArray(data.candles)
                ? data.candles
                : [];

        candles = incoming.map(normalizeCandle);

        return getData();
    }

    function addCandle(candle){

        candles.push(
            normalizeCandle(candle)
        );

        return candles[candles.length - 1];
    }

    function getCandles(){
        return candles.slice();
    }

    function getData(){

        return {
            symbol,
            source,
            timeframe,
            candles:getCandles(),
            count:candles.length
        };
    }

    function clear(){

        candles = [];

        return getData();
    }

    function status(){

        return {
            online:true,
            symbol,
            source,
            timeframe,
            candles:candles.length,
            ready:candles.length > 0
        };
    }

    return {

        name:"Market Data Interface",
        version:"1.0",

        setData,
        addCandle,
        getCandles,
        getData,
        clear,
        status

    };

})();

ASTRA.registerModule(
    "marketData",
    MarketDataModule
);

console.log(
    "ASTRA Market Data Interface v1.0 Loaded"
);
