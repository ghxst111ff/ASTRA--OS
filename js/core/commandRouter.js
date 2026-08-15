/* =========================
   ASTRA COMMAND ROUTER
   Canonical command + natural-language boundary
   v4.0 — conversation first, exact commands are fallback
========================= */

ASTRA.modules.command = {

    registerCommand(trigger, action){ ASTRA.registerCommand(trigger, action); },

    showView(panel, open = true){
        const name = String(panel || "").toLowerCase().trim();
        const view = document.getElementById(`view-${name}`) || document.getElementById(name);
        if (!view) return false;
        if (open) {
            if (typeof window.ASTRAShowView === "function") window.ASTRAShowView(name);
            else {
                document.querySelectorAll(".view").forEach(item => item.classList.remove("active-view"));
                view.classList.add("active-view");
            }
        } else view.classList.remove("active-view", "active");
        return true;
    },

    ensureResearchModule(rawCommand){
        if (ASTRA.modules.research) return true;
        const text = String(rawCommand || "").toLowerCase();
        const hasQuestion = /(what|whats|what's|any|which|when|where|tell me|show me|give me|anything|why|is there|are there|should i know)/.test(text);
        const hasResearchSignal = /(news|headline|calendar|red folder|high impact|high-impact|coming out|coming up|upcoming|release|latest|today|tonight|this week|this month|announcement|economic|inflation|cpi|gdp|jobs|nfp|interest rate|central bank|catalyst|driver|moving|moved|important)/.test(text);
        const hasMarketOrCurrency = /(gbp|usd|eur|jpy|aud|cad|chf|nzd|pound|dollar|euro|yen|sterling|market|forex|fx|currency|trading|trade)/.test(text);
        if (!(hasQuestion && (hasResearchSignal || hasMarketOrCurrency))) return true;
        if (ASTRA.__researchLoading) return false;
        ASTRA.__researchLoading = true;
        const script = document.createElement("script");
        script.src = "js/modules/research.js?v=1.1";
        script.onload = () => { ASTRA.__researchLoading = false; this.process(rawCommand); };
        script.onerror = () => { ASTRA.__researchLoading = false; console.error("ASTRA research module failed to load."); };
        document.head.appendChild(script);
        return false;
    },

    process(command){
        const rawCommand = String(command ?? "").trim();
        const lowerCommand = rawCommand.toLowerCase().trim();
        if (!lowerCommand) return false;

        // Research is loaded from natural-language context, not from an exact command.
        if (!this.ensureResearchModule(rawCommand)) return true;

        // UNIVERSAL NATURAL LANGUAGE ROUTING — exact commands are not required.
        if (ASTRA.modules.naturalIntent?.handle?.(rawCommand)) return true;

        // SYSTEM COMMANDS retained for administrative/build operations.
        if (lowerCommand === "astra version") { AstraReply(`ASTRA version ${ASTRA.version}`); return true; }
        if (lowerCommand === "astra modules") { AstraReply(`Loaded modules: ${Object.keys(ASTRA.modules).join(", ")}`); return true; }

        const registeredCommand = ASTRA.commands.find(cmd => cmd.trigger === lowerCommand);
        if (registeredCommand) { registeredCommand.action(rawCommand); return true; }

        if (lowerCommand.startsWith("approve ")) { ASTRA.modules.updates?.approve?.(rawCommand.replace(/^approve /i, "").trim()); return true; }
        if (lowerCommand.startsWith("install ")) { ASTRA.modules.installer?.install?.(rawCommand.replace(/^install /i, "").trim()); return true; }

        const intent = ASTRA.modules.intent?.detect?.(rawCommand);
        if (intent?.action === "open") {
            const opened = this.showView(intent.panel, true);
            AstraReply(opened ? `${intent.panel} opened.` : `${intent.panel} view not found.`);
            return true;
        }
        if (intent?.action === "close") {
            const closed = this.showView(intent.panel, false);
            AstraReply(closed ? `${intent.panel} closed.` : `${intent.panel} view not found.`);
            return true;
        }

        if (lowerCommand.startsWith("activate ")) { ASTRA.modules.activator?.activate?.(rawCommand.replace(/^activate /i, "").trim()); return true; }

        // ASTRA BUILD REQUESTS remain explicit because they mutate the system.
        if (lowerCommand.includes("add") || lowerCommand.includes("create") || lowerCommand.includes("build feature")) {
            const update = ASTRA.modules.updateAnalyzer?.analyze?.(rawCommand);
            if (!update) return false;
            const plan = ASTRA.modules.buildPlanner?.plan?.(update);
            const code = ASTRA.modules.codeGenerator?.generate?.(update);
            if (ASTRA.modules.factory?.create) ASTRA.modules.factory.create(update);
            if (code && ASTRA.modules.executor?.execute) ASTRA.modules.executor.execute(update, code);
            ASTRA.modules.updates?.register?.(update);
            AstraReply(`\nBUILD PLAN\n\nFeature:\n${update.feature}\n\nModule:\n${update.module}\n\nVersion:\n${update.version}\n\nChanges:\n${update.changes}\n\nPriority:\n${update.priority || plan?.priority || "normal"}\n\nStatus:\nAwaiting Approval\n\nType:\nApprove ${update.feature}\n`);
            return true;
        }

        // MODE COMMANDS
        if (lowerCommand.includes("build mode")) { ASTRA.modules.mode?.setMode?.("BUILD"); return true; }
        if (lowerCommand.includes("backtesting mode") || lowerCommand.includes("backtest mode")) { ASTRA.modules.modeSwitcher?.switch?.("BACKTEST"); return true; }
        if (lowerCommand.includes("trading mode")) { ASTRA.modules.mode?.setMode?.("TRADING"); return true; }

        const mode = ASTRA.modules.mode?.getMode?.();
        if (mode === "BUILD" && (lowerCommand.includes("add") || lowerCommand.includes("create") || lowerCommand.includes("build"))) {
            const update = ASTRA.modules.updateAnalyzer?.analyze?.(rawCommand);
            const plan = ASTRA.modules.buildPlanner?.plan?.(update);
            const code = ASTRA.modules.codeGenerator?.generate?.(update);
            ASTRA.modules.updates?.register?.(update);
            AstraReply(`\nBUILD PLAN\n\nFeature:\n${plan.feature}\n\nModule:\n${plan.module}\n\nPriority:\n${plan.priority}\n\nFiles:\n${plan.estimatedFiles.join(", ")}\n\nGenerated Files:\n${(code.files || []).map(file => file.name).join(", ")}\n\nStatus:\n${plan.status}\n\nType:\nApprove ${plan.feature}\n`);
            return true;
        }

        // Open-ended conversation / AI fallback.
        if (ASTRA.modules.ai?.ask) { ASTRA.modules.ai.ask(rawCommand); return true; }
        AstraReply("I don't recognize that request yet.");
        return false;
    }
};

ASTRA.registerModule("command", ASTRA.modules.command);
console.log("ASTRA Command Router v4.0 Loaded — natural conversation first");
