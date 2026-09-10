/* VEGA MICROPHONE TEST HARNESS v1.0
   Isolated manual trigger for microphone diagnostics.
   Trigger: Ctrl+Alt+M
   Does not modify quick-action handlers, runtimeIntegrity, or SpeechRecognition.
*/
const MicrophoneTestHarness = (() => {
    let installed = false;
    const report = result => {
        const text = result?.message || "Microphone diagnostic finished.";
        if (typeof AstraReply === "function") AstraReply(text);
        else console.log("VEGA MIC TEST:", result);
    };
    const run = async () => {
        const mic = ASTRA.modules.microphoneDiagnostics;
        if (!mic?.test) return report({message:"Microphone diagnostics are not loaded."});
        report({message:"Microphone test started. Speak normally for about 3.5 seconds."});
        const result = await mic.test(3500);
        console.log("VEGA MIC TEST RESULT:", result);
        report(result);
    };
    const install = () => {
        if (installed) return;
        installed = true;
        window.addEventListener("keydown", event => {
            if (event.ctrlKey && event.altKey && event.key.toLowerCase() === "m") {
                event.preventDefault();
                run();
            }
        });
        console.log("VEGA Microphone Test Harness v1.0 — Ctrl+Alt+M");
    };
    install();
    return {name:"Microphone Test Harness",version:"1.0",run,install};
})();
ASTRA.registerModule("microphoneTestHarness", MicrophoneTestHarness);
