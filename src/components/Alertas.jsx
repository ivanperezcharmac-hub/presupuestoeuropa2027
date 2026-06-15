import { useApp, f$ } from '../context/AppContext';
import { COMPRAS_CATS } from '../data/constants';

export default function Alertas() {
  const { state, setState, eurUsd } = useApp();
  const alertas = state?.alertas || {};

  function update(field, value) {
    setState(s => ({ ...s, alertas: { ...s.alertas, [field]: value } }));
  }

  const min = parseFloat(alertas.min);
  const max = parseFloat(alertas.max);
  let alertMsg = '', alertColor = '';
  if (min && eurUsd < min) { alertMsg = `✅ EUR/USD en ${eurUsd.toFixed(4)} — ¡Por debajo del mínimo! Buen momento para comprar euros.`; alertColor = 'var(--grn-bg,#e8f5ee)'; }
  else if (max && eurUsd > max) { alertMsg = `⚠️ EUR/USD en ${eurUsd.toFixed(4)} — Por encima del máximo. El euro está caro.`; alertColor = 'var(--red-bg,#fdecea)'; }
  else if (min || max) { alertMsg = `📊 EUR/USD en ${eurUsd.toFixed(4)} — Dentro del rango configurado.`; alertColor = 'var(--blu-bg,#e8f0fe)'; }

  const comprasEur = COMPRAS_CATS.reduce((s,cat)=>s+['agus','ivan'].reduce((sp,p)=>sp+(state?.compras?.[`${cat.id}_${p}`]||[]).reduce((ss,it)=>ss+(parseFloat(it.cost)||0),0),0),0);
  const scenarios = [
    { l: 'Si EUR sube a 1.20', r: 1.20 },
    { l: 'Si EUR sube a 1.15', r: 1.15 },
    { l: 'Hoy', r: eurUsd },
    { l: 'Si EUR baja a 1.05', r: 1.05 },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Alertas EUR/USD</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Seguimiento del tipo de cambio en tiempo real.</p>
      <div className="rounded-2xl p-4 mb-4" style={{ background: '#fff', border: '1px solid var(--border)', boxShadow: 'var(--sh)' }}>
        <div className="font-semibold text-sm mb-4">📈 Tipo de cambio actual</div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'ACTUAL (hoy)', value: eurUsd.toFixed(4), readOnly: true },
            { label: 'MÍNIMO alerta', value: alertas.min || '', field: 'min', placeholder: 'ej: 1.05' },
            { label: 'MÁXIMO alerta', value: alertas.max || '', field: 'max', placeholder: 'ej: 1.20' },
          ].map(item => (
            <div key={item.label} className="rounded-xl p-3 text-center" style={{ background: 'var(--cream)' }}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>{item.label}</div>
              <input type={item.readOnly ? 'text' : 'number'} readOnly={item.readOnly} step="0.01" min="0.5" max="3"
                placeholder={item.placeholder} value={item.value}
                onChange={item.field ? e => update(item.field, e.target.value) : undefined}
                className="w-full text-center font-display text-2xl outline-none bg-transparent"
                style={{ color: item.field === 'min' ? 'var(--grn,#2d7a4f)' : item.field === 'max' ? 'var(--red,#c0392b)' : 'var(--navy)', border: 'none' }} />
            </div>
          ))}
        </div>
        {alertMsg && (
          <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ background: alertColor }}>{alertMsg}</div>
        )}
      </div>
      <div className="rounded-2xl p-4" style={{ background: '#fff', border: '1px solid var(--border)' }}>
        <div className="font-semibold text-sm mb-2">📊 Impacto en compras</div>
        <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>Cuánto cambia el total de compras (€{Math.round(comprasEur)}) según el tipo de cambio.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {scenarios.map(sc => {
            const diff = sc.r - eurUsd;
            const impact = comprasEur * diff;
            const isNow = sc.r === eurUsd;
            return (
              <div key={sc.l} className="rounded-xl p-3 text-center" style={{ background: 'var(--cream)' }}>
                <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{sc.l}</div>
                <div className="font-mono-dm text-base font-semibold"
                  style={{ color: isNow ? 'var(--navy)' : diff > 0 ? 'var(--red,#c0392b)' : 'var(--grn,#2d7a4f)' }}>
                  {isNow ? f$(comprasEur * eurUsd) : (diff > 0 ? '+' : '') + f$(Math.abs(impact))}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  {isNow ? 'tasa actual' : diff > 0 ? 'más caro' : 'más barato'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
