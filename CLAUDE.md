# Europa 2027 - Presupuesto de Viaje

App web privada para planificar el viaje de Agustina e Ivan a Europa.

URL: https://ivanperezcharmac-hub.github.io/presupuestoeuropa2027
Codigo de acceso: 1201
Repo: ivanperezcharmac-hub/presupuestoeuropa2027
Backend: Google Apps Script + Google Sheets (ver secrets del proyecto, NUNCA commitear el token de GitHub ni la URL del Apps Script con credenciales en el repo)

---

## ⚠️ Stack actual: React + Vite + Tailwind v4

**LA APP YA NO ES UN SOLO index.html.** En junio 2026 se migro de un HTML monolitico a una
arquitectura React + Vite + Tailwind CSS v4 con multiples componentes. Cualquier referencia
a "editar index.html directamente" en historiales viejos ya NO aplica.

```
/src
  main.jsx
  index.css                 — design tokens, dark mode, Tailwind v4 @theme + @layer utilities
  App.jsx                   — shell: auth, routing, sidebar, topbar, bottom nav (mobile)
  context/
    AppContext.jsx           — estado global, JSONP load, no-cors save, EUR/USD, cityDays(), getCityDates()
  data/
    constants.js              — CITIES, INTL_FLIGHTS, EURO_FLIGHTS, COMPRAS_CATS, EXCURSION_CITIES,
                                 CHECKLIST_GROUPS, COSTS_DATA
  components/
    LoginScreen.jsx
    Sidebar.jsx               — un solo componente, mobile drawer + desktop fixed via CSS transform
    Resumen.jsx
    Vuelos.jsx
    Ciudades.jsx
    Alojamientos.jsx
    Actividades.jsx           — tabs: Excursiones + Plan dia a dia
    Compras.jsx
    Alertas.jsx
    Checklist.jsx
    Costos.jsx
    Estilo.jsx
```

### Principios de desarrollo (IMPORTANTE)

- **NUNCA bajar el HTML/build de produccion para editar.** Siempre editar los archivos fuente
  en `src/` localmente, nunca el `dist/` ni nada bajado de GitHub Pages.
- **Build:** `npm run build` genera `dist/`. Revisar que no haya warnings antes de subir.
- **Deploy:** subir TODOS los archivos de `dist/` a la raiz del repo via GitHub Contents API
  (GET sha del archivo existente -> PUT con contenido base64 + sha). Los hashes de los assets
  cambian en cada build; los archivos viejos quedan huerfanos en el repo pero no rompen nada
  porque `index.html` solo referencia los nuevos.
- **GitHub Pages en modo legacy** (branch/root). Un intento de usar GitHub Actions con git tree
  API para automatizar el deploy fallo por permisos insuficientes del token — abandonado a favor
  del approach manual via Contents API.
- **Nunca commitear el token de GitHub** en ningun archivo del repo — GitHub bloquea esos pushes
  automaticamente si detecta el string del token.

### Tailwind v4 — gotchas especificos de este proyecto

- El `@import` de Google Fonts debe ir ANTES de `@import "tailwindcss"` en `index.css`, sino
  rompe el orden de cascada y el font no se aplica.
- Clases custom como `font-mono` o `font-display` no se generan solas: hay que sobreescribir
  el token con `@theme { --font-mono: 'DM Mono', ...; }` y declarar utilities custom con
  `@layer utilities { .font-display { ... } }`. Sin esto, Tailwind v4 purga o pisa las clases.

---

## Circuito de viaje (ACTUALIZADO)

**Buenos Aires → Barcelona (vuelo directo) → Roma → París → Londres → Madrid → Buenos Aires**

Ya NO se vuela BUE→Madrid. El vuelo internacional de ida es directo a Barcelona. El regreso a
Buenos Aires es desde Madrid. El tramo interno Madrid→Barcelona fue eliminado (ya no aplica).

5 ciudades, 26 dias, 17 mar -> 11 abr 2027.

### Fechas: ya NO son fijas, se editan en la app

Los `defIn`/`defOut` en `constants.js` son solo el *default* la primera vez que se abre la app.
El reparto real de noches por ciudad se ajusta directamente en la pantalla **Vuelos**, cambiando
la fecha de cada tramo — Ciudades ya no tiene fechas editables, las muestra en modo solo lectura.

Default actual (5 noches por ciudad, salvo Londres):
- Barcelona: 17 mar -> 22 mar
- Roma: 22 mar -> 27 mar
- Paris: 27 mar -> 1 abr
- Londres: 1 abr -> 6 abr
- Madrid: 6 abr -> 11 abr

**Las fechas reales de Ciudades se derivan de las fechas de Vuelos**, no se guardan
independientemente (ver seccion siguiente).

---

## Vuelos ↔ Ciudades: sincronizacion automatica de fechas

Este es el cambio mas importante de la arquitectura de datos. Antes, Ciudades tenia fechas
editables manualmente, lo cual duplicaba data con Vuelos y se desincronizaba. Ahora:

- Cada vuelo en `constants.js` tiene `arrivesCity` y/o `departsCity` (id de `CITIES`).
- `getCityDates(state, cityId)` en `AppContext.jsx` recorre `INTL_FLIGHTS` + `EURO_FLIGHTS` y
  calcula `checkIn` (fecha del vuelo que llega a esa ciudad) y `checkOut` (fecha del vuelo que
  sale de esa ciudad).
- **Importante:** la llegada considera el cruce de medianoche. Si un vuelo sale tarde y por la
  duracion + diferencia de zona horaria aterriza al dia siguiente, `getCityDates` suma ese
  offset (funcion `arrivalDayOffset()`). Ejemplo real: el vuelo EZE→BCN sale 17 mar, dura 13h30,
  y la diferencia horaria EZE(-3)→BCN(+2) son 5 horas mas — si no hay hora de salida configurada
  se asume una salida estimada 22:00, lo que da una llegada real el **18 de marzo**, no el 17.
- `cityDays(state, id)` ahora acepta el **state completo** (no solo `state.cities`) y usa
  `getCityDates()` primero, con fallback a `state.cities[id].checkIn/checkOut` para compatibilidad
  si por algun motivo no hay vuelo asociado a esa ciudad.
- Todos los call-sites de `cityDays()` pasan `state` completo: `Resumen.jsx`, `Ciudades.jsx` (x2),
  `Alojamientos.jsx`, `App.jsx` (`useGrandTotal`).
- `Ciudades.jsx` muestra las fechas como **solo lectura** con tag "desde Vuelos". Solo quedan
  editables ahi: costo de hotel/noche y gastos diarios.
- `Actividades.jsx` (tab Itinerario dia a dia) tambien usa `getCityDates(state, city.id)` en vez
  de `state.cities[id].checkIn` directo.

**Si se agrega o cambia un vuelo en `constants.js`, hay que setear `arrivesCity`/`departsCity`
correctamente o esa ciudad va a perder su fecha derivada.**

---

## Vuelos: feature completa (la mas compleja del proyecto)

`Vuelos.jsx` permite, por cada tramo (`INTL_FLIGHTS` + `EURO_FLIGHTS`):

- **Fecha editable** por tramo, persiste en `state.flightDates[flightId]`.
- **Numero de vuelo** editable, persiste en `state.flightNumbers[flightId]`.
- **Hora de salida** editable (`state.flightDepTimes[flightId]`) + **hora de llegada calculada
  automaticamente** sumando `durationMin` + diferencia de zona horaria (`computeArrival()` en
  el componente), mostrando un indicador `+1d` si la llegada cruza medianoche.
- **Toggle "Vuelo directo" / "Con escala"** (`state.flightHasStop[flightId]`). Al activarlo se
  abren bloques por cada escala (`state.flightStops[flightId]`, array de
  `{ airport, arrTime, depTime, flightNum }`) con boton "+ Agregar otra escala". Con escala, la
  llegada final ya no se calcula sola — se anota manualmente en
  `state.flightFinalArrival[flightId]` porque el tiempo total deja de ser predecible.
- **Link guardado** por vuelo (`state.flightLinks[flightId]`) para pegar la URL exacta donde se
  encontro el pasaje (Skyscanner, Aerolineas Argentinas, etc.), con boton "Abrir" para volver
  directo a comprar.
- Link "↗ Flights" genera una busqueda dinamica de Google Flights segun la fecha actual
  (`googleFlightsUrl(from, to, dateISO)`).

Cada uno de estos campos tiene su null guard en `initState()` de `AppContext.jsx`
(`flightDates`, `flightLinks`, `flightDepTimes`, `flightNumbers`, `flightHasStop`,
`flightStops`, `flightFinalArrival` — todos inicializan en `{}`).

`constants.js` define en cada vuelo: `durationMin` (duracion en minutos), `tzFrom`/`tzTo`
(offset UTC del aeropuerto origen/destino, considerando horario de verano europeo
marzo-abril), y `arrivesCity`/`departsCity`.

---

## Secciones (estado actual)

- **Resumen**: total general, bloques base/destino, pie chart SVG interactivo, gasto por persona.
- **Vuelos**: ver seccion dedicada arriba — la mas compleja de la app.
- **Ciudades**: fechas en solo lectura derivadas de Vuelos (tag "desde Vuelos"), hotel/noche y
  gastos diarios editables, subtotal automatico, control de dias (debe sumar 26).
- **Alojamientos**: hasta 3 opciones por ciudad (A/B/C).
- **Excursiones y Plan**: tab excursiones (actividades con costo USD) + tab itinerario dia a dia
  (usa `getCityDates()`, no fechas manuales).
- **Compras**: 5 categorias, dividido Agus/Ivan, precios en EUR con conversion a USD automatica.
- **Alertas EUR/USD**: tipo de cambio live, alertas por rango min/max, impacto en presupuesto.
- **Checklist pre-viaje**: +35 items en 7 categorias con progreso.
- **Costos de referencia**: datos 2025-2026 por ciudad sin alojamiento.
- **Personalizar**: colores, tipografia, dark mode.

---

## Diseño visual

Paleta aplicada con el skill `frontend-design` (brief: pareja argentina viajando a Europa, app
privada, uso intensivo en iPhone):

- `--navy:#0B1F3A` (sidebar), `--blue:#1B4FD8` (acento interactivo, "azul pasaporte"),
  `--gold:#C9933A` / `--goldl:#E8B86D` (solo para el total y header).
- Superficies light: `--bg:#F4F6F8`, `--surface:#FFF`, `--surface2:#F0F3F7`, `--border:#E2E8F0`.
- Superficies dark: `--bg:#0D1117`, `--surface:#161B22`, `--surface2:#21262D`,
  `--border:#30363D`. Dark mode cubre `.card`, `.inp`, inputs de fecha (necesitan
  `color-scheme: dark` para verse bien en iOS), y todos los componentes — no solo `body`.
- Tipografia: DM Serif Display (titulos), DM Sans (cuerpo), DM Mono (numeros financieros).
- Signature element: en Resumen, el total general flota como numero de moneda dentro de un
  anillo SVG punteado que rota lentamente (`.coin-ring`, animacion 20s linear infinite) — unico
  momento de movimiento en la app.
- Clases reutilizables en `index.css`: `.card`, `.inp`, `.inp-mono`, `.tag` (+variants
  green/amber/red/blue/ink), `.progress-track`/`.progress-fill`, `.nav-item`, `.tip-box`,
  `.fade-in`.

---

## Features tecnicas (backend / sync)

- Login: codigo 1201.
- Sync: JSONP para GET (con flag `done` para evitar doble-call del callback), no-cors POST para
  guardar en Google Apps Script. Debounce 1.2s antes de guardar.
- **Bug conocido sin resolver:** `saveTimer.current` no tiene `clearTimeout` en el cleanup del
  `useEffect` — si el componente se desmonta con un save pendiente, el timer puede disparar en
  un componente ya desmontado. Pendiente de arreglar si vuelve a aparecer.
- EUR/USD: siempre live desde 3 APIs en cascada (frankfurter.app -> open.er-api.com ->
  fawazahmed0), nunca se usa un valor guardado en Sheets.
- Lazy loading de todas las secciones excepto Resumen (carga inicial mas rapida).
- Mobile: bottom nav bar + sidebar drawer con overlay; desktop: sidebar fijo via CSS transform
  (un solo componente `Sidebar.jsx`, sin duplicacion).
- Null guards en `initState()` para todos los campos del estado — proteccion historica contra
  renders vacios en iOS Safari.

---

## 🔜 Mejoras pendientes (pedidas por el usuario, no implementadas aun)

Estas 7 mejoras fueron acordadas pero la sesion se corto antes de empezar a programarlas.
Quedan como backlog para la proxima sesion de trabajo (probablemente en Claude Code):

1. **Conversor rapido EUR↔USD** — widget/calculadora inline accesible desde cualquier seccion
   de la app (pensado como widget flotante en `App.jsx`, no como pantalla aparte).
2. **Notas por ciudad** — campo de texto libre por ciudad en `Ciudades.jsx` (tips, restaurantes,
   cosas que no quieren perderse). Necesita un nuevo campo en el estado, ej.
   `state.cityNotes[cityId]`.
3. **Resumen de vuelos en pantalla Resumen** — hoy `Resumen.jsx` solo muestra el total en USD de
   vuelos; falta mostrar ahi mismo hora de salida/llegada de cada tramo (reutilizando la logica
   de `computeArrival()` de `Vuelos.jsx`, probablemente conviene moverla a un helper compartido).
4. **Animacion de carga mejorada** — hoy el loading screen en `App.jsx` usa un spinner generico;
   cambiar a una animacion de avion recorriendo una ruta (SVG animado, en linea con el
   `coin-ring` de Resumen).
5. **Swipe entre secciones** en mobile — hoy la navegacion es solo por bottom nav / sidebar:
   agregar gesto de swipe horizontal para cambiar de seccion en mobile.
6. **Vista de solo lectura** — una URL sin contraseña para compartir con familia, mostrando
   unicamente Resumen. Requiere logica nueva de routing/auth (ej. un query param o ruta especial
   que saltee `LoginScreen` y solo monte `<Resumen />` en modo read-only, sin sidebar ni
   navegacion).
7. **Validacion de coherencia de fechas** — avisar si un vuelo sale antes de que termine/llegue
   el anterior (ej. el tramo BCN→ROM con fecha anterior a la llegada real a Barcelona). Logica
   natural a agregar en `Vuelos.jsx` o como funcion derivada en `AppContext.jsx`, comparando
   `getCityDates()` de ciudades consecutivas contra las fechas de los vuelos que las conectan.

**Estado en el momento del corte:** ninguna de las 7 tiene codigo escrito todavia. Es el punto
exacto donde continuar la proxima sesion.

---

## Historial de cambios

2026-06-17 — Vuelos: hora de salida + numero de vuelo + llegada calculada automaticamente
  (duracion + diferencia de zona horaria), con indicador +1d si cruza medianoche.
2026-06-17 — Vuelos: opcion de escalas (toggle directo/con escala), multiples escalas por
  tramo, llegada final anotada manualmente cuando hay escala.
2026-06-17 — Ciudades: fechas ahora se derivan automaticamente de Vuelos (getCityDates()),
  ya no son editables manualmente — solo quedan editables hotel/noche y gastos diarios.
  arrivalDayOffset() ajusta el checkIn si el vuelo cruza medianoche (caso real: EZE→BCN).
2026-06-17 — Circuito actualizado: BUE→Barcelona directo (elimina BUE→MAD), elimina tramo
  interno MAD→BCN, nuevo circuito BCN→ROM→PAR→LON→MAD→BUE. Reparto de noches default a 5 por
  ciudad (salvo Londres), editable libremente desde Vuelos.
2026-06-17 — Vuelos: fechas editables por tramo (antes eran texto fijo), campo de link de
  compra guardado por vuelo, link dinamico a Google Flights segun fecha elegida.
2026-06-17 — Migracion completa de HTML monolitico a React + Vite + Tailwind v4. Rediseño
  visual completo con skill frontend-design (paleta navy/blue/gold, tipografia DM Serif/DM
  Sans/DM Mono, signature coin-ring animado en Resumen).
2026-06-17 — Code review + fixes: orden de @import en CSS, @theme/@layer utilities para
  font-mono/font-display en Tailwind v4, Sidebar unificado (eliminado render duplicado en
  desktop), variables CSS viejas del HTML monolitico (--cream, --muted, --lite) reemplazadas
  por las nuevas (--surface2, --txt2, --txt3). Dark mode rehecho para cubrir todos los
  componentes (no solo body).
2026-06-14 — (version HTML monolitica, pre-migracion) Fix renders vacios en iOS, fix overlay
  tildado con safety timer 3s, dark mode rehecho, union Excursiones+Itinerario en Actividades,
  bottom nav bar, elimina Amsterdam del circuito.
2026-06-04 — (version HTML monolitica) EUR/USD siempre live, pie chart SVG interactivo,
  itinerario dia a dia, alertas EUR/USD, compras en EUR con conversion automatica.
2026-06-01 — (version HTML monolitica) Deploy inicial, login con auto-submit, apple touch icon,
  seccion Compras, resumen dividido en bloques.
