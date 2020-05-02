"use strict";

import { parentPort, workerData } from 'worker_threads';

function returnClock(): number
{
    return process.hrtime()[1];
}

/*while(true)
{
    parentPort?.postMessage(
        returnClock()
    );
}*/

setInterval(() =>{
    parentPort?.postMessage(returnClock());
}, 100);