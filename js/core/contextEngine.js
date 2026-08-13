/* ===================================
 ASTRA CONTEXT ENGINE v1.1
 =================================== */
const ContextEngine={
    build(){
        return {
            memory:JSON.parse(localStorage.getItem("ASTRA_MEMORY"))||{},
            journal:JSON.parse(localStorage.getItem("ASTRA_JOURNAL"))||{},
            performance:ASTRA.modules.performance?ASTRA.modules.performance.getData():{},
            screen:JSON.parse(localStorage.getItem("ASTRA_SCREEN"))||{},
            trading:JSON.parse(localStorage.getItem("ASTRA_TRADING"))||{},
            currentMarketSession:ASTRA.modules.memory?.currentMarketSession?.()||null,
            marketSessions:ASTRA.modules.memory?.listMarketSessions?.()||{}
        };
    }
};
ASTRA.registerModule("context",ContextEngine);
console.log("ASTRA Context Engine v1.1 Loaded");
