import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, CheckCircle2, Share2, Download, LogIn, Target, TrendingUp, Users, Briefcase, ChevronDown, ChevronUp, MessageSquare, Lightbulb, FolderOpen, Save } from 'lucide-react';

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

  // --- AGENT DATA ---
  const [ledger, setLedger] = useStickyState([
    { date: '06/10/26', target: 20000, actual: 9000, crepTarget: 10, crepActual: 0, unitsTarget: 16, unitsActual: 3, twoForTarget: 0, twoForActual: 0 },
    { date: '07/10/26', target: 12000, actual: 3000, crepTarget: 10, crepActual: 0, unitsTarget: 16, unitsActual: 0, twoForTarget: 0, twoForActual: 0 },
    { date: '08/10/26', target: 50000, actual: 8000, crepTarget: 10, crepActual: 1, unitsTarget: 20, unitsActual: 18, twoForTarget: 5, twoForActual: 1 },
    { date: '09/10/26', target: 20000, actual: 5000, crepTarget: 10, crepActual: 0, unitsTarget: 16, unitsActual: 10, twoForTarget: 5, twoForActual: 1 },
    { date: '10/10/26', target: 40000, actual: 8000, crepTarget: 10, crepActual: 5, unitsTarget: 16, unitsActual: 14, twoForTarget: 10, twoForActual: 2 }
  ], 'jd_performance_ledger');

  const [dailyTargets, setDailyTargets] = useStickyState({ target: '40000', unitsTarget: '16', crepTarget: '10', twoForTarget: '10' }, 'jd_daily_targets');
  const [actualsForm, setActualsForm] = useState({ date: '', actual: '', unitsActual: '', crepActual: '', twoForActual: '' });

  // --- MANAGEMENT DATA ---
  const [mgmtTab, setMgmtTab] = useState('live'); // 'live' | 'archive'
  const [mgmtDept, setMgmtDept] = useState('Men');
  const [archiveMonth, setArchiveMonth] = useState('');
  
  const [mgmtStaff, setMgmtStaff] = useStickyState({ Men: [], Women: [], Juniors: [], Children: [], POS: [] }, 'jd_mgmt_staff');
  const [mgmtArchive, setMgmtArchive] = useStickyState({}, 'jd_mgmt_archive'); // { "Oct 2026": { "Men": [ {date, name, actual...} ] } }
  
  const [newAgent, setNewAgent] = useState({ name: '', target: '', unitsTarget: '', crepTarget: '', twoForTarget: '' });
  const [expandedAgentId, setExpandedAgentId] = useState(null);

  const departments = ['Men', 'Women', 'Juniors', 'Children', 'POS'];
  const subDivisions = ['Footwear', 'Apparel'];

  // Set default archive month
  useEffect(() => {
    const months = Object.keys(mgmtArchive);
    if (months.length > 0 && !archiveMonth) setArchiveMonth(months[months.length - 1]);
  }, [mgmtArchive, archiveMonth]);

  // --- AGENT INSIGHTS ENGINE ---
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
    if (latest.twoForActual === 0 && latest.twoForTarget > 0) strategies.push("STRATEGY: Push the 2-for-650 promos harder at the fitting rooms to instantly double unit volume.");
    return { strengths, weaknesses, strategies };
  }, [ledger]);

  // --- HANDLERS ---
  const handleCopyToWhatsApp = (entry) => {
    const text = `End of business day numbers\n${entry.date}\n\n🗒Name: Isaac\n🎯Target: ${entry.target / 1000}k\n📍Actual: ${entry.actual / 1000}k\n💈Crep target: ${entry.crepTarget}\n📍Crep actual: ${entry.crepActual}\n🎫All Units Targets: ${entry.unitsTarget}\n📍All Units Actual: ${entry.unitsActual}\n👕 2 For 650 Target: ${entry.twoForTarget}\n📍2 For 650 Actual: ${entry.twoForActual}`;
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const handleSaveLog = (e) => {
    e.preventDefault();
    if (!actualsForm.date || !actualsForm.actual) { alert("Please enter Date and Turnover Actual."); return; }
    const newEntry = {
      date: actualsForm.date, target: parseFloat(dailyTargets.target) || 0, actual: parseFloat(actualsForm.actual) || 0,
      crepTarget: parseInt(dailyTargets.crepTarget) || 0, crepActual: parseInt(actualsForm.crepActual) || 0,
      unitsTarget: parseInt(dailyTargets.unitsTarget) || 0, unitsActual: parseInt(actualsForm.unitsActual) || 0,
      twoForTarget: parseInt(dailyTargets.twoForTarget) || 0, twoForActual: parseInt(actualsForm.twoForActual) || 0,
    };
    setLedger([...ledger, newEntry]);
    alert("Shift data locked in.");
    setActiveTab('dashboard');
    setActualsForm({ date: '', actual: '', unitsActual: '', crepActual: '', twoForActual: '' });
  };

  // --- MANAGEMENT HANDLERS ---
  const handleAddAgent = (e) => {
    e.preventDefault();
    if (!newAgent.name) return;
    const agent = {
      id: Date.now(), name: newAgent.name, target: parseFloat(newAgent.target) || 0, actual: 0,
      unitsTarget: parseInt(newAgent.unitsTarget) || 0, unitsActual: 0, 
      crepTarget: parseInt(newAgent.crepTarget) || 0, crepActual: 0, 
      twoForTarget: parseInt(newAgent.twoForTarget) || 0, twoForActual: 0, 
      feedback: ''
    };
    setMgmtStaff({ ...mgmtStaff, [mgmtDept]: [...mgmtStaff[mgmtDept], agent] });
    setNewAgent({ name: '', target: '', unitsTarget: '', crepTarget: '', twoForTarget: '' });
  };

  const updateAgent = (agentId, field, value) => {
    const updatedDept = mgmtStaff[mgmtDept].map(a => a.id === agentId ? { ...a, [field]: value } : a);
    setMgmtStaff({ ...mgmtStaff, [mgmtDept]: updatedDept });
  };

  const handleArchiveAndReset = () => {
    const today = new Date();
    const monthKey = today.toLocaleString('default', { month: 'long', year: 'numeric' });
    const dateStr = today.toLocaleDateString();

    const newArchive = { ...mgmtArchive };
    if (!newArchive[monthKey]) newArchive[monthKey] = { Men: [], Women: [], Juniors: [], Children: [], POS: [] };

    // Clone current staff into archive, then reset active actuals
    const updatedStaff = { ...mgmtStaff };
    
    departments.forEach(dept => {
      mgmtStaff[dept].forEach(agent => {
        if (agent.actual > 0 || agent.unitsActual > 0) {
          newArchive[monthKey][dept].push({ ...agent, dateLogged: dateStr });
        }
      });
      // Zero out live actuals
      updatedStaff[dept] = mgmtStaff[dept].map(agent => ({
        ...agent, actual: 0, unitsActual: 0, crepActual: 0, twoForActual: 0
      }));
    });

    setMgmtArchive(newArchive);
    setMgmtStaff(updatedStaff);
    setArchiveMonth(monthKey);
    alert(`Floor data archived to ${monthKey} folder. Live actuals have been reset to 0 for a new shift.`);
  };

  const getPerformanceStatus = (agent) => {
    if (agent.target === 0) return { label: 'Pending Targets', color: 'text-zinc-400', bg: 'bg-zinc-900' };
    const ratio = agent.actual / agent.target;
    if (ratio >= 1) return { label: 'Crushing It', color: 'text-emerald-400', bg: 'bg-emerald-950 border-emerald-900' };
    if (ratio >= 0.5) return { label: 'On Track', color: 'text-blue-400', bg: 'bg-blue-950 border-blue-900' };
    return { label: 'Falling Short', color: 'text-red-400', bg: 'bg-red-950 border-red-900' };
  };

  const generateCoachingSuggestion = (agent) => {
    if (agent.target === 0) return "Awaiting shift data to generate coaching strategy.";
    const toRatio = agent.target > 0 ? agent.actual / agent.target : 0;
    const unitsRatio = agent.unitsTarget > 0 ? agent.unitsActual / agent.unitsTarget : 0;
    const crepRatio = agent.crepTarget > 0 ? agent.crepActual / agent.crepTarget : 0;
    const twoForRatio = agent.twoForTarget > 0 ? agent.twoForActual / agent.twoForTarget : 0;

    if (toRatio < 0.4 && unitsRatio > 0.6) return "Assist the agent to strategize a way to increase their basket size. They are moving units but falling short on high-ticket turnover.";
    if (crepRatio < 0.3 && agent.crepTarget > 0) return "Assist the agent to strategize a way to increase their Crep attach rate during the shoe-fitting stage.";
    if (twoForRatio < 0.3 && agent.twoForTarget > 0) return "Assist the agent to strategize a way to push the 2-for-650 apparel promos at the fitting room to increase volume.";
    if (toRatio < 0.5) return "Assist the agent to strategize a way to intercept unassisted traffic earlier to build bigger baskets.";
    return "Agent is performing well. Maintain floor momentum and assist with closing high-value walk-ins.";
  };

  // ================= LANDING SCREEN =================
  if (currentScreen === 'landing') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 selection:bg-yellow-500 selection:text-black">
        <div className="bg-yellow-400 text-black font-black text-5xl px-6 py-2 italic tracking-tighter skew-x-[-10deg] mb-12 shadow-[0_0_30px_rgba(250,204,21,0.3)]">JD</div>
        <div className="w-full max-w-md space-y-4">
          <button onClick={() => setCurrentScreen('app')} className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white p-6 rounded-2xl transition-all flex flex-col items-center gap-3">
            <Users className="w-8 h-8 text-yellow-400" />
            <span className="font-black uppercase tracking-widest text-lg">Agent Terminal</span>
            <span className="text-xs text-zinc-500 uppercase">Log personal floor metrics</span>
          </button>
          <button onClick={() => setCurrentScreen('management')} className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white p-6 rounded-2xl transition-all flex flex-col items-center gap-3">
            <Briefcase className="w-8 h-8 text-blue-400" />
            <span className="font-black uppercase tracking-widest text-lg">Management Console</span>
            <span className="text-xs text-zinc-500 uppercase">Track zone agents & provide coaching</span>
          </button>
        </div>
      </div>
    );
  }

  // ================= MANAGEMENT CONSOLE =================
  if (currentScreen === 'management') {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans flex flex-col">
        <header className="bg-black border-b border-zinc-800 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white font-black text-xl px-2 py-0.5 italic tracking-tighter skew-x-[-10deg]">JD</div>
              <h1 className="text-sm font-bold uppercase tracking-widest text-zinc-100">Management<span className="text-blue-500">OS</span></h1>
            </div>
            <button onClick={() => setCurrentScreen('landing')} className="text-xs font-bold text-zinc-500 uppercase tracking-widest border border-zinc-800 px-3 py-1 rounded bg-zinc-900">Exit</button>
          </div>
          <div className="flex border-t border-zinc-900">
            <button onClick={() => setMgmtTab('live')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all ${mgmtTab === 'live' ? 'bg-blue-950/40 text-blue-400 border-b-2 border-blue-500' : 'text-zinc-500 border-b-2 border-transparent'}`}>Live Floor</button>
            <button onClick={() => setMgmtTab('archive')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all ${mgmtTab === 'archive' ? 'bg-blue-950/40 text-blue-400 border-b-2 border-blue-500' : 'text-zinc-500 border-b-2 border-transparent'}`}>Monthly Archives</button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-6 w-full flex-grow">
          
          {/* LIVE FLOOR TAB */}
          {mgmtTab === 'live' && (
            <div className="space-y-6">
              
              <div className="flex overflow-x-auto scrollbar-hide border-b border-zinc-800 pb-2">
                {departments.map(d => (
                  <button key={d} onClick={() => setMgmtDept(d)} className={`px-4 py-2 text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all rounded-lg ${mgmtDept === d ? 'bg-blue-900/30 text-blue-400' : 'text-zinc-500'}`}>
                    {d}
                  </button>
                ))}
              </div>

              <button onClick={handleArchiveAndReset} className="w-full bg-emerald-950 border border-emerald-900 hover:bg-emerald-900 text-emerald-400 font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <Save className="w-5 h-5" /> End Day & Reset Floor
              </button>

              <form onSubmit={handleAddAgent} className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-lg">
                <h2 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-4">Deploy Agent to {mgmtDept}</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><input type="text" placeholder="Agent Name" value={newAgent.name} onChange={e => setNewAgent({...newAgent, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500" required /></div>
                  <div><input type="number" placeholder="T/O Target (R)" value={newAgent.target} onChange={e => setNewAgent({...newAgent, target: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white text-sm focus:outline-none" required /></div>
                  <div><input type="number" placeholder="Units Target" value={newAgent.unitsTarget} onChange={e => setNewAgent({...newAgent, unitsTarget: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white text-sm focus:outline-none" /></div>
                  <div><input type="number" placeholder="Crep Target" value={newAgent.crepTarget} onChange={e => setNewAgent({...newAgent, crepTarget: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white text-sm focus:outline-none" /></div>
                  <div><input type="number" placeholder="2-For-650 Target" value={newAgent.twoForTarget} onChange={e => setNewAgent({...newAgent, twoForTarget: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white text-sm focus:outline-none" /></div>
                  <div className="col-span-2"><button type="submit" className="w-full bg-blue-600 text-white font-black uppercase tracking-widest py-3 rounded-lg text-xs active:scale-95">Add Agent</button></div>
                </div>
              </form>

              <div className="space-y-4">
                {mgmtStaff[mgmtDept].length === 0 ? (
                  <p className="text-zinc-600 text-xs italic">No agents deployed in this zone.</p>
                ) : (
                  mgmtStaff[mgmtDept].map(agent => {
                    const status = getPerformanceStatus(agent);
                    const isExpanded = expandedAgentId === agent.id;
                    return (
                      <div key={agent.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
                        <div className="p-4 border-b border-zinc-800">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-black text-lg text-white uppercase tracking-wider">{agent.name}</h3>
                            <div className="text-right">
                              <span className="block text-[10px] text-zinc-500 uppercase tracking-widest">T/O Target</span>
                              <span className="font-bold text-zinc-300">R{agent.target}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div>
                              <label className="text-[10px] font-bold text-yellow-500 uppercase">Live T/O Actual (R)</label>
                              <input type="number" value={agent.actual || ''} onChange={e => updateAgent(agent.id, 'actual', parseFloat(e.target.value) || 0)} className="w-full bg-zinc-950 border border-yellow-500/30 rounded-lg p-2 text-yellow-400 font-bold focus:outline-none" placeholder={`Target: R${agent.target}`} />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-blue-400 uppercase">Live Units Actual</label>
                              <input type="number" value={agent.unitsActual || ''} onChange={e => updateAgent(agent.id, 'unitsActual', parseInt(e.target.value) || 0)} className="w-full bg-zinc-950 border border-blue-900/50 rounded-lg p-2 text-blue-400 focus:outline-none" placeholder={`Target: ${agent.unitsTarget}`} />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-emerald-400 uppercase">Live Crep Actual</label>
                              <input type="number" value={agent.crepActual || ''} onChange={e => updateAgent(agent.id, 'crepActual', parseInt(e.target.value) || 0)} className="w-full bg-zinc-950 border border-emerald-900/50 rounded-lg p-2 text-emerald-400 focus:outline-none" placeholder={`Target: ${agent.crepTarget}`} />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-purple-400 uppercase">Live 2-For-650 Actual</label>
                              <input type="number" value={agent.twoForActual || ''} onChange={e => updateAgent(agent.id, 'twoForActual', parseInt(e.target.value) || 0)} className="w-full bg-zinc-950 border border-purple-900/50 rounded-lg p-2 text-purple-400 focus:outline-none" placeholder={`Target: ${agent.twoForTarget}`} />
                            </div>
                          </div>
                          <button onClick={() => setExpandedAgentId(isExpanded ? null : agent.id)} className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold uppercase tracking-widest py-3 rounded-lg text-[10px] flex items-center justify-center gap-2 transition-colors">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />} Display Performance Level
                          </button>
                        </div>
                        {isExpanded && (
                          <div className={`p-4 border-t border-zinc-800 ${status.bg}`}>
                            <div className="flex items-center gap-2 mb-4">
                              <Activity className={`w-5 h-5 ${status.color}`} />
                              <span className={`font-black uppercase tracking-widest ${status.color}`}>{status.label}</span>
                              <span className="ml-auto text-xs font-bold text-zinc-400">{Math.round((agent.actual / agent.target) * 100) || 0}% to Target</span>
                            </div>
                            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 mb-4">
                              <p className="text-[11px] font-bold text-zinc-400 uppercase flex items-center gap-1 mb-2"><Lightbulb className="w-3 h-3 text-yellow-500" /> Automated Strategy</p>
                              <p className="text-sm text-zinc-300 italic">"{generateCoachingSuggestion(agent)}"</p>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1"><MessageSquare className="w-3 h-3"/> Manager Direct Coaching Notes</label>
                              <textarea value={agent.feedback} onChange={e => updateAgent(agent.id, 'feedback', e.target.value)} placeholder="Type specific floor instructions here..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 focus:outline-none focus:border-zinc-500 h-24 resize-none" />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* ARCHIVE TAB */}
          {mgmtTab === 'archive' && (
            <div className="space-y-6">
              {Object.keys(mgmtArchive).length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">No Archives Available</p>
                  <p className="text-zinc-600 text-xs mt-2">End a day on the Live Floor to generate records.</p>
                </div>
              ) : (
                <>
                  <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2">
                    {Object.keys(mgmtArchive).map(month => (
                      <button key={month} onClick={() => setArchiveMonth(month)} className={`px-4 py-2 text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all rounded-lg border ${archiveMonth === month ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-950 border-zinc-900 text-zinc-500'}`}>
                        {month}
                      </button>
                    ))}
                  </div>

                  {archiveMonth && mgmtArchive[archiveMonth] && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                      <div className="flex overflow-x-auto scrollbar-hide border-b border-zinc-800 mb-4 pb-2">
                        {departments.map(d => (
                          <button key={d} onClick={() => setMgmtDept(d)} className={`px-4 py-2 text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all rounded-lg ${mgmtDept === d ? 'bg-blue-900/30 text-blue-400' : 'text-zinc-500'}`}>{d}</button>
                        ))}
                      </div>

                      <div className="space-y-3">
                        {mgmtArchive[archiveMonth][mgmtDept]?.length === 0 ? (
                          <p className="text-zinc-600 text-xs italic">No historical records for {mgmtDept} in {archiveMonth}.</p>
                        ) : (
                          mgmtArchive[archiveMonth][mgmtDept]?.map((record, i) => (
                            <div key={i} className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div>
                                <h4 className="font-bold text-white uppercase">{record.name}</h4>
                                <span className="text-[10px] text-zinc-500 font-mono">{record.dateLogged}</span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div><span className="block text-[10px] text-zinc-500 uppercase">Turnover</span><span className="font-bold text-yellow-500">R{record.actual}</span><span className="text-zinc-600 text-[10px] block">/ R{record.target}</span></div>
                                <div><span className="block text-[10px] text-zinc-500 uppercase">Units</span><span className="font-bold text-blue-400">{record.unitsActual}</span><span className="text-zinc-600 text-[10px] block">/ {record.unitsTarget}</span></div>
                                <div><span className="block text-[10px] text-zinc-500 uppercase">Crep</span><span className="font-bold text-emerald-400">{record.crepActual}</span><span className="text-zinc-600 text-[10px] block">/ {record.crepTarget}</span></div>
                                <div><span className="block text-[10px] text-zinc-500 uppercase">2-For-650</span><span className="font-bold text-purple-400">{record.twoForActual}</span><span className="text-zinc-600 text-[10px] block">/ {record.twoForTarget}</span></div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  // ================= AGENT APP =================
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans">
      <header className="bg-black border-b border-zinc-800 sticky top-0 z-50 no-print">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full justify-between md:w-auto md:justify-start">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-400 text-black font-black text-xl px-2 py-0.5 italic tracking-tighter skew-x-[-10deg]">JD</div>
              <h1 className="text-sm font-bold uppercase tracking-widest text-zinc-100">Runner<span className="text-yellow-500">OS</span></h1>
            </div>
            <button onClick={() => setCurrentScreen('landing')} className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border border-zinc-800 px-2 py-1 rounded bg-zinc-900 md:hidden">Exit</button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto overflow-x-auto scrollbar-hide pb-1 md:pb-0">
            <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800 shrink-0">
              {departments.map(d => (
                <button key={d} onClick={() => { setDepartment(d); setSubDivision(d === 'POS' ? 'None' : 'Footwear'); }} className={`px-3 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-md transition-all ${department === d ? 'bg-yellow-400 text-black' : 'text-zinc-400 hover:text-white'}`}>{d}</button>
              ))}
            </div>
            {department !== 'POS' && (
              <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800 shrink-0">
                {subDivisions.map(sd => (
                  <button key={sd} onClick={() => setSubDivision(sd)} className={`px-3 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-md transition-all ${subDivision === sd ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>{sd}</button>
                ))}
              </div>
            )}
            <button onClick={() => setCurrentScreen('landing')} className="hidden md:block text-[10px] font-bold text-zinc-500 uppercase tracking-widest border border-zinc-800 px-3 py-1.5 rounded bg-zinc-900 shrink-0 ml-2">Exit</button>
          </div>
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
              <button onClick={() => window.print()} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl font-bold uppercase tracking-wider text-xs flex flex-col items-center justify-center gap-2 text-zinc-300 transition-all active:scale-95">
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
                    <Area type="monotone" dataKey="target" stroke="#52525b" fillOpacity={0.2} fill="#52525b" />
                    <Area type="monotone" dataKey="actual" stroke="#facc15" strokeWidth={3} fillOpacity={0.3} fill="#facc15" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl">
              <h2 className="text-sm font-black uppercase tracking-widest text-zinc-100 mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-zinc-400" /> 1. Store Targets (Adjust as needed)</h2>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-bold text-zinc-500 uppercase">Turnover Target</label><input type="number" value={dailyTargets.target} onChange={e => setDailyTargets({...dailyTargets, target: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none" /></div>
                <div><label className="text-[10px] font-bold text-zinc-500 uppercase">Units Target</label><input type="number" value={dailyTargets.unitsTarget} onChange={e => setDailyTargets({...dailyTargets, unitsTarget: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none" /></div>
                <div><label className="text-[10px] font-bold text-zinc-500 uppercase">Crep Target</label><input type="number" value={dailyTargets.crepTarget} onChange={e => setDailyTargets({...dailyTargets, crepTarget: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none" /></div>
                <div><label className="text-[10px] font-bold text-zinc-500 uppercase">2-For-650 Target</label><input type="number" value={dailyTargets.twoForTarget} onChange={e => setDailyTargets({...dailyTargets, twoForTarget: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none" /></div>
              </div>
            </div>

            <form onSubmit={handleSaveLog} className="bg-zinc-900 p-6 rounded-2xl border border-yellow-500/30">
              <h2 className="text-sm font-black uppercase tracking-widest text-yellow-400 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> 2. Log EOD Actuals</h2>
              <div className="space-y-4">
                <div><label className="text-[10px] font-bold text-yellow-500/70 uppercase tracking-widest">Date (DD/MM/YY)</label><input type="text" value={actualsForm.date} onChange={e => setActualsForm({...actualsForm, date: e.target.value})} required className="w-full bg-zinc-950 border border-yellow-500/30 rounded-lg p-3 text-white focus:outline-none" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><label className="text-[10px] font-bold text-yellow-500/70 uppercase">Turnover Actual (R)</label><input type="number" value={actualsForm.actual} onChange={e => setActualsForm({...actualsForm, actual: e.target.value})} required className="w-full bg-zinc-950 border border-yellow-500/30 rounded-lg p-3 text-yellow-400 text-lg font-bold focus:outline-none" /></div>
                  <div><label className="text-[10px] font-bold text-yellow-500/70 uppercase">Units Actual</label><input type="number" value={actualsForm.unitsActual} onChange={e => setActualsForm({...actualsForm, unitsActual: e.target.value})} className="w-full bg-zinc-950 border border-yellow-500/30 rounded-lg p-3 text-white focus:outline-none" /></div>
                  <div><label className="text-[10px] font-bold text-blue-400/70 uppercase">Crep Actual</label><input type="number" value={actualsForm.crepActual} onChange={e => setActualsForm({...actualsForm, crepActual: e.target.value})} className="w-full bg-zinc-950 border border-blue-900/50 rounded-lg p-3 text-blue-400 focus:outline-none" /></div>
                  <div className="col-span-2"><label className="text-[10px] font-bold text-yellow-500/70 uppercase">2-For-650 Actual</label><input type="number" value={actualsForm.twoForActual} onChange={e => setActualsForm({...actualsForm, twoForActual: e.target.value})} className="w-full bg-zinc-950 border border-yellow-500/30 rounded-lg p-3 text-white focus:outline-none" /></div>
                </div>
              </div>
              <button type="submit" className="w-full bg-yellow-400 text-black font-black uppercase tracking-widest py-4 rounded-lg mt-6 active:scale-95">Save to Ledger</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
 
