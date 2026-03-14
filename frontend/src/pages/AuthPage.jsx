import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'
import { Globe, LogIn, UserPlus, Shield } from 'lucide-react'

export default function AuthPage() {
  const [tab,      setTab]      = useState('login')
  const [form,     setForm]     = useState({ username: '', password: '' })
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true)
    try {
      if (tab === 'login') {
        const res = await authApi.login(form)
        localStorage.setItem('token',    res.data.access_token)
        localStorage.setItem('username', res.data.username)
        navigate('/dashboard')
      } else {
        await authApi.signup(form)
        setSuccess('Account created! Please log in.')
        setTab('login')
        setForm({ ...form, password: '' })
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-c-cyan/6 rounded-full blur-[150px]" />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)', backgroundSize: '64px 64px' }}
        />
      </div>

      <motion.div
        className="glass rounded-3xl w-full max-w-md p-10 relative z-10 shadow-2xl shadow-black/60"
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-c-cyan to-c-emerald mb-5 shadow-xl shadow-c-cyan/30"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <Globe className="text-slate-950 w-8 h-8" />
          </motion.div>
          <h2 className="text-3xl font-black text-white">
            {tab === 'login' ? 'Welcome Back' : 'Join the Mission'}
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            {tab === 'login' ? 'Access your climate intelligence hub.' : 'Create your free account in seconds.'}
          </p>
        </div>

        {/* Alerts */}
        {error   && <div className="mb-5 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm text-center">{error}</div>}
        {success && <div className="mb-5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm text-center">{success}</div>}

        {/* Tabs */}
        <div className="flex rounded-xl bg-c-board p-1 mb-7">
          {['login', 'signup'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); setSuccess('') }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === t ? 'bg-gradient-to-r from-c-cyan to-c-emerald text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              {t === 'login' ? '🔑 Login' : '✨ Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Username</label>
            <input required type="text"
              placeholder="Enter your username"
              className="w-full bg-c-dark border border-slate-700 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-c-cyan focus:ring-1 focus:ring-c-cyan/30 transition-all"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <input required type="password"
              placeholder="••••••••••"
              className="w-full bg-c-dark border border-slate-700 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-c-cyan focus:ring-1 focus:ring-c-cyan/30 transition-all"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <motion.button
            type="submit" disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-c-cyan to-c-emerald text-slate-950 font-black rounded-xl
              shadow-lg shadow-c-cyan/25 hover:shadow-c-cyan/45 disabled:opacity-60 transition-all flex items-center justify-center gap-2 text-base mt-2"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
            ) : tab === 'login' ? <><LogIn size={18}/> Access Dashboard</> : <><UserPlus size={18}/> Create Account</>}
          </motion.button>
        </form>

        <div className="mt-6 flex items-center gap-2 justify-center text-slate-600 text-xs">
          <Shield size={12}/> Secured with JWT Authentication
        </div>
      </motion.div>
    </div>
  )
}
