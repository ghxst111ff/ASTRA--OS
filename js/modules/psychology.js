/* =========================================
   ASTRA PSYCHOLOGY MODULE v2.0
========================================= */


const PsychologyModule = (()=>{


let emotions = JSON.parse(

localStorage.getItem("ASTRA_EMOTIONS")

) || [];



function save(){

localStorage.setItem(

"ASTRA_EMOTIONS",

JSON.stringify(emotions)

);

}



/* LOG EMOTION */

function logEmotion(emotion){


emotions.push({

emotion,

date:new Date().toLocaleString()

});


save();


AstraReply(

"Emotion recorded: " + emotion

);


}




/* CHECK MINDSET */

function checkMindset(){


if(emotions.length === 0){


AstraReply(

"No mindset records yet. Stay aware of your emotions."

);


return;

}



let latest =
emotions[emotions.length-1];



AstraReply(

`
🧠 ASTRA MINDSET CHECK


Latest Emotion:
${latest.emotion}


Recorded:
${latest.date}


Remember:
Process over outcome.

`

);


}





/* DETECT EMOTIONAL TRADING */

function analyze(command){


command =
command.toLowerCase();



if(

command.includes("revenge")

){


AstraReply(

"⚠️ Revenge trading detected. Stop and review your rules before entering."

);


return true;

}




if(

command.includes("fomo")

||

command.includes("fear missing")

){


AstraReply(

"⚠️ FOMO detected. Wait for confirmation."

);


return true;

}




if(

command.includes("overtrade")

){


AstraReply(

"⚠️ Overtrading warning. Protect your discipline."

);


return true;

}



return false;


}




function getData(){

return emotions;

}




return{

logEmotion,

checkMindset,

analyze,

getData

};


})();



/* REGISTER MODULE */


ASTRA.modules.psychology =
PsychologyModule;



/* COMMANDS */


ASTRA.commands.push({

trigger:"log emotion",

action(command){


let emotion =
command.replace(
"log emotion",
""
).trim();



PsychologyModule.logEmotion(emotion);


}

});



ASTRA.commands.push({

trigger:"check mindset",

action(){

PsychologyModule.checkMindset();

}

});

ASTRA.registerModule(
    "psychology",
    PsychologyModule
);


console.log(
"Psychology Module Loaded"
);

