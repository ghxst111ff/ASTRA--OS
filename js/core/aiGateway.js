/* =========================================
   ASTRA AI GATEWAY v2.0
   Uses configurable API connection when available
========================================= */
const AIGateway={
    async ask(userMessage){
        const context=ASTRA.modules.context?.build?.()||{};
        const payload={question:userMessage,context};
        const api=ASTRA.modules.api;
        if(!api?.status?.().configured){
            console.log("AI PAYLOAD",payload);
            AstraReply("AI Gateway ready. Configure ASTRA.modules.api first.");
            return {configured:false,payload};
        }
        try{
            const data=await api.request("",{method:"POST",body:JSON.stringify(payload)});
            const answer=data?.answer??data?.response??data?.message??JSON.stringify(data);
            AstraReply(answer);
            return {configured:true,data};
        }catch(error){
            console.error("ASTRA AI API:",error);
            AstraReply("API request failed: "+error.message);
            return {configured:true,error:error.message};
        }
    }
};
ASTRA.registerModule("ai",AIGateway);
console.log("ASTRA AI Gateway v2.0 Loaded");
