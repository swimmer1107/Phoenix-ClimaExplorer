import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Globe, LayoutDashboard, LogIn, LogOut, Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#globe',    label: 'Globe' },
  { href: '/globe',    label: 'Live Globe', isRoute: true },
]

export default function TopNavbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [mobileOpen, setMobile]   = useState(false)
  const location  = useLocation()
  const navigate  = useNavigate()
  const authed    = !!localStorage.getItem('token')
  const username  = localStorage.getItem('username')

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const logout = () => {
    localStorage.clear(); navigate('/'); window.location.reload()
  }

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'py-3 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 shadow-2xl'
                 : 'py-5 bg-transparent'
      }`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0,   opacity: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-c-cyan to-c-emerald flex items-center justify-center shadow-lg shadow-c-cyan/25 group-hover:shadow-c-cyan/50 transition-shadow">
            <Globe className="text-slate-950 w-5 h-5" />
          </div>
          <span className="font-black text-lg text-white tracking-tight">PyClima<span className="gradient-text">Explorer</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(link =>
            link.isRoute ? (
              <Link key={link.label} to={link.href}
                className="text-sm font-medium text-slate-400 hover:text-c-cyan transition-colors"
              >{link.label}</Link>
            ) : (
              <a key={link.label} href={link.href}
                className="text-sm font-medium text-slate-400 hover:text-c-cyan transition-colors"
              >{link.label}</a>
            )
          )}
          {authed && (
            <Link to="/dashboard" className="text-sm font-medium text-slate-400 hover:text-c-cyan transition-colors flex items-center gap-1.5">
              <LayoutDashboard size={14}/> Dashboard
            </Link>
          )}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          {authed ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">👤 {username}</span>
              <button onClick={logout} className="flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors px-3 py-2 rounded-lg hover:bg-rose-400/10">
                <LogOut size={14}/> Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/auth">
                <button className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all">
                  Login
                </button>
              </Link>
              <Link to="/auth">
                <button className="text-sm font-bold px-5 py-2.5 bg-gradient-to-r from-c-cyan to-c-emerald text-slate-950 rounded-xl hover:shadow-[0_0_20px_rgba(6,182,212,0.45)] transition-all hover:-translate-y-0.5">
                  Get Started
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-slate-400 hover:text-white p-2" onClick={() => setMobile(!mobileOpen)}>
          {mobileOpen ? <X size={22}/> : <Menu size={22}/>}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden border-t border-white/5 bg-slate-950/95 backdrop-blur-xl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit=  {{ opacity: 0, height: 0 }}
          >
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-3">
              {NAV_LINKS.map(l => <a key={l.label} href={l.href} className="text-slate-300 text-sm font-medium py-2">{l.label}</a>)}
              <Link to="/auth" className="mt-2">
                <button className="w-full py-3 bg-gradient-to-r from-c-cyan to-c-emerald text-slate-950 font-black rounded-xl">
                  {authed ? 'Open Dashboard' : 'Get Started'}
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
