import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { resendVerification } from '../lib/api'

export function VerifyScreen() {
  const { navigateTo, pendingEmail } = useAppStore()
  const [resent, setResent] = useState(false)
  const [resending, setResending] = useState(false)

  const handleResend = async () => {
    if (!pendingEmail || resending) return
    setResending(true)
    try {
      await resendVerification(pendingEmail)
      setResent(true)
    } catch {
      // ignore
    } finally {
      setResending(false)
    }
  }

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
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: '#fff' }}>Verifique seu e-mail</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 500, marginTop: 4 }}>
          Quase lá! Um link foi enviado para você
        </div>
      </div>

      <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Email icon */}
        <div style={{
          width: 96, height: 96, borderRadius: '50%',
          background: 'rgba(250,20,98,0.08)', border: '2px solid rgba(250,20,98,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 40, marginBottom: 28,
        }}>
          📧
        </div>

        <p style={{ textAlign: 'center', fontSize: 15, color: 'var(--text)', marginBottom: 8, fontWeight: 600 }}>
          Confirme seu cadastro
        </p>

        {pendingEmail && (
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>
            Enviamos um link de confirmação para
          </p>
        )}

        {pendingEmail && (
          <div style={{
            background: 'rgba(250,20,98,0.06)', border: '1px solid rgba(250,20,98,0.2)',
            borderRadius: 10, padding: '8px 16px', marginBottom: 20,
          }}>
            <span style={{ fontSize: 14, color: 'var(--pink)', fontWeight: 600 }}>
              {pendingEmail}
            </span>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text2)', marginBottom: 32, lineHeight: 1.6 }}>
          Clique no link do e-mail para confirmar sua conta.<br />
          Depois, volte aqui e faça login.
        </p>

        {resent && (
          <div style={{
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 10, padding: '10px 16px', marginBottom: 20,
            fontSize: 13, color: '#16a34a', fontWeight: 500, textAlign: 'center',
          }}>
            ✓ Link reenviado!
          </div>
        )}

        <button
          onClick={() => navigateTo('login')}
          style={{
            width: '100%', padding: 15, background: 'var(--grad-warm)',
            border: 'none', borderRadius: 'var(--radius-sm)',
            color: 'white', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', marginBottom: 12,
          }}
        >
          Ir para o login
        </button>

        <button
          onClick={handleResend}
          disabled={resending || resent}
          style={{
            background: 'none', border: 'none',
            color: resent ? 'var(--text3)' : 'var(--pink)',
            fontSize: 13, fontWeight: 600,
            cursor: resent ? 'default' : 'pointer',
          }}
        >
          {resending ? 'Reenviando...' : resent ? 'E-mail reenviado ✓' : 'Reenviar e-mail'}
        </button>
      </div>
    </div>
  )
}
