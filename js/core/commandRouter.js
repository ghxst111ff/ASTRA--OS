
/* =========================
   REGISTER COMMAND MODULE
========================= */

ASTRA.modules.command = {

    process(command){
      
const mode = ASTRA.modules.mode.getMode();
    
      const lowerCommand = command.toLowerCase();


// APPROVE COMMAND

if(lowerCommand.startsWith("approve ")){

const feature =
command.replace(/approve /i,"").trim();

ASTRA.modules.updates.approve(feature);

return;

}


// INSTALL COMMAND

if(lowerCommand.startsWith("install ")){

const feature =
command.replace(/install /i,"").trim();

ASTRA.modules.installer.install(feature);

return;

}
        const intent =
    ASTRA.modules.intent.detect(command);

        if(intent.action === "open"){

            document
            .getElementById(intent.panel)
            ?.classList.add("active");

            AstraReply(`${intent.panel} opened.`);
            return;

        }


        if(intent.action === "close"){

            document
            .getElementById(intent.panel)
            ?.classList.remove("active");

            AstraReply(`${intent.panel} closed.`);
            return;

        }

if(lowerCommand.startsWith("activate ")){

    const feature =
    command.replace(/activate /i,"").trim();


    ASTRA.modules.activator.activate(
        feature
    );

    return;

}
      // ASTRA UPDATE REQUESTS

if(
    command.toLowerCase().includes("add") ||
    command.toLowerCase().includes("create") ||
    command.toLowerCase().includes("build feature")
){

    const update =
ASTRA.modules.updateAnalyzer.analyze(command);

const plan =
ASTRA.modules.buildPlanner.plan(update);
  
const code =
ASTRA.modules.codeGenerator.generate(update);
  
  const module =
ASTRA.modules.factory.create(update);

  ASTRA.modules.executor.execute(
    update,
    code
);
ASTRA.modules.updates.register(update);

AstraReply(

`
BUILD PLAN

Feature:
${update.feature}

Module:
${update.module}

Version:
${update.version}

Changes:
${update.changes}

Priority:
${update.priority}

Status:
Awaiting Approval

Type:
Approve ${update.feature}

`

);

return;

}
      // ASTRA MODE COMMANDS


// APPROVE COMMAND

if(lowerCommand.startsWith("approve ")){

const feature =
command.replace(/approve /i,"").trim();

ASTRA.modules.updates.approve(feature);

return;

}


// INSTALL COMMAND

if(lowerCommand.startsWith("install ")){

const feature =
command.replace(/install /i,"").trim();

ASTRA.modules.installer.install(feature);

return;

}

if(lowerCommand.includes("build mode")){

    ASTRA.modules.mode.setMode("BUILD");

    return;

}




if(lowerCommand.includes("backtesting mode")
|| lowerCommand.includes("backtest mode")){

    ASTRA.modules.modeSwitcher.switch(
"BACKTEST"
);

return;

    

}


if(lowerCommand.includes("trading mode")){

    ASTRA.modules.mode.setMode("TRADING");

    return;

}
      
      // BUILD MODE


     
  // BUILD MODE

if(mode === "BUILD"){

    if(
        lowerCommand.includes("add") ||
        lowerCommand.includes("create") ||
        lowerCommand.includes("build")
    ){

        const update =
        ASTRA.modules.updateAnalyzer.analyze(command);


        const plan =
        ASTRA.modules.buildPlanner.plan(update);


        const code =
        ASTRA.modules.codeGenerator.generate(update);


        ASTRA.modules.updates.register(update);


        AstraReply(

`
BUILD PLAN

Feature:
${plan.feature}

Module:
${plan.module}

Priority:
${plan.priority}

Files:
${plan.estimatedFiles.join(", ")}

Generated Files:
${code.files.join(", ")}

Summary:
${code.summary}

Status:
${plan.status}

Type:
Approve ${plan.feature}

`

        );

        return;

    }

}



// SEND TO AI

ASTRA.modules.ai.ask(command);

}


};


console.log(
    "Command Router Module Loaded"
);

