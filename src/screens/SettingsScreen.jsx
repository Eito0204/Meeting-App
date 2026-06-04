import { useState } from 'react'
import { S, GRADIENT } from '../constants'

const MENU_ITEMS = ['공지사항', '고객센터', '버전정보']

function Toggle({ on, setOn }) {
  return (
    <div
      onClick={() => setOn(!on)}
      style={{ width: 48, height: 26, borderRadius: 13, background: on ? GRADIENT : '#ddd', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}
    >
      <div style={{ width: 22, height: 22, borderRadius: 11, background: '#fff', position: 'absolute', top: 2, left: on ? 24 : 2, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
    </div>
  )
}

export default function SettingsScreen({ setScreen, setCurrentUser }) {
  const [chatAlert,   setChatAlert]   = useState(true)
  const [noticeAlert, setNoticeAlert] = useState(false)
  const [eventAlert,  setEventAlert]  = useState(true)

  const ALERT_ITEMS = [
    { label: '채팅알림',     on: chatAlert,   setOn: setChatAlert   },
    { label: '모임 공지사항', on: noticeAlert, setOn: setNoticeAlert },
    { label: '정기모임 알림', on: eventAlert,  setOn: setEventAlert  },
  ]

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '56px 16px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button style={S.backBtn} onClick={() => setScreen('profile')}>←</button>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#111' }}>설정</div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* 안내 메뉴 */}
        {MENU_ITEMS.map(item => (
          <div key={item} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #f2f2f2', cursor: 'pointer' }}>
            <span style={{ fontSize: 15, color: '#111' }}>{item}</span>
            <span style={{ color: '#aaa' }}>›</span>
          </div>
        ))}

        {/* 알림 설정 */}
        <div style={{ marginTop: 20, fontSize: 14, fontWeight: 700, color: '#333', marginBottom: 10 }}>알림설정</div>
        {ALERT_ITEMS.map(it => (
          <div key={it.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f2f2f2' }}>
            <span style={{ fontSize: 15, color: '#111' }}>{it.label}</span>
            <Toggle on={it.on} setOn={it.setOn} />
          </div>
        ))}

        {/* 로그아웃 */}
        <div style={{ marginTop: 40 }}>
          <button 
            onClick={() => { setCurrentUser(null); setScreen('login') }} 
            style={{ width: '100%', padding: '14px 16px', background: '#ff6b6b', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  )
}
