/* =========================================
   ASTRA AI GATEWAY v2.6
   Coach-first + trading-system-aware
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
    getTradingSystem(){
        const t=ASTRA.modules.trading?.strategy;
        if(!t)return null;
        return {
            name:ASTRA.modules.trading.name,
            philosophy:t.philosophy,
            framework:t.framework,
            rules:t.rules,
            execution:t.framework?.execution,
            higherTimeframe:t.framework?.higherTimeframe,
            fractalScaling:t.framework?.fractalScaling
        };
    },
    isTradingContext(message,extra={}){
        const text=String(message||"").toLowerCase();
        return !!(extra.trading||extra.analysis||extra.backtest||extra.liveTrading||
            /\b(trad|trade|trading|chart|market|setup|entry|exit|liquidity|supply|demand|structure|timeframe|backtest|forex|pair|position|stop|target|risk)\b/.test(text));
    },
    async ask(userMessage, extra={}){
        const tradingContext=this.isTradingContext(userMessage,extra);
        const context=Object.assign({},ASTRA.modules.context?.build?.()||{},extra.context||{}, {
            astraResponseStyle:{
                role:"70% trading coach, 30% assistant",
                tone:"natural, calm, direct, conversational",
                priority:"short, precise, simple",
                vocabulary:"plain everyday words; avoid jargon and big words unless the user uses them first",
                length:"usually 1-4 short sentences; use bullets only when they make the answer clearer",
                coaching:"guide the user, point out mistakes, ask one useful question when needed, and say what to do next",
                liveTrading:"act like a calm trading coach beside the user; do not lecture; focus on what matters right now",
                backtesting:"talk naturally about the setup, rule, result, and lesson; keep live trading and backtesting separate",
                analysis:"notice visible things and call them out briefly; do not invent anything",
                conversation:"respond like a person speaking naturally, not like a report",
                avoid:"long introductions, repeated disclaimers, formal sections, filler, unnecessary explanations",
                answerQuestionDirectly:true
            }
        });

        if(tradingContext){
            const system= this.getTradingSystem();
            context.tradingSystem={
                loaded:true,
                source:"ASTRA.modules.trading.strategy",
                instruction:"Use this trading system as the user's source of truth for trading questions. Do not replace it with a generic strategy. Before giving trading analysis, compare what is visible or described against this system. Keep live trading and backtesting separate.",
                system
            };
        }

        let image=extra.image||null;
        let vision=!!extra.vision;
        if(!image && ASTRA.modules.screen?.sharing && ASTRA.modules.screen?.getFrame){
            image=ASTRA.modules.screen.getFrame({maxWidth:1280,quality:0.55});
            if(image){
                vision=true;
                context.screenContext={shared:true,frameAttached:true,instruction:"Inspect the attached current screen directly. Never claim you cannot see the screen when an image is attached. Only describe what is visible."};
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
            return {configured:true,data,answer,vision:!!image,tradingContext};
        }catch(error){
            console.error("ASTRA AI API:",error); AstraReply("I hit a connection problem. Try that again.");
            return {configured:true,error:error.message};
        }
    }
};
ASTRA.registerModule("ai",AIGateway);
console.log("ASTRA AI Gateway v2.6 Loaded");
