import { useApp } from '../context/AppContext';
import { CHECKLIST_GROUPS } from '../data/constants';

export default function Checklist() {
  const { state, setState } = useApp();
  function toggle(gi, ii) {
    setState(s => ({ ...s, checklist: { ...s.checklist, [`${gi}_${ii}`]: !s.checklist?.[`${gi}_${ii}`] } }));
  }
  const allDone = CHECKLIST_GROUPS.reduce((s,g,gi)=>s+g.items.filter((_,ii)=>state?.checklist?.[`${gi}_${ii}`]).length,0);
  const allTotal = CHECKLIST_GROUPS.reduce((s,g)=>s+g.items.length,0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Checklist pre-viaje</h1>
      <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>Todo lo que tienen que tener listo antes de salir.</p>
      <div className="rounded-2xl p-4 mb-6 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>Progreso total</div>
        <div className="font-display text-4xl mb-1" style={{ color: allDone === allTotal ? 'var(--grn)' : 'var(--txt)' }}>{allDone}/{allTotal}</div>
        <div className="text-sm" style={{ color: 'var(--muted)' }}>{allDone === allTotal ? '✅ ¡Todo listo para el viaje!' : 'Tareas completadas'}</div>
        <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${allTotal > 0 ? allDone/allTotal*100 : 0}%`, background: 'var(--grn)' }} />
        </div>
      </div>
      {CHECKLIST_GROUPS.map((group, gi) => {
        const done = group.items.filter((_,ii)=>state?.checklist?.[`${gi}_${ii}`]).length;
        const pct = Math.round(done/group.items.length*100);
        return (
          <div key={gi} className="rounded-2xl p-4 mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--sh)' }}>
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold text-sm">{group.cat}</div>
              <span className="tag" style={{
                background: pct===100 ? 'var(--grn-bg)' : pct>50 ? 'var(--amber-bg)' : 'var(--surface2)',
                color: pct===100 ? 'var(--grn)' : pct>50 ? 'var(--amber)' : 'var(--txt2)',
              }}>
                {done}/{group.items.length}
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct===100?'var(--grn)':'var(--gold)' }} />
            </div>
            {group.items.map((item, ii) => {
              const checked = !!state?.checklist?.[`${gi}_${ii}`];
              return (
                <div key={ii} onClick={()=>toggle(gi,ii)}
                  className="flex items-center gap-3 py-2 border-b last:border-0 cursor-pointer rounded-lg px-1 transition-colors"
                  style={{ borderColor: 'var(--border)' }}>
                  <div className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all"
                    style={{ border: `2px solid ${checked?'var(--grn)':'var(--border)'}`, background: checked?'var(--grn)':'transparent' }}>
                    {checked && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
                  </div>
                  <span className="text-sm" style={{ textDecoration: checked?'line-through':'none', color: checked?'var(--muted)':'var(--txt)' }}>{item}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
