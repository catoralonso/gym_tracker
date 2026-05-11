import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const DAYS = {
  1: { name: "Heavy Chest + Back + Arms",
    warmup: [
      { label: "5 min bike o remo",              timer: 300 },
      { label: "Shoulder circles + band pull-aparts" },
      { label: "2 series ligeras de bench" },
      { label: "Deep squat hold 30 seg",         timer: 30  },
    ],
    exercises: [
    { id:"bench_press",   name:"Bench Press",               sets:4, reps:"4-6/6-10", weight:42.5, rest:150, note:"1 top set @50kg · 3 backoff @42.5kg", next:"52.5/45kg", w4:"55/47.5kg" },
    { id:"pullups",       name:"Pull Ups Asistidas",        sets:4, reps:"6-10",     weight:25,   rest:120, note:"25kg asistencia",                     next:"20kg asist", w4:"15kg asist", isAssist:true },
    { id:"incline_db1",   name:"Incline DB Press",          sets:3, reps:"8-10",     weight:14,   rest:90,  next:"16kg",    w4:"16-18kg" },
    { id:"cable_row",     name:"Remo Sentado",               sets:4, reps:"8",        weight:45,   rest:90,  next:"50kg",    w4:"55kg" },
    { id:"ez_curl",       name:"Bar EZ Curl",                sets:3, reps:"10",       weight:25,   rest:60,  next:"27.5kg",  w4:"30kg" },
    { id:"triceps_push",  name:"Triceps Pushdown",           sets:3, reps:"12",       weight:50,   rest:60,  next:"55kg",    w4:"60kg" },
    { id:"pec_fly1",      name:"Pec Fly",                    sets:3, reps:"12-15",    weight:45,   rest:45,  next:"50kg",    w4:"50-55kg" },
  ]},
  2: { name: "Shoulders + Arms + Legs",
    warmup: [
      { label: "5 min bike",       timer: 300 },
      { label: "Hip mobility" },
      { label: "Shoulder mobility" },
    ],
    exercises: [
    { id:"shoulder_press",name:"Seated DB Shoulder Press",  sets:4, reps:"8-10",    weight:14, rest:120, next:"16kg",    w4:"18kg" },
    { id:"lateral_raise", name:"Lateral Raises",            sets:4, reps:"15",      weight:8,  rest:45,  next:"9-10kg",  w4:"10-12kg" },
    { id:"rear_delt",     name:"Rear Delt Fly",             sets:3, reps:"15",      weight:9,  rest:45,  next:"10-12kg", w4:"12-14kg" },
    { id:"leg_press",     name:"Leg Press",                 sets:3, reps:"10",      weight:90, rest:90,  next:"100kg",   w4:"110-120kg" },
    { id:"leg_curl",      name:"Leg Curl",                  sets:3, reps:"12",      weight:30, rest:60,  next:"35kg",    w4:"40kg" },
    { id:"hammer_curl",   name:"Hammer Curl",               sets:3, reps:"12",      weight:9,  rest:60,  next:"10-12kg", w4:"12-14kg" },
    { id:"curl_3t",       name:"Curl 3 Tiempos",            sets:3, reps:"tempo",   weight:8,  rest:45,  next:"9-10kg",  w4:"10-12kg" },
    { id:"calf_raise",    name:"Standing Calf Raise",       sets:3, reps:"15",      weight:45, rest:45,  next:"50-55kg", w4:"60kg" },
  ]},
  3: { name: "Chest Pump + Back + Arms",
    warmup: [
      { label: "5 min incline walk / bike / row", timer: 300 },
      { label: "Band pull-aparts ×20" },
      { label: "Shoulder circles" },
      { label: "Light chest stretch" },
      { label: "2 warm-up sets incline press" },
      { label: "Hanging bar 20-30 seg",           timer: 25  },
    ],
    exercises: [
    { id:"incline_db3",   name:"Incline Bench (mancuernas)",sets:4, reps:"10",      weight:15, rest:120, next:"17.5kg",  w4:"20kg" },
    { id:"chest_machine", name:"Chest Press Machine",       sets:3, reps:"12",      weight:45, rest:75,  next:"50kg",    w4:"55-60kg" },
    { id:"lat_pulldown",  name:"Lat Pulldown",              sets:3, reps:"10",      weight:55, rest:75,  next:"60kg",    w4:"65-70kg" },
    { id:"remo_uni",      name:"Remo Unilateral",           sets:4, reps:"10",      weight:14, rest:75,  next:"16-18kg", w4:"20kg" },
    { id:"incline_curl",  name:"Incline DB Curl",           sets:3, reps:"12",      weight:16, rest:60,  next:"18kg",    w4:"18-20kg" },
    { id:"fly_inv",       name:"Fly Invertido",             sets:3, reps:"12-15",   weight:45, rest:52,  next:"50kg",    w4:"50-55kg" },
    { id:"fly_pecho",     name:"Fly Pecho",                 sets:3, reps:"12-15",   weight:45, rest:52,  next:"50kg",    w4:"50-55kg" },
    { id:"dips_asist",    name:"Dips Asistidos",            sets:3, reps:"10-12",   weight:25, rest:75,  note:"25kg asistencia", next:"20kg asist", w4:"10-15kg asist", isAssist:true },
    { id:"face_pull",     name:"Face Pull",                 sets:3, reps:"20",      weight:0,  rest:40,  note:"Control total, ligero", next:"+5kg", w4:"moderado" },
  ]}
};

const ALL_EX = Object.values(DAYS).flatMap(d => d.exercises);

const METRICS = [
  { id:"peso",        label:"Peso",        unit:"kg", icon:"⚖️" },
  { id:"grasa",       label:"% Grasa",     unit:"%",  icon:"📊" },
  { id:"pecho",       label:"Pecho",       unit:"cm", icon:"📐" },
  { id:"hombros",     label:"Hombros",     unit:"cm", icon:"📐" },
  { id:"cintura",     label:"Cintura",     unit:"cm", icon:"📐" },
  { id:"biceps",      label:"Bíceps",      unit:"cm", icon:"💪" },
  { id:"muslo",       label:"Muslo",       unit:"cm", icon:"📐" },
  { id:"pantorrilla", label:"Pantorrilla", unit:"cm", icon:"📐" },
];

const fmtTime = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
const fmtDate = iso => new Date(iso).toLocaleDateString("es-ES",{day:"numeric",month:"short"});
const fmtDur  = s => s>=3600?`${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}min`:`${Math.floor(s/60)}min`;
const fmtHour = iso => new Date(iso).toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"});

const C = {
  bg:        "#0d0d0d",
  surface:   "#161616",
  surface2:  "#1e1e1e",
  border:    "#2a2a2a",
  borderHi:  "#3a3a3a",
  text:      "#f0f0f0",
  muted:     "#777",
  orange:    "#f97316",
  orangeHi:  "#fb923c",
  orangeDim: "#7c3100",
  green:     "#22c55e",
  greenDim:  "#166534",
  red:       "#ef4444",
  redDim:    "#7f1d1d",
  yellow:    "#fbbf24",
};

const card  = { background:C.surface,  border:`1px solid ${C.border}`,  borderRadius:12, padding:"14px 18px" };
const card2 = { background:C.surface2, border:`1px solid ${C.border}`,  borderRadius:10, padding:"12px 16px" };

export default function GymTracker() {
  const [view,        setView]        = useState("home");
  const [sessions,    setSessions]    = useState([]);
  const [wDay,        setWDay]        = useState(null);
  const [activeExId,  setActiveExId]  = useState(null);
  const [setIdx,      setSetIdx]      = useState(0);
  const [curSets,     setCurSets]     = useState([]);
  const [sessLogs,    setSessLogs]    = useState([]);
  const [inputW,      setInputW]      = useState("");
  const [inputR,      setInputR]      = useState("");
  const [resting,     setResting]     = useState(false);
  const [restLeft,    setRestLeft]    = useState(0);
  const [restTotal,   setRestTotal]   = useState(0);
  const [skipped,     setSkipped]     = useState(false);
  const [wStart,      setWStart]      = useState(null);
  const [done,        setDone]        = useState(null);
  const [selEx,       setSelEx]       = useState("bench_press");
  const [expanded,    setExpanded]    = useState(null);
  const [wuChecked,   setWuChecked]   = useState(new Set());
  const [wuTimerLeft, setWuTimerLeft] = useState(0);
  const [wuTimerIdx,  setWuTimerIdx]  = useState(null);
  const [bodyMetrics, setBodyMetrics] = useState([]);
  const [metricForm,  setMetricForm]  = useState({});
  const [selMetric,   setSelMetric]   = useState("peso");
  const [winW,        setWinW]        = useState(window.innerWidth);
  const timer    = useRef(null);
  const wuTimer  = useRef(null);
  const tickRef  = useRef(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    try { const r = localStorage.getItem("gym"); if(r) setSessions(JSON.parse(r)); } catch(e){}
    try { const r = localStorage.getItem("gym-metrics"); if(r) setBodyMetrics(JSON.parse(r)); } catch(e){}
    const onResize = () => setWinW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const save        = s => { setSessions(s);    try { localStorage.setItem("gym",         JSON.stringify(s)); } catch(e){} };
  const saveMetrics = m => { setBodyMetrics(m); try { localStorage.setItem("gym-metrics", JSON.stringify(m)); } catch(e){} };

  const lastW = (day, id, def) => {
    const ds = sessions.filter(s=>s.day===day);
    if (!ds.length) return String(def);
    const ex = ds[ds.length-1].exercises?.find(e=>e.id===id);
    return ex?.sets?.[0] ? String(ex.sets[0].weight) : String(def);
  };

  const startWorkout = day => {
    setWDay(day);
    setWuChecked(new Set()); setWuTimerLeft(0); setWuTimerIdx(null);
    setView("warmup");
  };

  const beginWorkout = () => {
    setSessLogs([]); setActiveExId(null);
    setWStart(Date.now());
    setResting(false); setSkipped(false);
    if (wuTimer.current) clearInterval(wuTimer.current);
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => setTick(n => n+1), 1000);
    setView("workout");
  };

  const selectExercise = id => {
    const ex = DAYS[wDay].exercises.find(e=>e.id===id);
    setActiveExId(id); setSetIdx(0); setCurSets([]);
    setInputW(lastW(wDay, id, ex.weight)); setInputR("");
    setResting(false); setSkipped(false);
  };

  const skipExercise = () => {
    clearInterval(timer.current);
    setActiveExId(null); setSetIdx(0); setCurSets([]);
    setResting(false);
  };

  const finishSession = (logs) => {
    clearInterval(tickRef.current);
    const endTime = new Date().toISOString();
    const warmupLog = DAYS[wDay].warmup.map((item,i) => ({ label:item.label, done:wuChecked.has(i) }));
    const sess = { id:Date.now(), date:new Date(wStart).toISOString(), endTime, day:wDay, duration:Math.round((Date.now()-wStart)/1000), warmup:warmupLog, exercises:logs };
    save([...sessions, sess]);
    setDone(sess); setView("done");
  };

  const startRest = secs => {
    if(timer.current) clearInterval(timer.current);
    setResting(true); setRestLeft(secs); setRestTotal(secs);
    timer.current = setInterval(() => {
      setRestLeft(p => { if(p<=1){ clearInterval(timer.current); setResting(false); return 0; } return p-1; });
    }, 1000);
  };

  const skipRest = () => { clearInterval(timer.current); setResting(false); setSkipped(true); };
  const addRestTime = secs => { setRestLeft(p=>p+secs); setRestTotal(p=>p+secs); };

  const submitSet = () => {
    const w = parseFloat(inputW)||0, r = parseInt(inputR)||0;
    if (!r) return;
    const ex = DAYS[wDay].exercises.find(e=>e.id===activeExId);
    const newSet = { weight:w, reps:r, skipped };
    setSkipped(false);
    const updSets = [...curSets, newSet];
    const lastSet = setIdx+1 >= ex.sets;
    if (lastSet) {
      const exLog = { id:ex.id, name:ex.name, sets:updSets };
      const updLogs = [...sessLogs, exLog];
      setSessLogs(updLogs);
      setActiveExId(null); setSetIdx(0); setCurSets([]);
      clearInterval(timer.current); setResting(false);
    } else {
      setCurSets(updSets); setSetIdx(setIdx+1);
      setInputW(String(w)); setInputR("");
      startRest(ex.rest);
    }
  };

  const progressData = id => sessions
    .filter(s=>s.exercises?.some(e=>e.id===id))
    .map(s => {
      const ex = s.exercises.find(e=>e.id===id);
      return { date:fmtDate(s.date), weight:Math.max(...ex.sets.map(s=>s.weight)) };
    });

  const ex    = (wDay && activeExId) ? DAYS[wDay].exercises.find(e=>e.id===activeExId) : null;
  const total = wDay ? DAYS[wDay].exercises.length : 0;
  const mob   = winW < 768;

  // Desktop top nav (info views only)
  const infoViews = ["home","history","progress","stats","medidas"];
  const desktopNav = !mob && infoViews.includes(view) ? (
    <div style={{background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"0 40px", display:"flex", alignItems:"center", gap:4, position:"sticky", top:0, zIndex:10}}>
      <span style={{fontFamily:"monospace", fontWeight:700, color:C.orange, fontSize:15, marginRight:20, letterSpacing:1}}>AB</span>
      {[["🏠 Inicio","home"],["📋 Historial","history"],["📈 Progreso","progress"],["📊 Estadísticas","stats"],["📏 Medidas","medidas"]].map(([l,v]) => (
        <button key={v} onClick={()=>setView(v)}
          style={{background:"none", border:"none", borderBottom:`2px solid ${view===v?C.orange:"transparent"}`, color:view===v?C.orange:C.muted, padding:"16px 14px 14px", cursor:"pointer", fontSize:13, fontFamily:"inherit", fontWeight:view===v?600:400, transition:"color 0.15s"}}>
          {l}
        </button>
      ))}
    </div>
  ) : null;

  // Phone frame wrapper for workout views on desktop
  const phoneWrap = (content) => !mob ? (
    <div style={{background:"#050505", display:"flex", justifyContent:"center", alignItems:"flex-start", minHeight:"100vh", padding:"28px 20px"}}>
      <div style={{width:400, background:C.bg, borderRadius:44, overflow:"hidden", border:"8px solid #1c1c1c", boxShadow:"0 40px 100px rgba(0,0,0,0.95)", minHeight:700}}>
        {content}
      </div>
    </div>
  ) : content;

  // Responsive wrappers
  const iW = { maxWidth: mob?520:1140, margin:"0 auto", padding: mob?"20px 16px":"28px 40px" };

  // ─── WARMUP ─────────────────────────────────────────────────────
  if (view === "warmup" && wDay) {
    const items = DAYS[wDay].warmup;
    const allDone = items.every((_,i) => wuChecked.has(i));
    const toggleCheck = i => { const s = new Set(wuChecked); s.has(i)?s.delete(i):s.add(i); setWuChecked(s); };
    const startWuTimer = i => {
      if (wuTimer.current) clearInterval(wuTimer.current);
      setWuTimerIdx(i); setWuTimerLeft(items[i].timer);
      wuTimer.current = setInterval(() => {
        setWuTimerLeft(p => {
          if (p <= 1) {
            clearInterval(wuTimer.current); setWuTimerIdx(null);
            setWuChecked(prev => new Set([...prev, i]));
            return 0;
          }
          return p - 1;
        });
      }, 1000);
    };
    const stopWuTimer = () => { clearInterval(wuTimer.current); setWuTimerIdx(null); setWuTimerLeft(0); };

    return phoneWrap(
      <div style={{fontFamily:"system-ui,sans-serif",background:C.bg,color:C.text,padding:"16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <button onClick={()=>{ clearInterval(wuTimer.current); setView("home"); }}
            style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>
            ✕ Salir
          </button>
          <span style={{background:C.orangeDim,color:C.orange,borderRadius:8,padding:"2px 12px",fontSize:13,fontWeight:600}}>DÍA {wDay}</span>
          <span style={{fontSize:13,color:C.muted}}>{wuChecked.size}/{items.length}</span>
        </div>

        <div style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:14}}>Warmup</div>

        {items.map((item, i) => {
          const checked = wuChecked.has(i);
          const running = wuTimerIdx === i;
          return (
            <div key={i} style={{...card, marginBottom:8, opacity: checked?0.55:1, transition:"opacity 0.2s"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div onClick={()=>toggleCheck(i)} style={{
                  width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",
                  border:`2px solid ${checked?C.green:C.border}`,
                  background:checked?C.green:"transparent",
                  display:"flex",alignItems:"center",justifyContent:"center"
                }}>
                  {checked && <span style={{color:"#000",fontSize:13,fontWeight:700,lineHeight:1}}>✓</span>}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,color:checked?C.muted:C.text,textDecoration:checked?"line-through":"none"}}>
                    {item.label}
                  </div>
                  {item.timer && (
                    <div style={{marginTop:6,display:"flex",alignItems:"center",gap:10}}>
                      {running ? (
                        <>
                          <span style={{fontFamily:"monospace",fontSize:16,fontWeight:700,color:C.orange}}>{fmtTime(wuTimerLeft)}</span>
                          <button onClick={stopWuTimer} style={{background:C.surface2,border:`1px solid ${C.border}`,color:C.muted,borderRadius:6,padding:"2px 10px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Parar</button>
                        </>
                      ) : (
                        <button onClick={()=>startWuTimer(i)} style={{background:"none",border:`1px solid ${C.orange}55`,color:C.orange,borderRadius:6,padding:"3px 12px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>
                          ▶ {fmtTime(item.timer)}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <button onClick={beginWorkout} style={{
          width:"100%",marginTop:18,
          background: allDone ? C.orange : C.surface,
          border: allDone ? "none" : `1px solid ${C.border}`,
          color: allDone ? "#000" : C.text,
          borderRadius:10,padding:"14px",fontFamily:"inherit",fontWeight:700,fontSize:15,cursor:"pointer",transition:"all 0.2s"
        }}>
          {allDone ? "¡Listo! Empezar entrenamiento →" : "Empezar entrenamiento →"}
        </button>
        <div onClick={beginWorkout} style={{textAlign:"center",marginTop:10,fontSize:12,color:C.muted,cursor:"pointer",textDecoration:"underline"}}>
          Saltar warmup
        </div>
      </div>
    );
  }

  // ─── HOME ───────────────────────────────────────────────────────
  if (view === "home") {
    const week = sessions.filter(s=>Date.now()-new Date(s.date).getTime()<7*864e5).length;
    const stats = [["Sesiones totales",sessions.length],["Esta semana",week],["Día 1",sessions.filter(s=>s.day===1).length],["Día 2",sessions.filter(s=>s.day===2).length],["Día 3",sessions.filter(s=>s.day===3).length]];
    return (
      <div style={{fontFamily:"system-ui,sans-serif",background:C.bg,color:C.text,minHeight:"100vh"}}>
        {desktopNav}
        <div style={iW}>
          {mob && (
            <div style={{marginBottom:24}}>
              <div style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:4}}>Aesthetic Bear</div>
              <div style={{fontSize:28,fontWeight:700,letterSpacing:-0.5}}>Gym Tracker</div>
            </div>
          )}

          <div style={{display:"grid", gridTemplateColumns: mob?"1fr":"1fr 340px", gap:32, alignItems:"start"}}>
            {/* Left: days */}
            <div>
              <div style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:10}}>Empezar entrenamiento</div>
              {[1,2,3].map(day => {
                const ds = sessions.filter(s=>s.day===day), last = ds[ds.length-1];
                return (
                  <div key={day} onClick={()=>startWorkout(day)}
                    style={{...card,marginBottom:10,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"border-color 0.15s"}}
                    onMouseOver={e=>e.currentTarget.style.borderColor=C.orange}
                    onMouseOut={e=>e.currentTarget.style.borderColor=C.border}>
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                        <span style={{background:C.orangeDim,color:C.orange,borderRadius:6,padding:"1px 8px",fontSize:12,fontWeight:600}}>DÍA {day}</span>
                        <span style={{fontSize:13,fontWeight:500}}>{DAYS[day].name}</span>
                      </div>
                      <div style={{fontSize:12,color:C.muted}}>
                        {last ? `${fmtDate(last.date)} · ${fmtHour(last.date)}${last.endTime?" → "+fmtHour(last.endTime):""} · ${fmtDur(last.duration)}` : "Sin sesiones aún"}
                      </div>
                    </div>
                    <div style={{fontSize:12,color:C.muted,textAlign:"right",flexShrink:0,marginLeft:12}}>
                      <div>{DAYS[day].exercises.length} ejercicios</div>
                      {last && <div style={{color:C.green,fontSize:11}}>{ds.length} sesiones</div>}
                    </div>
                  </div>
                );
              })}
              {mob && (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:20}}>
                  {[["📋 Historial","history"],["📈 Progreso","progress"],["📊 Estadísticas","stats"],["📏 Medidas","medidas"]].map(([l,v]) => (
                    <button key={v} onClick={()=>setView(v)}
                      style={{...card2,border:`1px solid ${C.border}`,cursor:"pointer",color:C.text,fontSize:14,fontFamily:"inherit",padding:"14px"}}>
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: stats panel (desktop only) */}
            {!mob && (
              <div>
                <div style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:10}}>Resumen</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
                  {stats.map(([l,v]) => (
                    <div key={l} style={{...card2,textAlign:"center"}}>
                      <div style={{fontSize:22,fontWeight:700,color:C.orange}}>{v}</div>
                      <div style={{fontSize:11,color:C.muted,marginTop:2}}>{l}</div>
                    </div>
                  ))}
                </div>
                {sessions.length > 0 && (
                  <div style={{...card2}}>
                    <div style={{fontSize:11,color:C.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Última sesión</div>
                    {(() => { const last = sessions[sessions.length-1]; return (
                      <>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                          <span style={{background:C.orangeDim,color:C.orange,borderRadius:6,padding:"1px 8px",fontSize:12,fontWeight:600}}>DÍA {last.day}</span>
                          <span style={{fontSize:13}}>{fmtDate(last.date)}</span>
                        </div>
                        <div style={{fontSize:12,color:C.muted}}>{fmtHour(last.date)}{last.endTime?" → "+fmtHour(last.endTime):""} · {fmtDur(last.duration)}</div>
                        <div style={{fontSize:12,color:C.muted,marginTop:4}}>{last.exercises?.length} ejercicios completados</div>
                      </>
                    ); })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── WORKOUT ────────────────────────────────────────────────────
  if (view === "workout" && wDay) {
    const completedIds = new Set(sessLogs.map(l=>l.id));
    const allExercises = DAYS[wDay].exercises;

    // ── EXERCISE LIST ──
    if (!activeExId) {
      const done2 = completedIds.size;
      return phoneWrap(
        <div style={{fontFamily:"system-ui,sans-serif",background:C.bg,color:C.text,padding:"16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <button onClick={()=>{ if(window.confirm("¿Abandonar la sesión?")){ clearInterval(timer.current); clearInterval(tickRef.current); setView("home"); }}}
              style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>
              ✕ Salir
            </button>
            <span style={{background:C.orangeDim,color:C.orange,borderRadius:8,padding:"2px 12px",fontSize:13,fontWeight:600}}>DÍA {wDay}</span>
            <span style={{fontSize:13,color:C.muted}}>{done2}/{total} hechos</span>
          </div>

          <div style={{height:3,background:C.surface2,borderRadius:2,marginBottom:12,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${(done2/total)*100}%`,background:C.orange,transition:"width 0.4s ease",borderRadius:2}}/>
          </div>

          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,padding:"8px 12px",background:C.surface2,borderRadius:8}}>
            <span style={{fontSize:12,color:C.muted}}>🕐 Inicio: <span style={{color:C.text,fontWeight:500}}>{wStart ? fmtHour(new Date(wStart).toISOString()) : "--:--"}</span></span>
            <span style={{fontSize:12,color:C.orange,fontFamily:"monospace",fontWeight:600}}>{wStart ? fmtDur(Math.round((Date.now()-wStart)/1000)) : "0min"}</span>
          </div>

          <div style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:10}}>Elige ejercicio</div>

          {allExercises.map(exercise => {
            const done = completedIds.has(exercise.id);
            const log = sessLogs.find(l=>l.id===exercise.id);
            const maxW = log ? Math.max(...log.sets.map(s=>s.weight)) : null;
            return (
              <div key={exercise.id} onClick={()=>!done && selectExercise(exercise.id)}
                style={{...card, marginBottom:8, cursor:done?"default":"pointer",
                  opacity:done?0.5:1,
                  border:`1px solid ${done?C.green+"44":C.border}`,
                  transition:"border-color 0.15s, opacity 0.2s"
                }}
                onMouseOver={e=>{ if(!done) e.currentTarget.style.borderColor=C.orange; }}
                onMouseOut={e=>{ if(!done) e.currentTarget.style.borderColor=C.border; }}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:20,height:20,borderRadius:5,flexShrink:0,
                      border:`2px solid ${done?C.green:C.border}`,
                      background:done?C.green:"transparent",
                      display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#000"
                    }}>{done?"✓":""}</div>
                    <div>
                      <div style={{fontSize:14,fontWeight:500,textDecoration:done?"line-through":"none",color:done?C.muted:C.text}}>{exercise.name}</div>
                      <div style={{fontSize:12,color:C.muted}}>{exercise.sets} series × {exercise.reps}</div>
                    </div>
                  </div>
                  {done && maxW!=null
                    ? <span style={{fontFamily:"monospace",fontSize:14,color:C.green,fontWeight:600}}>{maxW}kg</span>
                    : <span style={{fontSize:18,color:C.muted}}>→</span>
                  }
                </div>
              </div>
            );
          })}

          {sessLogs.length > 0 && (
            <button onClick={()=>finishSession(sessLogs)}
              style={{width:"100%",marginTop:16,background:C.orange,border:"none",borderRadius:10,padding:"14px",color:"#000",fontFamily:"inherit",fontWeight:700,fontSize:15,cursor:"pointer"}}>
              🏁 Finalizar sesión ({done2}/{total} ejercicios)
            </button>
          )}
        </div>
      );
    }

    // ── ACTIVE EXERCISE ──
    if (ex) {
      const R=44, Circ=2*Math.PI*R;
      const dashOff = restTotal>0 ? Circ*(1-restLeft/restTotal) : 0;
      const ok = inputW && inputR;
      return phoneWrap(
        <div style={{fontFamily:"system-ui,sans-serif",background:C.bg,color:C.text,padding:"16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <button onClick={skipExercise}
              style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>
              ← Lista
            </button>
            <span style={{background:C.orangeDim,color:C.orange,borderRadius:8,padding:"2px 12px",fontSize:13,fontWeight:600}}>DÍA {wDay}</span>
            <span style={{fontSize:13,color:C.muted}}>{completedIds.size}/{total}</span>
          </div>

          <div style={{height:3,background:C.surface2,borderRadius:2,marginBottom:18,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${(completedIds.size/total)*100}%`,background:C.orange,transition:"width 0.4s ease",borderRadius:2}}/>
          </div>

          {resting && (
            <div style={{...card,textAlign:"center",padding:"28px 0",marginBottom:14}}>
              <div style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:12}}>Descanso</div>
              <svg width={100} height={100} style={{display:"block",margin:"0 auto 14px"}}>
                <circle cx={50} cy={50} r={R} fill="none" stroke={C.surface2} strokeWidth={6}/>
                <circle cx={50} cy={50} r={R} fill="none" stroke={C.orange} strokeWidth={6}
                  strokeDasharray={Circ} strokeDashoffset={dashOff}
                  strokeLinecap="round" transform="rotate(-90 50 50)"
                  style={{transition:"stroke-dashoffset 1s linear"}}/>
                <text x={50} y={56} textAnchor="middle" fill={C.text} fontSize={20} fontWeight={700} fontFamily="monospace">{fmtTime(restLeft)}</text>
              </svg>
              <div style={{fontSize:13,color:C.muted,marginBottom:10}}>Serie {setIdx+1} de {ex.sets}</div>
              <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:10}}>
                {[30,60].map(s => (
                  <button key={s} onClick={()=>addRestTime(s)}
                    style={{background:C.surface2,border:`1px solid ${C.border}`,color:C.orange,borderRadius:8,padding:"4px 14px",cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:600}}>
                    +{fmtTime(s)}
                  </button>
                ))}
              </div>
              <button onClick={skipRest}
                style={{background:C.surface2,border:`1px solid ${C.border}`,color:C.muted,borderRadius:8,padding:"6px 20px",cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>
                Saltar descanso
              </button>
            </div>
          )}

          <div style={{...card,marginBottom:10}}>
            <div style={{fontSize:20,fontWeight:700,marginBottom:6}}>{ex.name}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"4px 16px",fontSize:13,color:C.muted,marginBottom:ex.note?8:0}}>
              <span>🎯 {ex.sets} series × {ex.reps}</span>
              <span>⏱ {fmtTime(ex.rest)} descanso</span>
            </div>
            {ex.note && <div style={{fontSize:12,color:C.yellow,marginBottom:6}}>💡 {ex.note}</div>}
            <div style={{display:"flex",gap:16,fontSize:12,marginTop:8}}>
              <span style={{color:C.muted}}>Prox: <span style={{color:C.green,fontWeight:600}}>{ex.next}</span></span>
              <span style={{color:C.muted}}>4 sem: <span style={{color:C.yellow,fontWeight:600}}>{ex.w4}</span></span>
            </div>
          </div>

          {curSets.length > 0 && (
            <div style={{...card2,marginBottom:10}}>
              <div style={{fontSize:11,color:C.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Series completadas</div>
              {curSets.map((s,i) => (
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:i<curSets.length-1?`1px solid ${C.border}`:"none"}}>
                  <span style={{fontSize:13,color:C.muted}}>Serie {i+1}</span>
                  <span style={{fontFamily:"monospace",fontSize:15,fontWeight:600}}>
                    {s.weight}<span style={{fontSize:12,color:C.muted}}>kg</span> × {s.reps}<span style={{fontSize:12,color:C.muted}}>r</span>
                  </span>
                  {s.skipped ? <span style={{fontSize:11,color:C.red}}>desc. saltado</span> : <span style={{color:C.green,fontSize:14}}>✓</span>}
                </div>
              ))}
            </div>
          )}

          {!resting && (
            <div style={{...card,border:`1px solid ${C.orange}55`}}>
              <div style={{fontSize:12,color:C.orange,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>
                Serie {setIdx+1} de {ex.sets}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                {[["Peso (kg)",inputW,setInputW,"0.5"],["Reps",inputR,setInputR,"1"]].map(([lbl,val,set,step]) => (
                  <div key={lbl}>
                    <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:2,marginBottom:6}}>{lbl}</div>
                    <input type="number" step={step} value={val} onChange={e=>set(e.target.value)} placeholder="0"
                      style={{width:"100%",background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,padding:"12px",color:C.text,fontSize:24,fontFamily:"monospace",fontWeight:700,textAlign:"center",outline:"none",boxSizing:"border-box"}}/>
                  </div>
                ))}
              </div>
              {skipped && <div style={{fontSize:12,color:C.red,background:C.redDim,borderRadius:6,padding:"5px 10px",marginBottom:10}}>⚠ Descanso saltado — anótalo</div>}
              <button onClick={submitSet} disabled={!ok}
                style={{width:"100%",background:ok?C.orange:C.surface2,border:"none",borderRadius:10,padding:"14px",color:ok?"#000":C.muted,fontFamily:"inherit",fontWeight:700,fontSize:15,cursor:ok?"pointer":"not-allowed",transition:"all 0.15s",marginBottom:8}}>
                {setIdx+1<ex.sets ? "Completar serie →" : "Fin ejercicio ✓"}
              </button>
              <button onClick={skipExercise}
                style={{width:"100%",background:"none",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px",color:C.muted,fontFamily:"inherit",fontSize:13,cursor:"pointer"}}>
                Saltar ejercicio (máquina ocupada)
              </button>
            </div>
          )}
        </div>
      );
    }
  }

  // ─── DONE ───────────────────────────────────────────────────────
  if (view === "done" && done) {
    return phoneWrap(
      <div style={{fontFamily:"system-ui,sans-serif",background:C.bg,color:C.text,padding:"32px 16px",textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:8}}>🏆</div>
        <div style={{fontSize:28,fontWeight:700,color:C.green,marginBottom:4}}>¡Sesión completada!</div>
        <div style={{color:C.muted,marginBottom:28}}>
          <div style={{fontSize:14}}>{fmtDate(done.date)} · {fmtDur(done.duration)}</div>
          <div style={{fontSize:13,marginTop:4}}>
            🕐 {fmtHour(done.date)} → {done.endTime ? fmtHour(done.endTime) : "—"}
          </div>
        </div>
        <div style={{...card,textAlign:"left",marginBottom:24}}>
          {done.exercises.map((ex,i) => {
            const maxW = Math.max(...ex.sets.map(s=>s.weight));
            const totalR = ex.sets.reduce((a,s)=>a+s.reps,0);
            const allGood = ex.sets.every(s=>!s.skipped);
            return (
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<done.exercises.length-1?`1px solid ${C.border}`:"none"}}>
                <div>
                  <div style={{fontSize:14}}>{ex.name}</div>
                  <div style={{fontSize:12,color:C.muted}}>{ex.sets.length} series · {totalR} reps totales</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontFamily:"monospace",fontSize:17,fontWeight:700}}>{maxW}<span style={{fontSize:12,color:C.muted}}>kg</span></span>
                  {allGood && <span style={{color:C.green,fontSize:14}} title="Descansos respetados">✓</span>}
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={()=>setView("home")}
          style={{background:C.orange,border:"none",borderRadius:12,padding:"14px 40px",color:"#000",fontFamily:"inherit",fontWeight:700,fontSize:16,cursor:"pointer"}}>
          Volver al inicio
        </button>
      </div>
    );
  }

  // ─── HISTORY ────────────────────────────────────────────────────
  if (view === "history") {
    const sorted = [...sessions].reverse();
    return (
      <div style={{fontFamily:"system-ui,sans-serif",background:C.bg,color:C.text,minHeight:"100vh"}}>
        {desktopNav}
        <div style={iW}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24}}>
          <button onClick={()=>setView("home")} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:mob?20:0,fontFamily:"inherit",display:mob?"block":"none"}}>←</button>
          <div style={{fontSize:22,fontWeight:700}}>Historial</div>
        </div>
        <div style={{display:"grid", gridTemplateColumns: mob?"1fr":"1fr 1fr", gap:12}}>
        {sorted.length===0
          ? <div style={{color:C.muted,textAlign:"center",marginTop:60,gridColumn:"1/-1"}}>Aún no hay sesiones registradas</div>
          : sorted.map(s => (
            <div key={s.id} style={{...card,marginBottom:10,overflow:"hidden",padding:0}}>
              <div onClick={()=>setExpanded(expanded===s.id?null:s.id)}
                style={{padding:"14px 18px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{background:C.orangeDim,color:C.orange,borderRadius:6,padding:"1px 8px",fontSize:12,fontWeight:600}}>DÍA {s.day}</span>
                  <div>
                    <div style={{fontSize:14}}>{fmtDate(s.date)}</div>
                    <div style={{fontSize:11,color:C.muted}}>{fmtHour(s.date)}{s.endTime ? ` → ${fmtHour(s.endTime)}` : ""}</div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:12,color:C.muted}}>{fmtDur(s.duration)}</span>
                  <span style={{color:C.muted}}>{expanded===s.id?"▲":"▼"}</span>
                </div>
              </div>
              {expanded===s.id && (
                <div style={{borderTop:`1px solid ${C.border}`,padding:"12px 18px",background:C.surface2}}>
                  {s.warmup?.length > 0 && (
                    <div style={{marginBottom:14}}>
                      <div style={{fontSize:11,color:C.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Warmup</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                        {s.warmup.map((w,i) => (
                          <span key={i} style={{fontSize:12,borderRadius:6,padding:"2px 9px",border:`1px solid ${w.done?C.green+"55":C.border}`,color:w.done?C.green:C.muted,background:w.done?C.greenDim+"33":C.surface}}>
                            {w.done?"✓ ":""}{w.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {s.exercises?.map((ex,i) => {
                    const maxW = Math.max(...ex.sets.map(s=>s.weight));
                    return (
                      <div key={i} style={{marginBottom:12}}>
                        <div style={{fontSize:13,fontWeight:600,marginBottom:5}}>{ex.name}</div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:5,alignItems:"center"}}>
                          {ex.sets.map((set,j) => (
                            <span key={j} style={{
                              background:set.skipped?C.redDim:C.surface,
                              border:`1px solid ${set.skipped?"#7f1d1d":C.border}`,
                              borderRadius:6,padding:"2px 9px",fontSize:12,fontFamily:"monospace",
                              color:set.skipped?C.red:C.text
                            }}>
                              {set.weight}×{set.reps}
                            </span>
                          ))}
                          <span style={{fontSize:11,color:C.green,fontWeight:600}}>max {maxW}kg</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        }
        </div>{/* end grid */}
        </div>{/* end iW */}
      </div>
    );
  }

  // ─── PROGRESS ───────────────────────────────────────────────────
  if (view === "progress") {
    const data = progressData(selEx);
    const exInfo = ALL_EX.find(e=>e.id===selEx);
    const firstW = data.length ? data[0].weight : null;
    const lastW  = data.length ? data[data.length-1].weight : null;
    const change = firstW && lastW && firstW!==0 ? ((lastW-firstW)/firstW*100).toFixed(1) : null;
    const up = parseFloat(change) >= 0;

    return (
      <div style={{fontFamily:"system-ui,sans-serif",background:C.bg,color:C.text,minHeight:"100vh"}}>
        {desktopNav}
        <div style={iW}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24}}>
          <button onClick={()=>setView("home")} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:mob?20:0,fontFamily:"inherit",display:mob?"block":"none"}}>←</button>
          <div style={{fontSize:22,fontWeight:700}}>Progreso</div>
        </div>

        <select value={selEx} onChange={e=>setSelEx(e.target.value)}
          style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 14px",color:C.text,fontSize:13,fontFamily:"inherit",marginBottom:20,outline:"none",cursor:"pointer",boxSizing:"border-box"}}>
          {Object.entries(DAYS).map(([day,d]) => (
            <optgroup key={day} label={`Día ${day} — ${d.name}`}>
              {d.exercises.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </optgroup>
          ))}
        </select>

        {exInfo?.isAssist && (
          <div style={{fontSize:12,color:C.yellow,background:"#422006",borderRadius:8,padding:"6px 12px",marginBottom:14}}>
            💡 Ejercicio asistido — menor peso = mayor fuerza
          </div>
        )}

        {data.length >= 2 ? (
          <>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:18}}>
              {[["Inicio",`${firstW}kg`,C.muted],["Actual",`${lastW}kg`,C.green],["Cambio",change?`${up?"+":""}${change}%`:"—",up?C.green:C.red]].map(([l,v,col]) => (
                <div key={l} style={{...card2,textAlign:"center"}}>
                  <div style={{fontSize:20,fontWeight:700,color:col,fontVariantNumeric:"tabular-nums"}}>{v}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:2}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{...card,padding:"16px 6px 8px",marginBottom:12}}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data} margin={{top:5,right:10,left:-22,bottom:5}}>
                  <XAxis dataKey="date" tick={{fontSize:11,fill:C.muted}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:11,fill:C.muted,fontFamily:"monospace"}} axisLine={false} tickLine={false} domain={["auto","auto"]}/>
                  <Tooltip contentStyle={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,fontSize:13,color:C.text}} formatter={v=>[`${v}kg`,"Peso máx"]}/>
                  <Line type="monotone" dataKey="weight" stroke={C.orange} strokeWidth={2.5} dot={{fill:C.orange,r:4,strokeWidth:0}} activeDot={{r:6,strokeWidth:0}}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
            {exInfo && (
              <div style={{...card2,fontSize:13}}>
                <span style={{color:C.muted}}>Objetivo próximo: </span><span style={{color:C.green,fontWeight:600}}>{exInfo.next}</span>
                <span style={{color:C.muted,marginLeft:16}}>4 semanas: </span><span style={{color:C.yellow,fontWeight:600}}>{exInfo.w4}</span>
              </div>
            )}
          </>
        ) : (
          <div style={{textAlign:"center",padding:"60px 20px",color:C.muted}}>
            <div style={{fontSize:40,marginBottom:12}}>📊</div>
            <div style={{fontSize:14}}>{data.length===0?"Sin datos para este ejercicio aún":"Necesitas al menos 2 sesiones para ver la tendencia"}</div>
          </div>
        )}
        </div>{/* end iW */}
      </div>
    );
  }

  // ─── STATS ──────────────────────────────────────────────────────
  if (view === "stats") {
    // Racha
    const days = [...new Set(sessions.map(s=>s.date.slice(0,10)))].sort();
    let curStreak = 0, maxStreak = 0;
    if (days.length) {
      const today = new Date().toISOString().slice(0,10);
      const yesterday = new Date(Date.now()-864e5).toISOString().slice(0,10);
      const last = days[days.length-1];
      if (last === today || last === yesterday) {
        let streak = 1;
        for (let i=days.length-1; i>0; i--) {
          if ((new Date(days[i])-new Date(days[i-1]))/864e5 === 1) streak++;
          else break;
        }
        curStreak = streak;
      }
      let streak = 1;
      for (let i=1; i<days.length; i++) {
        if ((new Date(days[i])-new Date(days[i-1]))/864e5 === 1) { streak++; maxStreak = Math.max(maxStreak,streak); }
        else streak = 1;
      }
      maxStreak = Math.max(maxStreak, days.length===1?1:streak);
    }

    // Distribución por día
    const dist = {1:0,2:0,3:0};
    sessions.forEach(s=>{ if(dist[s.day]!==undefined) dist[s.day]++; });
    const distMax = Math.max(...Object.values(dist), 1);

    // Volumen semanal (series × reps × peso)
    const weekVol = {};
    sessions.forEach(s => {
      const d = new Date(s.date);
      const dow = d.getDay();
      const diff = d.getDate() - dow + (dow===0?-6:1);
      const ws = new Date(new Date(s.date).setDate(diff)).toISOString().slice(0,10);
      const vol = s.exercises?.reduce((a,ex)=>a+ex.sets.reduce((b,set)=>b+set.weight*set.reps,0),0)||0;
      weekVol[ws] = (weekVol[ws]||0) + vol;
    });
    const volData = Object.entries(weekVol).sort(([a],[b])=>a.localeCompare(b)).slice(-8)
      .map(([w,vol])=>({ week: fmtDate(w+"T12:00:00"), vol: Math.round(vol) }));

    return (
      <div style={{fontFamily:"system-ui,sans-serif",background:C.bg,color:C.text,minHeight:"100vh"}}>
        {desktopNav}
        <div style={iW}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24}}>
          <button onClick={()=>setView("home")} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:mob?20:0,fontFamily:"inherit",display:mob?"block":"none"}}>←</button>
          <div style={{fontSize:22,fontWeight:700}}>Estadísticas</div>
        </div>

        {/* Racha */}
        <div style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:10}}>Racha</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
          {[["Racha actual",curStreak,"días",C.orange],["Racha máxima",maxStreak,"días",C.yellow]].map(([l,v,u,col])=>(
            <div key={l} style={{...card,textAlign:"center"}}>
              <div style={{fontSize:36,fontWeight:700,color:col}}>{v}</div>
              <div style={{fontSize:12,color:C.muted}}>{u}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>

        {/* Distribución */}
        <div style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:10}}>Sesiones por día</div>
        <div style={{...card,marginBottom:20}}>
          {[1,2,3].map(day=>(
            <div key={day} style={{marginBottom:day<3?12:0}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:13}}>Día {day} — {DAYS[day].name.split(" + ")[0]}</span>
                <span style={{fontFamily:"monospace",fontSize:13,color:C.orange,fontWeight:600}}>{dist[day]}</span>
              </div>
              <div style={{height:6,background:C.surface2,borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${(dist[day]/distMax)*100}%`,background:C.orange,borderRadius:3,transition:"width 0.4s"}}/>
              </div>
            </div>
          ))}
        </div>

        {/* Volumen semanal */}
        <div style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:10}}>Volumen semanal (kg·reps)</div>
        {volData.length >= 2 ? (
          <div style={{...card,padding:"16px 6px 8px"}}>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={volData} margin={{top:5,right:10,left:-10,bottom:5}}>
                <XAxis dataKey="week" tick={{fontSize:10,fill:C.muted}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:C.muted}} axisLine={false} tickLine={false} domain={["auto","auto"]}/>
                <Tooltip contentStyle={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,fontSize:13,color:C.text}} formatter={v=>[`${v.toLocaleString()} kg·r`,"Volumen"]}/>
                <Line type="monotone" dataKey="vol" stroke={C.yellow} strokeWidth={2.5} dot={{fill:C.yellow,r:4,strokeWidth:0}} activeDot={{r:6}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{...card,textAlign:"center",padding:"30px",color:C.muted,fontSize:14}}>Necesitas más sesiones para ver la tendencia</div>
        )}
        </div>{/* end iW */}
      </div>
    );
  }

  // ─── MEDIDAS ─────────────────────────────────────────────────────
  if (view === "medidas") {
    const last = bodyMetrics[bodyMetrics.length-1];
    const first = bodyMetrics[0];
    const selM = METRICS.find(m=>m.id===selMetric);
    const chartData = bodyMetrics.filter(e=>e[selMetric]!=null&&e[selMetric]!=="").map(e=>({ date:fmtDate(e.date), val:parseFloat(e[selMetric]) }));
    const firstVal = chartData.length ? chartData[0].val : null;
    const lastVal  = chartData.length ? chartData[chartData.length-1].val : null;
    const change   = firstVal && lastVal && firstVal!==0 ? ((lastVal-firstVal)/firstVal*100).toFixed(1) : null;

    const logMetrics = () => {
      const hasAny = METRICS.some(m=>metricForm[m.id]!=null&&metricForm[m.id]!=="");
      if (!hasAny) return;
      const entry = { id:Date.now(), date:new Date().toISOString(), ...metricForm };
      const updated = [...bodyMetrics, entry];
      saveMetrics(updated);
      setMetricForm({});
    };

    return (
      <div style={{fontFamily:"system-ui,sans-serif",background:C.bg,color:C.text,minHeight:"100vh"}}>
        {desktopNav}
        <div style={iW}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24}}>
          <button onClick={()=>setView("home")} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:mob?20:0,fontFamily:"inherit",display:mob?"block":"none"}}>←</button>
          <div style={{fontSize:22,fontWeight:700}}>Medidas corporales</div>
        </div>
        <div style={{display:"grid", gridTemplateColumns: mob?"1fr":"1fr 1fr", gap:32, alignItems:"start"}}>
        <div>

        {/* Última medición */}
        {last && (
          <div style={{marginBottom:20}}>
            <div style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:10}}>Última medición — {fmtDate(last.date)}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
              {METRICS.map(m => last[m.id]!=null&&last[m.id]!=="" ? (
                <div key={m.id} style={{...card2,textAlign:"center",padding:"10px 6px"}}>
                  <div style={{fontSize:15,fontWeight:700,color:C.orange}}>{last[m.id]}</div>
                  <div style={{fontSize:10,color:C.muted}}>{m.unit}</div>
                  <div style={{fontSize:10,color:C.muted,marginTop:1}}>{m.label}</div>
                </div>
              ) : null)}
            </div>
          </div>
        )}

        {/* Registrar medición */}
        <div style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:10}}>Registrar medición</div>
        <div style={{...card,marginBottom:20}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            {METRICS.map(m=>(
              <div key={m.id}>
                <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{m.icon} {m.label} ({m.unit})</div>
                <input type="number" step="0.1" value={metricForm[m.id]||""} onChange={e=>setMetricForm(p=>({...p,[m.id]:e.target.value}))} placeholder="—"
                  style={{width:"100%",background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px",color:C.text,fontSize:16,fontFamily:"monospace",textAlign:"center",outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
          </div>
          <button onClick={logMetrics}
            style={{width:"100%",background:METRICS.some(m=>metricForm[m.id]!=null&&metricForm[m.id]!=="")?C.orange:C.surface2,border:"none",borderRadius:10,padding:"13px",color:METRICS.some(m=>metricForm[m.id]!=null&&metricForm[m.id]!=="")?C.bg:C.muted,fontFamily:"inherit",fontWeight:700,fontSize:14,cursor:"pointer",transition:"all 0.15s"}}>
            Guardar medición
          </button>
        </div>

        {/* Gráfica por métrica */}
        {bodyMetrics.length > 0 && (
          <>
            <div style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:10}}>Evolución</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
              {METRICS.map(m=>(
                <button key={m.id} onClick={()=>setSelMetric(m.id)}
                  style={{background:selMetric===m.id?C.orange:C.surface2,border:`1px solid ${selMetric===m.id?C.orange:C.border}`,color:selMetric===m.id?C.bg:C.muted,borderRadius:20,padding:"4px 12px",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                  {m.label}
                </button>
              ))}
            </div>

            {chartData.length >= 2 ? (
              <>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
                  {[["Inicio",firstVal?`${firstVal}${selM.unit}`:"—",C.muted],["Actual",lastVal?`${lastVal}${selM.unit}`:"—",C.green],["Cambio",change?`${parseFloat(change)>=0?"+":""}${change}%`:"—",parseFloat(change)>=0?C.green:C.red]].map(([l,v,col])=>(
                    <div key={l} style={{...card2,textAlign:"center"}}>
                      <div style={{fontSize:18,fontWeight:700,color:col}}>{v}</div>
                      <div style={{fontSize:11,color:C.muted,marginTop:2}}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{...card,padding:"16px 6px 8px"}}>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={chartData} margin={{top:5,right:10,left:-22,bottom:5}}>
                      <XAxis dataKey="date" tick={{fontSize:10,fill:C.muted}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fontSize:10,fill:C.muted,fontFamily:"monospace"}} axisLine={false} tickLine={false} domain={["auto","auto"]}/>
                      <Tooltip contentStyle={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,fontSize:13,color:C.text}} formatter={v=>[`${v}${selM.unit}`,selM.label]}/>
                      <Line type="monotone" dataKey="val" stroke={C.green} strokeWidth={2.5} dot={{fill:C.green,r:4,strokeWidth:0}} activeDot={{r:6}}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div style={{...card,textAlign:"center",padding:"30px",color:C.muted,fontSize:14}}>
                {chartData.length===0?`Sin datos de ${selM.label} aún`:"Necesitas al menos 2 registros para ver la tendencia"}
              </div>
            )}
          </>
        )}
        </div>{/* right col */}
        </div>{/* 2-col grid */}
        </div>{/* iW */}
      </div>
    );
  }

  return null;
}