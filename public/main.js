/*ocket.on("update", (data) => {
    console.log(data);
});

socket.on("ts", (ts) => {
    console.log("Timestamp: " + ts);
});

socket.emit("update_message");



function get()
{
    socket.emit("get_current_sequencers");


}*/

var socket = io();

function stop()
{
    socket.emit("stop");
}

function start()
{
    socket.emit("start");
}

class SequencerUI
{
    channels = [];
    constructor()
    {
        this.socket = socket;
        
        this.setupSocket();

        this.socket.emit("get_current_sequencers");
    }



    emitSocket(type, cb)
    {
        this.socket.emit(type, cb);
    }

    removeChannel(i)
    {
        delete this.channels[i];
    }

    removeAllChannels()
    {
        document.querySelectorAll("span#channels")
        .forEach((e) => {
            console.log(e);
//            e.removeChild(e);
            /*for (let i = 0; i < e.childElementCount; i++)
            {
                console.log(e.children[i]);
                e.removeChild(e.children[i]);
            }*/
            e.innerHTML = "";
        });
    }

    clearChannel(i)
    {
        this.channel
    }

    addChannel(i, data)
    {
        this.channels.push(new Channel(i, data, this.stepClickHandler));
    }

    createStepSequencer(data)
    {
        console.log(data);
        this.removeAllChannels();
        for (let i = 0; i < data.length; i++)
        {
            this.addChannel(i, data[i]);
        }
    }

    setupSocket()
    {
        this.socket.on("sequpdate", (data) => {
            //console.log(data);
            this.createStepSequencer(JSON.parse(data));
        });

        this.socket.on("update", (data) => {
            this.animate(data);
        })

        this.socket.on("ts", data => {
            console.log(data);
        });

        this.socket.on("play", (data) => {
            console.log(data);
        });

        this.socket.on("stop", (data) => {
            console.log(data);
        });
    }

    animate(time)
    {
        let elems = document.querySelectorAll(".step-selector")
        .forEach((e) => {
            //e.querySelectorAll(check)
        });
    }

    stepClickHandler(e)
    {
        console.log(e);
        let data = {
            "checked": e.srcElement.checked,
            "step": e.srcElement.dataset.step,
            "channel": e.srcElement.dataset.channel
        }
        //e.srcElement.dataset.check = e.srcElement.checked;
        sendStepChange(data);
    }
}

function sendStepChange(ds)
{
    socket.emit("step", JSON.stringify(ds));
}

new SequencerUI();

class Channel
{
    constructor(id, data, clickHandler)
    {
        //this.id = parseInt(strip.dataset.id);
        //this.stepCount = strip.querySelector(".step-selector").childElementCount;

        this.datalength = data.channel.length;

        this.steps = data.channel;

        //this.internalStepPointer = qu % this.stepCount;

        this.midiChannel = 1;

        this.htmlElement = createInputsForChannel(data, id, clickHandler);
        document.querySelectorAll("span#channels").forEach((e) => {
            e.append(this.htmlElement);
        });

        for (let i = 0; i < this.datalength; i++)
        {
            this.steps[i] = new Step(this.steps[i]["playMe"], i);
        }
        
    }

    flipUi(step, state)
    {
        console.log(this.htmlElement);
//        this.htmlElement.children[step]
    }

    flipSwitch(index)
    {

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

    resetActiveStepIndicator()
    {
        for (let i = 0; i < this.steps.length; i++)
        {
            //console.log(this.steps[i].getAssociatedElement().dataset);
            //this.steps[i].getAssociatedElement().dataset.playing = false;
        }
    }
}

class Step
{
    constructor(play = false, stepId)
    {
        this.stepId = stepId;
        this.play = play;
        //this.associatedElement.checked = this.play;
    }

    switch()
    {
        this.play = this.play ? false : true;
        //this.associatedElement.checked = this.play;
    }

    getAssociatedElement()
    {
        return this.associatedElement;
    }

    get playState()
    {
        //this.associatedElement.dataset.playing = true;
        return this.play;
    }
}