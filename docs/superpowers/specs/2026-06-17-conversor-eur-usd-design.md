# Conversor rápido EUR↔USD — Spec

**Fecha:** 2026-06-17  
**Feature:** Widget flotante de conversión EUR↔USD accesible desde cualquier sección de la app.

---

## Objetivo

Permitir convertir montos entre EUR y USD en tiempo real sin salir de la sección actual, usando el tipo de cambio ya disponible en AppContext.

---

## Arquitectura

### Componente nuevo: `CurrencyConverter.jsx`

Widget autocontenido en `src/components/CurrencyConverter.jsx`. Recibe el tipo de cambio vía prop (no lo fetcha — lo consume de AppContext igual que el resto de la app).

**Props:**
- `eurUsd` — número flotante, tasa EUR→USD (ej: `1.082`). Viene de `AppContext.eurUsd`.
- `eurUsdUpdatedAt` — timestamp del último fetch exitoso. Requiere agregar este estado a AppContext junto al `setEurUsd` existente.

### Integración en `App.jsx`

Se monta una sola vez en el shell de `App.jsx`, fuera del área de contenido de secciones, para que persista al navegar. Se posiciona con CSS `position: fixed`.

---

## UI / UX

### FAB (botón flotante)

- Posición: `fixed`, `bottom: 80px` en mobile (bottom nav es `h-16` = 64px + 16px margen), `right: 16px`
- En desktop: `bottom: 24px`, `right: 24px` — usando clases Tailwind `bottom-20 lg:bottom-6`
- Tamaño: 46×46px, `border-radius: 50%`
- Ícono: texto `€$`, fondo `--blue` (#1B4FD8) cuando cerrado
- Al abrirse: fondo `--navy` (#0B1F3A) con ✕

### Panel

- Aparece sobre el FAB: `position: fixed`, `bottom: 136px` en mobile / `bottom: 80px` en desktop, `right: 16px`
- Ancho: 230px, `border-radius: 16px`, `box-shadow` pronunciada
- Contenido:
  - Header: label "Conversor" + tasa actual `"1 EUR = X.XX USD"`
  - Input EUR 🇪🇺 con borde `--blue` cuando tiene foco
  - Separador ⇅ en color `--gold`
  - Input USD 🇺🇸
  - Footer: `"Tasa live · actualizada hace N min"`

### Interacción

- Toca FAB → abre panel (toggle)
- Toca fuera del panel → cierra
- Escribís en EUR → USD se recalcula (`valor × rate`)
- Escribís en USD → EUR se recalcula (`valor / rate`)
- Solo números y punto decimal permitidos en los inputs
- Al abrir: foco automático en el campo EUR, valor vacío

---

## Estado local (dentro del componente)

```js
const [open, setOpen]       = useState(false)
const [eurVal, setEurVal]   = useState('')
const [usdVal, setUsdVal]   = useState('')
const [lastEdited, setLastEdited] = useState('eur') // para recalcular si cambia la tasa
```

Cuando `eurUsd` cambia (nueva cotización): si `lastEdited === 'eur'` y `eurVal` no está vacío, recalcula `usdVal`. Viceversa para USD.

---

## Tipo de cambio

- Se consume desde `AppContext` — el mismo `eurUsd` que usa `Alertas.jsx`
- No se hace ningún fetch adicional
- `eurUsdUpdatedAt` (nuevo estado en AppContext, se setea junto a `setEurUsd`) se formatea como "hace N min" con `date-fns/formatDistanceToNow`

---

## Cierre al tocar fuera

Handler `mousedown`/`touchstart` en `document`. Si el evento no viene del panel ni del FAB, llama `setOpen(false)`. Se registra con `useEffect` cuando `open === true` y se limpia al cerrar.

---

## Posicionamiento mobile

El bottom nav en mobile tiene `height: 56px` aprox. El FAB se posiciona a `bottom: 72px` para quedar siempre visible sobre él. En desktop no hay bottom nav, baja a `bottom: 24px`.

Se detecta con clases Tailwind: `bottom-20 lg:bottom-6` en el FAB, `bottom-[136px] lg:bottom-[80px]` en el panel. No existe prop `isMobile` — la app usa responsive CSS puro.

---

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/components/CurrencyConverter.jsx` | Nuevo componente |
| `src/context/AppContext.jsx` | Agregar estado `eurUsdUpdatedAt` (Date), setearlo junto a `eurUsd` en el fetch exitoso |
| `src/App.jsx` | Montar `<CurrencyConverter>` en el shell, pasarle `eurUsd` y `eurUsdUpdatedAt` desde AppContext |

---

## Fuera de scope

- Historial de conversiones
- Otras monedas (ARS, GBP, etc.)
- Persistir el último valor ingresado entre sesiones
