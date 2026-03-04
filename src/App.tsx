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

      <Navbar />
    </div>
  )
}
