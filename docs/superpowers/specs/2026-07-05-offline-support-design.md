# Soporte offline (funciona sin datos móviles) — Diseño

## Contexto

La app sincroniza contra Google Apps Script + Google Sheets vía JSONP (GET) y un POST
`no-cors` fire-and-forget (`AppContext.jsx`). Hoy, si `loadFromCloud()` falla (timeout de
5s, típico cuando no hay conexión), `initState(null || {})` arranca con **estado en blanco**
— la app se ve rota. El tipo de cambio EUR/USD depende de 3 APIs en cascada sin ningún
fallback local. No existe Service Worker ni manifest, así que en iOS (donde el caché de
Safari se purga fácilmente) tampoco hay garantía de que el HTML/JS/CSS carguen sin red.

Objetivo: que la app funcione (ver datos y poder editar) sin conexión, usando la última
sincronización conocida, y que sincronice sola cuando vuelve la señal. Prioridad:
resiliencia — nunca romper el flujo online actual.

## Arquitectura

**Service Worker (`vite-plugin-pwa`, modo `generateSW`, `registerType: 'autoUpdate'`)**
precachea el build completo (JS/CSS/HTML) para que la app abra sin internet aunque el
caché normal del navegador se haya perdido. Se agrega un Web App Manifest reusando
`favicon.svg` como ícono, `theme_color`/`background_color` navy (`#0b1f3a`), `display:
standalone`.

`deploy.sh` se actualiza: hoy solo copia `dist/index.html` y `dist/assets/*` a la raíz del
repo. Hay que sumar también los archivos que el Service Worker genera en la raíz del build
(`manifest.webmanifest`, `sw.js`, `workbox-*.js`, `registerSW.js` si aplica) al `cp`/`git
add`.

## Datos offline (`src/context/AppContext.jsx`)

- **Cache de estado**: cada `loadFromCloud()` exitoso escribe una copia del resultado en
  `localStorage` (clave `eu2027_cache`). Si `loadFromCloud()` devuelve `null` (falla/timeout),
  se intenta leer `eu2027_cache` antes de caer a `initState({})` en blanco. Solo si tampoco
  hay cache local (primera apertura de la app y ya sin señal) se usa el estado en blanco —
  caso límite inevitable, no se considera "romper" nada porque nunca hubo datos que mostrar.
- **Cache de tipo de cambio**: cada fetch exitoso de EUR/USD guarda `{ rate, updatedAt }` en
  `localStorage` (clave `eu2027_rate_cache`). Si las 3 APIs en cascada fallan, se usa el
  valor cacheado (con su `updatedAt` real) en vez de quedarse en el default hardcodeado
  sin indicación de que es viejo.
- **Guardado local inmediato**: cada cambio de estado (`setState`) escribe sincrónicamente
  a `eu2027_cache` en `localStorage`, además del flujo existente de guardado a la nube
  (debounce 1.2s). Así ninguna edición se pierde aunque se cierre la app antes de que el
  debounce dispare.
- **Guardado a la nube condicionado a conexión**: el POST a Apps Script solo se intenta si
  `navigator.onLine` es `true`. Si está offline, se marca un flag `eu2027_pending_sync = '1'`
  en `localStorage` y no se llama a la red.
- **Reintento automático al reconectar**: un listener del evento `online` en `AppProvider`
  revisa `eu2027_pending_sync`; si está seteado, reintenta `saveToCloud` con el último
  estado cacheado y limpia el flag al confirmar.
- Todo acceso a `localStorage` va envuelto en `try/catch` — si no está disponible (modo
  privado, cuota excedida), se degrada al comportamiento actual (solo memoria), sin romper
  nada.

## UI

`Sidebar.jsx` ya mapea `syncStatus` a un punto de color + label (ok/saving/error). Se agrega
un cuarto estado `'offline'` → punto gris, label "Sin conexión (guardado local)".

## Fuera de alcance

- No se toca la lógica de negocio existente (cálculos, fechas de vuelos, etc.).
- No se resuelve el bug preexistente de `saveTimer` sin `clearTimeout` en el cleanup — ya
  documentado en `CLAUDE.md` como conocido y no relacionado a este cambio.
- No se generan íconos PNG nuevos para el manifest — se reusa el `favicon.svg` existente.
  Mejorar el ícono de "Agregar a inicio" en iOS queda fuera de este alcance.
- No se implementa resolución de conflictos entre ediciones simultáneas de Agus/Ivan — se
  mantiene el mismo "last write wins" que ya existe hoy en el flujo online.

## Testing

- DevTools → Network → Offline, recargar: la app debe abrir con los últimos datos
  sincronizados (no en blanco).
- Con la app ya offline, editar un valor (ej. precio de hotel): debe reflejarse al toque en
  la UI y sobrevivir a un reload mientras se sigue offline.
- El punto de estado del sidebar debe mostrar "Sin conexión" mientras está offline.
- Volver a poner online en DevTools: el punto debe volver a "Sincronizado" y debe verse una
  request de red hacia `SCRIPT_URL` (Network tab, aunque `no-cors` oculte la respuesta).
- `npm run build && npm run preview`, cargar una vez online, después Offline + hard refresh:
  confirmar que el shell (HTML/JS/CSS) sirve desde el Service Worker.
