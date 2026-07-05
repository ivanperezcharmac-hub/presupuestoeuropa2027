import { COSTS_DATA } from '../data/constants';
export default function Costos() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Costos de referencia</h1>
      <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>Datos 2025-2026 por ciudad sin alojamiento. Todo en USD.</p>
      <div className="text-xs p-3 rounded-xl mb-6" style={{ background: 'var(--cream)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
        💡 Usá estos rangos para completar los gastos diarios en Ciudades. Temporada media: marzo–abril es 20–30% más barato que verano.
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {COSTS_DATA.map(d => (
          <div key={d.city} className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--sh)' }}>
            <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-xl">{d.flag}</span>
              <div>
                <div className="font-display text-base">{d.city}</div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>{d.country}</div>
              </div>
            </div>
            <div className="p-4">
              {d.rows.map(r => (
                <div key={r.l} className="flex justify-between items-baseline py-1.5 border-b last:border-0 text-sm" style={{ borderColor: 'var(--border)' }}>
                  <span style={{ color: r.hi ? 'var(--txt)' : 'var(--muted)', fontWeight: r.hi ? 600 : 400 }}>{r.l}</span>
                  <span className="font-mono-dm text-xs font-medium" style={{ color: r.hi ? 'var(--navy)' : 'var(--txt)', fontWeight: r.hi ? 700 : 500 }}>{r.v}</span>
                </div>
              ))}
              <div className="mt-3 p-2.5 rounded-xl text-xs" style={{ background: 'var(--cream)', color: 'var(--muted)', lineHeight: 1.55 }}>
                💡 {d.tip}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
