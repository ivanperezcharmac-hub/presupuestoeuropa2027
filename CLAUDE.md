# Europa 2027 - Presupuesto de Viaje

App web para planificar el viaje de Agustina e Ivan a Europa.

URL: https://ivanperezcharmac-hub.github.io/presupuestoeuropa2027
Codigo de acceso: 1201
Backend: Google Apps Script + Google Sheets
Apps Script: ver secrets del proyecto (no publicar en el repo)

---

## Circuito

Madrid -> Barcelona -> Roma -> Paris -> Londres -> Madrid
5 ciudades, 26 dias, 17 mar -> 11 abr 2027

Ciudades y fechas:
- Madrid: 17 mar - 22 mar (5 noches)
- Barcelona: 22 mar - 26 mar (4 noches)
- Roma: 26 mar - 31 mar (5 noches)
- Paris: 31 mar - 5 abr (5 noches)
- Londres: 5 abr - 11 abr (6 noches)

Vuelos internos: MAD->BCN, BCN->ROM, ROM->PAR, PAR->LON, LON->MAD

---

## Arquitectura

- Frontend: HTML/CSS/JS (un solo archivo index.html)
- Hosting: GitHub Pages
- Backend: Google Apps Script como API REST
- Storage: Google Sheets (JSON completo del estado en una fila)
- Sincronizacion: JSONP para GET, no-cors POST para guardar
- EUR/USD: 3 APIs en cascada (frankfurter.app -> open.er-api.com -> fawazahmed0), siempre live

---

## Secciones

- Resumen: total general, bloques base/destino, pie chart SVG interactivo, gasto por persona
- Vuelos: internacionales BUE-MAD y 5 vuelos internos Europa con Google Flights links
- Ciudades: fechas, hotel/noche, gastos diarios, subtotal automatico, control de dias
- Alojamientos: hasta 3 opciones por ciudad (A/B/C)
- Excursiones y Plan: tab excursiones (actividades con costo USD) + tab itinerario dia a dia
- Compras: 5 categorias, dividido Agus/Ivan, precios en EUR con conversion a USD automatica
- Alertas EUR/USD: tipo de cambio live, alertas por rango min/max, impacto en presupuesto
- Checklist pre-viaje: +35 items en 7 categorias con progreso
- Costos de referencia: datos 2025-2026 por ciudad sin alojamiento
- Personalizar: colores, tipografia, dark mode

---

## Features tecnicas

- Login: codigo 1201, auto-submit al 4to digito, fade-out animado
- Sync: debounce 1.2s, indicador Guardando/Sincronizado/Sin conexion
- Banner offline: aviso en rojo, re-sync automatico al volver la conexion
- EUR/USD: live desde 3 APIs, nunca usa valor guardado en Sheets
- Mobile: bottom nav bar (iPhone), drawer hamburger (tablet)
- Dark mode: paleta completa coherente, persistido en nube
- Apple touch icon: PNG para home screen iOS
- Pie chart: SVG interactivo con hover, sin librerias externas

---

## Como deployar

Claude hace el deploy automaticamente via API de GitHub:

1. Modificar /mnt/user-data/outputs/index.html
2. GET SHA actual del archivo en GitHub
3. PUT con contenido en base64 + SHA

GitHub Pages publica en ~1 minuto tras el commit.

---

## Historial de cambios

2026-06-14 - Dark mode rehecho con paleta correcta
2026-06-14 - Saca Extras, une Excursiones+Itinerario en Actividades
2026-06-14 - Bottom nav + dark mode + checklist pre-viaje
2026-06-14 - Saca Amsterdam: +1 dia Paris (5 abr) +2 dias Londres (5-11 abr)
2026-06-14 - Mobile responsive completo reescrito
2026-06-04 - EUR/USD siempre desde API, nunca del estado guardado
2026-06-04 - Fix EUR/USD: 3 APIs con fallback
2026-06-04 - Pie chart + Itinerario dia a dia + Alertas EUR/USD
2026-06-04 - Centrado general + borrar compras
2026-06-04 - Compras en EUR con conversion automatica a USD
2026-06-04 - Resumen centrado + desglose compras Agus/Ivan
2026-06-04 - EUR/USD tipo de cambio automatico
2026-06-04 - Sync feedback, offline banner, resumen x persona, tema guardado
2026-06-04 - Compras divididas en columnas Agus e Ivan
2026-06-01 - Apple touch icon PNG para iPhone home screen
2026-06-01 - Resumen dividido en base + destino
2026-06-01 - Agrega seccion Compras
2026-06-01 - Login autosubmit + seccion excursiones
2026-06-01 - Deploy inicial
