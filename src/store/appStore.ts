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

export interface EventConfig {
  id: string
  eventName: string
  eventStartDate: string  // 'YYYY-MM-DD'
  eventEndDate: string
  totalDays: number
  tagline: string
  primaryColor: string
  logoUrl?: string
}

export interface Achievement {
  id: string
  key: string
  icon: string
  title: string
  description: string
  unlocked: boolean
  unlockedAt?: string
}

export interface Mission {
  id: string
  key: string
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
  isLive: boolean
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
  pendingEmail: string | null

  // Data
  user: User
  eventConfig: EventConfig | null
  missions: Mission[]
  feed: FeedPost[]
  sessions: Session[]
  liveSession: Session | null
  ranking: RankingUser[]
  products: Product[]
  notes: Note[]
  achievements: Achievement[]
  activeNoteSessionId: string | null
  xpAnimation: boolean
  xpGained: number
  addSheetOpen: boolean

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
  verifyEmail: (code: string) => Promise<void>
  logout: () => Promise<void>
  setPendingEmail: (email: string) => void
  initAuth: () => Promise<void>

  // Data loading
  loadInitialData: (userId: string) => Promise<void>
  loadFeed: () => Promise<void>
  loadRanking: () => Promise<void>
  loadAchievements: () => Promise<void>

  // Actions
  completeMission: (id: string) => Promise<void>
  toggleLike: (postId: string) => void
  addReaction: (postId: string, emoji: string) => void
  addPost: (type: FeedPost['type'], content: string) => Promise<void>
  submitLiveQuestion: (sessionId: string, content: string) => Promise<void>
  toggleWishlist: (productId: string) => void
  saveNote: (sessionId: string, content: string) => Promise<void>
  setActiveNote: (sessionId: string | null) => void
  triggerXpAnimation: () => void
  setAddSheetOpen: (open: boolean) => void
  updateProfile: (data: Partial<User>) => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  currentScreen: 'splash',
  previousScreen: null,
  authUserId: null,
  pendingEmail: null,
  user: EMPTY_USER,
  eventConfig: null,
  missions: [],
  feed: [],
  sessions: [],
  liveSession: null,
  ranking: [],
  products: [],
  notes: [],
  achievements: [],
  activeNoteSessionId: null,
  xpAnimation: false,
  xpGained: 0,
  addSheetOpen: false,
  loading: false,
  feedLoading: false,
  rankingLoading: false,

  navigateTo: (screen) => set((s) => ({ currentScreen: screen, previousScreen: s.currentScreen })),
  goBack: () => set((s) => ({ currentScreen: s.previousScreen ?? 'home', previousScreen: null })),

  setPendingEmail: (email) => set({ pendingEmail: email }),

  // âââ Auth âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

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

  verifyEmail: async (code) => {
    const { pendingEmail } = get()
    if (!pendingEmail) throw new Error('E-mail nÃ£o encontrado. Tente fazer o cadastro novamente.')

    set({ loading: true })
    try {
      const data = await api.verifyOtp(pendingEmail, code)
      const userId = data.user?.id
      if (!userId) throw new Error('VerificaÃ§Ã£o falhou. Tente novamente.')

      set({ authUserId: userId, loading: false })

      const profile = await api.getProfile(userId)
      if (profile && profile.name) {
        set({ user: profile })
        await get().loadInitialData(userId)
        set({ currentScreen: 'home' })
      } else {
        set({
          user: { ...EMPTY_USER, id: userId, email: pendingEmail },
          currentScreen: 'profile-setup',
        })
      }
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
      eventConfig: null,
      missions: [],
      feed: [],
      sessions: [],
      liveSession: null,
      ranking: [],
      products: [],
      notes: [],
      achievements: [],
      currentScreen: 'login',
    })
  },

  // âââ Data Loading ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

  loadInitialData: async (userId) => {
    const [eventConfig, sessions, missions, feed, ranking, products, liveSession, achievements] =
      await Promise.all([
        api.getEventConfig(),
        api.getSessions(),
        api.getMissionsWithStatus(userId),
        api.getFeed(userId),
        api.getRanking(),
        api.getProducts(userId),
        api.getLiveSession(),
        api.getAchievements(userId),
      ])

    const notes = await api.getNotes(userId, sessions)

    set({
      eventConfig,
      sessions,
      missions,
      feed,
      ranking,
      products,
      notes,
      liveSession,
      achievements,
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

  loadAchievements: async () => {
    const userId = get().authUserId
    if (!userId) return
    const achievements = await api.getAchievements(userId)
    set({ achievements })
  },

  // âââ Actions âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

  completeMission: async (id) => {
    const { authUserId, missions } = get()
    const mission = missions.find(m => m.id === id)
    if (!mission || mission.completed || !authUserId) return

    // Optimistic update
    set((s) => ({
      missions: s.missions.map(m => m.id === id ? { ...m, completed: true } : m),
      user: { ...s.user, xp: s.user.xp + mission.xpReward },
      xpAnimation: true,
      xpGained: mission.xpReward,
    }))

    try {
      await api.completeMission(authUserId, id, mission.xpReward)
      // Extra front-end achievement triggers for keys not covered by DB trigger
      if (mission.key === 'checkin') {
        api.checkAchievement('boas_vindas').catch(() => {})
        api.checkAchievement('madrugador').catch(() => {})
      }
      // Reload achievements in background â DB trigger may also have unlocked some
      get().loadAchievements()
    } catch {
      // Rollback on error
      set((s) => ({
        missions: s.missions.map(m => m.id === id ? { ...m, completed: false } : m),
        user: { ...s.user, xp: s.user.xp - mission.xpReward },
      }))
    }
  },

  triggerXpAnimation: () => set({ xpAnimation: false }),
  setAddSheetOpen: (open) => set({ addSheetOpen: open }),

  submitLiveQuestion: async (sessionId, content) => {
    const { authUserId } = get()
    if (!authUserId || !content.trim()) return
    await api.submitLiveQuestion(authUserId, sessionId, content)
    // Unlock Q&A achievement in background
    api.checkAchievement('pergunta_viva').then(() => get().loadAchievements()).catch(() => {})
  },

  toggleLike: (postId) => {
    const { authUserId, feed } = get()
    if (!authUserId) return
    const post = feed.find(p => p.id === postId)
    if (!post) return

    set((s) => ({
      feed: s.feed.map(p => p.id === postId
        ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
        : p
      )
    }))
    api.toggleLike(authUserId, postId, post.liked).catch(() => {
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

    set((s) => ({ feed: [tempPost, ...s.feed] }))

    try {
      const real = await api.addPost(authUserId, type, content)
      set((s) => ({
        feed: s.feed.map(p => p.id === tempId ? { ...tempPost, id: real.id } : p)
      }))
      // Unlock feed achievement in background
      api.checkAchievement('feed_ativo').then(() => get().loadAchievements()).catch(() => {})
    } catch {
      set((s) => ({ feed: s.feed.filter(p => p.id !== tempId) }))
    }
  },

  toggleWishlist: (productId) => {
    const { authUserId, products } = get()
    if (!authUserId) return
    const product = products.find(p => p.id === productId)
    if (!product) return

    const wasInWishlist = product.inWishlist

    set((s) => ({
      products: s.products.map(p => p.id === productId ? { ...p, inWishlist: !p.inWishlist } : p)
    }))

    // Check wishlist_cheia achievement when adding (not removing) and hitting threshold
    if (!wasInWishlist) {
      const newCount = products.filter(p => p.inWishlist).length + 1  // +1 because optimistic
      if (newCount >= 3) {
        api.checkAchievement('wishlist_cheia').then(() => get().loadAchievements()).catch(() => {})
      }
    }

    api.toggleWishlist(authUserId, productId, wasInWishlist).catch(() => {
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

    set((s) => {
      const existing = s.notes.find(n => n.sessionId === sessionId)
      if (existing) {
        return { notes: s.notes.map(n => n.sessionId === sessionId ? { ...n, content, updatedAt: now } : n) }
      }
      return {
        notes: [...s.notes, {
          sessionId,
          sessionTitle: session?.title ?? 'SessÃ£o',
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

    set((s) => ({ user: { ...s.user, ...data } }))

    try {
      await api.upsertProfile(authUserId, { ...get().user, ...data })
    } catch (err) {
      console.error('Failed to update profile', err)
    }
  },
}))
