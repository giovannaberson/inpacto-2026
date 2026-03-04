import { useState } from 'react'
import { useAppStore } from '../store/appStore'

export function SignupScreen() {
  const { navigateTo } = useAppStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{
        padding: '52px 20px 20px',
        background: 'var(--grad-hero)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}>
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 200, height: 200,
          background: 'rgba(255,255,255,0.06)', borderRadius: '50%',
        }} />
        <button
          onClick={() => navigateTo('login')}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, marginBottom: 12, padding: 0 }}
        >
          ← Voltar
        </button>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: '#fff' }}>
          Criar conta
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 500, marginTop: 4 }}>
          Junte-se à conferência!
        </div>
      </div>

      {/* Form */}
      <div className="scroll-area" style={{ padding: '24px 24px 0' }}>
        {[
          { label: 'Nome completo', placeholder: 'Seu nome', value: name, onChange: setName, type: 'text' },
          { label: 'E-mail', placeholder: 'seu@email.com', value: email, onChange: setEmail, type: 'email' },
          { label: 'Senha', placeholder: 'Mínimo 6 caracteres', value: password, onChange: setPassword, type: 'password' },
        ].map(field => (
          <div key={field.label} style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>
              {field.label}
            </label>
            <input
              type={field.type}
              placeholder={field.placeholder}
              value={field.value}
              onChange={e => field.onChange(e.target.value)}
              style={{
                width: '100%', background: 'var(--bg2)', border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-sm)', padding: '13px 15px',
                color: 'var(--text)', fontSize: 14, outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--pink)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        ))}

        <button
          onClick={() => navigateTo('verify')}
          style={{
            width: '100%', padding: 15, background: 'var(--grad-warm)',
            border: 'none', borderRadius: 'var(--radius-sm)',
            color: 'white', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', marginTop: 8,
          }}
        >
          Criar conta
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 16 }}>
          Ao criar uma conta você concorda com os{' '}
          <span style={{ color: 'var(--pink)', fontWeight: 600 }}>Termos de Uso</span>
        </p>
      </div>
    </div>
  )
}
