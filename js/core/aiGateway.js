/* =========================================
   ASTRA AI GATEWAY v2.2
   Text + optional chart-frame vision payloads
========================================= */
const AIGateway={
    extractAnswer(data){
        if(typeof data==="string")return data;
        if(data?.answer)return data.answer;
        if(data?.message)return data.message;
        const response=data?.response||data;
        if(typeof response==="string")return response;
        if(response?.output_text)return response.output_text;
        const output=response?.output;
        if(Array.isArray(output)){
            const text=output.flatMap(item=>Array.isArray(item?.content)?item.content:[])
                .filter(item=>item?.type==="output_text"&&typeof item?.text==="string")
                .map(item=>item.text).join("\n");
            if(text)return text;
        }
        return JSON.stringify(data);
    },
    async ask(userMessage, extra={}){
        const context=Object.assign({},ASTRA.modules.context?.build?.()||{},extra.context||{});
        const payload={question:userMessage,context};
        if(extra.image)payload.image=extra.image;
        if(extra.vision)payload.vision=true;
        const api=ASTRA.modules.api;
        if(!api?.status?.().configured){
            console.log("AI PAYLOAD",payload);
            AstraReply("AI Gateway ready. Configure ASTRA.modules.api first.");
            return {configured:false,payload};
        }
        try{
            const data=await api.request("",{method:"POST",body:JSON.stringify(payload)});
            const answer=this.extractAnswer(data); AstraReply(answer);
            return {configured:true,data,answer};
        }catch(error){
            console.error("ASTRA AI API:",error); AstraReply("API request failed: "+error.message);
            return {configured:true,error:error.message};
        }
    }
};
ASTRA.registerModule("ai",AIGateway);
console.log("ASTRA AI Gateway v2.2 Loaded");
