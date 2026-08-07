
/* =========================================
   ASTRA v2.0 RESPONSE MODULE
========================================= */


const ResponseModule = {


    name:"Response System",


    version:"1.0",



    reply(message){

        const output =
        document.getElementById("output");


        if(!output){

            console.log(
                "ASTRA:",
                message
            );

            return;

        }



        output.innerHTML += `

        <div class="astra-message">

        <b>ASTRA:</b>
        ${message}

        </div>

        `;



        output.scrollTop =
        output.scrollHeight;



        this.animate();

    },



    user(message){

        const output =
        document.getElementById("output");


        if(!output)return;



        output.innerHTML += `

        <div class="user-message">

        <b>YOU:</b>
        ${message}

        </div>

        `;

    },



    animate(){

        const core =
        document.querySelector(".core-circle");


        if(!core)return;



        core.classList.add("active");



        setTimeout(()=>{

            core.classList.remove("active");

        },1500);

    }



};



ASTRA.registerModule(
"response",
ResponseModule
);



/* GLOBAL ACCESS */

function AstraReply(message){

    ResponseModule.reply(message);

}
