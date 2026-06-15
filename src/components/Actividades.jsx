import { useState } from 'react';
import { useApp, cityDays, f$ } from '../context/AppContext';
import { EXCURSION_CITIES, CITIES } from '../data/constants';

function ExcursionesTab() {
  const { state, setState } = useApp();
  function addRow(cityId) {
    setState(s => ({ ...s, excursiones: { ...s.excursiones, [cityId]: [...(s.excursiones?.[cityId] || []), { name: '', cost: '', link: '' }] } }));
  }
  function updateRow(cityId, i, field, value) {
    setState(s => {
      const items = [...(s.excursiones?.[cityId] || [])];
      items[i] = { ...items[i], [field]: value };
      return { ...s, excursiones: { ...s.excursiones, [cityId]: items } };
    });
  }
  function removeRow(cityId, i) {
    setState(s => ({ ...s, excursiones: { ...s.excursiones, [cityId]: (s.excursiones?.[cityId] || []).filter((_,idx)=>idx!==i) } }));
  }
  const totalExc = EXCURSION_CITIES.reduce((s,c)=>s+(state?.excursiones?.[c.id]||[]).reduce((ss,it)=>ss+(parseFloat(it.cost)||0),0),0);

  return (
    <div>
      {EXCURSION_CITIES.map(city => {
        const items = state?.excursiones?.[city.id] || [];
        const total = items.reduce((s,it)=>s+(parseFloat(it.cost)||0),0);
        return (
          <div key={city.id} className="rounded-2xl p-4 mb-4" style={{ background: '#fff', border: '1px solid var(--border)', boxShadow: 'var(--sh)' }}>
            <div className="flex justify-between items-center mb-3 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="font-semibold text-sm">{city.flag} {city.name}</div>
              <div className="font-mono-dm text-base font-semibold" style={{ color: 'var(--navy)' }}>{f$(total)}</div>
            </div>
            {items.map((it,i)=>(
              <div key={i} className="grid gap-2 py-2 border-b last:border-0" style={{ gridTemplateColumns: '1fr 80px 1fr auto', alignItems: 'center', borderColor: 'var(--border)' }}>
                <input type="text" placeholder={city.suggestions[i] || 'Actividad...'} value={it.name||''} onChange={e=>updateRow(city.id,i,'name',e.target.value)}
                  className="px-2 py-1.5 rounded-lg text-sm outline-none" style={{ border: '1.5px solid var(--border)', background: 'var(--cream)' }} list={`sug-${city.id}`} />
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--muted)' }}>$</span>
                  <input type="number" placeholder="0" min="0" value={it.cost||''} onChange={e=>updateRow(city.id,i,'cost',e.target.value)}
                    className="w-full pl-4 pr-2 py-1.5 rounded-lg text-sm font-mono-dm outline-none" style={{ border: '1.5px solid var(--border)', background: 'var(--cream)' }} />
                </div>
                <input type="text" placeholder="Link o nota..." value={it.link||''} onChange={e=>updateRow(city.id,i,'link',e.target.value)}
                  className="px-2 py-1.5 rounded-lg text-sm outline-none" style={{ border: '1.5px solid var(--border)', background: 'var(--cream)' }} />
                <button onClick={()=>removeRow(city.id,i)} className="text-xs px-1.5 py-1 rounded hover:bg-red-50 transition-colors" style={{ color: 'var(--lite)' }}>✕</button>
              </div>
            ))}
            <datalist id={`sug-${city.id}`}>{city.suggestions.map(s=><option key={s} value={s}/>)}</datalist>
            <button onClick={()=>addRow(city.id)} className="mt-3 w-full py-1.5 rounded-xl text-xs font-medium transition-all"
              style={{ border: '1px solid var(--border)', color: 'var(--muted)', background: 'var(--cream)' }}>+ Agregar actividad</button>
          </div>
        );
      })}
      <div className="rounded-2xl p-4" style={{ background: '#fff', border: '1px solid var(--border)' }}>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-sm">💰 Total excursiones</span>
          <span className="font-mono-dm text-lg font-semibold" style={{ color: 'var(--navy)' }}>{f$(totalExc)}</span>
        </div>
      </div>
    </div>
  );
}

function ItinerarioTab() {
  const { state, setState } = useApp();
  function update(key, value) {
    setState(s => ({ ...s, itinerario: { ...s.itinerario, [key]: value } }));
  }
  return (
    <div>
      {CITIES.map(city => {
        const c = state?.cities?.[city.id];
        if (!c?.checkIn || !c?.checkOut) return null;
        const start = new Date(c.checkIn), end = new Date(c.checkOut);
        if (isNaN(start) || isNaN(end) || end <= start) return null;
        const days = [];
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
          days.push(new Date(d));
        }
        return (
          <div key={city.id} className="rounded-2xl p-4 mb-4" style={{ background: '#fff', border: '1px solid var(--border)', boxShadow: 'var(--sh)' }}>
            <div className="flex items-center gap-2 mb-3 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="font-semibold text-sm">{city.flag} {city.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(15,30,53,.08)', color: 'var(--navy)' }}>{days.length} días</span>
            </div>
            {days.map((d, idx) => {
              const key = `${city.id}_${d.toISOString().slice(0,10)}`;
              return (
                <div key={key} className="grid gap-3 py-2 border-b last:border-0" style={{ gridTemplateColumns: '90px 1fr', borderColor: 'var(--border)' }}>
                  <div>
                    <div className="font-semibold text-xs">{d.toLocaleDateString('es-AR',{weekday:'short',day:'numeric',month:'short'})}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>Día {idx + 1}</div>
                  </div>
                  <textarea rows={2} placeholder="¿Qué hacen hoy?" value={state?.itinerario?.[key] || ''}
                    onChange={e => update(key, e.target.value)}
                    className="px-3 py-2 rounded-xl text-sm outline-none resize-none"
                    style={{ border: '1.5px solid var(--border)', background: 'var(--cream)' }} />
                </div>
              );
            })}
          </div>
        );
      })}
      {!CITIES.some(c => state?.cities?.[c.id]?.checkIn) && (
        <div className="rounded-2xl p-8 text-center" style={{ background: '#fff', border: '1px solid var(--border)', color: 'var(--muted)' }}>
          Cargá las fechas en la sección Ciudades para ver el itinerario.
        </div>
      )}
    </div>
  );
}

export default function Actividades() {
  const [tab, setTab] = useState('exc');
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Excursiones & Plan de viaje</h1>
      <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>Actividades por ciudad y tu itinerario día a día.</p>
      <div className="flex gap-2 mb-6">
        {[{id:'exc',label:'🗺 Excursiones'},{id:'plan',label:'🗓 Plan día a día'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className="px-4 py-2 rounded-full text-xs font-medium transition-all"
            style={{ background: tab===t.id ? 'var(--navy)' : 'transparent', color: tab===t.id ? '#fff' : 'var(--muted)', border: `1.5px solid ${tab===t.id ? 'var(--navy)' : 'var(--border)'}` }}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'exc' ? <ExcursionesTab /> : <ItinerarioTab />}
    </div>
  );
}
