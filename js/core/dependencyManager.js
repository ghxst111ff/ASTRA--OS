
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



        needs.forEach(dep => {

    const moduleAliases = {
        "Journal": "journal",
        "Performance": "performance",
        "Context Engine": "context"
    };

    const moduleName = moduleAliases[dep] || dep.toLowerCase();

    const exists =
        ASTRA.modules[moduleName]
        ||
        (
            ASTRA.core &&
            ASTRA.core.modules &&
            ASTRA.core.modules.includes(moduleName)
        )
        ||
        localStorage.getItem(
            "ASTRA_" + moduleName.toUpperCase()
        );

    if(!exists){
        result.missing.push(dep);
        result.ready = false;
    }

});

console.log(
"ASTRA Dependency Manager Loaded"
);