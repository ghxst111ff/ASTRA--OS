/* =========================================
   ASTRA CODE GENERATOR v2.1
========================================= */

const CodeGenerator = {

    generate(update){

        let result = {
            module:update.module,
            feature:update.feature,
            files:[]
        };

        if(
            update.feature
            .toLowerCase()
            .includes("backtesting")
        ){
            result.files.push({
                name:"BacktestingModule.js",
                code:`

const BacktestingModule = {

name:"${update.module}",
version:"${update.version || "1.0"}",

trades:[],

addTrade(trade){
    this.trades.push(trade);
},

getTrades(){
    return this.trades;
}

};

ASTRA.modules.${update.module} =
BacktestingModule;

`
            });
        }

        else if(
            update.feature
            .toLowerCase()
            .includes("screen")
        ){
            result.files.push({
                name:"ScreenModule.js",
                code:`

const ScreenModule = {

name:"${update.module}",
version:"${update.version || "1.0"}",

analyze(){
    return "Screen analysis ready";
}

};

ASTRA.modules.${update.module} =
ScreenModule;

`
            });
        }

        else if(
            update.feature
            .toLowerCase()
            .includes("voice")
        ){
            result.files.push({
                name:"VoiceModule.js",
                code:`

const VoiceModule = {

name:"${update.module}",
version:"${update.version || "1.0"}",

listen(){
    return "Voice ready";
}

};

ASTRA.modules.${update.module} =
VoiceModule;

`
            });
        }

        else if(
            update.feature
            .toLowerCase()
            .includes("trade replay")
        ){
            result.files.push({
                name:"TradeReplayModule.js",
                code:`

const TradeReplayModule = {

name:"${update.module}",
version:"${update.version || "1.0"}",

trades:[],

record(trade){
    this.trades.push(trade);
},

getTrades(){
    return this.trades;
}

};

ASTRA.modules.${update.module} =
TradeReplayModule;

`
            });
        }

        else {

            const type =
            ASTRA.modules.moduleType.detect(update.feature);

            const blueprint =
            ASTRA.modules.blueprints[type];

            result.files =
            blueprint.files.map(file=>({

                name:
                update.module +
                "_" +
                file.replace(/\s/g,"") +
                ".js",

                code:
                `// ASTRA Generated Module\n\nModule:\n${update.module}\n\nComponent:\n${file}\n\n`

            }));

        }

        return result;

    }

};

ASTRA.registerModule(
    "codeGenerator",
    CodeGenerator
);

console.log(
    "ASTRA Code Generator v2.1 Loaded"
);