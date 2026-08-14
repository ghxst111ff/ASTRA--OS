/* =========================================
   ASTRA SCREEN VIEW MODULE v2.2
   Screen capture + chart frame access + coach watch
========================================= */
const ScreenModule=(()=>{
    let stream=null;let video=null;let lastAnalysis=null;
    function panel(){return document.getElementById("screen")||document.getElementById("screenPanel");}
    function output(){return document.getElementById("screenOutput");}
    function open(){const screen=panel();if(!screen){AstraReply("Screen panel not found.");return false;}screen.style.display="block";screen.classList.add("active");return true;}
    function close(){stopCapture();const screen=panel();if(screen){screen.style.display="none";screen.classList.remove("active");}AstraReply("Screen view closed.");}
    async function startCapture(){
        if(!navigator.mediaDevices?.getDisplayMedia){AstraReply("Screen capture is not supported by this browser.");return false;}
        open();
        try{
            stopCapture();stream=await navigator.mediaDevices.getDisplayMedia({video:{cursor:"always"},audio:false});
            video=document.createElement("video");video.autoplay=true;video.playsInline=true;video.muted=true;video.style.width="100%";video.style.maxHeight="70vh";video.style.objectFit="contain";video.style.background="#000";video.srcObject=stream;
            const target=output();if(target){target.innerHTML="";target.appendChild(video);}
            const track=stream.getVideoTracks()[0];if(track)track.addEventListener("ended",()=>{stopCapture(false);if(target)target.innerHTML="Screen sharing stopped.";});
            AstraReply("Screen sharing connected.");
            ASTRA.modules.coach?.startObserver?.(12000);
            return true;
        }catch(error){console.error("ASTRA screen capture:",error);AstraReply("Screen sharing was cancelled or blocked.");return false;}
    }
    function stopCapture(reply=true){
        ASTRA.modules.coach?.stopObserver?.();
        if(stream){stream.getTracks().forEach(track=>track.stop());stream=null;}
        if(video){video.srcObject=null;video.remove();video=null;}
        if(reply)AstraReply("Screen sharing stopped.");
    }
    function getFrame(options={}){if(!video||video.readyState<2||!video.videoWidth)return null;const canvas=document.createElement("canvas");const maxWidth=Number(options.maxWidth||1280);const scale=Math.min(1,maxWidth/video.videoWidth);canvas.width=Math.round(video.videoWidth*scale);canvas.height=Math.round(video.videoHeight*scale);const ctx=canvas.getContext("2d");ctx.drawImage(video,0,0,canvas.width,canvas.height);return canvas.toDataURL("image/jpeg",Number(options.quality||0.55));}
    function status(){AstraReply(stream?"Screen sharing is active.":"Screen sharing is inactive.");}
    function analyze(candles){const data=Array.isArray(candles)?candles:(ASTRA.modules.marketData?.getCandles?.()||[]);if(data.length<3)return{ready:false,reason:"At least 3 candles are required.",candles:data.length};const recent=data.slice(-Math.min(20,data.length));const first=recent[0].close;const last=recent[recent.length-1].close;const midpoint=recent.reduce((sum,c)=>sum+c.close,0)/recent.length;const highs=recent.map(c=>c.high);const lows=recent.map(c=>c.low);const high=Math.max(...highs),low=Math.min(...lows),previousHigh=Math.max(...highs.slice(0,-1)),previousLow=Math.min(...lows.slice(0,-1));let direction="NEUTRAL";if(last>first&&last>midpoint)direction="BULLISH";if(last<first&&last<midpoint)direction="BEARISH";const structureShift=last>previousHigh?"BULLISH SHIFT":last<previousLow?"BEARISH SHIFT":"NO CLEAR SHIFT";lastAnalysis={ready:true,direction,structure:structureShift,range:{high,low},liquidity:{buySide:high,sellSide:low},candles:recent.length,lastClose:last,timestamp:new Date().toISOString()};ASTRA.modules.coach?.screenObservation?.();return{...lastAnalysis};}
    function getAnalysis(){return lastAnalysis?{...lastAnalysis}:null;}
    function showAnalysis(){const result=analyze();if(!result.ready){AstraReply("Screen analysis is waiting for market data.");return result;}AstraReply(`Direction: ${result.direction}. Structure: ${result.structure}.`);return result;}
    return{name:"Screen View",version:"2.2",open,close,startCapture,stopCapture,getFrame,status,analyze,getAnalysis,get sharing(){return!!stream;},commands:[{trigger:"open screen",action:open},{trigger:"close screen",action:close},{trigger:"screen status",action:status},{trigger:"share screen",action:startCapture},{trigger:"stop screen",action:stopCapture},{trigger:"screen analysis",action:showAnalysis}]};
})();
ASTRA.registerModule("screen",ScreenModule);ScreenModule.commands.forEach(command=>ASTRA.commands.push(command));console.log("ASTRA Screen View v2.2 Loaded");
