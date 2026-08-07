
/* =========================================
   ASTRA INSTALLER
========================================= */

const Installer = {

    install(feature){
      
console.log("INSTALL REQUEST:", feature);
      
        const update =
ASTRA.modules.updates.updates.find(
    item =>
    item.feature
    .toLowerCase()
    .includes(
        feature.toLowerCase()
    )
);

        if(!update){

            AstraReply("Update not found.");

            return;

        }

        if(update.status !== "approved"){
          
console.log("FOUND UPDATE:", update);
            AstraReply(
                "This update must be approved first."
            );

            return;

        }

        ASTRA.modules.updates.install(feature);

        ASTRA.modules.verifier.verify(
update.feature
);

    }

};

ASTRA.registerModule(
    "installer",
    Installer
);

console.log(
"ASTRA Installer Loaded"
);

