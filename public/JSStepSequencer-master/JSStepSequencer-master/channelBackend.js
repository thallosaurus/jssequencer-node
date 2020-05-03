let channels = {}

function getStep(channel, step)
{
    return channels[channel].steps[step].play;
};

class Channel
{
    constructor(strip)
    {
        this.id = parseInt(strip.dataset.id);
        this.stepCount = strip.querySelector(".step-selector").childElementCount;

        this.stepSelectorElement = strip.querySelector(".step-selector").children;

        this.steps = new Array(this.stepCount);

        this.internalStepPointer = qu % this.stepCount;

        this.midiChannel = 1;

        console.log(strip);

        this.note = 35;

        for (let i = 0; i < this.stepSelectorElement.length; i++)
        {
            this.steps[i] = new Step(this.stepSelectorElement[i]);
        }
        console.log(this);
    }

    switch(step)
    {
        this.steps[step].switch();
    }

    next()
    {
        
        if (this.internalStepPointer == this.stepCount - 1)
        {
            this.resetInternalCounters();
        }
        else
        {
            this.internalStepPointer++;
        }

        return this.internalStepPointer;
    }

    resetInternalCounters()
    {
        this.internalStepPointer = 0;
        //this.internalStepPointer = qu % this.stepCount;
        //this.resetActiveStepIndicator();
    }

    getCurrentStep()
    {
        //console.log(this.internalStepPointer);
        this.resetActiveStepIndicator();
        return this.steps[this.internalStepPointer].playState;
    }

    setMidiChannel(channel)
    {
        this.midiChannel = parseInt(channel);
    }

    getMidiChannel()
    {
        return this.midiChannel;
    }

    setNote(note)
    {
        this.note = note;
    }

    getMidiNote(vel = 1)
    {
        return {
            "note": this.note,
            "midiChannel": this.midiChannel,
            "velocity": vel
        }
    }

    /*refreshActiveStepIndicator()
    {
        /*for (let e = 0; e < this.stepSelectorElement.length; e++)
        {
            //console.log(this.stepSelectorElement[e])
            this.stepSelectorElement[e].dataset.playing = false;

            console.log(this.stepSelectorElement[e]);

            if (this.stepSelectorElement[e].dataset.step == this.internalStepPointer)
            {
                console.log(this.internalStepPointer);
                this.stepSelectorElement[e].dataset.playing = true;
            }
        };*/
        /*for (let i = 0; i < this.steps.length; i++)
        {
            //console.log(this.steps[i].getAssociatedElement().dataset);
            this.steps[i].getAssociatedElement().dataset.playing = false;

            if (this.steps[i].getAssociatedElement().dataset.step == this.internalStepPointer)
            {
                this.steps[i].getAssociatedElement().dataset.playing = true;
            }*
        }*

        console.log(this.internalStepPointer);
        this.resetActiveStepIndicator();
        this.steps[this.internalStepPointer].getAssociatedElement().dataset.playing = true;

        
        debugger;*
    }*/

    resetActiveStepIndicator()
    {
        for (let i = 0; i < this.steps.length; i++)
        {
            //console.log(this.steps[i].getAssociatedElement().dataset);
            this.steps[i].getAssociatedElement().dataset.playing = false;
        }
    }
}

class Step
{
    constructor(htmlElement = null)
    {
        this.associatedElement = htmlElement.querySelector("input[type='checkbox']");
        this.play = false;
        this.associatedElement.checked = this.play;
    }

    switch()
    {
        this.play = this.play ? false : true;
        this.associatedElement.checked = this.play;
    }

    getAssociatedElement()
    {
        return this.associatedElement;
    }

    get playState()
    {
        this.associatedElement.dataset.playing = true;
        return this.play;
    }
}

function createStepSequencerBackend(element)
{
    console.log(element);
    channels[element.dataset.id] = new Channel(element);
}

function checkStep(id, step)
{
    channels[id].switch(step);
}

function setMidiChannel(id, channel)
{
    console.log("Setting Seq" + id + " to Midi Channel " + channel);
    channels[id].setMidiChannel(channel);
}

function setMidiChannelUi(e)
{
    let channelId = e.srcElement.dataset.channel;
    midiChannel = getSelectedOption(e.srcElement);
    setMidiChannel(channelId, midiChannel);
    //console.log(channelId);
}

function getSelectedOption(optionsElement)
{
    console.log(optionsElement);
    return optionsElement.options[optionsElement.selectedIndex].value;
}

function setChannelNote(id, note)
{
    channels[id].setNote(note);
}

function setChannelNoteUi(e)
{
    let note = parseInt(getSelectedOption(e.srcElement));
    let channelId = e.srcElement.parentElement.parentElement.dataset.id;
    
    setChannelNote(channelId, note);
}

function resetInternalCounters()
{
    for (let e in channels)
    {
        channels[e].resetInternalCounters();
    }
}