const express = require('express');
const app = express();

const path = require('path');

const http = require('http').createServer(app);
const io = require('socket.io')(http);

import { PlayState, TransportModule, TransportMessage } from './transport';
import { FOOR_ON_THE_FLOOR } from './Sequencer';
import { MessagePort } from 'worker_threads';

class UpdateChunk
{
    private time = 0;
    private bpm = 0;

    constructor()
    {}

    setTime(time:number)
    {
        this.time = time;
    }

    setBPM(bpm:number)
    {
        this.bpm = bpm;
    }
}


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
        
        this.setupRoutes();

        app.use(express.static(path.join(process.cwd(), 'public')));

        app.get('/', (req, res) => {
            res.sendFile(process.cwd() + "/public/index2.html");
        });
        //this.app.listen(this.port, () => console.log('Web Interface running on Port: ' + this.port));
        http.listen(this.port, () => {
            console.log("Listening on Port: *:" + this.port);
        });
    }

    public setupRoutes()
    {
        /*app.get("/play", (req, res) => {
            let status = this.transport.startTransport(req.query.bpm);
            res.send("Status: " + status);
        });

        app.get("/stop", (req, res) => {
            //this.emit("stop");
            let status = this.transport.stopTransport()
            res.send("Status: " + status);
        });

        app.get("/status", (req, res) =>
        {
            let status = this.transport.getTransportDetails();
            res.send(JSON.stringify(status));
        });

        app.get("/place_fotf", (req, res) => {
            this.transport.sendToModule(0, {
                "type": "place_full_steps",
                "channel": 0,
                "steps": FOOR_ON_THE_FLOOR
            }, this);
            res.send("Ok");
        });

        app.get("/set_bpm", (req, res) => {
            this.transport.setBPM(req.query.bpm);
            res.send("bpm: " + this.transport.getBPM());
        });*/

        //Socket io handles:
        io.on('connection', (socket) => {
            this.setupSocketIo(socket);
            this.sendSocketData(socket);
        });
    }

    public sendSocketData(socket)
    {
        let data = JSON.stringify(this.getSequencerMessage());
        console.log(data);
        socket.emit("sequpdate", data);
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

    public sync(time:number)
    {
        let update:UpdateChunk = new UpdateChunk();
        update.setTime(time);
        update.setBPM(this.transport.getBPM());
        io.emit("update", update);
    }

    public setBPMExternal(bpm:number)
    {
        this.transport.setBPM(bpm);
    }

    public setBox(data:any)
    {
        this.transport.modules[0].onMessage(new TransportMessage("tick_box", data));
    }

    public setPatternNumber(ptn:number, callback:any)
    {
        let data = {"number": ptn, "callback": callback};
        this.transport.modules[0].onMessage(new TransportMessage("set_ptn", data));
    }

    public addSequencer(data)
    {
        this.transport.modules[0].onMessage(new TransportMessage("addSequencer", data));
    }

    public setupSocketIo(socket)
    {
        console.log('a user connected');
        socket.on('disconnect', () => {
            console.log('user disconnect');
        });

        socket.on('stop', () => {
            console.log("[SOCKET]Stop");
            this.transport.stopTransport();
        });

        socket.on("start", () => {
            console.log("[SOCKET]Start");
            this.transport.startTransport();
        })

        socket.on('update_message', () => {
            console.log("Update");
            this.emitUpdate();
        });

        socket.on("get_current_sequencers", () => {
            console.log("Sending Sequencer Data");
        });

        socket.on("changePattern", (data) => {
            this.setPatternNumber(data, () => {
                this.sendSocketData(socket);
            });
        });

        socket.on("add_sequencer", (data) =>
        {
            this.addSequencer(data);
            this.sendSocketData(socket);
        });

        socket.on("step", (e) => {
            console.log(e);
            this.setBox(e);
        });

        socket.on("change_note_for_channel", (e) => {
            this.changeChannelNote(e);
        })

        socket.on("change_bpm", (e) => {
            this.transport.setBPM(e.bpm);
        });

        socket.on("add_pattern", (e) => {
            this.addPattern(e);
            this.sendSocketData(socket);
        });
    }

    public addPattern(e)
    {
        this.transport.modules[0].onMessage(new TransportMessage("add_pattern"));
    }

    public changeChannelNote(e)
    {
        this.transport.modules[0].onMessage(new TransportMessage("set_channel_note", e));
    }

    public getSequencerMessage()
    {
        let message = this.transport.modules[0].onMessage(new TransportMessage("get_data"));
        
        //io.emit("seq_data", message);
        return message;
    }

    public emitUpdate()
    {
        let msg = JSON.stringify(this.transport.getTransportDetails());
        io.emit('update', msg);
    }

    /*public syncInternal(time: number)
    {
        io.emit("ts", JSON.stringify({ts: time, data: this.transport.getTransportDetails()}));
    }*/

    public startModuleInstance()
    {
        this.setPlayState(PlayState.RUNNING);
    }
}