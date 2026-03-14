import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { climateApi } from '../services/api'
import GlobeCanvas from './GlobeCanvas'
import { ChevronLeft, ChevronRight, Compass, Activity, BarChart3, TrendingUp, Filter, Database, MapPin, Download, Maximize2, Shield, Eye } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const VARS = ['temperature', 'rainfall', 'humidity', 'wind_speed', 'co2_index', 'climate_risk_score']
const REGIONS = ['Global', 'North America', 'South America', 'Europe', 'Africa', 'Asia', 'Australia', 'Arctic']

// Module-level cache persists across re-renders
const sliceCache = new Map()

export default function ExploreGlobeSection() {
  const [year, setYear] = useState(2024)
  const [vari, setVari] = useState('temperature')
  const [reg, setReg]   = useState('Global')
  const sectionRef = useRef(null)

  const [points,    setPoints]    = useState([])
  const [years,     setYears]     = useState([])
  const [trendData, setTrendData] = useState([])
  const [loading,   setLoading]   = useState(false)
  const [dataSource,setDataSource]= useState('Realistic Climate Model')
  const [summary,   setSummary]   = useState({ avg: '—', min: '—', max: '—', count: 0 })

  // Keep latest request ref to discard stale responses
  const reqRef = useRef(0)

  // Load metadata once on mount
  useEffect(() => {
    climateApi.summary()
      .then(r => {
        const yrs = r.data.years || []
        setYears(yrs)
        setDataSource(r.data.data_source || 'Realistic Climate Model')
        // Start with the most recent year
        if (yrs.length) setYear(yrs[yrs.length - 1])
      })
      .catch(() => {})
  }, [])

  const fetchData = useCallback(async (targetYear, targetVari, targetReg) => {
    const cacheKey = `${targetYear}-${targetVari}-${targetReg}`
    const myReq = ++reqRef.current

    // Hit cache instantly — no loading flash
    if (sliceCache.has(cacheKey)) {
      const cached = sliceCache.get(cacheKey)
      setPoints(cached.points)
      setTrendData(cached.trends)
      setSummary(cached.summary)
      return
    }

    setLoading(true)
    try {
      const [globeRes, trendRes] = await Promise.all([
        climateApi.globe(targetYear, targetVari),
        climateApi.trends(targetVari, targetReg),
      ])

      if (myReq !== reqRef.current) return  // stale — discard

      const rawPoints = globeRes.data.points || []
      const filteredPoints = targetReg === 'Global'
        ? rawPoints
        : rawPoints.filter(p => p.region === targetReg)
      const summaryStats = globeRes.data.summary || { avg: 0, min: 0, max: 0, count: 0 }
      const trends = trendRes.data.data || []

      setPoints(filteredPoints)
      setTrendData(trends)
      setSummary(summaryStats)
      sliceCache.set(cacheKey, { points: filteredPoints, trends, summary: summaryStats })
    } catch (err) {
      console.error('Explore fetch error:', err)
    } finally {
      if (myReq === reqRef.current) setLoading(false)
    }
  }, [])

  // 80ms debounce on slider — instant on variable/region change
  useEffect(() => {
    const delay = 80
    const timer = setTimeout(() => fetchData(year, vari, reg), delay)
    return () => clearTimeout(timer)
  }, [year, vari, reg, fetchData])

  const mappedPoints = useMemo(() => {
    if (!Array.isArray(points)) return []
    return points.map(p => ({
      lat:       p.latitude  ?? 0,
      lon:       p.longitude ?? 0,
      intensity: p.intensity ?? 0,
    }))
  }, [points])

  const minY = years[0] || 2000
  const maxY = years[years.length - 1] || 2024

  const handleDownload = async () => {
    try {
      const response = await climateApi.exportNc(year, vari)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `clima_export_${year}_${vari}.nc`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download error:', err)
      alert('Failed to generate NetCDF file.')
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      sectionRef.current?.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  return (
    <section 
      id="globe-explorer" 
      ref={sectionRef}
      className="relative py-32 px-6 bg-slate-950 overflow-hidden min-h-[1000px] selection:bg-c-cyan/30"
    >
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="max-w-xl">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-6">
              <Database size={14} className="text-c-cyan" />
              <span className="text-[10px] font-black text-c-cyan uppercase tracking-[0.3em]">Temporal Intelligence Hub</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              Planetary <br /> <span className="gradient-text">Observation Grid.</span>
            </h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              Multidimensional diagnostic lattice visualizing satellite-derived climate vectors.
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Source: {dataSource}</span>
            </div>
            <div className="glass p-2 rounded-2xl flex items-center gap-2 shadow-2xl">
              <Filter size={14} className="text-c-cyan ml-3" />
              <select
                value={reg}
                onChange={e => setReg(e.target.value)}
                className="bg-transparent text-xs font-black text-white uppercase tracking-widest outline-none cursor-pointer px-4 py-2"
              >
                {REGIONS.map(r => <option key={r} value={r} className="bg-slate-900">{r}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Globe Container */}
          <div className="lg:col-span-8 relative h-[720px] rounded-[48px] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] border border-white/5 bg-slate-900/20 group">
            <GlobeCanvas points={mappedPoints} variable={vari} />

            {/* Premium Overlay UI (Matching User Screenshot) */}
            <div className="absolute top-10 right-10 z-30 flex gap-3">
              <button 
                onClick={toggleFullscreen}
                className="w-12 h-12 rounded-2xl bg-slate-950/40 backdrop-blur-3xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-900/60 transition-all group"
                title="Fullscreen"
              >
                <Maximize2 size={20} className="group-active:scale-90 transition-transform" />
              </button>
              <button 
                onClick={handleDownload}
                className="w-12 h-12 rounded-2xl bg-slate-950/40 backdrop-blur-3xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-900/60 transition-all group"
                title="Download NetCDF (.nc)"
              >
                <Download size={20} className="group-active:scale-95 transition-transform" />
              </button>
            </div>

            {/* Analysis Card Overlay */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={vari}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute top-10 left-10 z-20"
              >
                <div className="glass p-10 rounded-[44px] border-white/10 backdrop-blur-[40px] shadow-2xl min-w-[340px] bg-slate-900/40">
                  <p className="text-[10px] font-black text-c-cyan/60 uppercase tracking-[0.4em] mb-4">Planetary Analysis</p>
                  <h3 className="text-6xl font-black text-white tracking-tighter uppercase mb-8">
                    {vari === 'co2_index' ? 'CO₂ Index' : vari.replace('_', ' ')}
                  </h3>
                  
                  <div className="flex gap-12 items-center">
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Observation Avg</p>
                      <p className="text-3xl font-black text-white tracking-tight">
                        {summary.avg} <span className="text-sm font-bold text-slate-500 ml-1">units</span>
                      </p>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Temporal Index</p>
                      <p className="text-3xl font-black text-c-cyan tracking-tight">{year}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Variable Stream Overlay at Bottom */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 w-[90%] md:w-auto">
              <div className="glass p-3 rounded-3xl border-white/10 backdrop-blur-3xl flex flex-wrap justify-center items-center gap-2">
                <div className="px-4 py-2 mr-2 border-r border-white/10">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Variable Stream</p>
                </div>
                {['temperature', 'rainfall', 'humidity', 'wind_speed', 'co2_index', 'climate_risk_score'].map(v => (
                  <button
                    key={v}
                    onClick={() => setVari(v)}
                    className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                      vari === v
                        ? 'bg-c-cyan text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {v.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Subtle loading overlay */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-c-cyan/20 border-t-c-cyan rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-c-cyan uppercase tracking-[0.3em]">Querying Lattice…</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls + Chart */}
          <div className="lg:col-span-4 space-y-8">
            <div className="glass p-10 rounded-[44px] border border-white/10 relative overflow-hidden bg-slate-900/20">
              <div className="absolute top-0 right-0 p-8 opacity-5"><Compass size={120} /></div>
              <div className="relative z-10 space-y-12">
                
                {/* Year slider with high contrast */}
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-2">
                       <TrendingUp size={14} className="text-emerald-500" />
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Temporal Cursor</label>
                    </div>
                    <span className="text-3xl font-black text-white tabular-nums">
                      {year}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setYear(p => Math.max(minY, p - 1))} className="w-12 h-12 flex items-center justify-center glass rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all border-white/5 shadow-lg">
                      <ChevronLeft size={20} />
                    </button>
                    <div className="flex-1 px-2">
                      <input
                        type="range" min={minY} max={maxY} value={year}
                        onChange={e => setYear(+e.target.value)}
                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-c-cyan"
                      />
                    </div>
                    <button onClick={() => setYear(p => Math.min(maxY, p + 1))} className="w-12 h-12 flex items-center justify-center glass rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all border-white/5 shadow-lg">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <div className="flex justify-between mt-4">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{minY}</span>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{maxY}</span>
                  </div>
                </div>

                {/* Regional focus */}
                <div className="pt-6 border-t border-white/5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-5">Observation Zone</label>
                  <div className="flex items-center gap-2 glass p-2 rounded-2xl border-white/5">
                    <Filter size={14} className="text-c-cyan ml-3" />
                    <select
                      value={reg}
                      onChange={e => setReg(e.target.value)}
                      className="bg-transparent flex-1 text-xs font-black text-white uppercase tracking-widest outline-none cursor-pointer px-4 py-3 appearance-none"
                    >
                      {['Global', 'North America', 'South America', 'Europe', 'Africa', 'Asia', 'Australia', 'Arctic'].map(r => (
                        <option key={r} value={r} className="bg-slate-900 border-none">{r}</option>
                      ))}
                    </select>
                    <ChevronLeft className="rotate-[-90deg] text-slate-500 mr-3" size={14} />
                  </div>
                </div>

              </div>
            </div>

            {/* Trend chart */}
            <div className="glass p-10 rounded-[40px] border border-white/10 relative overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Activity className="text-c-emerald" size={20} />
                  <h3 className="font-black text-xs text-white uppercase tracking-widest">Trend Diagnostic</h3>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="h-[220px] w-full">
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.2} />
                      <XAxis dataKey="year" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis hide domain={['auto', 'auto']} />
                      <Tooltip
                        contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '16px' }}
                        itemStyle={{ color: '#06b6d4', fontSize: '12px', fontWeight: 'bold' }}
                        labelStyle={{ color: '#94a3b8', fontSize: '10px' }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={3} dot={false} animationDuration={800} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-c-cyan/20 border-t-c-cyan rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-6 leading-relaxed font-medium">
                Regional record aggregation confirms a {Number(summary.avg) > 0 ? 'net intensification' : 'stable oscillation'} across the focal lattice.
              </p>
            </div>
          </div>
        </div>

        {/* Density matrix (Liquid Thermal Ribbon) */}
        <div className="mt-10 glass p-10 rounded-[44px] border border-white/5 space-y-8 bg-slate-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="text-c-cyan" size={18} />
              <h3 className="font-black text-[10px] text-white uppercase tracking-[0.3em]">Lattice Diagnostic Ribbon</h3>
            </div>
            <div className="flex gap-4 items-center">
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Normal</span>
              <div className="w-24 h-1.5 rounded-full bg-gradient-to-r from-emerald-500 via-c-cyan to-rose-500 opacity-30" />
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Anomaly</span>
            </div>
          </div>
          
          <div className="relative h-20 rounded-2xl overflow-hidden border border-white/5 bg-slate-950">
            {/* Base Heatmap Layer */}
            <div className="absolute inset-0 flex gap-[1px]">
              {mappedPoints.slice(0, 150).map((pt, i) => (
                <motion.div
                  key={i}
                  className="flex-1 h-full"
                  style={{
                    background: (pt.intensity || 0) > 1.8 ? '#ef4444' : (pt.intensity || 0) > 0.8 ? '#eab308' : (pt.intensity || 0) > 0 ? '#06b6d4' : '#10b981',
                    opacity: 0.4 + (Math.abs(pt.intensity) * 0.2),
                    filter: 'blur(8px)'
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ delay: i * 0.005 }}
                />
              ))}
            </div>
            
            {/* Scientific Dot Matrix Layer */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)',
              backgroundSize: '4px 4px'
            }} />
            
            {/* Value Indicators */}
            <div className="absolute inset-0 flex items-center justify-around">
               {[1,2,3,4,5,6,7].map(i => (
                 <div key={i} className="w-px h-2 bg-white/10" />
               ))}
            </div>

            {mappedPoints.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.4em] animate-pulse">Scanning Lattice Vector...</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  )
}
