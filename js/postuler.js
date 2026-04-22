/* ============================================================
   postuler.js — Application form
   Flatchr endpoint: POST https://careers.flatchr.io/vacancy/candidate/json
   ============================================================ */

const COMPANY_KEY = '2kea8pXwEO9N1o0B';
const API_TOKEN   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzQ4MCwiaWF0IjoxNzc2ODYxMTI1LCJleHAiOjE4MDgzOTcxMjV9.IJU2gvbquqY9sh4fLlriSx5Dee4WWOHLzEYzV0OgsHs';
const APPLY_URL   = 'https://careers.flatchr.io/vacancy/candidate/json';
const VACANCIES_URL = `https://api.flatchr.io/company/${COMPANY_KEY}/vacancies`;

/* ── i18n ──────────────────────────────────────────────────── */
const i18n = {
  fr: {
    backLabel:    'Retour aux offres',
    lblFirstname: 'Prénom',
    lblLastname:  'Nom',
    lblEmail:     'E-mail',
    lblPhone:     'Téléphone',
    lblResume:    'CV (PDF)',
    lblComment:   'Lettre de motivation',
    lblMission:   'Missions',
    lblProfile:   'Profil recherché',
    lblConsent:   'J\'accepte que mes données soient utilisées dans le cadre de ma candidature.',
    lblBrowse:    'parcourir',
    dropText:     'Glissez votre CV ici ou',
    btnLabel:     'Envoyer ma candidature',
    successTitle: 'Candidature envoyée !',
    successMsg:   'Nous avons bien reçu votre dossier et reviendrons vers vous très prochainement.',
    successBack:  'Voir d\'autres offres',
    errRequired:  'Ce champ est obligatoire.',
    errEmail:     'Adresse e-mail invalide.',
    errFile:      'Veuillez joindre votre CV.',
    errConsent:   'Vous devez accepter pour continuer.',
    errServer:    'Une erreur est survenue. Veuillez réessayer.',
    contract:     { CDI:'CDI', CDD:'CDD', Stage:'Stage', Alternance:'Alternance' },
    footerText:   '© 2024 Lily of the Valley · ',
    footerLink:   'lilyofthevalley.com',
  },
  en: {
    backLabel:    'Back to positions',
    lblFirstname: 'First name',
    lblLastname:  'Last name',
    lblEmail:     'E-mail',
    lblPhone:     'Phone',
    lblResume:    'CV (PDF)',
    lblComment:   'Cover letter',
    lblMission:   'Missions',
    lblProfile:   'Candidate profile',
    lblConsent:   'I agree to my data being used in the context of my application.',
    lblBrowse:    'browse',
    dropText:     'Drop your CV here or',
    btnLabel:     'Submit application',
    successTitle: 'Application sent!',
    successMsg:   'We have received your application and will be in touch very soon.',
    successBack:  'View other positions',
    errRequired:  'This field is required.',
    errEmail:     'Invalid email address.',
    errFile:      'Please attach your CV.',
    errConsent:   'You must accept to continue.',
    errServer:    'An error occurred. Please try again.',
    footerText:   '© 2024 Lily of the Valley · ',
    footerLink:   'lilyofthevalley.com',
  },
};

/* ── State ─────────────────────────────────────────────────── */
let currentLang = localStorage.getItem('lily-careers-lang') || 'fr';
let resumeFile  = null;
let vacancySlug = '';

/* ── DOM helpers ───────────────────────────────────────────── */
const $ = id => document.getElementById(id);

/* ── Language ──────────────────────────────────────────────── */
function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('lily-careers-lang', lang);
  document.documentElement.lang = lang;
  $('btn-fr').classList.toggle('active', lang === 'fr');
  $('btn-en').classList.toggle('active', lang === 'en');

  const t = i18n[lang];
  $('lbl-mission').textContent = t.lblMission;
  $('lbl-profile').textContent = t.lblProfile;
  $('back-link').querySelector('span').textContent = t.backLabel;
  $('lbl-firstname').childNodes[0].textContent     = t.lblFirstname + ' ';
  $('lbl-lastname').childNodes[0].textContent      = t.lblLastname + ' ';
  $('lbl-email').childNodes[0].textContent         = t.lblEmail + ' ';
  $('lbl-phone').textContent                       = t.lblPhone;
  $('lbl-resume').childNodes[0].textContent        = t.lblResume + ' ';
  $('lbl-comment').textContent                     = t.lblComment;
  $('lbl-consent').childNodes[0].textContent       = t.lblConsent + ' ';
  $('lbl-browse').textContent                      = t.lblBrowse;
  $('file-drop-text').childNodes[0].textContent    = t.dropText + ' ';
  $('btn-label').textContent                       = t.btnLabel;
  $('success-title').textContent                   = t.successTitle;
  $('success-msg').textContent                     = t.successMsg;
  $('success-back').textContent                    = t.successBack;
  $('footer-text').textContent                     = t.footerText;
  $('footer-link').textContent                     = t.footerLink;
}

/* ── Load job details ──────────────────────────────────────── */
async function loadJob(slug) {
  try {
    const res = await fetch(VACANCIES_URL, {
      headers: { 'Authorization': `Bearer ${API_TOKEN}` }
    });
    if (!res.ok) return;
    const jobs = await res.json();
    const job  = jobs.find(j => j.slug === slug || j.id === slug);
    if (!job) return;

    $('job-title').textContent = job.title || '';
    if (job.activity || job.metier) {
      $('job-dept').textContent = job.activity || job.metier;
    }
    const parts = [];
    if (job.contract_type) parts.push(job.contract_type);
    const city = job.address?.city || 'Var, France';
    parts.push(city);
    $('job-meta').textContent = parts.join(' · ');

    // Description blocks
    let hasDesc = false;
    if (job.mission) {
      $('job-mission').innerHTML = job.mission;
      $('job-desc-mission').hidden = false;
      hasDesc = true;
    }
    if (job.profile) {
      $('job-profile').innerHTML = job.profile;
      $('job-desc-profile').hidden = false;
      hasDesc = true;
    }
    if (hasDesc) $('job-desc-section').hidden = false;
  } catch (e) {
    /* silent — form still works */
  }
}

/* ── File handling ─────────────────────────────────────────── */
function handleFile(file) {
  if (!file) return;
  resumeFile = file;
  $('file-name').textContent = file.name;
  $('err-resume').textContent = '';
  $('file-drop').classList.remove('error');
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]); // strip data:...;base64,
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ── Validation ────────────────────────────────────────────── */
function validate() {
  const t = i18n[currentLang];
  let valid = true;

  function check(fieldId, errId, condition, msg) {
    const el  = $(fieldId);
    const err = $(errId);
    if (!condition) {
      err.textContent = msg;
      el.classList.add('error');
      valid = false;
    } else {
      err.textContent = '';
      el.classList.remove('error');
    }
  }

  const firstname = $('firstname').value.trim();
  const lastname  = $('lastname').value.trim();
  const email     = $('email').value.trim();
  const consent   = $('consent').checked;

  check('firstname', 'err-firstname', firstname.length > 0,   t.errRequired);
  check('lastname',  'err-lastname',  lastname.length > 0,    t.errRequired);
  check('email',     'err-email',     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), t.errEmail);

  // CV
  if (!resumeFile) {
    $('err-resume').textContent = t.errFile;
    $('file-drop').classList.add('error');
    valid = false;
  }

  // Consent
  if (!consent) {
    $('err-consent').textContent = t.errConsent;
    valid = false;
  } else {
    $('err-consent').textContent = '';
  }

  return valid;
}

/* ── Submit ────────────────────────────────────────────────── */
async function submitForm(e) {
  e.preventDefault();
  if (!validate()) return;

  const t = i18n[currentLang];
  const btn = $('btn-submit');
  btn.disabled = true;
  $('btn-label').hidden = true;
  $('btn-spinner').hidden = false;
  $('apply-error-msg').hidden = true;

  try {
    const resumeB64 = await fileToBase64(resumeFile);
    const ext = resumeFile.name.split('.').pop().toLowerCase();
    const mimeMap = { pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
    const mime = mimeMap[ext] || 'application/octet-stream';

    const payload = {
      vacancy:   vacancySlug,
      firstname: $('firstname').value.trim(),
      lastname:  $('lastname').value.trim(),
      email:     $('email').value.trim(),
      phone:     $('phone').value.trim() || undefined,
      comment:   $('comment').value.trim() || undefined,
      consent:   true,
      type:      'document',
      resume:    resumeB64,
      filename:  resumeFile.name,
      mime:      mime,
    };

    // Remove undefined keys
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

    const res = await fetch(APPLY_URL, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('Flatchr error:', res.status, body);
      throw new Error(`HTTP ${res.status}`);
    }

    // Success
    $('apply-form').hidden = true;
    $('apply-success').hidden = false;

  } catch (err) {
    console.error(err);
    $('error-msg-text').textContent = i18n[currentLang].errServer;
    $('apply-error-msg').hidden = false;
    btn.disabled = false;
    $('btn-label').hidden = false;
    $('btn-spinner').hidden = true;
  }
}

/* ── Init ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Read vacancy slug from URL
  const params = new URLSearchParams(window.location.search);
  vacancySlug = params.get('vacancy') || '';

  // Language
  $('btn-fr').addEventListener('click', () => setLang('fr'));
  $('btn-en').addEventListener('click', () => setLang('en'));
  setLang(currentLang);

  // Load job info
  if (vacancySlug) loadJob(vacancySlug);

  // File input
  const fileInput = $('resume');
  const fileDrop  = $('file-drop');

  fileInput.addEventListener('change', () => handleFile(fileInput.files[0]));

  fileDrop.addEventListener('dragover', e => { e.preventDefault(); fileDrop.classList.add('dragover'); });
  fileDrop.addEventListener('dragleave', () => fileDrop.classList.remove('dragover'));
  fileDrop.addEventListener('drop', e => {
    e.preventDefault();
    fileDrop.classList.remove('dragover');
    handleFile(e.dataTransfer.files[0]);
  });
  fileDrop.addEventListener('click', e => {
    if (e.target.tagName !== 'LABEL') fileInput.click();
  });

  // Form submit
  $('apply-form').addEventListener('submit', submitForm);
});
