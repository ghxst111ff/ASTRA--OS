/* =========================================
   ASTRA CONVERSATION LAYOUT
   Conversation lives directly under ASTRA CORE
========================================= */
(function(){
    function mountConversation(){
        const says=document.querySelector('.astra-says');
        const dock=document.querySelector('.conversation-dock');
        const output=document.getElementById('output');
        const command=document.querySelector('.conversation-dock .command-area');
        if(!says || !output || !command) return false;

        // Remove the old bottom conversation dock from the visible layout.
        if(dock) dock.remove();

        // Remove the static placeholder so the real conversation is shown.
        const oldMessage=document.getElementById('dashboardMessage');
        if(oldMessage) oldMessage.remove();

        // Move the live ASTRA conversation and typing controls into ASTRA SAYS.
        const title=says.querySelector('.panel-title');
        const wave=says.querySelector('.voice-wave');
        const core=says.querySelector('.mini-core');
        says.classList.add('conversation-panel');
        if(title) title.textContent='ASTRA SAYS';
        says.appendChild(output);
        says.appendChild(command);
        if(wave) wave.remove();
        if(core) core.remove();

        // Make the conversation box visible and scrollable.
        output.classList.add('core-conversation');
        command.classList.add('core-command-area');

        const input=command.querySelector('#commandInput');
        const send=command.querySelector('#sendBtn');
        if(input) input.placeholder='Type a message to ASTRA...';
        if(send) send.textContent='SEND';

        return true;
    }

    const css=document.createElement('style');
    css.textContent=`
        .conversation-panel{display:flex!important;flex-direction:column;min-height:0}
        .conversation-panel .panel-title{flex:0 0 auto}
        .core-conversation{display:flex!important;flex-direction:column;gap:8px;height:86px;min-height:86px;margin-top:8px;overflow-y:auto;overflow-x:hidden;padding:2px 4px 2px 0;scroll-behavior:smooth}
        .core-conversation .astra-message,.core-conversation .user-message{margin:0;padding:6px 8px;border-radius:7px;background:rgba(3,27,43,.75);border:1px solid rgba(0,174,235,.14);font-size:8px;line-height:1.45}
        .core-conversation .user-message{border-color:rgba(139,126,255,.16);background:rgba(25,18,52,.5)}
        .core-conversation .message-speaker{font-size:6px;letter-spacing:1px;color:#62dfff;font-weight:700;margin-bottom:2px}
        .core-conversation .user-message .message-speaker{color:#a996ff}
        .core-conversation .message-body p{margin:0 0 3px}.core-conversation .message-body p:last-child{margin-bottom:0}
        .core-conversation .message-body h3,.core-conversation .message-body h4{margin:0 0 3px;font-size:8px;color:#dff9ff}
        .core-conversation .message-body ul{margin:2px 0 2px 14px;padding:0}.core-conversation .message-body li{margin:1px 0}
        .core-command-area{display:flex!important;gap:6px;margin-top:7px;align-items:center}
        .core-command-area #commandInput{flex:1;min-width:0;height:28px;border:1px solid rgba(0,194,255,.28);background:rgba(1,12,21,.9);color:#e6faff;border-radius:6px;padding:0 9px;font-size:8px;outline:none}
        .core-command-area #commandInput:focus{border-color:rgba(0,207,255,.7);box-shadow:0 0 12px rgba(0,190,255,.12)}
        .core-command-area #sendBtn{height:28px;padding:0 10px;border:1px solid rgba(0,194,255,.35);background:#05243a;color:#78e2ff;border-radius:6px;font-size:7px;font-weight:700;cursor:pointer}
        .core-command-area #sendBtn:hover{background:#07324e;box-shadow:0 0 12px rgba(0,190,255,.18)}
        .conversation-panel .hidden-control{display:none!important}
    `;
    document.head.appendChild(css);

    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mountConversation);
    else mountConversation();
})();
