import { useMemo, useState } from 'react'
import { useAppStore } from '../store/appStore'
import { Topbar } from '../components/Topbar'

type FeedTab = 'comments' | 'prayer' | 'announcements'
type SheetType = 'none' | 'pick' | 'comment' | 'live-question' | 'prayer'

// Reactions defined in the mock
const LIVE_REACTIONS = [
  { emoji: 'â¤ï¸', label: 'Amei' },
  { emoji: 'ð', label: 'AmÃ©m' },
  { emoji: 'â¨', label: 'AbenÃ§oado' },
  { emoji: 'ð¡', label: 'Inspirado' },
  { emoji: 'ð', label: 'Louvor' },
]

export function HomeScreen() {
  const {
    missions, feed, eventConfig, liveSession,
    completeMission, toggleLike, addReaction, addPost, submitLiveQuestion,
    addSheetOpen, setAddSheetOpen,
  } = useAppStore()

  const [feedTab, setFeedTab] = useState<FeedTab>('comments')
  const [sheet, setSheet] = useState<SheetType>('none')
  const [postContent, setPostContent] = useState('')
  const [missionsExpanded, setMissionsExpanded] = useState(false)
  const [questionSent, setQuestionSent] = useState(false)
  const [activeReactions, setActiveReactions] = useState<Record<string, boolean>>({})

  // Sync addSheetOpen store flag â local sheet state
  useMemo(() => {
    if (addSheetOpen) {
      setSheet('pick')
      setAddSheetOpen(false)
    }
  }, [addSheetOpen, setAddSheetOpen])

  // Calculate current event day from eventConfig
  const currentEventDay = useMemo(() => {
    if (!eventConfig) return 1
    const startDate = new Date(eventConfig.eventStartDate + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return 1
    if (diff >= eventConfig.totalDays) return eventConfig.totalDays
    return diff + 1
  }, [eventConfig])

  const todayMissions = missions.filter(m => m.day === currentEventDay)
  const completedCount = todayMissions.filter(m => m.completed).length
  const totalXp = todayMissions.reduce((sum, m) => sum + m.xpReward, 0)
  const progressPct = todayMissions.length > 0 ? (completedCount / todayMissions.length) * 100 : 0

  const handleSubmitPost = async () => {
    if (!postContent.trim()) return
    await addPost(sheet === 'prayer' ? 'prayer' : 'comment', postContent)
    setPostContent('')
    setSheet('none')
  }

  const handleSubmitQuestion = async () => {
    if (!postContent.trim() || !liveSession) return
    await submitLiveQuestion(liveSession.id, postContent)
    setPostContent('')
    setQuestionSent(true)
    setTimeout(() => {
      setQuestionSent(false)
      setSheet('none')
    }, 1800)
  }

  const closeSheet = () => {
    setSheet('none')
    setPostContent('')
    setQuestionSent(false)
  }

  const filteredFeed = feed.filter(p => {
    if (feedTab === 'comments') return p.type === 'comment'
    if (feedTab === 'prayer') return p.type === 'prayer'
    if (feedTab === 'announcements') return p.type === 'announcement'
    return false
  })

  // Short label for mission node (first word of title, 6 chars max)
  const shortLabel = (title: string) => {
    const word = title.split(' ')[0]
    return word.length > 6 ? word.slice(0, 5) + 'â¦' : word
  }

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Topbar />

      <div className="scroll-area" style={{ padding: '14px 14px 0' }}>

        {/* âââ MISSIONS CARD âââââââââââââââââââââââââââââââââââââââââââââââ */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 18, overflow: 'hidden', marginBottom: 14,
        }}>

          {/* Header */}
          <div style={{ padding: '16px 16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.2px' }}>
                MissÃµes do dia
              </div>
              {totalXp > 0 && (
                <div style={{
                  fontSize: 12, fontWeight: 700, color: 'var(--xp)',
                  background: 'var(--xp-bg)', padding: '3px 9px', borderRadius: 20,
                }}>
                  +{totalXp} XP
                </div>
              )}
            </div>

            {/* Milestone track */}
            {todayMissions.length > 0 && (
              <div style={{ position: 'relative', padding: '0 8px 4px' }}>
                {/* Background track */}
                <div style={{
                  position: 'absolute', top: 17, left: 26, right: 26,
                  height: 5, background: 'var(--bg3)', borderRadius: 3,
                }} />
                {/* Filled track */}
                <div style={{
                  position: 'absolute', top: 17, left: 26,
                  width: `calc((100% - 52px) * ${progressPct / 100})`,
                  height: 5, background: 'linear-gradient(90deg, #FF8F44, #FA1462)',
                  borderRadius: 3, transition: 'width 0.5s ease',
                }} />
                {/* Nodes */}
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                  {todayMissions.map((m) => {
                    const isDone = m.completed
                    const isCurrent = !isDone && todayMissions.slice(0, todayMissions.indexOf(m)).every(p => p.completed)
                    return (
                      <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <button
                          onClick={() => !isDone && completeMission(m.id)}
                          style={{
                            width: 34, height: 34, borderRadius: '50%',
                            cursor: isDone ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isDone
                              ? 'linear-gradient(135deg, #FF8F44, #FA1462)'
                              : isCurrent ? 'var(--surface)' : 'var(--bg2)',
                            border: isCurrent ? '2.5px solid var(--pink)' : isDone ? 'none' : '2px solid var(--border)',
                            boxShadow: isDone ? '0 3px 10px rgba(250,20,98,0.28)' : 'none',
                            transition: 'all 0.25s',
                          } as React.CSSProperties}
                          title={m.title}
                        >
                          {isDone ? (
                            <svg viewBox="0 0 14 14" fill="none" width={13} height={13}>
                              <path d="M2.5 7l3 3 6-5.5" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : isCurrent ? (
                            <div style={{
                              width: 9, height: 9, borderRadius: '50%', background: 'var(--pink)',
                              animation: 'mqPulse 1.5s ease-in-out infinite',
                            }} />
                          ) : null}
                        </button>
                        <span style={{
                          fontSize: 9, fontWeight: 700,
                          color: isDone ? 'var(--pink)' : 'var(--text3)',
                        }}>
                          {shortLabel(m.title)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Expanded list */}
          <div style={{
            maxHeight: missionsExpanded ? 500 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.38s cubic-bezier(0.4,0,0.2,1)',
          }}>
            <div style={{ paddingTop: 10 }}>
              {todayMissions.map((m, i) => (
                <div key={m.id}>
                  <div
                    onClick={() => !m.completed && completeMission(m.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '11px 14px', background: 'var(--surface)',
                      cursor: m.completed ? 'default' : 'pointer',
                    }}
                  >
                    {/* Icon circle */}
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: m.completed
                        ? 'linear-gradient(135deg, #FF8F44, #FA1462)'
                        : 'var(--bg2)',
                      border: m.completed ? 'none' : '2px solid var(--border)',
                    }}>
                      {m.completed && (
                        <svg viewBox="0 0 12 12" fill="none" width={11} height={11}>
                          <path d="M2 6l2.5 2.5 5.5-5" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>

                    {/* Label */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 600,
                        color: m.completed ? 'var(--text3)' : 'var(--text)',
                        textDecoration: m.completed ? 'line-through' : 'none',
                        textDecorationColor: 'var(--bg3)',
                      }}>
                        {m.title}
                      </div>
                      <div style={{
                        fontSize: 11, fontWeight: 600, marginTop: 1,
                        color: m.completed ? 'var(--green)' : 'var(--text3)',
                      }}>
                        {m.completed ? 'ConcluÃ­da â' : 'NÃ£o iniciada'}
                      </div>
                    </div>

                    {/* XP badge */}
                    <div style={{
                      fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
                      padding: '3px 8px', borderRadius: 6,
                      background: m.completed ? 'rgba(26,153,96,0.08)' : 'var(--bg2)',
                      border: `1px solid ${m.completed ? 'rgba(26,153,96,0.2)' : 'var(--border)'}`,
                      color: m.completed ? 'var(--green)' : 'var(--text3)',
                    }}>
                      +{m.xpReward} XP
                    </div>
                  </div>
                  {i < todayMissions.length - 1 && (
                    <div style={{ height: 1, background: 'var(--border2)', margin: '0 14px' }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Toggle button */}
          <button
            onClick={() => setMissionsExpanded(v => !v)}
            style={{
              width: '100%', padding: '12px 16px', background: 'none', border: 'none',
              borderTop: '1px solid var(--border2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              cursor: 'pointer', fontFamily: 'var(--font-body)',
              fontSize: 13, fontWeight: 700, color: 'var(--text3)',
              transition: 'color 0.2s',
            }}
          >
            <span>{missionsExpanded ? 'Fechar' : 'Ver todas'}</span>
            <svg viewBox="0 0 12 8" fill="none" width={12} height={8}
              style={{ transition: 'transform 0.35s', transform: missionsExpanded ? 'rotate(180deg)' : 'none' }}>
              <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* âââ LIVE CARD âââââââââââââââââââââââââââââââââââââââââââââââââââ */}
        {liveSession ? (
          <div style={{
            background: '#1A0D2E',
            borderRadius: 16, padding: 16,
            border: '1px solid rgba(255,255,255,0.06)',
            marginBottom: 14, position: 'relative', overflow: 'hidden',
          }}>
            {/* Decorative circle */}
            <div style={{
              position: 'absolute', top: -50, right: -50,
              width: 160, height: 160,
              background: 'rgba(255,255,255,0.04)', borderRadius: '50%',
            }} />

            {/* Top row: AO VIVO + viewer count */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%', background: '#FF4757',
                    animation: 'blink 1.4s ease infinite',
                    boxShadow: '0 0 5px rgba(255,71,87,0.6)',
                  }} className="live-dot" />
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '1.2px',
                    textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)',
                  }}>Ao vivo</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.2, marginBottom: 3 }}>
                  {liveSession.title}
                </div>
                {liveSession.speaker && (
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                    {liveSession.speaker}
                  </div>
                )}
              </div>
              {/* Online pill */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 20, padding: '5px 10px',
                fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.85)', flexShrink: 0,
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF4757', animation: 'blink 1.4s ease infinite' }} />
                <span>Ao vivo</span>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.15)', marginBottom: 14 }} />

            {/* Reactions */}
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '1px',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 8,
            }}>Reagir</div>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 12, scrollbarWidth: 'none' }}>
              {LIVE_REACTIONS.map(r => {
                const active = !!activeReactions[r.emoji]
                return (
                  <button
                    key={r.emoji}
                    onClick={() => setActiveReactions(prev => ({ ...prev, [r.emoji]: !prev[r.emoji] }))}
                    style={{
                      flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5,
                      background: active ? 'rgba(250,20,98,0.3)' : 'rgba(255,255,255,0.08)',
                      border: `1px solid ${active ? 'rgba(250,20,98,0.5)' : 'rgba(255,255,255,0.14)'}`,
                      borderRadius: 20, padding: '6px 11px',
                      fontSize: 12, fontWeight: 700,
                      color: active ? '#fff' : 'rgba(255,255,255,0.8)',
                      cursor: 'pointer', fontFamily: 'var(--font-body)',
                      transition: 'background 0.15s, border-color 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {r.emoji}
                  </button>
                )
              })}
            </div>

            {/* Inline Q&A */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                placeholder="Pergunta para o palestrante..."
                onFocus={() => setSheet('live-question')}
                readOnly
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.18)',
                  border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 10,
                  padding: '10px 12px', fontSize: 13, fontFamily: 'var(--font-body)',
                  color: '#fff', outline: 'none', cursor: 'text',
                }}
              />
              <button
                onClick={() => setSheet('live-question')}
                style={{
                  width: 38, height: 38, background: '#fff', border: 'none',
                  borderRadius: 10, color: 'var(--pink)', fontSize: 18, fontWeight: 900,
                  cursor: 'pointer', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                â
              </button>
            </div>
          </div>
        ) : (
          /* No live session */
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 16, padding: '14px 18px',
            marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ fontSize: 28 }}>ð¡</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Nenhuma sessÃ£o ao vivo</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                {eventConfig?.tagline ?? 'Confira a agenda para os prÃ³ximos horÃ¡rios'}
              </div>
            </div>
          </div>
        )}

        {/* âââ FEED âââââââââââââââââââââââââââââââââââââââââââââââââââââââ */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.2px', marginBottom: 10 }}>
            Feed da conferÃªncia
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex', gap: 0, background: 'var(--bg2)',
            borderRadius: 12, padding: 3, marginBottom: 12,
          }}>
            {([
              { key: 'comments' as FeedTab, label: 'ð¬ ComentÃ¡rios' },
              { key: 'prayer' as FeedTab, label: 'ð OraÃ§Ãµes' },
              { key: 'announcements' as FeedTab, label: 'ð¢ Avisos' },
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setFeedTab(tab.key)}
                style={{
                  flex: 1, padding: '7px 4px', border: 'none',
                  borderRadius: 9,
                  fontSize: 11, fontWeight: 700,
                  fontFamily: 'var(--font-body)',
                  cursor: 'pointer', transition: 'all 0.18s',
                  background: feedTab === tab.key ? 'var(--surface)' : 'transparent',
                  color: feedTab === tab.key ? 'var(--text)' : 'var(--text3)',
                  boxShadow: feedTab === tab.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Feed card */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '4px 14px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            {filteredFeed.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text3)' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>
                  {feedTab === 'comments' ? 'ð¬' : feedTab === 'prayer' ? 'ð' : 'ð¢'}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Nenhum post ainda</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Seja o primeiro!</div>
              </div>
            ) : (
              filteredFeed.map((post, idx) => (
                <div key={post.id} style={{
                  padding: '14px 0',
                  borderBottom: idx < filteredFeed.length - 1 ? '1px solid var(--border2)' : 'none',
                }}>
                  {post.type === 'announcement' ? (
                    /* Announcement */
                    <div style={{
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                        background: 'rgba(53,18,106,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                      }}>ð¢</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>
                          {post.userName}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.55, fontWeight: 500 }}>
                          {post.content}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, fontWeight: 500 }}>
                          {post.createdAt}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Header */}
                      <div style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                          background: post.type === 'prayer' ? 'linear-gradient(135deg,#35126A,#FA1462)' : 'var(--grad-warm)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 12, color: '#fff',
                        }}>
                          {post.userInitials}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{post.userName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>
                            {post.church} Â· {post.createdAt}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      {post.type === 'prayer' ? (
                        /* prayer-block style */
                        <div style={{
                          background: 'linear-gradient(135deg,rgba(53,18,106,0.06),rgba(77,193,231,0.04))',
                          borderLeft: '3px solid rgba(53,18,106,0.3)',
                          borderRadius: '0 8px 8px 0',
                          padding: '10px 12px', marginBottom: 10,
                          fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, fontStyle: 'italic',
                        }}>
                          {post.content}
                        </div>
                      ) : (
                        <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 10 }}>
                          {post.content}
                        </p>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <button
                          onClick={() => toggleLike(post.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            fontSize: 12, color: post.liked ? 'var(--pink)' : 'var(--text3)',
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontWeight: 600, padding: '3px 0', fontFamily: 'var(--font-body)',
                          }}
                        >
                          {post.liked ? 'â¤ï¸' : 'ð¤'} <span>{post.likes}</span>
                        </button>
                        {post.reactions.map(r => (
                          <button
                            key={r.emoji}
                            onClick={() => addReaction(post.id, r.emoji)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              fontSize: 12, color: r.reacted ? 'var(--text)' : 'var(--text3)',
                              background: r.reacted ? 'var(--bg2)' : 'none',
                              border: 'none', cursor: 'pointer', fontWeight: 600,
                              padding: '2px 6px', borderRadius: 20,
                              fontFamily: 'var(--font-body)', transition: 'all 0.15s',
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

      {/* âââ SHEET BACKDROP ââââââââââââââââââââââââââââââââââââââââââââââââ */}
      {sheet !== 'none' && (
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.28)', zIndex: 90,
            backdropFilter: 'blur(3px)',
          }}
          className="fade-in"
          onClick={closeSheet}
        />
      )}

      {/* âââ BOTTOM SHEET ââââââââââââââââââââââââââââââââââââââââââââââââââ */}
      {sheet !== 'none' && (
        <div
          className="sheet-up"
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'var(--surface)', borderRadius: '24px 24px 0 0',
            zIndex: 91, boxShadow: '0 -4px 30px rgba(0,0,0,0.12)',
            padding: 0,
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Handle */}
          <div style={{ padding: '14px 0 0', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 36, height: 4, background: 'var(--bg3)', borderRadius: 2 }} />
          </div>

          {/* ââ PICK: type selection ââ */}
          {sheet === 'pick' && (
            <div>
              <div style={{ padding: '20px 24px 8px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6 }}>
                  Criar
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
                  O que deseja<br />compartilhar?
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '12px 16px 24px' }}>
                {[
                  {
                    type: 'comment' as SheetType,
                    icon: 'ð¬', title: 'ComentÃ¡rio no feed',
                    desc: 'Compartilhe um pensamento com todos',
                    gradient: 'rgba(255,143,68,.15),rgba(250,20,98,.12)',
                    disabled: false,
                  },
                  {
                    type: 'live-question' as SheetType,
                    icon: 'â', title: 'Pergunta ao palestrante',
                    desc: 'Envie uma dÃºvida para a sessÃ£o ao vivo',
                    gradient: 'rgba(53,18,106,.12),rgba(77,193,231,.1)',
                    disabled: !liveSession,
                  },
                  {
                    type: 'prayer' as SheetType,
                    icon: 'ð', title: 'Pedido de oraÃ§Ã£o',
                    desc: 'PeÃ§a apoio da comunidade em oraÃ§Ã£o',
                    gradient: 'rgba(250,20,98,.1),rgba(53,18,106,.08)',
                    disabled: false,
                  },
                ].map((opt, idx, arr) => (
                  <div key={opt.type}>
                    <button
                      onClick={() => !opt.disabled && setSheet(opt.type)}
                      disabled={opt.disabled}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '14px 12px', background: 'none', border: 'none',
                        borderRadius: 14, cursor: opt.disabled ? 'not-allowed' : 'pointer',
                        fontFamily: 'var(--font-body)', textAlign: 'left', width: '100%',
                        opacity: opt.disabled ? 0.4 : 1, transition: 'background 0.15s',
                      }}
                      onTouchStart={e => { if (!opt.disabled) e.currentTarget.style.background = 'var(--bg2)' }}
                      onTouchEnd={e => { e.currentTarget.style.background = 'none' }}
                    >
                      <div style={{
                        width: 46, height: 46, borderRadius: 13,
                        background: `linear-gradient(135deg,${opt.gradient})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, fontSize: 22,
                      }}>
                        {opt.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{opt.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{opt.desc}</div>
                      </div>
                    </button>
                    {idx < arr.length - 1 && (
                      <div style={{ height: 1, background: 'var(--border2)', margin: '0 12px' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ââ COMMENT ââ */}
          {sheet === 'comment' && (
            <div style={{ padding: '20px 20px 32px' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>ð¬ ComentÃ¡rio</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 14 }}>Compartilhe seus pensamentos com todos</div>
              <textarea
                placeholder="O que vocÃª estÃ¡ pensando?"
                value={postContent}
                onChange={e => setPostContent(e.target.value)}
                rows={4}
                autoFocus
                style={{
                  width: '100%', background: 'var(--bg2)', border: '1.5px solid var(--border)',
                  borderRadius: 12, padding: '13px 15px', color: 'var(--text)',
                  fontSize: 14, outline: 'none', resize: 'none', marginBottom: 12,
                  fontFamily: 'var(--font-body)',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--pink)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button
                onClick={handleSubmitPost}
                disabled={!postContent.trim()}
                style={{
                  width: '100%', padding: 14,
                  background: postContent.trim() ? 'var(--grad-warm)' : 'var(--bg3)',
                  border: 'none', borderRadius: 12,
                  color: postContent.trim() ? '#fff' : 'var(--text3)',
                  fontSize: 14, fontWeight: 700, cursor: postContent.trim() ? 'pointer' : 'not-allowed',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Publicar ð¬
              </button>
            </div>
          )}

          {/* ââ LIVE QUESTION ââ */}
          {sheet === 'live-question' && (
            <div style={{ padding: '20px 20px 32px' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>ð¤ Pergunta Ao Vivo</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 14 }}>
                {liveSession ? `Para: ${liveSession.title}` : 'Nenhuma sessÃ£o ao vivo no momento'}
              </div>
              {questionSent ? (
                <div style={{ textAlign: 'center', padding: '28px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>â</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Pergunta enviada!</div>
                  <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>O palestrante pode respondÃª-la ao vivo</div>
                </div>
              ) : (
                <>
                  <textarea
                    placeholder="Digite sua pergunta..."
                    value={postContent}
                    onChange={e => setPostContent(e.target.value)}
                    rows={4}
                    autoFocus
                    style={{
                      width: '100%', background: 'var(--bg2)', border: '1.5px solid var(--border)',
                      borderRadius: 12, padding: '13px 15px', color: 'var(--text)',
                      fontSize: 14, outline: 'none', resize: 'none', marginBottom: 12,
                      fontFamily: 'var(--font-body)',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--pink)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                  <button
                    onClick={handleSubmitQuestion}
                    disabled={!postContent.trim() || !liveSession}
                    style={{
                      width: '100%', padding: 14,
                      background: postContent.trim() && liveSession ? 'var(--grad-warm)' : 'var(--bg3)',
                      border: 'none', borderRadius: 12,
                      color: postContent.trim() && liveSession ? '#fff' : 'var(--text3)',
                      fontSize: 14, fontWeight: 700,
                      cursor: postContent.trim() && liveSession ? 'pointer' : 'not-allowed',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    Enviar pergunta ð¤
                  </button>
                </>
              )}
            </div>
          )}

          {/* ââ PRAYER ââ */}
          {sheet === 'prayer' && (
            <div style={{ padding: '20px 20px 32px' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>ð Pedido de OraÃ§Ã£o</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 14 }}>Compartilhe e receba apoio da comunidade</div>
              <textarea
                placeholder="Compartilhe seu pedido de oraÃ§Ã£o..."
                value={postContent}
                onChange={e => setPostContent(e.target.value)}
                rows={4}
                autoFocus
                style={{
                  width: '100%', background: 'var(--bg2)', border: '1.5px solid var(--border)',
                  borderRadius: 12, padding: '13px 15px', color: 'var(--text)',
                  fontSize: 14, outline: 'none', resize: 'none', marginBottom: 12,
                  fontFamily: 'var(--font-body)',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--pink)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button
                onClick={handleSubmitPost}
                disabled={!postContent.trim()}
                style={{
                  width: '100%', padding: 14,
                  background: postContent.trim() ? 'var(--grad-warm)' : 'var(--bg3)',
                  border: 'none', borderRadius: 12,
                  color: postContent.trim() ? '#fff' : 'var(--text3)',
                  fontSize: 14, fontWeight: 700,
                  cursor: postContent.trim() ? 'pointer' : 'not-allowed',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Enviar pedido ð
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
