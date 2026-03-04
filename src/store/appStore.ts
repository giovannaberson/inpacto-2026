import { create } from 'zustand'

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

interface AppState {
  currentScreen: Screen
  previousScreen: Screen | null
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

  navigateTo: (screen: Screen) => void
  goBack: () => void
  completeMission: (id: string) => void
  toggleLike: (postId: string) => void
  addReaction: (postId: string, emoji: string) => void
  addPost: (type: FeedPost['type'], content: string) => void
  toggleWishlist: (productId: string) => void
  saveNote: (sessionId: string, content: string) => void
  setActiveNote: (sessionId: string | null) => void
  triggerXpAnimation: () => void
  updateProfile: (data: Partial<User>) => void
}

const MOCK_USER: User = {
  id: '1',
  name: 'João Silva',
  email: 'joao@email.com',
  avatar: '',
  church: 'Igreja Nova Vida',
  city: 'São Paulo, SP',
  bio: 'Amo missões e café ☕ Saturados desde 2022!',
  xp: 1240,
  age: 17,
}

const MOCK_MISSIONS: Mission[] = [
  { id: 'm1', title: 'Chegou cedo!', description: 'Fez check-in antes das 8h', xpReward: 50, icon: '⏰', completed: true, day: 1 },
  { id: 'm2', title: 'Palavra anotada', description: 'Fez anotações na palestra', xpReward: 75, icon: '📝', completed: true, day: 1 },
  { id: 'm3', title: 'Conexão feita', description: 'Interagiu no feed social', xpReward: 40, icon: '🤝', completed: false, day: 1 },
  { id: 'm4', title: 'Oração enviada', description: 'Enviou um pedido de oração', xpReward: 60, icon: '🙏', completed: false, day: 1 },
  { id: 'm5', title: 'Adoração plena', description: 'Participou do louvor completo', xpReward: 80, icon: '🎵', completed: false, day: 1 },
]

const MOCK_FEED: FeedPost[] = [
  {
    id: 'p1', userId: '2', userName: 'Ana Beatriz', userInitials: 'AB',
    church: 'Igreja Filadelfia', type: 'comment',
    content: 'Que palestra incrível do pastor Lucas! Meu coração estava em chamas 🔥 Nunca ouvi alguém falar sobre propósito com tanta clareza.',
    createdAt: '2min atrás',
    reactions: [{ emoji: '🔥', count: 12, reacted: false }, { emoji: '🙌', count: 8, reacted: false }, { emoji: '❤️', count: 5, reacted: true }],
    likes: 24, liked: false,
  },
  {
    id: 'p2', userId: '3', userName: 'Pedro Henrique', userInitials: 'PH',
    church: 'Comunidade Ágape', type: 'prayer',
    content: 'Peço orações pela minha família. Meu pai está passando por um momento difícil e eu preciso de forças para estar presente. Deus é fiel! 🙏',
    createdAt: '15min atrás',
    reactions: [{ emoji: '🙏', count: 31, reacted: false }, { emoji: '❤️', count: 18, reacted: false }],
    likes: 41, liked: true,
  },
  {
    id: 'p3', userId: '0', userName: '📢 Organização', userInitials: '📢',
    church: '', type: 'announcement',
    content: 'O culto da noite começa às 19h no Salão Principal. Tragam suas Bíblias e muito ânimo! 🎉',
    createdAt: '1h atrás',
    reactions: [],
    likes: 0, liked: false,
  },
  {
    id: 'p4', userId: '4', userName: 'Mariana Costa', userInitials: 'MC',
    church: 'Batista Central', type: 'comment',
    content: 'Acabei de terminar a oficina de evangelismo. Transformador! Aprendi a compartilhar minha fé de um jeito natural e amoroso 💛',
    createdAt: '2h atrás',
    reactions: [{ emoji: '🔥', count: 7, reacted: false }, { emoji: '🙌', count: 15, reacted: false }],
    likes: 19, liked: false,
  },
]

const MOCK_SESSIONS: Session[] = [
  { id: 's1', day: 1, title: 'Saturados do Espírito', speaker: 'Pr. Lucas Mendes', type: 'plenaria', startTime: '09:00', endTime: '10:30', description: 'Abertura da conferência com uma mensagem poderosa sobre ser saturado do Espírito Santo em todos os âmbitos da vida.' },
  { id: 's2', day: 1, title: 'Louvor de Abertura', speaker: 'Banda Ágape Worship', type: 'louvor', startTime: '08:30', endTime: '09:00', description: 'Momento de adoração para iniciar o dia.' },
  { id: 's3', day: 1, title: 'Identidade em Cristo', speaker: 'Pra. Débora Lima', type: 'plenaria', startTime: '11:00', endTime: '12:30', description: 'Descubra quem você é em Cristo e como viver a plenitude da sua identidade como filho(a) de Deus.' },
  { id: 's4', day: 1, title: 'Evangelismo Natural', speaker: 'Felipe Moraes', type: 'oficina', startTime: '14:00', endTime: '15:30', description: 'Aprenda técnicas práticas para compartilhar sua fé no dia a dia sem constrangimento.' },
  { id: 's5', day: 1, title: 'Missões & Chamado', speaker: 'Equipe Jovem', type: 'oficina', startTime: '14:00', endTime: '15:30', description: 'Descubra como ouvir o chamado de Deus para as missões e dar os primeiros passos.' },
  { id: 's6', day: 1, title: 'Louvor da Noite', speaker: 'Banda Ágape Worship', type: 'louvor', startTime: '19:00', endTime: '19:30', description: 'Adoração antes da pregação noturna.' },
  { id: 's7', day: 1, title: 'O Fogo Não Apaga', speaker: 'Pr. André Santos', type: 'plenaria', startTime: '19:30', endTime: '21:30', description: 'Uma mensagem sobre perseverança na fé mesmo nas provações.' },
  { id: 's8', day: 2, title: 'Manhã de Oração', speaker: 'Todos', type: 'louvor', startTime: '07:00', endTime: '08:00', description: 'Momento de oração coletiva para começar o dia.' },
  { id: 's9', day: 2, title: 'Geração Impacto', speaker: 'Pr. Lucas Mendes', type: 'plenaria', startTime: '09:00', endTime: '10:30', description: 'Como sua geração pode impactar o mundo para Cristo.' },
  { id: 's10', day: 2, title: 'Saúde Mental & Fé', speaker: 'Dra. Camila Rosa', type: 'oficina', startTime: '11:00', endTime: '12:00', description: 'Cuide da sua mente e fortaleça sua fé. Conversa aberta sobre ansiedade e fé.' },
  { id: 's11', day: 2, title: 'Louvor & Profecia', speaker: 'Banda Ágape Worship', type: 'louvor', startTime: '14:30', endTime: '15:30', description: 'Momento especial de louvor com profecia coletiva.' },
  { id: 's12', day: 2, title: 'Envio & Missão', speaker: 'Todos', type: 'plenaria', startTime: '16:00', endTime: '17:30', description: 'Cerimônia de envio e encerramento da conferência.' },
]

const MOCK_RANKING: RankingUser[] = [
  { id: '5', name: 'Beatriz Almeida', initials: 'BA', church: 'Igreja Nova Vida', xp: 2480, position: 1 },
  { id: '6', name: 'Rafael Torres', initials: 'RT', church: 'Comunidade Ágape', xp: 2150, position: 2 },
  { id: '7', name: 'Larissa Souza', initials: 'LS', church: 'Batista Central', xp: 1890, position: 3 },
  { id: '1', name: 'João Silva', initials: 'JS', church: 'Igreja Nova Vida', xp: 1240, position: 4 },
  { id: '8', name: 'Gabriel Nunes', initials: 'GN', church: 'AD Hosana', xp: 1180, position: 5 },
  { id: '9', name: 'Fernanda Dias', initials: 'FD', church: 'PIB Centro', xp: 1050, position: 6 },
  { id: '10', name: 'Lucas Martins', initials: 'LM', church: 'Igreja Filadelfia', xp: 980, position: 7 },
  { id: '11', name: 'Camila Rocha', initials: 'CR', church: 'Comunidade Ágape', xp: 870, position: 8 },
  { id: '12', name: 'Victor Lima', initials: 'VL', church: 'Nova Vida', xp: 760, position: 9 },
  { id: '13', name: 'Isabela Gomes', initials: 'IG', church: 'AD Hosana', xp: 680, position: 10 },
]

const MOCK_PRODUCTS: Product[] = [
  { id: 'pr1', category: 'shop', name: 'Camiseta Saturados', price: 59.90, emoji: '👕', description: 'Camiseta oficial do evento com estampa exclusiva da edição 2026.', inWishlist: false },
  { id: 'pr2', category: 'shop', name: 'Caneca InPacto', price: 35.00, emoji: '☕', description: 'Caneca de cerâmica com o logo do InPacto, perfeita para o devocional.', inWishlist: true },
  { id: 'pr3', category: 'shop', name: 'Squeeze Saturados', price: 45.00, emoji: '🍶', description: 'Squeeze metálico com a arte exclusiva da conferência.', inWishlist: false },
  { id: 'pr4', category: 'shop', name: 'Caderno de Devocionais', price: 29.90, emoji: '📓', description: 'Caderno com plano de leitura bíblica e espaço para reflexões.', inWishlist: false },
  { id: 'pr5', category: 'shop', name: 'Boné InPacto 2026', price: 49.90, emoji: '🧢', description: 'Boné com bordado especial da edição 2026.', inWishlist: false },
  { id: 'pr6', category: 'shop', name: 'Adesivos Pack', price: 12.00, emoji: '🏷️', description: 'Pack com 8 adesivos exclusivos da conferência.', inWishlist: false },
  { id: 'f1', category: 'food', name: 'Açaí Saturados', price: 18.00, emoji: '🍇', description: 'Açaí cremoso com granola e frutas frescas.', venue: 'Cantina Principal', inWishlist: false },
  { id: 'f2', category: 'food', name: 'Combo Lanche', price: 22.00, emoji: '🍔', description: 'X-burguer artesanal + batata frita + refrigerante.', venue: 'Cantina Principal', inWishlist: false },
  { id: 'f3', category: 'food', name: 'Café do Átrio', price: 8.00, emoji: '☕', description: 'Café especial com croissant de queijo.', venue: 'Café do Átrio', inWishlist: false },
  { id: 'f4', category: 'food', name: 'Suco Natural', price: 10.00, emoji: '🍊', description: 'Suco de laranja ou abacaxi com hortelã.', venue: 'Café do Átrio', inWishlist: false },
  { id: 'f5', category: 'food', name: 'Wrap de Frango', price: 19.00, emoji: '🌯', description: 'Wrap integral com frango grelhado e salada.', venue: 'Cantina Principal', inWishlist: false },
  { id: 'f6', category: 'food', name: 'Brownie Artesanal', price: 9.00, emoji: '🍫', description: 'Brownie de chocolate com nozes, feito na hora.', venue: 'Café do Átrio', inWishlist: false },
]

const MOCK_NOTES: Note[] = [
  { sessionId: 's1', sessionTitle: 'Saturados do Espírito', content: 'Pr. Lucas falou sobre Acts 2:4 - ser cheio do Espírito não é um evento único, mas uma vida de rendição...\n\n"A saturação começa quando você para de pedir e começa a receber"\n\nPontos chave:\n- Oração diária\n- Rendição contínua\n- Comunhão genuína', updatedAt: '10:31' },
  { sessionId: 's3', sessionTitle: 'Identidade em Cristo', content: '', updatedAt: '' },
]

export const useAppStore = create<AppState>((set) => ({
  currentScreen: 'splash',
  previousScreen: null,
  user: MOCK_USER,
  missions: MOCK_MISSIONS,
  feed: MOCK_FEED,
  sessions: MOCK_SESSIONS,
  ranking: MOCK_RANKING,
  products: MOCK_PRODUCTS,
  notes: MOCK_NOTES,
  liveOnlineCount: 347,
  activeNoteSessionId: null,
  xpAnimation: false,

  navigateTo: (screen) => set((s) => ({ currentScreen: screen, previousScreen: s.currentScreen })),
  goBack: () => set((s) => ({ currentScreen: s.previousScreen ?? 'home', previousScreen: null })),

  completeMission: (id) => set((s) => {
    const mission = s.missions.find(m => m.id === id)
    if (!mission || mission.completed) return s
    return {
      missions: s.missions.map(m => m.id === id ? { ...m, completed: true } : m),
      user: { ...s.user, xp: s.user.xp + mission.xpReward },
      xpAnimation: true,
    }
  }),

  triggerXpAnimation: () => set({ xpAnimation: false }),

  toggleLike: (postId) => set((s) => ({
    feed: s.feed.map(p => p.id === postId
      ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
      : p
    )
  })),

  addReaction: (postId, emoji) => set((s) => ({
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
  })),

  addPost: (type, content) => set((s) => ({
    feed: [{
      id: `p${Date.now()}`,
      userId: s.user.id,
      userName: s.user.name,
      userInitials: s.user.name.split(' ').slice(0,2).map(w => w[0]).join(''),
      church: s.user.church,
      type,
      content,
      createdAt: 'agora',
      reactions: [],
      likes: 0,
      liked: false,
    }, ...s.feed]
  })),

  toggleWishlist: (productId) => set((s) => ({
    products: s.products.map(p => p.id === productId ? { ...p, inWishlist: !p.inWishlist } : p)
  })),

  saveNote: (sessionId, content) => set((s) => {
    const existing = s.notes.find(n => n.sessionId === sessionId)
    const session = s.sessions.find(ses => ses.id === sessionId)
    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
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
  }),

  setActiveNote: (sessionId) => set({ activeNoteSessionId: sessionId }),

  updateProfile: (data) => set((s) => ({ user: { ...s.user, ...data } })),
}))
