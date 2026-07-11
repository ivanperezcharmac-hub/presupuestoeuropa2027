import { useState } from 'react';

// Conversión de talles US / EU / UK
const TABLES = {
  mujer_ropa: {
    label: '👗 Ropa mujer',
    cols: ['US', 'EU', 'UK'],
    rows: [
      ['0', '32', '4'], ['2', '34', '6'], ['4', '36', '8'], ['6', '38', '10'],
      ['8', '40', '12'], ['10', '42', '14'], ['12', '44', '16'], ['14', '46', '18'],
    ],
  },
  mujer_calzado: {
    label: '👠 Calzado mujer',
    cols: ['US', 'EU', 'UK'],
    rows: [
      ['5', '35-36', '3'], ['6', '36-37', '4'], ['7', '37-38', '5'], ['8', '38-39', '6'],
      ['9', '39-40', '7'], ['10', '40-41', '8'], ['11', '41-42', '9'],
    ],
  },
  hombre_ropa: {
    label: '👔 Ropa hombre',
    cols: ['US', 'EU', 'UK'],
    rows: [
      ['XS / 34', '44', '34'], ['S / 36', '46', '36'], ['M / 38-40', '48-50', '38-40'],
      ['L / 42-44', '52-54', '42-44'], ['XL / 46', '56', '46'], ['XXL / 48', '58', '48'],
    ],
  },
  hombre_calzado: {
    label: '👞 Calzado hombre',
    cols: ['US', 'EU', 'UK'],
    rows: [
      ['7', '40', '6'], ['8', '41', '7'], ['9', '42', '8'], ['10', '43', '9'],
      ['11', '44', '10'], ['12', '45', '11'], ['13', '46', '12'],
    ],
  },
};

export default function Talles() {
  const [tab, setTab] = useState('mujer_ropa');
  const t = TABLES[tab];

  return (
    <div className="fade-in">
      <h1 className="font-display text-2xl font-bold mb-1">Conversor de talles</h1>
      <p className="text-sm mb-4" style={{ color: 'var(--txt2)' }}>US · EU · UK — para las compras del viaje.</p>
      <div className="tip-box">
        💡 En Europa se usa la columna <strong>EU</strong> (España, Italia, Francia) y en Londres la <strong>UK</strong>. Ante la duda, probate todo — los talles varían entre marcas.
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {Object.entries(TABLES).map(([key, table]) => (
          <button key={key} onClick={() => setTab(key)}
            className="px-3 py-2 rounded-full text-xs font-medium cursor-pointer"
            style={{
              background: tab === key ? 'var(--navy)' : 'transparent',
              color: tab === key ? '#fff' : 'var(--txt2)',
              border: `1.5px solid ${tab === key ? 'var(--navy)' : 'var(--border2)'}`,
            }}>
            {table.label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <div className="grid grid-cols-3 px-4 py-3 font-mono-dm text-xs font-bold uppercase"
          style={{ background: 'var(--navy)', color: 'var(--goldl)', letterSpacing: '0.08em' }}>
          {t.cols.map(c => <div key={c} className="text-center">{c}</div>)}
        </div>
        {t.rows.map((row, i) => (
          <div key={i} className="grid grid-cols-3 px-4 py-3 text-sm font-mono-dm"
            style={{ borderBottom: '1px solid var(--border)', background: i % 2 ? 'var(--surface2)' : 'var(--surface)' }}>
            {row.map((cell, j) => (
              <div key={j} className="text-center" style={{ color: j === 0 ? 'var(--txt)' : 'var(--txt2)', fontWeight: j === 0 ? 600 : 400 }}>
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
