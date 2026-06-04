import { S, ACCENT } from '../constants'

const NAV_ITEMS = [
  { key: 'home',     label: '홈',      icon: '🏠' },
  { key: 'category', label: '카테고리', icon: '☰' },
  { key: 'mygroups', label: '내 모임',  icon: '👥' },
  { key: 'profile',  label: '프로필',   icon: '👤' },
]

export default function NavBar({ tab, setTab }) {
  return (
    <div style={S.navBar}>
      {NAV_ITEMS.map(it => (
        <div
          key={it.key}
          style={S.navItem(tab === it.key)}
          onClick={() => setTab(it.key)}
        >
          <span style={{ fontSize: 22 }}>{it.icon}</span>
          {it.label}
        </div>
      ))}
    </div>
  )
}
