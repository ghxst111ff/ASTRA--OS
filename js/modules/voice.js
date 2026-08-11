/* =========================================
   ASTRA VOICE / CONVERSATION MODULE v1.2
   Continuous browser speech recognition
========================================= */
const VoiceModule=(()=>{
    const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
    let recognition=null,listening=false,speaking=false,restarting=false;
    let restartTimer=null;

    function supported(){return !!Recognition;}

    function clearRestart(){
        if(restartTimer){clearTimeout(restartTimer);restartTimer=null;}
        restarting=false;
    }

    function scheduleRestart(delay=300){
        if(!listening||speaking||restarting||!recognition)return;
        restarting=true;
        restartTimer=setTimeout(()=>{
            restartTimer=null;
            restarting=false;
            if(!listening||speaking||!recognition)return;
            try{recognition.start();}
            catch(error){scheduleRestart(700);}
        },delay);
    }

    function speak(text){
        if(!listening||!window.speechSynthesis||!text)return false;
        try{
            window.speechSynthesis.cancel();
            if(recognition){try{recognition.stop();}catch(error){}}
            const clean=String(text).replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
            const utterance=new SpeechSynthesisUtterance(clean);
            utterance.rate=1;
            utterance.pitch=1;
            utterance.onstart=()=>{speaking=true;};
            utterance.onend=()=>{
                speaking=false;
                if(listening&&recognition)scheduleRestart(250);
            };
            utterance.onerror=()=>{
                speaking=false;
                if(listening&&recognition)scheduleRestart(250);
            };
            window.speechSynthesis.speak(utterance);
            return true;
        }catch(error){
            console.error("ASTRA voice output:",error);
            speaking=false;
            return false;
        }
    }

    function start(){
        if(!supported()){
            AstraReply("Continuous voice recognition is not supported by this browser.");
            return false;
        }
        if(listening)return true;

        clearRestart();
        recognition=new Recognition();
        recognition.continuous=true;
        recognition.interimResults=false;
        recognition.lang="en-US";

        recognition.onresult=(event)=>{
            for(let i=event.resultIndex;i<event.results.length;i++){
                if(!event.results[i].isFinal)continue;
                const text=event.results[i][0].transcript.trim();
                if(!text)continue;
                ASTRA.modules.response?.user?.(text);
                ASTRA.modules.command?.process?.(text);
            }
        };

        recognition.onerror=(event)=>{
            console.warn("ASTRA voice recognition:",event.error);
            if(listening && event.error !== "not-allowed" && event.error !== "service-not-allowed"){
                scheduleRestart(350);
            }
        };

        recognition.onend=()=>{
            if(listening && !speaking)scheduleRestart(250);
        };

        try{
            listening=true;
            recognition.start();
            AstraReply("Continuous conversation mode is on.");
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
        AstraReply("Continuous conversation mode is off.");
    }

    function toggle(){return listening?(stop(),false):start();}
    function status(){return {supported:supported(),listening,speaking,restarting};}

    return {name:"Voice Conversation",version:"1.2",supported,start,stop,toggle,speak,status};
})();

ASTRA.registerModule("voice",VoiceModule);
ASTRA.commands.push({trigger:"start voice",action:()=>VoiceModule.start()});
ASTRA.commands.push({trigger:"stop voice",action:()=>VoiceModule.stop()});
ASTRA.commands.push({trigger:"voice status",action:()=>AstraReply(JSON.stringify(VoiceModule.status()))});
console.log("ASTRA Voice Conversation v1.2 Loaded");
