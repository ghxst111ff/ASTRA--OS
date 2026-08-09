
/* =========================================
   ASTRA BACKUP SYSTEM v2.0
========================================= */

const BackupModule = {

    create(){

        const backup = {

            version:"ASTRA_BACKUP_V2.0",

            date:
            new Date().toISOString(),

            mode:
            localStorage.getItem("ASTRA_MODE") || "TRADING",

            databases:{

                memory:
                JSON.parse(
                    localStorage.getItem("ASTRA_MEMORY")
                ) || {},


                journal:
                JSON.parse(
                    localStorage.getItem("ASTRA_JOURNAL")
                ) || {},


                performance:
                JSON.parse(
                    localStorage.getItem("ASTRA_PERFORMANCE")
                ) || {},


                updates:
                JSON.parse(
                    localStorage.getItem("ASTRA_UPDATES")
                ) || {}

            }

        };


        localStorage.setItem(
            "ASTRA_BACKUP_V2.0",
            JSON.stringify(backup)
        );


        AstraReply(
            "ASTRA backup V2.0 created successfully."
        );


    },


    restore(){

        const backup =
        JSON.parse(
            localStorage.getItem("ASTRA_BACKUP_V2.0")
        );


        if(!backup){

            AstraReply(
                "No ASTRA backup found."
            );

            return;

        }


        AstraReply(
            "Backup found from " + backup.date
        );

    }


};


ASTRA.registerModule(
    "backup",
    BackupModule
);

console.log(
"ASTRA Backup System Loaded"
);
