import { useApp, cityDays, f$ } from '../context/AppContext';
import { CITIES } from '../data/constants';

function CityCard({ city }) {
  const { state, setState } = useApp();
  const c = state?.cities?.[city.id] || {};
  const days = cityDays(state?.cities, city.id);
  const hotel = parseFloat(c.hotel) || 0;
  const daily = parseFloat(c.daily) || 0;
  const total = days * (hotel + daily);

  function update(field, value) {
    setState(s => ({ ...s, cities: { ...s.cities, [city.id]: { ...s.cities?.[city.id], [field]: value } } }));
  }

  function updateNote(value) {
    setState(s => ({ ...s, cityNotes: { ...s.cityNotes, [city.id]: value } }));
  }

  const noteVal = state?.cityNotes?.[city.id] || '';

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid var(--border)', boxShadow: 'var(--sh)' }}>
      <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-2xl">{city.flag}</span>
        <div>
          <div className="font-display text-base">{city.name}</div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>{city.country}</div>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--muted)' }}>Fechas de estadía</label>
          <div className="grid grid-cols-2 gap-2">
            {['checkIn', 'checkOut'].map((f, i) => (
              <div key={f}>
                <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{i === 0 ? 'Llegada' : 'Salida'}</div>
                <input type="date" value={c[f] || (i === 0 ? city.defIn : city.defOut)} min="2027-03-17" max="2027-04-11"
                  onChange={e => update(f, e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg text-sm font-mono-dm outline-none transition-all"
                  style={{ border: '1.5px solid var(--border)', background: 'var(--cream)' }} />
              </div>
            ))}
          </div>
          <div className="text-xs mt-1 font-mono-dm" style={{ color: 'var(--muted)' }}>{days} noche{days !== 1 ? 's' : ''}</div>
        </div>
        {[{ f: 'hotel', label: 'Hotel / Airbnb por noche (USD)' }, { f: 'daily', label: 'Gastos diarios / persona (USD)' }].map(({ f, label }) => (
          <div key={f}>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--muted)' }}>{label}</label>
            <input type="number" placeholder="0" min="0" value={c[f] || ''}
              onChange={e => update(f, parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 rounded-lg text-sm font-mono-dm outline-none transition-all"
              style={{ border: '1.5px solid var(--border)', background: 'var(--cream)' }} />
          </div>
        ))}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--muted)' }}>Notas</label>
          <textarea
            placeholder="Tips, restaurantes, lugares que no perderse..."
            value={noteVal}
            onChange={e => updateNote(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all resize-none"
            style={{ border: '1.5px solid var(--border)', background: 'var(--cream)', lineHeight: '1.5' }}
          />
        </div>
      </div>
      <div className="flex justify-between items-center px-4 py-2.5" style={{ background: 'var(--cream)', borderTop: '1px solid var(--border)' }}>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>Subtotal {city.name}</span>
        <span className="font-mono-dm font-semibold text-sm" style={{ color: 'var(--navy)' }}>{f$(total)}</span>
      </div>
    </div>
  );
}

export default function Ciudades() {
  const { state } = useApp();
  const daysUsed = CITIES.reduce((s, c) => s + cityDays(state?.cities, c.id), 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Ciudades</h1>
      <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>Editá las fechas y costos por ciudad.</p>
      <div className="text-xs p-3 rounded-xl mb-6" style={{ background: 'var(--cream)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
        💡 Rango del viaje: <strong style={{ color: 'var(--txt)' }}>17 mar → 11 abr 2027</strong>. El subtotal = días × (hotel/noche + gastos/día).
      </div>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        {CITIES.map(city => <CityCard key={city.id} city={city} />)}
      </div>
      <div className="rounded-2xl p-4" style={{ background: '#fff', border: '1px solid var(--border)' }}>
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-sm">Control de días</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${daysUsed === 26 ? 'bg-green-100 text-green-700' : daysUsed < 26 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
            {daysUsed === 26 ? '✓ 26 días — perfecto' : daysUsed < 26 ? `${26 - daysUsed} días sin asignar` : `⚠ ${daysUsed - 26} días de más`}
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--cream2,#e8e0d0)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(daysUsed / 26 * 100, 100)}%`, background: 'var(--gold)' }} />
        </div>
        <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Días asignados: <strong>{daysUsed}</strong> / 26</div>
      </div>
    </div>
  );
}
