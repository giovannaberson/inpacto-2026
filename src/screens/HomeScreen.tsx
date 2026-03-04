import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { Topbar } from '../components/Topbar'

type FeedTab = 'comments' | 'prayer' | 'announcements'
type SheetType = 'none' | 'comment' | 'live-question' | 'prayer'

const REACTIONS = ['🔥', '🙌', '❤️', '😂', '😢', '🙏']

export function HomeScreen() {
  const { missions, feed, liveOnlineCount, completeMission, toggleLike, addReaction, addPost } = useAppStore()
  const [feedTab, setFeedTab] = useState<FeedTab>('comments')
  const [sheet, setSheet] = useState<SheetType>('none')
  const [postContent, setPostContent] = useState('')
  const [missionsExpanded, setMissionsExpanded] = useState(false)

  const completedCount = missions.filter(m => m.completed).length
  const progress = (completedCount / missions.length) * 100

  const handleSubmitPost = () => {
    if (!postContent.trim()) return
    const typeMap: Record<SheetType, 'comment' | 'prayer'> = { comment: 'comment', prayer: 'prayer', 'live-question': 'comment', none: 'comment' }
    addPost(typeMap[sheet] ?? 'comment', postContent)
    setPostContent('')
    setSheet('none')
  }

  const filteredFeed = feed.filter(p => {
    if (feedTab === 'comments') return p.type === 'comment'
    if (feedTab === 'prayer') return p.type === 'prayer'
    if (feedTab === 'announcements') return p.type === 'announcement'
    return false
  })

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Topbar />

      <div className="scroll-area">
        <div style={{ padding: '16px 16px 0' }}>

          {/* ── MISSIONS TRACK ── */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 14, padding: 14, marginBottom: 12,
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Missões do Dia 1</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>
                  {completedCount}/{missions.length} concluídas
                </div>
              </div>
              <button
                onClick={() => setMissionsExpanded(v => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--pink)', fontWeight: 700 }}
              >
                {missionsExpanded ? 'Fechar' : 'Ver todas'}
              </button>
            </div>

            {/* Milestone nodes */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 10 }}>
              {missions.map((m, i) => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', flex: i < missions.length - 1 ? 1 : 'none' }}>
                  <button
                    onClick={() => !m.completed && completeMission(m.id)}
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: m.completed ? 'var(--grad-warm)' : 'var(--bg2)',
                      border: m.completed ? 'none' : '1.5px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, cursor: m.completed ? 'default' : 'pointer',
                      boxShadow: m.completed ? '0 2px 8px rgba(250,20,98,0.3)' : 'none',
                      transition: 'all 0.25s', flexShrink: 0,
                    }}
                    title={m.title}
                  >
                    {m.completed ? '✓' : m.icon}
                  </button>
                  {i < missions.length - 1 && (
                    <div style={{
                      flex: 1, height: 3, borderRadius: 2, minWidth: 8,
                      background: missions[i + 1]?.completed ? 'var(--pink)' : 'var(--bg3)',
                      transition: 'background 0.4s',
                    }} />
                  )}
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div style={{ background: 'var(--bg3)', borderRadius: 4, height: 5, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--pink)', borderRadius: 4, width: `${progress}%`, transition: 'width 0.5s ease' }} />
            </div>

            {/* Expanded list */}
            {missionsExpanded && (
              <div style={{ marginTop: 12 }}>
                {missions.map(m => (
                  <div
                    key={m.id}
                    onClick={() => !m.completed && completeMission(m.id)}
                    style={{
                      display: 'flex', gap: 12, alignItems: 'center',
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 12, padding: 12, marginBottom: 8,
                      cursor: m.completed ? 'default' : 'pointer',
                      opacity: m.completed ? 0.6 : 1,
                      transition: 'all 0.18s',
                    }}
                  >
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: m.completed ? 'var(--grad-warm)' : 'var(--bg2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, flexShrink: 0,
                    }}>
                      {m.completed ? '✓' : m.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2, textDecoration: m.completed ? 'line-through' : 'none' }}>
                        {m.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{m.description}</div>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--xp)', whiteSpace: 'nowrap' }}>
                      +{m.xpReward} XP
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── LIVE CARD ── */}
          <div style={{
            background: 'var(--grad-hero)',
            borderRadius: 'var(--radius)', padding: 18,
            position: 'relative', overflow: 'hidden', marginBottom: 12,
          }}>
            <div style={{ position: 'absolute', top: -50, right: -50, width: 160, height: 160, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '4px 10px',
                fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#fff',
              }}>
                <div className="live-dot-anim" style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
                AO VIVO
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginLeft: 4 }}>
                👥 {liveOnlineCount} online
              </div>
            </div>

            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
              Saturados do Espírito
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 14 }}>
              Pr. Lucas Mendes
            </div>

            {/* Q&A input */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                placeholder="Enviar pergunta ao vivo..."
                readOnly
                onClick={() => setSheet('live-question')}
                style={{
                  flex: 1, padding: '10px 14px',
                  background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 24, color: '#fff', fontSize: 13, outline: 'none',
                  cursor: 'text',
                }}
              />
              <button
                onClick={() => setSheet('live-question')}
                style={{
                  padding: '10px 16px', background: 'rgba(255,255,255,0.25)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  borderRadius: 24, color: '#fff', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Enviar
              </button>
            </div>
          </div>

          {/* ── FEED ── */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
          }}>
            {/* Tabs */}
            <div style={{ display: 'flex', background: 'var(--bg2)', padding: '4px 6px', gap: 4, borderBottom: '1px solid var(--border)' }}>
              {([
                { key: 'comments', label: '💬 Comentários' },
                { key: 'prayer', label: '🙏 Oração' },
                { key: 'announcements', label: '📢 Avisos' },
              ] as { key: FeedTab; label: string }[]).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFeedTab(tab.key)}
                  style={{
                    flex: 1, padding: '7px 6px', border: 'none',
                    background: feedTab === tab.key ? 'var(--surface)' : 'transparent',
                    borderRadius: 9, fontSize: 11, fontWeight: 700,
                    color: feedTab === tab.key ? 'var(--text)' : 'var(--text3)',
                    cursor: 'pointer', transition: 'all 0.18s',
                    boxShadow: feedTab === tab.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Feed items */}
            <div style={{ padding: '4px 14px' }}>
              {filteredFeed.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text3)' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>
                    {feedTab === 'comments' ? '💬' : feedTab === 'prayer' ? '🙏' : '📢'}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Nenhum post ainda</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Seja o primeiro!</div>
                </div>
              ) : (
                filteredFeed.map(post => (
                  <div key={post.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border2)' }}>
                    {/* Announcement style */}
                    {post.type === 'announcement' ? (
                      <div style={{ background: 'rgba(53,18,106,0.05)', border: '1px solid rgba(53,18,106,0.12)', borderRadius: 12, padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 18 }}>📢</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--purple)' }}>Aviso oficial</span>
                          <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 'auto' }}>{post.createdAt}</span>
                        </div>
                        <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>{post.content}</p>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: '50%',
                            background: post.type === 'prayer' ? 'linear-gradient(135deg, #35126A, #4DC1E7)' : 'var(--grad-warm)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: 12, color: '#fff', flexShrink: 0,
                          }}>
                            {post.userInitials}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{post.userName}</div>
                            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{post.church} · {post.createdAt}</div>
                          </div>
                          {post.type === 'prayer' && (
                            <span style={{ fontSize: 11, background: 'rgba(77,193,231,0.12)', color: '#1A7EA0', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                              🙏 Oração
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 10 }}>{post.content}</p>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <button
                            onClick={() => toggleLike(post.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              fontSize: 12, color: post.liked ? 'var(--pink)' : 'var(--text3)',
                              background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0,
                            }}
                          >
                            {post.liked ? '❤️' : '🤍'} {post.likes}
                          </button>
                          {post.reactions.map(r => (
                            <button
                              key={r.emoji}
                              onClick={() => addReaction(post.id, r.emoji)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                fontSize: 12, color: r.reacted ? 'var(--text)' : 'var(--text3)',
                                background: r.reacted ? 'var(--bg2)' : 'none',
                                border: 'none', cursor: 'pointer', fontWeight: 600, padding: '2px 6px',
                                borderRadius: 20, transition: 'all 0.15s',
                              }}
                            >
                              {r.emoji} {r.count}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FAB button */}
      <button
        onClick={() => setSheet('comment')}
        style={{
          position: 'absolute', right: 20, bottom: 90,
          width: 48, height: 48, borderRadius: '50%',
          background: 'var(--grad-warm)', border: 'none',
          boxShadow: '0 4px 16px rgba(250,20,98,0.4)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, zIndex: 40,
          transition: 'transform 0.15s',
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        ✏️
      </button>

      {/* Sheets */}
      {sheet !== 'none' && (
        <div
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.28)', zIndex: 90, backdropFilter: 'blur(3px)' }}
          className="fade-in"
          onClick={() => setSheet('none')}
        />
      )}

      {sheet !== 'none' && (
        <div
          className="sheet-up"
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'var(--surface)', borderRadius: '24px 24px 0 0',
            padding: '12px 20px 32px', zIndex: 91,
            boxShadow: '0 -4px 30px rgba(0,0,0,0.12)',
          }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ width: 36, height: 4, background: 'var(--bg3)', borderRadius: 2, margin: '0 auto 18px' }} />

          {sheet === 'comment' && (
            <>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                {([
                  { type: 'comment' as const, label: '💬 Comentar', desc: 'Compartilhe seus pensamentos' },
                  { type: 'prayer' as const, label: '🙏 Oração', desc: 'Peça oração à comunidade' },
                  { type: 'live-question' as const, label: '🎤 Ao Vivo', desc: 'Envie pergunta ao palestrante' },
                ]).map(opt => (
                  <button
                    key={opt.type}
                    onClick={() => setSheet(opt.type)}
                    style={{
                      flex: 1, padding: '10px 6px', border: '1.5px solid var(--border)',
                      borderRadius: 12, background: 'var(--bg2)', cursor: 'pointer',
                      textAlign: 'center', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--pink)'; e.currentTarget.style.background = 'rgba(250,20,98,0.05)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg2)' }}
                  >
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{opt.label.split(' ')[0]}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{opt.label.split(' ').slice(1).join(' ')}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {(sheet === 'prayer' || sheet === 'live-question') && (
            <>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 4, color: 'var(--dark)' }}>
                {sheet === 'prayer' ? '🙏 Pedido de Oração' : '🎤 Pergunta Ao Vivo'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14 }}>
                {sheet === 'prayer' ? 'Compartilhe e receba apoio da comunidade' : 'Envie sua pergunta para o palestrante'}
              </div>
              <textarea
                placeholder={sheet === 'prayer' ? 'Compartilhe seu pedido de oração...' : 'Digite sua pergunta...'}
                value={postContent}
                onChange={e => setPostContent(e.target.value)}
                rows={4}
                style={{
                  width: '100%', background: 'var(--bg2)', border: '1.5px solid var(--border)',
                  borderRadius: 12, padding: '13px 15px', color: 'var(--text)', fontSize: 14,
                  outline: 'none', resize: 'none', marginBottom: 12,
                }}
                onFocus={e => e.target.style.borderColor = 'var(--pink)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                autoFocus
              />

              {/* Reaction quick-add (for comment) */}
              {sheet !== 'live-question' && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  {REACTIONS.map(r => (
                    <button key={r} onClick={() => setPostContent(c => c + r)} style={{ fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>{r}</button>
                  ))}
                </div>
              )}

              <button
                onClick={handleSubmitPost}
                style={{
                  width: '100%', padding: 14, background: postContent.trim() ? 'var(--grad-warm)' : 'var(--bg3)',
                  border: 'none', borderRadius: 12, color: postContent.trim() ? '#fff' : 'var(--text3)',
                  fontSize: 14, fontWeight: 700, cursor: postContent.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                {sheet === 'prayer' ? 'Enviar pedido 🙏' : 'Enviar pergunta 🎤'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
