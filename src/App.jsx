import { useState, lazy, Suspense } from 'react';
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

const TITLES = {
  resumen:'Resumen del viaje',vuelos:'Vuelos',ciudades:'Ciudades y fechas',
  alojamientos:'Alojamientos',actividades:'Excursiones & Plan',
  compras:'Compras del viaje',alertas:'Alertas EUR/USD',
  checklist:'Checklist pre-viaje',costos:'Costos de referencia',estilo:'Personalizar',
};

const BOTTOM_NAV = [
  {id:'resumen',label:'Resumen',Icon:GridIcon},
  {id:'vuelos',label:'Vuelos',Icon:PlaneIcon},
  {id:'ciudades',label:'Ciudades',Icon:PinIcon},
  {id:'compras',label:'Compras',Icon:BagIcon},
  {id:'sidebar',label:'Más',Icon:MenuIcon},
];

function AppInner() {
  const {state,loading,syncStatus,eurUsd,setEurUsd} = useApp();
  const [authed,setAuthed] = useState(false);
  const [current,setCurrent] = useState('resumen');
  const [sidebarOpen,setSidebarOpen] = useState(false);

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
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4" style={{background:'var(--navy)'}}>
      <h1 className="font-display text-3xl" style={{color:'var(--goldl)'}}>✈ Europa 2027</h1>
      <div className="w-8 h-8 border-2 border-white/10 border-t-yellow-300 rounded-full animate-spin"/>
      <p className="text-xs" style={{color:'rgba(255,255,255,.4)'}}>Cargando datos sincronizados…</p>
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
      <div className="flex-1 lg:ml-56 pb-16 lg:pb-0">
        <div className="sticky top-0 z-50 flex items-center justify-between px-4 h-14" style={{background:'#fff',borderBottom:'1px solid var(--border,#ddd6c8)'}}>
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg" style={{border:'1px solid var(--border)'}} onClick={()=>setSidebarOpen(true)}>
              <MenuIcon/>
            </button>
            <div>
              <div className="font-medium text-sm">{TITLES[current]}</div>
              <div className="text-xs" style={{color:'var(--muted)'}}>Europa 2027 · Todo en USD</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{color:'var(--muted)'}}>
            <span>EUR/USD</span>
            <input type="number" step="0.01" min="0.5" max="3" value={eurUsd.toFixed(4)}
              onChange={e=>{const v=parseFloat(e.target.value);if(v>0)setEurUsd(v);}}
              className="w-16 text-center rounded-lg px-2 py-1 outline-none text-xs font-mono-dm"
              style={{border:'1.5px solid var(--border)',background:'var(--cream)'}}/>
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
          </Suspense>
        </div>
      </div>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 h-16" style={{background:'#fff',borderTop:'1px solid var(--border)'}}>
        {BOTTOM_NAV.map(({id,label,Icon})=>(
          <button key={id} onClick={()=>nav(id)} className="flex flex-col items-center justify-center gap-1 transition-colors"
            style={{color:current===id?'var(--navy)':'var(--lite,#9aa5b4)'}}>
            <Icon/><span className="text-xs font-medium">{label}</span>
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
