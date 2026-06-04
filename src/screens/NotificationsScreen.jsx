import { S, ACCENT, PINK } from '../constants'

export default function NotificationsScreen({ setScreen, groups, currentUser }) {
  // 사용자가 속한 그룹들을 찾기
  const userGroups = groups.filter(g => g.members?.includes(currentUser?.id))
  
  // 그룹의 최근 활동 기반 알림 생성
  const notifications = []
  
  userGroups.forEach(g => {
    // 최근 게시글이 있으면 알림
    if (g.posts && g.posts.length > 0) {
      const latestPost = g.posts[g.posts.length - 1]
      notifications.push({
        id: `post-${g.id}`,
        title: g.title,
        msg: `새 게시글: "${latestPost.title}"`,
        icon: '📢',
        time: latestPost.createdAt,
      })
    }
    
    // 최근 채팅이 있으면 알림
    if (g.chat && g.chat.length > 0) {
      const latestChat = g.chat[g.chat.length - 1]
      notifications.push({
        id: `chat-${g.id}`,
        title: g.title,
        msg: `${latestChat.author}: ${latestChat.message}`,
        icon: '💬',
        time: latestChat.createdAt,
      })
    }
    
    // 예정된 이벤트가 있으면 알림
    if (g.events && g.events.length > 0) {
      g.events.forEach(e => {
        notifications.push({
          id: `event-${e.id}`,
          title: g.title,
          msg: `${e.title} - ${e.date}`,
          icon: '📅',
          time: e.createdAt,
        })
      })
    }
  })

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '56px 16px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button style={S.backBtn} onClick={() => setScreen('home')}>←</button>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#111' }}>알림</div>
      </div>

      <div style={S.section}>
        {notifications.length > 0 ? (
          notifications.map(n => (
            <div key={n.id} style={{ ...S.card, marginBottom: 10, background: '#fafafa' }}>
              <div style={{ width: 44, height: 44, borderRadius: 22, background: `linear-gradient(135deg,${PINK}22,${ACCENT}22)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                {n.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{n.title}</div>
                <div style={{ fontSize: 13, color: '#666' }}>{n.msg}</div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: '#999' }}>
            새 알림이 없습니다.
          </div>
        )}
      </div>
    </div>
  )
}
