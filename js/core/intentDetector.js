/* =========================================
   ASTRA INTENT DETECTOR v1.0
========================================= */

const IntentDetector = {

    detect(message){

        const text =
            message.toLowerCase().trim();

        const panels = [
            "journal",
            "trading",
            "memory",
            "screen",
            "performance"
        ];

        for(const panel of panels){

            if(
                text.includes("open") &&
                text.includes(panel)
            ){
                return {
                    action: "open",
                    panel: panel
                };
            }

            if(
                text.includes("close") &&
                text.includes(panel)
            ){
                return {
                    action: "close",
                    panel: panel
                };
            }

        }

        return {
            action: "ai",
            panel: null
        };

    }

};

ASTRA.registerModule(
    "intent",
    IntentDetector
);

console.log(
    "ASTRA Intent Detector Loaded"
);