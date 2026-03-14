import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { climateApi } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine, AreaChart, Area } from 'recharts'
import { Calendar, Map, Activity, ArrowRight, TrendingUp, TrendingDown, AlertCircle, RefreshCw, Layers, Globe, Zap, Filter } from 'lucide-react'
import BottomNavDock from '../components/BottomNavDock'
import AnimatedSpaceBackground from '../components/AnimatedSpaceBackground'

const VARS = ['temperature', 'rainfall', 'humidity', 'wind_speed', 'co2_index', 'climate_risk_score']
const REGIONS = ['Global', 'North America', 'South America', 'Europe', 'Africa', 'Asia', 'Australia', 'Arctic']

export default function CompareYearsPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [years, setYears] = useState([])
  const [trendData, setTrendData] = useState([])

  // Form State
  const [vari, setVari] = useState('temperature')
  const [year1, setYear1] = useState(2015)
  const [year2, setYear2] = useState(2024)
  const [region, setRegion] = useState('Global')

  useEffect(() => {
    climateApi.summary().then(r => {
        const yrList = r.data.years || []
        setYears(yrList)
        if (yrList.length > 1) {
            setYear1(yrList[0])
            setYear2(yrList[yrList.length - 1])
        }
    })
  }, [])

  const runComparison = useCallback(async () => {
    setLoading(true)
    try {
        const [compRes, trendRes] = await Promise.all([
            climateApi.compare(year1, year2, vari, region),
            climateApi.trends(vari, region)
        ])
        setData(compRes.data)
        setTrendData(trendRes.data.data || [])
    } catch (err) {
        console.error(err)
    } finally {
        setLoading(false)
    }
  }, [year1, year2, vari, region])

  useEffect(() => {
    runComparison()
  }, []) // On mount

  return (
    <div className="relative min-h-screen bg-c-dark text-white selection:bg-c-cyan/30 pb-32">
      <AnimatedSpaceBackground />
      
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            <div className="max-w-2xl">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-6">
                    <Layers size={14} className="text-c-cyan" />
                    <span className="text-[10px] font-black text-c-cyan uppercase tracking-[0.3em]">Temporal Delta Module</span>
                </motion.div>
                <h1 className="text-6xl font-black mb-6 leading-tight">Compare <br/><span className="gradient-text">Temporal Shifts.</span></h1>
                <p className="text-slate-400 text-lg font-medium">Select any two benchmarks to analyze climate variance across regional and temporal clusters.</p>
            </div>

            {/* Matrix Form */}
            <div className="glass p-8 rounded-[40px] border border-white/5 w-full md:w-auto min-w-[360px] shadow-2xl">
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Baseline Year</label>
                             <select value={year1} onChange={e => setYear1(+e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-sm font-bold outline-none focus:border-c-cyan/50 transition-all">
                                {years.map(y => <option key={y} value={y} className="bg-slate-900">{y}</option>)}
                             </select>
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Target Year</label>
                             <select value={year2} onChange={e => setYear2(+e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-sm font-bold outline-none focus:border-c-cyan/50 transition-all">
                                {years.map(y => <option key={y} value={y} className="bg-slate-900">{y}</option>)}
                             </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Observation Zone</label>
                         <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-1">
                             <Globe size={14} className="text-slate-500" />
                             <select value={region} onChange={e => setRegion(e.target.value)} className="w-full bg-transparent p-2 text-sm font-bold outline-none">
                                {REGIONS.map(r => <option key={r} value={r} className="bg-slate-900">{r}</option>)}
                             </select>
                         </div>
                    </div>

                    <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Variable Stream</label>
                         <div className="flex flex-wrap gap-2">
                             {VARS.map(v => (
                                 <button key={v} onClick={() => setVari(v)} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${vari === v ? 'bg-c-cyan border-c-cyan text-slate-950' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}>
                                     {v.replace(/_/g, ' ')}
                                 </button>
                             ))}
                         </div>
                    </div>

                    <button 
                        onClick={runComparison} 
                        disabled={loading}
                        className="w-full bg-white font-black text-slate-950 rounded-2xl py-4 flex items-center justify-center gap-2 hover:bg-c-cyan transition-colors disabled:opacity-50"
                    >
                        {loading ? <RefreshCw className="animate-spin" size={18} /> : <>Generate Delta <Zap size={16} /></>}
                    </button>
                </div>
            </div>
        </div>

        {/* Results Area */}
        <AnimatePresence mode="wait">
            {!loading && data ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                    
                    {/* Primary Delta Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass p-10 rounded-[40px] flex flex-col justify-between min-h-[220px]">
                            <div>
                                <div className="flex items-center gap-2 text-slate-500 mb-6">
                                    <Calendar size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Baseline: {year1}</span>
                                </div>
                                <h4 className="text-5xl font-black mb-2">{(data.val1 ?? 0).toFixed(2)}</h4>
                                <p className="text-xs font-bold text-slate-500 uppercase">{vari.replace(/_/g, ' ')}</p>
                            </div>
                        </div>

                        <div className="glass p-10 rounded-[40px] border-c-cyan/10 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                               {data.direction === 'increase' ? <TrendingUp size={80} /> : <TrendingDown size={80} />}
                           </div>
                           <div className="relative z-10 h-full flex flex-col justify-center">
                                <p className={`text-4xl font-black flex items-center gap-3 mb-2 ${data.direction === 'increase' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {data.direction === 'increase' ? '+' : ''}{data.percentage_change ?? 0}%
                                    {data.direction === 'increase' ? <TrendingUp size={32} /> : <TrendingDown size={32} />}
                                </p>
                                <p className="text-sm font-bold text-slate-400">Net Variance Detected</p>
                           </div>
                        </div>

                        <div className="glass p-10 rounded-[40px] flex flex-col justify-between min-h-[220px]">
                            <div>
                                <div className="flex items-center gap-2 text-c-cyan mb-6">
                                    <Calendar size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Target: {year2}</span>
                                </div>
                                <h4 className="text-5xl font-black mb-2">{(data.val2 ?? 0).toFixed(2)}</h4>
                                <p className="text-xs font-bold text-slate-500 uppercase">{vari.replace(/_/g, ' ')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Chart & Analysis */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Trend Visualization */}
                        <div className="lg:col-span-8 glass p-10 rounded-[40px] min-h-[400px]">
                            <div className="flex justify-between items-center mb-10">
                                <p className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-slate-500">
                                    <Activity size={14} className="text-c-cyan" /> Historical Trend Matrix
                                </p>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-c-cyan" /><span className="text-[10px] font-bold text-slate-400">{vari}</span></div>
                                </div>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3} />
                                        <XAxis dataKey="year" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip 
                                            contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '16px' }}
                                            itemStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
                                        />
                                        <ReferenceLine x={year1} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'top', value: year1, fill: '#94a3b8', fontSize: 10 }} />
                                        <ReferenceLine x={year2} stroke="#06b6d4" strokeDasharray="3 3" label={{ position: 'top', value: year2, fill: '#06b6d4', fontSize: 10 }} />
                                        <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={4} fillOpacity={1} fill="url(#chartGradient)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Diagnostics & Score */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="glass p-10 rounded-[40px] flex flex-col justify-center gap-4 h-full">
                                <div className="flex items-center gap-3 mb-4">
                                    <AlertCircle className="text-c-cyan" />
                                    <h4 className="font-black text-xs uppercase tracking-widest">Anomaly Scan</h4>
                                </div>
                                
                                <div className="space-y-8">
                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase">Intensity Score</p>
                                            <p className="text-xl font-black text-white">{data.anomaly_score} <span className="text-[10px] text-slate-500">/ 3.0</span></p>
                                        </div>
                                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${(data.anomaly_score / 3.0) * 100}%` }} className="h-full bg-gradient-to-r from-c-cyan to-c-emerald shadow-glow" />
                                        </div>
                                    </div>
                                    
                                    <div className={`p-6 rounded-3xl border ${data.anomaly_score > 1.2 ? 'bg-rose-500/5 border-rose-500/20 text-rose-500' : 'bg-c-cyan/5 border-c-cyan/20 text-c-cyan'}`}>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2">Diagnostic Summary</p>
                                        <p className="text-xs font-medium leading-relaxed opacity-80">
                                            The variance of {(data.absolute_change ?? 0).toFixed(2)} units suggests a {data.anomaly_score > 1.2 ? 'significant statistical outlier' : 'stable atmospheric oscillation'} for the region of {region}.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </motion.div>
            ) : loading ? (
                <div className="h-[300px] flex items-center justify-center flex-col gap-6">
                    <div className="w-10 h-10 border-2 border-white/5 border-t-c-cyan rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-c-cyan uppercase tracking-[0.5em]">Synchronizing Delta Matrix</p>
                </div>
            ) : (
                <div className="h-[200px] flex items-center justify-center">
                    <p className="text-slate-500 text-sm">Select years and click Generate Delta to compare.</p>
                </div>
            )}
        </AnimatePresence>
      </main>

      <BottomNavDock />
    </div>
  )
}
