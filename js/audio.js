/* ==============================================
   POKÉRON — Audio (fichiers + sons synthétisés)
   ============================================== */

const charizardCry = new Audio("assets/sons/charizard-cry.mp3");
const titleTheme = new Audio("assets/sons/title-theme.mp3");
const gameTheme = new Audio("assets/sons/1-04. Game Tutorial.mp3");
const oakTheme = new Audio("assets/sons/06. Professor Oak.mp3");
const battleTheme = new Audio("assets/sons/09. Battle! (Trainer).mp3");
const victoryTheme = new Audio("assets/sons/10. Victory! (Trainer).mp3");
gameTheme.loop = true;
gameTheme.volume = 0.5;
oakTheme.loop = true;
oakTheme.volume = 0.5;
titleTheme.loop = true;
titleTheme.volume = 0.5;
charizardCry.volume = 0.7;
battleTheme.loop = true;
battleTheme.volume = 0.5;
victoryTheme.loop = false;
victoryTheme.volume = 0.5;

// --- Audio Context pour sons synthétisés ---
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

// Son de scintillement — tintement magique/féerique
function playSparkleSound() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;

  const notes = [2637, 3136, 3520, 4186];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;

    const t = now + i * 0.15;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.1, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.value = freq * 2;
    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(0.03, t + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.7);
    osc2.start(t);
    osc2.stop(t + 0.5);
  });
}

// Son d'aspiration — whoosh
function playAnnounceSound() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const duration = 0.6;

  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 5;
  filter.frequency.setValueAtTime(200, now);
  filter.frequency.exponentialRampToValueAtTime(3000, now + duration);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.01, now);
  gain.gain.exponentialRampToValueAtTime(0.25, now + duration * 0.85);
  gain.gain.linearRampToValueAtTime(0, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + duration);

  const sub = ctx.createOscillator();
  const subGain = ctx.createGain();
  sub.type = "sine";
  sub.frequency.setValueAtTime(300, now);
  sub.frequency.exponentialRampToValueAtTime(80, now + duration);
  subGain.gain.setValueAtTime(0.01, now);
  subGain.gain.exponentialRampToValueAtTime(0.12, now + duration * 0.8);
  subGain.gain.linearRampToValueAtTime(0, now + duration);

  sub.connect(subGain);
  subGain.connect(ctx.destination);
  sub.start(now);
  sub.stop(now + duration);
}

// --- Sons de combat ---
function playAttackSound() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const bufferSize = ctx.sampleRate * 0.15;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const d = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) d[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 1000;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2 * settings.sfxVol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start(now);
  src.stop(now + 0.15);
}

function playHitSound() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
  gain.gain.setValueAtTime(0.25 * settings.sfxVol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.2);
}

function playPokeballOpen() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
  gain.gain.setValueAtTime(0.15 * settings.sfxVol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.3);
}

function playVictoryJingle() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    const t = now + i * 0.35;
    gain.gain.setValueAtTime(0.15 * settings.sfxVol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  });
}

function playDefeatSound() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const notes = [440, 349, 294];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const t = now + i * 0.4;
    gain.gain.setValueAtTime(0.15 * settings.sfxVol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  });
}

function playLevelUpSound() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const notes = [523, 587, 659, 698, 784, 880, 988, 1047];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    const t = now + i * 0.1;
    gain.gain.setValueAtTime(0.1 * settings.sfxVol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  });
}

// Son de build-up — aspiration continue de 0s jusqu'au cri (4.2s)
function playBuildUpSound() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const duration = 4.2;

  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 3;
  filter.frequency.setValueAtTime(100, now);
  filter.frequency.exponentialRampToValueAtTime(2000, now + duration);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.005, now);
  gain.gain.exponentialRampToValueAtTime(0.2, now + duration - 0.05);
  gain.gain.linearRampToValueAtTime(0, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + duration);

  const drone = ctx.createOscillator();
  const droneGain = ctx.createGain();
  drone.type = "sawtooth";
  drone.frequency.setValueAtTime(40, now);
  drone.frequency.exponentialRampToValueAtTime(150, now + duration);
  droneGain.gain.setValueAtTime(0.005, now);
  droneGain.gain.exponentialRampToValueAtTime(0.08, now + duration - 0.05);
  droneGain.gain.linearRampToValueAtTime(0, now + duration);

  drone.connect(droneGain);
  droneGain.connect(ctx.destination);
  drone.start(now);
  drone.stop(now + duration);
}

// Son de navigation menu — style GBA "ting"
function playMenuTick() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(1320, now);

  const sfxLevel = 0.08 * (settings.sfxVol / 10);
  gain.gain.setValueAtTime(sfxLevel, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.12);
}

function fadeOutAudio(audio, duration) {
  const startVol = audio.volume;
  const steps = 20;
  const stepTime = duration / steps;
  let step = 0;
  const fade = setInterval(() => {
    step++;
    audio.volume = Math.max(0, startVol * (1 - step / steps));
    if (step >= steps) {
      clearInterval(fade);
      audio.pause();
      audio.volume = startVol;
    }
  }, stepTime);
}
