import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, LayoutDashboard, ArrowLeftRight, Lightbulb, Home, LogOut, ChevronLeft, Menu } from 'lucide-react'

const LINKS = [
  { to: '/dashboard',          icon: LayoutDashboard, label: 'Overview'    },
  { to: '/dashboard/compare',  icon: ArrowLeftRight,  label: 'Compare Years' },
  { to: '/dashboard/insights', icon: Lightbulb,       label: 'AI Insights' },
  { to: '/globe',              icon: Globe,           label: 'Globe View'  },
]

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const location   = useLocation()
  const navigate   = useNavigate()
  const username   = localStorage.getItem('username') || 'Explorer'

  const logout = () => { localStorage.clear(); navigate('/'); window.location.reload() }

  return (
    <div className="flex h-screen overflow-hidden bg-c-dark">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        className="flex flex-col h-full bg-c-card border-r border-slate-800/60 py-6 z-40 overflow-hidden shrink-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 mb-8">
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}}
                className="flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-c-cyan to-c-emerald flex items-center justify-center shrink-0">
                  <Globe className="text-slate-950 w-4 h-4"/>
                </div>
                <span className="font-black text-sm text-white whitespace-nowrap">PyClimaExplorer</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={()=>setCollapsed(!collapsed)} className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800 ml-auto">
            {collapsed ? <Menu size={18}/> : <ChevronLeft size={18}/>}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-1">
          {LINKS.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group overflow-hidden
                  ${active ? 'bg-c-cyan/15 text-c-cyan border border-c-cyan/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/70'}`}
              >
                <Icon size={18} className="shrink-0"/>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                      className="text-sm font-semibold whitespace-nowrap"
                    >{label}</motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="px-2 mt-4 border-t border-slate-800 pt-4 space-y-2">
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                className="px-3 py-2.5 rounded-xl bg-c-board"
              >
                <p className="text-xs text-slate-500 mb-0.5">Signed in as</p>
                <p className="text-sm font-bold text-c-cyan truncate">{username}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-rose-400 hover:bg-rose-400/10 transition-all"
          >
            <LogOut size={18} className="shrink-0"/>
            {!collapsed && <span className="text-sm font-semibold">Logout</span>}
          </button>
          <Link to="/">
            <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 transition-all mt-1">
              <Home size={18} className="shrink-0"/>
              {!collapsed && <span className="text-sm font-semibold">Home</span>}
            </button>
          </Link>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-c-dark">
        <Outlet />
      </main>
    </div>
  )
}
