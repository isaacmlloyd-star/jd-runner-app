import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Target, Activity, AlertTriangle, CheckCircle2, MapPin, Tag } from 'lucide-react';

function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      if (stickyValue !== null) return JSON.parse(stickyValue);
      return defaultValue;
    } catch (error) {
      return defaultValue;
    }
  });
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

export default function JDRunnerApp() {
  const [department, setDepartment] = useStickyState('Men', 'jd_dept');
  const [subDivision, setSubDivision] = useStickyState('Footwear', 'jd_subdept');
  const [activeTab, setActiveTab] = useState('dashboard');

  const initialData = [
    { date: '06/10', target: 20000, actual: 9000, crepTarget: 10, crepActual: 0, unitsTarget: 16, unitsActual: 3, twoForTarget: 0, twoForActual: 0 },
    { date: '07/10', target: 12000, actual: 3000, crepTarget: 10, crepActual: 0, unitsTarget: 16, unitsActual: 5, twoForTarget: 10, twoForActual: 1 },
    { date: '08/10', target: 50000, actual: 8000, crepTarget: 10, crepActual: 1, unitsTarget: 20, unitsActual: 18, twoForTarget: 5, twoForActual: 1 },
    { date: '09/10', target: 20000, actual: 5000, crepTarget: 10, crepActual: 0, unitsTarget: 16, unitsActual: 10, twoForTarget: 5, twoForActual: 1 },
    { date: '10/10', target: 40000, actual: 8000, crepTarget: 10, crepActual: 5, unitsTarget: 16, unitsActual: 14, twoForTarget: 10, twoForActual: 2 }
  ];

  const [ledger, setLedger] = useStickyState(initialData, 'jd_performance_ledger');
  const [logDate, setLogDate] = useState('');
  const [logForm, setLogForm] = useState({
    target: '', actual: '', crepTarget: '', crepActual: '', unitsTarget: '', unitsActual: '', twoForTarget: '', twoForActual: ''
  });

  const departments = ['Men', 'Women', 'Juniors', 'Children', 'POS'];
  const subDivisions = ['Footwear', 'Apparel'];

  const insights = useMemo(() => {
    if (ledger.length === 0) return { strengths: [], weaknesses: [] };
    
    const latest = ledger[ledger.length - 1];
    const totalCrepT = ledger.reduce((acc, curr) => acc + curr.crepTarget, 0);
    const totalCrepA = ledger.reduce((acc, curr) => acc + curr.crepActual, 0);
    const totalUnitsT = ledger.reduce((acc, curr) => acc + curr.unitsTarget, 0);
    const totalUnitsA = ledger.reduce((acc, curr) => acc + curr.unitsActual, 0);
    const totalTurnoverT = ledger.reduce((acc, curr) => acc + curr.target, 0);
    const totalTurnoverA = ledger.reduce((acc, curr) => acc + curr.actual, 0);

    let strengths = [];
    let weaknesses = [];

    if ((totalCrepA / totalCrepT) < 0.2) weaknesses.push("Critically low Crep protect attach rate. You need to pitch at the shoe-fitting stage, not just at POS.");
    else if ((totalCrepA / totalCrepT) > 0.5) strengths.push("Strong Crep attach rate! Add-on pitches are converting well.");

    const unitConversion = totalUnitsA / totalUnitsT;
    const turnoverConversion = totalTurnoverA / totalTurnoverT;
    
    if (unitConversion > 0.6 && turnoverConversion < 0.4) {
      weaknesses.push("Average Transaction Value (ATV) gap detected. You are closing high volumes of units, but they are low-ticket items. Cross-sell footwear to bridge the turnover gap.");
      strengths.push("Excellent unit closing rate. You are successfully getting items into the basket from unassisted traffic.");
    }

    if (latest.crepActual >= 5) strengths.push("High Crep conversion on the latest shift shows immediate tactical improvement.");

    return { strengths, weaknesses };
  }, [ledger]);

  const handleSaveLog = (e) => {
    e.preventDefault();
    const newEntry = {
      date: logDate,
      target: parseFloat(logForm.target) || 0,
      actual: parseFloat(logForm.actual) || 0,
      crepTarget: parseInt(logForm.crepTarget) || 0,
      crepActual: parseInt(logForm.crepActual) || 0,
      unitsTarget: parseInt(logForm.unitsTarget) || 0,
      unitsActual: parseInt(logForm.unitsActual) || 0,
      twoForTarget: parseInt(logForm.twoForTarget) || 0,
      twoForActual: parseInt(logForm.twoForActual) || 0,
    };
    setLedger([...ledger, newEntry]);
    alert("Shift data locked in.");
    setLogForm({ target: '', actual: '', crepTarget: '', crepActual: '', unitsTarget: '', unitsActual: '', twoForTarget: '', twoForActual: '' });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-yellow-500 selection:text-black">
      <header className="bg-black border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 text-black font-black text-2xl px-3 py-1 italic tracking-tighter skew-x-[-10deg]">JD</div>
            <h1 className="text-xl font-bold uppercase tracking-widest text-zinc-100">Runner<span className="text-yellow-500">OS</span></h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
              {departments.map(d => (
                <button key={d} onClick={() => { setDepartment(d); setSubDivision(d === 'POS' ? 'None' : 'Footwear'); }} className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${department === d ? 'bg-yellow-400 text-black' : 'text-zinc-400 hover:text-white'}`}>{d}</button>
              ))}
            </div>
            {department !== 'POS' && (
              <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                {subDivisions.map(sd => (
                  <button key={sd} onClick={() => setSubDivision(sd)} className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${subDivision === sd ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>{sd}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex border-b border-zinc-800 mb-8">
          <button onClick={() => setActiveTab('dashboard')} className={`pb-4 px-6 font-bold uppercase tracking-widest text-sm border-b-2 transition-all ${activeTab === 'dashboard' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>Performance Dashboard</button>
          <button onClick={() => setActiveTab('log')} className={`pb-4 px-6 font-bold uppercase tracking-widest text-sm border-b-2 transition-all ${activeTab === 'log' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>Log Shift</button>
        </div>

        {activeTab === 'dashboard' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-yellow-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-4"><CheckCircle2 className="w-5 h-5" /> Tactical Strengths</h3>
                <ul className="space-y-3">
                  {insights.strengths.map((str, i) => <li key={i} className="text-zinc-300 text-sm bg-zinc-950 p-3 rounded-lg border border-zinc-800/50 leading-relaxed">{str}</li>)}
                  {insights.strengths.length === 0 && <li className="text-zinc-600 italic">Gathering data...</li>}
                </ul>
              </div>
              <div className="bg-zinc-900 border border-red-900/30 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl"></div>
                <h3 className="text-red-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-4"><AlertTriangle className="w-5 h-5" /> Floor Weaknesses</h3>
                <ul className="space-y-3 relative z-10">
                  {insights.weaknesses.map((wk, i) => <li key={i} className="text-zinc-300 text-sm bg-zinc-950 p-3 rounded-lg border border-red-900/20 leading-relaxed">{wk}</li>)}
                  {insights.weaknesses.length === 0 && <li className="text-zinc-600 italic">No critical weaknesses detected.</li>}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-zinc-100 font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-6"><Activity className="w-4 h-4 text-yellow-400" /> Turnover Variance (R)</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ledger} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#52525b" stopOpacity={0.3}/><stop offset="95%" stopColor="#52525b" stopOpacity={0}/></linearGradient>
                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#facc15" stopOpacity={0.4}/><stop offset="95%" stopColor="#facc15" stopOpacity={0}/></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R${value/1000}k`} />
                      <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#f4f4f5' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                      <Area type="monotone" dataKey="target" stroke="#52525b" strokeWidth={2} fillOpacity={1} fill="url(#colorTarget)" name="Target (R)" />
                      <Area type="monotone" dataKey="actual" stroke="#facc15" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" name="Actual (R)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-zinc-100 font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-6"><Tag className="w-4 h-4 text-yellow-400" /> Unit & Crep Conversion</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ledger} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#f4f4f5', borderRadius: '8px' }} cursor={{fill: '#18181b'}} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                      <Bar dataKey="unitsActual" fill="#facc15" name="Units Closed" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="crepActual" fill="#3b82f6" name="Creps Sold" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSaveLog} className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 space-y-6 shadow-2xl">
              <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-6">Log Shift Numbers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Shift Date</label>
                  <input type="text" placeholder="DD/MM" value={logDate} onChange={e => setLogDate(e.target.value)} required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-white focus:outline-none focus:border-yellow-400 transition-colors font-mono" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Turnover Target (R)</label>
                  <input type="number" value={logForm.target} onChange={e => setLogForm({...logForm, target: e.target.value})} required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-white focus:outline-none focus:border-yellow-400" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Turnover Actual (R)</label>
                  <input type="number" value={logForm.actual} onChange={e => setLogForm({...logForm, actual: e.target.value})} required className="w-full bg-zinc-950 border border-yellow-500/30 rounded-lg p-4 text-yellow-400 focus:outline-none focus:border-yellow-400" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Units Target</label>
                  <input type="number" value={logForm.unitsTarget} onChange={e => setLogForm({...logForm, unitsTarget: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-white focus:outline-none focus:border-yellow-400" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Units Actual</label>
                  <input type="number" value={logForm.unitsActual} onChange={e => setLogForm({...logForm, unitsActual: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-white focus:outline-none focus:border-yellow-400" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Crep Target</label>
                  <input type="number" value={logForm.crepTarget} onChange={e => setLogForm({...logForm, crepTarget: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-white focus:outline-none focus:border-blue-400" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-blue-400 uppercase tracking-widest">Crep Actual</label>
                  <input type="number" value={logForm.crepActual} onChange={e => setLogForm({...logForm, crepActual: e.target.value})} className="w-full bg-zinc-950 border border-blue-900/50 rounded-lg p-4 text-blue-400 focus:outline-none focus:border-blue-400" />
                </div>
              </div>
              <button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-black uppercase tracking-widest py-5 rounded-lg mt-8 transition-colors active:scale-[0.98]">
                Commit Data to Ledger
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
