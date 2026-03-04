import { useEffect } from 'react'
import { useAppStore } from '../store/appStore'

export function SplashScreen() {
  const { initAuth } = useAppStore()

  useEffect(() => {
    // Give splash 2.2s to show, then check auth
    const t = setTimeout(() => initAuth(), 2200)
    return () => clearTimeout(t)
  }, [initAuth])

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#08000D',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 999, overflow: 'hidden',
    }}>
      {/* Cloud deco top */}
      <div style={{
        position: 'absolute', top: -20, left: -30,
        width: 260, height: 130, opacity: 0.45, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 40% 50%, rgba(250,20,98,0.4) 0%, rgba(255,143,68,0.3) 40%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(28px)',
      }} />
      <div style={{
        position: 'absolute', bottom: 20, right: -30,
        width: 220, height: 110, opacity: 0.35, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 60% 50%, rgba(77,193,231,0.4) 0%, rgba(53,18,106,0.3) 40%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(24px)',
      }} />

      {/* Scattered dots */}
      {[...Array(12)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: (i % 3) + 1,
          height: (i % 3) + 1,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.4)',
          top: `${(i * 17 + 5) % 90}%`,
          left: `${(i * 23 + 7) % 90}%`,
          opacity: 0.3 + (i % 4) * 0.1,
        }} />
      ))}

      {/* Logo */}
      <div className="splash-up" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 72, fontWeight: 800, lineHeight: 1,
          background: 'var(--grad-hero)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          letterSpacing: '-2px',
        }}>
          InPacto
        </div>
        <div style={{
          fontSize: 14, color: 'rgba(255,255,255,0.55)',
          fontWeight: 700, letterSpacing: '6px', marginTop: 8,
          textTransform: 'uppercase',
        }}>
          SATURADOS 2026
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 13, color: 'rgba(255,255,255,0.35)',
          fontWeight: 500, marginTop: 24, letterSpacing: '0.5px',
        }}>
          Sua jornada começa aqui
        </div>
      </div>

      {/* Loading bar */}
      <div style={{
        position: 'absolute', bottom: 48, left: '50%', transform: 'translateX(-50%)',
        width: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      }}>
        <div style={{
          width: 48, height: 3, background: 'rgba(255,255,255,0.12)',
          borderRadius: 2, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', background: 'var(--grad-warm)',
            borderRadius: 2,
            animation: 'splashBar 2s ease forwards',
          }} />
        </div>
      </div>

      <style>{`
        @keyframes splashBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  )
}
