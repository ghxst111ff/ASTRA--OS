/* ===================================
 ASTRA CONTEXT ENGINE
 =================================== */


const ContextEngine = {

    build(){

        return {

            memory:
                JSON.parse(
                    localStorage.getItem("ASTRA_MEMORY")
                ) || {},

            journal:
                JSON.parse(
                    localStorage.getItem("ASTRA_JOURNAL")
                ) || {},

            performance:
                ASTRA.modules.performance
                ? ASTRA.modules.performance.getData()
                : {},

            screen:
                JSON.parse(
                    localStorage.getItem("ASTRA_SCREEN")
                ) || {},

            trading:
                JSON.parse(
                    localStorage.getItem("ASTRA_TRADING")
                ) || {}

        };

    }

};


ASTRA.registerModule(
    "context",
    ContextEngine
);

console.log(
    "ASTRA Context Engine Loaded"
);