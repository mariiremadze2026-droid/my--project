/* ================================================
   MARI'S LIBRARY — JAVASCRIPT
   ================================================ */

// ── 1. LANGUAGE TOGGLE ───────────────────────────
const html = document.documentElement;
const langBtns = document.querySelectorAll('[data-lang-btn]');

function setLanguage(lang) {
  html.setAttribute('data-lang', lang);
  html.setAttribute('lang', lang);

  document.querySelectorAll('[data-ka][data-en]:not([data-lang-btn])').forEach(el => {
    const t = el.getAttribute('data-' + lang);
    if (t) el.textContent = t;
  });

  // Placeholders
  const fname  = document.getElementById('f-name');
  const femail = document.getElementById('f-email');
  const fmsg   = document.getElementById('f-msg');
  const sbtn   = document.getElementById('send-btn');
  if (lang === 'ka') {
    fname  && (fname.placeholder  = 'თქვენი სახელი');
    femail && (femail.placeholder = 'mail@example.com');
    fmsg   && (fmsg.placeholder   = 'თქვენი შეტყობინება...');
    sbtn   && (sbtn.textContent   = 'გაგზავნა');
  } else {
    fname  && (fname.placeholder  = 'Your name');
    femail && (femail.placeholder = 'mail@example.com');
    fmsg   && (fmsg.placeholder   = 'Your message...');
    sbtn   && (sbtn.textContent   = 'Send');
  }

  langBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-lang-btn') === lang));
}

langBtns.forEach(b => b.addEventListener('click', () => setLanguage(b.getAttribute('data-lang-btn'))));

// ── 2. SCROLL REVEAL ─────────────────────────────
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (!e.isIntersecting) return;
    const parent = e.target.closest('.events-grid,.menu-grid,.library-grid,.five-pillars,.audience-grid,.revenue-grid,.gallery-grid');
    const delay  = parent ? Array.from(parent.children).indexOf(e.target) * 70 : 0;
    setTimeout(() => e.target.classList.add('visible'), delay);
    revealObs.unobserve(e.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ── 3. STICKY HEADER ─────────────────────────────
const siteHeader = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  siteHeader.style.background = window.scrollY > 60
    ? 'rgba(15,6,3,0.98)' : 'rgba(28,14,8,0.95)';
});

// ── 4. SMOOTH SCROLL ─────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 75, behavior: 'smooth' });
  });
});

// ── 5. CAFÉ MENU TABS ────────────────────────────
document.querySelectorAll('.mtab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mtab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.getAttribute('data-menu');
    ['coffee','tea','dessert'].forEach(id => {
      const grid = document.getElementById('menu-' + id);
      if (grid) grid.classList.toggle('hidden', id !== target);
    });
    // re-trigger reveals in new tab
    document.querySelectorAll('#menu-' + target + ' .reveal').forEach(el => {
      el.classList.remove('visible');
      setTimeout(() => el.classList.add('visible'), 50);
    });
  });
});

// ── 6. MUSIC PLAYER (simulated) ──────────────────
const tracks = [
  { title: 'Nocturne Op.9 No.2', artist: 'Frédéric Chopin',  dur: '4:32', secs: 272 },
  { title: 'Moonlight Sonata',   artist: 'L. van Beethoven', dur: '5:18', secs: 318 },
  { title: 'Gymnopédie No.1',    artist: 'Erik Satie',       dur: '3:07', secs: 187 },
  { title: 'Clair de Lune',      artist: 'Claude Debussy',   dur: '4:55', secs: 295 },
];

let currentTrack = 0;
let playing = false;
let elapsed  = 0;
let timer    = null;

const playBtn      = document.getElementById('play-btn');
const prevBtn      = document.getElementById('prev-btn');
const nextBtn      = document.getElementById('next-btn');
const trackTitle   = document.getElementById('track-title');
const trackArtist  = document.getElementById('track-artist');
const totalTime    = document.getElementById('total-time');
const currentTime  = document.getElementById('current-time');
const progressFill = document.getElementById('progress-fill');
const vinylDisc    = document.getElementById('vinyl-disc');
const plItems      = document.querySelectorAll('.pl-item');

function fmt(s) {
  return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
}

function loadTrack(i) {
  currentTrack = i;
  elapsed = 0;
  const t = tracks[i];
  trackTitle.textContent  = t.title;
  trackArtist.textContent = t.artist;
  totalTime.textContent   = t.dur;
  currentTime.textContent = '0:00';
  progressFill.style.width = '0%';
  plItems.forEach((p, idx) => p.classList.toggle('active', idx === i));
}

function tick() {
  const t = tracks[currentTrack];
  elapsed++;
  if (elapsed >= t.secs) { stopPlay(); loadTrack((currentTrack + 1) % tracks.length); return; }
  currentTime.textContent  = fmt(elapsed);
  progressFill.style.width = (elapsed / t.secs * 100) + '%';
}

function startPlay() {
  playing = true;
  playBtn.innerHTML = '&#9646;&#9646;';
  vinylDisc.classList.add('spinning');
  timer = setInterval(tick, 1000);
}

function stopPlay() {
  playing = false;
  playBtn.innerHTML = '&#9654;';
  vinylDisc.classList.remove('spinning');
  clearInterval(timer);
}

playBtn && playBtn.addEventListener('click', () => playing ? stopPlay() : startPlay());
prevBtn && prevBtn.addEventListener('click', () => { stopPlay(); loadTrack((currentTrack - 1 + tracks.length) % tracks.length); });
nextBtn && nextBtn.addEventListener('click', () => { stopPlay(); loadTrack((currentTrack + 1) % tracks.length); });
plItems.forEach((item, i) => item.addEventListener('click', () => { stopPlay(); loadTrack(i); }));

// progress bar click
const progressBar = document.getElementById('progress-bar');
progressBar && progressBar.addEventListener('click', e => {
  const ratio = e.offsetX / progressBar.offsetWidth;
  elapsed = Math.floor(ratio * tracks[currentTrack].secs);
  currentTime.textContent  = fmt(elapsed);
  progressFill.style.width = (ratio * 100) + '%';
});

// ── 7. LIGHTBOX ──────────────────────────────────
const lightbox    = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

function openLightbox(item) {
  lightboxImg.src = item.querySelector('img').src;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.classList.remove('open');
  lightboxImg.src = '';
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
window.openLightbox  = openLightbox;
window.closeLightbox = closeLightbox;

// ── 8. CONTACT FORM ──────────────────────────────
const sendBtn     = document.getElementById('send-btn');
const formSuccess = document.getElementById('form-success');

sendBtn && sendBtn.addEventListener('click', () => {
  const name  = document.getElementById('f-name').value.trim();
  const email = document.getElementById('f-email').value.trim();
  const msg   = document.getElementById('f-msg').value.trim();
  const lang  = html.getAttribute('data-lang');
  if (!name || !email || !msg) {
    window.alert(lang === 'ka' ? 'გთხოვთ შეავსოთ ყველა ველი.' : 'Please fill in all fields.');
    return;
  }
  sendBtn.disabled = true;
  sendBtn.style.opacity = '0.6';
  sendBtn.textContent = lang === 'ka' ? 'იგზავნება...' : 'Sending...';
  setTimeout(() => {
    ['f-name','f-email','f-msg'].forEach(id => document.getElementById(id).value = '');
    sendBtn.style.display = 'none';
    formSuccess.classList.remove('hidden');
    setTimeout(() => {
      sendBtn.style.display  = '';
      sendBtn.style.opacity  = '1';
      sendBtn.disabled       = false;
      sendBtn.textContent    = lang === 'ka' ? 'გაგზავნა' : 'Send';
      formSuccess.classList.add('hidden');
    }, 4000);
  }, 1200);
});

// ── 9. HERO PARALLAX ─────────────────────────────
const heroBg = document.querySelector('.hero-bg');
window.addEventListener('scroll', () => {
  if (heroBg) heroBg.style.transform = `translateY(${window.scrollY * 0.3}px)`;
});

// ── INIT ─────────────────────────────────────────
setLanguage('ka');
loadTrack(0);