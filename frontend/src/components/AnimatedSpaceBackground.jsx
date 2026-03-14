export default function AnimatedSpaceBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Deep Navy Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#050d1d_0%,_#020617_100%)]" />
      
      {/* Nebula Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-c-cyan/5 rounded-full blur-[140px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-c-emerald/5 rounded-full blur-[140px]" />
      
      {/* Vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.8)]" />
    </div>
  )
}
