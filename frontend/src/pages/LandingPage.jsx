import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlobeCanvas from '../components/GlobeCanvas'
import HeroCenterBrand from '../components/HeroCenterBrand'
import BottomNavDock from '../components/BottomNavDock'
import AnimatedSpaceBackground from '../components/AnimatedSpaceBackground'
import FloatingClimateCards from '../components/FloatingClimateCards'
import ExploreGlobeSection from '../components/ExploreGlobeSection'
import { climateApi } from '../services/api'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { Upload, Database, Map, BarChart3, Binary, Shield, Globe, Users, ShieldAlert, Cpu, FileText, TrendingUp, Grid, Play } from 'lucide-react'

// ── Heatmap colour helper ───────────────────────────────────────────────────
function heatColor(norm) {
  const stops = [
    [2,   6,  23],   // dark
    [6, 182, 212],   // cyan
    [16, 185, 129],  // emerald
    [234, 179,   8], // amber
    [239,  68,  68], // red
  ]
  const idx = Math.min(norm * (stops.length - 1), stops.length - 1.001)
  const lo  = stops[Math.floor(idx)]
  const hi  = stops[Math.ceil(idx)]
  const t   = idx % 1
  const r   = Math.round(lo[0] + (hi[0] - lo[0]) * t)
  const g   = Math.round(lo[1] + (hi[1] - lo[1]) * t)
  const b   = Math.round(lo[2] + (hi[2] - lo[2]) * t)
  return `rgb(${r},${g},${b})`
}

const VAR_LABELS = {
  temperature: 'Temp', rainfall: 'Rain', humidity: 'Hum',
  wind_speed: 'Wind', co2_index: 'CO₂', climate_risk_score: 'Risk',
}

// ── Fluid Thermal Heatmap Component ──────────────────────────────────────────
function LiquidHeatmapCanvas({ heatmapData }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !heatmapData?.rows?.length) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { rows, variables } = heatmapData
    
    // Set internal resolution
    canvas.width = 800
    canvas.height = 300
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    const rowStep = canvas.height / rows.length
    const colStep = canvas.width / variables.length

    // 1) Render soft heat blobs
    rows.forEach((row, ri) => {
      variables.forEach((v, vi) => {
        const norm = row[`${v}_norm`] || 0
        const x = vi * colStep + colStep/2
        const y = ri * rowStep + rowStep/2
        
        const grad = ctx.createRadialGradient(x, y, 0, x, y, colStep * 1.5)
        const color = heatColor(norm)
        
        grad.addColorStop(0, color.replace('rgb', 'rgba').replace(')', ', 0.6)'))
        grad.addColorStop(0.5, color.replace('rgb', 'rgba').replace(')', ', 0.2)'))
        grad.addColorStop(1, 'rgba(2, 6, 23, 0)')
        
        ctx.fillStyle = grad
        ctx.globalCompositeOperation = 'screen'
        ctx.fillRect(x - colStep * 2, y - rowStep * 2, colStep * 4, rowStep * 4)
      })
    })

    // 2) Render a fine 'Dot Matrix' overlay for the scientific look
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
    for (let x = 0; x < canvas.width; x += 6) {
      for (let y = 0; y < canvas.height; y += 6) {
        ctx.beginPath()
        ctx.arc(x, y, 0.6, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }, [heatmapData])

  if (!heatmapData || !heatmapData.rows || heatmapData.rows.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-slate-600 text-xs font-bold uppercase tracking-widest border border-dashed border-white/5 rounded-2xl">
        Awaiting Thermal Ingress
      </div>
    )
  }

  return (
    <div className="relative w-full h-full flex gap-4">
      {/* Region Labels */}
      <div className="flex flex-col justify-between py-2 text-right w-16 overflow-hidden">
        {heatmapData.rows.map((r, i) => (
          <span key={i} className="text-[8px] font-black text-slate-500 uppercase tracking-tighter truncate">{r.region}</span>
        ))}
      </div>
      
      <div className="relative flex-1 rounded-3xl overflow-hidden border border-white/5 bg-slate-950 shadow-inner">
        <canvas ref={canvasRef} className="w-full h-full object-cover" />
      </div>
    </div>
  )
}

function DataHeatmap({ heatmapData }) {
  return <LiquidHeatmapCanvas heatmapData={heatmapData} />
}

// ── CustomTooltip Component ──────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass px-3 py-2 rounded-xl text-xs border border-white/10 shadow-2xl">
      <p className="text-slate-400 mb-1 font-bold">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-black">
          {p.name}: {p.value?.toFixed(2)}
        </p>
      ))}
    </div>
  )
}

// ── DataVizPanel Component ────────────────────────────────────────────────────
function DataVizPanel({ trendData, heatmapData, fileName, rowCount }) {
  const [activeVar, setActiveVar] = useState('temperature')
  const VARS = heatmapData?.variables || ['temperature']

  // Ensure activeVar is in VARS
  useEffect(() => {
    if (VARS.length > 0 && !VARS.includes(activeVar)) {
      setActiveVar(VARS[0])
    }
  }, [VARS, activeVar])

  return (
    <motion.section
      className="relative py-24 px-6 bg-slate-950 z-10 border-t border-white/5 overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-c-cyan/30 to-transparent" />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Signal Locked</span>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter">
              Temporal <span className="gradient-text">Diagnostics</span>
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              <FileText size={14} className="inline mr-1.5 text-c-cyan" />
              Source: <span className="text-slate-300">{fileName}</span> · <span className="text-c-cyan">{rowCount?.toLocaleString()}</span> records
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {VARS.map(v => (
              <button
                key={v}
                onClick={() => setActiveVar(v)}
                className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${
                  activeVar === v
                    ? 'bg-c-cyan text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                    : 'glass text-slate-500 hover:text-slate-300 hover:border-white/10'
                }`}
              >
                {VAR_LABELS[v] || v}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trend Chart */}
          <div className="glass p-8 rounded-[32px] border border-white/5 relative group">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-c-cyan/10 text-c-cyan">
                  <TrendingUp size={16} />
                </div>
                <span className="text-sm font-bold text-white uppercase tracking-widest">
                  {VAR_LABELS[activeVar] || activeVar} Intensity over Time
                </span>
              </div>
            </div>
            
            {/* Fix Recharts sizing by giving parent a height */}
            <div className="h-[280px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData[activeVar] || []} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={VAR_LABELS[activeVar] || activeVar}
                    stroke="#06b6d4"
                    strokeWidth={3}
                    dot={{ r: 0 }}
                    activeDot={{ r: 6, fill: '#06b6d4', stroke: '#020617', strokeWidth: 3 }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="glass p-8 rounded-[32px] border border-white/5 relative group">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-c-emerald/10 text-c-emerald">
                  <Grid size={16} />
                </div>
                <span className="text-sm font-bold text-white uppercase tracking-widest">Regional Correlation Matrix</span>
              </div>
            </div>
            
            <div className="h-[280px] flex flex-col justify-between">
              <DataHeatmap heatmapData={heatmapData} />
              <div className="pt-6 flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Intensity Range</span>
                <div className="flex-1 mx-4 h-1.5 rounded-full overflow-hidden" style={{
                  background: 'linear-gradient(90deg, rgb(2,6,23), rgb(6,182,212), rgb(16,185,129), rgb(234,179,8), rgb(239,68,68))'
                }} />
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">High</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function LandingPage() {
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError,   setUploadError]   = useState('')
  const [vizData,       setVizData]       = useState(null)
  const fileInputRef = useRef(null)

  const fetchVizData = async (fileName, rowCount) => {
    const VARS = ['temperature', 'rainfall', 'humidity', 'wind_speed', 'co2_index', 'climate_risk_score']
    const [trendResults, heatmapRes] = await Promise.all([
      Promise.all(VARS.map(v => climateApi.trends(v, 'Global').then(r => ({ v, data: r.data.data || [] })))),
      climateApi.heatmap(),
    ])

    const trendData = {}
    trendResults.forEach(({ v, data }) => { trendData[v] = data })

    setVizData({
      trendData,
      heatmapData: heatmapRes.data,
      fileName,
      rowCount,
    })
    setUploadSuccess(true)

    // Smooth scroll after mount
    setTimeout(() => {
      document.getElementById('data-viz-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 500)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadLoading(true)
    setUploadSuccess(false)
    setUploadError('')
    setVizData(null)

    try {
      const res = await climateApi.upload(file)
      await fetchVizData(file.name, res.data.rows)
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Ingress rejected. Protocol violation.')
    } finally {
      setUploadLoading(false)
      e.target.value = ''
    }
  }

  // Debug function for verification
  const loadSampleData = async () => {
    setUploadLoading(true)
    try {
      const res = await climateApi.summary()
      await fetchVizData('sample_dataset.csv', res.data.rows)
    } catch (err) {
      setUploadError('Sample ingestion failed.')
    } finally {
      setUploadLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen selection:bg-c-cyan/30 bg-c-dark">
      <AnimatedSpaceBackground />
      
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <GlobeCanvas />
        </div>
        <HeroCenterBrand />
        <FloatingClimateCards />
        <BottomNavDock />
      </section>

      {/* About Section */}
      <section id="about" className="relative py-32 px-6 bg-c-dark z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            className="flex-1 space-y-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-c-cyan/10 border border-c-cyan/20">
              <Users size={12} className="text-c-cyan" />
              <span className="text-[10px] font-black text-c-cyan uppercase tracking-widest">Team Phoenix · Technex'26</span>
            </div>
            <h2 className="text-5xl font-black text-white leading-tight">
              Intelligence Driven by <br /> <span className="gradient-text">Planetary Resilience.</span>
            </h2>
            <div className="space-y-6 text-slate-400 text-lg leading-relaxed">
              <p>
                Developed for the <strong>Hack It Out Hackathon</strong>, PyClimaExplorer is a high-fidelity diagnostic engine designed to bridge the gap between raw climate data and actionable planetary intelligence.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="glass p-5 rounded-2xl border-white/5">
                <Cpu className="text-c-cyan mb-3" size={24} />
                <p className="text-xs font-black text-white uppercase tracking-wider">Computation</p>
                <p className="text-[10px] text-slate-500 mt-1.5 uppercase tracking-widest font-bold">Real-time Slicing</p>
              </div>
              <div className="glass p-5 rounded-2xl border-white/5">
                <ShieldAlert className="text-emerald-500 mb-3" size={24} />
                <p className="text-xs font-black text-white uppercase tracking-wider">Safety</p>
                <p className="text-[10px] text-slate-500 mt-1.5 uppercase tracking-widest font-bold">Anomaly Guard</p>
              </div>
            </div>
          </motion.div>
          <div className="flex-1 w-full lg:w-auto">
            <div className="glass aspect-square max-w-[440px] mx-auto rounded-[48px] p-8 relative flex items-center justify-center border-white/10">
              <div className="text-center space-y-6 relative z-10">
                <div className="w-24 h-24 rounded-3xl bg-c-dark border border-c-cyan/30 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(6,182,212,0.2)]">
                  <Binary className="text-c-cyan" size={40} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-2xl font-black text-white tracking-tight leading-none">Phoenix Core</h4>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest pt-2">v2.0 Matrix Ingress</p>
                </div>
                <div className="font-mono text-[10px] text-c-cyan/50 space-y-1.5 bg-black/40 p-5 rounded-2xl text-left border border-white/5">
                  <p className="animate-pulse">{">"} SECURE_LINK_ACTIVE</p>
                  <p>{">"} DATA_VOXEL_SYNC: 100%</p>
                  <p>{">"} ANOMALY_SENSORS_ON</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="how-it-works" className="relative py-32 px-6 bg-slate-950 z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h2 className="text-4xl font-black text-white mb-4 tracking-tight">The Ingress Workflow</h2>
          <p className="text-slate-500 max-w-xl mx-auto font-bold uppercase text-[10px] tracking-[0.3em]">Protocol Phase Documentation</p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 px-4">
          {[
            { step: "01", title: "Ingestion", desc: "Upload NetCDF or CSV archives to our core.", icon: Upload },
            { step: "02", title: "Discovery", desc: "AI-assisted detection of variable interactions.", icon: Binary },
            { step: "03", title: "Mapping", desc: "Grid-projection onto our 3D planetary model.", icon: Map },
            { step: "04", title: "Reporting", desc: "Generate data-backed insights automatically.", icon: BarChart3 },
          ].map((item, i) => (
            <motion.div key={i} className="glass p-10 rounded-[40px] flex flex-col items-center text-center gap-6 group hover:border-c-cyan/40 transition-all border-white/5 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-c-cyan/5 flex items-center justify-center text-c-cyan group-hover:bg-c-cyan/20 transition-all">
                <item.icon size={28} />
              </div>
              <div>
                <p className="text-c-cyan font-black text-[10px] mb-2 tracking-[0.3em] uppercase">{item.step}. PHASE</p>
                <h3 className="text-xl font-black text-white mb-2">{item.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed font-medium">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Explorer Globe Section */}
      <ExploreGlobeSection />

      {/* Features Section */}
      <section id="features" className="relative py-32 px-6 bg-c-dark z-10 border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h2 className="text-5xl font-black text-white mb-20 tracking-tighter">Feature <span className="gradient-text">Matrix.</span></motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: "NetCDF Protocol", 
                desc: "Upload planetary archives (.nc) to generate thermal diagnostics and trend models.",
                icon: Database,
                action: () => fileInputRef.current?.click(),
                loading: uploadLoading,
                success: uploadSuccess,
                error: uploadError,
                secondaryAction: loadSampleData
              },
              { title: "Delta Explorer", desc: "Compute statistical shifts across temporal dimensions.", icon: Shield, link: "/compare" },
              { title: "Planetary Grid", desc: "WebGL-accelerated records on a global coordinate lattice.", icon: Globe, link: "/globe" }
            ].map((f, i) => (
              <div key={i} className="glass p-10 rounded-[40px] text-left hover:border-c-cyan/30 transition-all group flex flex-col justify-between min-h-[300px] border-white/5 relative overflow-hidden" 
                   onClick={(e) => { e.stopPropagation(); if (f.action) f.action(); else if(f.link) window.location.href = f.link }}>
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-c-cyan/10 flex items-center justify-center text-c-cyan mb-8 group-hover:scale-110 transition-all">
                    {f.loading ? <div className="w-5 h-5 border-2 border-c-cyan border-t-transparent rounded-full animate-spin" /> : <f.icon size={24} />}
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3 group-hover:text-c-cyan transition-colors">{f.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-sm font-medium">{f.desc}</p>
                </div>
                
                {f.title === "NetCDF Protocol" && !vizData && (
                  <button onClick={(e) => { e.stopPropagation(); f.secondaryAction() }} className="mt-6 flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">
                    <Play size={10} /> Use Sample Data
                  </button>
                )}

                {f.success && <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-6 bg-emerald-400/10 py-2 px-3 rounded-lg border border-emerald-400/20">✓ Sync Complete</p>}
                {f.error && <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-6 bg-rose-400/10 py-2 px-3 rounded-lg border border-rose-400/20">⚠ {f.error}</p>}
              </div>
            ))}
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept=".nc" onChange={handleFileUpload} />
        </div>
      </section>

      {/* ── Visualization Panel ── */}
      <div id="data-viz-panel">
        <AnimatePresence>
          {vizData && (
            <DataVizPanel
              trendData={vizData.trendData}
              heatmapData={vizData.heatmapData}
              fileName={vizData.fileName}
              rowCount={vizData.rowCount}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Team Section */}
      <section id="team" className="py-32 px-6 bg-c-dark z-10 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-4">The Phoenix Team</h2>
          <p className="text-slate-500 mb-12 uppercase tracking-[0.2em] text-[10px] font-bold">Leading Climate Intelligence · technex'26</p>
          <div className="flex flex-wrap justify-center gap-12">
            {['Pulkit K.', 'Prateek R.', 'Ananya A.', 'Piyush T.'].map((name, i) => (
              <motion.div key={name} className="flex flex-col items-center group" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-c-cyan to-c-emerald mb-4 flex items-center justify-center text-slate-950 font-black shadow-lg">
                  {name[0]}
                </div>
                <p className="text-white font-bold text-sm mb-1">{name}</p>
                <p className="text-slate-600 text-[10px] font-bold uppercase tracking-wider">Core Contributor</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      <div className="h-24 bg-c-dark" />
    </div>
  )
}
