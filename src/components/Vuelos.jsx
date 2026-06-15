import { useApp } from '../context/AppContext';
import { INTL_FLIGHTS, EURO_FLIGHTS } from '../data/constants';

function FlightRow({ flight, value, onChange }) {
  const ok = parseFloat(value) > 0;
  return (
    <div className="grid gap-2 py-3 border-b last:border-0" style={{ gridTemplateColumns: '1fr auto auto', alignItems: 'center', borderColor: 'var(--border)' }}>
      <div>
        <div className="font-medium text-sm">{flight.route}</div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{flight.date}</div>
        <div className="text-xs italic" style={{ color: 'var(--lite)' }}>{flight.note}</div>
      </div>
      <a href={flight.url} target="_blank" rel="noreferrer"
        className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap"
        style={{ color: '#1a73e8', background: '#e8f0fe' }}>
        ↗ Google Flights
      </a>
      <div className="flex items-center gap-1">
        <span className="text-xs font-mono-dm" style={{ color: 'var(--muted)' }}>USD</span>
        <input type="number" placeholder="0" value={value} min="0" onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="w-20 text-right px-2 py-1.5 rounded-lg text-sm font-mono-dm outline-none transition-all"
          style={{ border: `1.5px solid ${ok ? 'var(--grn,#2d7a4f)' : 'var(--border)'}`, background: ok ? 'var(--grn-bg,#e8f5ee)' : 'var(--cream)', color: ok ? 'var(--grn,#2d7a4f)' : 'var(--txt)' }} />
      </div>
    </div>
  );
}

function Card({ title, subtitle, total, children }) {
  return (
    <div className="rounded-2xl p-5 mb-4" style={{ background: '#fff', border: '1px solid var(--border)', boxShadow: 'var(--sh)' }}>
      <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <div className="font-semibold text-sm">{title}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{subtitle}</div>
        </div>
        <div className="font-mono-dm text-lg font-medium" style={{ color: 'var(--navy)' }}>{total}</div>
      </div>
      {children}
    </div>
  );
}

export default function Vuelos() {
  const { state, setState } = useApp();
  const prices = state?.prices || {};
  const fmt = n => n > 0 ? '$' + Math.round(n).toLocaleString('es-AR') : '$0';
  const intlT = INTL_FLIGHTS.reduce((s, f) => s + (parseFloat(prices[f.id]) || 0), 0);
  const euT = EURO_FLIGHTS.reduce((s, f) => s + (parseFloat(prices[f.id]) || 0), 0);

  function setPrice(id, val) {
    setState(s => ({ ...s, prices: { ...s.prices, [id]: val } }));
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Vuelos</h1>
      <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>Buscá en Google Flights y pegá el precio. Se guarda automáticamente.</p>
      <div className="text-xs p-3 rounded-xl mb-6" style={{ background: 'var(--cream)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
        💡 <strong style={{ color: 'var(--txt)' }}>Internacionales:</strong> reservar 6–9 meses antes. <strong style={{ color: 'var(--txt)' }}>Internos:</strong> Vueling, Ryanair y easyJet son los más baratos.
      </div>
      <Card title="✈ Internacionales — BUE ↔ MAD" subtitle="Ida y vuelta al hub principal" total={fmt(intlT)}>
        {INTL_FLIGHTS.map(f => <FlightRow key={f.id} flight={f} value={prices[f.id] || ''} onChange={v => setPrice(f.id, v)} />)}
      </Card>
      <Card title="🛫 Internos Europa" subtitle="MAD → BCN → ROM → PAR → LON → MAD" total={fmt(euT)}>
        {EURO_FLIGHTS.map(f => <FlightRow key={f.id} flight={f} value={prices[f.id] || ''} onChange={v => setPrice(f.id, v)} />)}
      </Card>
    </div>
  );
}
