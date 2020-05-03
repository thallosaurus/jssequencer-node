let midiData = [
    "C#-1", "D-1", "D#-1", "E-1", "F-1", "F#-1", "G-1", "G#-1", "A-1", "A#-1", "B-1",
    "C0", "C#0", "D0", "D#0", "E0", "F0", "F#0", "G0", "G#0", "A0", "A#0", "B0",
    "C1", "C#1", "D1", "D#1", "E1", "F1", "F#1", "G1", "G#1", "A1", "A#1", "B1",
    "C2", "C#2", "D2", "D#2", "E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2",
    "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3",
    "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
    "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5",
    "C6", "C#6", "D6", "D#6", "E6", "F6", "F#6", "G6", "G#6", "A6", "A#6", "B6",
    "C7", "C#7", "D7", "D#7", "E7", "F7", "F#7", "G7", "G#7", "A7", "A#7", "B7",
    "C8", "C#8", "D8", "D#8", "E8", "F8", "F#8", "G8", "G#8", "A8", "A#8", "B8",
    "C9", "C#9", "D9", "D#9", "E9", "F9", "F#9", "G9", "G#9"
];

function createInputsForChannel(data, id, callback)
{
    //create the channel strip which holds all inputs
    let channelStrip = document.createElement("div");
    channelStrip.className = "channel-strip";
    channelStrip.dataset.id = id;//getStepSequencerCount();
    channelStrip.dataset.type = 0;

    

    let steps = document.createElement("span");
    steps.className = "step-selector";

    for (let i = 0; i < data.channel.length; i++)
    {
        //for custom checkbox support
        let label = document.createElement("label");
        label.className = "chk-container";

        let tmpInput = document.createElement("input");
        tmpInput.type = "checkbox";
        tmpInput.dataset.step = i;
        tmpInput.dataset.channel = id;
        tmpInput.dataset.buttonType = 0;

        if (data.channel[i].playMe)
        {
            tmpInput.checked = true;
            tmpInput.dataset.play = true;
        }

        tmpInput.addEventListener("change", callback);
        //tmpInput.addEventListener("dblclick", changeVelocity);
        label.append(tmpInput);

        let checkmarkCustomStyle = document.createElement("span");
        checkmarkCustomStyle.className = "checkmark";
        label.append(checkmarkCustomStyle);

        steps.append(label);
    }
    channelStrip.append(steps);

    //createStepSequencerBackend(channelStrip);

    //add midi channel selector
    let channelSettings = document.createElement("span");
    channelSettings.className = "channel-settings";
    //channelSettings.append(createMidiSelector(0));
    
    console.log(data);

    let noteSelector = createNoteDropdown(id, data.note);
    //noteSelector.value = "C5";
    noteSelector.addEventListener("change", setChannelNoteUi);
    channelSettings.append(noteSelector);

    let name = document.createElement("span");
    //console.log(data);
    name.innerText = data.name;
    channelSettings.append(name);

    channelStrip.append(channelSettings);
    
    /*
    let delSequencer = document.createElement("input");
    delSequencer.type = "button";
    delSequencer.dataset.forSequencer = channelStrip.dataset.id;
    delSequencer.value = "-";
    delSequencer.addEventListener("click", (e) => {deleteSpecificSequencer(getAssociatedStepSequencerForDeleteButton(e))})
    channelSettings.append(delSequencer);*/

    return channelStrip;
}

function setChannelNoteUi(e)
{
    let note = parseInt(getSelectedOption(e.srcElement));
    let channelId = e.srcElement.parentElement.parentElement.dataset.id;

    socket.emit("change_note_for_channel", {"note": note, "channel": channelId});
    
    //setChannelNote(channelId, note);
}

function setBPMInput(e)
{
    e.stopPropagation();
    console.log(e.value);
    changeBpm(parseInt(e.value));
}

function createNoteDropdown(id, preselect)
{
    //console.log(id);
    let select = document.createElement("select");
    select.dataset.id = id;
    for(let i = midiData.length - 1; i >= 0; i--)
    {
        let option = document.createElement("option");
        option.value = i;
        option.innerText = midiData[i];

        //console.log(preselect);
        if (i == preselect)
        {
            option.selected = "true";
        }
        select.append(option);
    }
    return select;
}

function getSelectedOption(optionsElement)
{
    console.log(optionsElement);
    return optionsElement.options[optionsElement.selectedIndex].value;
}