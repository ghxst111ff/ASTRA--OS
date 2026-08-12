/* =========================================
   ASTRA API CONNECTION v1.1
   Cloudflare Worker JSON API bridge
========================================= */
const APIConnection=(()=>{
    const DEFAULT_URL="https://small-sun-ca3e.devernholgate5.workers.dev/";

    function normalizeURL(value){
        if(typeof value!=="string") return "";
        let url=value.trim();

        // Recover URLs accidentally stored as Markdown links.
        const markdown=url.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if(markdown) url=markdown[2];

        // Reject corrupted/control-character values.
        if(/[\x00-\x1F\x7F]/.test(url)) return "";

        try{
            const parsed=new URL(url);
            if(parsed.protocol!=="http:" && parsed.protocol!=="https:") return "";
            return parsed.toString();
        }catch(error){
            return "";
        }
    }

    let stored=normalizeURL(localStorage.getItem("ASTRA_API_URL")||"");
    let baseURL=stored||DEFAULT_URL;
    let token=localStorage.getItem("ASTRA_API_TOKEN")||"";

    // Replace stale/corrupted persisted values with the known-good bridge.
    if(stored!==baseURL){
        localStorage.setItem("ASTRA_API_URL",baseURL);
    }

    function configure(config={}){
        if(config.url!==undefined){
            const normalized=normalizeURL(String(config.url));
            if(!normalized) throw new Error("Invalid ASTRA API URL.");
            baseURL=normalized;
            localStorage.setItem("ASTRA_API_URL",baseURL);
        }
        if(config.token!==undefined){
            token=String(config.token);
            localStorage.setItem("ASTRA_API_TOKEN",token);
        }
        return status();
    }

    async function request(path="",options={}){
        if(!baseURL) throw new Error("ASTRA API URL is not configured.");
        const url=new URL(path,baseURL).toString();
        const headers={"Content-Type":"application/json",...(options.headers||{})};
        if(token) headers.Authorization=`Bearer ${token}`;
        const response=await fetch(url,{...options,headers});
        const text=await response.text();
        let data=text;
        try{data=text?JSON.parse(text):null;}catch(error){}
        if(!response.ok) throw new Error(`API ${response.status}: ${typeof data==="string"?data:JSON.stringify(data)}`);
        return data;
    }

    function status(){
        return {configured:!!baseURL,url:baseURL,hasToken:!!token};
    }

    function clear(){
        baseURL=DEFAULT_URL;
        token="";
        localStorage.setItem("ASTRA_API_URL",DEFAULT_URL);
        localStorage.removeItem("ASTRA_API_TOKEN");
    }

    return {name:"API Connection",version:"1.1",configure,request,status,clear};
})();
ASTRA.registerModule("api",APIConnection);
console.log("ASTRA API Connection v1.1 Loaded");
