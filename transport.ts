"use strict";

//import '@types/node';

import { Worker } from 'worker_threads';

const microtime = require('microtime');

const midi = require("midi");

export enum PlayState {
    STOPPED = 0,
    PLAYING = 1,
    STARTING = 2,
    RUNNING = 3,
    CLOSING = 4
}

class MIDIConnection
{
    private output: any;
    private bpm: number = 0;
    private started: boolean = false;
    private quarter: number = 0;
    constructor()
    {
        this.setBPM(128);
        this.output = new midi.Output();
        //this.output.openPort();
        for (let i = 0; i < this.output.getPortCount(); i++)
        {
            console.log(i + ": " + this.output.getPortName(i));
        }
        this.connectPort(1);
        

        //console.log(microtime);
    }

    public close()
    {
        if (this.started)
        {
            this.stopClock();
        }
        this.output.closePort();
    }

    public sendMessage(msg: Array<number>)
    {
        if(this.output.isPortOpen())
        {
            this.output.sendMessage(msg);
        }
    }

    public connectPort(id: number)
    {
        this.output.closePort();
        console.log("Connecting to: " + this.output.getPortName(id));
        this.output.openPort(id);
    }

    public getBPM()
    {
        return this.bpm;
    }

    public setBPM(b: number = 128)
    {
        this.bpm = b;
    }

    public startClock()
    {
        console.log("Start MIDI Clock");
        this.sendMessage([0xFA]);
    }

    public sendClockPulse()
    {
        //console.log("Tick");
        this.sendMessage([0xF8]);
    }

    public stopClock()
    {
        console.log("Stop MIDI Clock");
        this.sendMessage([0xFC]);
        this.quarter = 0;
        this.started = false;
    }

    public continueClock()
    {
        console.log("Continue MIDI Clock");
        this.sendMessage([0xFB]);
    }

    public sync(time: number)
    {
        let pulse = (60000 / this.bpm / 24);
        if (time > this.quarter * pulse)
        {
            if (!this.started)
            {
                this.started = true;
                this.startClock();
            }
            this.sendClockPulse();
            this.quarter++;
        }
    }
}

export class Transporter {

    //storage for all transport modules.
    private modules: Array<TransportModule>;

    private playState: PlayState;

    private midi: MIDIConnection;

    private lastPlayBeat: number = process.hrtime()[1];

    //private worker: Worker;

    private lastTransportAttempt: number = 0;

    private isTransporting: boolean = false;

    private startTime: number = microtime.now();

    constructor() {
        //this.setPlayState(PlayState.STOPPED);
        this.playState = PlayState.STOPPED;
        this.modules = [];
        //this.startTime = 0;

        this.midi = new MIDIConnection();

        //Configure MidiClock
        /*this.worker = new Worker('./out/MIDIClock.js');
        this.worker.on('message', (result) => {
            //console.log("tick");
            this.sync(result);
        });*/
    }

    public getBPM() : number
    {
        return this.midi.getBPM();
    }

    public shutdown()
    {
        this.stopTransport();
        this.midi.close();
        //this.worker.terminate();
    }

    public send(msg: Array<number>)
    {
        //console.log("Sending MIDI-Message: ", msg);
        this.midi.sendMessage(msg);
    }

    public sync(time: number) {
        //send to all modules

        if (this.getPlayState() == PlayState.PLAYING)
        {
            this.midi.sync(time);
            this.modules.forEach((e) => {
                //e.sync(time - this.lastPlayBeat);
                e.sync(time);
            });
        }
    }

    public addModule(mod: TransportModule): void {
        mod.applyId(this.modules.length);
        mod.addTransportReference(this);
        this.modules.push(mod);
    }

    private getModules(): Array<TransportModule> {
        return this.modules;
    }

    public startTransport(): void {
        this.setPlayState(PlayState.STARTING);
        try {
            this.getModules().forEach((e) => {
                e.start();
            });
        } catch (e) {
            console.log(e);
            this.setPlayState(PlayState.STOPPED);
            return;
        }
        this.lastPlayBeat = new Date().getTime();
        this.setPlayState(PlayState.PLAYING);

        setInterval(() => {
            if (this.getPlayState() == PlayState.PLAYING)
            {
                //let hrTime = process.hrtime.bigint;
                //let ts = hrTime[0] * 1000000 + hrTime[1] / 1000;
                this.sync((microtime.now() - this.startTime) / 1000);
            }
        }, 10);

        //send midi clock
    }

    public stopTransport()
    {
        if (this.getPlayState() == PlayState.PLAYING)
        {
            this.modules.forEach((e) => {
                e.onStopModule();
            });
        }
        this.setPlayState(PlayState.CLOSING);
    }

    public getPlayState(): PlayState {
        return this.playState;
    }

    private setPlayState(state: PlayState)
    {
        this.playState = state;
    }
}

export class TransportModule {

    private moduleId: number;
    private playStateModule: PlayState;
    private transport?: Transporter;

    constructor() {
        this.moduleId = -1;
        this.playStateModule = PlayState.STOPPED;
    }

    public applyId(id: number) {
        this.moduleId = id;
    }

    public addTransportReference(t: Transporter)
    {
        this.transport = t;
    }

    public sendMidiMessage(msg: Array<number>)
    {
        this.transport?.send(msg);
    }

    public getBPM()
    {
        return this.transport?.getBPM();
    }

    /**
     * Gets called every tick.
     * @param  {number} time current timestamp
     */
    public sync(time: number) : void { }

    public start() : void {
        this.startModuleInstance();
        if (this.getPlayState() != PlayState.RUNNING) {
            throw new TransportStartException(this.getId());
        }
    }

    public getPlayState() : PlayState
    {
        return this.playStateModule;
    }

    public setPlayState(state: PlayState)
    {
        this.playStateModule = state;
    }

    public getId() : number {
        return this.moduleId;
    }

    public onStopModule()
    { 
        this.onStop();
        this.setPlayState(PlayState.STOPPED);
    }

    public onStop() {}

    /**
     * This Function must set this.playStateModule to PlayState.RUNNING on success, otherwise, the prestart function will throw an error!
     */
    public startModuleInstance() { }
}

class TransportStartException extends Error {
    constructor(id: number) {
        super("Module with id " + id + " failed to start");
    }
}