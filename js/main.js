/* ============================================================
   Lily of the Valley — Carrières / Careers
   ============================================================ */

const COMPANY_KEY = '2kea8pXwEO9N1o0B';
const API_TOKEN   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzQ4MCwiaWF0IjoxNzc2ODYxMTI1LCJleHAiOjE4MDgzOTcxMjV9.IJU2gvbquqY9sh4fLlriSx5Dee4WWOHLzEYzV0OgsHs';
const API_URL     = `https://api.flatchr.io/company/${COMPANY_KEY}/vacancies`;

/* ── Keyword rules (title-based, since Flatchr fields are null) ── */
const MAISON_KEYWORDS = {
  courchevel:    ['courchevel', 'chalet'],
  // saint-tropez = default (tout ce qui ne matche pas courchevel)
};

const SERVICE_KEYWORDS = {
  bar:          ['barman', 'barmaid', 'sommelier'],
  cuisine:      ['chef de partie', 'demi-chef', 'sous-chef', 'commis de cuisine',
                 'commis pâtisserie', 'chef pâtissier', 'pâtisserie', 'pâtissier',
                 'pizzaiolo', 'economat', 'économat', 'cuisine'],
  'front-office': ['réceptionniste', 'réservation', 'hôtesse', 'voiturier',
                   'bagagiste', 'concierge', 'agent de réservation'],
  housekeeping: ['gouvernant', 'femme de chambre', 'valet de chambre',
                 'lingère', 'lingere', 'linger', 'lingerie',
                 'maintenance des logements'],
  salle:        ['chef de rang', 'commis de salle', 'majordome', 'room service',
                 'equipier', 'équipier', 'vivier salle'],
};

function matchesKeywords(title, keywords) {
  const t = title.toLowerCase();
  return keywords.some(kw => t.includes(kw.toLowerCase()));
}

function getMaison(job) {
  const t = job.title || '';
  for (const [maison, kws] of Object.entries(MAISON_KEYWORDS)) {
    if (matchesKeywords(t, kws)) return maison;
  }
  return 'saint-tropez'; // default
}

function getService(job) {
  const t = job.title || '';
  for (const [svc, kws] of Object.entries(SERVICE_KEYWORDS)) {
    if (matchesKeywords(t, kws)) return svc;
  }
  return 'other';
}

/* ── i18n ──────────────────────────────────────────────────── */
const i18n = {
  fr: {
    eyebrow:      'Lily of the Valley · Var, France',
    heroTitle:    'Rejoignez\u00a0notre\u00a0équipe',
    heroSubtitle: 'Nous recrutons des talents passionnés pour offrir à nos hôtes une expérience unique au cœur de la Côte d\'Azur.',
    sectionTitle: 'Nos offres d\'emploi',
    loading:      'Chargement des offres…',
    noJobs:       'Aucune offre ne correspond à votre sélection.',
    errorMsg:     'Impossible de charger les offres. Veuillez réessayer.',
    apply:        'Postuler',
    jobCount:     n => `${n} offre${n > 1 ? 's' : ''}`,
    footerText:   '© 2024 Lily of the Valley · ',
    footerLink:   'lilyofthevalley.com',
    maisons: {
      all:          'Toutes les maisons',
      'saint-tropez': 'Saint-Tropez',
      courchevel:   'Courchevel',
    },
    services: {
      all:          'Tous les services',
      bar:          'Bar',
      cuisine:      'Cuisine',
      'front-office': 'Front Office',
      housekeeping: 'House Keeping',
      salle:        'Salle',
    },
  },
  en: {
    eyebrow:      'Lily of the Valley · Var, France',
    heroTitle:    'Join\u00a0our\u00a0team',
    heroSubtitle: 'We are looking for passionate talent to deliver an exceptional experience to our guests on the French Riviera.',
    sectionTitle: 'Open positions',
    loading:      'Loading positions…',
    noJobs:       'No positions match your selection.',
    errorMsg:     'Unable to load positions. Please try again.',
    apply:        'Apply',
    jobCount:     n => `${n} position${n > 1 ? 's' : ''}`,
    footerText:   '© 2024 Lily of the Valley · ',
    footerLink:   'lilyofthevalley.com',
    maisons: {
      all:          'All properties',
      'saint-tropez': 'Saint-Tropez',
      courchevel:   'Courchevel',
    },
    services: {
      all:          'All departments',
      bar:          'Bar',
      cuisine:      'Kitchen',
      'front-office': 'Front Office',
      housekeeping: 'House Keeping',
      salle:        'Restaurant',
    },
  },
};

/* ── State ─────────────────────────────────────────────────── */
let currentLang    = localStorage.getItem('lily-careers-lang') || 'fr';
let allJobs        = [];
let activeMaison   = 'all';
let activeService  = 'all';

/* ── DOM refs ──────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const els = {
  eyebrow:      $('hero-eyebrow'),
  heroTitle:    $('hero-title'),
  heroSub:      $('hero-subtitle'),
  sectionTitle: $('section-title'),
  jobCount:     $('job-count'),
  selMaison:    $('sel-maison'),
  selService:   $('sel-service'),
  grid:         $('jobs-grid'),
  btnFr:        $('btn-fr'),
  btnEn:        $('btn-en'),
  footerText:   $('footer-text'),
  footerLink:   $('footer-link'),
};

/* ── Language ──────────────────────────────────────────────── */
function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('lily-careers-lang', lang);
  document.documentElement.lang = lang;

  els.btnFr.classList.toggle('active', lang === 'fr');
  els.btnEn.classList.toggle('active', lang === 'en');

  const t = i18n[lang];
  els.eyebrow.textContent      = t.eyebrow;
  els.heroTitle.textContent    = t.heroTitle;
  els.heroSub.textContent      = t.heroSubtitle;
  els.sectionTitle.textContent = t.sectionTitle;
  els.footerText.textContent   = t.footerText;
  els.footerLink.textContent   = t.footerLink;

  rebuildSelects();
  renderJobs();
}

/* ── Selects ───────────────────────────────────────────────── */
function rebuildSelects() {
  const t = i18n[currentLang];

  // Maison
  els.selMaison.innerHTML = '';
  [['all','saint-tropez','courchevel']].flat().forEach(val => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = t.maisons[val];
    if (val === activeMaison) opt.selected = true;
    els.selMaison.appendChild(opt);
  });

  // Service
  els.selService.innerHTML = '';
  ['all','bar','cuisine','front-office','housekeeping','salle'].forEach(val => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = t.services[val];
    if (val === activeService) opt.selected = true;
    els.selService.appendChild(opt);
  });
}

/* ── Filter logic ──────────────────────────────────────────── */
function applyFilters(jobs) {
  return jobs.filter(job => {
    if (activeMaison !== 'all' && getMaison(job) !== activeMaison) return false;
    if (activeService !== 'all' && getService(job) !== activeService) return false;
    return true;
  });
}

/* ── API ───────────────────────────────────────────────────── */
async function fetchJobs() {
  showLoading();
  try {
    const res = await fetch(API_URL, {
      headers: { 'Authorization': `Bearer ${API_TOKEN}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    allJobs = Array.isArray(data) ? data : (data.vacancies || data.data || []);
    renderJobs();
  } catch (err) {
    console.error('Flatchr API error:', err);
    showError();
  }
}

/* ── Render ────────────────────────────────────────────────── */
function renderJobs() {
  const t        = i18n[currentLang];
  const filtered = applyFilters(allJobs);

  els.jobCount.textContent = t.jobCount(filtered.length);
  els.grid.innerHTML = '';

  if (filtered.length === 0) {
    els.grid.innerHTML = `<div class="state-empty"><p>${t.noJobs}</p></div>`;
    return;
  }

  filtered.forEach(job => els.grid.appendChild(buildJobCard(job, t)));
}

function buildJobCard(job, t) {
  const title    = job.title || job.name || '—';
  const contract = job.contract_type || job.contract_type_label || '';
  const city     = job.address?.city || job.city || 'Var, France';
  const applyUrl = `postuler.html?vacancy=${encodeURIComponent(job.slug || job.id)}`;
  const service  = getService(job);
  const dept     = i18n[currentLang].services[service] || '';

  const card = document.createElement('a');
  card.className = 'job-card';
  card.href = applyUrl;

  card.innerHTML = `
    ${dept && service !== 'other' ? `<div class="job-card-dept">${escHtml(dept)}</div>` : ''}
    <div class="job-card-title">${escHtml(title)}</div>
    <div class="job-card-meta">
      ${contract ? `
        <span class="job-meta-tag">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="4" width="12" height="9" rx="1" stroke="#999" stroke-width="1.5"/>
            <path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="#999" stroke-width="1.5"/>
          </svg>
          ${escHtml(contract)}
        </span>` : ''}
      <span class="job-meta-tag">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M8 1.5A4.5 4.5 0 0 1 12.5 6c0 3-4.5 8.5-4.5 8.5S3.5 9 3.5 6A4.5 4.5 0 0 1 8 1.5Z" stroke="#999" stroke-width="1.5"/>
          <circle cx="8" cy="6" r="1.5" stroke="#999" stroke-width="1.5"/>
        </svg>
        ${escHtml(city)}
      </span>
    </div>
    <div class="job-card-arrow">
      ${t.apply}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8h10M9 4l4 4-4 4" stroke="#bd5728" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  `;
  return card;
}

/* ── States ────────────────────────────────────────────────── */
function showLoading() {
  els.grid.innerHTML = `
    <div class="state-loading">
      <div class="spinner"></div>
      <p>${i18n[currentLang].loading}</p>
    </div>`;
  els.jobCount.textContent = '';
}

function showError() {
  els.grid.innerHTML = `<div class="state-error"><p>${i18n[currentLang].errorMsg}</p></div>`;
  els.jobCount.textContent = '';
}

/* ── Utils ─────────────────────────────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ── Init ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  els.btnFr.addEventListener('click', () => setLang('fr'));
  els.btnEn.addEventListener('click', () => setLang('en'));

  els.selMaison.addEventListener('change', () => {
    activeMaison = els.selMaison.value;
    renderJobs();
  });
  els.selService.addEventListener('change', () => {
    activeService = els.selService.value;
    renderJobs();
  });

  setLang(currentLang);
  fetchJobs();
});
