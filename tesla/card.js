const $ = id => document.getElementById(id);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let opened = false;
let paused = reduceMotion.matches;
let dancer = null;
let loadingDancer = null;
let confettiTimer;

function updateDance() {
  $('inside').classList.toggle('paused', paused || document.hidden);
  document.body.classList.toggle('animations-paused', paused || document.hidden);
  if (reduceMotion.matches) $('shooting-stars').replaceChildren();
  $('dance-toggle').textContent = paused ? '▶' : 'Ⅱ';
  $('dance-toggle').setAttribute('aria-pressed', String(paused));
  $('dance-toggle').setAttribute('aria-label', paused ? "Play animations" : "Pause animations");
  dancer?.setPlaying(opened && !paused && !document.hidden);
}
function shootSparklyStar() {
  const layer = $('shooting-stars');
  layer.replaceChildren();
  if (reduceMotion.matches) return;
  const flight = document.createElement('div');
  flight.className = 'sparkly-shooting-star';
  flight.innerHTML = `<span class="shooting-star-tail"></span>
    <svg class="shooting-star-head" viewBox="0 0 80 80" aria-hidden="true">
      <path d="M40 5 50 27 74 30 56 47 61 72 40 60 19 72 24 47 6 30 30 27Z" fill="#ffe391" stroke="#967044" stroke-width="3" stroke-linejoin="round"/>
      <g fill="#896249"><circle cx="31" cy="40" r="2.5"/><circle cx="49" cy="40" r="2.5"/></g>
      <path d="M34 48Q40 54 46 48" fill="none" stroke="#896249" stroke-width="2.5" stroke-linecap="round"/>
      <g fill="#f2adc4"><ellipse cx="26" cy="46" rx="4" ry="2.5"/><ellipse cx="54" cy="46" rx="4" ry="2.5"/></g>
    </svg>`;
  const sparks = [[3,25,13],[24,65,19],[48,10,16],[69,48,12],[91,76,20],[114,22,14],[132,61,17],[151,6,12]];
  sparks.forEach(([x,y,size], i) => {
    const spark = document.createElement('span');
    spark.className = 'shooting-star-spark'; spark.textContent = '✦';
    spark.style.setProperty('--sx', `${x}px`); spark.style.setProperty('--sy', `${y}px`);
    spark.style.setProperty('--spark-size', `${size}px`); spark.style.setProperty('--spark-delay', `${i * -.09}s`);
    spark.style.setProperty('--spark-color', ['#f4cc78','#edb0cd','#d0bde6'][i % 3]);
    flight.append(spark);
  });
  flight.addEventListener('animationend', event => { if (event.target === flight) flight.remove(); });
  layer.append(flight);
}
function celebrate() {
  clearTimeout(confettiTimer);
  $('confetti').replaceChildren();
  if (reduceMotion.matches) return;
  shootSparklyStar();
  const colors = ['#edb2c8', '#b7cbaa', '#e8ca7d', '#d3bddf', '#f8dedf'];
  for (let i = 0; i < 52; i++) {
    const bit = document.createElement('i');
    if (i % 3 === 0) { bit.className = 'heart'; bit.textContent = '♥'; }
    else if (i % 5 === 0) { bit.className = 'sparkle'; bit.textContent = '✦'; }
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
  if (!loadingDancer) loadingDancer = import('./starbot.js?v=5').then(module => module.mountStarbot($('canvas-host'), $('robot-fallback')));
  try { dancer = await loadingDancer; updateDance(); }
  catch { /* The inline Starbot illustration keeps dancing if WebGL is unavailable. */ }
}
$('open-card').addEventListener('click', () => {
  opened = true;
  $('delivery').hidden = true;
  $('inside').hidden = false;
  $('open-card').setAttribute('aria-expanded', 'true');
  updateDance();
  dancer?.replayDance();
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
  $('shooting-stars').replaceChildren();
  $('open-card').focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
});
$('dance-toggle').addEventListener('click', () => { paused = !paused; updateDance(); });
$('encore').addEventListener('click', () => {
  if (!reduceMotion.matches) paused = false;
  dancer?.replayDance();
  updateDance();
  celebrate();
  $('inside').classList.remove('encore');
  void $('inside').offsetWidth;
  $('inside').classList.add('encore');
});
document.addEventListener('visibilitychange', updateDance);
reduceMotion.addEventListener('change', () => { paused = reduceMotion.matches; updateDance(); });
updateDance();
