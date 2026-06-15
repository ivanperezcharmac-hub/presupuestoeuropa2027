import { useApp } from '../context/AppContext';
export default function Estilo() {
  const { darkMode, toggleDark } = useApp();
  const navyOpts = ['#0f1e35','#1a3a2a','#2d1b4e','#3d1a1a','#2a2a2a','#1a3050'];
  const goldOpts = ['#c9a84c','#e05c2a','#2d9e6b','#4a7ec7','#c44d6e'];
  const creamOpts = ['#f5f0e8','#f0f4f8','#f5f5f5','#fff8f0','#f0f5f0'];

  function setVar(name, value) { document.documentElement.style.setProperty(name, value); }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Personalizar</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Cambiá colores y tema. Los cambios aplican al instante.</p>
      <div className="rounded-2xl p-5 mb-4" style={{ background: '#fff', border: '1px solid var(--border)', boxShadow: 'var(--sh)' }}>
        <div className="font-semibold text-sm mb-4">🎨 Colores</div>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            { label: 'Sidebar', opts: navyOpts, cssVar: '--navy' },
            { label: 'Acento', opts: goldOpts, cssVar: '--gold' },
            { label: 'Fondo', opts: creamOpts, cssVar: '--cream' },
          ].map(({ label, opts, cssVar }) => (
            <div key={label}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>{label}</div>
              <div className="flex gap-2 flex-wrap">
                {opts.map(c => (
                  <button key={c} onClick={() => setVar(cssVar, c)} className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                    style={{ background: c, border: '2px solid transparent', outline: '2px solid transparent' }} />
                ))}
                <input type="color" onChange={e => setVar(cssVar, e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer p-0.5" style={{ border: '1.5px solid var(--border)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid var(--border)' }}>
        <div className="font-semibold text-sm mb-3">🌙 Tema</div>
        <button onClick={toggleDark}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: darkMode ? 'var(--gold)' : 'var(--navy)', color: darkMode ? 'var(--navy)' : '#fff' }}>
          {darkMode ? '☀️ Modo claro' : '🌙 Modo oscuro'}
        </button>
      </div>
    </div>
  );
}
