import { useAppStore } from './store/appStore'
import { Navbar } from './components/Navbar'
import { Topbar } from './components/Topbar'

import { SplashScreen } from './screens/SplashScreen'
import { LoginScreen } from './screens/LoginScreen'
import { SignupScreen } from './screens/SignupScreen'
import { VerifyScreen } from './screens/VerifyScreen'
import { ProfileSetupScreen } from './screens/ProfileSetupScreen'
import { HomeScreen } from './screens/HomeScreen'
import { AgendaScreen } from './screens/AgendaScreen'
import { RankingScreen } from './screens/RankingScreen'
import { StoreScreen } from './screens/StoreScreen'
import { WishlistScreen } from './screens/WishlistScreen'
import { NotesScreen } from './screens/NotesScreen'
import { NoteEditorScreen } from './screens/NoteEditorScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { ProfileEditScreen } from './screens/ProfileEditScreen'


function XpToast() {
  const { xpAnimation, xpGained } = useAppStore()
  if (!xpAnimation) return null
  return (
    <div style={{
      position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
      background: 'var(--grad-warm)', color: '#fff',
      padding: '10px 22px', borderRadius: 24,
      fontWeight: 800, fontSize: 16, zIndex: 9999,
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      pointerEvents: 'none',
    }}>
      +{xpGained} XP ⚡
    </div>
  )
}

function GlobalToast() {
  const { toast, hideToast } = useAppStore()
  if (!toast) return null
  return (
    <div
      onClick={hideToast}
      style={{
        position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
        background: toast.type === 'error' ? '#cc0000' : '#222',
        color: '#fff', padding: '12px 24px', borderRadius: 16,
        fontWeight: 600, fontSize: 14, zIndex: 9999,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        maxWidth: '80vw', textAlign: 'center', cursor: 'pointer',
      }}
    >
      {toast.message}
    </div>
  )
}
const authScreens = ['splash', 'login', 'signup', 'verify', 'profile-setup']

function ScreenContent() {
  const { currentScreen } = useAppStore()

  switch (currentScreen) {
    case 'splash':       return <SplashScreen />
    case 'login':        return <LoginScreen />
    case 'signup':       return <SignupScreen />
    case 'verify':       return <VerifyScreen />
    case 'profile-setup': return <ProfileSetupScreen />
    case 'home':         return <HomeScreen />
    case 'agenda':       return <AgendaScreen />
    case 'ranking':      return <RankingScreen />
    case 'store':        return <StoreScreen />
    case 'wishlist':     return <WishlistScreen />
    case 'notes':        return <NotesScreen />
    case 'note-editor':  return <NoteEditorScreen />
    case 'profile':      return <ProfileScreen />
    case 'profile-edit': return <ProfileEditScreen />
    default:             return <SplashScreen />
  }
}

export default function App() {
  const { currentScreen } = useAppStore()
  const isAuth = authScreens.includes(currentScreen)
  const showTopbar = !isAuth && currentScreen !== 'note-editor' && currentScreen !== 'profile-edit' && currentScreen !== 'wishlist'

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {showTopbar && <Topbar />}

      <div style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        paddingBottom: isAuth ? 0 : 'var(--navbar-h)',
      }}>
        <ScreenContent />
      </div>

      <XpToast />
      <GlobalToast />
      <Navbar />
    </div>
  )
}
