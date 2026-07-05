import { useMemo, useState } from 'react';
import { useApp, cityDays, f$ } from '../context/AppContext';
import { CITIES, INTL_FLIGHTS, EURO_FLIGHTS, COMPRAS_CATS, EXCURSION_CITIES } from '../data/constants';

function useTotals() {
  const { state, eurUsd } = useApp();
  return useMemo(() => {
    if (!state) return {};
    const intlT = INTL_FLIGHTS.reduce((s, f) => s + (parseFloat(state.prices?.[f.id]) || 0), 0);
    const euT = EURO_FLIGHTS.reduce((s, f) => s + (parseFloat(state.prices?.[f.id]) || 0), 0);
    let alojT = 0, gastoT = 0;
    CITIES.forEach(city => {
      const days = cityDays(state, city.id);
      alojT += days * (parseFloat(state.cities?.[city.id]?.hotel) || 0);
      gastoT += days * (parseFloat(state.cities?.[city.id]?.daily) || 0);
    });
    const excT = EXCURSION_CITIES.reduce((s, city) =>
      s + (state.excursiones?.[city.id] || []).reduce((ss, it) => ss + (parseFloat(it.cost) || 0), 0), 0);
    const comprasAgusEur = COMPRAS_CATS.reduce((s, cat) =>
      s + (state.compras?.[`${cat.id}_agus`] || []).reduce((ss, it) => ss + (parseFloat(it.cost) || 0), 0), 0);
    const comprasIvanEur = COMPRAS_CATS.reduce((s, cat) =>
      s + (state.compras?.[`${cat.id}_ivan`] || []).reduce((ss, it) => ss + (parseFloat(it.cost) || 0), 0), 0);
    const comprasT = (comprasAgusEur + comprasIvanEur) * eurUsd;
    const grand = intlT + euT + alojT + gastoT + excT + comprasT;
    const baseT = intlT + euT + alojT;
    const destinoT = gastoT + excT + comprasT;
    return { intlT, euT, alojT, gastoT, excT, comprasT, comprasAgusEur, comprasIvanEur, grand, baseT, destinoT, eurUsd };
  }, [state, eurUsd]);
}

function DonutChart({ cats, total }) {
  const [hovered, setHovered] = useState(null);
  if (!total) return (
    <div style={{ width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 128, height: 128, borderRadius: '50%', border: '3px dashed var(--border2)' }} />
    </div>
  );
  let angle = -Math.PI / 2;
  const R = 80, ri = 52, cx = 90, cy = 90;
  const paths = cats.filter(c => c.v > 0).map((cat) => {
    const slice = (cat.v / total) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(angle), y1 = cy + R * Math.sin(angle);
    const x2 = cx + R * Math.cos(angle + slice), y2 = cy + R * Math.sin(angle + slice);
    const xi1 = cx + ri * Math.cos(angle), yi1 = cy + ri * Math.sin(angle);
    const xi2 = cx + ri * Math.cos(angle + slice), yi2 = cy + ri * Math.sin(angle + slice);
    const large = slice > Math.PI ? 1 : 0;
    const d = `M ${xi1} ${yi1} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${ri} ${ri} 0 ${large} 0 ${xi1} ${yi1} Z`;
    angle += slice;
    return (
      <path key={cat.l} d={d} fill={cat.c} stroke="var(--surface)" strokeWidth="2.5"
        className="cursor-pointer transition-all"
        style={{ opacity: hovered && hovered !== cat.l ? 0.55 : 1, filter: hovered === cat.l ? 'brightness(1.15)' : 'none' }}
        onMouseEnter={() => setHovered(cat.l)} onMouseLeave={() => setHovered(null)} />
    );
  });
  const active = hovered ? cats.find(c => c.l === hovered) : null;
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <svg width="180" height="180" viewBox="0 0 180 180">{paths}</svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        {active ? (
          <>
            <div style={{ fontSize: 11, color: 'var(--txt2)', fontWeight: 500 }}>{active.l}</div>
            <div className="font-mono-dm" style={{ fontSize: 14, fontWeight: 700, color: 'var(--txt)' }}>{f$(active.v)}</div>
            <div style={{ fontSize: 10, color: 'var(--txt3)' }}>{((active.v / total) * 100).toFixed(0)}%</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 10, color: 'var(--txt3)' }}>Total</div>
            <div className="font-mono-dm" style={{ fontSize: 14, fontWeight: 700, color: 'var(--txt)' }}>{f$(total)}</div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Resumen() {
  const t = useTotals();
  const { state } = useApp();
  const [showFlights, setShowFlights] = useState(false);
  const [showDestino, setShowDestino] = useState(false);

  const cats = [
    { l: "Vuelos int'l", v: t.intlT || 0, c: '#0b1f3a' },
    { l: 'Vuelos EU',    v: t.euT || 0,   c: '#2563eb' },
    { l: 'Alojamiento',  v: t.alojT || 0, c: '#c9933a' },
    { l: 'Gastos',       v: t.gastoT || 0, c: '#166534' },
    { l: 'Excursiones',  v: t.excT || 0,  c: '#ea580c' },
    { l: 'Compras',      v: t.comprasT || 0, c: '#be185d' },
  ];
  const mx = Math.max(...cats.map(c => c.v), 1);
  const shared = t.grand > 0
    ? (t.grand - (t.comprasAgusEur || 0) * (t.eurUsd || 1) - (t.comprasIvanEur || 0) * (t.eurUsd || 1)) / 2
    : 0;

  return (
    <div className="fade-in">
      <h1 className="font-display text-2xl font-bold mb-1">Resumen general</h1>
      <p className="text-sm mb-5" style={{ color: 'var(--txt2)' }}>Tu presupuesto completo, actualizado en tiempo real.</p>

      {/* ══════ HERO ══════ */}
      <div className="rounded-2xl mb-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(140deg, #0b1f3a 0%, #061525 60%, #0d1e35 100%)', minHeight: 196 }}>

        {/* Coin rings decorativos */}
        <div className="coin-ring pointer-events-none" style={{
          position: 'absolute', width: 260, height: 260, top: -80, right: -80, borderRadius: '50%',
          border: '1.5px dashed rgba(201,147,58,0.14)',
        }} />
        <div className="pointer-events-none" style={{
          position: 'absolute', width: 180, height: 180, top: -40, right: -40, borderRadius: '50%',
          border: '1px dashed rgba(201,147,58,0.09)',
          animation: '14s linear infinite rotateCoin', animationDirection: 'reverse',
        }} />

        {/* Línea de ruta punteada */}
        <div className="pointer-events-none" style={{ position: 'absolute', bottom: 42, left: 20, right: 20, height: 16 }}>
          <svg width="100%" height="16" style={{ position: 'absolute', inset: 0 }}>
            <path d="M 0 12 C 25% 2, 75% 2, 100% 12"
              fill="none" stroke="rgba(232,184,109,0.18)" strokeWidth="1.5" strokeDasharray="5 7" />
          </svg>
          {/* Avión animado sobre la ruta */}
          <div style={{
            position: 'absolute', top: 0, left: -28,
            animation: 'plane-slide 7s linear infinite',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24"
              fill="rgba(232,184,109,0.75)"
              style={{ filter: 'drop-shadow(0 0 4px rgba(232,184,109,0.4))' }}>
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
          </div>
        </div>

        {/* Contenido */}
        <div className="relative z-10 px-6 pt-6 pb-16">
          <div className="font-mono-dm text-xs uppercase tracking-widest mb-3"
            style={{ color: 'rgba(255,255,255,.3)', letterSpacing: '0.14em' }}>
            Total estimado · 26 días · 5 ciudades
          </div>
          <div className="font-display leading-none mb-2"
            style={{ fontSize: 'clamp(2.4rem, 9vw, 3.5rem)', color: 'var(--goldl)', textShadow: '0 2px 28px rgba(232,184,109,0.22)' }}>
            {f$(t.grand || 0)}
          </div>
          <div className="text-xs" style={{ color: 'rgba(255,255,255,.38)' }}>
            {(t.grand || 0) > 0
              ? `${f$(Math.round(t.grand / 26))} por día · ${f$(Math.round(t.grand / 2))} por persona`
              : 'Completá los datos en cada sección'}
          </div>
        </div>

        {/* Strip ruta — scrollable en mobile */}
        <div className="absolute bottom-0 left-0 right-0 px-5 py-2 flex items-center gap-1 overflow-x-auto"
          style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          {['BUE', '✈', 'BCN', '→', 'ROM', '→', 'PAR', '→', 'LON', '→', 'MAD', '✈', 'BUE'].map((s, i) => (
            <span key={i} className="font-mono-dm flex-shrink-0"
              style={{ fontSize: 10, color: s === '✈' ? 'rgba(232,184,109,0.6)' : s === '→' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.38)' }}>
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* ══════ DOS BLOQUES ══════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* BASE */}
        <div className="card p-4 card-lift" style={{ borderTop: '3px solid var(--blue)' }}>
          <div className="text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: 'var(--txt3)', letterSpacing: '0.08em' }}>✈ Base</div>
          <div className="font-display text-3xl mb-3" style={{ color: 'var(--txt)' }}>{f$(t.baseT || 0)}</div>
          <Row label="Vuelos" value={f$((t.intlT || 0) + (t.euT || 0))} />
          <Row label="Alojamiento" value={f$(t.alojT || 0)} />
          <button onClick={() => setShowFlights(v => !v)}
            className="mt-2 text-xs font-medium flex items-center gap-1"
            style={{ color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <span style={{ display: 'inline-block', transition: 'transform .2s', transform: showFlights ? 'rotate(180deg)' : 'none' }}>▾</span>
            {showFlights ? 'Ocultar' : 'Ver vuelos'}
          </button>
          {showFlights && (
            <div className="mt-2 pt-2 fade-in" style={{ borderTop: '1px solid var(--border)' }}>
              {[...INTL_FLIGHTS, ...EURO_FLIGHTS].map(f => {
                const price = parseFloat(state?.prices?.[f.id]) || 0;
                return (
                  <div key={f.id} className="py-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="flex justify-between items-baseline gap-1">
                      <span className="text-xs truncate" style={{ color: 'var(--txt2)' }}>{f.route}</span>
                      <span className="font-mono-dm text-xs flex-shrink-0"
                        style={{ color: price > 0 ? 'var(--grn)' : 'var(--txt3)' }}>
                        {price > 0 ? `$${Math.round(price).toLocaleString('es-AR')}` : '—'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* DESTINO */}
        <div className="card p-4 card-lift" style={{ borderTop: '3px solid var(--grn)' }}>
          <div className="text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: 'var(--txt3)', letterSpacing: '0.08em' }}>🌍 Destino</div>
          <div className="font-display text-3xl mb-3" style={{ color: 'var(--grn)' }}>{f$(t.destinoT || 0)}</div>
          <Row label="Comidas & diario" value={f$(t.gastoT || 0)} />
          <Row label="Excursiones" value={f$(t.excT || 0)} />
          <Row label="Compras" value={f$(t.comprasT || 0)} />
          <button onClick={() => setShowDestino(v => !v)}
            className="mt-2 text-xs font-medium flex items-center gap-1"
            style={{ color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <span style={{ display: 'inline-block', transition: 'transform .2s', transform: showDestino ? 'rotate(180deg)' : 'none' }}>▾</span>
            {showDestino ? 'Ocultar' : 'Ver detalle'}
          </button>
          {showDestino && (
            <div className="mt-2 pt-2 fade-in" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="text-xs font-semibold mb-1.5" style={{ color: 'var(--txt3)' }}>Compras por persona</div>
              <div className="py-1.5 flex justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="text-xs" style={{ color: 'var(--txt2)' }}>👩 Agus</span>
                <span className="font-mono-dm text-xs">
                  <span style={{ color: 'var(--txt3)' }}>€{Math.round(t.comprasAgusEur || 0).toLocaleString('es-AR')}</span>
                  <span style={{ color: 'var(--txt3)', margin: '0 3px' }}>≈</span>
                  <span style={{ color: 'var(--txt)' }}>${Math.round((t.comprasAgusEur || 0) * (t.eurUsd || 1)).toLocaleString('es-AR')}</span>
                </span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span className="text-xs" style={{ color: 'var(--txt2)' }}>👨 Ivan</span>
                <span className="font-mono-dm text-xs">
                  <span style={{ color: 'var(--txt3)' }}>€{Math.round(t.comprasIvanEur || 0).toLocaleString('es-AR')}</span>
                  <span style={{ color: 'var(--txt3)', margin: '0 3px' }}>≈</span>
                  <span style={{ color: 'var(--txt)' }}>${Math.round((t.comprasIvanEur || 0) * (t.eurUsd || 1)).toLocaleString('es-AR')}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════ POR PERSONA ══════ */}
      <div className="card p-4 mb-4">
        <div className="font-semibold text-sm mb-3">👤 Gasto por persona</div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'Agustina', icon: '👩', extra: (t.comprasAgusEur || 0) * (t.eurUsd || 1) },
            { name: 'Ivan', icon: '👨', extra: (t.comprasIvanEur || 0) * (t.eurUsd || 1) },
          ].map(({ name, icon, extra }) => (
            <div key={name} className="rounded-xl p-3 text-center"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--txt2)' }}>{name}</div>
              <div className="font-display text-2xl" style={{ color: 'var(--txt)' }}>{f$(extra + shared)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════ DISTRIBUCIÓN ══════ */}
      <div className="card p-4">
        <div className="font-semibold text-sm mb-4">Distribución del presupuesto</div>
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <DonutChart cats={cats} total={t.grand || 0} />
          <div style={{ flex: 1, width: '100%', minWidth: 0 }}>
            {cats.map(c => (
              <div key={c.l} className="flex items-center gap-2 mb-2.5">
                <div className="text-right flex-shrink-0" style={{ width: 76, fontSize: 11, color: 'var(--txt2)' }}>{c.l}</div>
                <div className="progress-track" style={{ flex: 1 }}>
                  <div className="progress-fill" style={{ width: `${((c.v / mx) * 100).toFixed(1)}%`, background: c.c }} />
                </div>
                <div className="font-mono-dm text-right flex-shrink-0" style={{ width: 60, fontSize: 11, color: 'var(--txt)' }}>{f$(c.v)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1" style={{ borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 12, color: 'var(--txt2)' }}>{label}</span>
      <span className="font-mono-dm" style={{ fontSize: 12, fontWeight: 500, color: 'var(--txt)' }}>{value}</span>
    </div>
  );
}
