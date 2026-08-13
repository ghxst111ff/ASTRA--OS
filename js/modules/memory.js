/* =========================================
   ASTRA v2.1 MEMORY MODULE
   Personal + market-session memory
========================================= */
const MemoryModule={
    name:"Memory System",version:"2.1",
    database:JSON.parse(localStorage.getItem("ASTRA_MEMORY"))||{
        notes:[],knowledge:{},preferences:{},marketSessions:{},created:new Date().toLocaleString()
    },
    save(){localStorage.setItem("ASTRA_MEMORY",JSON.stringify(this.database));},
    remember(info){this.database.notes.push({data:info,date:new Date().toISOString()});this.save();AstraReply("Memory saved.");},
    getMemories(){return this.database.notes;},
    show(){AstraReply(`ASTRA MEMORY<br><br>Saved memories: ${this.database.notes.length}`);},
    savePreference(key,value){this.database.preferences[key]=value;this.save();AstraReply("Preference saved.");},
    saveKnowledge(topic,data){this.database.knowledge[topic]=data;this.save();AstraReply("Knowledge saved.");},
    getMarketSession(key){return this.database.marketSessions[key]||null;},
    saveMarketSession(key,state){
        const old=this.database.marketSessions[key]||{};
        this.database.marketSessions[key]={...old,...state,lastUpdated:new Date().toISOString()};
        this.save();
        return this.database.marketSessions[key];
    },
    listMarketSessions(){return this.database.marketSessions;},
    currentMarketSession(){
        const sessions=this.database.marketSessions;
        const keys=Object.keys(sessions);
        if(!keys.length)return null;
        return sessions[keys.sort((a,b)=>new Date(sessions[b].lastUpdated)-new Date(sessions[a].lastUpdated))[0]];
    },
    recordMarketMessage(message,extra={}){
        const text=String(message||"");
        const pair=(text.match(/\b([A-Z]{3})\s*[\/_-]\s*([A-Z]{3})\b/i)||[]).slice(1).join("/").toUpperCase()||
            (text.match(/\b(GBPUSD|EURUSD|USDJPY|AUDUSD|USDCAD|USDCHF|NZDUSD|XAUUSD|BTCUSD|ETHUSD)\b/i)||[])[1]?.toUpperCase();
        const tf=(text.match(/\b(\d+)\s*(m|min|mins|minute|minutes|h|hr|hour|hours|d|day|days|w|week|weeks)\b/i)||[]);
        const timeframe=tf[1]?`${tf[1]}${tf[2].toLowerCase().startsWith("h")?"H":tf[2].toLowerCase().startsWith("d")?"D":tf[2].toLowerCase().startsWith("w")?"W":"M"}`:null;
        if(!pair&&!timeframe&&!extra.marketState&&!/\b(marked|mark up|markup|zone|liquidity|bias|expect|expecting|target|objective|plan|chart)\b/i.test(text))return null;
        const key=pair||extra.pair||this.currentMarketSession()?.pair||"CURRENT";
        const current=this.getMarketSession(key)||{};
        const state={pair:pair||extra.pair||current.pair||null,timeframe:timeframe||extra.timeframe||current.timeframe||null};
        if(/\b(marked|mark up|markup)\b/i.test(text))state.lastMarkup=text;
        if(/\b(expect|expecting|plan|objective|target|looking for)\b/i.test(text))state.marketPlan=text;
        if(extra.marketState)Object.assign(state,extra.marketState);
        if(extra.screenAnalysis)state.lastScreenAnalysis=extra.screenAnalysis;
        state.lastMessage=text;
        return this.saveMarketSession(key,state);
    }
};
ASTRA.registerModule("memory",MemoryModule);
