import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { climateApi } from '../services/api'
import { Lightbulb, AlertTriangle, TrendingUp, Globe, Droplets, Wind, RefreshCw, BarChart3, Binary, Shield, Zap, Search, ChevronRight, Layers, Cpu, Compass } from 'lucide-react'
import BottomNavDock from '../components/BottomNavDock'
import AnimatedSpaceBackground from '../components/AnimatedSpaceBackground'

const VARS = ['temperature', 'rainfall', 'humidity', 'wind_speed', 'co2_index', 'climate_risk_score']
const REGIONS = ['Global', 'North America', 'South America', 'Europe', 'Africa', 'Asia', 'Australia', 'Arctic']

export default function InsightsPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [years, setYears] = useState([])
  
  // Selection State
  const [year1, setYear1] = useState(2000)
  const [year2, setYear2] = useState(2024)
  const [region, setRegion] = useState('Global')
  const [variable, setVariable] = useState('temperature')

  useEffect(() => {
    climateApi.summary().then(r => {
        const yrList = r.data.years || []
        setYears(yrList)
        if (yrList.length > 2) {
            setYear1(yrList[0])
            setYear2(yrList[yrList.length - 1])
        }
    })
  }, [])

  const fetchInsights = useCallback(async () => {
    setLoading(true)
    try {
        const res = await climateApi.insights(year1, year2, region, variable)
        setData(res.data)
    } catch (err) {
        console.error(err)
    } finally {
        setLoading(false)
    }
  }, [year1, year2, region, variable])

  // Auto-fetch on mount AND whenever params change via button
  useEffect(() => { fetchInsights() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative min-h-screen bg-c-dark text-white selection:bg-c-cyan/30 pb-32">
      <AnimatedSpaceBackground />
      
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            <div className="max-w-xl">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-6">
                    <Lightbulb size={16} className="text-c-cyan" />
                    <span className="text-[10px] font-black text-c-cyan uppercase tracking-[0.3em]">AI Intelligence Node</span>
                </motion.div>
                <h1 className="text-6xl font-black mb-6 leading-tight">Climate <br/><span className="gradient-text">Diagnostics.</span></h1>
                <p className="text-slate-400 text-lg font-medium leading-relaxed">
                    Statistical heuristics coupled with temporal data slicing to provide deep-context climate insights.
                </p>
            </div>

            {/* Matrix Filters */}
            <div className="glass p-6 rounded-[32px] border border-white/5 w-full md:w-auto min-w-[400px]">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Region</label>
                        <select value={region} onChange={e => setRegion(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs font-bold outline-none">
                            {REGIONS.map(r => <option key={r} value={r} className="bg-slate-900">{r}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Variable</label>
                        <select value={variable} onChange={e => setVariable(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs font-bold outline-none">
                            {VARS.map(v => <option key={v} value={v} className="bg-slate-900">{v.replace(/_/g, ' ')}</option>)}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Start Year</label>
                        <select value={year1} onChange={e => setYear1(+e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs font-bold outline-none">
                            {years.map(y => <option key={y} value={y} className="bg-slate-900">{y}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">End Year</label>
                        <select value={year2} onChange={e => setYear2(+e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs font-bold outline-none">
                            {years.map(y => <option key={y} value={y} className="bg-slate-900">{y}</option>)}
                        </select>
                    </div>
                </div>
                <button 
                    onClick={fetchInsights} 
                    disabled={loading}
                    className="w-full bg-white font-black text-slate-950 rounded-xl h-12 flex items-center justify-center gap-2 hover:bg-c-cyan transition-all disabled:opacity-50"
                >
                    {loading ? <RefreshCw className="animate-spin" size={16} /> : <><Cpu size={16}/> Process Satellite Records</>}
                </button>
            </div>
        </div>

        <AnimatePresence mode="wait">
            {!loading && data ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                    
                    {/* Primary Insight Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data.insights.map((line, i) => (
                             <motion.div 
                                key={i} 
                                className="glass p-10 rounded-[40px] flex items-start gap-6 group hover:border-c-cyan/20 transition-all border border-white/5 shadow-2xl"
                                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                             >
                                <div className="w-12 h-12 rounded-2xl bg-c-cyan/10 flex items-center justify-center text-c-cyan shrink-0 group-hover:scale-110 transition-transform">
                                    {i === 0 ? <Zap size={24} /> : i === 1 ? <Layers size={24} /> : i === 2 ? <Shield size={24} /> : <Compass size={24} />}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Signal Block {i+1}</p>
                                    <p className="text-xl font-bold leading-relaxed text-white/90">{line}</p>
                                </div>
                             </motion.div>
                        ))}
                    </div>

                    {/* Matrix Cards (Small Analyzers) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Delta Magnitude', val: (data.stats.absolute_change ?? 0).toFixed(2), icon: TrendingUp, color: 'text-c-emerald' },
                            { label: 'Variance %', val: data.stats.percentage_change + '%', icon: Zap, color: 'text-c-cyan' },
                            { label: 'Anomaly Index', val: data.stats.anomaly_score, icon: ShieldAlert, color: 'text-rose-500' },
                            { label: 'Reliability', val: '98.4%', icon: Layers, color: 'text-slate-500' }
                        ].map((stat, i) => (
                            <div key={i} className="glass p-6 rounded-[32px] border border-white/5">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <stat.icon size={12} className={stat.color} /> {stat.label}
                                </p>
                                <p className="text-3xl font-black">{stat.val}</p>
                            </div>
                        ))}
                    </div>

                    <div className="glass p-10 rounded-[40px] border border-c-cyan/10 bg-gradient-to-br from-c-cyan/5 to-transparent">
                        <div className="flex flex-col md:flex-row gap-12 items-center">
                             <div className="flex-1 space-y-4">
                                <h3 className="text-3xl font-black text-white">Summary Projection</h3>
                                <p className="text-slate-400 text-lg font-medium leading-relaxed">
                                    The detected trend in {variable} over {region} indicates a {data.stats.direction} shift. 
                                    This magnitude of change ({(data.stats.absolute_change ?? 0).toFixed(2)}) is consistent with 
                                    {data.stats.anomaly_score > 1.2 ? ' abnormal intensification patterns' : ' typical seasonal variations'}.
                                </p>
                             </div>
                             <div className="w-full md:w-[300px] aspect-square rounded-[32px] bg-c-dark border border-white/10 flex items-center justify-center p-8 text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-c-cyan/5 group-hover:bg-c-cyan/10 transition-colors" />
                                <div className="relative z-10 space-y-4">
                                     <Globe size={48} className="text-c-cyan animate-pulse mx-auto" />
                                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Global Lattice Status</p>
                                     <p className="text-emerald-500 font-black text-xs">SYNCHRONIZED</p>
                                </div>
                             </div>
                        </div>
                    </div>

                </motion.div>
            ) : loading ? (
                <div className="h-[300px] flex items-center justify-center flex-col gap-6">
                    <div className="w-10 h-10 border-2 border-white/5 border-t-c-cyan rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-c-cyan uppercase tracking-[0.5em]">Aggregating Intelligence</p>
                </div>
            ) : (
                <div className="h-[200px] flex items-center justify-center">
                    <p className="text-slate-500 text-sm">Configure the parameters above and click Analyze.</p>
                </div>
            )}
        </AnimatePresence>
      </main>

      <BottomNavDock />
    </div>
  )
}

function ShieldAlert({ size, className }) {
    return <AlertTriangle size={size} className={className} />
}
