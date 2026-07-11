import { useApp, f$ } from '../context/AppContext';
import { COMPRAS_CATS } from '../data/constants';

function CompraItem({ catId, persona, idx, item, rate }) {
  const { setState } = useApp();
  function update(field, value) {
    setState(s => {
      const key = `${catId}_${persona}`;
      const items = [...(s.compras?.[key] || [])];
      items[idx] = { ...items[idx], [field]: value };
      return { ...s, compras: { ...s.compras, [key]: items } };
    });
  }
  function remove() {
    setState(s => {
      const key = `${catId}_${persona}`;
      const items = (s.compras?.[key] || []).filter((_, i) => i !== idx);
      return { ...s, compras: { ...s.compras, [key]: items } };
    });
  }
  const costUsd = (parseFloat(item.cost) || 0) * rate;
  return (
    <div className="py-2 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
      <input type="text" placeholder="Artículo..." value={item.name || ''} onChange={e => update('name', e.target.value)}
        className="w-full px-2 py-1 rounded-lg text-sm mb-1.5 outline-none" style={{ border: '1.5px solid var(--border)', background: 'var(--surface2)', color: 'var(--txt)' }} />
      <div className="flex gap-2 items-center">
        <div className="relative flex-1 min-w-0">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono-dm" style={{ color: 'var(--muted)' }}>€</span>
          <input type="number" placeholder="0" min="0" value={item.cost || ''} onChange={e => update('cost', e.target.value)}
            className="w-full pl-5 pr-2 py-1.5 rounded-lg text-sm font-mono-dm outline-none" style={{ border: '1.5px solid var(--border)', background: 'var(--surface2)', color: 'var(--txt)' }} />
        </div>
        <input type="text" placeholder="Ciudad..." value={item.nota || ''} onChange={e => update('nota', e.target.value)}
          className="flex-1 min-w-0 px-2 py-1.5 rounded-lg text-sm outline-none" style={{ border: '1.5px solid var(--border)', background: 'var(--surface2)', color: 'var(--txt)' }} />
        <button onClick={remove} className="flex-shrink-0 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: 'var(--lite)', width: 36, height: 36, minWidth: 36, minHeight: 36, background: 'var(--surface2)', border: 'none' }}>✕</button>
      </div>
      {costUsd > 0 && <div className="text-xs mt-1 font-mono-dm" style={{ color: 'var(--muted)' }}>≈ {f$(costUsd)} USD</div>}
    </div>
  );
}

function PersonaCol({ cat, persona, label, rate }) {
  const { state, setState } = useApp();
  const key = `${cat.id}_${persona}`;
  const items = state?.compras?.[key] || [];
  const totalEur = items.reduce((s, it) => s + (parseFloat(it.cost) || 0), 0);

  function addRow() {
    setState(s => {
      const cur = s.compras?.[key] || [];
      return { ...s, compras: { ...s.compras, [key]: [...cur, { name: '', cost: '', nota: '' }] } };
    });
  }

  return (
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center mb-3 pb-2" style={{ borderBottom: '2px solid var(--border)' }}>
        <span className="font-semibold text-sm">{label}</span>
        <div className="text-right">
          <div className="font-mono-dm text-xs" style={{ color: 'var(--muted)' }}>€{Math.round(totalEur)}</div>
          <div className="font-mono-dm text-sm font-semibold" style={{ color: 'var(--txt)' }}>{f$(totalEur * rate)}</div>
        </div>
      </div>
      {items.map((it, i) => <CompraItem key={i} catId={cat.id} persona={persona} idx={i} item={it} rate={rate} />)}
      <button onClick={addRow} className="w-full mt-2 py-1.5 rounded-lg text-xs font-medium transition-all hover:brightness-95"
        style={{ border: '1px solid var(--border)', color: 'var(--muted)', background: 'var(--surface2)' }}>
        + Agregar
      </button>
    </div>
  );
}

export default function Compras() {
  const { state, eurUsd } = useApp();
  const totalEur = COMPRAS_CATS.reduce((s, cat) =>
    s + ['agus', 'ivan'].reduce((sp, p) =>
      sp + (state?.compras?.[`${cat.id}_${p}`] || []).reduce((ss, it) => ss + (parseFloat(it.cost) || 0), 0), 0), 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Compras del viaje</h1>
      <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>Precios en EUR — se convierten a USD automáticamente según el tipo de cambio del día.</p>
      <div className="text-xs p-3 rounded-xl mb-6" style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
        💡 Ingresá en EUR. La conversión a USD usa el tipo de cambio del topbar.
      </div>
      {COMPRAS_CATS.map(cat => (
        <div key={cat.id} className="rounded-2xl p-4 mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--sh)' }}>
          <div className="flex justify-between items-center mb-3 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="font-semibold text-sm">{cat.ic} {cat.label}</div>
            <div className="text-right">
              <div className="font-mono-dm text-xs" style={{ color: 'var(--muted)' }}>
                €{Math.round(['agus','ivan'].reduce((s,p)=>(state?.compras?.[`${cat.id}_${p}`]||[]).reduce((ss,it)=>ss+(parseFloat(it.cost)||0),s),0))}
              </div>
              <div className="font-mono-dm text-base font-semibold" style={{ color: 'var(--txt)' }}>
                {f$(['agus','ivan'].reduce((s,p)=>(state?.compras?.[`${cat.id}_${p}`]||[]).reduce((ss,it)=>ss+(parseFloat(it.cost)||0),s),0)*eurUsd)}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <PersonaCol cat={cat} persona="agus" label="👩 Agus" rate={eurUsd} />
            <div className="hidden sm:block w-px" style={{ background: 'var(--border)' }} />
            <div className="sm:hidden h-px" style={{ background: 'var(--border)' }} />
            <PersonaCol cat={cat} persona="ivan" label="👨 Ivan" rate={eurUsd} />
          </div>
        </div>
      ))}
      <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-sm">💰 Total compras</span>
          <div className="text-right">
            <div className="font-mono-dm text-xs" style={{ color: 'var(--muted)' }}>€{Math.round(totalEur)}</div>
            <div className="font-mono-dm text-lg font-semibold" style={{ color: 'var(--txt)' }}>{f$(totalEur * eurUsd)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
