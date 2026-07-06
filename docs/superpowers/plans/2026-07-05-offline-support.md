# Soporte Offline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que la app abra y sea editable sin conexión a internet, usando la última data
sincronizada, y que sincronice sola cuando vuelve la señal.

**Architecture:** Service Worker (`vite-plugin-pwa`) precachea el build para que el shell
(HTML/JS/CSS) cargue sin red. Una capa nueva de cache en `localStorage`
(`src/context/offlineCache.js`) guarda el último estado y tipo de cambio conocidos, y
`AppContext.jsx` cae a ese cache cuando el JSONP/fetch fallan. Las ediciones offline se
guardan localmente al toque y se re-intentan mandar a Google Sheets cuando vuelve la
conexión (evento `online`).

**Tech Stack:** React 19, Vite 8, `vite-plugin-pwa` (nuevo), `localStorage`.

**Nota sobre testing:** este proyecto no tiene ningún framework de test (`vitest`/`jest`)
instalado ni configurado — es una app personal chica sin suite existente. Agregar uno de
cero solo para esta feature sería una dependencia nueva no relacionada al objetivo (soporte
offline), así que cada tarea se verifica con `npm run lint`, `npm run build`, y checks
manuales concretos en el navegador (Chrome DevTools → Network → Offline), con el resultado
esperado escrito explícitamente en cada paso.

---

### Task 1: Instalar y configurar `vite-plugin-pwa`

**Files:**
- Modify: `package.json`
- Modify: `vite.config.js`

- [ ] **Step 1: Instalar la dependencia**

Run: `cd ~/Documents/GitHub/presupuestoeuropa2027 && npm install -D vite-plugin-pwa`
Expected: agrega `vite-plugin-pwa` a `devDependencies` en `package.json` y actualiza
`package-lock.json`, sin errores. Si tira un conflicto de peer-deps por la versión de Vite,
reintentar con `npm install -D vite-plugin-pwa --legacy-peer-deps`.

- [ ] **Step 2: Configurar el plugin en `vite.config.js`**

Reemplazar todo el contenido de `vite.config.js` por:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/presupuestoeuropa2027/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Europa 2027 — Presupuesto',
        short_name: 'Europa 2027',
        description: 'Presupuesto de viaje Agus & Ivan — Europa marzo-abril 2027',
        start_url: '/presupuestoeuropa2027/',
        scope: '/presupuestoeuropa2027/',
        display: 'standalone',
        background_color: '#0b1f3a',
        theme_color: '#0b1f3a',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg}'],
        navigateFallback: '/presupuestoeuropa2027/index.html',
      },
    }),
  ],
})
```

- [ ] **Step 3: Build y verificar que genera los archivos del Service Worker**

El build de producción necesita el `index.html` de dev (apunta a `/src/main.jsx`), no el que
está commiteado en la raíz (que es el de producción). Restaurar temporalmente antes de
buildear:

Run:
```bash
cd ~/Documents/GitHub/presupuestoeuropa2027
cp index.html /tmp/index.html.prod.bak
cat > index.html << 'EOF'
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><text y='56' font-size='56'>✈</text></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="apple-mobile-web-app-title" content="Europa 2027" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <title>Europa 2027 — Presupuesto</title>
    <script type="module" src="/src/main.jsx"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
EOF
npm run build
ls dist/
cp /tmp/index.html.prod.bak index.html
```
Expected: `ls dist/` incluye, además de `index.html` y `assets/`, los archivos
`manifest.webmanifest`, `sw.js` y al menos un `workbox-*.js`. Si no aparecen, revisar la
consola de `npm run build` por errores del plugin antes de seguir.

- [ ] **Step 4: Commit**

```bash
cd ~/Documents/GitHub/presupuestoeuropa2027
rm -rf dist
git add package.json package-lock.json vite.config.js
git commit -m "feat: agregar vite-plugin-pwa para precachear el shell offline"
```

---

### Task 2: Actualizar `deploy.sh` para publicar los archivos del Service Worker

**Files:**
- Modify: `deploy.sh`

- [ ] **Step 1: Reemplazar el bloque de copia post-build**

Archivo completo actual (para ubicar el bloque a cambiar):

```bash
npm run build

cp dist/index.html index.html
cp dist/assets/* assets/

git add index.html assets/
git commit -m "${1:-deploy}"
git push origin main

echo "✓ Deploy completo"
```

Reemplazar esas líneas (desde `npm run build` hasta el `git add index.html assets/`) por:

```bash
npm run build

cp dist/index.html index.html
cp dist/assets/* assets/

shopt -s nullglob
pwa_files=(dist/manifest.webmanifest dist/sw.js dist/registerSW.js dist/workbox-*.js)
for f in "${pwa_files[@]}"; do
  cp "$f" "$(basename "$f")"
done
shopt -u nullglob

git add index.html assets/
for f in "${pwa_files[@]}"; do
  git add "$(basename "$f")"
done
```

El resto del archivo (`git commit`, `git push`, el `echo` final) queda igual.

- [ ] **Step 2: Verificar que el script sigue siendo válido bash**

Run: `cd ~/Documents/GitHub/presupuestoeuropa2027 && bash -n deploy.sh`
Expected: sin output (sin errores de sintaxis).

- [ ] **Step 3: Commit**

```bash
cd ~/Documents/GitHub/presupuestoeuropa2027
git add deploy.sh
git commit -m "chore: deploy.sh copia tambien manifest/sw/workbox al publicar"
```

---

### Task 3: Módulo de cache en `localStorage`

**Files:**
- Create: `src/context/offlineCache.js`

- [ ] **Step 1: Crear el archivo**

```js
export const STATE_CACHE_KEY = 'eu2027_cache';
export const RATE_CACHE_KEY = 'eu2027_rate_cache';
export const PENDING_SYNC_KEY = 'eu2027_pending_sync';

export function readCache(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeCache(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage no disponible (modo privado, cuota excedida, etc.) — se ignora
  }
}

export function clearCache(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // no-op
  }
}
```

- [ ] **Step 2: Verificar en consola del navegador**

Run: `cd ~/Documents/GitHub/presupuestoeuropa2027 && npm run lint -- src/context/offlineCache.js`
Expected: `✖ 0 problems` (o sin output de errores).

- [ ] **Step 3: Commit**

```bash
cd ~/Documents/GitHub/presupuestoeuropa2027
git add src/context/offlineCache.js
git commit -m "feat: helper de cache en localStorage para soporte offline"
```

---

### Task 4: Fallback a cache al cargar el estado

**Files:**
- Modify: `src/context/AppContext.jsx:1-2` (imports)
- Modify: `src/context/AppContext.jsx:98-106` (efecto de carga)

- [ ] **Step 1: Agregar el import**

En `src/context/AppContext.jsx`, la línea 2 actual es:

```js
import { SCRIPT_URL, CITIES, COMPRAS_CATS, INTL_FLIGHTS, EURO_FLIGHTS } from '../data/constants';
```

Agregar debajo:

```js
import { STATE_CACHE_KEY, readCache, writeCache } from './offlineCache';
```

- [ ] **Step 2: Reemplazar el efecto de carga**

El bloque actual (líneas 98-106):

```js
  useEffect(() => {
    loadFromCloud().then(raw => {
      const s = initState(raw || {});
      setStateRaw(s);
      if (s.theme?.dark) setDarkMode(true);
      setLoading(false);
      setSyncStatus('ok');
    });
  }, []);
```

Reemplazar por:

```js
  useEffect(() => {
    loadFromCloud().then(raw => {
      let offline = false;
      let source = raw;
      if (!source) {
        source = readCache(STATE_CACHE_KEY);
        offline = true;
      }
      const s = initState(source || {});
      setStateRaw(s);
      if (s.theme?.dark) setDarkMode(true);
      setLoading(false);
      writeCache(STATE_CACHE_KEY, s);
      setSyncStatus(offline ? 'offline' : 'ok');
    });
  }, []);
```

- [ ] **Step 3: Lint**

Run: `cd ~/Documents/GitHub/presupuestoeuropa2027 && npx eslint src/context/AppContext.jsx`
Expected: los mismos errores preexistentes de siempre (fast-refresh en los exports de
funciones, ver `docs/superpowers/specs/2026-07-05-offline-support-design.md`), ninguno
nuevo relacionado a este cambio.

- [ ] **Step 4: Commit**

```bash
cd ~/Documents/GitHub/presupuestoeuropa2027
git add src/context/AppContext.jsx
git commit -m "feat: cargar desde cache local si falla la sincronizacion con Sheets"
```

---

### Task 5: Fallback a cache para el tipo de cambio EUR/USD

**Files:**
- Modify: `src/context/AppContext.jsx:108-122`

- [ ] **Step 1: Reemplazar el efecto de EUR/USD**

El bloque actual:

```js
  useEffect(() => {
    const apis = [
      () => fetch('https://api.frankfurter.app/latest?from=EUR&to=USD').then(r => r.json()).then(d => d?.rates?.USD),
      () => fetch('https://open.er-api.com/v6/latest/EUR').then(r => r.json()).then(d => d?.rates?.USD),
      () => fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json').then(r => r.json()).then(d => d?.eur?.usd),
    ];
    (async () => {
      for (const api of apis) {
        try {
          const rate = await api();
          if (rate && rate > 0.5 && rate < 3) { setEurUsd(rate); setEurUsdUpdatedAt(new Date()); return; }
        } catch { continue; }
      }
    })();
  }, []);
```

Reemplazar por:

```js
  useEffect(() => {
    const apis = [
      () => fetch('https://api.frankfurter.app/latest?from=EUR&to=USD').then(r => r.json()).then(d => d?.rates?.USD),
      () => fetch('https://open.er-api.com/v6/latest/EUR').then(r => r.json()).then(d => d?.rates?.USD),
      () => fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json').then(r => r.json()).then(d => d?.eur?.usd),
    ];
    (async () => {
      for (const api of apis) {
        try {
          const rate = await api();
          if (rate && rate > 0.5 && rate < 3) {
            setEurUsd(rate);
            const now = new Date();
            setEurUsdUpdatedAt(now);
            writeCache(RATE_CACHE_KEY, { rate, updatedAt: now.toISOString() });
            return;
          }
        } catch { continue; }
      }
      const cached = readCache(RATE_CACHE_KEY);
      if (cached?.rate) {
        setEurUsd(cached.rate);
        setEurUsdUpdatedAt(new Date(cached.updatedAt));
      }
    })();
  }, []);
```

- [ ] **Step 2: Actualizar el import**

La línea de import agregada en la Task 4 queda:

```js
import { STATE_CACHE_KEY, readCache, writeCache } from './offlineCache';
```

Cambiarla por:

```js
import { STATE_CACHE_KEY, RATE_CACHE_KEY, readCache, writeCache } from './offlineCache';
```

- [ ] **Step 3: Lint**

Run: `cd ~/Documents/GitHub/presupuestoeuropa2027 && npx eslint src/context/AppContext.jsx`
Expected: igual que en la Task 4, sin errores nuevos.

- [ ] **Step 4: Commit**

```bash
cd ~/Documents/GitHub/presupuestoeuropa2027
git add src/context/AppContext.jsx
git commit -m "feat: usar ultimo tipo de cambio cacheado si fallan las APIs de EUR/USD"
```

---

### Task 6: Guardado offline-aware + reintento automático al reconectar

**Files:**
- Modify: `src/context/AppContext.jsx:128-138` (`setState`)
- Modify: `src/context/AppContext.jsx` (nuevo efecto, después del efecto de `darkMode`)

- [ ] **Step 1: Reemplazar `setState`**

El bloque actual:

```js
  const setState = useCallback((updater) => {
    setStateRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setSyncStatus('saving');
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveToCloud(next).then(() => setSyncStatus('ok')).catch(() => setSyncStatus('error'));
      }, 1200);
      return next;
    });
  }, []);
```

Reemplazar por:

```js
  const setState = useCallback((updater) => {
    setStateRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      writeCache(STATE_CACHE_KEY, next);
      if (!navigator.onLine) {
        writeCache(PENDING_SYNC_KEY, '1');
        setSyncStatus('offline');
        return next;
      }
      setSyncStatus('saving');
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveToCloud(next)
          .then(() => { clearCache(PENDING_SYNC_KEY); setSyncStatus('ok'); })
          .catch(() => setSyncStatus('error'));
      }, 1200);
      return next;
    });
  }, []);
```

- [ ] **Step 2: Actualizar el import**

Cambiar el import de la Task 5:

```js
import { STATE_CACHE_KEY, RATE_CACHE_KEY, readCache, writeCache } from './offlineCache';
```

por:

```js
import { STATE_CACHE_KEY, RATE_CACHE_KEY, PENDING_SYNC_KEY, readCache, writeCache, clearCache } from './offlineCache';
```

- [ ] **Step 3: Agregar el efecto de reintento al reconectar**

Justo después de este efecto existente (el de `darkMode`, líneas 124-126):

```js
  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);
```

Agregar:

```js
  useEffect(() => {
    function flushPendingSync() {
      if (readCache(PENDING_SYNC_KEY) !== '1') return;
      setStateRaw(prev => {
        if (!prev) return prev;
        setSyncStatus('saving');
        saveToCloud(prev)
          .then(() => { clearCache(PENDING_SYNC_KEY); setSyncStatus('ok'); })
          .catch(() => setSyncStatus('error'));
        return prev;
      });
    }
    window.addEventListener('online', flushPendingSync);
    return () => window.removeEventListener('online', flushPendingSync);
  }, []);
```

- [ ] **Step 4: Lint**

Run: `cd ~/Documents/GitHub/presupuestoeuropa2027 && npx eslint src/context/AppContext.jsx`
Expected: sin errores nuevos respecto a la Task 4.

- [ ] **Step 5: Commit**

```bash
cd ~/Documents/GitHub/presupuestoeuropa2027
git add src/context/AppContext.jsx
git commit -m "feat: guardar offline en localStorage y reintentar sync al reconectar"
```

---

### Task 7: Indicador "Sin conexión" en el sidebar

**Files:**
- Modify: `src/components/Sidebar.jsx:28-29`

- [ ] **Step 1: Reemplazar `dotColor`/`dotLabel`**

El bloque actual:

```js
  const dotColor = syncStatus === 'ok' ? '#4ade80' : syncStatus === 'saving' ? '#fbbf24' : '#f87171';
  const dotLabel = syncStatus === 'ok' ? 'Sincronizado' : syncStatus === 'saving' ? 'Guardando…' : 'Error';
```

Reemplazar por:

```js
  const dotColor = syncStatus === 'ok' ? '#4ade80'
    : syncStatus === 'saving' ? '#fbbf24'
    : syncStatus === 'offline' ? '#9ca3af'
    : '#f87171';
  const dotLabel = syncStatus === 'ok' ? 'Sincronizado'
    : syncStatus === 'saving' ? 'Guardando…'
    : syncStatus === 'offline' ? 'Sin conexión (guardado local)'
    : 'Error';
```

- [ ] **Step 2: Lint**

Run: `cd ~/Documents/GitHub/presupuestoeuropa2027 && npx eslint src/components/Sidebar.jsx`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
cd ~/Documents/GitHub/presupuestoeuropa2027
git add src/components/Sidebar.jsx
git commit -m "feat: indicador de sincronizacion offline en el sidebar"
```

---

### Task 8: Verificación manual end-to-end

**Files:** ninguno (solo verificación)

- [ ] **Step 1: Build de producción y preview**

Run:
```bash
cd ~/Documents/GitHub/presupuestoeuropa2027
cp index.html /tmp/index.html.prod.bak
cat > index.html << 'EOF'
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><text y='56' font-size='56'>✈</text></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="apple-mobile-web-app-title" content="Europa 2027" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <title>Europa 2027 — Presupuesto</title>
    <script type="module" src="/src/main.jsx"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
EOF
npm run build
npm run preview -- --port 4173
```
Expected: el preview server arranca en `http://localhost:4173/presupuestoeuropa2027/`.

- [ ] **Step 2: Cargar una vez online**

Abrir `http://localhost:4173/presupuestoeuropa2027/` en Chrome, hacer login (código
`1201`), esperar a que el sidebar muestre "Sincronizado". Esto deja el Service Worker
instalado y el cache de `localStorage` poblado.

- [ ] **Step 3: Simular offline y recargar**

En Chrome DevTools → pestaña Network → tildar "Offline". Recargar la página (Cmd+R).
Expected: la app carga (no queda en blanco ni en pantalla de error), muestra los mismos
datos de presupuesto que antes, y el sidebar dice "Sin conexión (guardado local)".

- [ ] **Step 4: Editar offline**

Con "Offline" todavía tildado, ir a Ciudades y cambiar el valor de "Hotel/noche" de
cualquier ciudad. Expected: el número se actualiza al toque en la UI. Recargar la página
(seguís offline): el valor nuevo tiene que seguir ahí (viene de `localStorage`, no se
perdió).

- [ ] **Step 5: Volver a poner online**

Destildar "Offline" en DevTools. Expected: en unos segundos el sidebar vuelve a
"Sincronizado", y en la pestaña Network aparece una request POST hacia el `SCRIPT_URL` de
Google Apps Script (la respuesta no se puede inspeccionar por ser `no-cors`, pero la
request tiene que figurar).

- [ ] **Step 6: Confirmar que no rompió el flujo online normal**

Con conexión normal, recorrer Resumen, Vuelos y Ciudades una vez más y confirmar que se ven
igual que antes de este cambio (mismos montos, mismas fechas, mismo diseño).

- [ ] **Step 7: Limpiar y restaurar `index.html` de producción**

Run:
```bash
cd ~/Documents/GitHub/presupuestoeuropa2027
rm -rf dist
cp /tmp/index.html.prod.bak index.html
git status --short
```
Expected: `git status --short` no muestra cambios en `index.html` (volvió a su estado
commiteado).
