"use strict";

import { Transporter } from "./transport";
import { Sequencer } from "./Sequencer";

class Main
{
    transport: Transporter;
    constructor()
    {
        //init transport
        console.log("Hello World!");
        this.transport = new Transporter();
        this.transport.addModule(new Sequencer());
        this.transport.startTransport();
        //this.transport.send([176,22,1]);
        //this.transport.send([0xFA]);        
    }

    close()
    {
        this.transport.shutdown();
    }
}


process.on('SIGINT', function() {
    console.log("Closing");
    m.close();
    //if (i_should_exit)
        process.exit();
});

let m = new Main();