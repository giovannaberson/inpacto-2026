import { useState } from 'react'
import { useAppStore } from '../store/appStore'

export function LoginScreen() {
  const { navigateTo } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = () => {
    if (email && password) navigateTo('home')
  }

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg)',
    }}>
      {/* Hero section */}
      <div style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        background: '#08000D',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 240,
      }}>
        {/* Gradient orbs */}
        <div style={{
          position: 'absolute', top: -60, left: -60, width: 280, height: 280,
          background: 'radial-gradient(circle, rgba(255,143,68,0.35) 0%, transparent 65%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, right: -40, width: 240, height: 240,
          background: 'radial-gradient(circle, rgba(53,18,106,0.5) 0%, transparent 65%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', top: '30%', right: '20%', width: 160, height: 160,
          background: 'radial-gradient(circle, rgba(250,20,98,0.25) 0%, transparent 65%)',
          borderRadius: '50%',
        }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 52, fontWeight: 800, lineHeight: 1,
            background: 'var(--grad-hero)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            letterSpacing: '-1.5px',
          }}>
            InPacto
          </div>
          <div style={{
            fontSize: 12, color: 'rgba(255,255,255,0.45)',
            fontWeight: 700, letterSpacing: '4px', marginTop: 6,
            textTransform: 'uppercase',
          }}>
            SATURADOS 2026
          </div>
        </div>
      </div>

      {/* Auth card */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: '28px 28px 0 0',
        padding: '28px 24px 32px',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
        flexShrink: 0,
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 4, color: 'var(--dark)' }}>
          Bem-vindo! 👋
        </div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24, fontWeight: 500 }}>
          Entre para viver a conferência
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, display: 'block', letterSpacing: '0.2px' }}>
            E-mail
          </label>
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%', background: 'var(--bg2)', border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '13px 15px',
              color: 'var(--text)', fontSize: 14, outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--pink)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, display: 'block', letterSpacing: '0.2px' }}>
            Senha
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%', background: 'var(--bg2)', border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '13px 15px',
              color: 'var(--text)', fontSize: 14, outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--pink)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <button
          onClick={handleLogin}
          style={{
            width: '100%', padding: 15, background: 'var(--grad-warm)',
            border: 'none', borderRadius: 'var(--radius-sm)',
            color: 'white', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', marginBottom: 12, letterSpacing: '0.3px',
            transition: 'opacity 0.2s, transform 0.12s',
          }}
          onMouseDown={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'scale(0.98)' }}
          onMouseUp={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
        >
          Entrar
        </button>

        <button
          onClick={() => navigateTo('signup')}
          style={{
            width: '100%', padding: 13, background: 'transparent',
            border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
            color: 'var(--text2)', fontSize: 13, fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Primeiro acesso? Cadastre-se
        </button>
      </div>
    </div>
  )
}
