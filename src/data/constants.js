export const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyg7rCq4693pRb7HjYFoocu-vA9g_1EVfiwdQ_q3pvzLeQ2BV7ZxTq3DxioAvuhRxFs/exec";
export const LOGIN_PASS = "1201";
export const LOGIN_KEY = "eu2027_auth";

export const CITIES = [
  { id: "barcelona", name: "Barcelona", country: "España",      flag: "🇪🇸", defIn: "2027-03-17", defOut: "2027-03-22" },
  { id: "roma",      name: "Roma",      country: "Italia",      flag: "🇮🇹", defIn: "2027-03-22", defOut: "2027-03-27" },
  { id: "paris",     name: "París",     country: "Francia",     flag: "🇫🇷", defIn: "2027-03-27", defOut: "2027-04-01" },
  { id: "londres",   name: "Londres",   country: "Reino Unido", flag: "🇬🇧", defIn: "2027-04-01", defOut: "2027-04-06" },
  { id: "madrid",    name: "Madrid",    country: "España",      flag: "🇪🇸", defIn: "2027-04-06", defOut: "2027-04-11" },
];

export const INTL_FLIGHTS = [
  {
    id: "eze-bcn", route: "Buenos Aires (EZE) → Barcelona (BCN)",
    from: "EZE", to: "BCN", defDate: "2027-03-17",
    note: "Aerolíneas Arg., Iberia, Air Europa",
    durationMin: 810, tzFrom: -3, tzTo: 2,
    arrivesCity: "barcelona",
  },
  {
    id: "mad-eze", route: "Madrid (MAD) → Buenos Aires (EZE)",
    from: "MAD", to: "EZE", defDate: "2027-04-11",
    note: "Aerolíneas Arg., Iberia, Air Europa",
    durationMin: 780, tzFrom: 2, tzTo: -3,
    departsCity: "madrid",
  },
];

export const EURO_FLIGHTS = [
  {
    id: "bcn-rom", route: "Barcelona → Roma (FCO)",
    from: "BCN", to: "FCO", defDate: "2027-03-22",
    note: "Vueling, Ryanair",
    durationMin: 110, tzFrom: 2, tzTo: 2,
    departsCity: "barcelona", arrivesCity: "roma",
  },
  {
    id: "rom-par", route: "Roma → París (CDG)",
    from: "FCO", to: "CDG", defDate: "2027-03-27",
    note: "Vueling, easyJet",
    durationMin: 130, tzFrom: 2, tzTo: 2,
    departsCity: "roma", arrivesCity: "paris",
  },
  {
    id: "par-lon", route: "París → Londres (LHR)",
    from: "CDG", to: "LHR", defDate: "2027-04-01",
    note: "easyJet, Vueling",
    durationMin: 80, tzFrom: 2, tzTo: 1,
    departsCity: "paris", arrivesCity: "londres",
  },
  {
    id: "lon-mad", route: "Londres → Madrid",
    from: "LHR", to: "MAD", defDate: "2027-04-06",
    note: "Vueling, Iberia, Ryanair",
    durationMin: 150, tzFrom: 1, tzTo: 2,
    departsCity: "londres", arrivesCity: "madrid",
  },
];

export const COMPRAS_CATS = [
  { id: "ropa",      ic: "👗", label: "Ropa & Calzado",     suggestions: ["Zapatillas Nike/Adidas", "Zara", "H&M", "Mango", "Abrigo"] },
  { id: "tech",      ic: "💻", label: "Tecnología",          suggestions: ["AirPods", "Cargador MagSafe", "Accesorios iPhone", "Kindle"] },
  { id: "souvenirs", ic: "🧸", label: "Souvenirs & Regalos", suggestions: ["Imanes", "Llaveros", "Postal", "Artesanías locales"] },
  { id: "belleza",   ic: "💄", label: "Belleza & Perfumes",  suggestions: ["Perfume duty free", "Cremas", "Maquillaje"] },
  { id: "otros",     ic: "📦", label: "Otros",               suggestions: ["Libros", "Vinos / licores", "Comida local"] },
];

export const EXCURSION_CITIES = [
  { id: "barcelona", name: "Barcelona", flag: "🇪🇸", suggestions: ["Sagrada Família", "Park Güell", "Camp Nou", "Montjuïc", "Tour Gótico"] },
  { id: "roma",      name: "Roma",      flag: "🇮🇹", suggestions: ["Coliseo + Foro Romano", "Museos Vaticanos", "Galería Borghese", "Trastevere"] },
  { id: "paris",     name: "París",     flag: "🇫🇷", suggestions: ["Torre Eiffel", "Louvre", "Versalles", "Crucero Sena", "Moulin Rouge"] },
  { id: "londres",   name: "Londres",   flag: "🇬🇧", suggestions: ["Tower of London", "Harry Potter Studio", "London Eye", "Kensington"] },
  { id: "madrid",    name: "Madrid",    flag: "🇪🇸", suggestions: ["Museo del Prado", "Reina Sofía", "Palacio Real", "Tour flamenco", "Bernabéu"] },
];

export const CHECKLIST_GROUPS = [
  { cat: "📄 Documentación", items: ["Pasaportes vigentes (+6 meses)", "Fotocopias de pasaportes", "ETIAS de Agus tramitado (€20, abre fines 2026)", "UK ETA de Agus tramitado (£20)", "UK ETA de Ivan tramitado (£20)", "Seguro de viaje contratado"] },
  { cat: "✈️ Vuelos", items: ["Vuelo BUE→BCN confirmado", "Vuelos internos reservados", "Check-in online hecho", "Apps de aerolíneas descargadas"] },
  { cat: "🛏 Alojamientos", items: ["Barcelona confirmado", "Roma confirmado", "París confirmado", "Londres confirmado", "Madrid confirmado"] },
  { cat: "💳 Finanzas", items: ["Tarjetas avisadas al banco", "Efectivo EUR para primeros días", "Wise o similar cargado", "Límites de tarjeta revisados"] },
  { cat: "📱 Tecnología", items: ["Plan de datos internacional", "Adaptador de enchufes europeo", "Power bank cargado", "Mapas offline descargados"] },
  { cat: "🎒 Equipaje", items: ["Valijas dentro del límite de peso", "Medicamentos básicos", "Ropa de abrigo (marzo-abril fresco)", "Candados para valijas"] },
  { cat: "🏛 Reservas", items: ["Coliseo reservado online", "Museos Vaticanos reservados", "Sagrada Família reservada", "Torre Eiffel (si suben)"] },
];

export const COSTS_DATA = [
  { city: "Barcelona", flag: "🇪🇸", country: "España", rows: [
    { l: "Comidas (3/día)", v: "$40–70" }, { l: "Transporte", v: "$10–18" },
    { l: "Museos / actividades", v: "$15–35" }, { l: "TOTAL sin alojamiento", v: "$75–143", hi: true }
  ], tip: "Sagrada Família y Park Güell requieren reserva online. Tasa turística ~$8–15/noche." },
  { city: "Roma", flag: "🇮🇹", country: "Italia", rows: [
    { l: "Comidas (3/día)", v: "$42–72" }, { l: "Transporte", v: "$8–14" },
    { l: "Museos / actividades", v: "$20–45" }, { l: "TOTAL sin alojamiento", v: "$80–149", hi: true }
  ], tip: "Coliseo ~$22, Vaticano ~$22. Reservar con 2–3 semanas de anticipación." },
  { city: "París", flag: "🇫🇷", country: "Francia", rows: [
    { l: "Comidas (3/día)", v: "$52–90" }, { l: "Transporte (Navigo)", v: "$8–20" },
    { l: "Museos / actividades", v: "$20–45" }, { l: "TOTAL sin alojamiento", v: "$94–181", hi: true }
  ], tip: "Navigo Semana (~$34): transporte ilimitado. Louvre gratis primer domingo de mes." },
  { city: "Londres", flag: "🇬🇧", country: "Reino Unido", rows: [
    { l: "Comidas (3/día)", v: "$55–100" }, { l: "Transporte (Oyster)", v: "$14–22" },
    { l: "Museos / actividades", v: "$18–40" }, { l: "TOTAL sin alojamiento", v: "$101–190", hi: true }
  ], tip: "British Museum, National Gallery y Tate Modern son gratuitos. Oyster Card para el metro." },
  { city: "Madrid", flag: "🇪🇸", country: "España", rows: [
    { l: "Comidas (3/día)", v: "$35–60" }, { l: "Transporte urbano", v: "$8–14" },
    { l: "Museos / actividades", v: "$10–25" }, { l: "TOTAL sin alojamiento", v: "$61–117", hi: true }
  ], tip: "Menú del día (~$14): 3 platos + bebida. Prado y Reina Sofía: entrada gratuita domingos 17h." },
];
