
/* =========================================
   ASTRA DEPENDENCY MANAGER v1.0
========================================= */

const DependencyManager = {


    dependencies:{


        "Backtesting Mode":[

            "Journal",

            "Performance",

            "Context Engine"

        ],


        "Screen Intelligence":[

            "Vision System",

            "Context Engine"

        ],


        "Voice Assistant":[

            "Voice Engine",

            "Command Router"

        ]


    },


    check(feature){


        const needs =
        this.dependencies[feature]
        ||
        [];


        let result = {


            feature:feature,

            required:needs,

            missing:[],

            ready:true

        };



        needs.forEach(dep=>{


            // Check if ASTRA module exists

      const exists =
    ASTRA.modules[dep]
    ||
    (
        ASTRA.core &&
        ASTRA.core.modules &&
        ASTRA.core.modules.includes(dep)
    )
    ||
    localStorage.getItem(
        "ASTRA_" + dep.toUpperCase()
    );

            if(!exists){

                result.missing.push(dep);

                result.ready=false;

            }


        });



        return result;


    }


};


ASTRA.modules.dependencies =
DependencyManager;


console.log(
"ASTRA Dependency Manager Loaded"
);