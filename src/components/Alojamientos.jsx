import { useState } from 'react';
import { useApp, cityDays, f$ } from '../context/AppContext';
import { CITIES } from '../data/constants';

const TIPOS = ['','Airbnb','Hotel','Hostel','Apartamento','B&B','Otro'];

function empty() { return { name:'',type:'',price:'',link:'',zona:'',notes:'',tel:'',dir:'' }; }

export default function Alojamientos() {
  const { state, setState } = useApp();
  const [tabs, setTabs] = useState({});

  function getAccom(cityId) {
    return state?.accom?.[cityId] || { chosen: -1, opts: [empty(), empty(), empty()] };
  }
  function updateOpt(cityId, i, field, value) {
    setState(s => {
      const ac = s.accom?.[cityId] || { chosen: -1, opts: [empty(), empty(), empty()] };
      const opts = ac.opts.map((o, idx) => idx === i ? { ...o, [field]: value } : o);
      return { ...s, accom: { ...s.accom, [cityId]: { ...ac, opts } } };
    });
  }
  function choose(cityId, i) {
    setState(s => {
      const ac = s.accom?.[cityId] || { chosen: -1, opts: [empty(), empty(), empty()] };
      return { ...s, accom: { ...s.accom, [cityId]: { ...ac, chosen: i } } };
    });
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Alojamientos</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Hasta 3 opciones por ciudad. La elegida se usa en el presupuesto.</p>
      {CITIES.map(city => {
        const ac = getAccom(city.id);
        const days = cityDays(state, city.id);
        const curTab = tabs[city.id] ?? 0;
        const chosen = ac.chosen;
        const chosenPrice = parseFloat(ac.opts[chosen]?.price) || 0;

        return (
          <div key={city.id} className="rounded-2xl p-4 mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--sh)' }}>
            <div className="flex justify-between items-center mb-3 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="font-semibold text-sm flex items-center gap-2">
                {city.flag} {city.name}
                <span className="tag tag-ink">{days} noches</span>
              </div>
              {chosen >= 0 && chosenPrice > 0 && (
                <span className="tag tag-green">
                  Opción {'ABC'[chosen]} — {f$(chosenPrice)}/noche
                </span>
              )}
            </div>
            <div className="flex gap-2 mb-4">
              {['A','B','C'].map((t,i) => (
                <button key={i} onClick={() => setTabs(prev => ({ ...prev, [city.id]: i }))}
                  className="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: curTab===i ? (chosen===i ? 'var(--grn)' : 'var(--blue)') : 'transparent',
                    color: curTab===i ? '#fff' : 'var(--muted)',
                    border: `1.5px solid ${curTab===i ? (chosen===i ? 'var(--grn)' : 'var(--blue)') : 'var(--border)'}`,
                  }}>
                  {t}{chosen===i?' ✓':''}
                </button>
              ))}
            </div>
            {[0,1,2].map(i => {
              if (i !== curTab) return null;
              const o = ac.opts[i] || empty();
              const price = parseFloat(o.price) || 0;
              const isChosen = chosen === i;
              return (
                <div key={i}>
                  <div className="grid sm:grid-cols-2 gap-3 mb-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--muted)' }}>Nombre</label>
                      <input type="text" placeholder="Ej: Airbnb centro, Hotel NH..." value={o.name} onChange={e => updateOpt(city.id, i, 'name', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg text-sm outline-none" style={{ border: '1.5px solid var(--border)', background: 'var(--surface2)', color: 'var(--txt)' }} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--muted)' }}>Tipo</label>
                      <select value={o.type} onChange={e => updateOpt(city.id, i, 'type', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg text-sm outline-none" style={{ border: '1.5px solid var(--border)', background: 'var(--surface2)', color: 'var(--txt)' }}>
                        {TIPOS.map(t => <option key={t} value={t}>{t || '—'}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--muted)' }}>Precio/noche (USD)</label>
                      <input type="number" placeholder="0" min="0" value={o.price} onChange={e => updateOpt(city.id, i, 'price', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg text-sm font-mono-dm outline-none" style={{ border: '1.5px solid var(--border)', background: 'var(--surface2)', color: 'var(--txt)' }} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--muted)' }}>Barrio / zona</label>
                      <input type="text" placeholder="Ej: Malasaña, Trastevere..." value={o.zona} onChange={e => updateOpt(city.id, i, 'zona', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg text-sm outline-none" style={{ border: '1.5px solid var(--border)', background: 'var(--surface2)', color: 'var(--txt)' }} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--muted)' }}>Link</label>
                      <input type="url" placeholder="https://..." value={o.link} onChange={e => updateOpt(city.id, i, 'link', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg text-sm outline-none" style={{ border: '1.5px solid var(--border)', background: 'var(--surface2)', color: 'var(--txt)' }} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--muted)' }}>Teléfono</label>
                      <input type="tel" placeholder="+34 600 000 000" value={o.tel || ''} onChange={e => updateOpt(city.id, i, 'tel', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg text-sm font-mono-dm outline-none" style={{ border: '1.5px solid var(--border)', background: 'var(--surface2)', color: 'var(--txt)' }} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--muted)' }}>Dirección</label>
                      <input type="text" placeholder="Calle y número" value={o.dir || ''} onChange={e => updateOpt(city.id, i, 'dir', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg text-sm outline-none" style={{ border: '1.5px solid var(--border)', background: 'var(--surface2)', color: 'var(--txt)' }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <button onClick={() => choose(city.id, i)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                      style={{ background: isChosen ? 'var(--grn)' : 'transparent', color: isChosen ? '#fff' : 'var(--muted)', border: `1.5px solid ${isChosen ? 'var(--grn)' : 'var(--border)'}` }}>
                      {isChosen ? '✓ Opción elegida' : 'Elegir esta opción'}
                    </button>
                    {price > 0 && <span className="font-mono-dm text-sm" style={{ color: 'var(--txt)' }}>{f$(price * days)} total ({days}n × ${price})</span>}
                    {o.link && <a href={o.link} target="_blank" rel="noreferrer" className="text-xs" style={{ color: 'var(--blue)' }}>Abrir link ↗</a>}
                    {o.tel && (
                      <>
                        <a href={`tel:${o.tel.replace(/\s/g, '')}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ background: 'var(--grn-bg)', color: 'var(--grn)', textDecoration: 'none' }}>📞 Llamar</a>
                        <a href={`https://wa.me/${o.tel.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ background: '#DCF8C6', color: '#075E54', textDecoration: 'none' }}>💬 WhatsApp</a>
                      </>
                    )}
                    {o.dir && (
                      <a href={`https://maps.google.com/?q=${encodeURIComponent(o.dir + ', ' + city.name)}`} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: 'var(--surface2)', color: 'var(--txt2)', textDecoration: 'none', border: '1px solid var(--border2)' }}>📍 Mapa</a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
