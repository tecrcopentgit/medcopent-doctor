import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Stethoscope, User, LogIn, LogOut, MessageSquare,
  Pill, FileText, Calendar, ChevronRight, Send,
  Loader2, AlertCircle, Check, CheckCheck, RefreshCcw,
  Activity, Droplets, Heart, X, Eye, EyeOff,
  ClipboardList, CalendarPlus, NotebookPen, Mic, MicOff,
  Phone, Video, PhoneOff, Edit2, Trash2, MoreVertical,
  ShieldOff, Shield, Plus, CheckCircle, Upload
} from 'lucide-react';

const API = 'https://personal-medical-assistance-abdul.onrender.com';

const inputCls = `w-full px-4 py-3 rounded-xl text-sm font-medium text-white
  bg-slate-800/80 border border-slate-700 placeholder-slate-500
  focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500
  hover:border-slate-500 transition-all duration-200`;

const NOTE_TYPES = ['Diagnosis', 'Prescription', 'Lab Result', 'Observation', 'Follow-up', 'Alert'];
const NOTE_ICONS = { Diagnosis:'🩺', Prescription:'💊', 'Lab Result':'🧪', Observation:'👁', 'Follow-up':'📅', Alert:'⚠️' };
const NOTE_COLOR = {
  Diagnosis: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Prescription: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  'Lab Result': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  Observation: 'text-slate-300 bg-slate-700/30 border-slate-600/30',
  'Follow-up': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Alert: 'text-red-400 bg-red-500/10 border-red-500/20',
};

function getDoctorSession() { try { return JSON.parse(localStorage.getItem('doctor_data') ?? 'null'); } catch { return null; } }
function saveDoctorSession(d) { localStorage.setItem('doctor_data', JSON.stringify(d)); }
function clearDoctorSession() { localStorage.removeItem('doctor_data'); }
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day:'numeric', month:'short' });
}

// ════════════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════════════
const DoctorAuth = ({ onLogin }) => {
  const [mode,setMode] = useState('login');
  const [form,setForm] = useState({ doctorEmail:'', doctorPassword:'', doctorName:'', specialization:'', hospital:'' });
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  const [showPass,setShowPass] = useState(false);
  const handle = e => { setForm(p=>({...p,[e.target.name]:e.target.value})); if(error)setError(''); };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.doctorEmail||!form.doctorPassword) return setError('Email and password required');
    if (mode==='register'&&!form.doctorName) return setError('Full name required');
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}${mode==='login'?'/doctor/login':'/doctor/register'}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      const data = await res.json();
      if (data.error){setError(data.error);return;}
      if (mode==='login'){saveDoctorSession(data.doctor);onLogin(data.doctor);}
      else{setMode('login');alert('Registered! Please login.');}
    } catch(err){setError(err.message);}
    finally{setLoading(false);}
  };
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center"><Stethoscope size={28} className="text-violet-400"/></div>
          <h1 className="text-2xl font-bold text-white">Doctor Portal</h1>
          <p className="text-slate-400 text-sm">MedCOPENT — Medical Assistance Platform</p>
        </div>
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl p-7 shadow-2xl">
          <div className="flex gap-2 mb-6 bg-slate-800/60 rounded-xl p-1">
            {['login','register'].map(m=>(
              <button key={m} onClick={()=>setMode(m)} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode===m?'bg-violet-600 text-white shadow-lg':'text-slate-400 hover:text-white'}`}>
                {m==='login'?'Login':'Register'}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode==='register'&&(<>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label><input name="doctorName" value={form.doctorName} onChange={handle} placeholder="Dr. Ahmed Khan" className={inputCls}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Specialization</label><input name="specialization" value={form.specialization} onChange={handle} placeholder="Cardiology" className={inputCls}/></div>
                <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hospital</label><input name="hospital" value={form.hospital} onChange={handle} placeholder="City Hospital" className={inputCls}/></div>
              </div>
            </>)}
            <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label><input name="doctorEmail" value={form.doctorEmail} onChange={handle} placeholder="doctor@hospital.com" className={inputCls} type="email"/></div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative"><input name="doctorPassword" value={form.doctorPassword} onChange={handle} type={showPass?'text':'password'} placeholder="Min 6 characters" className={`${inputCls} pr-11`}/>
                <button type="button" onClick={()=>setShowPass(p=>!p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">{showPass?<EyeOff size={15}/>:<Eye size={15}/>}</button>
              </div>
            </div>
            {error&&<div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3"><AlertCircle size={13}/>{error}</div>}
            <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm shadow-lg transition-all active:scale-95 disabled:opacity-60 mt-1">
              {loading?<><Loader2 size={15} className="animate-spin"/>Processing…</>:<><LogIn size={15}/>{mode==='login'?'Login':'Create Account'}</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// VOICE RECORDER
// ════════════════════════════════════════════════════════════════════
const VoiceRecorder = ({ onSend, disabled }) => {
  const [recording,setRecording] = useState(false);
  const [seconds,setSeconds]     = useState(0);
  const mediaRef   = useRef(null);
  const chunksRef  = useRef([]);
  const timerRef   = useRef(null);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => { if(e.data.size>0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type:'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => onSend(reader.result, seconds);
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t=>t.stop());
        clearInterval(timerRef.current);
        setSeconds(0);
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds(s=>s+1), 1000);
    } catch { alert('Microphone permission denied'); }
  };

  const stop = () => { mediaRef.current?.stop(); setRecording(false); };

  return (
    <button
      onMouseDown={start} onMouseUp={stop} onTouchStart={start} onTouchEnd={stop}
      disabled={disabled}
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0
        ${recording ? 'bg-red-600 animate-pulse scale-110' : 'bg-slate-700 hover:bg-slate-600'}
        disabled:opacity-40`}
      title={recording ? `Recording… ${seconds}s (release to send)` : 'Hold to record voice message'}
    >
      {recording ? <MicOff size={15} className="text-white"/> : <Mic size={15} className="text-slate-300"/>}
    </button>
  );
};

// ════════════════════════════════════════════════════════════════════
// VOICE MESSAGE PLAYER
// ════════════════════════════════════════════════════════════════════
const VoicePlayer = ({ voiceData }) => {
  const [playing,setPlaying]   = useState(false);
  const [progress,setProgress] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio(voiceData);
    audioRef.current = audio;
    audio.ontimeupdate = () => setProgress(audio.duration ? (audio.currentTime/audio.duration)*100 : 0);
    audio.onended = () => { setPlaying(false); setProgress(0); };
    return () => audio.pause();
  }, [voiceData]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play(); setPlaying(true); }
  };

  return (
    <div className="flex items-center gap-2 min-w-[160px]">
      <button onClick={toggle} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
        {playing ? <span className="text-xs">⏸</span> : <span className="text-xs">▶</span>}
      </button>
      <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
        <div className="h-full bg-white/70 rounded-full transition-all" style={{ width:`${progress}%` }}/>
      </div>
      <Mic size={11} className="opacity-60 shrink-0"/>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// CALL MODAL
// ════════════════════════════════════════════════════════════════════
const CallModal = ({ roomId, callType, onClose }) => {
  const [url,setUrl]       = useState('');
  const [loading,setLoading] = useState(true);
  const [error,setError]   = useState('');

  useEffect(() => {
    fetch(`${API}/call/create-room`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ roomId }),
    })
    .then(r=>r.json())
    .then(d => { if(d.error){setError(d.error);}else{setUrl(d.url);} setLoading(false); })
    .catch(e => { setError(e.message); setLoading(false); });
  }, [roomId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm text-center flex flex-col gap-4">
        <div className="flex items-center justify-center gap-2">
          {callType==='video' ? <Video size={20} className="text-violet-400"/> : <Phone size={20} className="text-emerald-400"/>}
          <h3 className="text-white font-bold">{callType==='video'?'Video Call':'Voice Call'}</h3>
        </div>
        {loading && <div className="flex items-center justify-center py-6"><Loader2 size={22} className="text-violet-400 animate-spin"/></div>}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
            {error}<br/><span className="text-xs opacity-70">Add DAILY_API_KEY to your Render environment to enable calls.</span>
          </div>
        )}
        {url && !error && (
          <>
            <p className="text-slate-400 text-sm">Your call room is ready. Click below to open it.</p>
            <a href={url} target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all">
              {callType==='video'?<Video size={15}/>:<Phone size={15}/>} Join {callType==='video'?'Video':'Voice'} Call
            </a>
            <p className="text-slate-600 text-xs">Share the same room link with your patient by copying it from the browser.</p>
          </>
        )}
        <button onClick={onClose} className="flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm transition-all">
          <PhoneOff size={13}/> Close
        </button>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// ADD MEDICINE FORM (doctor → patient)
// ════════════════════════════════════════════════════════════════════
const AddMedicineForm = ({ doctorEmail, patientEmail, onDone }) => {
  const [form,setForm] = useState({ medicineName:'', medicineType:'', medicineDosage:'', medicineNumber:'', medicineDate:'', medicineTime:'', notes:'' });
  const [loading,setLoading] = useState(false);
  const [success,setSuccess] = useState(false);
  const [error,setError] = useState('');
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const submit = async () => {
    if (!form.medicineName||!form.medicineDosage) return setError('Medicine name and dosage are required');
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/doctor/add-medicine`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({doctorEmail,patientEmail,...form})});
      const data = await res.json();
      if (data.error){setError(data.error);return;}
      setSuccess(true);
      setTimeout(()=>{setSuccess(false);setForm({medicineName:'',medicineType:'',medicineDosage:'',medicineNumber:'',medicineDate:'',medicineTime:'',notes:''});onDone?.();},1800);
    } catch(err){setError(err.message);}
    finally{setLoading(false);}
  };

  if (success) return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center"><CheckCircle size={20} className="text-emerald-400"/></div>
      <p className="text-emerald-400 font-semibold text-sm">Medicine added to patient!</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Medicine Name *</label><input value={form.medicineName} onChange={set('medicineName')} placeholder="e.g. Amlodipine" className={inputCls}/></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</label><input value={form.medicineType} onChange={set('medicineType')} placeholder="Tablet / Syrup" className={inputCls}/></div>
        <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dosage (mg) *</label><input value={form.medicineDosage} onChange={set('medicineDosage')} placeholder="5" className={inputCls}/></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Qty</label><input type="number" value={form.medicineNumber} onChange={set('medicineNumber')} placeholder="30" className={inputCls}/></div>
        <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Start Date</label><input type="date" value={form.medicineDate} onChange={set('medicineDate')} className={inputCls}/></div>
      </div>
      <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Time</label><input type="time" value={form.medicineTime} onChange={set('medicineTime')} className={inputCls}/></div>
      <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Instructions</label><textarea value={form.notes} onChange={set('notes')} rows={2} placeholder="Take after meals, twice daily…" className={`${inputCls} resize-none`}/></div>
      <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-xl px-3 py-2"><Stethoscope size={12} className="text-violet-400 shrink-0"/><span className="text-violet-300 text-xs">This medicine will appear directly in patient's medicine list.</span></div>
      {error&&<div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl px-3 py-2"><AlertCircle size={12}/>{error}</div>}
      <button onClick={submit} disabled={loading} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all active:scale-95 disabled:opacity-60">
        {loading?<><Loader2 size={14} className="animate-spin"/>Saving…</>:<><Pill size={14}/>Add Medicine to Patient</>}
      </button>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// ADD APPOINTMENT FORM
// ════════════════════════════════════════════════════════════════════
const AddAppointmentForm = ({ doctorEmail, patientEmail, onDone }) => {
  const [form,setForm] = useState({ consultFor:'', consultDate:'', consultTime:'' });
  const [loading,setLoading] = useState(false);
  const [success,setSuccess] = useState(false);
  const [error,setError] = useState('');
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const submit = async () => {
    if (!form.consultFor||!form.consultDate||!form.consultTime) return setError('All fields required');
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/doctor/add-appointment`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({doctorEmail,patientEmail,...form})});
      const data = await res.json();
      if (data.error){setError(data.error);return;}
      setSuccess(true);
      setTimeout(()=>{setSuccess(false);setForm({consultFor:'',consultDate:'',consultTime:''});onDone?.();},1800);
    } catch(err){setError(err.message);}
    finally{setLoading(false);}
  };

  if (success) return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center"><CheckCircle size={20} className="text-emerald-400"/></div>
      <p className="text-emerald-400 font-semibold text-sm">Appointment added!</p>
      <p className="text-slate-500 text-xs">Patient will see it in their appointments.</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Consulting For</label><input value={form.consultFor} onChange={set('consultFor')} placeholder="e.g. Blood pressure follow-up" className={inputCls}/></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</label><input type="date" value={form.consultDate} onChange={set('consultDate')} className={inputCls}/></div>
        <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Time</label><input type="time" value={form.consultTime} onChange={set('consultTime')} className={inputCls}/></div>
      </div>
      <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-xl px-3 py-2"><Stethoscope size={12} className="text-violet-400 shrink-0"/><span className="text-violet-300 text-xs">Your name is automatically attached.</span></div>
      {error&&<div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl px-3 py-2"><AlertCircle size={12}/>{error}</div>}
      <button onClick={submit} disabled={loading} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all active:scale-95 disabled:opacity-60">
        {loading?<><Loader2 size={14} className="animate-spin"/>Saving…</>:<><CalendarPlus size={14}/>Add Appointment</>}
      </button>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// ADD NOTE FORM
// ════════════════════════════════════════════════════════════════════
const AddNoteForm = ({ doctorEmail, patientEmail, roomId, onDone }) => {
  const [form,setForm] = useState({ noteType:'Diagnosis', title:'', content:'' });
  const [loading,setLoading] = useState(false);
  const [success,setSuccess] = useState(false);
  const [error,setError] = useState('');
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const submit = async () => {
    if (!form.title||!form.content) return setError('Title and content required');
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/doctor/note`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({doctorEmail,patientEmail,roomId,...form})});
      const data = await res.json();
      if (data.error){setError(data.error);return;}
      setSuccess(true);
      setTimeout(()=>{setSuccess(false);setForm({noteType:'Diagnosis',title:'',content:''});onDone?.();},1800);
    } catch(err){setError(err.message);}
    finally{setLoading(false);}
  };

  if (success) return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center"><CheckCircle size={20} className="text-emerald-400"/></div>
      <p className="text-emerald-400 font-semibold text-sm">Note saved!</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-3 p-4">
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Note Type</label>
        <div className="flex flex-wrap gap-2">
          {NOTE_TYPES.map(t=>(
            <button key={t} onClick={()=>setForm(p=>({...p,noteType:t}))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                ${form.noteType===t?'bg-violet-600 text-white':'bg-slate-800 text-slate-400 border border-slate-700 hover:border-violet-500/40 hover:text-violet-300'}`}>
              <span style={{fontSize:12}}>{NOTE_ICONS[t]}</span>{t}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</label><input value={form.title} onChange={set('title')} placeholder={`${form.noteType} summary`} className={inputCls}/></div>
      <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Details</label><textarea value={form.content} onChange={set('content')} rows={5} placeholder="Clinical details, dosage, observations…" className={`${inputCls} resize-none`}/></div>
      {error&&<div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl px-3 py-2"><AlertCircle size={12}/>{error}</div>}
      <button onClick={submit} disabled={loading} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all active:scale-95 disabled:opacity-60">
        {loading?<><Loader2 size={14} className="animate-spin"/>Saving…</>:<><NotebookPen size={14}/>Save Note</>}
      </button>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// PATIENT DATA PANEL
// ════════════════════════════════════════════════════════════════════
const PatientDataPanel = ({ patientEmail, doctorEmail, roomId, onClose }) => {
  const [data,setData]     = useState(null);
  const [notes,setNotes]   = useState([]);
  const [loading,setLoading] = useState(true);
  const [tab,setTab]       = useState('profile');

  const fetchData = useCallback(() => {
    Promise.all([
      fetch(`${API}/chat/patient-data/${encodeURIComponent(patientEmail)}`).then(r=>r.json()),
      fetch(`${API}/doctor/notes/${encodeURIComponent(patientEmail)}`).then(r=>r.json()),
    ]).then(([d,n])=>{setData(d);setNotes(Array.isArray(n)?n:[]);setLoading(false);}).catch(()=>setLoading(false));
  },[patientEmail]);

  useEffect(()=>{fetchData();},[fetchData]);

  const tabs = [
    {id:'profile',label:'Profile',icon:User},
    {id:'medicines',label:'Meds',icon:Pill},
    {id:'reports',label:'Reports',icon:FileText},
    {id:'appointments',label:'Appts',icon:Calendar},
    {id:'notes',label:'Notes',icon:ClipboardList},
    {id:'add_med',label:'+ Med',icon:Pill},
    {id:'add_appt',label:'+ Appt',icon:CalendarPlus},
    {id:'add_note',label:'+ Note',icon:NotebookPen},
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-700/50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2"><User size={14} className="text-violet-400"/>
          <span className="text-white font-bold text-sm truncate max-w-[160px]">{patientEmail.split('@')[0]}</span>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all"><X size={13}/></button>
      </div>
      <div className="flex gap-1 px-2 pt-2 pb-1.5 overflow-x-auto border-b border-slate-800 shrink-0" style={{scrollbarWidth:'none'}}>
        {tabs.map(({id,label,icon:Icon})=>(
          <button key={id} onClick={()=>setTab(id)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all
              ${tab===id ? (id.startsWith('add')?'bg-emerald-600 text-white':'bg-violet-600 text-white') : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <Icon size={11}/>{label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto pb-4">
        {loading && <div className="flex items-center justify-center py-10 text-slate-500"><Loader2 size={18} className="animate-spin"/></div>}

        {!loading && data && tab==='profile' && (
          <div className="flex flex-col gap-2 p-3">
            {[{label:'Name',value:data.profile?.user_name??'—',icon:User},{label:'Age',value:data.profile?.user_age?`${data.profile.user_age} yrs`:'—',icon:Activity},{label:'Gender',value:data.profile?.user_gender??'—',icon:User},{label:'Blood',value:data.profile?.user_blood??'—',icon:Droplets},{label:'DOB',value:data.profile?.user_dob?new Date(data.profile.user_dob).toLocaleDateString('en-GB'):'—',icon:Calendar},{label:'Family History',value:data.profile?.user_family_history??'—',icon:Heart}].map(({label,value,icon:Icon})=>(
              <div key={label} className="bg-slate-800/60 border border-slate-700/40 rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-1.5 mb-0.5"><Icon size={10} className="text-violet-400"/><span className="text-slate-500 text-xs uppercase tracking-wider">{label}</span></div>
                <span className="text-slate-200 text-sm font-medium leading-relaxed">{value}</span>
              </div>
            ))}
          </div>
        )}

        {!loading && data && tab==='medicines' && (
          <div className="flex flex-col gap-2 p-3">
            {data.medicines.length===0 ? <p className="text-slate-500 text-xs text-center py-6">No medicines</p>
              : data.medicines.map((m,i)=>(
                <div key={i} className="bg-slate-800/60 border border-slate-700/40 rounded-xl px-3 py-2.5">
                  <div className="flex items-center justify-between mb-1"><span className="text-white font-semibold text-sm">{m.medicine_name}</span><span className="text-cyan-400 text-xs">{m.medicine_dosage}mg</span></div>
                  <div className="text-slate-400 text-xs">{m.medicine_type} · Qty: {m.medicine_num??'—'}</div>
                  {m.notes&&<div className="text-violet-400 text-xs mt-0.5">{m.notes}</div>}
                </div>
              ))
            }
          </div>
        )}

        {!loading && data && tab==='reports' && (
          <div className="flex flex-col gap-2 p-3">
            {data.reports.length===0 ? <p className="text-slate-500 text-xs text-center py-6">No reports</p>
              : data.reports.map((r,i)=>(
                <div key={i} className="bg-slate-800/60 border border-slate-700/40 rounded-xl px-3 py-2.5">
                  <span className="text-white font-semibold text-sm">{r.report_name}</span>
                  <div className="text-slate-400 text-xs mt-0.5">{r.report_type}</div>
                  <div className="text-slate-500 text-xs">{new Date(r.created_at).toLocaleDateString('en-GB')}</div>
                </div>
              ))
            }
          </div>
        )}

        {!loading && data && tab==='appointments' && (
          <div className="flex flex-col gap-2 p-3">
            {data.appointments.length===0 ? <p className="text-slate-500 text-xs text-center py-6">No appointments</p>
              : data.appointments.map((a,i)=>(
                <div key={i} className="bg-slate-800/60 border border-slate-700/40 rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-1.5 mb-1"><Stethoscope size={11} className="text-violet-400"/><span className="text-white font-semibold text-sm">Dr. {a.doctor_name}</span></div>
                  <div className="text-violet-400 text-xs">{a.consult_for}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{new Date(a.consult_date).toLocaleDateString('en-GB')} at {a.consult_time}</div>
                </div>
              ))
            }
          </div>
        )}

        {!loading && tab==='notes' && (
          <div className="flex flex-col gap-2 p-3">
            {notes.length===0
              ? <div className="flex flex-col items-center gap-3 py-10 text-center"><ClipboardList size={24} className="text-slate-600"/><p className="text-slate-500 text-xs">No notes yet.</p></div>
              : notes.map(n=>(
                <div key={n.note_id} className={`border rounded-xl px-3 py-2.5 ${NOTE_COLOR[n.note_type]??'text-slate-300 bg-slate-700/30 border-slate-600/30'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{n.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${NOTE_COLOR[n.note_type]??''}`}>{n.note_type}</span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-80 whitespace-pre-line">{n.content}</p>
                  <p className="text-xs opacity-50 mt-1.5">{timeAgo(n.created_at)}</p>
                </div>
              ))
            }
          </div>
        )}

        {tab==='add_med'  && <AddMedicineForm    doctorEmail={doctorEmail} patientEmail={patientEmail} onDone={()=>{fetchData();setTab('medicines');}}/>}
        {tab==='add_appt' && <AddAppointmentForm doctorEmail={doctorEmail} patientEmail={patientEmail} onDone={()=>{fetchData();setTab('appointments');}}/>}
        {tab==='add_note' && <AddNoteForm        doctorEmail={doctorEmail} patientEmail={patientEmail} roomId={roomId} onDone={()=>{fetchData();setTab('notes');}}/>}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// MESSAGE BUBBLE with edit/delete context menu
// ════════════════════════════════════════════════════════════════════
const MessageBubble = ({ msg, isMe, myEmail, onEdit, onDelete }) => {
  const [showMenu,setShowMenu] = useState(false);
  const [editing,setEditing]   = useState(false);
  const [editVal,setEditVal]   = useState(msg.message);

  const confirmEdit = () => {
    if (editVal.trim() && editVal !== msg.message) onEdit(msg.message_id, editVal.trim());
    setEditing(false);
  };

  if (msg.deleted) return (
    <div className={`flex ${isMe?'justify-end':'justify-start'}`}>
      <span className="text-slate-600 text-xs italic px-4 py-2">This message was deleted</span>
    </div>
  );

  return (
    <div className={`flex ${isMe?'justify-end':'justify-start'} group`}>
      <div className={`max-w-[75%] flex flex-col gap-1 ${isMe?'items-end':'items-start'}`}>
        {editing ? (
          <div className="flex gap-2 items-end">
            <textarea value={editVal} onChange={e=>setEditVal(e.target.value)} rows={2}
              className="px-3 py-2 rounded-xl text-sm text-white bg-slate-700 border border-violet-500 focus:outline-none resize-none min-w-[200px]"
              onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();confirmEdit();}if(e.key==='Escape')setEditing(false);}}
            />
            <button onClick={confirmEdit} className="px-3 py-2 rounded-xl bg-violet-600 text-white text-xs">Save</button>
            <button onClick={()=>setEditing(false)} className="px-3 py-2 rounded-xl bg-slate-700 text-slate-300 text-xs">Cancel</button>
          </div>
        ) : (
          <div className="flex items-end gap-1.5">
            {isMe && (
              <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={()=>setShowMenu(p=>!p)} className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white">
                  <MoreVertical size={12}/>
                </button>
                {showMenu && (
                  <div className="absolute bottom-8 right-0 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-10 overflow-hidden min-w-[120px]">
                    <button onClick={()=>{setEditing(true);setShowMenu(false);}} className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 w-full"><Edit2 size={11}/>Edit</button>
                    <button onClick={()=>{onDelete(msg.message_id);setShowMenu(false);}} className="flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-slate-700 w-full"><Trash2 size={11}/>Delete</button>
                  </div>
                )}
              </div>
            )}
            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
              ${isMe?'bg-violet-600 text-white rounded-br-md':'bg-slate-800 border border-slate-700/50 text-slate-200 rounded-bl-md'}`}>
              {msg.msg_type==='voice' && msg.voice_data
                ? <VoicePlayer voiceData={msg.voice_data}/>
                : msg.message
              }
              {msg.edited && <span className="text-xs opacity-50 ml-2">(edited)</span>}
            </div>
          </div>
        )}
        <div className="flex items-center gap-1 text-slate-600 text-xs">
          <span>{timeAgo(msg.created_at)}</span>
          {isMe && (msg.is_read?<CheckCheck size={11} className="text-violet-400"/>:<Check size={11}/>)}
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// CHAT WINDOW
// ════════════════════════════════════════════════════════════════════
const ChatWindow = ({ room, doctorEmail, doctorName, onBack }) => {
  const [messages,setMessages]       = useState([]);
  const [input,setInput]             = useState('');
  const [sending,setSending]         = useState(false);
  const [showPatient,setShowPatient] = useState(false);
  const [loading,setLoading]         = useState(true);
  const [blockStatus,setBlockStatus] = useState({ blockedByMe:false, blockedByOther:false });
  const [call,setCall]               = useState(null); // 'voice' | 'video' | null
  const bottomRef  = useRef(null);
  const pollRef    = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`${API}/chat/messages/${room.room_id}`);
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } catch{}
    finally{setLoading(false);}
  },[room.room_id]);

  const fetchBlockStatus = useCallback(async () => {
    const res = await fetch(`${API}/chat/block-status/${encodeURIComponent(doctorEmail)}/${encodeURIComponent(room.patient_email)}`);
    const data = await res.json();
    setBlockStatus(data);
  },[doctorEmail, room.patient_email]);

  useEffect(()=>{
    fetchMessages();
    fetchBlockStatus();
    fetch(`${API}/chat/read/${room.room_id}/${encodeURIComponent(doctorEmail)}`,{method:'PUT'});
    pollRef.current = setInterval(fetchMessages, 3000);
    return ()=>clearInterval(pollRef.current);
  },[room.room_id, doctorEmail, fetchMessages, fetchBlockStatus]);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'});},[messages]);

  const sendMessage = async () => {
    if (!input.trim()||sending||blockStatus.anyBlock) return;
    const text = input.trim(); setInput(''); setSending(true);
    try {
      const res = await fetch(`${API}/chat/message`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({roomId:room.room_id,senderEmail:doctorEmail,senderRole:'doctor',message:text})});
      const data = await res.json();
      if (!data.error) setMessages(p=>[...p,data]);
    } catch{setInput(text);}
    finally{setSending(false);}
  };

  const sendVoice = async (base64Data, durationSec) => {
    try {
      const res = await fetch(`${API}/chat/voice`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({roomId:room.room_id,senderEmail:doctorEmail,senderRole:'doctor',voiceData:base64Data,durationSec})});
      const data = await res.json();
      if (!data.error) setMessages(p=>[...p,data]);
    } catch{}
  };

  const editMessage = async (messageId, newMessage) => {
    try {
      const res = await fetch(`${API}/chat/message/${messageId}/edit`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({senderEmail:doctorEmail,newMessage})});
      const data = await res.json();
      if (!data.error) setMessages(p=>p.map(m=>m.message_id===messageId?{...m,message:newMessage,edited:true}:m));
    } catch{}
  };

  const deleteMessage = async (messageId) => {
    try {
      await fetch(`${API}/chat/message/${messageId}`,{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({senderEmail:doctorEmail})});
      setMessages(p=>p.map(m=>m.message_id===messageId?{...m,deleted:true,message:'This message was deleted'}:m));
    } catch{}
  };

  const toggleBlock = async () => {
    const endpoint = blockStatus.blockedByMe ? '/chat/block' : '/chat/block';
    const method   = blockStatus.blockedByMe ? 'DELETE' : 'POST';
    await fetch(`${API}${endpoint}`,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify({blocker:doctorEmail,blocked:room.patient_email})});
    fetchBlockStatus();
  };

  const handleKey = e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();} };

  const blocked = blockStatus.anyBlock;

  return (
    <div className="flex h-full">
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/50 bg-slate-900/80">
          <button onClick={onBack} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all md:hidden"><ChevronRight size={14} className="rotate-180"/></button>
          <div className="w-9 h-9 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0"><User size={15} className="text-violet-400"/></div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">{room.patient_name||room.patient_email}</p>
            <p className="text-slate-500 text-xs truncate">{room.patient_email}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Voice call */}
            <button onClick={()=>setCall('voice')} title="Voice call"
              className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/25 transition-all">
              <Phone size={13}/>
            </button>
            {/* Video call */}
            <button onClick={()=>setCall('video')} title="Video call"
              className="w-8 h-8 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 hover:bg-blue-500/25 transition-all">
              <Video size={13}/>
            </button>
            {/* Block */}
            <button onClick={toggleBlock} title={blockStatus.blockedByMe?'Unblock patient':'Block patient'}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
                ${blockStatus.blockedByMe?'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30':'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'}`}>
              {blockStatus.blockedByMe?<Shield size={13}/>:<ShieldOff size={13}/>}
            </button>
            {/* Patient data panel */}
            <button onClick={()=>setShowPatient(p=>!p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
                ${showPatient?'bg-violet-600 text-white':'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'}`}>
              <Eye size={12}/>Data
            </button>
          </div>
        </div>

        {/* Block banner */}
        {blocked && (
          <div className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold
            ${blockStatus.blockedByMe?'bg-red-500/10 text-red-400':'bg-amber-500/10 text-amber-400'}`}>
            <Shield size={12}/>
            {blockStatus.blockedByMe ? 'You have blocked this patient. Unblock to chat.' : 'This patient has blocked you.'}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {loading && <div className="flex items-center justify-center py-10 text-slate-500"><Loader2 size={18} className="animate-spin"/></div>}
          {!loading && messages.length===0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3"><MessageSquare size={28} className="text-slate-600"/><p className="text-slate-500 text-sm">No messages yet.</p></div>
          )}
          {messages.map(msg=>(
            <MessageBubble key={msg.message_id} msg={msg} isMe={msg.sender_email===doctorEmail} myEmail={doctorEmail} onEdit={editMessage} onDelete={deleteMessage}/>
          ))}
          <div ref={bottomRef}/>
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-slate-700/50 bg-slate-900/80">
          <div className="flex items-end gap-2">
            <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey}
              disabled={blocked}
              placeholder={blocked?"Messaging is blocked…":"Type a message… (Enter to send)"}
              rows={1}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white bg-slate-800 border border-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 resize-none transition-all disabled:opacity-40"/>
            <VoiceRecorder onSend={sendVoice} disabled={blocked}/>
            <button onClick={sendMessage} disabled={!input.trim()||sending||blocked}
              className="w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-500 flex items-center justify-center text-white transition-all active:scale-95 disabled:opacity-50 shrink-0">
              {sending?<Loader2 size={15} className="animate-spin"/>:<Send size={15}/>}
            </button>
          </div>
        </div>
      </div>

      {showPatient && (
        <div className="w-80 shrink-0">
          <PatientDataPanel patientEmail={room.patient_email} doctorEmail={doctorEmail} roomId={room.room_id} onClose={()=>setShowPatient(false)}/>
        </div>
      )}

      {call && <CallModal roomId={room.room_id} callType={call} onClose={()=>setCall(null)}/>}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════
export default function DoctorPortal() {
  const [doctor,setDoctor]         = useState(getDoctorSession);
  const [rooms,setRooms]           = useState([]);
  const [activeRoom,setActiveRoom] = useState(null);
  const [loading,setLoading]       = useState(false);
  const [refreshing,setRefreshing] = useState(false);

  const fetchRooms = useCallback(async email => {
    try {
      const res = await fetch(`${API}/chat/rooms/doctor/${encodeURIComponent(email)}`);
      const data = await res.json();
      if (Array.isArray(data)) setRooms(data);
    } catch{}
    finally{setLoading(false);setRefreshing(false);}
  },[]);

  useEffect(()=>{
    if (!doctor) return;
    setLoading(true); fetchRooms(doctor.email);
    const interval = setInterval(()=>fetchRooms(doctor.email), 10000);
    return ()=>clearInterval(interval);
  },[doctor,fetchRooms]);

  const handleLogin  = doc => setDoctor(doc);
  const handleLogout = () => { clearDoctorSession(); setDoctor(null); setRooms([]); setActiveRoom(null); };

  if (!doctor) return <DoctorAuth onLogin={handleLogin}/>;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 bg-slate-900/80 border-b border-slate-700/50 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center"><Stethoscope size={16} className="text-violet-400"/></div>
          <div><p className="text-white font-bold text-sm leading-tight">Dr. {doctor.name}</p><p className="text-slate-500 text-xs">{doctor.specialization??'MedCOPENT Doctor'}</p></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/><span className="text-emerald-400 text-xs font-semibold">Online</span></div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"><LogOut size={13}/>Logout</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden" style={{height:'calc(100vh - 57px)'}}>
        <div className={`flex flex-col border-r border-slate-700/50 bg-slate-900/50 ${activeRoom?'hidden md:flex':'flex'} w-full md:w-80 shrink-0`}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
            <div className="flex items-center gap-2"><MessageSquare size={14} className="text-violet-400"/><span className="text-white font-bold text-sm">Patients ({rooms.length})</span></div>
            <button onClick={()=>{setRefreshing(true);fetchRooms(doctor.email);}} className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all">
              <RefreshCcw size={12} className={refreshing?'animate-spin':''}/>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading&&<div className="flex items-center justify-center py-10 text-slate-500"><Loader2 size={18} className="animate-spin"/></div>}
            {!loading&&rooms.length===0&&<div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-4"><MessageSquare size={28} className="text-slate-600"/><p className="text-slate-500 text-sm">No patient conversations yet.</p></div>}
            {rooms.map(room=>(
              <button key={room.room_id} onClick={()=>setActiveRoom(room)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-slate-800/60 transition-all ${activeRoom?.room_id===room.room_id?'bg-violet-500/10 border-l-2 border-l-violet-500':'hover:bg-slate-800/40'}`}>
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-white font-bold text-sm">
                  {(room.patient_name||room.patient_email)?.[0]?.toUpperCase()??'?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2"><span className="text-white font-semibold text-sm truncate">{room.patient_name||room.patient_email}</span><span className="text-slate-500 text-xs shrink-0">{timeAgo(room.last_time)}</span></div>
                  {room.last_message&&<p className="text-slate-400 text-xs truncate mt-0.5">{room.last_message}</p>}
                  <div className="flex items-center gap-2 mt-0.5">
                    {room.user_age&&<span className="text-slate-500 text-xs">Age {room.user_age}</span>}
                    {room.user_gender&&<span className="text-slate-500 text-xs">· {room.user_gender}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={`flex-1 ${!activeRoom?'hidden md:flex':'flex'} flex-col`}>
          {!activeRoom ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
              <div className="w-20 h-20 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center"><MessageSquare size={32} className="text-violet-400"/></div>
              <div><h3 className="text-white font-bold text-lg mb-1">Select a Patient</h3><p className="text-slate-500 text-sm">Chat, add medicines, appointments, notes, and call your patients.</p></div>
            </div>
          ) : (
            <ChatWindow key={activeRoom.room_id} room={activeRoom} doctorEmail={doctor.email} doctorName={doctor.name} onBack={()=>setActiveRoom(null)}/>
          )}
        </div>
      </div>
    </div>
  );
}