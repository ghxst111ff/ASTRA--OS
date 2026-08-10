/* =========================================
   ASTRA SYSTEM VERIFIER v1.0
========================================= */

const SystemVerifier = {

    verify(feature){

        let checks = [];
        let passed = true;

        // Check update exists
        const update =
            ASTRA.modules.updates.updates.find(
                item =>
                    item.feature
                        .toLowerCase()
                        .includes(feature.toLowerCase())
            );

        if(update){
            checks.push("Update record found ✅");
        } else {
            checks.push("Update record missing ❌");
            passed = false;
        }

        // Check module exists
        if(
            update &&
            update.module &&
            ASTRA.modules[update.module]
        ){
            checks.push("Module connected ✅");
        } else {
            checks.push("Module missing ❌");
            passed = false;
        }

        // Check command system
        if(
            ASTRA.modules.command &&
            typeof ASTRA.modules.command.process === "function"
        ){
            checks.push("Command router connected ✅");
        } else {
            checks.push("Command router missing ❌");
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

ASTRA.registerModule(
    "verifier",
    SystemVerifier
);

console.log(
    "ASTRA System Verifier Loaded"
);
