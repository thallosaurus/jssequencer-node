const express = require('express');
const app = express();

import { PlayState, TransportModule } from './transport';
import { Sequencer, FOOR_ON_THE_FLOOR } from './Sequencer';

export class Web extends TransportModule
{
    private port:number = 0;
    private app:any;

    public moduleName:string = "Web Interface";

    constructor(port:number = 10000)
    {
        super();
        console.log("Hello!");
        this.port = port;
        this.app = express();

        this.setupRoutes();
        this.app.listen(this.port, () => console.log('Web Interface running on Port: ' + this.port));
    }

    public sync(time: number)
    {
        //i dunno either
    }

    public setupRoutes()
    {
        this.app.get("/play", (req, res) => {
            let status = this.transport.startTransport(req.query.bpm);
            res.send("Status: " + status);
        });

        this.app.get("/stop", (req, res) => {
            //this.emit("stop");
            let status = this.transport.stopTransport()
            res.send("Status: " + status);
        });

        this.app.get("/status", (req, res) =>
        {
            let status = this.transport.getTransportDetails();
            res.send(JSON.stringify(status));
        });

        this.app.get("/place_fotf", (req, res) => {
            this.transport.sendToModule(0, {
                "type": "place_full_steps",
                "channel": 0,
                "steps": FOOR_ON_THE_FLOOR
            }, this);
            res.send("Ok");
        });

        this.app.get("/set_bpm", (req, res) => {
            this.transport.setBPM(req.query.bpm);
            res.send("bpm: " + this.transport.getBPM());
        })
    }

    /*public getSequencer()
    {
        let modules = this.transport.returnModules();
        for (let i = 0; i < modules.length; i++)
        {
            if (modules[i].getId() == 0)
            {
                //this._Sequencer = this.transport.returnModule(i);
            }
        }
    }*/

    /*public getSequencerData()
    {

    }*/

    public startModuleInstance()
    {
        this.setPlayState(PlayState.RUNNING);
    }
}