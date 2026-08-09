
/* =========================================
   ASTRA BUILD MEMORY SYSTEM v1.0
========================================= */

const BuildMemory = {


    history:

    JSON.parse(
        localStorage.getItem(
            "ASTRA_BUILD_MEMORY"
        )
    ) || [],



    saveBuild(build){


        this.history.push({

            feature: build.feature,

            module: build.module,

            files: build.files,

            status: build.status,

            date:
            new Date().toLocaleString()

        });


        localStorage.setItem(
            "ASTRA_BUILD_MEMORY",
            JSON.stringify(this.history)
        );


    },



    getHistory(){

        return this.history;

    },



    find(feature){

        return this.history.filter(
            item =>
            item.feature
            .toLowerCase()
            .includes(
                feature.toLowerCase()
            )
        );

    }


};


ASTRA.registerModule(
    "buildMemory",
    BuildMemory
);
;


console.log(
"ASTRA Build Memory Loaded"
);
