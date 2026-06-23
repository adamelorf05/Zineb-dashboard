import { useState, useEffect, useCallback } from "react";

const SK = "friend_os_v1";
const TODAY = new Date().toISOString().split("T")[0];

const C = {
  bg:        "#0d0008",
  surface:   "#170a12",
  card:      "#1c0d16",
  border:    "#3a1a2a",
  borderHi:  "#ff3d8b",
  pink:      "#ff3d8b",
  pinkDark:  "#d62e72",
  pinkLight: "#ffd6e8",
  blush:     "#3a1626",
  blushLight:"#2a1420",
  green:     "#5fd98a",
  red:       "#ff5d7a",
  gold:      "#e8b84a",
  purple:    "#b07aff",
  blue:      "#6ab8e8",
  text:      "#fbe9f1",
  textDim:   "#caa0b6",
  textMut:   "#8a6678",
  white:     "#ffffff",
  black:     "#0d0008",
};

const F  = "'Nunito','Quicksand',system-ui,sans-serif";
const FB = "'Nunito',system-ui,sans-serif";

function DEF() {
  return {
    prayers: { logs: {} },
    quran: { logs: {} },
    fitness: { logs: [], sleepLogs: [], weightEntries: [], weightGoal: "", weightStart: "" },
    diet: { logs: [], waterLogs: {}, mealLogs: {} },
    learning: { books: [], videos: [], monthlyGoal: 4 },
    routine: {
      morning: [
        {id:1,label:"Fajr 🕌",done:false},{id:2,label:"Wake up",done:false},
        {id:3,label:"Drink water 💧",done:false},{id:4,label:"Stretch 🧘",done:false},
        {id:5,label:"No smoking 🚭",done:false},
        {id:6,label:"Healthy breakfast 🥗",done:false},{id:7,label:"Read / Listen 📚",done:false},
      ],
      evening: [
        {id:8,label:"Light dinner 🥗",done:false},{id:9,label:"30 min walk 🚶",done:false},
        {id:11,label:"Read 20 min 📖",done:false},
        {id:12,label:"Isha 🕌",done:false},{id:13,label:"Sleep on time 😴",done:false},
      ],
    },
    tasks: [],
    goals: [],
    finance: {
      income: "", budget: [],
      expenses: [], savingsGoals: [], debts: [],
    },
    wellbeing: { moods: {}, gratitude: {} },
    weeklyReviews: [],
    streakData: {},
  };
}

function load() {
  try {
    const r = localStorage.getItem(SK);
    if (r) {
      const parsed = JSON.parse(r);
      const def = DEF();
      return { ...def, ...parsed, routine: { ...def.routine, ...(parsed.routine||{}) } };
    }
  } catch (e) {}
  return DEF();
}

function save(data) {
  try { localStorage.setItem(SK, JSON.stringify(data)); } catch (e) {}
}

// ── Small UI primitives ─────────────────────────────────────────────────────
function Card({ children, style={} }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 18,
      padding: 18, marginBottom: 14, boxShadow: "0 2px 14px rgba(255,61,139,0.06)",
      ...style
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, title, sub }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily:F, fontSize: 22, fontWeight: 800, color: C.text, display:"flex", alignItems:"center", gap:8 }}>
        <span>{icon}</span><span>{title}</span>
      </div>
      {sub && <div style={{ fontFamily:FB, fontSize: 13, color: C.textDim, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Checkbox({ checked, onChange, label }) {
  return (
    <div onClick={onChange} style={{
      display:"flex", alignItems:"center", gap:12, padding:"12px 14px",
      background: checked ? C.blush : C.blushLight, borderRadius: 14, marginBottom: 8,
      border: `1px solid ${checked ? C.pink : C.border}`, cursor:"pointer", transition:"all .15s"
    }}>
      <div style={{
        width:24, height:24, borderRadius:8, flexShrink:0,
        border: `2px solid ${checked ? C.pink : C.textMut}`,
        background: checked ? C.pink : "transparent",
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:C.white
      }}>
        {checked ? "✓" : ""}
      </div>
      <div style={{
        fontFamily:FB, fontSize:15, color: checked ? C.textDim : C.text,
        textDecoration: checked ? "line-through" : "none"
      }}>{label}</div>
    </div>
  );
}

function ProgressBar({ pct, color=C.pink }) {
  return (
    <div style={{ background: C.blushLight, borderRadius: 10, height: 10, overflow:"hidden", border:`1px solid ${C.border}` }}>
      <div style={{ background: color, height:"100%", width: `${Math.min(100,Math.max(0,pct))}%`, borderRadius: 10, transition:"width .3s" }} />
    </div>
  );
}

function Pill({ children, color=C.pink, bg=C.blush }) {
  return (
    <span style={{
      fontFamily:FB, fontSize:12, fontWeight:700, color, background:bg,
      padding:"4px 10px", borderRadius: 999, border:`1px solid ${color}33`
    }}>{children}</span>
  );
}

// ── Password Gate ─────────────────────────────────────────────────────────────
const AUTH_KEY = "friend_os_auth";
const PASS_KEY = "friend_os_pass";
const DEFAULT_PASSWORD = "Candy2026";

function PasswordGate({ onUnlock }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const getPassword = () => {
    try { return localStorage.getItem(PASS_KEY) || DEFAULT_PASSWORD; }
    catch (e) { return DEFAULT_PASSWORD; }
  };

  const attempt = () => {
    if (input === getPassword()) {
      try { sessionStorage.setItem(AUTH_KEY, "1"); } catch (e) {}
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setInput("");
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div style={{
      minHeight:"100vh", background: C.bg, display:"flex", alignItems:"center",
      justifyContent:"center", padding:24, fontFamily:F
    }}>
      <style>{`
        @keyframes shake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-8px);} 75%{transform:translateX(8px);} }
        @keyframes glow { 0%,100%{ box-shadow:0 0 0 0 rgba(255,61,139,0.35);} 50%{ box-shadow:0 0 0 8px rgba(255,61,139,0);} }
      `}</style>
      <div style={{
        width:"100%", maxWidth:380, background: C.surface, border:`1px solid ${C.border}`,
        borderRadius:24, padding:"36px 28px", textAlign:"center",
        animation: shake ? "shake .4s" : "none"
      }}>
        <div style={{ fontSize:44, marginBottom:8 }}>🖤💗</div>
        <div style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:4 }}>Zineb</div>
        <div style={{ fontSize:13, color:C.textDim, marginBottom:24 }}>Private dashboard — enter your password</div>
        <input
          type="password"
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          onKeyDown={(e)=>{ if(e.key==="Enter") attempt(); }}
          placeholder="Password"
          autoFocus
          style={{
            width:"100%", boxSizing:"border-box", padding:"14px 16px", borderRadius:14,
            border:`1.5px solid ${error ? C.red : C.border}`, background:C.blushLight,
            color:C.text, fontSize:16, fontFamily:FB, outline:"none", marginBottom:14,
            textAlign:"center", letterSpacing:2
          }}
        />
        {error && <div style={{ color:C.red, fontSize:13, marginBottom:14, fontFamily:FB }}>Wrong password, try again 💗</div>}
        <button
          onClick={attempt}
          style={{
            width:"100%", padding:"14px", borderRadius:14, border:"none",
            background: C.pink, color: C.white, fontSize:16, fontWeight:800,
            fontFamily:F, cursor:"pointer", animation:"glow 2.2s infinite"
          }}
        >Unlock</button>
      </div>
    </div>
  );
}

function ChangePasswordModal({ onClose }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  const getPassword = () => {
    try { return localStorage.getItem(PASS_KEY) || DEFAULT_PASSWORD; }
    catch (e) { return DEFAULT_PASSWORD; }
  };

  const submit = () => {
    if (current !== getPassword()) { setErr("Current password is wrong."); return; }
    if (next.length < 4) { setErr("New password must be at least 4 characters."); return; }
    if (next !== confirm) { setErr("Passwords don't match."); return; }
    try { localStorage.setItem(PASS_KEY, next); } catch (e) {}
    setErr(""); setOk(true);
    setTimeout(() => onClose(), 1200);
  };

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex",
      alignItems:"center", justifyContent:"center", padding:20, zIndex:100
    }} onClick={onClose}>
      <div onClick={(e)=>e.stopPropagation()} style={{
        width:"100%", maxWidth:360, background:C.surface, border:`1px solid ${C.border}`,
        borderRadius:20, padding:24, fontFamily:F
      }}>
        <div style={{ fontSize:18, fontWeight:800, color:C.text, marginBottom:16 }}>Change Password</div>
        {ok ? (
          <div style={{ color:C.green, fontFamily:FB, fontSize:14, textAlign:"center", padding:"20px 0" }}>
            ✓ Password changed!
          </div>
        ) : (
          <>
            <input type="password" placeholder="Current password" value={current}
              onChange={(e)=>setCurrent(e.target.value)}
              style={inputStyle()} />
            <input type="password" placeholder="New password" value={next}
              onChange={(e)=>setNext(e.target.value)}
              style={inputStyle()} />
            <input type="password" placeholder="Confirm new password" value={confirm}
              onChange={(e)=>setConfirm(e.target.value)}
              style={inputStyle()} />
            {err && <div style={{ color:C.red, fontSize:13, fontFamily:FB, marginBottom:10 }}>{err}</div>}
            <button onClick={submit} style={{
              width:"100%", padding:"12px", borderRadius:12, border:"none",
              background:C.pink, color:C.white, fontWeight:800, fontFamily:F, cursor:"pointer", marginTop:4
            }}>Save</button>
          </>
        )}
      </div>
    </div>
  );
}

function inputStyle() {
  return {
    width:"100%", boxSizing:"border-box", padding:"12px 14px", borderRadius:12,
    border:`1px solid ${C.border}`, background:C.blushLight, color:C.text,
    fontSize:14, fontFamily:FB, outline:"none", marginBottom:10
  };
}

// ── Nav ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id:"home", label:"Home", icon:"🏠" },
  { id:"routine", label:"Routine", icon:"☀️" },
  { id:"tasks", label:"Tasks", icon:"✅" },
  { id:"faith", label:"Faith", icon:"🕌" },
  { id:"fitness", label:"Fitness", icon:"💪" },
  { id:"diet", label:"Diet", icon:"🥗" },
  { id:"learning", label:"Learning", icon:"📚" },
  { id:"goals", label:"Goals", icon:"🎯" },
  { id:"finance", label:"Finance", icon:"💸" },
  { id:"wellbeing", label:"Wellbeing", icon:"🌸" },
];

function NavBar({ active, setActive }) {
  return (
    <div style={{
      position:"fixed", bottom:0, left:0, right:0, background:C.surface,
      borderTop:`1px solid ${C.border}`, display:"flex", overflowX:"auto",
      padding:"6px 4px", zIndex:50
    }}>
      {TABS.map(t => (
        <div key={t.id} onClick={()=>setActive(t.id)} style={{
          flex:"1 0 auto", minWidth:64, display:"flex", flexDirection:"column",
          alignItems:"center", gap:2, padding:"6px 8px", cursor:"pointer",
          color: active===t.id ? C.pink : C.textMut
        }}>
          <div style={{ fontSize:20 }}>{t.icon}</div>
          <div style={{ fontFamily:FB, fontSize:10, fontWeight:700 }}>{t.label}</div>
        </div>
      ))}
    </div>
  );
}

function TopBar({ onChangePassword }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"18px 18px 10px"
    }}>
      <div style={{ fontFamily:F, fontWeight:800, fontSize:20, color:C.text, display:"flex", alignItems:"center", gap:8 }}>
        <span>🖤💗</span><span>Zineb</span>
      </div>
      <div onClick={onChangePassword} style={{ fontSize:20, cursor:"pointer", color:C.textMut }}>⚙️</div>
    </div>
  );
}

// ── HOME ─────────────────────────────────────────────────────────────────────
function Home({ data, setActive }) {
  const m = data.routine.morning, e = data.routine.evening;
  const mDone = m.filter(x=>x.done).length, eDone = e.filter(x=>x.done).length;
  const total = m.length + e.length, done = mDone + eDone;
  const water = data.diet.waterLogs[TODAY] || 0;
  const mood = data.wellbeing.moods[TODAY];

  return (
    <div>
      <Card>
        <div style={{ fontFamily:FB, fontSize:13, color:C.textDim, marginBottom:6 }}>Today's Progress</div>
        <div style={{ fontFamily:F, fontSize:28, fontWeight:800, color:C.text, marginBottom:10 }}>
          {done}/{total} <span style={{ fontSize:15, color:C.textDim, fontWeight:600 }}>tasks done</span>
        </div>
        <ProgressBar pct={(done/Math.max(1,total))*100} />
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Card style={{ marginBottom:12 }}>
          <div style={{ fontSize:24, marginBottom:6 }}>💧</div>
          <div style={{ fontFamily:F, fontSize:20, fontWeight:800, color:C.text }}>{water}</div>
          <div style={{ fontFamily:FB, fontSize:12, color:C.textDim }}>glasses today</div>
        </Card>
        <Card style={{ marginBottom:12 }}>
          <div style={{ fontSize:24, marginBottom:6 }}>🌸</div>
          <div style={{ fontFamily:F, fontSize:20, fontWeight:800, color:C.text }}>{mood || "—"}</div>
          <div style={{ fontFamily:FB, fontSize:12, color:C.textDim }}>mood today</div>
        </Card>
      </div>

      <Card>
        <SectionTitle icon="🚭" title="Smoke free" sub="Tracked in your morning routine" />
        <div onClick={()=>setActive("routine")} style={{
          fontFamily:FB, fontSize:14, color:C.pink, fontWeight:700, cursor:"pointer"
        }}>Go to morning routine →</div>
      </Card>

      <Card>
        <SectionTitle icon="✨" title="Quick links" />
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {TABS.slice(1).map(t => (
            <div key={t.id} onClick={()=>setActive(t.id)} style={{
              padding:"8px 14px", borderRadius:12, background:C.blush,
              color:C.text, fontFamily:FB, fontSize:13, fontWeight:700, cursor:"pointer",
              border:`1px solid ${C.border}`
            }}>{t.icon} {t.label}</div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── ROUTINE ──────────────────────────────────────────────────────────────────
function Routine({ data, update }) {
  const toggle = (period, id) => {
    const list = data.routine[period].map(x => x.id===id ? {...x, done:!x.done} : x);
    update({ ...data, routine: { ...data.routine, [period]: list } });
  };

  return (
    <div>
      <SectionTitle icon="☀️" title="Morning Routine" />
      <Card>
        {data.routine.morning.map(item => (
          <Checkbox key={item.id} checked={item.done} label={item.label}
            onChange={()=>toggle("morning", item.id)} />
        ))}
      </Card>

      <SectionTitle icon="🌙" title="Evening Routine" />
      <Card>
        {data.routine.evening.map(item => (
          <Checkbox key={item.id} checked={item.done} label={item.label}
            onChange={()=>toggle("evening", item.id)} />
        ))}
      </Card>
    </div>
  );
}

// ── TASKS ────────────────────────────────────────────────────────────────────
function Tasks({ data, update }) {
  const [title, setTitle] = useState("");

  const addTask = () => {
    if (!title.trim()) return;
    update({ ...data, tasks: [...data.tasks, { title, done:false, id: Date.now() }] });
    setTitle("");
  };

  const toggleTask = (id) => {
    update({ ...data, tasks: data.tasks.map(t => t.id===id ? {...t, done:!t.done} : t) });
  };

  const removeTask = (id) => {
    update({ ...data, tasks: data.tasks.filter(t => t.id!==id) });
  };

  const doneCount = data.tasks.filter(t=>t.done).length;

  return (
    <div>
      <SectionTitle icon="✅" title="Daily Tasks" sub={`${doneCount}/${data.tasks.length} done`} />
      <Card>
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          <input value={title} onChange={(e)=>setTitle(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter") addTask();}}
            placeholder="Add a task..."
            style={{ ...inputStyle(), marginBottom:0, flex:1 }} />
          <button onClick={addTask} style={{
            padding:"0 16px", borderRadius:12, border:"none", background:C.pink,
            color:C.white, fontWeight:800, fontFamily:F, cursor:"pointer"
          }}>Add</button>
        </div>
        {data.tasks.length===0 && <div style={{ color:C.textMut, fontFamily:FB, fontSize:13 }}>No tasks yet — add your first one ✅</div>}
        {data.tasks.map(t=>(
          <div key={t.id} style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ flex:1 }}>
              <Checkbox checked={t.done} label={t.title} onChange={()=>toggleTask(t.id)} />
            </div>
            <span onClick={()=>removeTask(t.id)} style={{ color:C.textMut, cursor:"pointer", fontSize:16, marginBottom:8 }}>✕</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── FAITH (Prayers + Quran) ──────────────────────────────────────────────────
const PRAYERS = ["Fajr","Dhuhr","Asr","Maghrib","Isha"];

function Faith({ data, update }) {
  const log = data.prayers.logs[TODAY] || {};
  const togglePrayer = (p) => {
    const next = { ...log, [p]: !log[p] };
    update({ ...data, prayers: { ...data.prayers, logs: { ...data.prayers.logs, [TODAY]: next } } });
  };
  const quranToday = data.quran.logs[TODAY] || false;
  const toggleQuran = () => {
    update({ ...data, quran: { ...data.quran, logs: { ...data.quran.logs, [TODAY]: !quranToday } } });
  };

  const doneCount = PRAYERS.filter(p=>log[p]).length;

  return (
    <div>
      <SectionTitle icon="🕌" title="Prayers" sub={`${doneCount}/5 prayed today`} />
      <Card>
        {PRAYERS.map(p => (
          <Checkbox key={p} checked={!!log[p]} label={p} onChange={()=>togglePrayer(p)} />
        ))}
      </Card>

      <SectionTitle icon="📖" title="Qur'an" />
      <Card>
        <Checkbox checked={quranToday} label="Read Qur'an today" onChange={toggleQuran} />
      </Card>
    </div>
  );
}

// ── FITNESS ──────────────────────────────────────────────────────────────────
function Fitness({ data, update }) {
  const [note, setNote] = useState("");
  const todayLog = data.fitness.logs.find(l => l.date===TODAY);

  const [bedtime, setBedtime] = useState("");
  const [waketime, setWaketime] = useState("");
  const todaySleep = data.fitness.sleepLogs.find(s => s.date===TODAY);

  const [weightVal, setWeightVal] = useState("");
  const lastWeight = data.fitness.weightEntries[data.fitness.weightEntries.length-1];

  const logWorkout = () => {
    if (!note.trim()) return;
    const logs = [...data.fitness.logs.filter(l=>l.date!==TODAY), { date:TODAY, note }];
    update({ ...data, fitness: { ...data.fitness, logs } });
    setNote("");
  };

  const logSleep = () => {
    if (!bedtime && !waketime) return;
    const sleepLogs = [
      ...data.fitness.sleepLogs.filter(s=>s.date!==TODAY),
      { date:TODAY, bedtime: bedtime || (todaySleep?.bedtime||""), waketime: waketime || (todaySleep?.waketime||"") }
    ];
    update({ ...data, fitness: { ...data.fitness, sleepLogs } });
    setBedtime(""); setWaketime("");
  };

  const logWeight = () => {
    if (!weightVal) return;
    const weightEntries = [...data.fitness.weightEntries, { date:TODAY, value: parseFloat(weightVal) }];
    update({ ...data, fitness: { ...data.fitness, weightEntries } });
    setWeightVal("");
  };

  return (
    <div>
      <SectionTitle icon="💪" title="Fitness" />
      <Card>
        <div style={{ fontFamily:FB, fontSize:13, color:C.textDim, marginBottom:8 }}>Log today's activity</div>
        <input value={note} onChange={(e)=>setNote(e.target.value)} placeholder="e.g. 20 min walk, yoga..."
          style={inputStyle()} />
        <button onClick={logWorkout} style={{
          padding:"10px 18px", borderRadius:12, border:"none", background:C.pink,
          color:C.white, fontWeight:800, fontFamily:F, cursor:"pointer"
        }}>Save</button>
        {todayLog && <div style={{ marginTop:12, color:C.green, fontFamily:FB, fontSize:13 }}>✓ Logged: {todayLog.note}</div>}
      </Card>

      <SectionTitle icon="😴" title="Sleep" sub="Log your bedtime and wake time" />
      <Card>
        <div style={{ display:"flex", gap:10, marginBottom:10 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:FB, fontSize:12, color:C.textDim, marginBottom:4 }}>Bedtime</div>
            <input type="time" value={bedtime || todaySleep?.bedtime || ""} onChange={(e)=>setBedtime(e.target.value)}
              style={{ ...inputStyle(), marginBottom:0 }} />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:FB, fontSize:12, color:C.textDim, marginBottom:4 }}>Wake time</div>
            <input type="time" value={waketime || todaySleep?.waketime || ""} onChange={(e)=>setWaketime(e.target.value)}
              style={{ ...inputStyle(), marginBottom:0 }} />
          </div>
        </div>
        <button onClick={logSleep} style={{
          padding:"10px 18px", borderRadius:12, border:"none", background:C.pink,
          color:C.white, fontWeight:800, fontFamily:F, cursor:"pointer"
        }}>Save</button>
        {todaySleep && (todaySleep.bedtime || todaySleep.waketime) && (
          <div style={{ marginTop:12, color:C.green, fontFamily:FB, fontSize:13 }}>
            ✓ Today: {todaySleep.bedtime || "—"} → {todaySleep.waketime || "—"}
          </div>
        )}
      </Card>

      <SectionTitle icon="⚖️" title="Weight tracking" sub="Suivi de poids" />
      <Card>
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          <input value={weightVal} onChange={(e)=>setWeightVal(e.target.value)} placeholder="Weight (kg)" type="number"
            style={{ ...inputStyle(), marginBottom:0, flex:1 }} />
          <button onClick={logWeight} style={{
            padding:"0 16px", borderRadius:12, border:"none", background:C.pink,
            color:C.white, fontWeight:800, fontFamily:F, cursor:"pointer"
          }}>Log</button>
        </div>
        {lastWeight ? (
          <div style={{ fontFamily:F, fontSize:24, fontWeight:800, color:C.text, marginBottom:8 }}>
            {lastWeight.value} kg <span style={{ fontSize:13, color:C.textDim, fontWeight:600 }}>latest</span>
          </div>
        ) : (
          <div style={{ color:C.textMut, fontFamily:FB, fontSize:13, marginBottom:8 }}>No entries yet</div>
        )}
        {data.fitness.weightEntries.length > 1 && (
          <div>
            {data.fitness.weightEntries.slice().reverse().slice(0,5).map((w,i)=>(
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${C.border}` }}>
                <span style={{ fontFamily:FB, fontSize:13, color:C.textDim }}>{w.date}</span>
                <span style={{ fontFamily:F, fontSize:13, fontWeight:700, color:C.text }}>{w.value} kg</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ── DIET ─────────────────────────────────────────────────────────────────────
function Diet({ data, update }) {
  const water = data.diet.waterLogs[TODAY] || 0;
  const setWater = (n) => {
    update({ ...data, diet: { ...data.diet, waterLogs: { ...data.diet.waterLogs, [TODAY]: Math.max(0,n) } } });
  };

  const [meal, setMeal] = useState("");
  const todayMeals = data.diet.mealLogs[TODAY] || [];

  const addMeal = () => {
    if (!meal.trim()) return;
    const list = [...todayMeals, meal.trim()];
    update({ ...data, diet: { ...data.diet, mealLogs: { ...data.diet.mealLogs, [TODAY]: list } } });
    setMeal("");
  };

  const removeMeal = (i) => {
    const list = todayMeals.filter((_,idx)=>idx!==i);
    update({ ...data, diet: { ...data.diet, mealLogs: { ...data.diet.mealLogs, [TODAY]: list } } });
  };

  return (
    <div>
      <SectionTitle icon="💧" title="Water Intake" sub="Glasses today" />
      <Card>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:18 }}>
          <button onClick={()=>setWater(water-1)} style={circleBtn()}>−</button>
          <div style={{ fontFamily:F, fontSize:36, fontWeight:800, color:C.pink, minWidth:60, textAlign:"center" }}>{water}</div>
          <button onClick={()=>setWater(water+1)} style={circleBtn()}>+</button>
        </div>
      </Card>

      <SectionTitle icon="🥗" title="What did you eat today?" />
      <Card>
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          <input value={meal} onChange={(e)=>setMeal(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter") addMeal();}}
            placeholder="e.g. Grilled chicken & salad"
            style={{ ...inputStyle(), marginBottom:0, flex:1 }} />
          <button onClick={addMeal} style={{
            padding:"0 16px", borderRadius:12, border:"none", background:C.pink,
            color:C.white, fontWeight:800, fontFamily:F, cursor:"pointer"
          }}>Add</button>
        </div>
        {todayMeals.length===0 && <div style={{ color:C.textMut, fontFamily:FB, fontSize:13 }}>Nothing logged yet today</div>}
        {todayMeals.map((m,i)=>(
          <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
            <span style={{ fontFamily:FB, fontSize:14, color:C.text }}>{m}</span>
            <span onClick={()=>removeMeal(i)} style={{ color:C.textMut, cursor:"pointer", fontSize:16 }}>✕</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function circleBtn() {
  return {
    width:44, height:44, borderRadius:"50%", border:`1px solid ${C.border}`,
    background:C.blush, color:C.pink, fontSize:22, fontWeight:800, cursor:"pointer"
  };
}

// ── LEARNING ─────────────────────────────────────────────────────────────────
function Learning({ data, update }) {
  const [title, setTitle] = useState("");

  const addBook = () => {
    if (!title.trim()) return;
    update({ ...data, learning: { ...data.learning, books: [...data.learning.books, { title, done:false }] } });
    setTitle("");
  };

  const toggleBook = (i) => {
    const books = data.learning.books.map((b,idx)=> idx===i ? {...b, done:!b.done} : b);
    update({ ...data, learning: { ...data.learning, books } });
  };

  return (
    <div>
      <SectionTitle icon="📚" title="Reading list" />
      <Card>
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Add a book or course..."
            style={{ ...inputStyle(), marginBottom:0, flex:1 }} />
          <button onClick={addBook} style={{
            padding:"0 16px", borderRadius:12, border:"none", background:C.pink,
            color:C.white, fontWeight:800, fontFamily:F, cursor:"pointer"
          }}>Add</button>
        </div>
        {data.learning.books.length===0 && <div style={{ color:C.textMut, fontFamily:FB, fontSize:13 }}>Nothing yet — add your first book ✨</div>}
        {data.learning.books.map((b,i)=>(
          <Checkbox key={i} checked={b.done} label={b.title} onChange={()=>toggleBook(i)} />
        ))}
      </Card>
    </div>
  );
}

// ── GOALS ────────────────────────────────────────────────────────────────────
function Goals({ data, update }) {
  const [title, setTitle] = useState("");

  const addGoal = () => {
    if (!title.trim()) return;
    update({ ...data, goals: [...data.goals, { title, done:false, id: Date.now() }] });
    setTitle("");
  };

  const toggleGoal = (id) => {
    update({ ...data, goals: data.goals.map(g => g.id===id ? {...g, done:!g.done} : g) });
  };

  return (
    <div>
      <SectionTitle icon="🎯" title="Goals" />
      <Card>
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Add a goal..."
            style={{ ...inputStyle(), marginBottom:0, flex:1 }} />
          <button onClick={addGoal} style={{
            padding:"0 16px", borderRadius:12, border:"none", background:C.pink,
            color:C.white, fontWeight:800, fontFamily:F, cursor:"pointer"
          }}>Add</button>
        </div>
        {data.goals.length===0 && <div style={{ color:C.textMut, fontFamily:FB, fontSize:13 }}>No goals yet — what do you want to achieve? 🎯</div>}
        {data.goals.map(g=>(
          <Checkbox key={g.id} checked={g.done} label={g.title} onChange={()=>toggleGoal(g.id)} />
        ))}
      </Card>
    </div>
  );
}

// ── FINANCE ──────────────────────────────────────────────────────────────────
function Finance({ data, update }) {
  const [income, setIncomeInput] = useState(data.finance.income || "");
  const [expName, setExpName] = useState("");
  const [expAmt, setExpAmt] = useState("");
  const [savingsName, setSavingsName] = useState("");
  const [savingsTarget, setSavingsTarget] = useState("");
  const [debtName, setDebtName] = useState("");
  const [debtAmt, setDebtAmt] = useState("");

  const incomeNum = parseFloat(data.finance.income) || 0;

  const saveIncome = () => {
    update({ ...data, finance: { ...data.finance, income } });
  };

  const addExpense = () => {
    if (!expName.trim() || !expAmt) return;
    update({ ...data, finance: { ...data.finance, expenses: [...data.finance.expenses, { name:expName, amount:parseFloat(expAmt), date:TODAY }] } });
    setExpName(""); setExpAmt("");
  };

  const addSavingsGoal = () => {
    if (!savingsName.trim() || !savingsTarget) return;
    update({ ...data, finance: { ...data.finance, savingsGoals: [...data.finance.savingsGoals, { name:savingsName, target:parseFloat(savingsTarget), saved:0 }] } });
    setSavingsName(""); setSavingsTarget("");
  };

  const addDebt = () => {
    if (!debtName.trim() || !debtAmt) return;
    update({ ...data, finance: { ...data.finance, debts: [...data.finance.debts, { name:debtName, amount:parseFloat(debtAmt) }] } });
    setDebtName(""); setDebtAmt("");
  };

  const thisMonth = TODAY.slice(0,7);
  const monthExpenses = data.finance.expenses.filter(e => e.date.slice(0,7)===thisMonth);
  const totalMonth = monthExpenses.reduce((s,e)=>s+e.amount,0);
  const remaining = incomeNum - totalMonth;
  const pctUsed = incomeNum > 0 ? (totalMonth/incomeNum)*100 : 0;

  return (
    <div>
      <SectionTitle icon="💰" title="Revenue" sub="Monthly income" />
      <Card>
        <div style={{ display:"flex", gap:8, marginBottom:4 }}>
          <input value={income} onChange={(e)=>setIncomeInput(e.target.value)} onBlur={saveIncome}
            placeholder="e.g. 8000" type="number"
            style={{ ...inputStyle(), marginBottom:0, flex:1 }} />
          <button onClick={saveIncome} style={{
            padding:"0 16px", borderRadius:12, border:"none", background:C.pink,
            color:C.white, fontWeight:800, fontFamily:F, cursor:"pointer"
          }}>Save</button>
        </div>
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
        <Card style={{ marginBottom:0 }}>
          <div style={{ fontFamily:FB, fontSize:11, color:C.textDim, marginBottom:4 }}>Spent this month</div>
          <div style={{ fontFamily:F, fontSize:20, fontWeight:800, color:C.red }}>{totalMonth.toFixed(0)}</div>
        </Card>
        <Card style={{ marginBottom:0 }}>
          <div style={{ fontFamily:FB, fontSize:11, color:C.textDim, marginBottom:4 }}>Remaining</div>
          <div style={{ fontFamily:F, fontSize:20, fontWeight:800, color: remaining>=0 ? C.green : C.red }}>{remaining.toFixed(0)}</div>
        </Card>
      </div>

      {incomeNum > 0 && (
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontFamily:FB, fontSize:13, color:C.text }}>Budget used</span>
            <span style={{ fontFamily:FB, fontSize:13, fontWeight:700, color: pctUsed>80 ? C.red : C.pink }}>{Math.round(pctUsed)}%</span>
          </div>
          <ProgressBar pct={Math.min(100,pctUsed)} color={pctUsed>80 ? C.red : C.pink} />
          {pctUsed>80 && <div style={{ fontFamily:FB, fontSize:12, color:C.red, marginTop:6 }}>⚠️ Careful, almost at your budget limit!</div>}
        </Card>
      )}

      <SectionTitle icon="💸" title="Expenses" sub={`Total: ${totalMonth.toFixed(2)}`} />
      <Card>
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          <input value={expName} onChange={(e)=>setExpName(e.target.value)} placeholder="What did you spend on?"
            style={{ ...inputStyle(), marginBottom:0, flex:2 }} />
          <input value={expAmt} onChange={(e)=>setExpAmt(e.target.value)} placeholder="Amount" type="number"
            style={{ ...inputStyle(), marginBottom:0, flex:1 }} />
          <button onClick={addExpense} style={{
            padding:"0 16px", borderRadius:12, border:"none", background:C.pink,
            color:C.white, fontWeight:800, fontFamily:F, cursor:"pointer"
          }}>Add</button>
        </div>
        {data.finance.expenses.slice().reverse().slice(0,6).map((e,i)=>(
          <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
            <span style={{ fontFamily:FB, fontSize:14, color:C.text }}>{e.name}</span>
            <span style={{ fontFamily:F, fontSize:14, fontWeight:700, color:C.pink }}>{e.amount.toFixed(2)}</span>
          </div>
        ))}
      </Card>

      <SectionTitle icon="🏦" title="Savings goals" />
      <Card>
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          <input value={savingsName} onChange={(e)=>setSavingsName(e.target.value)} placeholder="e.g. trip, new bag..."
            style={{ ...inputStyle(), marginBottom:0, flex:2 }} />
          <input value={savingsTarget} onChange={(e)=>setSavingsTarget(e.target.value)} placeholder="Target" type="number"
            style={{ ...inputStyle(), marginBottom:0, flex:1 }} />
          <button onClick={addSavingsGoal} style={{
            padding:"0 16px", borderRadius:12, border:"none", background:C.pink,
            color:C.white, fontWeight:800, fontFamily:F, cursor:"pointer"
          }}>Add</button>
        </div>
        {data.finance.savingsGoals.map((g,i)=>(
          <div key={i} style={{ marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontFamily:FB, fontSize:14, color:C.text }}>{g.name}</span>
              <span style={{ fontFamily:F, fontSize:13, color:C.textDim }}>{g.saved}/{g.target}</span>
            </div>
            <ProgressBar pct={(g.saved/Math.max(1,g.target))*100} />
          </div>
        ))}
      </Card>

      <SectionTitle icon="📉" title="Debts" />
      <Card>
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          <input value={debtName} onChange={(e)=>setDebtName(e.target.value)} placeholder="Who / what"
            style={{ ...inputStyle(), marginBottom:0, flex:2 }} />
          <input value={debtAmt} onChange={(e)=>setDebtAmt(e.target.value)} placeholder="Amount" type="number"
            style={{ ...inputStyle(), marginBottom:0, flex:1 }} />
          <button onClick={addDebt} style={{
            padding:"0 16px", borderRadius:12, border:"none", background:C.pink,
            color:C.white, fontWeight:800, fontFamily:F, cursor:"pointer"
          }}>Add</button>
        </div>
        {data.finance.debts.length===0 && <div style={{ color:C.textMut, fontFamily:FB, fontSize:13 }}>No debts logged 🎉</div>}
        {data.finance.debts.map((d,i)=>(
          <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
            <span style={{ fontFamily:FB, fontSize:14, color:C.text }}>{d.name}</span>
            <span style={{ fontFamily:F, fontSize:14, fontWeight:700, color:C.red }}>{d.amount.toFixed(2)}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── WELLBEING ────────────────────────────────────────────────────────────────
const MOODS = ["😊","😌","😐","😔","😤","🥰"];

function Wellbeing({ data, update }) {
  const [gratitude, setGratitude] = useState(data.wellbeing.gratitude[TODAY] || "");
  const mood = data.wellbeing.moods[TODAY];

  const setMood = (m) => {
    update({ ...data, wellbeing: { ...data.wellbeing, moods: { ...data.wellbeing.moods, [TODAY]: m } } });
  };

  const saveGratitude = () => {
    update({ ...data, wellbeing: { ...data.wellbeing, gratitude: { ...data.wellbeing.gratitude, [TODAY]: gratitude } } });
  };

  return (
    <div>
      <SectionTitle icon="🌸" title="Mood" sub="How are you feeling today?" />
      <Card>
        <div style={{ display:"flex", gap:10, justifyContent:"space-between" }}>
          {MOODS.map(m => (
            <div key={m} onClick={()=>setMood(m)} style={{
              fontSize:28, cursor:"pointer", padding:8, borderRadius:14,
              background: mood===m ? C.blush : "transparent",
              border: mood===m ? `1px solid ${C.pink}` : "1px solid transparent"
            }}>{m}</div>
          ))}
        </div>
      </Card>

      <SectionTitle icon="🙏" title="Gratitude" sub="What are you grateful for today?" />
      <Card>
        <textarea value={gratitude} onChange={(e)=>setGratitude(e.target.value)} onBlur={saveGratitude}
          placeholder="Write something..." rows={4}
          style={{ ...inputStyle(), resize:"vertical", marginBottom:8 }} />
        <button onClick={saveGratitude} style={{
          padding:"10px 18px", borderRadius:12, border:"none", background:C.pink,
          color:C.white, fontWeight:800, fontFamily:F, cursor:"pointer"
        }}>Save</button>
      </Card>
    </div>
  );
}

// ── APP ──────────────────────────────────────────────────────────────────────
function Dashboard() {
  const [data, setData] = useState(load());
  const [active, setActive] = useState("home");
  const [showPwModal, setShowPwModal] = useState(false);

  const update = useCallback((next) => {
    setData(next);
    save(next);
  }, []);

  useEffect(() => { save(data); }, [data]);

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:F, paddingBottom:90 }}>
      <TopBar onChangePassword={()=>setShowPwModal(true)} />
      <div style={{ padding:"0 16px" }}>
        {active==="home" && <Home data={data} setActive={setActive} />}
        {active==="routine" && <Routine data={data} update={update} />}
        {active==="tasks" && <Tasks data={data} update={update} />}
        {active==="faith" && <Faith data={data} update={update} />}
        {active==="fitness" && <Fitness data={data} update={update} />}
        {active==="diet" && <Diet data={data} update={update} />}
        {active==="learning" && <Learning data={data} update={update} />}
        {active==="goals" && <Goals data={data} update={update} />}
        {active==="finance" && <Finance data={data} update={update} />}
        {active==="wellbeing" && <Wellbeing data={data} update={update} />}
      </div>
      <NavBar active={active} setActive={setActive} />
      {showPwModal && <ChangePasswordModal onClose={()=>setShowPwModal(false)} />}
    </div>
  );
}

export default function App() {
  const [unlocked, setUnlocked] = useState(() => {
    try { return !!sessionStorage.getItem(AUTH_KEY); } catch (e) { return false; }
  });
  if (!unlocked) return <PasswordGate onUnlock={()=>setUnlocked(true)} />;
  return <Dashboard />;
}
