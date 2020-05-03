let playing = false;
let playButtonElem = null;

let animClockId = null;

let ts = 0;
let lastPlayPress = 0;
let relativeTime = 0;
let qu = 0;

let bpm = 128;

let noteTimer = 0;

let midiDeviceIndex = -1;

let resolution = 4;

let midiClockBeat = false;
let midiClockDelta = 0;

//clock resolution in ppq 
let midiClockResolution = 48;

let midiClockStopped = true;

let midiOverrideDebug = true;

let transportViewShowTime = false;

function play(e)
{
    ts = e;
    updatePlayButton();
    if (playing)
    {
        relativeTime = e - lastPlayPress;
        noteTimer = relativeTime;

        sendMidiClock(relativeTime);

        if (noteTimer > qu * ((60000 / bpm) / resolution))
        {
            playStep();
            qu++;            
        }
        updateTransportShow(relativeTime);
    }
    else
    {
        qu = 0;
        stopMidiClock();
    }
    animClockId = requestAnimationFrame(play);
}

function playStep()
{
    for (e in channels)
    {
        let step = channels[e].getCurrentStep();
        if (step)
        {
            //MIDI Implementation here:
            let note = channels[e].getMidiNote();
            console.log(note.note, note.midiChannel, note.velocity);
            sendMidiNote(note);
        }
    }
    advanceStep();
}

function initTransport(elements)
{
    playButtonElem = elements;
    initMidi();
    animClockId = requestAnimationFrame(play);

    document.querySelectorAll("[data-role='speed']")
    .forEach((e) => {
        e.querySelectorAll("input[type='radio']").forEach((f) => {
            f.addEventListener("change", changeSpeed);
        });        
    });

    document.querySelectorAll("[data-role='position-view']")
    .forEach((e) => {
        e.addEventListener("click", switchTransportView);
    });
}

function playButton()
{
    playing = playing ? false : true;

    if (playing)
    {
        lastPlayPress = ts;
    }
    else
    {
        resetInternalCounters();
    }
}

function updatePlayButton()
{
    playButtonElem.forEach((e) => {e.value = playing ? "Stop" : "Play"});
}

function advanceStep()
{
    for (e in channels)
    {
        //console.log(e);
        channels[e].next();
    }
}

function changeBpm(e)
{
    console.log(e);
    bpm = e.value;
    changeBpmUi();
}

function changeBpmUi()
{
    document.querySelectorAll("[data-role='bpm']")
    .forEach((e) => {
        e.value = bpm;
    });
}

//MIDI Implementation here:
function initMidi()
{
    /*WebMidi.enable(function (err) {
        if (err) throw err;

        console.log(WebMidi.outputs);

        document.querySelectorAll("[data-role='device']").forEach((e) => {
            createDeviceDropdown(e, WebMidi);
            if (WebMidi.outputs.length == 0)
            {
                e.disabled = true;
            }
            e.addEventListener("change", changeDevice);
        });
    });*/
}

function createDeviceDropdown(origin, midi)
{
    if (WebMidi.outputs.length != 0)
    {
        for (let e = 0; e < midi.outputs.length; e++) {
            console.log(midi.outputs);
            let option = document.createElement("option");
            option.value = e;
            option.innerText = midi.outputs[e].name;
            origin.append(option);
        };
    }
    else
    {
        let option = document.createElement("option");
        option.value = -1;
        option.innerText = "--no devices available--";
        origin.append(option);
    }
}

function switchTransportView()
{
    transportViewShowTime = !transportViewShowTime;
}

//let transportDisplay = [1, 1];

function updateTransportShow(val)
{
    document.querySelectorAll("[data-role='position-view']")
    .forEach((e) => {
        if (!transportViewShowTime)
        {
            let bigNumber = Math.floor(val / ((60000 / bpm) / 0.25));
            let middleNumber = Math.floor(val / ((60000 / bpm) / 1));
            let remainder = (val / (60000 / bpm) % 1) * 1000;
            
            e.value = bigNumber + "." + (middleNumber % 4) + "." + zero(Math.floor(remainder));
        }
        else
        {
            let milliseconds = Math.floor(val % 1000);
            let seconds = Math.floor((val / 1000) % 60);
            let minutes = Math.floor((val / 60000) % 60);
            let hours = minutes / 60;

            e.value = zeroTime(hours) + ":" + zeroTime(minutes) + ":" + zeroTime(seconds) + "." + zero(milliseconds);
        }
    });
    
}

function zero(num)
{
    if (num < 10)
    {
        return "00" + num;
    } else if (num < 100)
    {
        return "0" + num;
    } else {
        return num;
    }
}

function zeroTime(num)
{
    if (num < 10)
    {
        return "0" + num;
    } else
    {
        return num + "";
    }
}

function sendMidiSocket(msg)
{
    socket.emit("message", msg);
}