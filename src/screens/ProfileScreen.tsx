import { useAppStore } from '../store/appStore'

const ACHIEVEMENTS = [
  { id: 'a1', icon: '⚡', title: 'Primeiro acesso', desc: 'Bem-vindo!', unlocked: true },
  { id: 'a2', icon: '📝', title: 'Anotador', desc: '5 notas salvas', unlocked: true },
  { id: 'a3', icon: '🔥', title: 'Engajado', desc: '10 interações no feed', unlocked: false },
  { id: 'a4', icon: '🎯', title: 'Missão cumprida', desc: 'Completou todas as missões', unlocked: false },
  { id: 'a5', icon: '🙏', title: 'Orador', desc: '5 pedidos de oração', unlocked: false },
  { id: 'a6', icon: '👑', title: 'Top 3', desc: 'Entrou no pódio', unlocked: false },
  { id: 'a7', icon: '💬', title: 'Socialite', desc: '20 comentários', unlocked: false },
  { id: 'a8', icon: '🌟', title: 'Saturado!', desc: 'Participou 2 dias completos', unlocked: false },
]

export function ProfileScreen() {
  const { user, missions, navigateTo } = useAppStore()
  const initials = user.name.split(' ').slice(0, 2).map(w => w[0]).join('')
  const completedMissions = missions.filter(m => m.completed).length

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div className="scroll-area" style={{ paddingBottom: 88 }}>
        {/* Profile header */}
        <div style={{
          padding: '52px 20px 28px',
          background: 'var(--grad-hero)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, background: 'rgba(255,255,255,0.06)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, background: 'rgba(255,255,255,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />

          <div style={{
            width: 82, height: 82, borderRadius: '50%',
            background: 'rgba(255,255,255,0.25)', border: '3px solid rgba(255,255,255,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 700, color: '#fff', zIndex: 1,
          }}>
            {initials}
          </div>

          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: '#fff', zIndex: 1, textAlign: 'center' }}>
            {user.name}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)', fontWeight: 600, zIndex: 1 }}>
            ⛪ {user.church}
          </div>
          {user.bio && (
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center', maxWidth: 280, lineHeight: 1.5, zIndex: 1 }}>
              {user.bio}
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'flex', gap: 28, marginTop: 8, zIndex: 1 }}>
            {[
              { val: user.xp.toLocaleString('pt-BR'), lbl: 'XP Total' },
              { val: completedMissions, lbl: 'Missões' },
              { val: ACHIEVEMENTS.filter(a => a.unlocked).length, lbl: 'Conquistas' },
            ].map(s => (
              <div key={s.lbl} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#fff' }}>{s.val}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.3px' }}>{s.lbl}</div>
              </div>
            ))}
          </div>

          {/* Edit button */}
          <button
            onClick={() => navigateTo('profile-edit')}
            style={{
              marginTop: 8, padding: '8px 20px', zIndex: 1,
              background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 20, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            ✏️ Editar perfil
          </button>
        </div>

        {/* XP Progress */}
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 14, marginBottom: 12, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>⚡ Nível atual</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>Ainda {(2000 - user.xp)} XP para o próximo nível</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--xp)' }}>{user.xp}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>/ 2000 XP</div>
              </div>
            </div>
            <div style={{ background: 'var(--bg3)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                background: 'var(--grad-warm)',
                borderRadius: 4,
                width: `${Math.min((user.xp / 2000) * 100, 100)}%`,
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>

          {/* Info card */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 14, marginBottom: 12, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12 }}>
              Informações
            </div>
            {[
              { icon: '📍', label: 'Cidade', value: user.city || 'Não informado' },
              { icon: '⛪', label: 'Igreja', value: user.church || 'Não informado' },
              { icon: '🎂', label: 'Idade', value: user.age ? `${user.age} anos` : 'Não informado' },
              { icon: '✉️', label: 'E-mail', value: user.email },
            ].map(info => (
              <div key={info.label} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border2)' }}>
                <span style={{ fontSize: 16 }}>{info.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>{info.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>{info.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Achievements */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 14, marginBottom: 12, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12 }}>
              Conquistas 🏅
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {ACHIEVEMENTS.map(a => (
                <div
                  key={a.id}
                  title={`${a.title}: ${a.desc}`}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    opacity: a.unlocked ? 1 : 0.35,
                    filter: a.unlocked ? 'none' : 'grayscale(1)',
                  }}
                >
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: a.unlocked ? 'var(--grad-warm)' : 'var(--bg3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, border: a.unlocked ? 'none' : '1px solid var(--border)',
                    boxShadow: a.unlocked ? '0 2px 8px rgba(250,20,98,0.25)' : 'none',
                  }}>
                    {a.unlocked ? a.icon : '🔒'}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, textAlign: 'center', color: a.unlocked ? 'var(--text)' : 'var(--text3)', lineHeight: 1.2 }}>
                    {a.title}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes shortcut */}
          <div
            onClick={() => navigateTo('notes')}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 14,
              display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)', marginBottom: 12,
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(250,20,98,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              📝
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Minhas Notas</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Ver anotações das palestras</div>
            </div>
            <div style={{ color: 'var(--text3)', fontSize: 18 }}>›</div>
          </div>
        </div>
      </div>
    </div>
  )
}
