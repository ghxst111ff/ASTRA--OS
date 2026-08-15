/* =========================================
   ASTRA VOICE / CONVERSATION MODULE v1.4
   Natural voice selection + interruption + feedback-loop protection
========================================= */
const VoiceModule=(()=>{
    const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
    let recognition=null,listening=false,speaking=false,restarting=false,voices=[];
    let restartTimer=null,selectedVoiceName=localStorage.getItem("ASTRA_VOICE_NAME")||"";
    let ignoreRecognitionUntil=0;

    function supported(){return !!Recognition;}
    function loadVoices(){
        if(!window.speechSynthesis)return [];
        voices=window.speechSynthesis.getVoices()||[];
        return voices;
    }
    function pickVoice(){
        loadVoices();
        if(selectedVoiceName){const saved=voices.find(v=>v.name===selectedVoiceName);if(saved)return saved;}
        const preferred=["Microsoft Aria Online (Natural) - English (United States)","Microsoft Jenny Online (Natural) - English (United States)","Google US English","Samantha","Karen","Daniel"];
        const natural=voices.find(v=>preferred.some(name=>v.name.toLowerCase().includes(name.toLowerCase())));
        const english=voices.find(v=>/^en(-|_)/i.test(v.lang));
        return natural||english||voices[0]||null;
    }
    function clearRestart(){if(restartTimer){clearTimeout(restartTimer);restartTimer=null;}restarting=false;}
    function stopSpeaking(){
        if(window.speechSynthesis)window.speechSynthesis.cancel();
        if(recognition){try{recognition.stop();}catch(error){}}
        speaking=false;
        ignoreRecognitionUntil=Date.now()+1200;
        clearRestart();
    }
    function scheduleRestart(delay=250){
        if(!listening||speaking||restarting||!recognition)return;
        restarting=true;
        restartTimer=setTimeout(()=>{
            restartTimer=null;restarting=false;
            if(!listening||speaking||!recognition)return;
            try{recognition.start();}catch(error){scheduleRestart(700);}
        },delay);
    }
    function speak(text){
        if(!listening||!window.speechSynthesis||!text)return false;
        try{
            stopSpeaking();
            const clean=String(text).replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
            if(!clean)return false;
            const voice=pickVoice();
            const utterance=new SpeechSynthesisUtterance(clean);
            if(voice)utterance.voice=voice;
            utterance.rate=0.94;
            utterance.pitch=1.02;
            utterance.volume=1;
            utterance.onstart=()=>{speaking=true;};
            utterance.onend=()=>{
                speaking=false;
                // Ignore microphone tail/echo from ASTRA's own speech.
                ignoreRecognitionUntil=Date.now()+1200;
                if(listening&&recognition)scheduleRestart(1000);
            };
            utterance.onerror=()=>{
                speaking=false;
                ignoreRecognitionUntil=Date.now()+1200;
                if(listening&&recognition)scheduleRestart(1000);
            };
            window.speechSynthesis.speak(utterance);
            return true;
        }catch(error){console.error("ASTRA voice output:",error);speaking=false;return false;}
    }
    function start(){
        if(!supported()){AstraReply("Voice recognition is not supported by this browser.");return false;}
        if(listening)return true;
        loadVoices();clearRestart();
        ignoreRecognitionUntil=Date.now()+1200;
        recognition=new Recognition();
        recognition.continuous=true;
        recognition.interimResults=true;
        recognition.lang="en-US";
        recognition.onresult=(event)=>{
            for(let i=event.resultIndex;i<event.results.length;i++){
                const result=event.results[i];
                const text=result[0].transcript.trim();
                // Never feed ASTRA's own spoken output back into the command router.
                if(speaking||Date.now()<ignoreRecognitionUntil)continue;
                if(!result.isFinal||!text)continue;
                ASTRA.modules.response?.user?.(text);
                ASTRA.modules.command?.process?.(text);
            }
        };
        recognition.onerror=(event)=>{console.warn("ASTRA voice recognition:",event.error);if(listening&&event.error!=="not-allowed"&&event.error!=="service-not-allowed")scheduleRestart(350);};
        recognition.onend=()=>{if(listening&&!speaking)scheduleRestart(1000);};
        try{listening=true;recognition.start();AstraReply("Voice is ready.");return true;}
        catch(error){console.error("ASTRA voice start:",error);listening=false;recognition=null;return false;}
    }
    function stop(){listening=false;clearRestart();stopSpeaking();if(recognition){try{recognition.stop();}catch(error){}recognition=null;}AstraReply("Voice is off.");}
    function toggle(){return listening?(stop(),false):start();}
    function setVoice(name){loadVoices();const voice=voices.find(v=>v.name===name);if(!voice)return false;selectedVoiceName=voice.name;localStorage.setItem("ASTRA_VOICE_NAME",voice.name);return true;}
    function getVoices(){loadVoices();return voices.filter(v=>/^en(-|_)/i.test(v.lang)).map(v=>({name:v.name,lang:v.lang,default:v.default}));}
    function status(){return {supported:supported(),listening,speaking,restarting,voice:pickVoice()?.name||null,ignoreRecognitionUntil};}
    if(window.speechSynthesis)window.speechSynthesis.onvoiceschanged=loadVoices;
    return {name:"Voice Conversation",version:"1.4",supported,start,stop,toggle,speak,stopSpeaking,setVoice,getVoices,status};
})();
ASTRA.registerModule("voice",VoiceModule);
ASTRA.commands.push({trigger:"start voice",action:()=>VoiceModule.start()});
ASTRA.commands.push({trigger:"stop voice",action:()=>VoiceModule.stop()});
ASTRA.commands.push({trigger:"voice status",action:()=>AstraReply(JSON.stringify(VoiceModule.status()))});
console.log("ASTRA Voice Conversation v1.4 Loaded");
