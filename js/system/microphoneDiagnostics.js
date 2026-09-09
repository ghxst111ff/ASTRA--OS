/* =========================================================
   VEGA MICROPHONE DIAGNOSTICS v1.0
   Explicit calibration helper for speech-recognition troubleshooting.
   This does NOT replace SpeechRecognition or create a second recognition path.
========================================================= */
const MicrophoneDiagnostics = (() => {
    let activeStream = null;
    let activeContext = null;

    const stop = () => {
        try { activeStream?.getTracks?.().forEach(t => t.stop()); } catch (e) {}
        activeStream = null;
        try { activeContext?.close?.(); } catch (e) {}
        activeContext = null;
    };

    const test = async (durationMs = 3500) => {
        stop();
        if (!navigator.mediaDevices?.getUserMedia) {
            return { ok:false, code:"unsupported", message:"Microphone diagnostics are not supported by this browser." };
        }
        try {
            activeStream = await navigator.mediaDevices.getUserMedia({audio:true});
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) {
                stop();
                return { ok:false, code:"audio-context-unsupported", message:"Microphone access works, but input-level measurement is not supported here." };
            }
            activeContext = new AudioCtx();
            await activeContext.resume?.();
            const source = activeContext.createMediaStreamSource(activeStream);
            const analyser = activeContext.createAnalyser();
            analyser.fftSize = 2048;
            source.connect(analyser);
            const data = new Float32Array(analyser.fftSize);
            const started = performance.now();
            let samples = 0, sumRms = 0, peak = 0;
            while (performance.now() - started < durationMs) {
                analyser.getFloatTimeDomainData(data);
                let sum = 0, localPeak = 0;
                for (let i=0;i<data.length;i++) { const v=data[i]; sum += v*v; localPeak=Math.max(localPeak,Math.abs(v)); }
                const rms = Math.sqrt(sum/data.length);
                sumRms += rms;
                peak = Math.max(peak, localPeak);
                samples++;
                await new Promise(r=>setTimeout(r,60));
            }
            const averageRms = samples ? sumRms/samples : 0;
            const rmsDb = averageRms > 0 ? 20*Math.log10(averageRms) : -Infinity;
            const peakDb = peak > 0 ? 20*Math.log10(peak) : -Infinity;
            const level = averageRms >= 0.045 ? "strong" : averageRms >= 0.012 ? "usable" : averageRms >= 0.004 ? "quiet" : "very quiet";
            const message = level === "strong"
                ? "Microphone input is strong. Try normal-speed speech in VEGA voice."
                : level === "usable"
                    ? "Microphone input is usable. If normal speech still transcribes poorly, the recognition service is likely the limiting layer."
                    : "Microphone input is quiet. Check the selected microphone, permission, distance, and input level before testing recognition again.";
            const result = { ok:true, level, averageRms:Number(averageRms.toFixed(4)), peak:Number(peak.toFixed(4)), averageDb:Number(rmsDb.toFixed(1)), peakDb:Number(peakDb.toFixed(1)), durationMs, message };
            stop();
            return result;
        } catch (e) {
            const name = e?.name || "UnknownError";
            stop();
            const message = name === "NotAllowedError" ? "Microphone permission was denied. Allow microphone access, then run the test again." : name === "NotFoundError" ? "No microphone was found. Check the input device, then run the test again." : "Microphone diagnostics could not access the input device.";
            return { ok:false, code:name, message };
        }
    };

    const status = () => ({ available:!!navigator.mediaDevices?.getUserMedia, running:!!activeStream });
    return { name:"Microphone Diagnostics", version:"1.0", test, stop, status };
})();

ASTRA.registerModule("microphoneDiagnostics", MicrophoneDiagnostics);