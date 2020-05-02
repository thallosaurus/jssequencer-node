import { TransportModule, PlayState } from "./transport";

const KICK = 36;
const SNARE = 40;

export class Sequencer extends TransportModule
{
    private playing: boolean = false;
    private qu:number = 0;

    private channel:Array<Channel>;

    constructor()
    {
        super();
        this.channel = new Array<Channel>();

        //prepare channel array by filling it with steps:

        //this.channel.push(new Channel(KICK, 2, 16));
        //this.channel.push(new Channel(SNARE, 2, 16));
        let kick = new Channel(KICK, 2, 16);
        /* this.channel.forEach((e) => {
            e = new Step
        });*/
    }

    public startModuleInstance()
    {
        this.setPlayState(PlayState.RUNNING);
    }

    public getChannel(ch:number)
    {
        return this.channel[ch];
    }

    public sync(time: number) : void
    {
        //console.log(time);

        let resolution = 4;

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

    private playNote(channel: number = 0, n: number)
    {
        this.sendMidiMessage([0x90 + channel, n, 64]);
        this.sendMidiMessage([0x80 + channel, n, 127]);
    }

    public onStop()
    {
        this.qu = 0;
    }

    public start()
    {
        console.log("Starting Sequencer");
    }
}

class Channel
{
    private length:number = 16;
    private channel:Array<Step> = new Array<Step>();
    constructor(note: number, channel: number, length:number)
    {
        this.length = length;
        for (let i = 0; i < this.length; i++)
        {
            let fotf = (i % 4 == 0 ? true : false);
            this.channel.push(new Step(false, note, channel));
        }
    }

    public getStepCount()
    {
        return this.length;
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