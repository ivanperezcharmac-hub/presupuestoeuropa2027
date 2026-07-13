import { useApp, f$ } from '../context/AppContext';
import { INTL_FLIGHTS, EURO_FLIGHTS } from '../data/constants';

const AIRLINES = [
  'Aerolíneas Argentinas', 'Iberia', 'Air Europa', 'Vueling',
  'Ryanair', 'easyJet', 'ITA Airways', 'Air France',
  'British Airways', 'Eurostar',
];

function googleFlightsUrl(from, to, dateISO) {
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(`vuelos de ${from} a ${to} el ${dateISO}`)}`;
}

function computeArrival(depTime, durationMin, tzFrom, tzTo) {
  if (!depTime || !durationMin) return null;
  const [h, m] = depTime.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  const tzDiff = (tzTo - tzFrom) * 60;
  const totalMins = h * 60 + m + durationMin + tzDiff;
  const dayOffset = Math.floor(totalMins / 1440);
  const mins = ((totalMins % 1440) + 1440) % 1440;
  return {
    time: `${Math.floor(mins / 60).toString().padStart(2, '0')}:${(mins % 60).toString().padStart(2, '0')}`,
    dayOffset,
  };
}

function formatDuration(min) {
  const h = Math.floor(min / 60), m = min % 60;
  return m > 0 ? `${h}h${m}` : `${h}h`;
}

function emptyStop() {
  return { airport: '', arrTime: '', depTime: '', flightNum: '' };
}

function FlightRow({
  flight, price, dateISO, savedLink, depTime, flightNum, airline, hasStop, stops, finalArrTime,
  onPrice, onDate, onLink, onDepTime, onFlightNum, onToggleStop, onStopChange, onAddStop, onRemoveStop, onFinalArrTime,
}) {
  const priceOk = parseFloat(price) > 0;
  const isTrain = flight.mode === 'train';
  const searchUrl = isTrain ? 'https://www.eurostar.com/es-es' : googleFlightsUrl(flight.from, flight.to, dateISO);
  const arrival = hasStop ? null : computeArrival(depTime, flight.durationMin, flight.tzFrom, flight.tzTo);

  return (
    <div className="py-3" style={{ borderBottom: '1px solid var(--border)' }}>
      {/* Route + link */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="font-medium text-sm">{flight.route}</div>
          <div className="text-xs italic mt-0.5" style={{ color: 'var(--txt3)' }}>
            {flight.note} · {formatDuration(flight.durationMin)} {isTrain ? 'de viaje' : 'en vuelo directo'}
          </div>
        </div>
        <a href={searchUrl} target="_blank" rel="noreferrer"
          className="flex-shrink-0 flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap"
          style={{ color: 'var(--blue)', background: 'rgba(27,79,216,0.08)' }}>
          {isTrain ? '↗ Eurostar' : '↗ Flights'}
        </a>
      </div>

      {/* Date + Flight number + Airline */}
      <div className="flex flex-col sm:flex-row gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1">
          <span className="font-mono-dm text-xs flex-shrink-0 w-12" style={{ color: 'var(--txt3)' }}>Fecha</span>
          <input type="date" value={dateISO} onChange={e => onDate(e.target.value)}
            className="inp inp-mono flex-1" style={{ fontSize: 13 }} />
        </div>
        <div className="flex items-center gap-2 flex-1">
          <span className="font-mono-dm text-xs flex-shrink-0 w-12" style={{ color: 'var(--txt3)' }}>{isTrain ? 'Tren #' : 'Vuelo #'}</span>
          <input type="text" placeholder={isTrain ? 'ej: ES9032' : 'ej: IB6844'} value={flightNum || ''}
            onChange={e => onFlightNum(e.target.value.toUpperCase())}
            className="inp inp-mono flex-1" style={{ fontSize: 13 }} />
        </div>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono-dm text-xs flex-shrink-0 w-12" style={{ color: 'var(--txt3)' }}>Línea</span>
        <select value={airline || ''} onChange={e => onAirline(e.target.value)}
          className="inp flex-1" style={{ fontSize: 13 }}>
          <option value="">— Elegir —</option>
          {AIRLINES.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Direct / with stop toggle */}
      <label className="flex items-center gap-2 mb-2 cursor-pointer select-none">
        <div onClick={() => onToggleStop(!hasStop)}
          className="flex-shrink-0 w-9 h-5 rounded-full relative transition-colors"
          style={{ background: hasStop ? 'var(--blue)' : 'var(--border2)' }}>
          <div className="absolute top-0.5 rounded-full bg-white transition-all"
            style={{ width: 16, height: 16, left: hasStop ? 18 : 2 }} />
        </div>
        <span className="text-xs font-medium" style={{ color: 'var(--txt2)' }}>
          {hasStop ? 'Con escala' : 'Vuelo directo'}
        </span>
      </label>

      {/* Direct: departure + computed arrival */}
      {!hasStop && (
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="rounded-xl p-3" style={{ background: 'var(--surface2)', border: '1.5px solid var(--border2)' }}>
            <div className="font-mono-dm mb-1" style={{ fontSize: 10, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Hora de salida</div>
            <input type="time" value={depTime || ''} onChange={e => onDepTime(e.target.value)}
              className="font-mono-dm outline-none w-full"
              style={{ fontSize: 22, fontWeight: 600, background: 'transparent', color: 'var(--txt)', border: 'none', padding: 0 }} />
          </div>
          <div className="rounded-xl p-3" style={{ background: arrival ? 'rgba(22,101,52,0.06)' : 'var(--surface2)', border: arrival ? '1.5px solid rgba(22,101,52,0.3)' : '1.5px solid var(--border)' }}>
            <div className="font-mono-dm mb-1" style={{ fontSize: 10, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Llega (calculado)</div>
            {arrival ? (
              <div className="flex items-baseline gap-1">
                <span className="font-mono-dm font-bold" style={{ fontSize: 22, color: 'var(--grn)' }}>{arrival.time}</span>
                {arrival.dayOffset > 0 && (
                  <span className="font-mono-dm font-semibold rounded-md px-1.5 py-0.5" style={{ fontSize: 11, background: 'var(--amber-bg)', color: 'var(--amber)' }}>+{arrival.dayOffset}d</span>
                )}
              </div>
            ) : (
              <div className="font-mono-dm" style={{ fontSize: 22, color: 'var(--txt3)' }}>—</div>
            )}
          </div>
        </div>
      )}

      {/* With stop: stop details */}
      {hasStop && (
        <div className="rounded-lg p-3 mb-2 flex flex-col gap-2" style={{ background: 'var(--surface2)' }}>
          <div className="rounded-xl p-3" style={{ background: 'var(--surface)', border: '1.5px solid var(--border2)' }}>
            <div className="font-mono-dm mb-1" style={{ fontSize: 10, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sale {flight.from}</div>
            <input type="time" value={depTime || ''} onChange={e => onDepTime(e.target.value)}
              className="font-mono-dm outline-none w-full"
              style={{ fontSize: 20, fontWeight: 600, background: 'transparent', color: 'var(--txt)', border: 'none', padding: 0 }} />
          </div>
          {stops.map((stop, idx) => (
            <div key={idx} className="rounded-lg p-2.5 flex flex-col gap-2"
              style={{ background: 'var(--surface)', border: '1px dashed var(--border2)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: 'var(--gold)' }}>
                  ✈ Escala {stops.length > 1 ? idx + 1 : ''}
                </span>
                <button onClick={() => onRemoveStop(idx)}
                  className="text-xs px-1.5 rounded"
                  style={{ color: 'var(--txt3)', background: 'var(--surface2)', border: 'none', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>
              <input type="text" placeholder="Aeropuerto (ej: GRU, MIA)" value={stop.airport}
                onChange={e => onStopChange(idx, 'airport', e.target.value.toUpperCase())}
                className="inp inp-mono" style={{ fontSize: 13 }} />
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg p-2" style={{ background: 'var(--surface2)', border: '1px solid var(--border2)' }}>
                  <div className="font-mono-dm mb-1" style={{ fontSize: 9, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Llega</div>
                  <input type="time" value={stop.arrTime}
                    onChange={e => onStopChange(idx, 'arrTime', e.target.value)}
                    className="font-mono-dm outline-none w-full"
                    style={{ fontSize: 16, fontWeight: 600, background: 'transparent', color: 'var(--txt)', border: 'none', padding: 0 }} />
                </div>
                <div className="rounded-lg p-2" style={{ background: 'var(--surface2)', border: '1px solid var(--border2)' }}>
                  <div className="font-mono-dm mb-1" style={{ fontSize: 9, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sale</div>
                  <input type="time" value={stop.depTime}
                    onChange={e => onStopChange(idx, 'depTime', e.target.value)}
                    className="font-mono-dm outline-none w-full"
                    style={{ fontSize: 16, fontWeight: 600, background: 'transparent', color: 'var(--txt)', border: 'none', padding: 0 }} />
                </div>
              </div>
              <input type="text" placeholder="Vuelo # del siguiente tramo" value={stop.flightNum}
                onChange={e => onStopChange(idx, 'flightNum', e.target.value.toUpperCase())}
                className="inp inp-mono" style={{ fontSize: 12 }} />
            </div>
          ))}
          <button onClick={onAddStop}
            className="py-1.5 rounded-lg text-xs font-medium"
            style={{ border: '1px dashed var(--border2)', color: 'var(--txt2)', background: 'transparent', cursor: 'pointer' }}>
            + Agregar otra escala
          </button>
          <div className="rounded-xl p-3 mt-1" style={{ background: 'rgba(27,79,216,0.05)', border: '1.5px solid rgba(27,79,216,0.25)' }}>
            <div className="font-mono-dm mb-1" style={{ fontSize: 10, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Llegada final a {flight.to} (manual)
            </div>
            <input type="time" value={finalArrTime || ''} onChange={e => onFinalArrTime(e.target.value)}
              className="font-mono-dm outline-none w-full"
              style={{ fontSize: 20, fontWeight: 700, background: 'transparent', color: 'var(--blue)', border: 'none', padding: 0 }} />
            <div style={{ fontSize: 10, color: 'var(--txt3)', marginTop: 4 }}>Con escala el horario varía — anotalo vos</div>
          </div>
        </div>
      )}

      {/* Price */}
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono-dm text-xs flex-shrink-0 w-12" style={{ color: 'var(--txt3)' }}>USD</span>
        <input type="number" placeholder="0" value={price} min="0"
          onChange={e => onPrice(parseFloat(e.target.value) || 0)}
          className="font-mono-dm text-sm text-right outline-none rounded-lg px-3 py-2 flex-1"
          style={{
            border: `1.5px solid ${priceOk ? 'var(--grn)' : 'var(--border2)'}`,
            background: priceOk ? 'var(--grn-bg)' : 'var(--surface2)',
            color: priceOk ? 'var(--grn)' : 'var(--txt)',
          }} />
      </div>

      {/* Link */}
      <div className="flex items-center gap-2">
        <span className="text-xs flex-shrink-0" style={{ color: 'var(--txt3)' }}>🔗</span>
        <input type="url" placeholder="Pegá aquí el link donde encontraste este vuelo..."
          value={savedLink || ''} onChange={e => onLink(e.target.value)}
          className="inp flex-1" style={{ fontSize: 13 }} />
        {savedLink && (
          <a href={savedLink} target="_blank" rel="noreferrer"
            className="flex-shrink-0 text-xs font-medium px-2 py-1.5 rounded-lg"
            style={{ color: 'var(--grn)', background: 'var(--grn-bg)' }}>
            Abrir
          </a>
        )}
      </div>
    </div>
  );
}

export default function Vuelos() {
  const { state, setState } = useApp();
  const prices = state?.prices || {};
  const dates = state?.flightDates || {};
  const links = state?.flightLinks || {};
  const depTimes = state?.flightDepTimes || {};
  const numbers = state?.flightNumbers || {};
  const airlines = state?.flightAirlines || {};
  const hasStop = state?.flightHasStop || {};
  const stops = state?.flightStops || {};
  const finalArr = state?.flightFinalArrival || {};

  const fmt = n => n > 0 ? '$' + Math.round(n).toLocaleString('es-AR') : '$0';
  const intlT = INTL_FLIGHTS.reduce((s, f) => s + (parseFloat(prices[f.id]) || 0), 0);
  const euT = EURO_FLIGHTS.reduce((s, f) => s + (parseFloat(prices[f.id]) || 0), 0);

  const set = (field, id, val) =>
    setState(s => ({ ...s, [field]: { ...s[field], [id]: val } }));

  const toggleStop = (id, val) =>
    setState(s => {
      const next = { ...s, flightHasStop: { ...s.flightHasStop, [id]: val } };
      if (val && !s.flightStops?.[id]?.length) {
        next.flightStops = { ...s.flightStops, [id]: [emptyStop()] };
      }
      return next;
    });

  const addStop = (id) =>
    setState(s => ({ ...s, flightStops: { ...s.flightStops, [id]: [...(s.flightStops?.[id] || []), emptyStop()] } }));

  const removeStop = (id, idx) =>
    setState(s => ({ ...s, flightStops: { ...s.flightStops, [id]: (s.flightStops?.[id] || []).filter((_, i) => i !== idx) } }));

  const updateStop = (id, idx, field, val) =>
    setState(s => {
      const arr = [...(s.flightStops?.[id] || [])];
      arr[idx] = { ...arr[idx], [field]: val };
      return { ...s, flightStops: { ...s.flightStops, [id]: arr } };
    });

  const groups = [
    { title: '✈ BUE ↔ Europa', sub: 'Vuelos internacionales', total: intlT, flights: INTL_FLIGHTS },
    { title: '🛫 Internos Europa', sub: 'Tramos entre ciudades', total: euT, flights: EURO_FLIGHTS },
  ];

  return (
    <div className="fade-in">
      <h1 className="font-display text-2xl font-bold mb-1">Vuelos</h1>
      <p className="text-sm mb-3" style={{ color: 'var(--txt2)' }}>
        Anotá fecha, número de vuelo y hora de salida. Si tiene escala, activá el switch y agregá los detalles.
      </p>
      <div className="tip-box">
        💡 En vuelos directos la llegada se calcula sola. Con escala, anotá los horarios de cada tramo manualmente — el tiempo total varía según la conexión.
      </div>

      {groups.map(group => (
        <div key={group.title} className="card p-4 mb-4">
          <div className="flex items-start justify-between mb-3 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div>
              <div className="font-semibold text-sm">{group.title}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--txt2)' }}>{group.sub}</div>
            </div>
            <div className="font-mono-dm text-base font-semibold flex-shrink-0" style={{ color: 'var(--txt)' }}>
              {fmt(group.total)}
            </div>
          </div>
          {group.flights.map(f => (
            <FlightRow key={f.id}
              flight={f}
              price={prices[f.id] || ''}
              dateISO={dates[f.id] || f.defDate}
              savedLink={links[f.id] || ''}
              depTime={depTimes[f.id] || ''}
              flightNum={numbers[f.id] || ''}
              airline={airlines[f.id] || ''}
              hasStop={!!hasStop[f.id]}
              stops={stops[f.id] || []}
              finalArrTime={finalArr[f.id] || ''}
              onPrice={v => set('prices', f.id, v)}
              onDate={v => set('flightDates', f.id, v)}
              onLink={v => set('flightLinks', f.id, v)}
              onDepTime={v => set('flightDepTimes', f.id, v)}
              onFlightNum={v => set('flightNumbers', f.id, v)}
              onAirline={v => set('flightAirlines', f.id, v)}
              onToggleStop={v => toggleStop(f.id, v)}
              onStopChange={(idx, field, val) => updateStop(f.id, idx, field, val)}
              onAddStop={() => addStop(f.id)}
              onRemoveStop={idx => removeStop(f.id, idx)}
              onFinalArrTime={v => set('flightFinalArrival', f.id, v)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
