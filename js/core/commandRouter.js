/* =========================
   ASTRA COMMAND ROUTER
   Canonical conversation boundary
   v4.5 — reliable natural top-down checkpoint routing
========================= */

ASTRA.modules.command = {
    registerCommand(trigger, action){ ASTRA.registerCommand(trigger, action); },
    showView(panel, open = true){ const name=String(panel||"").toLowerCase().trim(),view=document.getElementById(`view-${name}`)||document.getElementById(name);if(!view)return false;if(open){if(typeof window.ASTRAShowView==="function")window.ASTRAShowView(name);else{document.querySelectorAll(".view").forEach(item=>item.classList.remove("active-view"));view.classList.add("active-view");}}else view.classList.remove("active-view","active");return true; },
    ensureResearchModule(rawCommand=""){if(ASTRA.modules.research)return true;if(ASTRA.__researchLoading)return false;ASTRA.__researchLoading=true;const script=document.createElement("script");script.src="js/modules/research.js?v=1.2";script.onload=()=>{ASTRA.__researchLoading=false;if(rawCommand)this.process(rawCommand);};script.onerror=()=>{ASTRA.__researchLoading=false;if(rawCommand&&ASTRA.modules.ai?.ask)ASTRA.modules.ai.ask(rawCommand);};document.head.appendChild(script);return false;},
    speakTopDownResult(result){const message=result?.message||result?.feedback;if(message)AstraReply(message);},
    process(command){
        const rawCommand=String(command??"").trim(),lowerCommand=rawCommand.toLowerCase();if(!lowerCommand)return false;
        const topDown=ASTRA.modules.topDownCoach;
        if(topDown?.handle){try{
            const result=topDown.handle(rawCommand);
            if(result&&typeof result.then==="function"){
                result.then(resolved=>{if(resolved?.handled||resolved?.started||resolved?.feedback||resolved?.message)this.speakTopDownResult(resolved);}).catch(error=>{console.error("ASTRA top-down checkpoint routing:",error);if(topDown.snapshot?.().active)AstraReply("I couldn't complete that checkpoint. Stay on this timeframe and say you're finished again.");});
                return true;
            }
            if(result?.started||result?.handled){this.speakTopDownResult(result);return true;}
            if(topDown.snapshot?.().active)return true;
        }catch(error){console.error("ASTRA top-down routing:",error);return true;}}
        if(!this.ensureResearchModule(rawCommand))return true;if(ASTRA.modules.naturalIntent?.handle?.(rawCommand))return true;
        if(lowerCommand==="astra version"){AstraReply(`ASTRA version ${ASTRA.version}`);return true;}if(lowerCommand==="astra modules"){AstraReply(`Loaded modules: ${Object.keys(ASTRA.modules).join(", ")}`);return true;}
        const registeredCommand=ASTRA.commands.find(cmd=>cmd.trigger===lowerCommand);if(registeredCommand){registeredCommand.action(rawCommand);return true;}if(lowerCommand.startsWith("approve ")){ASTRA.modules.updates?.approve?.(rawCommand.replace(/^approve /i,"").trim());return true;}if(lowerCommand.startsWith("install ")){ASTRA.modules.installer?.install?.(rawCommand.replace(/^install /i,"").trim());return true;}
        const intent=ASTRA.modules.intent?.detect?.(rawCommand);if(intent?.action==="open"){const opened=this.showView(intent.panel,true);AstraReply(opened?`${intent.panel} opened.`:`${intent.panel} view not found.`);return true;}if(intent?.action==="close"){const closed=this.showView(intent.panel,false);AstraReply(closed?`${intent.panel} closed.`:`${intent.panel} view not found.`);return true;}if(lowerCommand.startsWith("activate ")){ASTRA.modules.activator?.activate?.(rawCommand.replace(/^activate /i,"").trim());return true;}
        if(lowerCommand.includes("add")||lowerCommand.includes("create")||lowerCommand.includes("build feature")){const update=ASTRA.modules.updateAnalyzer?.analyze?.(rawCommand);if(!update)return false;const plan=ASTRA.modules.buildPlanner?.plan?.(update),code=ASTRA.modules.codeGenerator?.generate?.(update);if(ASTRA.modules.factory?.create)ASTRA.modules.factory.create(update);if(code&&ASTRA.modules.executor?.execute)ASTRA.modules.executor.execute(update,code);ASTRA.modules.updates?.register?.(update);AstraReply(`BUILD PLAN\n\nFeature:\n${update.feature}\n\nModule:\n${update.module}\n\nVersion:\n${update.version}\n\nChanges:\n${update.changes}\n\nPriority:\n${update.priority||plan?.priority||"normal"}\n\nStatus:\nAwaiting Approval`);return true;}
        if(lowerCommand.includes("build mode")){ASTRA.modules.mode?.setMode?.("BUILD");return true;}if(lowerCommand.includes("backtesting mode")||lowerCommand.includes("backtest mode")){ASTRA.modules.modeSwitcher?.switch?.("BACKTEST");return true;}if(lowerCommand.includes("trading mode")){ASTRA.modules.mode?.setMode?.("TRADING");return true;}
        if(ASTRA.modules.ai?.ask){ASTRA.modules.ai.ask(rawCommand);return true;}AstraReply("I don't recognize that request yet.");return false;
    }
};
ASTRA.registerModule("command",ASTRA.modules.command);console.log("ASTRA Command Router v4.5 Loaded — top-down checkpoints reliably returned");