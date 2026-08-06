
/* =========================================
   ASTRA v2.0 MEMORY MODULE
========================================= */


const MemoryModule = {


    name:"Memory System",

    version:"2.0",



    database:
    JSON.parse(
        localStorage.getItem("ASTRA_MEMORY")
    )
    ||
    {

        notes:[],

        knowledge:{},

        preferences:{},

        created:
        new Date().toLocaleString()

    },



    save(){

        localStorage.setItem(
            "ASTRA_MEMORY",
            JSON.stringify(this.database)
        );

    },



    remember(info){


        this.database.notes.push({

            data:info,

            date:
            new Date().toLocaleString()

        });



        this.save();



        AstraReply(
            "Memory saved."
        );

    },



    getMemories(){

        return this.database.notes;

    },



    show(){

        let count =
        this.database.notes.length;



        AstraReply(

        `
        🧠 ASTRA MEMORY

        Saved Memories:
        ${count}

        `

        );

    },



    savePreference(key,value){


        this.database.preferences[key]=value;


        this.save();



        AstraReply(
            "Preference saved."
        );

    },



    saveKnowledge(topic,data){


        this.database.knowledge[topic]=data;


        this.save();



        AstraReply(
            "Knowledge saved."
        );

    }

};



ASTRA.registerModule(
"memory",
MemoryModule
);

