import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { Home, Layers, Globe, BarChart2, Lightbulb, Users, LogIn } from 'lucide-react'

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '#about', icon: Users, label: 'About' },
  { path: '#features', icon: Layers, label: 'Features' },
  { path: '/globe', icon: Globe, label: 'Live Globe' },
  { path: '/compare', icon: BarChart2, label: 'Compare' },
  { path: '/insights', icon: Lightbulb, label: 'Insights' },
]

export default function BottomNavDock() {
  const location = useLocation()
  const isAuth = !!localStorage.getItem('token')

  return (
    <div className="fixed bottom-10 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none">
      <motion.nav 
        className="glass-dock p-2 rounded-[32px] flex items-center gap-1 sm:gap-2 max-w-full overflow-x-auto no-scrollbar shadow-2xl pointer-events-auto"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2, ease: "circOut" }}
      >
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path
          const isHash = item.path.startsWith('#')
          
          const Content = (
            <div 
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-[24px] transition-all duration-300 group
                ${active 
                  ? 'bg-gradient-to-r from-c-cyan/20 to-c-emerald/20 text-c-cyan border border-c-cyan/30' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <item.icon size={18} className={`${active ? 'text-c-cyan' : 'group-hover:text-c-cyan'} transition-colors`} />
              <span className="text-xs font-bold tracking-tight whitespace-nowrap">{item.label}</span>
            </div>
          )

          return isHash ? (
            <a key={item.label} href={item.path}>{Content}</a>
          ) : (
            <Link key={item.label} to={item.path}>{Content}</Link>
          )
        })}

        <div className="w-px h-6 bg-white/10 mx-2 hidden sm:block" />

        <Link to={isAuth ? "/dashboard" : "/auth"}>
          <motion.div 
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-[24px] bg-gradient-to-r from-c-cyan to-c-emerald text-slate-950 font-black text-xs tracking-tight transition-transform hover:scale-105 active:scale-95"
            whileHover={{ boxShadow: "0 0 20px rgba(6, 182, 212, 0.45)" }}
          >
            <LogIn size={16} />
            <span className="whitespace-nowrap">{isAuth ? "Dashboard" : "Get Started"}</span>
          </motion.div>
        </Link>
      </motion.nav>
    </div>
  )
}
