/* =========================================
   ASTRA VOICE / CONVERSATION MODULE v1.3
   Natural turn-taking + barge-in
========================================= */
const VoiceModule=(()=>{
    const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
    let recognition=null,listening=false,speaking=false,restarting=false;
    let restartTimer=null;
    let suppressEchoUntil=0;

    function supported(){return !!Recognition;}

    function clearRestart(){
        if(restartTimer){clearTimeout(restartTimer);restartTimer=null;}
        restarting=false;
    }

    function cancelSpeechForBargeIn(){
        if(!speaking)return;
        try{window.speechSynthesis?.cancel();}catch(error){}
        speaking=false;
        suppressEchoUntil=Date.now()+250;
    }

    function scheduleRestart(delay=250){
        if(!listening||restarting||!recognition)return;
        restarting=true;
        restartTimer=setTimeout(()=>{
            restartTimer=null;
            restarting=false;
            if(!listening||!recognition)return;
            try{recognition.start();}
            catch(error){scheduleRestart(700);}
        },delay);
    }

    function speak(text){
        if(!listening||!window.speechSynthesis||!text)return false;
        try{
            window.speechSynthesis.cancel();
            const clean=String(text).replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
            if(!clean)return false;
            const utterance=new SpeechSynthesisUtterance(clean);
            utterance.rate=1;
            utterance.pitch=1;
            utterance.onstart=()=>{speaking=true;};
            utterance.onend=()=>{
                speaking=false;
                if(listening&&recognition)scheduleRestart(100);
            };
            utterance.onerror=()=>{
                speaking=false;
                if(listening&&recognition)scheduleRestart(100);
            };
            window.speechSynthesis.speak(utterance);
            return true;
        }catch(error){
            console.error("ASTRA voice output:",error);
            speaking=false;
            return false;
        }
    }

    function handleText(text){
        const clean=String(text||"").trim();
        if(!clean)return;

        // If the user starts talking while ASTRA is speaking,
        // immediately stop ASTRA and give the user the floor.
        cancelSpeechForBargeIn();
        if(Date.now()<suppressEchoUntil)return;

        ASTRA.modules.response?.user?.(clean);
        ASTRA.modules.command?.process?.(clean);
    }

    function start(){
        if(!supported()){
            AstraReply("Voice recognition is not supported by this browser.");
            return false;
        }
        if(listening)return true;

        clearRestart();
        recognition=new Recognition();
        recognition.continuous=true;
        recognition.interimResults=true;
        recognition.lang="en-US";
        recognition.maxAlternatives=1;

        recognition.onresult=(event)=>{
            // Barge-in on interim speech too, so ASTRA cuts off immediately.
            for(let i=event.resultIndex;i<event.results.length;i++){
                const result=event.results[i];
                const text=result?.[0]?.transcript?.trim();
                if(!text)continue;
                if(speaking)cancelSpeechForBargeIn();
                if(result.isFinal)handleText(text);
            }
        };

        recognition.onerror=(event)=>{
            console.warn("ASTRA voice recognition:",event.error);
            if(listening && event.error !== "not-allowed" && event.error !== "service-not-allowed"){
                scheduleRestart(350);
            }
        };

        recognition.onend=()=>{
            if(listening)scheduleRestart(speaking?100:150);
        };

        try{
            listening=true;
            recognition.start();
            AstraReply("Listening.");
            return true;
        }catch(error){
            console.error("ASTRA voice start:",error);
            listening=false;
            recognition=null;
            return false;
        }
    }

    function stop(){
        listening=false;
        clearRestart();
        if(recognition){
            try{recognition.stop();}catch(error){}
            recognition=null;
        }
        if(window.speechSynthesis)window.speechSynthesis.cancel();
        speaking=false;
        AstraReply("Voice off.");
    }

    function toggle(){return listening?(stop(),false):start();}
    function status(){return {supported:supported(),listening,speaking,restarting};}

    return {name:"Voice Conversation",version:"1.3",supported,start,stop,toggle,speak,status};
})();

ASTRA.registerModule("voice",VoiceModule);
ASTRA.commands.push({trigger:"start voice",action:()=>VoiceModule.start()});
ASTRA.commands.push({trigger:"stop voice",action:()=>VoiceModule.stop()});
ASTRA.commands.push({trigger:"voice status",action:()=>AstraReply(JSON.stringify(VoiceModule.status()))});
console.log("ASTRA Voice Conversation v1.3 Loaded");
