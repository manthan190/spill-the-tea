'use client';

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-[#020202]" />

      {/* Neon pink blob */}
      <div
        className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-[0.15] blur-[120px] animate-blob"
        style={{ background: '#FF007A' }}
      />

      {/* Cyber cyan blob */}
      <div
        className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.12] blur-[140px] animate-blob animation-delay-2000"
        style={{ background: '#00DFD8' }}
      />

      {/* Neon purple blob */}
      <div
        className="absolute bottom-[-10%] left-[30%] w-[550px] h-[550px] rounded-full opacity-[0.13] blur-[130px] animate-blob animation-delay-4000"
        style={{ background: '#7928CA' }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, rgba(2, 2, 2, 0.7) 100%)',
        }}
      />
    </div>
  );
}
