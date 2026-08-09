
/* =========================================
   ASTRA BUILD PLANNER
========================================= */

const BuildPlanner = {

    plan(update){

        return {

            feature:update.feature,

            module:update.module,

            version:update.version,

            priority:update.priority || "normal",

            estimatedFiles:[

                "Module",

                "Commands",

                "Context Engine",

                "UI"

            ],

            status:"Awaiting Approval"

        };

    }

};
ASTRA.registerModule(
    "buildPlanner",
    BuildPlanner
);

console.log(
"ASTRA Build Planner Loaded"
);