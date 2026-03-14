import { motion } from 'framer-motion'

export default function HeroCenterBrand() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none px-6 text-center">
      {/* Badge */}
      <motion.div
        className="glass px-4 py-1.5 rounded-full mb-8 border border-c-cyan/30 bg-c-cyan/5 flex items-center gap-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-c-cyan animate-pulse" />
        <span className="text-[10px] font-bold tracking-[0.2em] text-c-cyan uppercase">
          Technex'26 — Hack It Out Hackathon
        </span>
      </motion.div>

      {/* Main Title */}
      <motion.h1
        className="text-7xl md:text-9xl font-black tracking-tighter text-white mb-4 flex flex-col"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
      >
        <span className="relative">
          PyClima
          <span className="gradient-text text-glow">Explorer</span>
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-lg md:text-xl text-slate-400 font-medium max-w-lg leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
      >
        Explore climate change through <br className="hidden md:block" />
        <span className="text-white font-semibold">immersive 3D intelligence.</span>
      </motion.p>
    </div>
  )
}
