
/* =========================================
   ASTRA MODULE FACTORY v1.0
========================================= */

const ModuleFactory = {


    create(update){


        const module = {


            name:update.module,

            feature:update.feature,

            version:update.version || "1.0",


            components:[

                "Core Logic",

                "Commands",

                "Memory Connection",

                "Context Connection"

            ],


            status:"generated",


            created:
            new Date().toLocaleString()

        };


        let modules =
        JSON.parse(
            localStorage.getItem("ASTRA_MODULES")
        ) || [];


        modules.push(module);


        localStorage.setItem(
            "ASTRA_MODULES",
            JSON.stringify(modules)
        );


        AstraReply(

`MODULE CREATED

Name:
${module.name}

Feature:
${module.feature}

Components:
${module.components.join(", ")}

Status:
Generated`

        );


        return module;

    }


};


ASTRA.registerModule(
    "factory",
    ModuleFactory
);

console.log(
"ASTRA Module Factory Loaded"
);


