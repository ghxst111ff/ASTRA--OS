
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
                .includes(feature.toLowerCase())
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

    // Find the most recent tested build artifact
    const builds =
        JSON.parse(
            localStorage.getItem("ASTRA_BUILDS")
        ) || [];

    const build =
        [...builds].reverse().find(
            item =>
                item.feature === update.feature &&
                item.module === update.module &&
                item.test === "passed" &&
                item.status === "tested"
        );

    if(!build){

        AstraReply(
            "Installation blocked. No tested build artifact found."
        );

        return false;

    }

    // Load the tested generated code
    try{

        build.files.forEach(file => {

            if(
                !file ||
                typeof file.code !== "string"
            ){

                throw new Error(
                    "Invalid generated file."
                );

            }

            new Function(file.code)();

        });

    }catch(error){

        console.error(
            "INSTALL LOAD FAILED:",
            error
        );

        AstraReply(
            "Installation blocked. Generated module failed to load."
        );

        return false;

    }

    // Make sure the generated module registered correctly
    if(!ASTRA.modules[update.module]){

        AstraReply(
            "Installation blocked. Module registration failed."
        );

        return false;

    }

    // Verify AFTER loading the generated module
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

