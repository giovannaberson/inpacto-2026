import { useState, useRef } from 'react'
import { useAppStore } from '../store/appStore'

export function VerifyScreen() {
  const { navigateTo } = useAppStore()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (idx: number, val: string) => {
    const v = val.replace(/\D/, '').slice(-1)
    const next = [...code]
    next[idx] = v
    setCode(next)
    if (v && idx < 5) inputs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus()
    }
  }

  const isComplete = code.every(c => c !== '')

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{
        padding: '52px 20px 24px',
        background: 'var(--grad-hero)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <button onClick={() => navigateTo('signup')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, marginBottom: 12, padding: 0 }}>
          ← Voltar
        </button>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: '#fff' }}>Verificar e-mail</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 500, marginTop: 4 }}>
          Enviamos um código para o seu e-mail
        </div>
      </div>

      <div style={{ padding: '32px 24px' }}>
        {/* Email icon */}
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(250,20,98,0.1)', border: '2px solid rgba(250,20,98,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 24px' }}>
          📧
        </div>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text2)', marginBottom: 28, lineHeight: 1.5 }}>
          Digite o código de 6 dígitos<br />enviado para seu e-mail
        </p>

        {/* Code inputs */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
          {code.map((digit, idx) => (
            <input
              key={idx}
              ref={el => { inputs.current[idx] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
              style={{
                width: 48, height: 56, textAlign: 'center',
                fontSize: 22, fontWeight: 700,
                background: digit ? 'rgba(250,20,98,0.06)' : 'var(--bg2)',
                border: `2px solid ${digit ? 'var(--pink)' : 'var(--border)'}`,
                borderRadius: 12, color: 'var(--text)', outline: 'none',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--pink)'}
              onBlur={e => { if (!digit) e.target.style.borderColor = 'var(--border)' }}
            />
          ))}
        </div>

        <button
          onClick={() => isComplete && navigateTo('profile-setup')}
          style={{
            width: '100%', padding: 15,
            background: isComplete ? 'var(--grad-warm)' : 'var(--bg3)',
            border: 'none', borderRadius: 'var(--radius-sm)',
            color: isComplete ? 'white' : 'var(--text3)', fontSize: 14, fontWeight: 700,
            cursor: isComplete ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s', marginBottom: 16,
          }}
        >
          Verificar código
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text3)' }}>
          Não recebeu?{' '}
          <span style={{ color: 'var(--pink)', fontWeight: 600, cursor: 'pointer' }}>Reenviar código</span>
        </p>
      </div>
    </div>
  )
}
