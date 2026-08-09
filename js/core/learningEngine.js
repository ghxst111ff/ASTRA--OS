/* =========================================
   ASTRA LEARNING ENGINE v1.0
========================================= */

const LearningEngine = {

    learn(type, data){

        const key = "ASTRA_LEARNING";

        let database = [];

        try{

            database =
                JSON.parse(
                    localStorage.getItem(key)
                ) || [];

        }catch{

            database = [];

        }

        if(!Array.isArray(database)){
            database = [];
        }

        database.push({

            time: new Date().toISOString(),

            type: type,

            data: data

        });

        localStorage.setItem(
            key,
            JSON.stringify(database)
        );

    }

};


ASTRA.registerModule(
    "learning",
    LearningEngine
);

console.log(
    "ASTRA Learning Engine Loaded"
);

