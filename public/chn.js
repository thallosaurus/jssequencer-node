const STEPSEQUENCER = 0;

let stepSequencerCount = 0;

function initChn()
{
    console.log("Hello World!");
    /*this.document.getElementById("addNewStepSequencer")
        .addEventListener("click", (e) => {this.appendNewSequencer()});*/

    //Append a new Sequencer on start
    //appendNewSequencer(16);

    //initTransport(document.querySelectorAll("[data-role='playbutton']"));

    //gets called as internal sync call
    /*socket.on('ts', (data) => {
        console.log(data);
    });*/

    //socket.on("seq_data", (data) => console.log(data));
}

/*function getStepSequencerCount()
{
    return stepSequencerCount;
}*/

function appendNewSequencer(c)
{
    console.log(c);
    //let stepCounter = c != undefined ? c : parseInt(prompt("How many channels?", 16));
    //if (stepCounter != NaN)
    {
        document.querySelectorAll("span#channels")
        .forEach((e) => {
            e.append(createInputsForChannel(stepCounter));
            stepSequencerCount = ++e.dataset.sequencers;
        });
    }
}

function deleteSpecificSequencer(id)
{
    document.querySelectorAll("[data-id='" + id + "'][data-type='0'")
    .forEach((e) => {
        console.log(e);
        console.log(e.parentElement.dataset);

        delete channels[id];

        //e.parentElement.dataset.sequencers--;
        //stepSequencerCount = e.parentElement.dataset.sequencers;

        e.parentElement.removeChild(e);
    });
}

function createInputsForChannel(stepCounter = 16)
{
    //create the channel strip which holds all inputs
    let channelStrip = document.createElement("div");
    channelStrip.className = "channel-strip";
    channelStrip.dataset.id = getStepSequencerCount();
    channelStrip.dataset.type = STEPSEQUENCER;

    let steps = document.createElement("span");
    steps.className = "step-selector";

    for (let i = 0; i < stepCounter; i++)
    {
        //for custom checkbox support
        let label = document.createElement("label");
        label.className = "chk-container";

        let tmpInput = document.createElement("input");
        tmpInput.type = "checkbox";
        tmpInput.dataset.step = i;
        tmpInput.dataset.channel = getStepSequencerCount();
        tmpInput.dataset.buttonType = STEPSEQUENCER;

        //tmpInput.addEventListener("change", stepClickHandler);
        //tmpInput.addEventListener("dblclick", changeVelocity);
        label.append(tmpInput);

        let checkmarkCustomStyle = document.createElement("span");
        checkmarkCustomStyle.className = "checkmark";
        label.append(checkmarkCustomStyle);

        steps.append(label);
    }
    channelStrip.append(steps);

    createStepSequencerBackend(channelStrip);

    //add midi channel selector
    let channelSettings = document.createElement("span");
    channelSettings.className = "channel-settings";
    channelSettings.append(createMidiSelector(getStepSequencerCount()));

    let noteSelector = createNoteDropdown("C2");
    //noteSelector.value = "C5";
    noteSelector.addEventListener("change", setChannelNoteUi);
    channelSettings.append(noteSelector);

    let delSequencer = document.createElement("input");
    delSequencer.type = "button";
    delSequencer.dataset.forSequencer = channelStrip.dataset.id;
    delSequencer.value = "-";
    delSequencer.addEventListener("click", (e) => {deleteSpecificSequencer(getAssociatedStepSequencerForDeleteButton(e))})
    channelSettings.append(delSequencer);

    channelStrip.append(channelSettings);

    return channelStrip;
}

function getAssociatedStepSequencerForDeleteButton(e)
{
    return e.srcElement.dataset.forSequencer;
}

function getStepFromStepHandler(e)
{
    return (
        e.srcElement.dataset.buttonType == STEPSEQUENCER
        ? e.srcElement.dataset.step
        : null
    );
}

function getChannelFromStepHandler(e)
{
    return (
        e.srcElement.dataset.buttonType == STEPSEQUENCER
        ? e.srcElement.dataset.channel
        : null
    ); 
}

function stepClickHandler(e)
{
    e.stopPropagation();
    e.srcElement.checked = false;
    let step = getStepFromStepHandler(e);
    let channel = getChannelFromStepHandler(e);

    checkStep(channel, step);
    return false;
}

function createMidiSelector(id ,preselectedChannel = 0)
{
    let select = document.createElement("select");
    select.dataset.channel = id;
    for (let i = 0; i < 16; i++)
    {
        let option = document.createElement("option");
        option.value = i + 1;
        option.innerText = i + 1;
        select.append(option);
    }

    select.addEventListener("change", setMidiChannelUi);

    return select;
}

function changeVelocity(e)
{
    console.log("Double Click");
}

function createNoteDropdown(preselect)
{
    let select = document.createElement("select");
    select.dataset.id = getStepSequencerCount();
    for(let i = midiData.length - 1; i >= 0; i--)
    {
        let option = document.createElement("option");
        option.value = i;
        option.innerText = midiData[i];

        if (midiData[i] == preselect)
        {
            option.selected = "true";
        }
        select.append(option);
    }
    return select;
}