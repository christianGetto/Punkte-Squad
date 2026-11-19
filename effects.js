// Short original arcade cues. Both selection and XP use the squad's instrument.
function squadCue(team, amount = 0) {
  if (!enabled) return;
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    audio.resume().catch(() => {});
    const start = audio.currentTime;
    function tone(delay, from, to, duration, wave = 'triangle', volume = .10) {
      const voice = audio.createOscillator(), gain = audio.createGain();
      const t = start + delay;
      voice.type = wave;
      voice.frequency.setValueAtTime(from, t);
      voice.frequency.exponentialRampToValueAtTime(to, t + duration);
      gain.gain.setValueAtTime(.0001, t);
      gain.gain.exponentialRampToValueAtTime(volume, t + .009);
      gain.gain.exponentialRampToValueAtTime(.0001, t + duration);
      voice.connect(gain); gain.connect(audio.destination);
      voice.start(t); voice.stop(t + duration + .01);
    }
    function grit(delay, frequency, duration) {
      const data = audio.createBuffer(1, Math.ceil(audio.sampleRate * duration), audio.sampleRate);
      const samples = data.getChannelData(0);
      for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
      const noise = audio.createBufferSource(), filter = audio.createBiquadFilter(), gain = audio.createGain();
      const t = start + delay;
      noise.buffer = data; filter.type = 'bandpass'; filter.frequency.value = frequency;
      gain.gain.setValueAtTime(.24, t); gain.gain.exponentialRampToValueAtTime(.0001, t + duration);
      noise.connect(filter); filter.connect(gain); gain.connect(audio.destination); noise.start(t);
    }
    for (let i = 0; i < Math.max(1, amount); i++) {
      const t = i * .14, k = 1 + i * .08;
      switch (team) {
        case 0: {
          // A stepped pulse-wave scoop, high crest and quick downward flick.
          const pitches = [380, 280, 365, 465, 590, 750, 940, 1120, 880];
          pitches.forEach((hz, step) => tone(t + step * .017, hz*k, hz*k, .025, 'square', .039));
          tone(t + .145, 860*k, 540*k, .055, 'square', .03);
          break;
        }
        case 1: [660,880,1100].forEach((f,j)=>tone(t+j*.045,f*k,f*k,.19,'sine')); break;
        case 2: grit(t, 2900, .065); tone(t+.03, 1650*k, 540*k, .13,'sawtooth',.035); break;
        case 3: tone(t, 170, 47, .16,'sine',.22); grit(t+.055, 1800, .10); break;
        case 4: tone(t, 1280*k, 1280*k,.18,'sine'); tone(t+.055,1980*k,1980*k,.21,'sine'); break;
        case 5: grit(t, 580,.13); grit(t+.07, 950,.09); tone(t, 105, 48,.11,'triangle',.16); break;
      }
    }
  } catch { /* Visual feedback is always available. */ }
}
const emblems = [
  ['🍄','#ff473f'], ['💎','#41db94'], ['⚡','#ffe51b'],
  ['💣','#ff983d'], ['⭕','#ffcb26'], ['🟫','#7de859']
];
function xpBurst(button, team, amount) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !button.animate) return;
  const [symbol, color] = emblems[team];
  button.animate([{transform:'scale(.93)'},{transform:'scale(1.09)',boxShadow:'0 0 20px '+color},{transform:'scale(1)'}],{duration:340});
  const box=button.getBoundingClientRect();
  for(let i=0;i<4+amount*2;i++){
    const bit=document.createElement('span');
    bit.className='xp-spark'; bit.setAttribute('aria-hidden','true');
    bit.textContent=team===4?'':symbol;
    if(team===0 || team===3) bit.style.fontSize=(30+amount*2)+'px';
    if(team===3) bit.style.filter='drop-shadow(0 -3px 4px #ffae34)';
    if(team===4)bit.classList.add('gold-ring');
    bit.style.left=box.left+box.width/2+'px'; bit.style.top=box.top+8+'px'; bit.style.color=color;
    document.body.append(bit);
    const angle=Math.PI*(.1+.8*i/(3+amount*2)), reach=65+amount*15+Math.random()*32;
    const dx=Math.cos(angle)*reach,dy=-Math.sin(angle)*reach;
    const flight=bit.animate([{transform:'translate(-50%,0) scale(.4)',opacity:0},{offset:.18,opacity:1},{offset:.72,transform:'translate('+dx+'px,'+dy+'px) rotate('+dx+'deg)',opacity:1},{transform:'translate('+dx*1.2+'px,'+(dy+22)+'px) scale(.6)',opacity:0}],{duration:580+amount*60,fill:'both'});
    flight.onfinish=()=>bit.remove();flight.oncancel=()=>bit.remove();
  }
}
