import { useMemo } from 'react';
import { useApp, cityDays, f$ } from '../context/AppContext';
import { CITIES, INTL_FLIGHTS, EURO_FLIGHTS, COMPRAS_CATS, EXCURSION_CITIES } from '../data/constants';

function useTotals() {
  const { state, eurUsd } = useApp();
  return useMemo(() => {
    if (!state) return {};
    const intlT = INTL_FLIGHTS.reduce((s, f) => s + (parseFloat(state.prices?.[f.id]) || 0), 0);
    const euT = EURO_FLIGHTS.reduce((s, f) => s + (parseFloat(state.prices?.[f.id]) || 0), 0);
    let alojT = 0, gastoT = 0, daysUsed = 0;
    CITIES.forEach(city => {
      const days = cityDays(state.cities, city.id);
      const hotel = parseFloat(state.cities?.[city.id]?.hotel) || 0;
      const daily = parseFloat(state.cities?.[city.id]?.daily) || 0;
      alojT += days * hotel; gastoT += days * daily; daysUsed += days;
    });
    const excT = EXCURSION_CITIES.reduce((s, city) =>
      s + (state.excursiones?.[city.id] || []).reduce((ss, it) => ss + (parseFloat(it.cost) || 0), 0), 0);
    const comprasEur = COMPRAS_CATS.reduce((s, cat) =>
      s + ['agus', 'ivan'].reduce((sp, p) =>
        sp + (state.compras?.[`${cat.id}_${p}`] || []).reduce((ss, it) => ss + (parseFloat(it.cost) || 0), 0), 0), 0);
    const comprasT = comprasEur * eurUsd;
    const comprasAgusEur = COMPRAS_CATS.reduce((s, cat) =>
      s + (state.compras?.[`${cat.id}_agus`] || []).reduce((ss, it) => ss + (parseFloat(it.cost) || 0), 0), 0);
    const comprasIvanEur = COMPRAS_CATS.reduce((s, cat) =>
      s + (state.compras?.[`${cat.id}_ivan`] || []).reduce((ss, it) => ss + (parseFloat(it.cost) || 0), 0), 0);
    const grand = intlT + euT + alojT + gastoT + excT + comprasT;
    const baseT = intlT + euT + alojT;
    const destinoT = gastoT + excT + comprasT;
    return { intlT, euT, alojT, gastoT, excT, comprasT, comprasAgusEur, comprasIvanEur, grand, baseT, destinoT, daysUsed, eurUsd };
  }, [state, eurUsd]);
}

function PieChart({ cats, total }) {
  if (!total) return <div className="w-44 h-44 rounded-full border-4 border-dashed" style={{ borderColor: 'var(--border)' }} />;
  let angle = -Math.PI / 2;
  const paths = cats.filter(c => c.v > 0).map((cat) => {
    const slice = (cat.v / total) * 2 * Math.PI;
    const r = 78, ri = 52, cx = 90, cy = 90;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(angle + slice), y2 = cy + r * Math.sin(angle + slice);
    const xi1 = cx + ri * Math.cos(angle), yi1 = cy + ri * Math.sin(angle);
    const xi2 = cx + ri * Math.cos(angle + slice), yi2 = cy + ri * Math.sin(angle + slice);
    const large = slice > Math.PI ? 1 : 0;
    const d = `M ${xi1} ${yi1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${ri} ${ri} 0 ${large} 0 ${xi1} ${yi1} Z`;
    angle += slice;
    return <path key={cat.l} d={d} fill={cat.c} stroke="white" strokeWidth="2" className="cursor-pointer hover:opacity-80 transition-opacity" />;
  });
  return (
    <div className="relative flex-shrink-0">
      <svg width="180" height="180" viewBox="0 0 180 180">{paths}</svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-xs" style={{ color: 'var(--muted)' }}>Total</div>
        <div className="font-mono-dm font-semibold" style={{ color: 'var(--navy)', fontSize: 15 }}>{f$(total)}</div>
      </div>
    </div>
  );
}

export default function Resumen() {
  const t = useTotals();
  const { state, eurUsd } = useApp();

  const cats = [
    { l: "Vuelos int'l", v: t.intlT, c: '#0f1e35' },
    { l: 'Vuelos EU', v: t.euT, c: '#2E5F8A' },
    { l: 'Alojamiento', v: t.alojT, c: '#c9a84c' },
    { l: 'Gastos', v: t.gastoT, c: '#2d7a4f' },
    { l: 'Excursiones', v: t.excT, c: '#e67e22' },
    { l: 'Compras', v: t.comprasT, c: '#c44d6e' },
  ];
  const mx = Math.max(...cats.map(c => c.v), 1);
  const shared = (t.grand - t.comprasAgusEur * eurUsd - t.comprasIvanEur * eurUsd) / 2;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Resumen general</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Tu presupuesto completo, actualizado en tiempo real.</p>

      {/* Hero */}
      <div className="rounded-2xl p-6 mb-4 text-white relative overflow-hidden" style={{ background: 'var(--navy)' }}>
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full" style={{ background: 'rgba(201,168,76,.07)' }} />
        <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,.35)' }}>Total estimado del viaje</div>
        <div className="font-display text-5xl leading-none mb-1" style={{ color: 'var(--goldl)' }}>{f$(t.grand)}</div>
        <div className="text-xs" style={{ color: 'rgba(255,255,255,.38)' }}>{t.grand > 0 ? `${f$(t.grand / 26)} por día · 26 días` : 'Completá los datos en cada sección'}</div>
      </div>

      {/* Dos bloques */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card borderTop="var(--navy)">
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>✈ Presupuesto base</div>
          <div className="font-display text-3xl mb-3" style={{ color: 'var(--navy)' }}>{f$(t.baseT)}</div>
          <Row label="Vuelos int'l" value={f$(t.intlT + t.euT)} />
          <Row label="Alojamiento" value={f$(t.alojT)} />
        </Card>
        <Card borderTop="var(--grn, #2d7a4f)">
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>🌍 En destino</div>
          <div className="font-display text-3xl mb-3" style={{ color: '#2d7a4f' }}>{f$(t.destinoT)}</div>
          <Row label="Comidas" value={f$(t.gastoT)} />
          <Row label="Excursiones" value={f$(t.excT)} />
          <Row label="Compras" value={f$(t.comprasT)} />
        </Card>
      </div>

      {/* Por persona */}
      <Card className="mb-4">
        <div className="font-semibold text-sm mb-3">👤 Gasto por persona</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3 text-center" style={{ background: 'var(--cream)' }}>
            <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>👩 Agus</div>
            <div className="font-display text-2xl" style={{ color: 'var(--navy)' }}>{f$(t.comprasAgusEur * eurUsd + shared)}</div>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: 'var(--cream)' }}>
            <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>👨 Ivan</div>
            <div className="font-display text-2xl" style={{ color: 'var(--navy)' }}>{f$(t.comprasIvanEur * eurUsd + shared)}</div>
          </div>
        </div>
      </Card>

      {/* Chart */}
      <Card>
        <div className="font-semibold text-sm mb-4">Distribución del presupuesto</div>
        <div className="flex items-center gap-6 flex-wrap">
          <PieChart cats={cats} total={t.grand} />
          <div className="flex-1 min-w-40">
            {cats.map(c => (
              <div key={c.l} className="grid gap-2 mb-2" style={{ gridTemplateColumns: '80px 1fr 60px', alignItems: 'center' }}>
                <div className="text-xs text-right" style={{ color: 'var(--muted)' }}>{c.l}</div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--cream2, #e8e0d0)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${(c.v / mx * 100).toFixed(1)}%`, background: c.c }} />
                </div>
                <div className="font-mono-dm text-xs">{f$(c.v)}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function Card({ children, className = '', borderTop, style = {} }) {
  return (
    <div className={`rounded-2xl p-4 mb-4 ${className}`}
      style={{ background: '#fff', border: '1px solid var(--border, #ddd6c8)', boxShadow: 'var(--sh)', borderTop: borderTop ? `3px solid ${borderTop}` : undefined, ...style }}>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-xs py-1">
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span className="font-mono-dm font-medium">{value}</span>
    </div>
  );
}
