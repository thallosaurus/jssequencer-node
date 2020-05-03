import { TransportModule, PlayState, TransportMessage } from "./transport";
import { Socket } from "dgram";
import { isObject } from "util";

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

class Pattern
{
    public channel:Array<Channel>;
    
    constructor()
    {
        this.channel = new Array<Channel>();
    }

    addChannel(ch:Channel)
    {
        this.channel.push(ch);
    }

    getChannel(index:number)
    {
        return this.channel[index];
    }

    getChannelRaw()
    {
        return this.channel;
    }

    fillTestData(type:number = 0)
    {
        switch(type)
        {
            case 0:
                let kick = new Channel(KICK, 2, 16, "KICK");
                kick.applySteps(FOOR_ON_THE_FLOOR);
                this.addChannel(kick);

                let snare = new Channel(SNARE, 2, 16, "SNARE");
                snare.applySteps(SNARE_BEAT);
                this.addChannel(snare);

                let hihat = new Channel(CLOSED_HIHAT, 2, 4, "HIHAT");
                hihat.applySteps(HIHAT_BEAT);
                this.addChannel(hihat);
                break;

            case 1:
                let kick2 = new Channel(KICK, 2, 4, "KICK");
                let snare2 = new Channel(SNARE, 2, 8, "SNARE");
                let hihat2 = new Channel(CLOSED_HIHAT, 2, 4, "HIHAT");
                
                this.addChannel(kick2);
                this.addChannel(snare2);
                this.addChannel(hihat2);
                break;
        }
    }
}

export class Sequencer extends TransportModule
{
    //private playing: boolean = false;
    public qu:number = 0;

    public moduleName:string; 

    //public channel:Array<Channel>;

    public pattern:Array<Pattern>;

    public currentPattern:number = -1;

    private schedPattern:boolean = false;

    private schedNextPattern:number = 0;

    private schedNextPatternCallback: any;

    constructor()
    {
        super();

//        this.channel = new Array<Channel>();

        this.moduleName = "StepSequencer v1.0";

        this.pattern = new Array<Pattern>();
        let ptn1 = new Pattern();
        ptn1.fillTestData(0);
        this.pattern.push(ptn1);

        let ptn2 = new Pattern();
        ptn2.fillTestData(1);
        this.pattern.push(ptn2);

        //default the first
        this.setCurrentPattern(1);

        //prepare channel array by filling it with steps:

        
    }

    public schedulePatternChange(newPattern:number, callback:any)
    {
        //if (newPattern < this.pattern.length)
        //{
            console.log(newPattern);
            if (this.getPlayState() == PlayState.PLAYING)
            {
                console.log(newPattern);
                this.schedPattern = true;
                this.schedNextPattern = newPattern;
                this.schedNextPatternCallback = callback;
            }
            else
            {
                this.setCurrentPattern(newPattern);
                callback();
            }
        //}
    }

    public setCurrentPattern(id: number)
    {
        this.currentPattern = id;
    }

    public getCurrentPattern() : Pattern
    {
        return this.pattern[this.currentPattern];
    }

    public addPattern()
    {
        this.pattern.push(new Pattern());
    }

    public getSequencerData()
    {
        //let state = {};
        return {
            "channeldata": this.getChannelRaw(),
            "pattern": {
                "count": this.pattern.length,
                "current_pattern": this.currentPattern
            }
        };
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
        this.getChannelRaw().push(ch);
    }

    public getChannel(ch:number)
    {
        return this.getChannelRaw()[ch];
    }

    private getChannelRaw() : Array<Channel>
    {
        return this.getCurrentPattern().channel;
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

                if (this.schedPattern && this.qu % 16 == 0)
                {
                    this.setCurrentPattern(this.schedNextPattern);
                    this.schedPattern = false;
                    this.schedNextPatternCallback();
                }

                for (let i = 0; i < this.getChannelRaw().length; i++)
                {
                    let currentChannel = this.getChannel(i);

                    let currentStep = currentChannel.getStep(this.qu % currentChannel.getStepCount());

                    if (currentStep.getState())
                    {
                    //console.log("Position: " + (this.qu % 16));
                    let channel = currentStep.channel;
                    let note = currentStep.note;
                    let velocity = currentStep.velocity;
                    this.playNote(channel, note, velocity);
                    }
                }
            //console.log(d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds());
            //console.log("tick", this.qu, bpm);
                this.qu++;
            }
        }
    }

    private playNote(channel: number = 0, n: number, v: number)
    {
        this.sendMidiMessage([0x90 + channel, n, v]);
        setTimeout(() => {
            this.sendMidiMessage([0x80 + channel, n, 127]);
        }, 10);
        
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

    public onMessage(msg: TransportMessage)
    {
        console.log(msg);
        switch(msg.type) {
            case "place_full_steps":
                this.getChannel(msg.data[0]).applySteps(msg.data[1]);
                break;

            case "get_data":
                console.log(this.getSequencerData());
                return this.getSequencerData();

            case "tick_box":
                let data = JSON.parse(msg["data"]);
                let tick = this.getChannel(data.channel).setStep(data.step, data.checked);
                //console.log(tick);
                /*this.channel[msg.data.channel].setStep(msg.data.step, tick);
                console.log(this.channel);*/
                break;

            case "set_ptn":
                //console.log("meow", msg);
                this.schedulePatternChange(msg.data.number, msg.data.callback);                
                break;

            case "addSequencer":
                console.log(msg);
                this.addStepSequencerExternal(msg.data.note, msg.data.channel, msg.data.steps, msg.data.name);
                break;
        }
    }

    public addStepSequencerExternal(note:number, channel:number, steps:number, name:string)
    {
        let newChannel = Sequencer.createChannel(note, channel, steps, name);
        console.log(newChannel);
        this.addChannel(newChannel);
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

    public setStep(step:number, data:boolean)
    {
        this.channel[step].playMe = data;
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
    public velocity: number = 127;
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