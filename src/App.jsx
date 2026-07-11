import { useState, lazy, Suspense, useEffect, useRef } from 'react';
import { AppProvider, useApp, f$ } from './context/AppContext';
import { CITIES, INTL_FLIGHTS, EURO_FLIGHTS, COMPRAS_CATS, EXCURSION_CITIES } from './data/constants';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import Resumen from './components/Resumen';
import CurrencyConverter from './components/CurrencyConverter';

const Vuelos = lazy(() => import('./components/Vuelos'));
const Ciudades = lazy(() => import('./components/Ciudades'));
const Alojamientos = lazy(() => import('./components/Alojamientos'));
const Actividades = lazy(() => import('./components/Actividades'));
const Compras = lazy(() => import('./components/Compras'));
const Alertas = lazy(() => import('./components/Alertas'));
const Checklist = lazy(() => import('./components/Checklist'));
const Costos = lazy(() => import('./components/Costos'));
const Estilo = lazy(() => import('./components/Estilo'));
const Talles = lazy(() => import('./components/Talles'));
const Emergencias = lazy(() => import('./components/Emergencias'));
const Permisos = lazy(() => import('./components/Permisos'));

const TITLES = {
  resumen:'Resumen del viaje',vuelos:'Vuelos',ciudades:'Ciudades y fechas',
  alojamientos:'Alojamientos',actividades:'Excursiones & Plan',
  compras:'Compras del viaje',alertas:'Alertas EUR/USD',
  checklist:'Checklist pre-viaje',costos:'Costos de referencia',estilo:'Personalizar',
  talles:'Conversor de talles',emergencias:'Emergencias',permisos:'Permisos de viaje',
};

const BOTTOM_NAV = [
  {id:'resumen',label:'Resumen',Icon:GridIcon},
  {id:'vuelos',label:'Vuelos',Icon:PlaneIcon},
  {id:'ciudades',label:'Ciudades',Icon:PinIcon},
  {id:'compras',label:'Compras',Icon:BagIcon},
  {id:'sidebar',label:'Más',Icon:MenuIcon},
];

const SECTIONS = ['resumen','vuelos','ciudades','alojamientos','actividades','compras','alertas','checklist','costos','talles','emergencias','permisos','estilo'];

function AppInner() {
  const {state,loading,syncStatus,eurUsd,setEurUsd} = useApp();
  const [authed,setAuthed] = useState(false);
  const [current,setCurrent] = useState('resumen');
  const [sidebarOpen,setSidebarOpen] = useState(false);

  const touchStartX = useRef(null);

  const isReadOnly = new URLSearchParams(window.location.search).get('ver') === '1';

  useEffect(() => {
    function onTouchStart(e) {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') { touchStartX.current = null; return; }
      touchStartX.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    function onTouchEnd(e) {
      if (touchStartX.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current.x;
      const dy = e.changedTouches[0].clientY - touchStartX.current.y;
      touchStartX.current = null;
      if (Math.abs(dx) < 80) return;            // threshold más alto
      if (Math.abs(dx) < Math.abs(dy) * 2) return; // debe ser claramente horizontal
      if (sidebarOpen) return;
      const idx = SECTIONS.indexOf(current);
      if (dx < 0 && idx < SECTIONS.length - 1) setCurrent(SECTIONS[idx + 1]);
      if (dx > 0 && idx > 0) setCurrent(SECTIONS[idx - 1]);
    }
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [current, sidebarOpen]);

  const total = (() => {
    if(!state) return '$0';
    const intlT = INTL_FLIGHTS.reduce((s,f)=>s+(parseFloat(state.prices?.[f.id])||0),0);
    const euT = EURO_FLIGHTS.reduce((s,f)=>s+(parseFloat(state.prices?.[f.id])||0),0);
    let alojT=0,gastoT=0;
    CITIES.forEach(c=>{
      const days=Math.max(0,Math.round((new Date(state.cities?.[c.id]?.checkOut)-new Date(state.cities?.[c.id]?.checkIn))/864e5));
      alojT+=days*(parseFloat(state.cities?.[c.id]?.hotel)||0);
      gastoT+=days*(parseFloat(state.cities?.[c.id]?.daily)||0);
    });
    const excT=EXCURSION_CITIES.reduce((s,city)=>s+(state.excursiones?.[city.id]||[]).reduce((ss,it)=>ss+(parseFloat(it.cost)||0),0),0);
    const comprasT=COMPRAS_CATS.reduce((s,cat)=>s+['agus','ivan'].reduce((sp,p)=>sp+(state.compras?.[`${cat.id}_${p}`]||[]).reduce((ss,it)=>ss+(parseFloat(it.cost)||0),0),0),0)*eurUsd;
    return f$(intlT+euT+alojT+gastoT+excT+comprasT);
  })();

  if(loading) return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6" style={{background:'var(--navy)'}}>
      <h1 className="font-display text-3xl" style={{color:'var(--goldl)'}}>Europa 2027</h1>
      <div style={{position:'relative',width:120,height:40}}>
        {/* Estela de puntos */}
        {[0,1,2,3,4].map(i=>(
          <div key={i} style={{
            position:'absolute',
            top:'50%',
            left: 8 + i*18,
            width:6,
            height:6,
            borderRadius:'50%',
            background:'rgba(201,168,76,0.5)',
            transform:'translateY(-50%)',
            animation:`fade-dot 1.4s ease-in-out ${i*0.15}s infinite`,
          }}/>
        ))}
        {/* Avión */}
        <div style={{
          position:'absolute',
          right:0,
          top:'50%',
          transform:'translateY(-50%)',
          animation:'plane-float 1.4s ease-in-out infinite',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--goldl,#E8B86D)" strokeWidth="1.5">
            <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
        </div>
      </div>
      <p className="text-xs" style={{color:'rgba(255,255,255,.4)'}}>Cargando datos sincronizados…</p>
      <style>{`
        @keyframes plane-float {
          0%,100%{transform:translateY(-50%) rotate(-2deg);}
          50%{transform:translateY(calc(-50% - 5px)) rotate(2deg);}
        }
        @keyframes fade-dot {
          0%,100%{opacity:0.2;}
          50%{opacity:1;}
        }
      `}</style>
    </div>
  );

  if(isReadOnly) return (
    <div className="min-h-screen" style={{background:'var(--bg,#F4F6F8)'}}>
      <div className="topbar-safe sticky top-0 z-50 flex items-center justify-between px-4 h-14" style={{background:'var(--surface)',borderBottom:'1px solid var(--border)'}}>
        <div className="font-display font-bold text-sm" style={{color:'var(--txt)'}}>✈ Europa 2027</div>
        <div className="text-xs" style={{color:'var(--muted)'}}>Solo lectura</div>
      </div>
      <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto">
        <Resumen/>
      </div>
    </div>
  );

  if(!authed) return <LoginScreen onLogin={()=>setAuthed(true)}/>;

  function nav(id){
    if(id==='sidebar'){setSidebarOpen(true);return;}
    setCurrent(id);setSidebarOpen(false);
  }

  return (
    <div className="flex min-h-screen">
      {sidebarOpen && <Sidebar current={current} onNav={nav} total={total} syncStatus={syncStatus} onClose={()=>setSidebarOpen(false)}/>}
      <div className="hidden lg:block">
        <Sidebar current={current} onNav={nav} total={total} syncStatus={syncStatus} onClose={()=>{}}/>
      </div>
      <div className="flex-1 lg:ml-56 content-scroll">
        <div className="topbar-safe sticky top-0 z-50 flex items-center justify-between px-4 h-14"
          style={{background:'var(--surface)',borderBottom:'1px solid var(--border)',boxShadow:'0 1px 0 var(--border)'}}>
          <div className="flex items-center gap-3">
            <button className="lg:hidden flex items-center justify-center rounded-xl transition-colors"
              style={{width:36,height:36,border:'1.5px solid var(--border)',background:'var(--surface2)'}}
              onClick={()=>setSidebarOpen(true)}>
              <MenuIcon/>
            </button>
            <div>
              <div className="font-semibold text-sm" style={{color:'var(--txt)'}}>{TITLES[current]}</div>
              <div className="text-xs" style={{color:'var(--txt3)',fontFamily:'DM Mono, monospace',fontSize:10}}>
                {current==='resumen' ? '17 MAR → 11 ABR · BCN · ROM · PAR · LON · MAD' : 'Europa 2027 · USD'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono-dm" style={{color:'var(--txt3)'}}>EUR/USD</span>
            <input type="number" step="0.01" min="0.5" max="3" value={eurUsd.toFixed(4)}
              onChange={e=>{const v=parseFloat(e.target.value);if(v>0)setEurUsd(v);}}
              className="font-mono-dm text-center outline-none rounded-lg px-2 py-1 text-xs"
              style={{border:'1.5px solid var(--border2)',background:'var(--surface2)',color:'var(--txt)',width:72}}/>
          </div>
        </div>
        <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto">
          <Suspense fallback={<div className="text-center py-12 text-sm" style={{color:'var(--muted)'}}>Cargando…</div>}>
            {current==='resumen'      && <Resumen/>}
            {current==='vuelos'       && <Vuelos/>}
            {current==='ciudades'     && <Ciudades/>}
            {current==='alojamientos' && <Alojamientos/>}
            {current==='actividades'  && <Actividades/>}
            {current==='compras'      && <Compras/>}
            {current==='alertas'      && <Alertas/>}
            {current==='checklist'    && <Checklist/>}
            {current==='costos'       && <Costos/>}
            {current==='estilo'       && <Estilo/>}
            {current==='talles'       && <Talles/>}
            {current==='emergencias'  && <Emergencias/>}
            {current==='permisos'     && <Permisos/>}
          </Suspense>
        </div>
      </div>
      <div className="bottom-nav fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5"
        style={{background:'var(--surface)',borderTop:'1px solid var(--border)'}}>
        {BOTTOM_NAV.map(({id,label,Icon})=>(
          <button key={id} onClick={()=>nav(id)}
            className="flex flex-col items-center justify-center gap-0.5 transition-colors"
            style={{height:56,color:current===id?'var(--blue)':'var(--txt3)',background:'none',border:'none',cursor:'pointer'}}>
            <Icon/><span style={{fontSize:10,fontWeight:current===id?600:400}}>{label}</span>
          </button>
        ))}
      </div>
      <CurrencyConverter />
    </div>
  );
}

function GridIcon(){return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;}
function PlaneIcon(){return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>;}
function PinIcon(){return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>;}
function BagIcon(){return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;}
function MenuIcon(){return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;}

export default function App(){
  return <AppProvider><AppInner/></AppProvider>;
}
