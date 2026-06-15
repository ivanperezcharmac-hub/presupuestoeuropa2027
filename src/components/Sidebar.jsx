import { useApp } from '../context/AppContext';

const NAV = [
  { id: 'resumen',      ic: '◈',  label: 'Resumen' },
  { id: 'vuelos',       ic: '✈',  label: 'Vuelos' },
  { id: 'ciudades',     ic: '🏛', label: 'Ciudades' },
  { id: 'alojamientos', ic: '🛏', label: 'Alojamientos' },
  { id: 'actividades',  ic: '🗺', label: 'Excursiones & Plan' },
  { id: 'compras',      ic: '🛍', label: 'Compras' },
  { id: 'alertas',      ic: '🔔', label: 'Alertas EUR/USD' },
  { id: 'checklist',    ic: '✅', label: 'Checklist' },
  { id: 'costos',       ic: '💶', label: 'Costos por ciudad' },
  { id: 'estilo',       ic: '🎨', label: 'Personalizar' },
];

export default function Sidebar({ current, onNav, total, syncStatus, onClose }) {
  const { darkMode } = useApp();

  const dotColor = syncStatus === 'ok' ? '#2d7a4f' : syncStatus === 'saving' ? '#c9a84c' : '#c0392b';

  return (
    <>
      {/* Overlay mobile */}
      <div className="fixed inset-0 z-[99] bg-black/40 backdrop-blur-sm lg:hidden" onClick={onClose} />

      <nav className="fixed top-0 left-0 bottom-0 w-56 z-[100] flex flex-col overflow-y-auto"
        style={{ background: darkMode ? '#0d1117' : 'var(--navy)' }}>

        {/* Brand */}
        <div className="px-4 py-5 border-b border-white/10">
          <button onClick={onClose} className="lg:hidden absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10">✕</button>
          <h2 className="font-display text-sm leading-snug" style={{ color: 'var(--goldl)' }}>✈ Europa<br />2027</h2>
          <p className="text-xs mt-1 font-mono-dm tracking-wider" style={{ color: 'rgba(255,255,255,.25)' }}>
            17 MAR → 11 ABR · 5 CIUDADES
          </p>
        </div>

        {/* Nav */}
        <div className="flex-1 px-2 py-3">
          <div className="text-xs font-semibold tracking-widest uppercase px-2 py-2" style={{ color: 'rgba(255,255,255,.25)' }}>Presupuesto</div>
          {NAV.slice(0, 6).map(n => (
            <NavItem key={n.id} item={n} active={current === n.id} onClick={() => { onNav(n.id); onClose(); }} />
          ))}
          <div className="text-xs font-semibold tracking-widest uppercase px-2 pt-4 pb-2" style={{ color: 'rgba(255,255,255,.25)' }}>Herramientas</div>
          {NAV.slice(6).map(n => (
            <NavItem key={n.id} item={n} active={current === n.id} onClick={() => { onNav(n.id); onClose(); }} />
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,.3)' }}>Total estimado</div>
          <div className="font-display text-2xl mt-1" style={{ color: 'var(--goldl)' }}>{total}</div>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-1.5 h-1.5 rounded-full transition-colors" style={{ background: dotColor }} />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,.3)' }}>
              {syncStatus === 'ok' ? 'Sincronizado ✓' : syncStatus === 'saving' ? 'Guardando…' : 'Error al guardar'}
            </span>
          </div>
        </div>
      </nav>
    </>
  );
}

function NavItem({ item, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium transition-all mb-0.5"
      style={{
        background: active ? 'rgba(201,168,76,.2)' : 'transparent',
        color: active ? 'var(--goldl)' : 'rgba(255,255,255,.55)',
      }}>
      <span className="w-4 text-center">{item.ic}</span>
      {item.label}
    </button>
  );
}
