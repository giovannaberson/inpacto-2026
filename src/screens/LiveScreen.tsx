import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '../store/appStore'
import type { Session } from '../store/appStore'
import { supabase } from '../lib/supabase'

interface LiveQuestion {
  id: string
  content: string
  user_id: string
  created_at: string
  userName: string
}

const EMOJIS = ['🙌', '🔥', '❤️', '🙏', '⚡']

function typeColor(type: string) {
  const map: Record<string, string> = {
    plenaria: 'var(--pink)', louvor: '#7c3aed', oficina: '#0891b2',
    talkshow: '#d97706', especial: '#059669', break: '#6b7280',
  }
  return map[type] || 'var(--pink)'
}

function typeLabel(type: string) {
  const map: Record<string, string> = {
    plenaria: 'Plenária', louvor: 'Louvor', oficina: 'Oficina',
    talkshow: 'Talk Show', especial: 'Especial', break: 'Intervalo',
  }
  return map[type] || type
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase()
}

export function LiveScreen() {
  const { user, liveSession, sessions, submitLiveQuestion } = useAppStore()
  const [reactions, setReactions] = useState<Record<string, number>>({})
  const [userReacted, setUserReacted] = useState<Record<string, boolean>>({})
  const [questions, setQuestions] = useState<LiveQuestion[]>([])
  const [questionText, setQuestionText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (liveSession) loadQuestions(liveSession.id)
  }, [liveSession])

  async function loadQuestions(sessionId: string) {
    const { data } = await supabase
      .from('live_questions')
      .select('id, content, user_id, created_at, profiles(name)')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) {
      setQuestions(data.map((q: any) => ({
        id: q.id,
        content: q.content,
        user_id: q.user_id,
        created_at: q.created_at,
        userName: q.profiles?.name || 'Participante',
      })))
    }
  }

  function handleReaction(emoji: string) {
    if (userReacted[emoji]) return
    setReactions(prev => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }))
    setUserReacted(prev => ({ ...prev, [emoji]: true }))
  }

  async function handleSubmitQuestion() {
    if (!questionText.trim() || !liveSession) return
    setSubmitting(true)
    try {
      await submitLiveQuestion(liveSession.id, questionText.trim())
      setQuestionText('')
      loadQuestions(liveSession.id)
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{
        background: 'var(--grad-hero)',
        padding: '52px 20px 20px',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        {liveSession && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'rgba(255,255,255,0.18)', borderRadius: 20,
            padding: '3px 10px', fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 6,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff4444', display: 'inline-block' }} />
            AO VIVO
          </div>
        )}
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: '#fff', marginTop: 2 }}>
          Acontecendo Agora
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 3 }}>
          {liveSession ? liveSession.title : 'Nenhuma sessão ao vivo no momento'}
        </div>
      </div>

      {/* Content */}
      <div className="scroll-area" style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 32px' }}>
        {liveSession ? (
          <>
            {/* Speaker Card */}
            <div style={{
              background: 'var(--surface)', borderRadius: 20, padding: 20,
              marginBottom: 14, boxShadow: 'var(--shadow)', border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%',
                  background: 'var(--grad-warm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {initials(liveSession.speaker || 'S')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'inline-block',
                    background: typeColor(liveSession.type), color: '#fff',
                    fontSize: 10, fontWeight: 700, borderRadius: 6,
                    padding: '2px 8px', marginBottom: 4,
                    textTransform: 'uppercase' as const, letterSpacing: '0.5px',
                  }}>
                    {typeLabel(liveSession.type)}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text1)', lineHeight: 1.3 }}>
                    {liveSession.title}
                  </div>
                  {liveSession.speaker && (
                    <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>
                      {liveSession.speaker}
                    </div>
                  )}
                </div>
              </div>
              {liveSession.description ? (
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  {liveSession.description}
                </div>
              ) : null}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10, fontSize: 12, color: 'var(--text3)' }}>
                {'🕐'} {liveSession.startTime} – {liveSession.endTime}
              </div>
            </div>

            {/* Reactions */}
            <div style={{
              background: 'var(--surface)', borderRadius: 16, padding: '14px 16px',
              marginBottom: 14, boxShadow: 'var(--shadow)', border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 10, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
                Reações
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    style={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                      background: userReacted[emoji] ? 'var(--grad-warm)' : 'var(--bg)',
                      border: `1.5px solid ${userReacted[emoji] ? 'transparent' : 'var(--border)'}`,
                      borderRadius: 12, padding: '8px 4px', cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{emoji}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: userReacted[emoji] ? '#fff' : 'var(--text3)' }}>
                      {reactions[emoji] || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Question */}
            <div style={{
              background: 'var(--surface)', borderRadius: 16, padding: 16,
              marginBottom: 14, boxShadow: 'var(--shadow)', border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 10, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
                {'🎤'} Enviar Pergunta
              </div>
              <textarea
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
                placeholder="Digite sua pergunta para o palestrante..."
                rows={3}
                style={{
                  width: '100%', background: 'var(--bg)',
                  border: '1.5px solid var(--border)', borderRadius: 12,
                  padding: '10px 12px', fontSize: 14, color: 'var(--text1)',
                  fontFamily: 'var(--font-body)', resize: 'none', outline: 'none',
                  boxSizing: 'border-box' as const,
                }}
              />
              <button
                onClick={handleSubmitQuestion}
                disabled={submitting || !questionText.trim()}
                style={{
                  width: '100%', marginTop: 8, padding: 12,
                  background: submitting || !questionText.trim() ? 'var(--border)' : 'var(--grad-warm)',
                  border: 'none', borderRadius: 12, color: '#fff',
                  fontWeight: 700, fontSize: 14,
                  cursor: submitting || !questionText.trim() ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {submitting ? 'Enviando...' : 'Enviar Pergunta'}
              </button>
            </div>

            {/* Questions List */}
            {questions.length > 0 && (
              <div style={{
                background: 'var(--surface)', borderRadius: 16, padding: 16,
                boxShadow: 'var(--shadow)', border: '1px solid var(--border)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 12, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
                  {'💬'} Perguntas ({questions.length})
                </div>
                {questions.map((q, i) => (
                  <div key={q.id} style={{
                    paddingTop: i === 0 ? 0 : 10, paddingBottom: 10,
                    borderBottom: i < questions.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--pink)', marginBottom: 2 }}>
                      {q.userName}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text1)', lineHeight: 1.5 }}>
                      {q.content}
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
            )}
          </>
        ) : (
          <>
            {/* No live session */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '36px 20px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>{'📺'}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text1)', marginBottom: 8 }}>
                Nenhuma sessão ao vivo
              </div>
              <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, maxWidth: 280 }}>
                Quando uma sessão começar, ela aparecerá aqui automaticamente.
              </div>
            </div>

            {/* Today's upcoming schedule */}
            {sessions.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 10, textTransform: 'uppercase' as const, letterSpacing: '0.5px', paddingLeft: 2 }}>
                  Próximas Sessões
                </div>
                {sessions.filter(s => s.type !== 'break').slice(0, 6).map(s => (
                  <div key={s.id} style={{
                    background: 'var(--surface)', borderRadius: 14, padding: '14px 16px',
                    marginBottom: 10, border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <div style={{ width: 4, height: 44, borderRadius: 2, background: typeColor(s.type), flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)', marginBottom: 1 }}>{s.title}</div>
                      {s.speaker && <div style={{ fontSize: 12, color: 'var(--text2)' }}>{s.speaker}</div>}
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{s.startTime} – {s.endTime}</div>
                    </div>
                    <div style={{
                      fontSize: 9, fontWeight: 700, background: typeColor(s.type),
                      color: '#fff', borderRadius: 6, padding: '2px 6px',
                      textTransform: 'uppercase' as const, letterSpacing: '0.3px', flexShrink: 0,
                    }}>
                      {typeLabel(s.type)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
