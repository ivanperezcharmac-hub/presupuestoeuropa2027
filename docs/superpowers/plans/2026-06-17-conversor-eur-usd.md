# Conversor rápido EUR↔USD — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar un FAB fijo en la esquina inferior derecha que abre un panel con dos inputs EUR/USD sincronizados en tiempo real, accesible desde cualquier sección de la app.

**Architecture:** Nuevo componente `CurrencyConverter.jsx` montado una sola vez en el shell de `App.jsx`. Consume `eurUsd` y `eurUsdUpdatedAt` de AppContext. Tres archivos tocados: AppContext (nuevo estado), App (import + mount), CurrencyConverter (nuevo).

**Tech Stack:** React 19, Tailwind CSS v4, CSS custom properties (`--blue`, `--navy`, `--gold`, `--border`, `--cream`, `--muted`), Vite.

---

## File Map

| Archivo | Acción | Qué hace |
|---|---|---|
| `src/context/AppContext.jsx` | Modificar | Agregar `eurUsdUpdatedAt` state + exponerlo en el context |
| `src/components/CurrencyConverter.jsx` | Crear | FAB + panel con inputs sincronizados |
| `src/App.jsx` | Modificar | Importar y montar `<CurrencyConverter>` en el shell |

---

## Task 1: Agregar `eurUsdUpdatedAt` a AppContext

**Files:**
- Modify: `src/context/AppContext.jsx`

- [ ] **Step 1: Agregar el estado `eurUsdUpdatedAt`**

En `AppContext.jsx`, después de la línea:
```js
const [eurUsd, setEurUsd] = useState(1.165);
```
Agregar:
```js
const [eurUsdUpdatedAt, setEurUsdUpdatedAt] = useState(null);
```

- [ ] **Step 2: Setearlo cuando el fetch EUR/USD tiene éxito**

Reemplazar la línea del fetch exitoso:
```js
if (rate && rate > 0.5 && rate < 3) { setEurUsd(rate); return; }
```
Por:
```js
if (rate && rate > 0.5 && rate < 3) { setEurUsd(rate); setEurUsdUpdatedAt(new Date()); return; }
```

- [ ] **Step 3: Exponer en el Provider**

Reemplazar la línea del Provider value:
```js
<AppContext.Provider value={{ state, setState, loading, syncStatus, eurUsd, setEurUsd, darkMode, toggleDark }}>
```
Por:
```js
<AppContext.Provider value={{ state, setState, loading, syncStatus, eurUsd, setEurUsd, eurUsdUpdatedAt, darkMode, toggleDark }}>
```

- [ ] **Step 4: Verificar build limpio**

```bash
export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"
cd /Users/ivanperezcharmac/Documents/GitHub/presupuestoeuropa2027
npm run build 2>&1 | tail -10
```
Esperado: `✓ built in` sin errores.

- [ ] **Step 5: Commit**

```bash
git add src/context/AppContext.jsx
git commit -m "feat: add eurUsdUpdatedAt to AppContext"
```

---

## Task 2: Crear `CurrencyConverter.jsx`

**Files:**
- Create: `src/components/CurrencyConverter.jsx`

- [ ] **Step 1: Crear el componente completo**

Crear `src/components/CurrencyConverter.jsx` con este contenido:

```jsx
import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

function timeAgo(date) {
  const mins = Math.floor((Date.now() - date) / 60000);
  if (mins < 1) return 'hace un momento';
  if (mins < 60) return `hace ${mins} min`;
  return `hace ${Math.floor(mins / 60)}h`;
}

export default function CurrencyConverter() {
  const { eurUsd, eurUsdUpdatedAt } = useApp();
  const [open, setOpen] = useState(false);
  const [eurVal, setEurVal] = useState('');
  const [usdVal, setUsdVal] = useState('');
  const [lastEdited, setLastEdited] = useState('eur');
  const panelRef = useRef(null);
  const fabRef = useRef(null);

  // Cerrar al tocar fuera del panel y del FAB
  useEffect(() => {
    if (!open) return;
    function handleOutside(e) {
      if (panelRef.current?.contains(e.target) || fabRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [open]);

  // Recalcular si cambia la tasa mientras el panel está abierto
  useEffect(() => {
    if (lastEdited === 'eur' && eurVal !== '') {
      const n = parseFloat(eurVal);
      if (!isNaN(n)) setUsdVal((n * eurUsd).toFixed(2));
    } else if (lastEdited === 'usd' && usdVal !== '') {
      const n = parseFloat(usdVal);
      if (!isNaN(n)) setEurVal((n / eurUsd).toFixed(2));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eurUsd]);

  function handleEurChange(e) {
    const v = e.target.value;
    setEurVal(v);
    setLastEdited('eur');
    const n = parseFloat(v);
    setUsdVal(isNaN(n) || v === '' ? '' : (n * eurUsd).toFixed(2));
  }

  function handleUsdChange(e) {
    const v = e.target.value;
    setUsdVal(v);
    setLastEdited('usd');
    const n = parseFloat(v);
    setEurVal(isNaN(n) || v === '' ? '' : (n / eurUsd).toFixed(2));
  }

  function handleFabClick() {
    setOpen(prev => {
      if (!prev) { setEurVal(''); setUsdVal(''); setLastEdited('eur'); }
      return !prev;
    });
  }

  const updatedText = eurUsdUpdatedAt
    ? `Tasa live · actualizada ${timeAgo(eurUsdUpdatedAt)}`
    : 'Tasa de referencia';

  return (
    <>
      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          className="fixed right-4 z-[60] w-56 rounded-2xl p-4 bottom-[136px] lg:bottom-[80px]"
          style={{
            background: 'var(--surface, #fff)',
            border: '1px solid var(--border, #E2E8F0)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{color:'var(--muted)'}}>
              Conversor
            </span>
            <span className="text-[10px] font-semibold" style={{color:'var(--blue,#1B4FD8)'}}>
              1 EUR = {eurUsd.toFixed(4)} USD
            </span>
          </div>

          {/* Input EUR */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">🇪🇺</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={eurVal}
              onChange={handleEurChange}
              autoFocus
              className="flex-1 rounded-lg px-2 py-1.5 text-right font-mono text-sm font-semibold outline-none"
              style={{
                border: '1.5px solid var(--blue,#1B4FD8)',
                background: 'var(--surface2, #F0F3F7)',
              }}
            />
            <span className="text-xs font-bold w-8 text-right" style={{color:'var(--navy,#0B1F3A)'}}>EUR</span>
          </div>

          {/* Separador */}
          <div className="text-center text-lg mb-2" style={{color:'var(--gold,#C9933A)'}}>⇅</div>

          {/* Input USD */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🇺🇸</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={usdVal}
              onChange={handleUsdChange}
              className="flex-1 rounded-lg px-2 py-1.5 text-right font-mono text-sm font-semibold outline-none"
              style={{
                border: '1.5px solid var(--border,#E2E8F0)',
                background: 'var(--surface2, #F0F3F7)',
              }}
            />
            <span className="text-xs font-bold w-8 text-right" style={{color:'var(--navy,#0B1F3A)'}}>USD</span>
          </div>

          {/* Footer */}
          <div className="text-center text-[10px]" style={{color:'var(--muted)'}}>
            {updatedText}
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        ref={fabRef}
        onClick={handleFabClick}
        aria-label="Abrir conversor EUR/USD"
        className="fixed bottom-20 lg:bottom-6 right-4 z-[60] w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg transition-colors"
        style={{background: open ? 'var(--navy,#0B1F3A)' : 'var(--blue,#1B4FD8)'}}
      >
        {open ? '✕' : '€$'}
      </button>
    </>
  );
}
```

- [ ] **Step 2: Verificar build limpio**

```bash
export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"
cd /Users/ivanperezcharmac/Documents/GitHub/presupuestoeuropa2027
npm run build 2>&1 | tail -10
```
Esperado: `✓ built in` sin errores ni warnings de React hooks.

- [ ] **Step 3: Commit**

```bash
git add src/components/CurrencyConverter.jsx
git commit -m "feat: add CurrencyConverter FAB component"
```

---

## Task 3: Montar `CurrencyConverter` en `App.jsx`

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Importar el componente**

Al principio de `src/App.jsx`, después de los imports existentes de componentes (cerca de `import Estilo`), agregar:
```js
import CurrencyConverter from './components/CurrencyConverter';
```

- [ ] **Step 2: Montar en el shell**

En el JSX del return autenticado, después del cierre del bottom nav (`</div>` que cierra `lg:hidden fixed bottom-0...`) y antes del cierre del `flex min-h-screen` exterior, agregar:

```jsx
      <CurrencyConverter />
    </div>  {/* ← cierre de flex min-h-screen */}
  );
```

Es decir, el árbol queda:
```jsx
return (
  <div className="flex min-h-screen">
    {/* sidebar mobile overlay */}
    {/* sidebar desktop */}
    {/* contenido principal */}
    {/* bottom nav mobile */}
    <CurrencyConverter />   {/* ← nuevo, al mismo nivel que el bottom nav */}
  </div>
);
```

- [ ] **Step 3: Verificar build limpio**

```bash
export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"
cd /Users/ivanperezcharmac/Documents/GitHub/presupuestoeuropa2027
npm run build 2>&1 | tail -10
```
Esperado: `✓ built in` sin errores.

- [ ] **Step 4: Probar en dev server**

```bash
export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"
npm run dev
```
Abrir `http://localhost:5173`. Verificar:
- [ ] FAB azul `€$` visible en esquina inferior derecha, sobre el bottom nav en mobile
- [ ] Al tocarlo se abre el panel con dos inputs
- [ ] Escribir `100` en EUR → USD muestra `~108` (según tasa live)
- [ ] Escribir en USD → EUR recalcula correctamente
- [ ] Tocar fuera del panel lo cierra
- [ ] Tocar el FAB de nuevo (muestra ✕) también lo cierra
- [ ] En desktop (ventana ancha) el FAB baja al `bottom: 24px` (sin superponerse al nav)

- [ ] **Step 5: Commit final**

```bash
git add src/App.jsx
git commit -m "feat: mount CurrencyConverter in app shell"
```

---

## Task 4: Push y deploy

- [ ] **Push a GitHub**

```bash
git push origin main
```

- [ ] **Verificar deploy en GitHub Pages**

Abrir `https://ivanperezcharmac-hub.github.io/presupuestoeuropa2027` y repetir las verificaciones del Step 4 de Task 3 en mobile (iPhone).
