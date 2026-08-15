/* =========================================
   ASTRA SYSTEM VERIFIER v1.1
   Installation gate + verification bridge
========================================= */

const SystemVerifier = {

    verify(feature){
        const checks = [];
        let passed = true;

        const updates = ASTRA.modules.updates?.updates || [];
        const update = updates.find(item =>
            String(item.feature || "")
                .toLowerCase()
                .includes(String(feature || "").toLowerCase())
        );

        if (!update) {
            checks.push("Update record missing ❌");
            passed = false;
        } else {
            checks.push("Update record found ✅");
        }

        const moduleName = update?.module;
        const module = moduleName ? ASTRA.modules[moduleName] : null;

        if (module) {
            checks.push("Module connected ✅");
        } else {
            checks.push("Module missing ❌");
            passed = false;
        }

        if (
            ASTRA.modules.command &&
            typeof ASTRA.modules.command.process === "function"
        ) {
            checks.push("Command router connected ✅");
        } else {
            checks.push("Command router missing ❌");
            passed = false;
        }

        // Appendix J requires verification before activation/installation.
        // Bridge the system-level gate to the canonical Verification Engine.
        if (passed && ASTRA.modules.verification?.verify) {
            const result = ASTRA.modules.verification.verify(moduleName);

            if (result?.passed) {
                checks.push("Verification Engine passed ✅");
            } else {
                checks.push("Verification Engine failed ❌");
                passed = false;
            }
        } else if (passed) {
            checks.push("Verification Engine unavailable ❌");
            passed = false;
        }

        AstraReply(
`SYSTEM VERIFICATION

Feature:
${feature}

${checks.join("<br>")}

Status:
${passed ? "VERIFIED ✅" : "FAILED ❌"}`
        );

        return passed;
    }
};

ASTRA.registerModule("verifier", SystemVerifier);

console.log("ASTRA System Verifier v1.1 Loaded");
