/* =========================================
   ASTRA API CONNECTION v1.1
   Cloudflare Worker / JSON API bridge
========================================= */
const APIConnection=(()=>{
    const DEFAULT_API_URL="https://small-sun-ca3e.devernholgate5.workers.dev/";

    function normalizeURL(value){
        if(value===undefined||value===null)return "";
        let url=String(value).trim();

        // Accept URLs accidentally stored/displayed as Markdown links:
        // [https://example.com](https://example.com)
        const markdown=url.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if(markdown)url=markdown[2];

        // Also accept a bare [https://example.com] value.
        if(url.startsWith("[")&&url.endsWith("]"))url=url.slice(1,-1);

        return url.trim();
    }

    let baseURL=normalizeURL(localStorage.getItem("ASTRA_API_URL"))||DEFAULT_API_URL;
    let token=localStorage.getItem("ASTRA_API_TOKEN")||"";

    function configure(config={}){
        if(config.url!==undefined){
            baseURL=normalizeURL(config.url);
            if(baseURL)localStorage.setItem("ASTRA_API_URL",baseURL);
            else localStorage.removeItem("ASTRA_API_URL");
        }
        if(config.token!==undefined){
            token=String(config.token);
            localStorage.setItem("ASTRA_API_TOKEN",token);
        }
        return status();
    }

    async function request(path="",options={}){
        if(!baseURL)throw new Error("ASTRA API URL is not configured.");
        const url=new URL(path||"",baseURL).toString();
        const headers={"Content-Type":"application/json",...(options.headers||{})};
        if(token)headers.Authorization=`Bearer ${token}`;

        const response=await fetch(url,{...options,headers});
        const text=await response.text();
        let data=text;
        try{data=text?JSON.parse(text):null;}catch(error){}

        if(!response.ok){
            throw new Error(`API ${response.status}: ${typeof data==="string"?data:JSON.stringify(data)}`);
        }

        return data;
    }

    function status(){
        return {configured:!!baseURL,url:baseURL,hasToken:!!token};
    }

    function clear(){
        baseURL="";
        token="";
        localStorage.removeItem("ASTRA_API_URL");
        localStorage.removeItem("ASTRA_API_TOKEN");
    }

    return {name:"API Connection",version:"1.1",configure,request,status,clear};
})();

ASTRA.registerModule("api",APIConnection);
console.log("ASTRA API Connection v1.1 Loaded");
