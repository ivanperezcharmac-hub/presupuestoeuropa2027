import { useApp, cityDays, getCityDates, f$ } from '../context/AppContext';
import { CITIES } from '../data/constants';

function CityCard({ city }) {
  const { state, setState } = useApp();
  const dates = getCityDates(state, city.id);
  const checkIn = dates.checkIn || city.defIn;
  const checkOut = dates.checkOut || city.defOut;
  const days = cityDays(state, city.id);
  const c = state?.cities?.[city.id] || {};
  const hotel = parseFloat(c.hotel) || 0;
  const daily = parseFloat(c.daily) || 0;
  const total = days * (hotel + daily);
  const noteVal = state?.cityNotes?.[city.id] || '';

  function update(field, value) {
    setState(s => ({ ...s, cities: { ...s.cities, [city.id]: { ...s.cities?.[city.id], [field]: value } } }));
  }

  function updateNote(value) {
    setState(s => ({ ...s, cityNotes: { ...s.cityNotes, [city.id]: value } }));
  }

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-2xl">{city.flag}</span>
        <div>
          <div className="font-display text-base">{city.name}</div>
          <div className="text-xs" style={{ color: 'var(--txt3)' }}>{city.country}</div>
        </div>
        <div className="ml-auto tag tag-ink">{days} noche{days !== 1 ? 's' : ''}</div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {/* Fechas — solo lectura, derivadas de Vuelos */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--txt3)' }}>Fechas de estadía</span>
            <span className="tag tag-blue">desde Vuelos</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[{ label: 'Llegada', val: checkIn }, { label: 'Salida', val: checkOut }].map(({ label, val }) => (
              <div key={label}>
                <div className="text-xs mb-1" style={{ color: 'var(--txt3)' }}>{label}</div>
                <div className="inp inp-mono flex items-center text-sm" style={{ cursor: 'default', color: 'var(--txt)', background: 'var(--surface2)' }}>
                  {val ? new Date(val + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--txt3)' }}>
            Cambiá las fechas desde la sección <strong style={{ color: 'var(--txt2)' }}>Vuelos</strong>
          </div>
        </div>

        {/* Hotel + gastos diarios */}
        {[
          { f: 'hotel', label: 'Hotel / Airbnb por noche', unit: 'USD/noche' },
          { f: 'daily', label: 'Gastos diarios por persona', unit: 'USD/día' },
        ].map(({ f, label, unit }) => (
          <div key={f}>
            <label className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--txt3)' }}>{label}</span>
              <span className="text-xs" style={{ color: 'var(--txt3)' }}>{unit}</span>
            </label>
            <input type="number" placeholder="0" min="0" value={c[f] || ''}
              onChange={e => update(f, parseFloat(e.target.value) || 0)}
              className="inp inp-mono" />
          </div>
        ))}

        {/* Notas */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--txt3)' }}>
            Notas
          </label>
          <textarea
            placeholder={`Tips, restaurantes, lugares que no perderse en ${city.name}...`}
            value={noteVal}
            onChange={e => updateNote(e.target.value)}
            rows={3}
            className="inp"
            style={{ resize: 'none', lineHeight: '1.5', minHeight: 80 }}
          />
        </div>
      </div>

      {/* Footer subtotal */}
      <div className="flex justify-between items-center px-4 py-2.5" style={{ background: 'var(--surface2)', borderTop: '1px solid var(--border)' }}>
        <span className="text-xs" style={{ color: 'var(--txt3)' }}>Subtotal {city.name}</span>
        <span className="font-mono-dm font-semibold text-sm" style={{ color: total > 0 ? 'var(--navy)' : 'var(--txt3)' }}>
          {f$(total)}
        </span>
      </div>
    </div>
  );
}

export default function Ciudades() {
  const { state } = useApp();
  const daysUsed = CITIES.reduce((s, c) => s + cityDays(state, c.id), 0);
  const pct = Math.min(daysUsed / 26 * 100, 100);

  return (
    <div className="fade-in">
      <h1 className="font-display text-2xl font-bold mb-1">Ciudades</h1>
      <p className="text-sm mb-4" style={{ color: 'var(--txt2)' }}>
        Las fechas se sincronizan automáticamente desde los vuelos. Editá hotel y gastos diarios.
      </p>

      <div className="tip-box mb-4">
        💡 Las fechas de llegada y salida de cada ciudad se derivan de los vuelos que configuraste. Para cambiarlas, editá las fechas en <strong>Vuelos</strong>.
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        {CITIES.map(city => <CityCard key={city.id} city={city} />)}
      </div>

      {/* Control de días */}
      <div className="card p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-sm">Control de días</span>
          <span className={`tag ${daysUsed === 26 ? 'tag-green' : daysUsed < 26 ? 'tag-amber' : 'tag-red'}`}>
            {daysUsed === 26 ? '✓ 26 días — perfecto' : daysUsed < 26 ? `${26 - daysUsed} días sin asignar` : `⚠ ${daysUsed - 26} días de más`}
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%`, background: daysUsed === 26 ? 'var(--grn)' : daysUsed > 26 ? 'var(--red)' : 'var(--gold)' }} />
        </div>
        <div className="text-xs mt-1" style={{ color: 'var(--txt3)' }}>
          Días asignados: <strong style={{ color: 'var(--txt)' }}>{daysUsed}</strong> / 26
        </div>
      </div>
    </div>
  );
}
