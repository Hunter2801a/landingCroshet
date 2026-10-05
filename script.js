const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const hasHover = matchMedia('(hover:hover) and (pointer:fine)').matches;

$('#year').textContent = new Date().getFullYear();

/* Nav + barra de progreso */
const nav = $('#nav');
const progress = $('#progress');
addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', scrollY > 20);
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
}, { passive: true });

/* Reveal al hacer scroll (escalonado dentro de cada grupo) */
$$('.cards, .steps, .stats, .quotes').forEach(g =>
  $$('.reveal', g).forEach((el, i) => el.style.setProperty('--d', i * 0.1 + 's'))
);
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

/* Pantalla de carga: se va cuando todo cargó (mínimo 1.6 s para que se alcance a ver) y recién ahí
   arrancan las animaciones de entrada. Tope de 6 s por si algo se cuelga. */
const loader = $('#loader');
const started = performance.now();
let finished = false;
function finishLoading() {
  if (finished) return;
  finished = true;
  loader.classList.add('done');
  document.documentElement.classList.remove('loading');
  setTimeout(() => $$('.reveal').forEach(el => io.observe(el)), 250);
  setTimeout(() => loader.remove(), 800);
}
const afterLoad = () => setTimeout(finishLoading, Math.max(0, 1600 - (performance.now() - started)));
document.readyState === 'complete' ? afterLoad() : addEventListener('load', afterLoad);
setTimeout(finishLoading, 6000);

/* Contadores animados */
const counters = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count, t0 = performance.now(), dur = 1800;
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    counters.unobserve(el);
  });
}, { threshold: 0.6 });
$$('[data-count]').forEach(el => counters.observe(el));

/* El botón flotante de WhatsApp se esconde cuando ya se ve la sección de contacto */
const wa = $('#waFloat');
new IntersectionObserver(([e]) => wa.classList.toggle('hide', e.isIntersecting), { threshold: 0.35 })
  .observe($('#contacto'));

/* Efectos de puntero: solo donde hay mouse real (en teléfono no aportan y cuestan batería) */
if (hasHover) {
  const art = $('#heroArt'), bear = $('.bear');
  art.addEventListener('mousemove', e => {
    const r = art.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    bear.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
  });
  art.addEventListener('mouseleave', () => (bear.style.transform = ''));

  $$('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(700px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => (card.style.transform = ''));
  });

  const colors = ['#3d7f95', '#b8692f', '#f6d96b', '#d98a52', '#7fb3c4'];
  let last = 0;
  addEventListener('mousemove', e => {
    const now = performance.now();
    if (now - last < 45) return;
    last = now;
    const dot = document.createElement('span');
    dot.className = 'thread';
    dot.style.left = e.clientX - 6 + 'px';
    dot.style.top = e.clientY - 6 + 'px';
    dot.style.background = colors[Math.floor(Math.random() * colors.length)];
    document.body.appendChild(dot);
    requestAnimationFrame(() => {
      dot.style.opacity = 0;
      dot.style.transform = 'scale(.2) translateY(14px)';
    });
    setTimeout(() => dot.remove(), 650);
  });
}
