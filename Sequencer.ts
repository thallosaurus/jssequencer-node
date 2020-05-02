import { TransportModule, PlayState } from "./transport";

const KICK = 36;
const SNARE = 40;
const CLOSED_HIHAT = 42;

export const FOOR_ON_THE_FLOOR = [
    true, false, false, false,
    true, false, false, false,
    true, false, false, false,
    true, false, false, false
];

export const SNARE_BEAT = [
    false, false, false, false,
    true, false, false, false,
    false, false, false, false,
    true, false, false, true
];

export const HIHAT_BEAT = [
    false, false, true, false
]

export class Sequencer extends TransportModule
{
    //private playing: boolean = false;
    public qu:number = 0;

    public moduleName:string; 

    public channel:Array<Channel>;

    constructor()
    {
        super();
        this.channel = new Array<Channel>();

        this.moduleName = "StepSequencer v1.0";

        //prepare channel array by filling it with steps:

        //this.channel.push(new Channel(KICK, 2, 16));
        //this.channel.push(new Channel(SNARE, 2, 16));
        let kick = new Channel(KICK, 2, 16, "KICK");
        kick.applySteps(FOOR_ON_THE_FLOOR);
        this.addChannel(kick);

        let snare = new Channel(SNARE, 2, 16, "SNARE");
        snare.applySteps(SNARE_BEAT);
        this.addChannel(snare);

        let hihat = new Channel(CLOSED_HIHAT, 2, 4, "HIHAT");
        hihat.applySteps(HIHAT_BEAT);
        this.addChannel(hihat);
        /* this.channel.forEach((e) => {
            e = new Step
        });*/
    }

    public getSequencerData()
    {
        //let state = {};
        return this.channel;
        /*for (let i = 0; i < this.channel.length; i++)
        {
            let chName = this.getChannel(i).getName();
            let stepCount = this.getChannel(i).getStepCount();

            /*for (let f = 0; f < stepCount; f++)
            {
                
            }*/
        
    }

    public static createChannel(midi_note:number, midi_channel:number, step_length:number, name:string, step_pattern?:Array<boolean>) {
        let channel = new Channel(midi_note, midi_channel, step_length, name);
        
        if (step_pattern != undefined)
        {
            if (step_pattern.length == step_length)
            {
                channel.applySteps(step_pattern);
            }
        }
        return channel;
    }

    public startModuleInstance()
    {
        this.setPlayState(PlayState.RUNNING);
    }

    public addChannel(ch:Channel)
    {
        this.channel.push(ch);
    }

    public getChannel(ch:number)
    {
        return this.channel[ch];
    }

    public sync(time: number) : void
    {
        let resolution = 4;

        if (this.getPlayState() == PlayState.PLAYING)
        {
        //How long is a pulse?
            let pulse = (60000 / this.getBPM() / resolution);
        
            if (time > this.qu * pulse)
            {
                for (let i = 0; i < this.channel.length; i++)
                {
                    let currentChannel = this.getChannel(i);

                    let currentStep = currentChannel.getStep(this.qu % currentChannel.getStepCount());

                    if (currentStep.getState())
                    {
                    //console.log("Position: " + (this.qu % 16));
                    let channel = currentStep.channel;
                    let note = currentStep.note;
                    this.playNote(channel, note);
                    }
                }
            //console.log(d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds());
            //console.log("tick", this.qu, bpm);
                this.qu++;
            }
        }
    }

    private playNote(channel: number = 0, n: number)
    {
        this.sendMidiMessage([0x90 + channel, n, 64]);
        this.sendMidiMessage([0x80 + channel, n, 127]);
    }

    public stopSequencer()
    {
        this.qu = 0;
    }

    public stop()
    {
        console.log("Stopping Sequencer");
        this.stopSequencer();
    }

    public start()
    {
        console.log("Starting Sequencer");
        this.startSequencer();
    }

    public startSequencer()
    {
        this.setPlayState(PlayState.PLAYING);
    }

    public onMessage(msg: any)
    {
        console.log(msg);
        switch(msg["type"]) {
            case "place_full_steps":
                this.channel[msg["channel"]].applySteps(msg);
        }
    }
}

class Channel
{
    private length:number = 16;
    private channel:Array<Step> = new Array<Step>();
    private name:string = "";

    constructor(note: number, channel: number, length:number, name:string)
    {
        this.length = length;
        for (let i = 0; i < this.length; i++)
        {
            let fotf = (i % 4 == 0 ? true : false);
            this.channel.push(new Step(false, note, channel));
        }
        this.name = name;
    }

    public getStepCount()
    {
        return this.length;
    }

    public getName() : string
    {
        return this.name;
    }

    public getStep(step: number)
    {
        return this.channel[step];
    }

    public applySteps(steps:Array<boolean>)
    {
        //input: Array[true, true, true, false, false, false...]

        for (let i = 0; i < this.channel.length; i++)
        {
            if (steps[i] != undefined)
            {
                this.channel[i].setState(steps[i]);
            }
        }
    }
}

class Step
{
    public note: number = 36;
    public playMe: boolean = true;
    public channel: number = 1;
    constructor(b: boolean, note: number, channel: number)
    {
        this.playMe = b;
        this.note = note;
        this.channel = channel - 1;
    }

    getState()
    {
        return this.playMe;
    }

    setState(state: boolean)
    {
        this.playMe = state;
    }
}