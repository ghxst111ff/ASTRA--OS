/* =========================
   ASTRA COMMAND ROUTER
   Canonical command + natural-language boundary
========================= */

ASTRA.modules.command = {

    registerCommand(trigger, action){
        ASTRA.registerCommand(trigger, action);
    },

    showView(panel, open = true){
        const name = String(panel || "").toLowerCase().trim();

        if (typeof window.ASTRAShowView === "function") {
            window.ASTRAShowView(name);
            return true;
        }

        const view =
            document.getElementById(`view-${name}`) ||
            document.getElementById(name);

        if (!view) return false;

        view.classList.toggle("active-view", open);
        view.classList.toggle("active", open);
        return true;
    },

    process(command){
        const rawCommand = String(command ?? "").trim();
        const lowerCommand = rawCommand.toLowerCase().trim();

        if (!lowerCommand) return false;

        // UNIVERSAL NATURAL LANGUAGE ROUTING
        if (ASTRA.modules.naturalIntent?.handle?.(rawCommand)) return true;

        // SYSTEM COMMANDS retained from the legacy command router.
        if (lowerCommand === "astra version") {
            AstraReply(`ASTRA version ${ASTRA.version}`);
            return true;
        }

        if (lowerCommand === "astra modules") {
            AstraReply(
                `Loaded modules: ${Object.keys(ASTRA.modules).join(", ")}`
            );
            return true;
        }

        const registeredCommand = ASTRA.commands.find(
            cmd => cmd.trigger === lowerCommand
        );

        if (registeredCommand) {
            registeredCommand.action(rawCommand);
            return true;
        }

        if (lowerCommand.startsWith("approve ")) {
            const feature = rawCommand.replace(/^approve /i, "").trim();
            ASTRA.modules.updates?.approve?.(feature);
            return true;
        }

        if (lowerCommand.startsWith("install ")) {
            const feature = rawCommand.replace(/^install /i, "").trim();
            ASTRA.modules.installer?.install?.(feature);
            return true;
        }

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

        if (lowerCommand.startsWith("activate ")) {
            const feature = rawCommand.replace(/^activate /i, "").trim();
            ASTRA.modules.activator?.activate?.(feature);
            return true;
        }

        // ASTRA BUILD REQUESTS
        if (
            lowerCommand.includes("add") ||
            lowerCommand.includes("create") ||
            lowerCommand.includes("build feature")
        ) {
            const update = ASTRA.modules.updateAnalyzer?.analyze?.(rawCommand);
            if (!update) return false;

            const plan = ASTRA.modules.buildPlanner?.plan?.(update);
            const code = ASTRA.modules.codeGenerator?.generate?.(update);

            if (ASTRA.modules.factory?.create) {
                ASTRA.modules.factory.create(update);
            }

            if (code && ASTRA.modules.executor?.execute) {
                ASTRA.modules.executor.execute(update, code);
            }

            ASTRA.modules.updates?.register?.(update);

            AstraReply(`
BUILD PLAN

Feature:
${update.feature}

Module:
${update.module}

Version:
${update.version}

Changes:
${update.changes}

Priority:
${update.priority || plan?.priority || "normal"}

Status:
Awaiting Approval

Type:
Approve ${update.feature}
`);
            return true;
        }

        // MODE COMMANDS
        if (lowerCommand.includes("build mode")) {
            ASTRA.modules.mode?.setMode?.("BUILD");
            return true;
        }

        if (
            lowerCommand.includes("backtesting mode") ||
            lowerCommand.includes("backtest mode")
        ) {
            ASTRA.modules.modeSwitcher?.switch?.("BACKTEST");
            return true;
        }

        if (lowerCommand.includes("trading mode")) {
            ASTRA.modules.mode?.setMode?.("TRADING");
            return true;
        }

        // BUILD MODE
        const mode = ASTRA.modules.mode?.getMode?.();
        if (mode === "BUILD") {
            if (
                lowerCommand.includes("add") ||
                lowerCommand.includes("create") ||
                lowerCommand.includes("build")
            ) {
                const update = ASTRA.modules.updateAnalyzer?.analyze?.(rawCommand);
                const plan = ASTRA.modules.buildPlanner?.plan?.(update);
                const code = ASTRA.modules.codeGenerator?.generate?.(update);

                ASTRA.modules.updates?.register?.(update);

                AstraReply(`
BUILD PLAN

Feature:
${plan.feature}

Module:
${plan.module}

Priority:
${plan.priority}

Files:
${plan.estimatedFiles.join(", ")}

Generated Files:
${(code.files || []).map(file => file.name).join(", ")}

Status:
${plan.status}

Type:
Approve ${plan.feature}
`);
                return true;
            }
        }

        // Open-ended conversation / AI fallback.
        if (ASTRA.modules.ai?.ask) {
            ASTRA.modules.ai.ask(rawCommand);
            return true;
        }

        AstraReply("I don't recognize that command yet.");
        return false;
    }
};

ASTRA.registerModule("command", ASTRA.modules.command);

console.log("ASTRA Command Router Loaded");
