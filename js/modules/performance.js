
/* =========================================
   ASTRA PERFORMANCE MODULE v1.0
========================================= */

const PerformanceModule = (()=>{

    let performance = JSON.parse(
        localStorage.getItem("ASTRA_PERFORMANCE")
    ) || {

        trades: [],
        wins: 0,
        losses: 0

    };


    function save(){

        localStorage.setItem(
            "ASTRA_PERFORMANCE",
            JSON.stringify(performance)
        );

    }


    function addResult(result){

        performance.trades.push(result);


        if(result === "win"){
            performance.wins++;
        }

        if(result === "loss"){
            performance.losses++;
        }


        save();

    }


    function getData(){

        return performance;

    }


    function report(){

        const total = performance.trades.length;

        const winRate = total ?
        Math.round(
            (performance.wins / total) * 100
        )
        : 0;


        AstraReply(
`
Performance Report:

Trades: ${total}

Wins: ${performance.wins}

Losses: ${performance.losses}

Win Rate: ${winRate}%

`
        );

    }


    return {

        addResult,
        getData,
        report

    };


})();

ASTRA.modules.performance = PerformanceModule;


