import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { climateApi } from '../services/api'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Thermometer, Droplets, Wind, Activity, Upload, RefreshCw, TrendingUp, Globe } from 'lucide-react'

const VARS = ['temperature','rainfall','humidity','wind_speed','co2_index','climate_risk_score']

function KpiCard({ icon: Icon, label, value, unit, delta, idx }) {
  const colors = ['text-c-cyan','text-c-emerald','text-violet-400','text-amber-400','text-rose-400']
  const borders = ['border-c-cyan','border-c-emerald','border-violet-400','border-amber-400','border-rose-400']
  const c = idx % colors.length
  return (
    <motion.div
      className={`glass rounded-2xl p-6 border-l-4 ${borders[c]} relative overflow-hidden group hover:-translate-y-1 transition-transform`}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
    >
      <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon size={40} />
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-3xl font-black ${colors[c]}`}>{value ?? '—'}</p>
      {unit && <p className="text-xs text-slate-500 mt-1">{unit}</p>}
      {delta !== undefined && (
        <p className={`text-xs font-bold mt-2 ${delta >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
          {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(2)} over period
        </p>
      )}
    </motion.div>
  )
}

export default function DashboardPage() {
  const username = localStorage.getItem('username') || 'Explorer'
  const [summary,   setSummary]   = useState(null)
  const [trends,    setTrends]    = useState([])
  const [selVar,    setSelVar]    = useState('temperature')
  const [selReg,    setSelReg]    = useState('Global')
  const [kpis,      setKpis]      = useState({})
  const [loading,   setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [toast,     setToast]     = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const loadAll = useCallback(async (r = selReg) => {
    setLoading(true)
    try {
      const resp = await climateApi.bulk(r)
      const { summary: s, trends: t, heatmap: h } = resp.data
      setSummary(s)
      
      // Update trends for the currently selected variable
      const currentTrends = t[selVar] || []
      setTrends(currentTrends)
      
      const vals = currentTrends.map(d => d.value)
      if (vals.length) setKpis({
        avg:   (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2),
        min:   Math.min(...vals).toFixed(2),
        max:   Math.max(...vals).toFixed(2),
        delta: (vals[vals.length - 1] - vals[0]).toFixed(2),
        last:  vals[vals.length - 1]?.toFixed(2),
      })
    } catch (err) {
      showToast('❌ Failed to sync climate matrix')
    } finally { setLoading(false) }
  }, [selVar, selReg])

  useEffect(() => { loadAll() }, [selReg]) // Only trigger on region change
  
  // When variable changes, we can just slice from local cache if we had one, 
  // but for simplicity and reactivity with filters, we'll re-fetch or use bulk.
  // Let's keep it simple: refetch bulk on region, but variable change just updates view.
  useEffect(() => {
    if (!summary) return 
    loadAll() 
  }, [selVar]) 

  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setUploading(true)
    try {
      await climateApi.upload(file)
      await loadAll()
      showToast('✅ Dataset loaded successfully!')
    } catch (err) { showToast('❌ ' + (err.response?.data?.detail || 'Upload failed')) }
    finally { setUploading(false) }
  }

  const regions = ['Global', ...(summary?.regions || [])]

  return (
    <div className="p-8 max-w-[1600px] mx-auto relative">

      {/* Toast */}
      {toast && (
        <motion.div className="fixed top-6 right-6 z-50 glass rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-2xl"
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          {toast}
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <p className="text-sm font-bold text-c-cyan tracking-widest uppercase mb-1">Climate Intelligence Hub</p>
          <h1 className="text-5xl font-black text-white leading-tight">Good morning,<br />
            <span className="gradient-text">{username}</span>
          </h1>
          <p className="text-slate-400 mt-2">Here's your planetary overview for today.</p>
        </motion.div>
        <label className="cursor-pointer glass rounded-2xl px-6 py-3.5 flex items-center gap-3 hover:bg-slate-800/70 transition-all group border border-slate-700 hover:border-c-cyan/40">
          {uploading ? <RefreshCw size={18} className="animate-spin text-c-cyan" /> : <Upload size={18} className="text-c-cyan group-hover:scale-110 transition-transform" />}
          <span className="text-sm font-bold text-slate-200">{uploading ? 'Processing…' : 'Upload Dataset'}</span>
          <input type="file" accept=".nc,.csv" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <KpiCard icon={Thermometer}  label="Mean Value (2024)"   value={kpis.last}  unit={selVar.replace(/_/g,' ')} idx={0} />
        <KpiCard icon={TrendingUp}   label="Net Period Delta"     value={kpis.delta} unit="absolute change"         idx={1} delta={parseFloat(kpis.delta)} />
        <KpiCard icon={Activity}     label="Range"                value={`${kpis.min} – ${kpis.max}`} unit="min to max" idx={2} />
        <KpiCard icon={Globe}        label="Data Coverage"        value={summary?.rows?.toLocaleString()} unit="total data points" idx={3} />
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-8 flex-wrap items-end">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Variable</label>
          <select value={selVar} onChange={e => setSelVar(e.target.value)}
            className="bg-c-board border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-c-cyan transition-all cursor-pointer">
            {VARS.map(v => <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Region</label>
          <select value={selReg} onChange={e => setSelReg(e.target.value)}
            className="bg-c-board border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-c-cyan transition-all cursor-pointer">
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <button onClick={() => loadAll()} className="flex items-center gap-2 px-5 py-2.5 glass rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-all">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="glass rounded-3xl h-80 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-2 border-slate-700 border-t-c-cyan rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-mono tracking-widest">LOADING CLIMATE MATRIX…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Area Chart */}
          <div className="lg:col-span-2 glass rounded-3xl p-7">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-xl text-white">{selVar.replace(/_/g, ' ')} Trend</h3>
              <span className="text-xs font-bold bg-c-cyan/15 text-c-cyan px-3 py-1.5 rounded-full">{selReg}</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="year" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} width={65} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', boxShadow:'0 0 20px rgba(0,0,0,0.5)' }} itemStyle={{ color: '#06b6d4' }} labelStyle={{ color: '#94a3b8' }} />
                <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={3} fill="url(#areaGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Dataset info + bar mini */}
          <div className="space-y-4">
            <div className="glass rounded-3xl p-6">
              <h3 className="font-bold text-white mb-4">Dataset Info</h3>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Rows</span><span className="text-c-cyan font-bold">{summary?.rows?.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Years</span><span className="text-c-emerald font-bold">{summary?.years?.[0]}–{summary?.years?.[summary.years.length - 1]}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Regions</span><span className="text-violet-400 font-bold">{summary?.regions?.length}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Variables</span><span className="text-amber-400 font-bold">{summary?.variables?.length}</span></div>
              </div>
            </div>
            <div className="glass rounded-3xl p-6">
              <h3 className="font-bold text-white mb-4">Bar Distribution</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={trends.slice(-10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="year" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} width={50} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px' }} itemStyle={{ color: '#10b981' }} />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
