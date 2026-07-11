// Permisos de viaje ETIAS / UK ETA — situación por pasaporte
const PERMISOS = [
  {
    id: 'etias',
    icon: '🇪🇺',
    nombre: 'ETIAS (Europa / Schengen)',
    cubre: 'España · Italia · Francia',
    quien: [
      { persona: '👩 Agus (pasaporte argentino)', necesita: true },
      { persona: '👨 Ivan (pasaporte húngaro)', necesita: false, nota: 'Ciudadano UE — entra como comunitario' },
    ],
    precio: '€20',
    validez: '3 años (o hasta vencer el pasaporte)',
    cuando: 'Sistema arranca fines de 2026 con período de transición. Para marzo 2027 conviene tramitarlo igual apenas abra. La fecha exacta se anuncia con ~6 meses de anticipación.',
    tiempo: 'Aprobación en minutos, puede demorar hasta 4 días (o más si piden documentación). Tramitar con 2+ semanas de margen.',
    link: 'https://travel-europe.europa.eu/es/etias',
    warning: 'SOLO usar el sitio oficial europa.eu — hay muchos sitios truchos que cobran de más.',
  },
  {
    id: 'uketa',
    icon: '🇬🇧',
    nombre: 'UK ETA (Reino Unido)',
    cubre: 'Londres',
    quien: [
      { persona: '👩 Agus (pasaporte argentino)', necesita: true },
      { persona: '👨 Ivan (pasaporte húngaro)', necesita: true, nota: 'Obligatorio también para pasaportes UE desde abr 2025' },
    ],
    precio: '£20 (~USD 25)',
    validez: '2 años (o hasta vencer el pasaporte), múltiples ingresos',
    cuando: 'Ya está vigente — se puede tramitar cuando quieran. Ideal: 1-2 meses antes del viaje.',
    tiempo: 'Mayoría aprueba en menos de 3 horas; recomiendan pedirla mínimo 3 días antes de viajar.',
    link: 'https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta',
    warning: 'Usar solo la app oficial "UK ETA" o gov.uk — otros sitios cobran comisiones enormes.',
  },
];

export default function Permisos() {
  return (
    <div className="fade-in">
      <h1 className="font-display text-2xl font-bold mb-1">Permisos de viaje</h1>
      <p className="text-sm mb-4" style={{ color: 'var(--txt2)' }}>ETIAS y UK ETA — qué necesita cada uno según su pasaporte.</p>
      <div className="tip-box">
        💡 Resumen: <strong>Agus necesita ambos</strong> (ETIAS + UK ETA). <strong>Ivan solo el UK ETA</strong> — con pasaporte húngaro entra a Schengen como ciudadano europeo. Ambos permisos quedan vinculados al pasaporte: si lo renuevan, hay que tramitarlos de nuevo.
      </div>

      {PERMISOS.map(p => (
        <div key={p.id} className="card p-4 mb-4">
          <div className="flex items-center gap-3 mb-3 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 24 }}>{p.icon}</span>
            <div>
              <div className="font-semibold text-sm">{p.nombre}</div>
              <div className="text-xs" style={{ color: 'var(--txt3)' }}>{p.cubre}</div>
            </div>
          </div>

          {/* Quién lo necesita */}
          <div className="mb-3">
            {p.quien.map(q => (
              <div key={q.persona} className="flex items-start gap-2 py-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className={`tag ${q.necesita ? 'tag-amber' : 'tag-green'}`} style={{ flexShrink: 0 }}>
                  {q.necesita ? 'Necesita' : 'No necesita'}
                </span>
                <div>
                  <div className="text-sm">{q.persona}</div>
                  {q.nota && <div className="text-xs mt-0.5" style={{ color: 'var(--txt3)' }}>{q.nota}</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Datos clave */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="rounded-lg p-2.5" style={{ background: 'var(--surface2)' }}>
              <div className="text-xs font-semibold uppercase mb-0.5" style={{ color: 'var(--txt3)', fontSize: 10 }}>Precio</div>
              <div className="font-mono-dm text-sm font-bold" style={{ color: 'var(--navy)' }}>{p.precio}</div>
            </div>
            <div className="rounded-lg p-2.5" style={{ background: 'var(--surface2)' }}>
              <div className="text-xs font-semibold uppercase mb-0.5" style={{ color: 'var(--txt3)', fontSize: 10 }}>Validez</div>
              <div className="text-xs font-medium">{p.validez}</div>
            </div>
          </div>

          <div className="text-xs mb-2" style={{ color: 'var(--txt2)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--txt)' }}>📅 Cuándo:</strong> {p.cuando}
          </div>
          <div className="text-xs mb-3" style={{ color: 'var(--txt2)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--txt)' }}>⏱ Demora:</strong> {p.tiempo}
          </div>

          <div className="rounded-lg p-2.5 mb-3 text-xs" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>
            ⚠️ {p.warning}
          </div>

          <a href={p.link} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--blue)', color: '#fff', textDecoration: 'none' }}>
            Tramitar en sitio oficial ↗
          </a>
        </div>
      ))}
    </div>
  );
}
