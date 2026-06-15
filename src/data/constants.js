export const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyg7rCq4693pRb7HjYFoocu-vA9g_1EVfiwdQ_q3pvzLeQ2BV7ZxTq3DxioAvuhRxFs/exec";
export const LOGIN_PASS = "1201";
export const LOGIN_KEY = "eu2027_auth";

export const CITIES = [
  { id: "madrid",    name: "Madrid",    country: "España",       flag: "🇪🇸", defIn: "2027-03-17", defOut: "2027-03-22" },
  { id: "barcelona", name: "Barcelona", country: "España",       flag: "🇪🇸", defIn: "2027-03-22", defOut: "2027-03-26" },
  { id: "roma",      name: "Roma",      country: "Italia",       flag: "🇮🇹", defIn: "2027-03-26", defOut: "2027-03-31" },
  { id: "paris",     name: "París",     country: "Francia",      flag: "🇫🇷", defIn: "2027-03-31", defOut: "2027-04-05" },
  { id: "londres",   name: "Londres",   country: "Reino Unido",  flag: "🇬🇧", defIn: "2027-04-05", defOut: "2027-04-11" },
];

export const INTL_FLIGHTS = [
  { id: "eze-mad", route: "Buenos Aires (EZE) → Madrid (MAD)", date: "17 mar 2027", note: "Aerolíneas Arg., Iberia, Air Europa", url: "https://www.google.com/travel/flights/search?tfs=CBwQAhoeEgoyMDI3LTAzLTE3agcIARIDRVpFcgcIARIDTUFEGh4SCjIwMjctMDQtMTFqBwgBEgNNQURyBwgBEgNFWkVIAXABggELCP___________wGYAQI" },
  { id: "mad-eze", route: "Madrid (MAD) → Buenos Aires (EZE)", date: "11 abr 2027", note: "Aerolíneas Arg., Iberia, Air Europa", url: "https://www.google.com/travel/flights/search?tfs=CBwQAhoeEgoyMDI3LTA0LTExagcIARIDTUFEcgcIARIDRVpFSAFwAQ" },
];

export const EURO_FLIGHTS = [
  { id: "mad-bcn", route: "Madrid → Barcelona",    date: "~22 mar", note: "Vueling, Iberia Express · ~1h15", url: "https://www.google.com/travel/flights/search?tfs=CBwQAhoeEgoyMDI3LTAzLTIyagcIARIDTUFEcgcIARIDQkNOSAFwAQ" },
  { id: "bcn-rom", route: "Barcelona → Roma (FCO)", date: "~26 mar", note: "Vueling, Ryanair · ~1h50",        url: "https://www.google.com/travel/flights/search?tfs=CBwQAhoeEgoyMDI3LTAzLTI2agcIARIEQkNOTnIHCAESA0ZDT0gBcAE" },
  { id: "rom-par", route: "Roma → París (CDG)",     date: "~31 mar", note: "Vueling, easyJet · ~2h10",        url: "https://www.google.com/travel/flights/search?tfs=CBwQAhoeEgoyMDI3LTAzLTMxagcIARIDRkNPcgcIARIDQ0RHSAFwAQ" },
  { id: "par-lon", route: "París → Londres (LHR)",  date: "~5 abr",  note: "easyJet, Vueling · ~1h20",        url: "https://www.google.com/travel/flights/search?tfs=CBwQAhoeEgoyMDI3LTA0LTA1agcIARIDQ0RHcgcIARIDTEhSSAFwAQ" },
  { id: "lon-mad", route: "Londres → Madrid",       date: "~10 abr", note: "Vueling, Iberia, Ryanair · ~2h30", url: "https://www.google.com/travel/flights/search?tfs=CBwQAhoeEgoyMDI3LTA0LTEwagcIARIDTEhScgcIARIDTUFESAFwAQ" },
];

export const COMPRAS_CATS = [
  { id: "ropa",      ic: "👗", label: "Ropa & Calzado",     suggestions: ["Zapatillas Nike/Adidas", "Zara", "H&M", "Mango", "Abrigo"] },
  { id: "tech",      ic: "💻", label: "Tecnología",          suggestions: ["AirPods", "Cargador MagSafe", "Accesorios iPhone", "Kindle"] },
  { id: "souvenirs", ic: "🧸", label: "Souvenirs & Regalos", suggestions: ["Imanes", "Llaveros", "Postal", "Artesanías locales"] },
  { id: "belleza",   ic: "💄", label: "Belleza & Perfumes",  suggestions: ["Perfume duty free", "Cremas", "Maquillaje"] },
  { id: "otros",     ic: "📦", label: "Otros",               suggestions: ["Libros", "Vinos / licores", "Comida local"] },
];

export const EXCURSION_CITIES = [
  { id: "madrid",    name: "Madrid",    flag: "🇪🇸", suggestions: ["Museo del Prado", "Reina Sofía", "Palacio Real", "Tour flamenco", "Bernabéu"] },
  { id: "barcelona", name: "Barcelona", flag: "🇪🇸", suggestions: ["Sagrada Família", "Park Güell", "Camp Nou", "Montjuïc", "Tour Gótico"] },
  { id: "roma",      name: "Roma",      flag: "🇮🇹", suggestions: ["Coliseo + Foro Romano", "Museos Vaticanos", "Galería Borghese", "Trastevere"] },
  { id: "paris",     name: "París",     flag: "🇫🇷", suggestions: ["Torre Eiffel", "Louvre", "Versalles", "Crucero Sena", "Moulin Rouge"] },
  { id: "londres",   name: "Londres",   flag: "🇬🇧", suggestions: ["Tower of London", "Harry Potter Studio", "London Eye", "Kensington"] },
];

export const CHECKLIST_GROUPS = [
  { cat: "📄 Documentación", items: ["Pasaportes vigentes (+6 meses)", "Fotocopias de pasaportes", "Visas (UK necesita ETA)", "Seguro de viaje contratado"] },
  { cat: "✈️ Vuelos", items: ["Vuelo BUE→MAD confirmado", "Vuelos internos reservados", "Check-in online hecho", "Apps de aerolíneas descargadas"] },
  { cat: "🛏 Alojamientos", items: ["Madrid confirmado", "Barcelona confirmado", "Roma confirmado", "París confirmado", "Londres confirmado"] },
  { cat: "💳 Finanzas", items: ["Tarjetas avisadas al banco", "Efectivo EUR para primeros días", "Wise o similar cargado", "Límites de tarjeta revisados"] },
  { cat: "📱 Tecnología", items: ["Plan de datos internacional", "Adaptador de enchufes europeo", "Power bank cargado", "Mapas offline descargados"] },
  { cat: "🎒 Equipaje", items: ["Valijas dentro del límite de peso", "Medicamentos básicos", "Ropa de abrigo (marzo-abril fresco)", "Candados para valijas"] },
  { cat: "🏛 Reservas", items: ["Coliseo reservado online", "Museos Vaticanos reservados", "Sagrada Família reservada", "Torre Eiffel (si suben)"] },
];

export const COSTS_DATA = [
  { city: "Madrid", flag: "🇪🇸", country: "España", rows: [
    { l: "Comidas (3/día)", v: "$35–60" }, { l: "Transporte urbano", v: "$8–14" },
    { l: "Museos / actividades", v: "$10–25" }, { l: "TOTAL sin alojamiento", v: "$61–117", hi: true }
  ], tip: "Menú del día (~$14): 3 platos + bebida. Prado y Reina Sofía: entrada gratuita domingos 17h." },
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
];
