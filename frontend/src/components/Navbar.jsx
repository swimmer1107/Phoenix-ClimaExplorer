import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, LayoutDashboard, ArrowLeftRight, Home, LogIn, LogOut, Menu, X } from 'lucide-react'

const NAV = [
  { to:'/',          icon: Home,             label:'Home'       },
  { to:'/dashboard', icon: LayoutDashboard,  label:'Dashboard'  },
  { to:'/globe',     icon: Globe,            label:'Globe View' },
  { to:'/compare',   icon: ArrowLeftRight,   label:'Compare'    },
]

export default function Navbar() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const authed    = !!localStorage.getItem('token')
  const username  = localStorage.getItem('username') || ''
  const [collapsed, setCollapsed] = useState(false)

  const logout = () => {
    localStorage.clear()
    navigate('/')
    window.location.reload()
  }

  return (
    <motion.nav
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ type:'spring', stiffness:200, damping:25 }}
      className="relative flex flex-col h-full bg-c-card border-r border-slate-800 py-6 z-50 overflow-hidden"
      style={{ flexShrink: 0 }}
    >
      {/* Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-4 right-3 text-slate-400 hover:text-white transition-colors"
      >
        {collapsed ? <Menu size={18}/> : <X size={18}/>}
      </button>

      {/* Logo */}
      <div className="px-4 mb-8 mt-2 flex items-center gap-3 overflow-hidden">
        <Globe className="text-c-cyan shrink-0" size={22}/>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}}
              className="font-black text-lg gradient-text whitespace-nowrap"
            >
              PyClimaExplorer
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Links */}
      <div className="flex-1 flex flex-col gap-1 px-2">
        {NAV.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to} to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all overflow-hidden
                ${active
                  ? 'bg-c-cyan/15 text-c-cyan'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <Icon size={18} className="shrink-0"/>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                    className="text-sm font-semibold whitespace-nowrap"
                  >{label}</motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </div>

      {/* Auth */}
      <div className="px-2 mt-4">
        {authed ? (
          <div className="flex flex-col gap-2">
            {!collapsed && (
              <div className="px-3 py-2 rounded-xl bg-c-board text-xs text-slate-400 truncate">
                👤 {username}
              </div>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all"
            >
              <LogOut size={18} className="shrink-0"/>
              {!collapsed && <span className="text-sm font-semibold">Logout</span>}
            </button>
          </div>
        ) : (
          <Link to="/auth" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-c-blue hover:bg-c-blue/10 transition-all">
            <LogIn size={18} className="shrink-0"/>
            {!collapsed && <span className="text-sm font-semibold">Login</span>}
          </Link>
        )}
      </div>
    </motion.nav>
  )
}
