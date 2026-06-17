import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { SCRIPT_URL, CITIES, COMPRAS_CATS } from '../data/constants';

const AppContext = createContext(null);

function initState(raw = {}) {
  const s = { ...raw };
  if (!s.prices || typeof s.prices !== 'object') s.prices = {};
  if (!s.cities || typeof s.cities !== 'object') s.cities = {};
  if (!s.accom || typeof s.accom !== 'object') s.accom = {};
  if (!s.extras || typeof s.extras !== 'object') s.extras = {};
  if (!s.excursiones || typeof s.excursiones !== 'object') s.excursiones = {};
  if (!s.compras || typeof s.compras !== 'object') s.compras = {};
  if (!s.itinerario || typeof s.itinerario !== 'object') s.itinerario = {};
  if (!s.alertas || typeof s.alertas !== 'object') s.alertas = {};
  if (!s.checklist || typeof s.checklist !== 'object') s.checklist = {};
  if (typeof s.notas !== 'string') s.notas = '';
  if (!s.cityNotes || typeof s.cityNotes !== 'object') s.cityNotes = {};
  if (!s.theme || typeof s.theme !== 'object') s.theme = {};

  CITIES.forEach(c => {
    if (!s.cities[c.id]) s.cities[c.id] = { checkIn: c.defIn, checkOut: c.defOut, hotel: 0, daily: 0 };
    if (!s.accom[c.id]) s.accom[c.id] = { chosen: -1, opts: [emptyAccom(), emptyAccom(), emptyAccom()] };
    if (!s.excursiones[c.id]) s.excursiones[c.id] = [];
  });

  COMPRAS_CATS.forEach(cat => {
    ['agus', 'ivan'].forEach(p => {
      const key = `${cat.id}_${p}`;
      if (!s.compras[key] || !Array.isArray(s.compras[key])) s.compras[key] = [];
      while (s.compras[key].length < 2) s.compras[key].push({ name: '', cost: '', nota: '' });
    });
  });

  return s;
}

function emptyAccom() {
  return { name: '', type: '', price: '', link: '', zona: '', notes: '' };
}

async function loadFromCloud() {
  return new Promise((resolve) => {
    const cbName = '__cb' + Math.random().toString(36).slice(2);
    let done = false;
    const timer = setTimeout(() => { if (!done) { done = true; cleanup(); resolve(null); } }, 5000);

    function cleanup() {
      clearTimeout(timer);
      delete window[cbName];
      const s = document.getElementById(cbName);
      if (s) s.remove();
    }

    window[cbName] = (data) => {
      if (done) return; done = true;
      cleanup();
      resolve(data && typeof data === 'object' && !data.error ? data : null);
    };

    const script = document.createElement('script');
    script.id = cbName;
    script.onerror = () => { if (!done) { done = true; cleanup(); resolve(null); } };
    script.src = `${SCRIPT_URL}?action=load&callback=${cbName}&_=${Date.now()}`;
    document.head.appendChild(script);
  });
}

async function saveToCloud(state) {
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'save', payload: state }),
    });
  } catch (e) {
    console.warn('Save failed:', e);
  }
}

export function AppProvider({ children }) {
  const [state, setStateRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('loading'); // loading | saving | ok | error
  const [eurUsd, setEurUsd] = useState(1.165);
  const [eurUsdUpdatedAt, setEurUsdUpdatedAt] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const saveTimer = useRef(null);

  // Load on mount
  useEffect(() => {
    loadFromCloud().then(raw => {
      const s = initState(raw || {});
      setStateRaw(s);
      if (s.theme?.dark) setDarkMode(true);
      setLoading(false);
      setSyncStatus('ok');
    });
  }, []);

  // Fetch EUR/USD
  useEffect(() => {
    const apis = [
      () => fetch('https://api.frankfurter.app/latest?from=EUR&to=USD').then(r => r.json()).then(d => d?.rates?.USD),
      () => fetch('https://open.er-api.com/v6/latest/EUR').then(r => r.json()).then(d => d?.rates?.USD),
      () => fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json').then(r => r.json()).then(d => d?.eur?.usd),
    ];
    (async () => {
      for (const api of apis) {
        try {
          const rate = await api();
          if (rate && rate > 0.5 && rate < 3) { setEurUsd(rate); setEurUsdUpdatedAt(new Date()); return; }
        } catch { continue; }
      }
    })();
  }, []);

  // Dark mode
  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const setState = useCallback((updater) => {
    setStateRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setSyncStatus('saving');
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveToCloud(next).then(() => setSyncStatus('ok')).catch(() => setSyncStatus('error'));
      }, 1200);
      return next;
    });
  }, []);

  const toggleDark = useCallback(() => {
    setDarkMode(d => {
      const next = !d;
      setState(s => ({ ...s, theme: { ...s.theme, dark: next } }));
      return next;
    });
  }, [setState]);

  return (
    <AppContext.Provider value={{ state, setState, loading, syncStatus, eurUsd, setEurUsd, eurUsdUpdatedAt, darkMode, toggleDark }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

export function cityDays(cities, id) {
  const c = cities?.[id];
  if (!c?.checkIn || !c?.checkOut) return 0;
  return Math.max(0, Math.round((new Date(c.checkOut) - new Date(c.checkIn)) / 864e5));
}

export function f$(n) {
  if (!n || isNaN(n) || n <= 0) return '$0';
  return '$' + Math.round(n).toLocaleString('es-AR');
}
