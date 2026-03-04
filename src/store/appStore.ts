import { create } from 'zustand'
import * as api from '../lib/api'

export type Screen =
  | 'splash' | 'login' | 'signup' | 'verify' | 'profile-setup'
  | 'home' | 'agenda' | 'ranking' | 'store' | 'notes' | 'profile'
  | 'note-editor' | 'profile-edit' | 'wishlist'

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  church: string
  city: string
  bio: string
  xp: number
  age: number
}

export interface Mission {
  id: string
  title: string
  description: string
  xpReward: number
  icon: string
  completed: boolean
  day: number
}

export interface FeedPost {
  id: string
  userId: string
  userName: string
  userInitials: string
  church: string
  type: 'comment' | 'prayer' | 'announcement'
  content: string
  createdAt: string
  reactions: { emoji: string; count: number; reacted: boolean }[]
  likes: number
  liked: boolean
}

export interface Session {
  id: string
  day: number
  title: string
  speaker: string
  type: 'plenaria' | 'louvor' | 'oficina'
  startTime: string
  endTime: string
  description: string
}

export interface RankingUser {
  id: string
  name: string
  initials: string
  church: string
  xp: number
  position: number
}

export interface Product {
  id: string
  category: 'shop' | 'food'
  name: string
  price: number
  emoji: string
  description: string
  venue?: string
  inWishlist: boolean
}

export interface Note {
  sessionId: string
  sessionTitle: string
  content: string
  updatedAt: string
}

const EMPTY_USER: User = {
  id: '',
  name: '',
  email: '',
  avatar: '',
  church: '',
  city: '',
  bio: '',
  xp: 0,
  age: 17,
}

interface AppState {
  // Navigation
  currentScreen: Screen
  previousScreen: Screen | null

  // Auth
  authUserId: string | null
  pendingEmail: string | null  // email waiting for verification

  // Data
  user: User
  missions: Mission[]
  feed: FeedPost[]
  sessions: Session[]
  ranking: RankingUser[]
  products: Product[]
  notes: Note[]
  liveOnlineCount: number
  activeNoteSessionId: string | null
  xpAnimation: boolean

  // Loading states
  loading: boolean
  feedLoading: boolean
  rankingLoading: boolean

  // Navigation
  navigateTo: (screen: Screen) => void
  goBack: () => void

  // Auth actions
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setPendingEmail: (email: string) => void
  initAuth: () => Promise<void>

  // Data loading
  loadInitialData: (userId: string) => Promise<void>
  loadFeed: () => Promise<void>
  loadRanking: () => Promise<void>

  // Actions
  completeMission: (id: string) => Promise<void>
  toggleLike: (postId: string) => void
  addReaction: (postId: string, emoji: string) => void
  addPost: (type: FeedPost['type'], content: string) => Promise<void>
  toggleWishlist: (productId: string) => void
  saveNote: (sessionId: string, content: string) => Promise<void>
  setActiveNote: (sessionId: string | null) => void
  triggerXpAnimation: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  currentScreen: 'splash',
  previousScreen: null,
  authUserId: null,
  pendingEmail: null,
  user: EMPTY_USER,
  missions: [],
  feed: [],
  sessions: [],
  ranking: [],
  products: [],
  notes: [],
  liveOnlineCount: 0,
  activeNoteSessionId: null,
  xpAnimation: false,
  loading: false,
  feedLoading: false,
  rankingLoading: false,

  navigateTo: (screen) => set((s) => ({ currentScreen: screen, previousScreen: s.currentScreen })),
  goBack: () => set((s) => ({ currentScreen: s.previousScreen ?? 'home', previousScreen: null })),

  setPendingEmail: (email) => set({ pendingEmail: email }),

  // ─── Auth ─────────────────────────────────────────────────────────────────

  initAuth: async () => {
    const session = await api.getSession()
    if (session?.user) {
      const userId = session.user.id
      set({ authUserId: userId })
      const profile = await api.getProfile(userId)
      if (profile && profile.name) {
        set({ user: profile })
        await get().loadInitialData(userId)
        set({ currentScreen: 'home' })
      } else {
        // Has auth but no profile yet
        set({ currentScreen: 'profile-setup' })
      }
    } else {
      set({ currentScreen: 'login' })
    }
  },

  login: async (email, password) => {
    set({ loading: true })
    try {
      const data = await api.signIn(email, password)
      const userId = data.user?.id
      if (!userId) throw new Error('Login falhou')

      set({ authUserId: userId })
      const profile = await api.getProfile(userId)

      if (profile && profile.name) {
        set({ user: profile })
        await get().loadInitialData(userId)
        set({ currentScreen: 'home', loading: false })
      } else {
        set({ user: { ...EMPTY_USER, id: userId, email }, currentScreen: 'profile-setup', loading: false })
      }
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  signup: async (email, password) => {
    set({ loading: true })
    try {
      await api.signUp(email, password)
      set({ pendingEmail: email, currentScreen: 'verify', loading: false })
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  logout: async () => {
    await api.signOut()
    set({
      authUserId: null,
      user: EMPTY_USER,
      missions: [],
      feed: [],
      sessions: [],
      ranking: [],
      products: [],
      notes: [],
      currentScreen: 'login',
    })
  },

  // ─── Data Loading ──────────────────────────────────────────────────────────

  loadInitialData: async (userId) => {
    const [sessions, missions, feed, ranking, products] = await Promise.all([
      api.getSessions(),
      api.getMissionsWithStatus(userId),
      api.getFeed(userId),
      api.getRanking(),
      api.getProducts(userId),
    ])

    const notes = await api.getNotes(userId, sessions)

    set({
      sessions,
      missions,
      feed,
      ranking,
      products,
      notes,
      liveOnlineCount: Math.floor(Math.random() * 200) + 250, // simulated
    })
  },

  loadFeed: async () => {
    const userId = get().authUserId
    if (!userId) return
    set({ feedLoading: true })
    const feed = await api.getFeed(userId)
    set({ feed, feedLoading: false })
  },

  loadRanking: async () => {
    set({ rankingLoading: true })
    const ranking = await api.getRanking()
    set({ ranking, rankingLoading: false })
  },

  // ─── Actions ───────────────────────────────────────────────────────────────

  completeMission: async (id) => {
    const { authUserId, missions } = get()
    const mission = missions.find(m => m.id === id)
    if (!mission || mission.completed || !authUserId) return

    // Optimistic update
    set((s) => ({
      missions: s.missions.map(m => m.id === id ? { ...m, completed: true } : m),
      user: { ...s.user, xp: s.user.xp + mission.xpReward },
      xpAnimation: true,
    }))

    try {
      await api.completeMission(authUserId, id, mission.xpReward)
    } catch {
      // Rollback on error
      set((s) => ({
        missions: s.missions.map(m => m.id === id ? { ...m, completed: false } : m),
        user: { ...s.user, xp: s.user.xp - mission.xpReward },
      }))
    }
  },

  triggerXpAnimation: () => set({ xpAnimation: false }),

  toggleLike: (postId) => {
    const { authUserId, feed } = get()
    if (!authUserId) return
    const post = feed.find(p => p.id === postId)
    if (!post) return

    // Optimistic update
    set((s) => ({
      feed: s.feed.map(p => p.id === postId
        ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
        : p
      )
    }))
    // Sync to server (fire and forget)
    api.toggleLike(authUserId, postId, post.liked).catch(() => {
      // Rollback
      set((s) => ({
        feed: s.feed.map(p => p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
        )
      }))
    })
  },

  addReaction: (postId, emoji) => {
    const { authUserId, feed } = get()
    if (!authUserId) return
    const post = feed.find(p => p.id === postId)
    if (!post) return
    const existingReaction = post.reactions.find(r => r.emoji === emoji)
    const currentlyReacted = existingReaction?.reacted ?? false

    // Optimistic update
    set((s) => ({
      feed: s.feed.map(p => {
        if (p.id !== postId) return p
        const existing = p.reactions.find(r => r.emoji === emoji)
        if (existing) {
          return {
            ...p,
            reactions: p.reactions.map(r =>
              r.emoji === emoji
                ? { ...r, count: r.reacted ? r.count - 1 : r.count + 1, reacted: !r.reacted }
                : r
            )
          }
        }
        return { ...p, reactions: [...p.reactions, { emoji, count: 1, reacted: true }] }
      })
    }))
    // Sync to server
    api.toggleReaction(authUserId, postId, emoji, currentlyReacted).catch(() => {})
  },

  addPost: async (type, content) => {
    const { authUserId, user } = get()
    if (!authUserId) return

    const tempId = `temp-${Date.now()}`
    const tempPost: FeedPost = {
      id: tempId,
      userId: authUserId,
      userName: user.name,
      userInitials: user.name.split(' ').slice(0, 2).map(w => w[0]).join(''),
      church: user.church,
      type,
      content,
      createdAt: 'agora',
      reactions: [],
      likes: 0,
      liked: false,
    }

    // Optimistic add
    set((s) => ({ feed: [tempPost, ...s.feed] }))

    try {
      const real = await api.addPost(authUserId, type, content)
      // Replace temp with real
      set((s) => ({
        feed: s.feed.map(p => p.id === tempId ? { ...tempPost, id: real.id } : p)
      }))
    } catch {
      // Remove temp on error
      set((s) => ({ feed: s.feed.filter(p => p.id !== tempId) }))
    }
  },

  toggleWishlist: (productId) => {
    const { authUserId, products } = get()
    if (!authUserId) return
    const product = products.find(p => p.id === productId)
    if (!product) return

    // Optimistic update
    set((s) => ({
      products: s.products.map(p => p.id === productId ? { ...p, inWishlist: !p.inWishlist } : p)
    }))
    // Sync
    api.toggleWishlist(authUserId, productId, product.inWishlist).catch(() => {
      set((s) => ({
        products: s.products.map(p => p.id === productId ? { ...p, inWishlist: !p.inWishlist } : p)
      }))
    })
  },

  saveNote: async (sessionId, content) => {
    const { authUserId, sessions } = get()
    if (!authUserId) return

    const session = sessions.find(s => s.id === sessionId)
    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

    // Optimistic update
    set((s) => {
      const existing = s.notes.find(n => n.sessionId === sessionId)
      if (existing) {
        return { notes: s.notes.map(n => n.sessionId === sessionId ? { ...n, content, updatedAt: now } : n) }
      }
      return {
        notes: [...s.notes, {
          sessionId,
          sessionTitle: session?.title ?? 'Sessão',
          content,
          updatedAt: now,
        }]
      }
    })

    await api.saveNote(authUserId, sessionId, content)
  },

  setActiveNote: (sessionId) => set({ activeNoteSessionId: sessionId }),

  updateProfile: async (data) => {
    const { authUserId } = get()
    if (!authUserId) return

    // Optimistic update
    set((s) => ({ user: { ...s.user, ...data } }))

    try {
      await api.upsertProfile(authUserId, { ...get().user, ...data })
    } catch (err) {
      console.error('Failed to update profile', err)
    }
  },
}))
