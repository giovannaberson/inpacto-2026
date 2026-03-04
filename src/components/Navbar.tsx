import React from 'react'
import { useAppStore } from '../store/appStore'
import type { Screen } from '../store/appStore'

const tabs: { screen: Screen; icon: (active: boolean) => React.ReactElement; label: string }[] = [
  {
    screen: 'home',
    label: 'Home',
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 2} width={21} height={21}>
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinejoin="round" />
        <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    screen: 'agenda',
    label: 'Agenda',
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={21} height={21}>
        <rect x={3} y={4} width={18} height={18} rx={2} fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} />
        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
        {a && <path d="M7 14h.01M12 14h.01M17 14h.01M7 18h.01M12 18h.01" stroke="white" strokeWidth={2.5} strokeLinecap="round" />}
      </svg>
    ),
  },
  {
    screen: 'ranking',
    label: 'Ranking',
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={21} height={21}>
        <path d="M6 20V10M12 20V4M18 20v-6" strokeLinecap="round" strokeLinejoin="round" stroke={a ? 'currentColor' : 'currentColor'} />
        {a && <rect x={4} y={10} width={4} height={10} rx={1} fill="currentColor" stroke="none" />}
        {a && <rect x={10} y={4} width={4} height={16} rx={1} fill="currentColor" stroke="none" />}
        {a && <rect x={16} y={14} width={4} height={6} rx={1} fill="currentColor" stroke="none" />}
      </svg>
    ),
  },
  {
    screen: 'profile',
    label: 'Perfil',
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} width={21} height={21}>
        <circle cx={12} cy={8} r={4} />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
      </svg>
    ),
  },
]

export function Navbar() {
  const { currentScreen, navigateTo } = useAppStore()
  const authScreens: Screen[] = ['splash', 'login', 'signup', 'verify', 'profile-setup']
  if (authScreens.includes(currentScreen)) return null

  return (
    <div
      style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'var(--safe-bottom)',
        boxShadow: '0 -2px 20px rgba(0,0,0,0.06)',
        display: 'flex', alignItems: 'center',
      }}
    >
      {/* Left two tabs */}
      {tabs.slice(0, 2).map((tab) => {
        const active = currentScreen === tab.screen
        return (
          <button
            key={tab.screen}
            onClick={() => navigateTo(tab.screen)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, padding: '10px 0 8px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: active ? 'var(--pink)' : 'var(--text3)',
              transition: 'color 0.18s',
            }}
          >
            {tab.icon(active)}
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2px' }}>{tab.label}</span>
          </button>
        )
      })}

      {/* FAB center */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', paddingBottom: 8 }}>
        <button
          onClick={() => navigateTo('store')}
          style={{
            width: 52, height: 52,
            background: 'var(--grad-warm)',
            borderRadius: '50%', border: 'none',
            boxShadow: '0 4px 16px rgba(250,20,98,0.4)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: 'translateY(-8px)',
            transition: 'transform 0.15s',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(-8px) scale(0.92)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(-8px) scale(1)')}
          onTouchStart={(e) => (e.currentTarget.style.transform = 'translateY(-8px) scale(0.92)')}
          onTouchEnd={(e) => (e.currentTarget.style.transform = 'translateY(-8px) scale(1)')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} width={22} height={22}>
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 6h18M16 10a4 4 0 01-8 0" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Right two tabs */}
      {tabs.slice(2).map((tab) => {
        const active = currentScreen === tab.screen
        return (
          <button
            key={tab.screen}
            onClick={() => navigateTo(tab.screen)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, padding: '10px 0 8px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: active ? 'var(--pink)' : 'var(--text3)',
              transition: 'color 0.18s',
            }}
          >
            {tab.icon(active)}
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2px' }}>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
