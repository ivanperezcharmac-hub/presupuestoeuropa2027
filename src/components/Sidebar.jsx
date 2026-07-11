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
  { id: 'talles',       ic: '👕', label: 'Conversor de talles' },
  { id: 'emergencias',  ic: '🆘', label: 'Emergencias' },
  { id: 'estilo',       ic: '🎨', label: 'Personalizar' },
];

const TRIP_START = '2027-03-17';

function daysUntilTrip() {
  const start = new Date(TRIP_START + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((start - today) / 86400000);
}

export default function Sidebar({ current, onNav, total, syncStatus, onClose }) {
  const { darkMode } = useApp();
  const navBg = darkMode ? '#0a0f1a' : '#0b1f3a';
  const dotColor = syncStatus === 'ok' ? '#4ade80'
    : syncStatus === 'saving' ? '#fbbf24'
    : syncStatus === 'offline' ? '#9ca3af'
    : '#f87171';
  const dotLabel = syncStatus === 'ok' ? 'Sincronizado'
    : syncStatus === 'saving' ? 'Guardando…'
    : syncStatus === 'offline' ? 'Sin conexión (guardado local)'
    : 'Error';
  const daysLeft = daysUntilTrip();
  const countdownLabel = daysLeft > 0 ? `⏳ Faltan ${daysLeft} días`
    : daysLeft === 0 ? '✈ ¡Hoy es el día!'
    : '✈ ¡Buen viaje!';

  return (
    <>
      <div className="fixed inset-0 z-[99] lg:hidden"
        style={{ background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(4px)' }}
        onClick={onClose} />

      <nav className="fixed top-0 left-0 bottom-0 w-56 z-[100] flex flex-col overflow-y-auto"
        style={{ background: `linear-gradient(180deg, ${navBg} 0%, #050e1a 100%)`, paddingTop: 'env(safe-area-inset-top, 0px)' }}>

        {/* ── Brand ── */}
        <div className="px-4 pt-5 pb-5 relative" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={onClose}
            className="lg:hidden absolute top-3 right-3 flex items-center justify-center rounded-full transition-colors"
            style={{ width: 26, height: 26, color: 'rgba(255,255,255,.4)', background: 'rgba(255,255,255,.08)', border: 'none', cursor: 'pointer', fontSize: 11 }}>
            ✕
          </button>

          {/* Avión flotante decorativo */}
          <div style={{ position: 'absolute', top: 14, right: 40, animation: 'float-y 3s ease-in-out infinite', opacity: 0.35, pointerEvents: 'none' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--goldl)">
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
          </div>

          <div className="font-display leading-tight mb-0.5" style={{ fontSize: 20, color: 'var(--goldl)' }}>
            Europa 2027
          </div>
          <div className="font-mono-dm" style={{ fontSize: 11, color: 'rgba(255,255,255,.85)', letterSpacing: '0.06em' }}>
            Agus &amp; Ivan · 26 días
          </div>
          <div className="font-mono-dm mt-1" style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', letterSpacing: '0.04em' }}>
            {countdownLabel}
          </div>
        </div>

        {/* ── Nav ── */}
        <div className="flex-1 px-2 py-3">
          <div className="font-mono-dm text-xs font-semibold uppercase px-2 py-2"
            style={{ color: 'rgba(255,255,255,.2)', letterSpacing: '0.12em' }}>
            Presupuesto
          </div>
          {NAV.slice(0, 6).map(n => (
            <NavItem key={n.id} item={n} active={current === n.id} onClick={() => { onNav(n.id); onClose(); }} />
          ))}
          <div className="font-mono-dm text-xs font-semibold uppercase px-2 pt-4 pb-2"
            style={{ color: 'rgba(255,255,255,.2)', letterSpacing: '0.12em' }}>
            Herramientas
          </div>
          {NAV.slice(6).map(n => (
            <NavItem key={n.id} item={n} active={current === n.id} onClick={() => { onNav(n.id); onClose(); }} />
          ))}
        </div>

        {/* ── Footer ── */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="font-mono-dm uppercase mb-1"
            style={{ fontSize: 10, color: 'rgba(255,255,255,.22)', letterSpacing: '0.12em' }}>
            Total estimado
          </div>
          <div className="font-display mb-2.5" style={{ fontSize: 22, color: 'var(--goldl)' }}>{total}</div>
          <div className="flex items-center gap-1.5">
            <div className="rounded-full flex-shrink-0"
              style={{ width: 6, height: 6, background: dotColor, boxShadow: `0 0 6px ${dotColor}55` }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.28)' }}>{dotLabel}</span>
          </div>
        </div>
      </nav>
    </>
  );
}

function NavItem({ item, active, onClick }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2.5 w-full text-left rounded-lg transition-all mb-px"
      style={{
        padding: '8px 10px 8px 10px',
        background: active ? 'rgba(201,147,58,0.13)' : 'transparent',
        color: active ? 'var(--goldl)' : 'rgba(255,255,255,.5)',
        border: 'none',
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: active ? 500 : 400,
        borderLeft: active ? '2px solid rgba(201,147,58,0.65)' : '2px solid transparent',
      }}>
      <span style={{ width: 16, textAlign: 'center', flexShrink: 0, fontSize: 13 }}>{item.ic}</span>
      {item.label}
    </button>
  );
}
