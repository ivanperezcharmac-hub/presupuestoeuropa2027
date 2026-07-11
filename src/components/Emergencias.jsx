// Números de emergencia y embajadas argentinas por país del viaje
const PAISES = [
  {
    flag: '🇪🇸', pais: 'España', ciudades: 'Barcelona · Madrid',
    emergencia: '112',
    policia: '091',
    embajada: {
      nombre: 'Embajada Argentina en Madrid',
      dir: 'C/ Serrano 90, 28006 Madrid',
      tel: '+34 91 771 0500',
    },
    consulado: {
      nombre: 'Consulado en Barcelona',
      dir: 'Passeig de Gràcia 11, 08007 Barcelona',
      tel: '+34 93 304 1200',
    },
  },
  {
    flag: '🇮🇹', pais: 'Italia', ciudades: 'Roma',
    emergencia: '112',
    policia: '113',
    embajada: {
      nombre: 'Embajada Argentina en Roma',
      dir: 'Piazza dell\'Esquilino 2, 00185 Roma',
      tel: '+39 06 4873 545',
    },
  },
  {
    flag: '🇫🇷', pais: 'Francia', ciudades: 'París',
    emergencia: '112',
    policia: '17',
    embajada: {
      nombre: 'Embajada Argentina en París',
      dir: '6 Rue Cimarosa, 75116 París',
      tel: '+33 1 4405 2700',
    },
  },
  {
    flag: '🇬🇧', pais: 'Reino Unido', ciudades: 'Londres',
    emergencia: '999',
    policia: '101',
    embajada: {
      nombre: 'Embajada Argentina en Londres',
      dir: '65 Brook St, London W1K 4AH',
      tel: '+44 20 7318 1300',
    },
  },
];

function TelBtn({ tel, label }) {
  return (
    <a href={`tel:${tel.replace(/\s/g, '')}`}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
      style={{ background: 'var(--grn-bg)', color: 'var(--grn)', textDecoration: 'none' }}>
      📞 {label || tel}
    </a>
  );
}

export default function Emergencias() {
  return (
    <div className="fade-in">
      <h1 className="font-display text-2xl font-bold mb-1">Emergencias</h1>
      <p className="text-sm mb-4" style={{ color: 'var(--txt2)' }}>Números útiles y embajadas argentinas en cada país.</p>
      <div className="tip-box">
        💡 <strong>112</strong> funciona en toda Europa (y <strong>999</strong> en UK). Guardá también el teléfono de tu seguro de viaje cuando lo contrates.
      </div>

      {PAISES.map(p => (
        <div key={p.pais} className="card p-4 mb-4">
          <div className="flex items-center gap-3 mb-3 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 24 }}>{p.flag}</span>
            <div>
              <div className="font-semibold text-sm">{p.pais}</div>
              <div className="text-xs" style={{ color: 'var(--txt3)' }}>{p.ciudades}</div>
            </div>
          </div>

          {/* Emergencias */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <TelBtn tel={p.emergencia} label={`Emergencias ${p.emergencia}`} />
            <TelBtn tel={p.policia} label={`Policía ${p.policia}`} />
          </div>

          {/* Embajada */}
          <div className="rounded-lg p-3 mb-2" style={{ background: 'var(--surface2)' }}>
            <div className="text-xs font-semibold mb-1">{p.embajada.nombre}</div>
            <div className="text-xs mb-2" style={{ color: 'var(--txt2)' }}>{p.embajada.dir}</div>
            <TelBtn tel={p.embajada.tel} />
          </div>

          {p.consulado && (
            <div className="rounded-lg p-3" style={{ background: 'var(--surface2)' }}>
              <div className="text-xs font-semibold mb-1">{p.consulado.nombre}</div>
              <div className="text-xs mb-2" style={{ color: 'var(--txt2)' }}>{p.consulado.dir}</div>
              <TelBtn tel={p.consulado.tel} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
