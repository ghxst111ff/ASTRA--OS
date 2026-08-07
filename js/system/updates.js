
/* =========================================
   ASTRA v2.0 UPDATE MODULE
========================================= */


const UpdateModule = {


    name:"Update System",

    version:"2.0",



    updates:
    JSON.parse(
        localStorage.getItem("ASTRA_UPDATES")
    ) || [],



    history:
    JSON.parse(
        localStorage.getItem("ASTRA_UPDATE_HISTORY")
    ) || [],



    save(){

        localStorage.setItem(
            "ASTRA_UPDATES",
            JSON.stringify(this.updates)
        );


        localStorage.setItem(
            "ASTRA_UPDATE_HISTORY",
            JSON.stringify(this.history)
        );

    },



    register(update){

        const exists =
        this.updates.find(
            item =>
            item.feature === update.feature
        );


        if(exists){

            console.log(
                "Update already exists"
            );

            return;

        }



        this.updates.push({

            version:update.version,

            feature:update.feature,

            module:update.module,

            changes:update.changes,

            status:"pending",

            date:
            new Date().toLocaleString()

        });



        this.save();



        AstraReply(
            update.feature +
            " update registered."
        );

    },



    check(){

        if(this.updates.length===0){

            AstraReply(
                "ASTRA has no pending updates."
            );

            return;

        }



        let list =
        this.updates.map(
            item =>
            item.feature +
            " - " +
            item.status
        )
        .join("<br>");



        AstraReply(
            "ASTRA Updates:<br>" + list
        );

    },



    approve(feature){

        const update =
        this.updates.find(
            item =>
            item.feature
            .toLowerCase()
            .includes(
                feature.toLowerCase()
            )
        );


      
 
   

        if(!update){

            AstraReply(
                "Update not found."
            );

            return;

        }



        update.status="approved";

        this.save();



        AstraReply(
            update.feature +
            " approved."
        );

    },



    install(feature){

        const update =
        this.updates.find(
            item =>
            item.feature
            .toLowerCase()
            .includes(
                feature.toLowerCase()
            )
        );



        if(!update){

            AstraReply(
                "Update not found."
            );

            return;

        }



        if(update.status!=="approved"){

            AstraReply(
                "Approval required first."
            );

            return;

        }



        update.status="installed";



        this.history.push({

            feature:update.feature,

            version:update.version,

            date:
            new Date().toLocaleString()

        });



        this.save();



        AstraReply(
            update.feature +
            " installed successfully."
        );

    }

};



ASTRA.registerModule(
"updates",
UpdateModule
);

