/* =========================================
   ASTRA AI GATEWAY v1.0
========================================= */

const AIGateway = {

    async ask(userMessage){

        const context =
            ASTRA.modules.context.build();

        const payload = {

            question: userMessage,

            context: context

        };

        console.log(
            "AI PAYLOAD",
            payload
        );

        // API will be connected here later

        AstraReply(
            "AI Gateway Ready."
        );

    }

};

ASTRA.registerModule(
    "ai",
    AIGateway
);

console.log(
    "ASTRA AI Gateway Loaded"
);