const $ = id => document.getElementById(id);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let opened = false;
let paused = reduceMotion.matches;
let dancer = null;
let loadingDancer = null;
let confettiTimer;

function updateDance() {
  $('inside').classList.toggle('paused', paused);
  $('dance-toggle').textContent = paused ? '▶' : 'Ⅱ';
  $('dance-toggle').setAttribute('aria-pressed', String(paused));
  $('dance-toggle').setAttribute('aria-label', paused ? "Play Starbot's dance" : "Pause Starbot's dance");
  dancer?.setPlaying(opened && !paused && !document.hidden);
}
function celebrate() {
  clearTimeout(confettiTimer);
  $('confetti').replaceChildren();
  if (reduceMotion.matches) return;
  const colors = ['#edb2c8', '#b7cbaa', '#e8ca7d', '#d3bddf', '#f8dedf'];
  for (let i = 0; i < 38; i++) {
    const bit = document.createElement('i');
    bit.style.setProperty('--x', `${Math.random() * 100}%`);
    bit.style.setProperty('--c', colors[i % colors.length]);
    bit.style.setProperty('--delay', `${Math.random() * .6}s`);
    bit.style.setProperty('--drift', `${Math.random() * 200 - 100}px`);
    bit.style.setProperty('--turn', `${Math.random() * 720 - 360}deg`);
    $('confetti').append(bit);
  }
  confettiTimer = setTimeout(() => $('confetti').replaceChildren(), 3600);
}
async function loadDancer() {
  if (!loadingDancer) loadingDancer = import('./starbot.js').then(module => module.mountStarbot($('canvas-host'), $('robot-fallback')));
  try { dancer = await loadingDancer; updateDance(); }
  catch { /* The inline Starbot illustration keeps dancing if WebGL is unavailable. */ }
}
$('open-card').addEventListener('click', () => {
  opened = true;
  $('delivery').hidden = true;
  $('inside').hidden = false;
  $('open-card').setAttribute('aria-expanded', 'true');
  updateDance();
  celebrate();
  $('letter-title').focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
  loadDancer();
});
$('close-card').addEventListener('click', () => {
  opened = false;
  updateDance();
  $('inside').hidden = true;
  $('delivery').hidden = false;
  $('open-card').setAttribute('aria-expanded', 'false');
  $('confetti').replaceChildren();
  $('open-card').focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
});
$('dance-toggle').addEventListener('click', () => { paused = !paused; updateDance(); });
document.addEventListener('visibilitychange', updateDance);
reduceMotion.addEventListener('change', () => { paused = reduceMotion.matches; updateDance(); });
updateDance();
