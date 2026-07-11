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

export default function CurrencyConverter() {
  const { eurUsd, gbpUsd, eurUsdUpdatedAt } = useApp();
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState('eur'); // 'eur' | 'gbp'
  const [srcVal, setSrcVal] = useState('');
  const [usdVal, setUsdVal] = useState('');
  const panelRef = useRef(null);
  const fabRef = useRef(null);
  const lastEditedRef = useRef('src');
  const srcValRef = useRef('');
  const usdValRef = useRef('');

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

  // Recalcular al cambiar de moneda o al actualizarse la tasa
  useEffect(() => {
    if (lastEditedRef.current === 'src' && srcValRef.current !== '') {
      const n = parseFloat(srcValRef.current);
      if (!isNaN(n)) setUsdVal((n * rate).toFixed(2));
    } else if (lastEditedRef.current === 'usd' && usdValRef.current !== '') {
      const n = parseFloat(usdValRef.current);
      if (!isNaN(n)) setSrcVal((n / rate).toFixed(2));
    }
  }, [rate, currency]);

  function handleSrc(e) {
    const v = e.target.value;
    setSrcVal(v); srcValRef.current = v; lastEditedRef.current = 'src';
    const n = parseFloat(v);
    setUsdVal(!isNaN(n) && v !== '' ? (n * rate).toFixed(2) : '');
  }

  function handleUsd(e) {
    const v = e.target.value;
    setUsdVal(v); usdValRef.current = v; lastEditedRef.current = 'usd';
    const n = parseFloat(v);
    setSrcVal(!isNaN(n) && v !== '' ? (n / rate).toFixed(2) : '');
  }

  function toggleOpen() {
    setOpen(prev => {
      if (!prev) {
        setSrcVal(''); srcValRef.current = '';
        setUsdVal(''); usdValRef.current = '';
        lastEditedRef.current = 'src';
      }
      return !prev;
    });
  }

  return (
    <>
      {open && (
        <div ref={panelRef}
          className="fixed z-[61]"
          style={{
            right: 16,
            bottom: 'calc(56px + env(safe-area-inset-bottom, 0px) + 60px)',
            width: 232,
            maxHeight: 'calc(100dvh - 180px)',
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
              <span className="font-mono-dm text-xs font-semibold"
                style={{ color: 'var(--blue)' }}>1{cur.symbol} = {rate.toFixed(4)}$</span>
            </div>

            {/* Selector de moneda origen */}
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

            {/* Origen */}
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-2"
              style={{ background: 'rgba(27,79,216,0.06)', border: '1.5px solid rgba(27,79,216,0.25)' }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>{cur.flag}</span>
              <input type="number" inputMode="decimal" placeholder="0.00"
                value={srcVal} onChange={handleSrc}
                className="flex-1 font-mono-dm font-bold text-right outline-none"
                style={{ fontSize: 18, background: 'transparent', color: 'var(--txt)', border: 'none', minWidth: 0 }} />
              <span className="font-mono-dm font-semibold" style={{ fontSize: 11, color: 'var(--blue)', flexShrink: 0 }}>{cur.code}</span>
            </div>

            <div className="text-center mb-2" style={{ fontSize: 16, color: 'var(--gold)' }}>⇅</div>

            {/* USD */}
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-3"
              style={{ background: 'var(--surface2)', border: '1.5px solid var(--border2)' }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>🇺🇸</span>
              <input type="number" inputMode="decimal" placeholder="0.00"
                value={usdVal} onChange={handleUsd}
                className="flex-1 font-mono-dm font-bold text-right outline-none"
                style={{ fontSize: 18, background: 'transparent', color: 'var(--txt)', border: 'none', minWidth: 0 }} />
              <span className="font-mono-dm font-semibold" style={{ fontSize: 11, color: 'var(--txt3)', flexShrink: 0 }}>USD</span>
            </div>

            <div className="text-center font-mono-dm"
              style={{ fontSize: 10, color: 'var(--txt3)' }}>
              {eurUsdUpdatedAt ? `Live · ${timeAgo(eurUsdUpdatedAt)}` : 'Tasa de referencia'}
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
