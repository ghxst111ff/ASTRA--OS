
/* =========================================
   ASTRA BUILD EXECUTOR v2.1
========================================= */

const BuildExecutor = {


    // Validate generated JavaScript without executing it.
    // This gives the build pipeline a real pre-install test
    // while keeping generated code behind the approval gate.
    validate(code){

        if(!code || typeof code !== "string"){
            return {
                passed:false,
                error:"Generated code is missing."
            };
        }

        try{

            new Function(code);

            return {
                passed:true,
                error:null
            };

        }catch(error){

            return {
                passed:false,
                error:error.message
            };

        }

    },


    execute(update, code){


        let builds =
        JSON.parse(
            localStorage.getItem("ASTRA_BUILDS")
        ) || [];


        const validation =
            code.files.every(
                file =>
                    this.validate(file.code).passed
            );


        const build = {


            feature:update.feature,

            module:update.module,

            files:code.files,

            status:validation ? "tested" : "failed",

            test:validation ? "passed" : "failed",

            date:
            new Date().toLocaleString()


        };



        builds.push(build);



        localStorage.setItem(
            "ASTRA_BUILDS",
            JSON.stringify(builds)
        );


        if(!validation){

            AstraReply(
`BUILD TEST FAILED

Feature:
${build.feature}

Module:
${build.module}

Status:
FAILED`
            );

            return build;

        }


        AstraReply(

`BUILD ARTIFACT CREATED

Feature:
${build.feature}

Module:
${build.module}

Files Generated:
${build.files.length}

Test:
PASSED

Status:
READY FOR APPROVAL`

        );



        return build;


    }


};

ASTRA.registerModule(
    "executor",
    BuildExecutor
);

console.log(
"ASTRA Build Executor v2.1 Loaded"
);