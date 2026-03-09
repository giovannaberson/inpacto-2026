import { supabase } from './supabase'
import type { FeedPost, Mission, Note, Product, RankingUser, Session, User } from '../store/appStore'

// ─── AUTH ────────────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: undefined },
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function resendVerification(email: string) {
  const { error } = await supabase.auth.resend({ type: 'signup', email })
  if (error) throw error
}

export async function verifyOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup',
  })
  if (error) throw error
  return data
}

// ─── PROFILES ────────────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    name: data.name ?? '',
    email: data.email ?? '',
    avatar: data.avatar_url ?? '',
    church: data.church ?? '',
    city: data.city ?? '',
    bio: data.bio ?? '',
    xp: data.xp ?? 0,
    age: data.age ?? 17,
  }
}

export async function upsertProfile(userId: string, updates: Partial<User>) {
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      name: updates.name,
      email: updates.email,
      avatar_url: updates.avatar,
      church: updates.church,
      city: updates.city,
      bio: updates.bio,
      age: updates.age,
    })
  if (error) throw error
}

export async function addXp(userId: string, amount: number) {
  const { error } = await supabase.rpc('increment_xp', { user_id: userId, amount })
  if (error) {
    const { data } = await supabase.from('profiles').select('xp').eq('id', userId).single()
    const newXp = (data?.xp ?? 0) + amount
    await supabase.from('profiles').update({ xp: newXp }).eq('id', userId)
  }
}

// ─── SESSIONS ─────────────────────────────────────────────────────────────────

export async function getSessions(): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('day')
    .order('start_time')

  if (error || !data) return []

  return data.map(s => ({
    id: s.id,
    day: s.day,
    title: s.title,
    speaker: s.speaker ?? '',
    type: s.type as Session['type'],
    startTime: s.start_time,
    endTime: s.end_time,
    description: s.description ?? '',
  }))
}

// ─── MISSIONS ─────────────────────────────────────────────────────────────────

export async function getMissionsWithStatus(userId: string): Promise<Mission[]> {
  const [missionsRes, completedRes] = await Promise.all([
    supabase.from('missions').select('*').order('day').order('xp_reward'),
    supabase.from('user_missions').select('mission_id').eq('user_id', userId),
  ])

  const missions = missionsRes.data ?? []
  const completedIds = new Set((completedRes.data ?? []).map(um => um.mission_id))

  return missions.map(m => ({
    id: m.id,
    title: m.title,
    description: m.description ?? '',
    xpReward: m.xp_reward,
    icon: m.icon,
    day: m.day,
    completed: completedIds.has(m.id),
  }))
}

export async function completeMission(userId: string, missionId: string, xpReward: number) {
  const { error } = await supabase
    .from('user_missions')
    .insert({ user_id: userId, mission_id: missionId })
  if (error) throw error
  await addXp(userId, xpReward)
}

// ─── FEED ──────────────────────────────────────────────────────────────────────

export async function getFeed(userId: string): Promise<FeedPost[]> {
  const { data: posts, error } = await supabase
    .from('feed_posts')
    .select(`
      *,
      profiles!feed_posts_user_id_fkey (name, church),
      post_likes (user_id),
      post_reactions (emoji, user_id)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error || !posts) return []

  return posts.map(post => {
    const profile = post.profiles as { name: string; church: string } | null
    const likes = post.post_likes as { user_id: string }[]
    const reactions = post.post_reactions as { emoji: string; user_id: string }[]

    const reactionMap: Record<string, { count: number; reacted: boolean }> = {}
    for (const r of reactions) {
      if (!reactionMap[r.emoji]) reactionMap[r.emoji] = { count: 0, reacted: false }
      reactionMap[r.emoji].count++
      if (r.user_id === userId) reactionMap[r.emoji].reacted = true
    }

    const name = post.user_id === '00000000-0000-0000-0000-000000000000'
      ? '📢 Organização'
      : (profile?.name ?? 'Usuário')

    const initials = name === '📢 Organização'
      ? '📢'
      : name.split(' ').slice(0, 2).map((w: string) => w[0]).join('')

    const now = new Date()
    const created = new Date(post.created_at)
    const diffMs = now.getTime() - created.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const timeLabel = diffMin < 1 ? 'agora'
      : diffMin < 60 ? `${diffMin}min atrás`
      : diffMin < 1440 ? `${Math.floor(diffMin / 60)}h atrás`
      : `${Math.floor(diffMin / 1440)}d atrás`

    return {
      id: post.id,
      userId: post.user_id,
      userName: name,
      userInitials: initials,
      church: profile?.church ?? '',
      type: post.type as FeedPost['type'],
      content: post.content,
      createdAt: timeLabel,
      reactions: Object.entries(reactionMap).map(([emoji, val]) => ({ emoji, ...val })),
      likes: likes.length,
      liked: likes.some(l => l.user_id === userId),
    }
  })
}

export async function addPost(userId: string, type: FeedPost['type'], content: string) {
  const { data, error } = await supabase
    .from('feed_posts')
    .insert({ user_id: userId, type, content })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleLike(userId: string, postId: string, currentlyLiked: boolean) {
  if (currentlyLiked) {
    await supabase.from('post_likes').delete().eq('user_id', userId).eq('post_id', postId)
  } else {
    await supabase.from('post_likes').insert({ user_id: userId, post_id: postId })
  }
}

export async function toggleReaction(userId: string, postId: string, emoji: string, currentlyReacted: boolean) {
  if (currentlyReacted) {
    await supabase.from('post_reactions').delete()
      .eq('user_id', userId).eq('post_id', postId).eq('emoji', emoji)
  } else {
    await supabase.from('post_reactions').insert({ user_id: userId, post_id: postId, emoji })
  }
}

// ─── RANKING ──────────────────────────────────────────────────────────────────

export async function getRanking(): Promise<RankingUser[]> {
  const { data, error } = await supabase
    .from('ranking')
    .select('*')
    .limit(50)

  if (error || !data) return []

  return data.map((r, i) => ({
    id: r.id,
    name: r.name ?? 'Usuário',
    initials: (r.name ?? 'U').split(' ').slice(0, 2).map((w: string) => w[0]).join(''),
    church: r.church ?? '',
    xp: r.xp ?? 0,
    position: i + 1,
  }))
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────

export async function getProducts(userId: string): Promise<Product[]> {
  const [productsRes, wishlistRes] = await Promise.all([
    supabase.from('products').select('*').order('category').order('name'),
    supabase.from('wishlist_items').select('product_id').eq('user_id', userId),
  ])

  const products = productsRes.data ?? []
  const wishlistIds = new Set((wishlistRes.data ?? []).map(w => w.product_id))

  return products.map(p => ({
    id: p.id,
    category: p.category as Product['category'],
    name: p.name,
    price: p.price,
    emoji: p.emoji,
    description: p.description ?? '',
    venue: p.venue ?? undefined,
    inWishlist: wishlistIds.has(p.id),
  }))
}

export async function toggleWishlist(userId: string, productId: string, currentlyInWishlist: boolean) {
  if (currentlyInWishlist) {
    await supabase.from('wishlist_items').delete()
      .eq('user_id', userId).eq('product_id', productId)
  } else {
    await supabase.from('wishlist_items').insert({ user_id: userId, product_id: productId })
  }
}

// ─── NOTES ────────────────────────────────────────────────────────────────────

export async function getNotes(userId: string, sessionsData: Session[]): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error || !data) return []

  return data.map(n => {
    const session = sessionsData.find(s => s.id === n.session_id)
    const updated = new Date(n.updated_at)
    const timeStr = updated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    return {
      sessionId: n.session_id,
      sessionTitle: session?.title ?? 'Sessão',
      content: n.content ?? '',
      updatedAt: timeStr,
    }
  })
}

export async function saveNote(userId: string, sessionId: string, content: string) {
  const { error } = await supabase
    .from('notes')
    .upsert(
      { user_id: userId, session_id: sessionId, content },
      { onConflict: 'user_id,session_id' }
    )
  if (error) throw error
}
