import { useAppStore } from '../store/appStore'

export function Topbar() {
  const { user, navigateTo } = useAppStore()
  const initials = user.name.split(' ').slice(0, 2).map(w => w[0]).join('')

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 20px 14px',
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      flexShrink: 0, position: 'relative', zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 32 }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px',
          background: 'var(--grad-warm)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          InPacto
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '2px',
          color: 'var(--text3)', textTransform: 'uppercase', marginTop: 2,
        }}>
          2026
        </span>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          background: 'var(--xp-bg)', border: '1px solid rgba(196,122,0,0.3)',
          color: 'var(--xp)', fontSize: 11, fontWeight: 700,
          padding: '5px 10px', borderRadius: 20, letterSpacing: '0.3px',
        }}>
          ⚡ {user.xp.toLocaleString('pt-BR')} XP
        </div>
        <button
          onClick={() => navigateTo('profile')}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--grad-warm)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#fff',
          }}
        >
          {initials}
        </button>
      </div>
    </div>
  )
}
