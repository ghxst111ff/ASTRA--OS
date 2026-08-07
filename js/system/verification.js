
/* =========================================
   ASTRA VERIFICATION ENGINE v1.0
========================================= */

const VerificationModule = {

    name: "Verification Engine",

    version: "1.0",

    history: JSON.parse(
        localStorage.getItem("ASTRA_VERIFICATION")
    ) || [],


    verify(moduleName){

        const module =
        ASTRA.modules[moduleName];

        if(!module){

            return this.log(
                moduleName,
                false,
                "Module does not exist."
            );

        }


        let passed = true;

        const tests = [];


        // Module Name

        if(!module.name){

            passed = false;

            tests.push(
                "Missing module name."
            );

        }


        // Version

        if(!module.version){

            passed = false;

            tests.push(
                "Missing version."
            );

        }


        // Optional start()

        if(
            module.start &&
            typeof module.start !== "function"
        ){

            passed = false;

            tests.push(
                "Invalid start() function."
            );

        }


        if(
            passed &&
            tests.length === 0
        ){

            tests.push(
                "Verification successful."
            );

        }


        return this.log(

            moduleName,

            passed,

            tests.join("<br>")

        );

    },


    log(

        module,

        passed,

        report

    ){

        const result = {

            module,

            passed,

            report,

            date:
            new Date()
            .toLocaleString()

        };


        this.history.push(result);


        localStorage.setItem(

            "ASTRA_VERIFICATION",

            JSON.stringify(
                this.history
            )

        );


        console.log(

            "VERIFICATION",

            result

        );


        return result;

    },


    report(){

        return this.history;

    }

};


ASTRA.registerModule(

    "verification",

    VerificationModule

);
