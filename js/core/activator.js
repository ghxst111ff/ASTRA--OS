
/* =========================================
   ASTRA MODULE ACTIVATOR v1.0
========================================= */

const ModuleActivator = {


    activate(feature){

      const dependency =
ASTRA.modules.dependencies.check(feature);


if(!dependency.ready){

    AstraReply(

`ACTIVATION BLOCKED

Feature:
${feature}

Missing Dependencies:

${dependency.missing.join("<br>")}

Build these dependencies first.`

    );

    return;

}

        let modules =
        JSON.parse(
            localStorage.getItem("ASTRA_MODULES")
        ) || [];


        const module =
        modules.find(
            m =>
            m.feature
            .toLowerCase()
            .includes(
                feature.toLowerCase()
            )
        );


        if(!module){

            AstraReply(
                "Module not found."
            );

            return;

        }


        module.status = "active";
      
ASTRA.modules.connection.connect(
    module.feature
);
      
        module.activated =
        new Date().toLocaleString();


        localStorage.setItem(
            "ASTRA_MODULES",
            JSON.stringify(modules)
        );


        AstraReply(

`MODULE ACTIVATED

Feature:
${module.feature}

Module:
${module.name}

Status:
ACTIVE`

        );

    }

   
};


ASTRA.modules.activator =
ModuleActivator;


console.log(
"ASTRA Module Activator Loaded"
);