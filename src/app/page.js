'use client';

import { useState, useEffect, useCallback } from 'react';

/* -------------------------------------------------------------------------
 * LANGUAGE REGISTRY
 * In production this short list is generated at build time from a
 * `public/locales/manifest.json` listing every available pack (4
 * entries). Adding a new language never touches this component - you just
 * drop a new `public/locales/<code>.json` file matching the hausa.json
 * shape and add one line to the manifest.
 * ---------------------------------------------------------------------- */
const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', builtin: true },
  { code: 'hausa', name: 'Hausa' },
  { code: 'yoruba', name: 'Yoruba' },
  { code: 'igbo', name: 'Igbo' },

];

/* -------------------------------------------------------------------------
 * BUILT-IN DEFAULT LANGUAGE (English / Nigerian Pidgin)
 * This ships inside the JS bundle itself, so the app is 100% usable the
 * very first time it loads, even with zero network - no fetch required.
 * Every other language mirrors this exact shape (see hausa.json).
 * ---------------------------------------------------------------------- */
const DEFAULT_TRANSLATIONS = {
  meta: { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' },
  app: {
    title: 'NaijaTriageHub',
    tagline: 'Check Your Body, No Network Needed',
    selectLanguage: 'Select Language',
  },
  nav: { triage: 'Check Symptoms', firstAid: 'First Aid', home: 'Home' },
  triage: {
    start: 'Start Symptom Check',
    chooseIllness: 'Choose What Is Bothering You',
    malaria: {
      label: 'Malaria (Mosquito Fever)',
      questions: [
        { id: 'fever', text: 'Do you have a fever right now?' },
        { id: 'chills', text: 'Are you experiencing chills or shivering?' },
        { id: 'headache', text: 'Do you have a severe headache?' },
        { id: 'vomiting', text: 'Are you vomiting?' },
        { id: 'confusion', text: 'Do you feel confused or unable to think clearly?' },
      ],
    },
    dehydration: {
      label: 'Diarrhea / Dehydration',
      questions: [
        { id: 'diarrhea', text: 'Have you had diarrhea more than 3 times today?' },
        { id: 'thirst', text: 'Are you extremely thirsty?' },
        { id: 'dryMouth', text: 'Is your mouth dry?' },
        { id: 'sunkenEyes', text: 'Do your eyes look sunken?' },
        { id: 'noUrine', text: 'Have you not urinated in 6 hours or more?' },
      ],
    },
    results: {
      emergency: { label: 'Emergency', advice: 'Go to the hospital NOW. This condition needs urgent medical care.' },
      moderate: { label: 'Moderate', advice: 'Visit a health center soon. Monitor the symptoms closely.' },
      low: { label: 'Low', advice: 'Continue monitoring at home. Drink plenty of water and rest.' },
    },
  },
  firstAid: {
    cpr: {
      title: 'CPR (Life Support)',
      steps: [
        'Make sure the area is safe, then check if the person is responsive.',
        'Call for help immediately or ask someone to call the hospital.',
        'Lay the person flat on their back on a hard surface.',
        'Push the middle of the chest 100-120 times per minute, about 5-6cm deep.',
        'Continue until help arrives or the person wakes up.',
      ],
    },
    snakeBite: {
      title: 'Snake Bite',
      steps: [
        'Keep the person calm and still, to slow the spread of venom.',
        'Remove any tight items near the bite, such as a ring or bracelet.',
        'Loosely tie a cloth above the bite - do not tie it too tightly.',
        'Do not cut the wound or try to suck out the venom.',
        'Get to a hospital immediately.',
      ],
    },
    choking: {
      title: 'Choking',
      steps: [
        'Ask the person if they can speak or cough.',
        'If they cannot breathe, hit their back 5 times between the shoulder blades.',
        'If that does not work, perform abdominal thrusts (Heimlich maneuver) 5 times.',
        'Repeat until the object comes out or help arrives.',
      ],
    },
    burns: {
      title: 'Severe Burns',
      steps: [
        'Remove the person from the fire or heat source immediately.',
        'Run cool water over the burn for at least 10 minutes.',
        'Do not apply cream, butter, or oil to the burn.',
        'Cover with a clean, soft cloth.',
        'Go to the hospital if the burn is large or deep.',
      ],
    },
  },
};

// Symptoms that, on their own, are serious enough to force an
// "Emergency" rating regardless of the total yes-count.
const CRITICAL_SYMPTOMS = {
  malaria: ['confusion'],
  dehydration: ['noUrine', 'sunkenEyes'],
};

function computeResult(illness, answers) {
  const answeredIds = Object.keys(answers);
  const yesCount = answeredIds.filter((id) => answers[id]).length;
  const hasCritical = CRITICAL_SYMPTOMS[illness].some((id) => answers[id]);

  if (hasCritical) return 'emergency';
  if (yesCount >= 3) return 'moderate';
  return 'low';
}

/* -------------------------------------------------------------------------
 * RAW SVG ICONS (no icon library - keeps bundle tiny)
 * ---------------------------------------------------------------------- */
function IconPulse(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M3 12h4l2 7 4-14 2 7h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconFirstAid(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="M12 10v6M9 13h6" strokeLinecap="round" />
      <path d="M9 6V5a3 3 0 0 1 6 0v1" />
    </svg>
  );
}
function IconGlobe(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 4 6 4 9s-1.5 6.3-4 9c-2.5-2.7-4-6-4-9s1.5-6.3 4-9z" />
    </svg>
  );
}
function IconChevronLeft(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconCheck(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconX(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconWifiOff(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M5 12.5a10 10 0 0 1 5.5-3M19 12.5a10 10 0 0 0-2.5-2.2M12 20h.01" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconDownload(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconShare(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M12 3v12M8 7l4-4 4 4M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* -------------------------------------------------------------------------
 * SMALL PRESENTATIONAL PIECES
 * ---------------------------------------------------------------------- */
function ResultBadge({ level, label }) {
  const styles = {
    emergency: 'bg-red-600 text-white',
    moderate: 'bg-amber-500 text-white',
    low: 'bg-emerald-600 text-white',
  };
  return (
    <span className={`inline-block px-4 py-1 rounded-full font-bold text-sm ${styles[level]}`}>
      {label}
    </span>
  );
}

function FirstAidCard({ data, accent }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left font-semibold ${accent}`}
      >
        <span>{data.title}</span>
        <IconChevronLeft className={`w-4 h-4 transition-transform ${open ? '-rotate-90' : 'rotate-180'}`} />
      </button>
      {open && (
        <ol className="px-4 py-3 space-y-2 bg-white text-sm text-slate-700 list-decimal list-inside">
          {data.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------
 * MAIN APP
 * ---------------------------------------------------------------------- */
export default function NaijaTriageHub() {
  const [langCode, setLangCode] = useState('en');
  const [translations, setTranslations] = useState(DEFAULT_TRANSLATIONS);
  const [langLoading, setLangLoading] = useState(false);
  const [langError, setLangError] = useState(null);

  const [view, setView] = useState('home'); // home | select-illness | questions | result | firstaid
  const [illness, setIllness] = useState(null); // 'malaria' | 'dehydration'
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  /* ---- PWA install prompts ---- */
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showAndroidBanner, setShowAndroidBanner] = useState(false);
  const [showIOSBanner, setShowIOSBanner] = useState(false);

  // Android / Chrome: capture the native install prompt instead of letting
  // the browser show its own mini-infobar, so we can show our own banner
  // and trigger the native install dialog from our own "Install" button.
  useEffect(() => {
    function handleBeforeInstallPrompt(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = window.localStorage.getItem('ntg_android_install_dismissed');
      if (!dismissed) setShowAndroidBanner(true);
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    function handleAppInstalled() {
      setShowAndroidBanner(false);
      setDeferredPrompt(null);
    }
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // iOS: Safari never fires 'beforeinstallprompt', so detect iPhone/iPad
  // manually and show static "Add to Home Screen" instructions instead.
  useEffect(() => {
    const ua = window.navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    const isStandalone =
      window.navigator.standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;
    const dismissed = window.localStorage.getItem('ntg_ios_install_dismissed');

    if (isIOS && !isStandalone && !dismissed) {
      setShowIOSBanner(true);
    }
  }, []);

  async function handleAndroidInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt(); // triggers the native Android install dialog
    await deferredPrompt.userChoice;
    // The captured event can only be used once, accepted or not.
    setDeferredPrompt(null);
    setShowAndroidBanner(false);
  }

  function dismissAndroidBanner() {
    setShowAndroidBanner(false);
    window.localStorage.setItem('ntg_android_install_dismissed', '1');
  }

  function dismissIOSBanner() {
    setShowIOSBanner(false);
    window.localStorage.setItem('ntg_ios_install_dismissed', '1');
  }

  /* ---- Dynamic language pack loader ---- */
  const loadLanguage = useCallback(async (code) => {
    if (code === 'en') {
      setTranslations(DEFAULT_TRANSLATIONS);
      setLangError(null);
      return;
    }
    setLangLoading(true);
    setLangError(null);
    try {
      const res = await fetch(`/locales/${code}.json`);
      if (!res.ok) throw new Error(`Pack not found: ${code}`);
      const data = await res.json();
      setTranslations(data);
    } catch (err) {
      setLangError('Could not load this language pack. Showing default language instead.');
      setTranslations(DEFAULT_TRANSLATIONS);
    } finally {
      setLangLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLanguage(langCode);
  }, [langCode, loadLanguage]);

  const t = translations;

  /* ---- Triage handlers ---- */
  function startTriage() {
    setIllness(null);
    setStep(0);
    setAnswers({});
    setView('select-illness');
  }

  function pickIllness(key) {
    setIllness(key);
    setStep(0);
    setAnswers({});
    setView('questions');
  }

  const questions = illness ? t.triage[illness].questions : [];
  const currentQuestion = questions[step];

  function answer(value) {
    const updated = { ...answers, [currentQuestion.id]: value };
    setAnswers(updated);
    if (step + 1 < questions.length) {
      setStep(step + 1);
    } else {
      setView('result');
    }
  }

  const resultLevel = illness && view === 'result' ? computeResult(illness, answers) : null;

  function goHome() {
    setView('home');
  }

  return (
    <>
      {/* ---------------- ANDROID INSTALL BANNER ---------------- */}
      {showAndroidBanner && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm bg-slate-900 text-white rounded-xl shadow-2xl px-4 py-3 flex items-center gap-3">
          <span className="bg-emerald-600 rounded-lg p-2 flex-shrink-0">
            <IconDownload className="w-5 h-5" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">Install NaijaTriageHub</p>
            <p className="text-xs text-slate-300 truncate">Add to home screen for offline access</p>
          </div>
          <button
            onClick={handleAndroidInstall}
            className="bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-lg flex-shrink-0"
          >
            Install
          </button>
          <button
            onClick={dismissAndroidBanner}
            aria-label="Dismiss install prompt"
            className="p-1 flex-shrink-0 text-slate-400"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ---------------- iOS INSTALL INSTRUCTIONS ---------------- */}
      {showIOSBanner && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm bg-white border border-slate-200 rounded-xl shadow-2xl px-4 py-3">
          <div className="flex items-start gap-3">
            <span className="bg-blue-100 text-blue-700 rounded-lg p-2 flex-shrink-0">
              <IconShare className="w-5 h-5" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900">Install on your iPhone</p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                To use this app offline on your iPhone: Tap the Share icon in Safari, scroll down, and select
                &ldquo;Add to Home Screen&rdquo;.
              </p>
            </div>
            <button
              onClick={dismissIOSBanner}
              aria-label="Dismiss install instructions"
              className="p-1 flex-shrink-0 text-slate-400"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <main className="min-h-screen flex flex-col max-w-md mx-auto bg-slate-50 sm:my-8 sm:rounded-2xl sm:shadow-2xl sm:overflow-hidden sm:min-h-0">
      {/* Header */}
      <header className="bg-emerald-700 text-white px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {view !== 'home' ? (
              <button
                onClick={goHome}
                aria-label="Back to home"
                className="p-1 -ml-1 rounded active:bg-emerald-800"
              >
                <IconChevronLeft className="w-6 h-6" />
              </button>
            ) : (
              <IconPulse className="w-6 h-6 flex-shrink-0" />
            )}
            <div className="min-w-0">
              <h1 className="font-bold text-lg leading-tight truncate">{t.app.title}</h1>
              <p className="text-xs text-emerald-100 truncate">{t.app.tagline}</p>
            </div>
          </div>

          {/* Language selector */}
          <label className="flex items-center gap-1 bg-emerald-800/60 rounded-md px-2 py-1 flex-shrink-0">
            <IconGlobe className="w-4 h-4" />
            <select
              aria-label={t.app.selectLanguage}
              value={langCode}
              onChange={(e) => setLangCode(e.target.value)}
              className="bg-transparent text-white text-xs font-medium focus:outline-none max-w-[84px]"
            >
              {AVAILABLE_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="text-slate-900">
                  {l.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {langLoading && (
          <p className="text-xs text-emerald-100 mt-1 animate-pulse">Loading language pack…</p>
        )}
        {langError && (
          <p className="flex items-center gap-1 text-xs text-amber-200 mt-1">
            <IconWifiOff className="w-3 h-3" /> {langError}
          </p>
        )}
      </header>

      <div className="flex-1 px-4 py-5">
        {/* ---------------- HOME ---------------- */}
        {view === 'home' && (
          <div className="space-y-4">
            <button
              onClick={startTriage}
              className="w-full flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 text-left shadow-sm active:scale-[0.99]"
            >
              <span className="bg-emerald-100 text-emerald-700 rounded-lg p-2">
                <IconPulse className="w-6 h-6" />
              </span>
              <span>
                <span className="block font-semibold text-slate-900">{t.nav.triage}</span>
                <span className="block text-xs text-slate-500">{t.triage.chooseIllness}</span>
              </span>
            </button>

            <button
              onClick={() => setView('firstaid')}
              className="w-full flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 text-left shadow-sm active:scale-[0.99]"
            >
              <span className="bg-red-100 text-red-600 rounded-lg p-2">
                <IconFirstAid className="w-6 h-6" />
              </span>
              <span>
                <span className="block font-semibold text-slate-900">{t.nav.firstAid}</span>
                <span className="block text-xs text-slate-500">CPR · Snake Bite · Choking · Burns</span>
              </span>
            </button>

            <p className="text-xs text-slate-400 text-center pt-2">
              Works fully offline once loaded. No data leaves your phone.
            </p>
          </div>
        )}

        {/* ---------------- SELECT ILLNESS ---------------- */}
        {view === 'select-illness' && (
          <div className="space-y-3">
            <h2 className="font-semibold text-slate-800">{t.triage.chooseIllness}</h2>
            <button
              onClick={() => pickIllness('malaria')}
              className="w-full bg-white border border-slate-200 rounded-xl p-4 text-left font-medium shadow-sm active:scale-[0.99]"
            >
              {t.triage.malaria.label}
            </button>
            <button
              onClick={() => pickIllness('dehydration')}
              className="w-full bg-white border border-slate-200 rounded-xl p-4 text-left font-medium shadow-sm active:scale-[0.99]"
            >
              {t.triage.dehydration.label}
            </button>
          </div>
        )}

        {/* ---------------- QUESTIONS ---------------- */}
        {view === 'questions' && currentQuestion && (
          <div className="space-y-6">
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all"
                style={{ width: `${((step + 1) / questions.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">
              {step + 1} / {questions.length}
            </p>
            <p className="text-xl font-semibold text-slate-900 leading-snug">
              {currentQuestion.text}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => answer(true)}
                className="flex items-center justify-center gap-2 bg-red-600 text-white font-semibold rounded-xl py-4 active:scale-[0.98]"
              >
                <IconCheck className="w-5 h-5" /> Yes
              </button>
              <button
                onClick={() => answer(false)}
                className="flex items-center justify-center gap-2 bg-slate-200 text-slate-700 font-semibold rounded-xl py-4 active:scale-[0.98]"
              >
                <IconX className="w-5 h-5" /> No
              </button>
            </div>
          </div>
        )}

        {/* ---------------- RESULT ---------------- */}
        {view === 'result' && resultLevel && (
          <div className="space-y-5 text-center">
            <p className="text-sm text-slate-500">
              {illness === 'malaria' ? t.triage.malaria.label : t.triage.dehydration.label}
            </p>
            <ResultBadge level={resultLevel} label={t.triage.results[resultLevel].label} />
            <p className="text-slate-700 leading-relaxed">{t.triage.results[resultLevel].advice}</p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={startTriage}
                className="w-full bg-emerald-700 text-white font-semibold rounded-xl py-3"
              >
                Check Again
              </button>
              <button
                onClick={goHome}
                className="w-full bg-slate-100 text-slate-700 font-semibold rounded-xl py-3"
              >
                {t.nav.home}
              </button>
            </div>
          </div>
        )}

        {/* ---------------- FIRST AID ---------------- */}
        {view === 'firstaid' && (
          <div className="space-y-3">
            <h2 className="font-semibold text-slate-800 mb-1">{t.nav.firstAid}</h2>
            <FirstAidCard data={t.firstAid.cpr} accent="bg-red-50 text-red-700" />
            <FirstAidCard data={t.firstAid.snakeBite} accent="bg-amber-50 text-amber-700" />
            <FirstAidCard data={t.firstAid.choking} accent="bg-blue-50 text-blue-700" />
            <FirstAidCard data={t.firstAid.burns} accent="bg-orange-50 text-orange-700" />
          </div>
        )}
      </div>
    </main>
    </>
  );
}