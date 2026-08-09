/* =========================================
   ASTRA MODULE TYPE DETECTOR v1.0
========================================= */

const ModuleTypeDetector = {

    detect(feature){

        feature = feature.toLowerCase();

        if(
            feature.includes("trade") ||
            feature.includes("backtest")
        ){
            return "trading";
        }

        if(
            feature.includes("screen") ||
            feature.includes("analysis")
        ){
            return "analysis";
        }

        if(
            feature.includes("voice") ||
            feature.includes("assistant")
        ){
            return "ai";
        }

        return "core";
    }

};

ASTRA.registerModule(
    "moduleType",
    ModuleTypeDetector
);

console.log(
    "ASTRA Module Type Detector Loaded"
);