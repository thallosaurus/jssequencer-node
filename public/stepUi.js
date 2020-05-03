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
    /*let channelSettings = document.createElement("span");
    channelSettings.className = "channel-settings";
    channelSettings.append(createMidiSelector(0));

    let noteSelector = createNoteDropdown("C2");
    //noteSelector.value = "C5";
    noteSelector.addEventListener("change", setChannelNoteUi);
    channelSettings.append(noteSelector);

    let delSequencer = document.createElement("input");
    delSequencer.type = "button";
    delSequencer.dataset.forSequencer = channelStrip.dataset.id;
    delSequencer.value = "-";
    delSequencer.addEventListener("click", (e) => {deleteSpecificSequencer(getAssociatedStepSequencerForDeleteButton(e))})
    channelSettings.append(delSequencer);*/

    return channelStrip;
}