
/* =========================================
   ASTRA INSTALLER
========================================= */

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

        return false;

    }

    if(update.status !== "approved"){

        console.log("FOUND UPDATE:", update);

        AstraReply(
            "This update must be approved first."
        );

        return false;

    }

    // VERIFY BEFORE INSTALLING
    const verified =
        ASTRA.modules.verifier.verify(
            update.feature
        );

    if(!verified){

        AstraReply(
            "Installation blocked. Verification failed ❌"
        );

        return false;

    }

    // Only install after verification passes
    ASTRA.modules.updates.install(
        feature
    );

    AstraReply(
        "Installation completed successfully ✅"
    );

    return true;

}
ASTRA.registerModule(
    "installer",
    Installer
);

console.log(
"ASTRA Installer Loaded"
);

