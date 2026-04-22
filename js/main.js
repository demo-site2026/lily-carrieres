/* ============================================================
   Lily of the Valley — Carrières / Careers
   Flatchr API integration + FR/EN language switcher
   ============================================================ */

const COMPANY_KEY = '2kea8pXwEO9N1o0B';
const API_TOKEN  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzQ4MCwiaWF0IjoxNzc2ODYxMTI1LCJleHAiOjE4MDgzOTcxMjV9.IJU2gvbquqY9sh4fLlriSx5Dee4WWOHLzEYzV0OgsHs';
const API_URL = `https://api.flatchr.io/company/${COMPANY_KEY}/vacancies`;

/* ── i18n strings ──────────────────────────────────────────── */
const i18n = {
  fr: {
    eyebrow:       'Lily of the Valley · Var, France',
    heroTitle:     'Rejoignez\u00a0notre\u00a0équipe',
    heroSubtitle:  'Nous recrutons des talents passionnés pour offrir à nos hôtes une expérience unique au cœur de la Côte d\'Azur.',
    sectionTitle:  'Nos offres d\'emploi',
    allDepts:      'Tous les postes',
    loading:       'Chargement des offres…',
    noJobs:        'Aucune offre disponible pour le moment.',
    errorMsg:      'Impossible de charger les offres. Veuillez réessayer.',
    apply:         'Postuler',
    jobCount:      n => `${n} offre${n > 1 ? 's' : ''}`,
    footerText:    '© 2024 Lily of the Valley · ',
    footerLink:    'lilyofthevalley.com',
    contractTypes: {
      CDI: 'CDI', CDD: 'CDD', Stage: 'Stage', Alternance: 'Alternance',
    },
  },
  en: {
    eyebrow:       'Lily of the Valley · Var, France',
    heroTitle:     'Join\u00a0our\u00a0team',
    heroSubtitle:  'We are looking for passionate talent to deliver an exceptional experience to our guests on the French Riviera.',
    sectionTitle:  'Open positions',
    allDepts:      'All positions',
    loading:       'Loading positions…',
    noJobs:        'No positions available at the moment.',
    errorMsg:      'Unable to load positions. Please try again.',
    apply:         'Apply',
    jobCount:      n => `${n} position${n > 1 ? 's' : ''}`,
    footerText:    '© 2024 Lily of the Valley · ',
    footerLink:    'lilyofthevalley.com',
  },
};

/* ── State ─────────────────────────────────────────────────── */
let currentLang = localStorage.getItem('lily-careers-lang') || 'fr';
let allJobs     = [];
let activeFilter = 'all';

/* ── DOM refs ──────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const els = {
  eyebrow:     $('hero-eyebrow'),
  heroTitle:   $('hero-title'),
  heroSub:     $('hero-subtitle'),
  sectionTitle:$('section-title'),
  jobCount:    $('job-count'),
  filters:     $('filters'),
  grid:        $('jobs-grid'),
  btnFr:       $('btn-fr'),
  btnEn:       $('btn-en'),
  footerText:  $('footer-text'),
  footerLink:  $('footer-link'),
};

/* ── Language ──────────────────────────────────────────────── */
function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('lily-careers-lang', lang);
  document.documentElement.lang = lang;

  els.btnFr.classList.toggle('active', lang === 'fr');
  els.btnEn.classList.toggle('active', lang === 'en');

  const t = i18n[lang];
  els.eyebrow.textContent     = t.eyebrow;
  els.heroTitle.textContent   = t.heroTitle;
  els.heroSub.textContent     = t.heroSubtitle;
  els.sectionTitle.textContent = t.sectionTitle;
  els.footerText.textContent  = t.footerText;
  els.footerLink.textContent  = t.footerLink;

  renderFilters();
  renderJobs();
}

/* ── Flatchr API ───────────────────────────────────────────── */
async function fetchJobs() {
  showLoading();
  try {
    const res = await fetch(API_URL, {
      headers: { 'Authorization': `Bearer ${API_TOKEN}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    allJobs = Array.isArray(data) ? data : (data.vacancies || data.data || []);
    renderFilters();
    renderJobs();
  } catch (err) {
    console.error('Flatchr API error:', err);
    showError();
  }
}

/* ── Departments ───────────────────────────────────────────── */
function getDepts() {
  const depts = new Set();
  allJobs.forEach(j => {
    const d = j.activity || j.metier || j.department || '';
    if (d) depts.add(d);
  });
  return [...depts].sort();
}

/* ── Filters ───────────────────────────────────────────────── */
function renderFilters() {
  const t = i18n[currentLang];
  const depts = getDepts();

  els.filters.innerHTML = '';

  const allBtn = makeFilterBtn('all', t.allDepts, activeFilter === 'all');
  els.filters.appendChild(allBtn);

  depts.forEach(dept => {
    const btn = makeFilterBtn(dept, dept, activeFilter === dept);
    els.filters.appendChild(btn);
  });
}

function makeFilterBtn(value, label, active) {
  const btn = document.createElement('button');
  btn.className = 'filter-btn' + (active ? ' active' : '');
  btn.textContent = label;
  btn.addEventListener('click', () => {
    activeFilter = value;
    renderFilters();
    renderJobs();
  });
  return btn;
}

/* ── Jobs render ───────────────────────────────────────────── */
function renderJobs() {
  const t = i18n[currentLang];
  const filtered = activeFilter === 'all'
    ? allJobs
    : allJobs.filter(j => (j.activity || j.metier || j.department || '') === activeFilter);

  els.jobCount.textContent = t.jobCount(filtered.length);
  els.grid.innerHTML = '';

  if (filtered.length === 0) {
    els.grid.innerHTML = `<div class="state-empty"><p>${t.noJobs}</p></div>`;
    return;
  }

  filtered.forEach(job => {
    const card = buildJobCard(job, t);
    els.grid.appendChild(card);
  });
}

function buildJobCard(job, t) {
  const title       = job.title || job.name || '—';
  const dept        = job.activity || job.metier || job.department || '';
  const contract    = job.contract_type || job.contract_type_label || '';
  const city        = job.address?.city || job.city || 'Var, France';
  const applyUrl    = `postuler.html?vacancy=${encodeURIComponent(job.slug || job.id)}`;

  const card = document.createElement('a');
  card.className = 'job-card';
  card.href = applyUrl;

  card.innerHTML = `
    ${dept ? `<div class="job-card-dept">${escHtml(dept)}</div>` : ''}
    <div class="job-card-title">${escHtml(title)}</div>
    <div class="job-card-meta">
      ${contract ? `
        <span class="job-meta-tag">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="4" width="12" height="9" rx="1" stroke="#999" stroke-width="1.5"/>
            <path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="#999" stroke-width="1.5"/>
          </svg>
          ${escHtml(contract)}
        </span>` : ''}
      <span class="job-meta-tag">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 1.5A4.5 4.5 0 0 1 12.5 6c0 3-4.5 8.5-4.5 8.5S3.5 9 3.5 6A4.5 4.5 0 0 1 8 1.5Z" stroke="#999" stroke-width="1.5"/>
          <circle cx="8" cy="6" r="1.5" stroke="#999" stroke-width="1.5"/>
        </svg>
        ${escHtml(city)}
      </span>
    </div>
    <div class="job-card-arrow">
      ${t.apply}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 8h10M9 4l4 4-4 4" stroke="#bd5728" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  `;
  return card;
}

/* ── States ────────────────────────────────────────────────── */
function showLoading() {
  const t = i18n[currentLang];
  els.grid.innerHTML = `
    <div class="state-loading">
      <div class="spinner"></div>
      <p>${t.loading}</p>
    </div>`;
  els.jobCount.textContent = '';
}

function showError() {
  const t = i18n[currentLang];
  els.grid.innerHTML = `<div class="state-error"><p>${t.errorMsg}</p></div>`;
  els.jobCount.textContent = '';
}

/* ── Utils ─────────────────────────────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Init ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  els.btnFr.addEventListener('click', () => setLang('fr'));
  els.btnEn.addEventListener('click', () => setLang('en'));

  setLang(currentLang);
  fetchJobs();
});
