import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

function timeAgo(date) {
  const mins = Math.floor((Date.now() - date) / 60000);
  if (mins < 1) return 'hace un momento';
  if (mins < 60) return `hace ${mins} min`;
  return `hace ${Math.floor(mins / 60)}h`;
}

export default function CurrencyConverter() {
  const { eurUsd, eurUsdUpdatedAt } = useApp();
  const [open, setOpen] = useState(false);
  const [eurVal, setEurVal] = useState('');
  const [usdVal, setUsdVal] = useState('');
  const [lastEdited, setLastEdited] = useState('eur');
  const panelRef = useRef(null);
  const fabRef = useRef(null);

  // Cerrar al tocar fuera del panel y del FAB
  useEffect(() => {
    if (!open) return;
    function handleOutside(e) {
      if (panelRef.current?.contains(e.target) || fabRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [open]);

  // Recalcular si cambia la tasa mientras el panel está abierto
  useEffect(() => {
    if (lastEdited === 'eur' && eurVal !== '') {
      const n = parseFloat(eurVal);
      if (!isNaN(n)) setUsdVal((n * eurUsd).toFixed(2));
    } else if (lastEdited === 'usd' && usdVal !== '') {
      const n = parseFloat(usdVal);
      if (!isNaN(n)) setEurVal((n / eurUsd).toFixed(2));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eurUsd]);

  function handleEurChange(e) {
    const v = e.target.value;
    setEurVal(v);
    setLastEdited('eur');
    const n = parseFloat(v);
    setUsdVal(isNaN(n) || v === '' ? '' : (n * eurUsd).toFixed(2));
  }

  function handleUsdChange(e) {
    const v = e.target.value;
    setUsdVal(v);
    setLastEdited('usd');
    const n = parseFloat(v);
    setEurVal(isNaN(n) || v === '' ? '' : (n / eurUsd).toFixed(2));
  }

  function handleFabClick() {
    setOpen(prev => {
      if (!prev) { setEurVal(''); setUsdVal(''); setLastEdited('eur'); }
      return !prev;
    });
  }

  const updatedText = eurUsdUpdatedAt
    ? `Tasa live · actualizada ${timeAgo(eurUsdUpdatedAt)}`
    : 'Tasa de referencia';

  return (
    <>
      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          className="fixed right-4 z-[60] w-56 rounded-2xl p-4 bottom-[136px] lg:bottom-[80px]"
          style={{
            background: 'var(--surface, #fff)',
            border: '1px solid var(--border, #E2E8F0)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{color:'var(--muted)'}}>
              Conversor
            </span>
            <span className="text-[10px] font-semibold" style={{color:'var(--blue,#1B4FD8)'}}>
              1 EUR = {eurUsd.toFixed(4)} USD
            </span>
          </div>

          {/* Input EUR */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">🇪🇺</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={eurVal}
              onChange={handleEurChange}
              autoFocus
              className="flex-1 rounded-lg px-2 py-1.5 text-right font-mono text-sm font-semibold outline-none"
              style={{
                border: '1.5px solid var(--blue,#1B4FD8)',
                background: 'var(--surface2, #F0F3F7)',
              }}
            />
            <span className="text-xs font-bold w-8 text-right" style={{color:'var(--navy,#0B1F3A)'}}>EUR</span>
          </div>

          {/* Separador */}
          <div className="text-center text-lg mb-2" style={{color:'var(--gold,#C9933A)'}}>⇅</div>

          {/* Input USD */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🇺🇸</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={usdVal}
              onChange={handleUsdChange}
              className="flex-1 rounded-lg px-2 py-1.5 text-right font-mono text-sm font-semibold outline-none"
              style={{
                border: '1.5px solid var(--border,#E2E8F0)',
                background: 'var(--surface2, #F0F3F7)',
              }}
            />
            <span className="text-xs font-bold w-8 text-right" style={{color:'var(--navy,#0B1F3A)'}}>USD</span>
          </div>

          {/* Footer */}
          <div className="text-center text-[10px]" style={{color:'var(--muted)'}}>
            {updatedText}
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        ref={fabRef}
        onClick={handleFabClick}
        aria-label="Abrir conversor EUR/USD"
        className="fixed bottom-20 lg:bottom-6 right-4 z-[60] w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg transition-colors"
        style={{background: open ? 'var(--navy,#0B1F3A)' : 'var(--blue,#1B4FD8)'}}
      >
        {open ? '✕' : '€$'}
      </button>
    </>
  );
}
