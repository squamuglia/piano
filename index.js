//NEW AUDIOCONTEXT
const ac = new(window.AudioContext || 
    window.webkitAudioContext || 
    window.mozAudioContext || 
    window.oAudioContext || 
    window.msAudioContext);

    //CONSTANTS VARIABLES
const frequencyList = {"C": 32.70, "C#":34.65, "D":36.71, "Eb":38.89,	"E":41.20, "F":43.65, "F#":46.25,	"G":49.00, "G#":51.91,	"A":55.00,	"Bb":58.27,	"B":61.74} // frequency - key hash
const keyValues = { "A":"C", "W":"C#", "S":"D", "E":"Eb", "D":"E", "F":"F" , "R":"F#", "G":"G" , "T":"G#", "H":"A" , "Y":"Bb", "J":"B" } //key - note hash for keypress

//DYNAMIC VARIABLES
const aBoolObjects = {}
const noteObjects = {}

//BUTTONS
const frqRange = document.getElementById('frqRange')

//VOLUME & WAVEFORM FUNCTIONALITY
let volumeControl = document.querySelector("input[name='volume']");
const masterGainNode = ac.createGain();

masterGainNode.connect(ac.destination);

masterGainNode.gain.value = volumeControl.value;

function changeVolume(event) { masterGainNode.gain.value = volumeControl.value }

volumeControl.addEventListener("change", changeVolume, false);

//Creates custom waveform for oscillators in createNote
const sineTerms = new Float32Array([0, 0, 1, 0, 1]);
const cosineTerms = new Float32Array(sineTerms.length);
const customWaveform = ac.createPeriodicWave(cosineTerms, sineTerms);


//play button and song variables
const playBtn = document.getElementById("play")
let currentSongId = ""
let currentSong = []

playBtn.addEventListener("click", function(){ //plays selected song when play is clicked
    playSong(currentSong)
    playBtn.disabled = true
    playBtn.style="background:grey;color:#fff;"
    setTimeout(() => { playBtn.disabled = false; playBtn.style="" }, endNoteTime*1000)
})

//NOTES
//builds noteObjects from list of notes and their frequencies (frequencyList)
function createNote(key) { //for each note, 
    let osc = ac.createOscillator();
    let frequency = frequencyList[key]
    osc.frequency.value = frequency*frqRange.value;
    osc.setPeriodicWave(customWaveform); //waveform for tone
    osc.connect(masterGainNode);
    noteObjects[key] = osc;
    aBoolObjects[key] = true;
}

//Iterates over frequency list
function createNotes() { 
    Object.keys(frequencyList).forEach(
        key => createNote(key)
    )
}

createNotes()

//PLAYING FUNCTIONALITY
//Monkey patching adding startTime function to OscillatorNode to save ac.currentTime on each instance
OscillatorNode.prototype.startTime = function () { this.starter = ac.currentTime}

//Plays notes from playSong() and eventlisteners
function playNote(note, duration, timeIn) {
    createNote(note); //create new oscillator object to reset pitch
    aBoolObjects[note] = false;

    let osc = noteObjects[note]
    osc.startTime() //sets start time (.starter) of new oscillator
    if (timeIn) {
        songNoteStarter(note, duration, timeIn, osc)
    } else { 
        singleNoteStarter(osc, note)
        }
}

const getKey = (note) => document.getElementById(note) //Get key closure

function songNoteStarter(note, duration, timeIn, osc) {
    osc.start(ac.currentTime + timeIn);
    stopNote(note, duration, timeIn);
    setTimeout(()=> { getKey(note).style="background: #fff7ae!important" }, timeIn*1000)
}

function singleNoteStarter(osc, note) {
    osc.start(); 
    getKey(note).style="background: #fff7ae!important;" //highlights current note
}

function stopNote(note, duration, timeIn) {
    let osc = noteObjects[note]

    if (duration) {
        songNoteStopper(note, duration, timeIn, osc)
    } else {
        singleNoteStopper(osc, note)
    }

    aBoolObjects[note] = true;

    let lengthSecNote = ac.currentTime - osc.starter // note duration
    let timeInNote = osc.starter - newRecordingTimeIn
    noteRecorder(note, lengthSecNote, timeInNote) //saves note on Recording Variable
}

function songNoteStopper(note, duration, timeIn, osc) {
    osc.stop(ac.currentTime + timeIn + duration);
    setTimeout(()=> getKey(note).style="", (timeIn + duration)*1000)
}

function singleNoteStopper(osc, note) {
    osc.stop()
    getKey(note).style=""
}

//REPLAY SONG FUNCTIONALITY
//iterates over the array and plays the song
let endNoteTime = ""
function playSong(song) {
    song.notes.forEach(
        note => { playNote(note.note, note.duration, note.time_in); endNoteTime = note.time_in + note.duration }
    )
 }

//PLAY NOTES WITH EVENTLISTENERS
//plays note when pressing key

const getKeyValues = (event) => keyValues[event.key.toUpperCase()]

document.addEventListener('keydown',
    function (event) {
      if (aBoolObjects[getKeyValues(event)]) {
          playNote( getKeyValues(event) )
        }
    }
)

document.addEventListener('keyup',
   function (event){
    if (aBoolObjects[getKeyValues(event)] == false) {
        stopNote( getKeyValues(event) )
    }
   }
)

//plays note when clicking keyboard
document.addEventListener('mousedown',
  function(event) {
        if (event.target.className.includes('note')) {
            let note = event.target.dataset.note
            playNote(note)
        }
  }
)

document.addEventListener('mouseup',
  function(event) {
        if (event.target.className.includes('note')) {
            let note = event.target.dataset.note
            stopNote(note)
        }
  }
)

//RECORDING FUNCTIONALITY
let recording = false
let newRecording = []//const to let
let newRecordingTimeIn = ""

const recordBtn = document.getElementById('record')

recordBtn.addEventListener('click',
    function(event) {
        recording = !recording
        console.log(recording)
        if (recording) {
            startRecording()
        } else {
            stopRecording()
        }
    }
)

const startRecording = () => {
    recordBtn.innerHTML = "Stop"
    recordBtn.style="background:red;color:#fff;"
    saveBtn.style="background:grey;color:#fff;"
    saveBtn.disabled = true
    newRecording = []
    newRecordingTimeIn = ac.currentTime
}

const stopRecording = () => {
    recordBtn.innerHTML = "Record"
    recordBtn.style=""
    saveBtn.style=""
    saveBtn.disabled = false
}


function noteRecorder(note, duration, timeIn) {
    if (recording === false) {
        return
    } else {
        let newNote = new Note(note, duration, timeIn)
        newRecording.push(newNote)
    }
}

//SAVING FUNCTIONALITY
const saveBtn = document.getElementById('save_song')
const songInputName = document.getElementById('song_name')


saveBtn.addEventListener('click',
    function () {

        saveBtn.style="background:red;color:#fff;";
        saveBtn.innerHTML = "Saving";
        setTimeout(function() { saveBtn.style= ""; saveBtn.innerHTML = "Save"; songInputName.value = "Your song was saved! Click Copy." }, 1000);

        currentSong = {name: songInputName.value, notes: newRecording}
        songToURL(currentSong)
        
        setTimeout(()=> songInputName.value = "Record Another Song!", 5000)
    }
)

let songLocation

function songToURL() {
    songLocation = window.location.href + "#" + encodeURIComponent(JSON.stringify(currentSong))
    console.log(songLocation)
}

function urlToSong() {
    let uri = decodeURIComponent(window.location.href.split("#")[1])
    currentSong = JSON.parse(uri)
}

urlToSong()

document.getElementById('url_song_name').value = currentSong.name

const copyBtn = document.getElementById('copy_url')

copyBtn.addEventListener('click', e => {
    urlToSong()
    copyToClipboard(songLocation)
    songInputName.value = "Your Song Was Copied. Share With Your Friends!"
    setTimeout(()=> songInputName.value = "Record Another Song!", 5000)
})

  function isOS() {
    return navigator.userAgent.match(/ipad|iphone/i);
  }
  
  function copyToClipboard (msg) {
    try {
      const text = document.createElement('textarea')
      text.value = msg
      text.style.cssText = 'position: absolute; left: -9999px;'
      document.body.appendChild(text)
  
      if (isOS()) {
        const range = document.createRange()
        range.selectNodeContents(text)
  
        const selection = window.getSelection()
  
        selection.removeAllRanges()
        selection.addRange(range)
        text.setSelectionRange(0, 999999);
      } else {
        text.select();
      }
  
      document.execCommand('copy')
      text.blur()
      document.body.removeChild(text)
    } catch (err) {
      window.prompt('Press Cmd+C or Ctrl+C to copy to clipboard.', msg)
    }
  }
  
  
