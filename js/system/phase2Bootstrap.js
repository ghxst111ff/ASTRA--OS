/* =========================================
   ASTRA PHASE 2 BOOTSTRAP v1.0
   Loads Phase 2 runtime services without duplicating module ownership.
========================================= */
(function(){
    const files = [
        "js/system/errorRecovery.js?v=1",
        "js/core/knowledgeBase.js?v=1",
        "js/system/aiGatewayValidation.js?v=1"
    ];
    const load = src => new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-astra-phase2="${src}"]`)) return resolve();
        const script = document.createElement("script");
        script.src = src;
        script.dataset.astraPhase2 = src;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
    });
    window.ASTRA_PHASE2_READY = Promise.all(files.map(load))
        .then(() => { console.log("ASTRA Phase 2 runtime services loaded."); return true; })
        .catch(error => { console.error("ASTRA Phase 2 bootstrap:", error); return false; });
})();
