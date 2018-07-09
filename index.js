const ac = new AudioContext();

function playTone() {
    var osc = ac.createOscillator();

    osc.type = 'sawtooth';
  
    osc.connect(ac.destination);

    osc.frequency.value = 100;
    osc.start();
    osc.stop(ac.currentTime + 0.5);
  }
  
  document.addEventListener('click',
  function(event) {
      if (event.target.id === "start") {
          playTone('start')
      }
  }
)