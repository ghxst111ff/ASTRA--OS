/* =========================================
   ASTRA AI GATEWAY v2.4
   Text + automatic shared-screen vision
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
        const context=Object.assign({},ASTRA.modules.context?.build?.()||{},extra.context||{}, {
            astraResponseStyle:{
                priority:"precise, simple, short",
                maxParagraphs:3,
                preferBullets:true,
                avoidUnnecessaryExplanation:true,
                answerQuestionDirectly:true
            }
        });

        // If the user is sharing a screen, every normal conversation turn
        // can use the current frame. This keeps ASTRA genuinely aware of
        // the shared chart instead of requiring a special command.
        let image=extra.image||null;
        let vision=!!extra.vision;
        if(!image && ASTRA.modules.screen?.sharing && ASTRA.modules.screen?.getFrame){
            image=ASTRA.modules.screen.getFrame({maxWidth:1280,quality:0.55});
            if(image){
                vision=true;
                context.screenContext={
                    shared:true,
                    frameAttached:true,
                    instruction:"The attached image is the user's current shared screen. Inspect it directly. Never say you cannot see the screen when an image is attached. Only describe what is visibly supported."
                };
            }
        }

        const payload={question:userMessage,context};
        if(image)payload.image=image;
        if(vision)payload.vision=true;
        const api=ASTRA.modules.api;
        if(!api?.status?.().configured){
            console.log("AI PAYLOAD",payload);
            AstraReply("AI Gateway ready. Configure ASTRA.modules.api first.");
            return {configured:false,payload};
        }
        try{
            const data=await api.request("",{method:"POST",body:JSON.stringify(payload)});
            const answer=this.extractAnswer(data); AstraReply(answer);
            return {configured:true,data,answer,vision:!!image};
        }catch(error){
            console.error("ASTRA AI API:",error); AstraReply("API request failed: "+error.message);
            return {configured:true,error:error.message};
        }
    }
};
ASTRA.registerModule("ai",AIGateway);
console.log("ASTRA AI Gateway v2.4 Loaded");
