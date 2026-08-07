
/* =========================================
   ASTRA BUILD EXECUTOR v2.0
========================================= */

const BuildExecutor = {


    execute(update, code){


        let builds =
        JSON.parse(
            localStorage.getItem("ASTRA_BUILDS")
        ) || [];



        const build = {


            feature:update.feature,

            module:update.module,

            files:code.files,

            status:"created",

            date:
            new Date().toLocaleString()


        };



        builds.push(build);



        localStorage.setItem(
            "ASTRA_BUILDS",
            JSON.stringify(builds)
        );



        AstraReply(

`BUILD ARTIFACT CREATED

Feature:
${build.feature}

Module:
${build.module}

Files Generated:
${build.files.length}

Status:
READY FOR ACTIVATION`

        );



        return build;


    }


};

ASTRA.registerModule(
    "executor",
    BuildExecutor
);

console.log(
"ASTRA Build Executor v2.0 Loaded"
);