import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

function timeAgo(date) {
  const mins = Math.floor((Date.now() - date) / 60000);
  if (mins < 1) return 'hace un momento';
  if (mins < 60) return `hace ${mins}m`;
  return `hace ${Math.floor(mins / 60)}h`;
}

export default function CurrencyConverter() {
  const { eurUsd, eurUsdUpdatedAt } = useApp();
  const [open, setOpen] = useState(false);
  const [eurVal, setEurVal] = useState('');
  const [usdVal, setUsdVal] = useState('');
  const panelRef = useRef(null);
  const fabRef = useRef(null);
  const lastEditedRef = useRef('eur');
  const eurValRef = useRef('');
  const usdValRef = useRef('');

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

  useEffect(() => {
    if (lastEditedRef.current === 'eur' && eurValRef.current !== '') {
      const n = parseFloat(eurValRef.current);
      if (!isNaN(n)) setUsdVal((n * eurUsd).toFixed(2));
    } else if (lastEditedRef.current === 'usd' && usdValRef.current !== '') {
      const n = parseFloat(usdValRef.current);
      if (!isNaN(n)) setEurVal((n / eurUsd).toFixed(2));
    }
  }, [eurUsd]);

  function handleEur(e) {
    const v = e.target.value;
    setEurVal(v); eurValRef.current = v; lastEditedRef.current = 'eur';
    const n = parseFloat(v);
    setUsdVal(!isNaN(n) && v !== '' ? (n * eurUsd).toFixed(2) : '');
  }

  function handleUsd(e) {
    const v = e.target.value;
    setUsdVal(v); usdValRef.current = v; lastEditedRef.current = 'usd';
    const n = parseFloat(v);
    setEurVal(!isNaN(n) && v !== '' ? (n / eurUsd).toFixed(2) : '');
  }

  function toggleOpen() {
    setOpen(prev => {
      if (!prev) {
        setEurVal(''); eurValRef.current = '';
        setUsdVal(''); usdValRef.current = '';
        lastEditedRef.current = 'eur';
      }
      return !prev;
    });
  }

  return (
    <>
      {/* Panel — posicionado sobre el FAB, sin salirse de pantalla */}
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
                style={{ color: 'var(--blue)' }}>1€ = {eurUsd.toFixed(4)}$</span>
            </div>

            {/* EUR */}
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-2"
              style={{ background: 'rgba(27,79,216,0.06)', border: '1.5px solid rgba(27,79,216,0.25)' }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>🇪🇺</span>
              <input type="number" inputMode="decimal" placeholder="0.00"
                value={eurVal} onChange={handleEur}
                className="flex-1 font-mono-dm font-bold text-right outline-none"
                style={{ fontSize: 18, background: 'transparent', color: 'var(--txt)', border: 'none', minWidth: 0 }} />
              <span className="font-mono-dm font-semibold" style={{ fontSize: 11, color: 'var(--blue)', flexShrink: 0 }}>EUR</span>
            </div>

            {/* Swap indicator */}
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

            {/* Footer tasa */}
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
