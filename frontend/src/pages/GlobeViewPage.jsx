import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { climateApi } from '../services/api'
import GlobeCanvas from '../components/GlobeCanvas'
import { ChevronLeft, ChevronRight, Compass, Maximize2, Zap, Activity, Info, Filter, Database, Download } from 'lucide-react'
import BottomNavDock from '../components/BottomNavDock'
import AnimatedSpaceBackground from '../components/AnimatedSpaceBackground'

const VARS = ['temperature', 'rainfall', 'humidity', 'wind_speed', 'co2_index', 'climate_risk_score']
const REGIONS = ['Global', 'North America', 'South America', 'Europe', 'Africa', 'Asia', 'Australia', 'Arctic']

// Performance cache
const viewCache = new Map()

export default function GlobeViewPage() {
  const [year, setYear] = useState(2024)
  const [vari, setVari] = useState('temperature')
  const [reg, setReg] = useState('Global')
  
  const [points, setPoints] = useState([])
  const [years, setYears] = useState([])
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState({ avg: 0, min: 0, max: 0, count: 0 })
  const [dataSource, setDataSource] = useState('Climate Engine')

  useEffect(() => {
    climateApi.summary().then(r => {
        setYears(r.data.years || [])
        setDataSource(r.data.data_source || 'Climate Engine')
    }).catch(() => {})
  }, [])

  const fetchData = useCallback(async (targetYear, targetVari, targetReg) => {
    const key = `${targetYear}-${targetVari}-${targetReg}`
    setLoading(true)
    
    if (viewCache.has(key)) {
        const cached = viewCache.get(key)
        setPoints(cached.points)
        setSummary(cached.summary)
        setLoading(false)
        return
    }

    try {
        const res = await climateApi.globe(targetYear, targetVari)
        const rawPoints = res.data.points || []
        const filteredPoints = targetReg === 'Global' ? rawPoints : rawPoints.filter(p => p.region === targetReg)
        const stats = res.data.summary || { avg: 0, min: 0, max: 0, count: 0 }
        
        setPoints(filteredPoints)
        setSummary(stats)
        viewCache.set(key, { points: filteredPoints, summary: stats })
    } catch (err) {
        console.error(err)
    } finally {
        setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchData(year, vari, reg), 50)
    return () => clearTimeout(timer)
  }, [year, vari, reg, fetchData])

  const mappedPoints = useMemo(() => {
    if (!Array.isArray(points)) return []
    return points.map(p => ({ 
      lat: p.latitude ?? 0, 
      lon: p.longitude ?? 0, 
      intensity: p.intensity ?? 0 
    }))
  }, [points])

  const minY = years[0] || 2000
  const maxY = years[years.length - 1] || 2024

  return (
    <div className="relative min-h-screen bg-c-dark overflow-hidden">
      <AnimatedSpaceBackground />
      
      {/* Fullscreen Globe Container */}
      <div className="absolute inset-0 z-0">
        <GlobeCanvas points={mappedPoints} variable={vari} />
      </div>

      {/* Floating HUD - Preserve UI style */}
      <div className="relative z-10 w-full h-screen p-10 flex flex-col justify-between pointer-events-none">
        
        {/* Upper: Breadcrumb + Source */}
        <div className="flex justify-between items-start">
            <motion.div 
                className="pointer-events-auto glass px-6 py-3 rounded-2xl flex items-center gap-4 border-white/10"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            >
                <div className="flex items-center gap-2">
                    <Database size={14} className="text-c-cyan" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{dataSource}</span>
                </div>
                <div className="w-[1px] h-4 bg-white/10" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nodes: {points.length}</p>
            </motion.div>

            <motion.div 
                className="pointer-events-auto flex items-center gap-4"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            >
                <button className="glass p-4 rounded-2xl text-slate-400 hover:text-white transition-all"><Maximize2 size={18} /></button>
                <button className="glass p-4 rounded-2xl text-slate-400 hover:text-white transition-all"><Download size={18} /></button>
            </motion.div>
        </div>

        {/* Center: Variable / Anomaly Summary Overlay */}
        <div className="flex justify-center">
            <AnimatePresence mode="wait">
                <motion.div 
                    key={vari + year}
                    className="pointer-events-auto glass px-12 py-8 rounded-[40px] border-c-cyan/20 backdrop-blur-3xl text-center shadow-2xl"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                >
                    <p className="text-[10px] font-black text-c-cyan uppercase tracking-[0.5em] mb-4">Planetary Analysis</p>
                    <h2 className="text-5xl font-black text-white mb-2 uppercase tracking-tighter">
                        {vari.replace(/_/g, ' ')}
                    </h2>
                    <div className="flex items-center justify-center gap-6 mt-6">
                        <div className="text-left">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Observation Avg</p>
                            <p className="text-2xl font-black text-white">{summary.avg}<span className="text-xs ml-1 text-slate-500">units</span></p>
                        </div>
                        <div className="w-[1px] h-8 bg-white/10" />
                        <div className="text-left">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Temporal Index</p>
                            <p className="text-2xl font-black text-c-cyan">{year}</p>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Bottom: Controls & Navigator */}
        <div className="flex justify-between items-end gap-12">
            {/* Legend Nodes */}
            <motion.div 
                className="pointer-events-auto glass p-6 rounded-[32px] border-white/5 space-y-4"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-glow shadow-rose-500/50" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Extreme Outlier</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-glow shadow-emerald-500/50" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Baseline Signal</span>
                </div>
            </motion.div>

            {/* Matrix Controls (Compact) */}
            <motion.div 
                className="pointer-events-auto glass p-10 rounded-[40px] border-white/10 w-full max-w-2xl flex flex-col gap-10 shadow-2xl"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex justify-between items-end gap-8">
                    <div className="flex-1 space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Variable Stream</label>
                        <div className="flex flex-wrap gap-2">
                            {VARS.map(v => (
                                <button key={v} onClick={() => setVari(v)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all border ${vari === v ? 'bg-c-cyan border-c-cyan text-slate-950 shadow-lg shadow-c-cyan/20' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'}`}>
                                    {v.replace(/_/g, ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="w-48 space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block text-right">Observation Zone</label>
                        <select value={reg} onChange={e => setReg(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-black text-white uppercase tracking-widest outline-none">
                            {REGIONS.map(r => <option key={r} value={r} className="bg-slate-900">{r}</option>)}
                        </select>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex justify-between items-center px-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Zap size={12} className="text-c-cyan"/> Temporal Navigator</p>
                        <p className="text-xl font-black text-white">{year}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setYear(p => Math.max(minY, p - 1))} className="glass w-12 h-12 flex items-center justify-center rounded-2xl text-slate-500 hover:text-white"><ChevronLeft size={20}/></button>
                        <input type="range" min={minY} max={maxY} value={year} onChange={e => setYear(+e.target.value)} className="flex-1 accent-c-cyan h-1 bg-white/10 rounded-full appearance-none cursor-pointer" />
                        <button onClick={() => setYear(p => Math.min(maxY, p + 1))} className="glass w-12 h-12 flex items-center justify-center rounded-2xl text-slate-500 hover:text-white"><ChevronRight size={20}/></button>
                    </div>
                </div>
            </motion.div>
        </div>
      </div>

      <BottomNavDock />
    </div>
  )
}
