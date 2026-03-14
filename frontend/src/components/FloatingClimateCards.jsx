import { motion } from 'framer-motion'
import { Thermometer, Droplets, Wind, Activity } from 'lucide-react'

const CARDS = [
  { icon: Thermometer, label: 'Temp Anomaly', value: '+1.8°C', color: 'text-rose-400', pos: 'top-[20%] left-[15%]' },
  { icon: Droplets, label: 'Rainfall Shift', value: '-12%', color: 'text-sky-400', pos: 'top-[25%] right-[12%]' },
  { icon: Wind, label: 'Wind Delta', value: '+3.2 m/s', color: 'text-emerald-400', pos: 'bottom-[35%] left-[10%]' },
  { icon: Activity, label: 'CO2 Intensity', value: '421 ppm', color: 'text-amber-400', pos: 'bottom-[30%] right-[18%]' },
]

export default function FloatingClimateCards() {
  return (
    <div className="absolute inset-0 pointer-events-none hidden lg:block overflow-hidden">
      {CARDS.map((card, i) => (
        <motion.div
          key={i}
          className={`absolute ${card.pos} glass p-4 rounded-2xl flex items-center gap-3 backdrop-blur-xl border border-white/10 shadow-2xl z-20`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: [0, -15, 0],
          }}
          transition={{ 
            opacity: { delay: 1 + i * 0.2, duration: 0.8 },
            y: { duration: 4 + i, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <div className={`${card.color} w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center`}>
            <card.icon size={16} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{card.label}</p>
            <p className="text-sm font-black text-white">{card.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
