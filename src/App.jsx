import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, AlertTriangle, CheckCircle2, Tag, Share2, Download, LogIn, Target, TrendingUp } from 'lucide-react';

function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      if (stickyValue !== null) return JSON.parse(stickyValue);
      return defaultValue;
    } catch (error) { return defaultValue; }
  });
  useEffect(() => { window.localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue];
}

export default function JDRunnerApp() {
  const [currentScreen, setCurrentScreen] = useState('landing'); 
  const [department, setDepartment] = useStickyState('Men', 'jd_dept');
  const [subDivision, setSubDivision] = useStickyState('Footwear', 'jd_subdept');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [copied, setCopied] = useState(false);

  const [ledger, setLedger] = useStickyState([
    { date: '06/10/26', target: 20000, actual: 9000, crepTarget: 10, crepActual: 0, unitsTarget: 16, unitsActual: 3, twoForTarget: 0, twoForActual: 0 },
    { date: '07/10/26', target: 12000, actual: 3000, crepTarget: 10, crepActual: 0, unitsTarget: 16, unitsActual: 0, twoForTarget: 0, twoForActual: 0 },
    { date: '08/10/26', target: 50000, actual: 8000, crepTarget: 10, crepActual: 1, unitsTarget: 20, unitsActual: 18, twoForTarget: 5, twoForActual: 1 },
    { date: '09/10/26', target: 20000, actual: 5000, crepTarget: 10, crepActual: 0, unitsTarget: 16, unitsActual: 10, twoForTarget: 5, twoForActual: 1 },
    { date: '10/10/26', target: 40000, actual: 8000, crepTarget: 10, crepActual: 5, unitsTarget: 16, unitsActual: 14, twoForTarget: 10, twoForActual: 2 }
  ], 'jd_performance_ledger');

  // Dedicated state for Daily Targets (persists all day)
  const [dailyTargets, setDailyTargets] = useStickyState({
    target: '40000', unitsTarget: '16', crepTarget: '10', twoForTarget: '10'
  }, 'jd_daily_targets');

  // Dedicated state for EOD Actuals
  const [actualsForm, setActualsForm] = useState({
    date: '', actual: '', unitsActual: '', crepActual: '', twoForActual: ''
  });

  const departments = ['Men', 'Women', 'Juniors', 'Children', 'POS'];
  const subDivisions = ['Footwear', 'Apparel'];

  const insights = useMemo(() => {
    if (ledger.length === 0) return { strengths: [], weaknesses: [], strategies: [] };
    const latest = ledger[ledger.length - 1];
    let strengths = [], weaknesses = [], strategies = [];

    if (latest.crepActual === 0 && latest.crepTarget > 0) weaknesses.push("Missed Crep targets completely today.");
    else if (latest.crepActual >= 5) strengths.push("Strong Crep attach rate today!");

    if (latest.unitsActual >= latest.unitsTarget * 0.8) strengths.push("Excellent unit closing rate. You are aggressively converting traffic.");
    else weaknesses.push("Low unit conversion. Unassisted traffic is walking out.");

    if ((latest.actual / latest.target) < 0.3 && latest.unitsActual > 10) {
      weaknesses.push("ATV Gap: High units but low turnover.");
      strategies.push("STRATEGY: You are selling too many low-ticket items. Leverage floor teamwork to pass customers and cross-sell high-ticket footwear to bridge the turnover gap.");
    }

    if (latest.twoForActual === 0 && latest.twoForTarget > 0) {
      strategies.push("STRATEGY: Push the 2-for-650 promos harder at the fitting rooms to instantly double unit volume.");
    }

    return { strengths, weaknesses, strategies };
  }, [ledger]);

  const handleCopyToWhatsApp = (entry) => {
    const text = `End of business day numbers\n${entry.date}\n\n🗒Name: Isaac\n🎯Target: ${entry.target / 1000}k\n📍Actual: ${entry.actual / 1000}k\n💈Crep target: ${entry.crepTarget}\n📍Crep actual: ${entry.crepActual}\n🎫All Units Targets: ${entry.unitsTarget}\n📍All Units Actual: ${entry.unitsActual}\n👕 2 For 650 Target: ${entry.twoForTarget}\n📍2 For 650 Actual: ${entry.twoForActual}`;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadSheet = () => { window.print(); };

  const handleSaveLog = (e) => {
    e.preventDefault();
    if (!actualsForm.date || !actualsForm.actual) {
      alert("Please enter at least the Date and Turnover Actual.");
      return;
    }

    const newEntry = {
      date: actualsForm.date,
      target: parseFloat(dailyTargets.target) || 0,
      actual: parseFloat(actualsForm.actual) || 0,
      crepTarget: parseInt(dailyTargets.crepTarget) || 0,
      crepActual: parseInt(actualsForm.crepActual) || 0,
      unitsTarget: parseInt(dailyTargets.unitsTarget) || 0,
      unitsActual: parseInt(actualsForm.unitsActual) || 0,
      twoForTarget: parseInt(dailyTargets.twoForTarget) || 0,
      twoForActual: parseInt(actualsForm.twoForActual) || 0,
    };
    
    setLedger([...ledger, newEntry]);
    alert("Shift data locked in.");
    setActiveTab('dashboard');
    // Clear actuals for the next shift, but keep the targets locked in
    setActualsForm({ date: '', actual: '', unitsActual: '', crepActual: '', twoForActual: '' });
  };

  if (currentScreen === 'landing') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 selection:bg-yellow-500 selection:text-black">
        <div className="bg-yellow-400 text-black font-black text-5xl px-6 py-2 italic tracking-tighter skew-x-[-10deg] mb-8 shadow-[0_0_30px_rgba(250,204,21,0.3)]">JD</div>
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
          <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-100 mb-6 text-center">Select Floor Zone</h2>
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Department</label>
          <div className="grid grid-cols-2 gap-3 mb-6 mt-2">
            {departments.map(d => (
              <button key={d} onClick={() => { setDepartment(d); setSubDivision(d === 'POS' ? 'None' : 'Footwear'); }} className={`py-3 rounded-lg font-bold uppercase tracking-wider transition-all ${department === d ? 'bg-yellow-400 text-black shadow-lg' : 'bg-zinc-950 text-zinc-400 border border-zinc-800'}`}>{d}</button>
            ))}
          </div>
          {department !== 'POS' && (
            <>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Sub-Division</label>
              <div className="grid grid-cols-2 gap-3 mb-8 mt-2">
                {subDivisions.map(sd => (
                  <button key={sd} onClick={() => setSubDivision(sd)} className={`py-3 rounded-lg font-bold uppercase tracking-wider transition-all ${subDivision === sd ? 'bg-zinc-700 text-white shadow-lg' : 'bg-zinc-950 text-zinc-500 border border-zinc-800'}`}>{sd}</button>
                ))}
              </div>
            </>
          )}
          <button onClick={() => setCurrentScreen('app')} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-4 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95">
            <LogIn className="w-5 h-5" /> Initialize Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans">
      <header className="bg-black border-b border-zinc-800 sticky top-0 z-50 no-print">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 text-black font-black text-xl px-2 py-0.5 italic tracking-tighter skew-x-[-10deg]">JD</div>
            <div className="flex flex-col">
              <h1 className="text-sm font-bold uppercase tracking-widest text-zinc-100">Runner<span className="text-yellow-500">OS</span></h1>
              <span className="text-[10px] text-zinc-500 font-mono uppercase">{department} / {subDivision}</span>
            </div>
          </div>
          <button onClick={() => setCurrentScreen('landing')} className="text-xs font-bold text-zinc-500 uppercase tracking-widest border border-zinc-800 px-3 py-1 rounded bg-zinc-900">Change Zone</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="hidden print-only mb-8 text-black">
          <h1 className="text-3xl font-black uppercase border-b-4 border-black pb-2">JD Performance Report</h1>
          <p className="font-bold mt-2">Agent: Isaac | Zone: {department} ({subDivision})</p>
        </div>

        <div className="flex border-b border-zinc-800 mb-6 no-print overflow-x-auto scrollbar-hide">
          <button onClick={() => setActiveTab('dashboard')} className={`pb-3 px-4 font-bold uppercase tracking-widest text-xs whitespace-nowrap border-b-2 transition-all ${activeTab === 'dashboard' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-zinc-500'}`}>Dashboard</button>
          <button onClick={() => setActiveTab('log')} className={`pb-3 px-4 font-bold uppercase tracking-widest text-xs whitespace-nowrap border-b-2 transition-all ${activeTab === 'log' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-zinc-500'}`}>Log Shift Data</button>
        </div>

        {activeTab === 'dashboard' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 no-print">
              <button onClick={() => handleCopyToWhatsApp(ledger[ledger.length - 1])} className={`p-4 rounded-xl font-bold uppercase tracking-wider text-xs flex flex-col items-center justify-center gap-2 transition-all active:scale-95 ${copied ? 'bg-emerald-600 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-300'}`}>
                {copied ? <CheckCircle2 /> : <Share2 />} {copied ? 'Copied Data' : 'WhatsApp Export'}
              </button>
              <button onClick={handleDownloadSheet} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl font-bold uppercase tracking-wider text-xs flex flex-col items-center justify-center gap-2 text-zinc-300 transition-all active:scale-95">
                <Download /> Download PDF
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-yellow-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2 mb-3"><CheckCircle2 className="w-4 h-4" /> Performance Breakdown</h3>
                <ul className="space-y-2">
                  {insights.strengths.map((s, i) => <li key={i} className="text-zinc-300 text-xs bg-zinc-950 p-2 rounded border border-zinc-800">{s}</li>)}
                  {insights.weaknesses.map((w, i) => <li key={i} className="text-red-400 text-xs bg-red-950/20 p-2 rounded border border-red-900/30">{w}</li>)}
                </ul>
              </div>
              <div className="bg-zinc-900 border border-blue-900/30 rounded-xl p-5">
                <h3 className="text-blue-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2 mb-3"><Activity className="w-4 h-4" /> Tactical Strategies</h3>
                <ul className="space-y-2">
                  {insights.strategies.length > 0 ? insights.strategies.map((str, i) => <li key={i} className="text-zinc-300 text-xs bg-zinc-950 p-2 rounded border border-blue-900/30">{str}</li>) : <li className="text-zinc-500 text-xs">Maintain current momentum.</li>}
                </ul>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-zinc-100 font-bold uppercase tracking-widest text-xs flex items-center gap-2 mb-4">Turnover Variance</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ledger} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `${v/1000}k`} />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="target" stroke="#52525b" fillOpacity={0.2} fill="#52525b" name="Target" />
                    <Area type="monotone" dataKey="actual" stroke="#facc15" strokeWidth={3} fillOpacity={0.3} fill="#facc15" name="Actual" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-zinc-100 font-bold uppercase tracking-widest text-xs flex items-center gap-2 mb-4">Units & Add-Ons</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ledger} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff', fontSize: '12px' }} cursor={{fill: '#18181b'}} />
                    <Legend wrapperStyle={{ fontSize: '10px' }}/>
                    <Bar dataKey="unitsActual" fill="#facc15" name="Units" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="crepActual" fill="#3b82f6" name="Creps" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* SECTION 1: SET DAILY TARGETS */}
            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl">
              <h2 className="text-sm font-black uppercase tracking-widest text-zinc-100 mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-zinc-400" /> 1. Store Targets (Adjust as needed)</h2>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-4">These lock in automatically for the entire shift.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-bold text-zinc-500 uppercase">Turnover Target</label><input type="number" value={dailyTargets.target} onChange={e => setDailyTargets({...dailyTargets, target: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-zinc-500" /></div>
                <div><label className="text-[10px] font-bold text-zinc-500 uppercase">Units Target</label><input type="number" value={dailyTargets.unitsTarget} onChange={e => setDailyTargets({...dailyTargets, unitsTarget: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-zinc-500" /></div>
                <div><label className="text-[10px] font-bold text-zinc-500 uppercase">Crep Target</label><input type="number" value={dailyTargets.crepTarget} onChange={e => setDailyTargets({...dailyTargets, crepTarget: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-zinc-500" /></div>
                <div><label className="text-[10px] font-bold text-zinc-500 uppercase">2-For-650 Target</label><input type="number" value={dailyTargets.twoForTarget} onChange={e => setDailyTargets({...dailyTargets, twoForTarget: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-zinc-500" /></div>
              </div>
            </div>

            {/* SECTION 2: LOG ACTUALS */}
            <form onSubmit={handleSaveLog} className="bg-zinc-900 p-6 rounded-2xl border border-yellow-500/30 shadow-[0_0_20px_rgba(250,204,21,0.05)]">
              <h2 className="text-sm font-black uppercase tracking-widest text-yellow-400 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> 2. Log EOD Actuals</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-yellow-500/70 uppercase tracking-widest">Date (DD/MM/YY)</label>
                  <input type="text" value={actualsForm.date} onChange={e => setActualsForm({...actualsForm, date: e.target.value})} required className="w-full bg-zinc-950 border border-yellow-500/30 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-400" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><label className="text-[10px] font-bold text-yellow-500/70 uppercase">Turnover Actual (R)</label><input type="number" value={actualsForm.actual} onChange={e => setActualsForm({...actualsForm, actual: e.target.value})} required className="w-full bg-zinc-950 border border-yellow-500/30 rounded-lg p-3 text-yellow-400 text-lg font-bold focus:outline-none" /></div>
                  <div><label className="text-[10px] font-bold text-yellow-500/70 uppercase">Units Actual</label><input type="number" value={actualsForm.unitsActual} onChange={e => setActualsForm({...actualsForm, unitsActual: e.target.value})} className="w-full bg-zinc-950 border border-yellow-500/30 rounded-lg p-3 text-white focus:outline-none" /></div>
                  <div><label className="text-[10px] font-bold text-blue-400/70 uppercase">Crep Actual</label><input type="number" value={actualsForm.crepActual} onChange={e => setActualsForm({...actualsForm, crepActual: e.target.value})} className="w-full bg-zinc-950 border border-blue-900/50 rounded-lg p-3 text-blue-400 focus:outline-none" /></div>
                  <div className="col-span-2"><label className="text-[10px] font-bold text-yellow-500/70 uppercase">2-For-650 Actual</label><input type="number" value={actualsForm.twoForActual} onChange={e => setActualsForm({...actualsForm, twoForActual: e.target.value})} className="w-full bg-zinc-950 border border-yellow-500/30 rounded-lg p-3 text-white focus:outline-none" /></div>
                </div>
              </div>
              <button type="submit" className="w-full bg-yellow-400 text-black font-black uppercase tracking-widest py-4 rounded-lg mt-6 active:scale-95 shadow-[0_0_15px_rgba(250,204,21,0.4)]">Save to Ledger</button>
            </form>

          </div>
        )}
      </main>
    </div>
  );
}
 
