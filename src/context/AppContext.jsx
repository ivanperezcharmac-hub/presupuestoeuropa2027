import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { SCRIPT_URL, CITIES, COMPRAS_CATS, INTL_FLIGHTS, EURO_FLIGHTS } from '../data/constants';
import { STATE_CACHE_KEY, RATE_CACHE_KEY, PENDING_SYNC_KEY, readCache, writeCache, clearCache } from './offlineCache';

const AppContext = createContext(null);

function initState(raw = {}) {
  const s = { ...raw };
  if (!s.prices || typeof s.prices !== 'object') s.prices = {};
  if (!s.flightDates || typeof s.flightDates !== 'object') s.flightDates = {};
  if (!s.flightLinks || typeof s.flightLinks !== 'object') s.flightLinks = {};
  if (!s.flightDepTimes || typeof s.flightDepTimes !== 'object') s.flightDepTimes = {};
  if (!s.flightNumbers || typeof s.flightNumbers !== 'object') s.flightNumbers = {};
  if (!s.flightHasStop || typeof s.flightHasStop !== 'object') s.flightHasStop = {};
  if (!s.flightStops || typeof s.flightStops !== 'object') s.flightStops = {};
  if (!s.flightFinalArrival || typeof s.flightFinalArrival !== 'object') s.flightFinalArrival = {};
  if (!s.flightAirlines || typeof s.flightAirlines !== 'object') s.flightAirlines = {};
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
  const [syncStatus, setSyncStatus] = useState('loading');
  const [eurUsd, setEurUsd] = useState(1.165);
  const [eurUsdUpdatedAt, setEurUsdUpdatedAt] = useState(null);
  const [gbpUsd, setGbpUsd] = useState(1.34);
  const [darkMode, setDarkMode] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    loadFromCloud().then(raw => {
      let offline = false;
      let source = raw;
      if (!source) {
        source = readCache(STATE_CACHE_KEY);
        offline = true;
      }
      const s = initState(source || {});
      setStateRaw(s);
      if (s.theme?.dark) setDarkMode(true);
      setLoading(false);
      writeCache(STATE_CACHE_KEY, s);
      setSyncStatus(offline ? 'offline' : 'ok');
    });
  }, []);

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
          if (rate && rate > 0.5 && rate < 3) {
            setEurUsd(rate);
            const now = new Date();
            setEurUsdUpdatedAt(now);
            writeCache(RATE_CACHE_KEY, { rate, updatedAt: now.toISOString() });
            return;
          }
        } catch { continue; }
      }
      const cached = readCache(RATE_CACHE_KEY);
      if (cached?.rate) {
        setEurUsd(cached.rate);
        setEurUsdUpdatedAt(new Date(cached.updatedAt));
      }
    })();
    // GBP/USD — mismas 3 APIs en cascada
    const gbpApis = [
      () => fetch('https://api.frankfurter.app/latest?from=GBP&to=USD').then(r => r.json()).then(d => d?.rates?.USD),
      () => fetch('https://open.er-api.com/v6/latest/GBP').then(r => r.json()).then(d => d?.rates?.USD),
      () => fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/gbp.json').then(r => r.json()).then(d => d?.gbp?.usd),
    ];
    (async () => {
      for (const api of gbpApis) {
        try {
          const rate = await api();
          if (rate && rate > 0.8 && rate < 3) {
            setGbpUsd(rate);
            writeCache('europa2027_gbp_rate', { rate, updatedAt: new Date().toISOString() });
            return;
          }
        } catch { continue; }
      }
      const cachedGbp = readCache('europa2027_gbp_rate');
      if (cachedGbp?.rate) setGbpUsd(cachedGbp.rate);
    })();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    function flushPendingSync() {
      if (readCache(PENDING_SYNC_KEY) !== '1') return;
      setStateRaw(prev => {
        if (!prev) return prev;
        setSyncStatus('saving');
        saveToCloud(prev)
          .then(() => { clearCache(PENDING_SYNC_KEY); setSyncStatus('ok'); })
          .catch(() => setSyncStatus('error'));
        return prev;
      });
    }
    window.addEventListener('online', flushPendingSync);
    return () => window.removeEventListener('online', flushPendingSync);
  }, []);

  const setState = useCallback((updater) => {
    setStateRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      writeCache(STATE_CACHE_KEY, next);
      if (!navigator.onLine) {
        writeCache(PENDING_SYNC_KEY, '1');
        setSyncStatus('offline');
        return next;
      }
      setSyncStatus('saving');
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveToCloud(next)
          .then(() => { clearCache(PENDING_SYNC_KEY); setSyncStatus('ok'); })
          .catch(() => setSyncStatus('error'));
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
    <AppContext.Provider value={{ state, setState, loading, syncStatus, eurUsd, setEurUsd, eurUsdUpdatedAt, gbpUsd, darkMode, toggleDark }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

// Cuántos días cruza un vuelo nocturno (0 = llega el mismo día)
export function arrivalDayOffset(flight, depTime) {
  if (!flight.durationMin) return 0;
  const [h, m] = (depTime || '22:00').split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return 0;
  const tzDiff = ((flight.tzTo ?? 0) - (flight.tzFrom ?? 0)) * 60;
  const arrMins = h * 60 + m + flight.durationMin + tzDiff;
  return Math.floor(arrMins / 1440);
}

// Fecha de checkIn/checkOut derivada de los vuelos
export function getCityDates(state, cityId) {
  const flightDates = state?.flightDates || {};
  const flightDepTimes = state?.flightDepTimes || {};
  let checkIn = null, checkOut = null;
  [...INTL_FLIGHTS, ...EURO_FLIGHTS].forEach(flight => {
    const dateISO = flightDates[flight.id] || flight.defDate;
    if (flight.arrivesCity === cityId) {
      const offset = arrivalDayOffset(flight, flightDepTimes[flight.id]);
      if (offset > 0) {
        const d = new Date(dateISO + 'T00:00:00');
        d.setDate(d.getDate() + offset);
        checkIn = d.toISOString().slice(0, 10);
      } else {
        checkIn = dateISO;
      }
    }
    if (flight.departsCity === cityId) {
      checkOut = dateISO;
    }
  });
  return { checkIn, checkOut };
}

// Acepta state completo o solo state.cities (backward compat)
export function cityDays(stateOrCities, id) {
  const cities = stateOrCities?.cities ?? stateOrCities;
  const hasFlightDates = stateOrCities?.flightDates !== undefined;
  let checkIn, checkOut;
  if (hasFlightDates) {
    const dates = getCityDates(stateOrCities, id);
    checkIn = dates.checkIn || cities?.[id]?.checkIn;
    checkOut = dates.checkOut || cities?.[id]?.checkOut;
  } else {
    checkIn = cities?.[id]?.checkIn;
    checkOut = cities?.[id]?.checkOut;
  }
  if (!checkIn || !checkOut) return 0;
  return Math.max(0, Math.round((new Date(checkOut) - new Date(checkIn)) / 864e5));
}

export function f$(n) {
  if (!n || isNaN(n) || n <= 0) return '$0';
  return '$' + Math.round(n).toLocaleString('es-AR');
}
