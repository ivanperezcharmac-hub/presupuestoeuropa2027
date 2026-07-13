import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

function timeAgo(date) {
  const mins = Math.floor((Date.now() - date) / 60000);
  if (mins < 1) return 'hace un momento';
  if (mins < 60) return `hace ${mins}m`;
  return `hace ${Math.floor(mins / 60)}h`;
}

const CURRENCIES = {
  eur: { flag: '🇪🇺', code: 'EUR', symbol: '€' },
  gbp: { flag: '🇬🇧', code: 'GBP', symbol: '£' },
};

function fmtArs(n) {
  return n.toLocaleString('es-AR', { maximumFractionDigits: 0 });
}

export default function CurrencyConverter() {
  const { eurUsd, gbpUsd, usdArs, eurUsdUpdatedAt } = useApp();
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState('eur'); // 'eur' | 'gbp'
  const [srcVal, setSrcVal] = useState('');
  const [usdVal, setUsdVal] = useState('');
  const [arsVal, setArsVal] = useState('');
  const panelRef = useRef(null);
  const fabRef = useRef(null);
  const lastEditedRef = useRef('src');
  const valsRef = useRef({ src: '', usd: '', ars: '' });

  const rate = currency === 'gbp' ? gbpUsd : eurUsd;
  const cur = CURRENCIES[currency];

  useEffect(() => {
    if (!open) return;
    function handleOutside(e) {
      if (panelRef.current?.contains(e.target) || fabRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [open]);

  // src (EUR/GBP) <-> USD <-> ARS ; recalcula todo desde el último campo editado
  function recompute(from, val) {
    valsRef.current[from] = val;
    lastEditedRef.current = from;
    const n = parseFloat(val);
    if (val === '' || isNaN(n)) {
      if (from === 'src') { setUsdVal(''); setArsVal(''); }
      if (from === 'usd') { setSrcVal(''); setArsVal(''); }
      if (from === 'ars') { setSrcVal(''); setUsdVal(''); }
      return;
    }
    let usd;
    if (from === 'src') usd = n * rate;
    else if (from === 'usd') usd = n;
    else usd = n / usdArs;
    if (from !== 'src') setSrcVal((usd / rate).toFixed(2));
    if (from !== 'usd') setUsdVal(usd.toFixed(2));
    if (from !== 'ars') setArsVal((usd * usdArs).toLocaleString('es-AR', { maximumFractionDigits: 0 }));
  }

  // Al cambiar moneda o tasas, recalcular desde el último editado
  useEffect(() => {
    const from = lastEditedRef.current;
    const val = from === 'src' ? valsRef.current.src : from === 'usd' ? valsRef.current.usd : valsRef.current.ars;
    if (val !== '') recompute(from, val);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rate, currency, usdArs]);

  function toggleOpen() {
    setOpen(prev => {
      if (!prev) {
        setSrcVal(''); setUsdVal(''); setArsVal('');
        valsRef.current = { src: '', usd: '', ars: '' };
        lastEditedRef.current = 'src';
      }
      return !prev;
    });
  }

  const rowStyle = (highlight) => ({
    background: highlight ? 'rgba(27,79,216,0.06)' : 'var(--surface2)',
    border: `1.5px solid ${highlight ? 'rgba(27,79,216,0.25)' : 'var(--border2)'}`,
  });

  return (
    <>
      {open && (
        <div ref={panelRef}
          className="fixed z-[61]"
          style={{
            right: 16,
            bottom: 'calc(56px + env(safe-area-inset-bottom, 0px) + 60px)',
            width: 244,
            maxHeight: 'calc(100dvh - 220px - env(safe-area-inset-top, 0px))',
            overflowY: 'auto',
            background: 'var(--surface)',
            border: '1px solid var(--border2)',
            borderRadius: 18,
            boxShadow: '0 12px 48px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.1)',
          }}>
          <div style={{ padding: '14px 14px 10px' }}>
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <span className="font-mono-dm text-xs font-bold uppercase"
                style={{ color: 'var(--txt3)', letterSpacing: '0.1em' }}>Conversor</span>
              <span className="font-mono-dm" style={{ color: 'var(--blue)', fontSize: 10 }}>
                1{cur.symbol}={rate.toFixed(3)}$ · 1$={fmtArs(usdArs)}ars
              </span>
            </div>

            {/* Selector moneda europea */}
            <div className="flex gap-1.5 mb-3">
              {Object.entries(CURRENCIES).map(([key, c]) => (
                <button key={key} onClick={() => setCurrency(key)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-mono-dm font-semibold transition-all"
                  style={{
                    fontSize: 12,
                    background: currency === key ? 'var(--blue)' : 'var(--surface2)',
                    color: currency === key ? '#fff' : 'var(--txt2)',
                    border: `1.5px solid ${currency === key ? 'var(--blue)' : 'var(--border2)'}`,
                    cursor: 'pointer',
                    minHeight: 34,
                  }}>
                  <span style={{ fontSize: 14 }}>{c.flag}</span> {c.code}
                </button>
              ))}
            </div>

            {/* EUR/GBP */}
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-2" style={rowStyle(true)}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>{cur.flag}</span>
              <input type="number" inputMode="decimal" placeholder="0.00"
                value={srcVal} onChange={e => { setSrcVal(e.target.value); recompute('src', e.target.value); }}
                className="flex-1 font-mono-dm font-bold text-right outline-none"
                style={{ fontSize: 17, background: 'transparent', color: 'var(--txt)', border: 'none', minWidth: 0 }} />
              <span className="font-mono-dm font-semibold" style={{ fontSize: 11, color: 'var(--blue)', flexShrink: 0 }}>{cur.code}</span>
            </div>

            {/* USD */}
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-2" style={rowStyle(false)}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>🇺🇸</span>
              <input type="number" inputMode="decimal" placeholder="0.00"
                value={usdVal} onChange={e => { setUsdVal(e.target.value); recompute('usd', e.target.value); }}
                className="flex-1 font-mono-dm font-bold text-right outline-none"
                style={{ fontSize: 17, background: 'transparent', color: 'var(--txt)', border: 'none', minWidth: 0 }} />
              <span className="font-mono-dm font-semibold" style={{ fontSize: 11, color: 'var(--txt3)', flexShrink: 0 }}>USD</span>
            </div>

            {/* ARS */}
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-3" style={rowStyle(false)}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>🇦🇷</span>
              <input type="text" inputMode="numeric" placeholder="0"
                value={arsVal} onChange={e => {
                  const raw = e.target.value.replace(/\./g, '');
                  if (raw !== '' && isNaN(parseFloat(raw))) return;
                  const formatted = raw === '' ? '' : parseFloat(raw).toLocaleString('es-AR', { maximumFractionDigits: 0 });
                  setArsVal(formatted);
                  recompute('ars', raw);
                }}
                className="flex-1 font-mono-dm font-bold text-right outline-none"
                style={{ fontSize: 17, background: 'transparent', color: 'var(--txt)', border: 'none', minWidth: 0 }} />
              <span className="font-mono-dm font-semibold" style={{ fontSize: 11, color: 'var(--txt3)', flexShrink: 0 }}>ARS</span>
            </div>

            <div className="text-center font-mono-dm" style={{ fontSize: 10, color: 'var(--txt3)' }}>
              {eurUsdUpdatedAt ? `Live · ${timeAgo(eurUsdUpdatedAt)}` : 'Tasa de referencia'} · ARS: BNA oficial venta
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button ref={fabRef} onClick={toggleOpen}
        aria-label="Conversor EUR/USD"
        className="fixed z-[60] flex items-center justify-center rounded-full font-bold transition-all"
        style={{
          bottom: 'calc(56px + env(safe-area-inset-bottom, 0px) + 12px)',
          right: 16,
          width: 48, height: 48,
          background: open ? 'var(--navy)' : 'var(--blue)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          fontSize: open ? 14 : 13,
          boxShadow: '0 4px 20px rgba(27,79,216,0.4)',
          transform: open ? 'scale(0.95)' : 'scale(1)',
        }}>
        {open ? '✕' : '€$'}
      </button>
      <style>{`@media (min-width:1024px){button[aria-label="Conversor EUR/USD"]{bottom:24px!important}}`}</style>
    </>
  );
}
