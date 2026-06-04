import { S, ACCENT } from '../constants'

const INTERESTS = ['독서', '운동', '게임', '영화']

export default function ProfileScreen({ setScreen, currentUser }) {
  return (
    <div style={S.page}>
      {/* 헤더 */}
      <div style={{ padding: '56px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>프로필</div>
        <span style={{ fontSize: 22, cursor: 'pointer' }} onClick={() => setScreen('settings')}>⚙️</span>
      </div>

      {/* 프로필 정보 */}
      <div style={{ padding: '0 16px 16px', display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: 36, background: '#e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
          👤
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>{currentUser?.nickname || '사용자'}</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{currentUser?.area || '지역 설정안함'}</div>
        </div>
      </div>

      {/* 관심분야 */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>소개</div>
        <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 14, minHeight: 100, color: currentUser?.bio ? '#111' : '#aaa', fontSize: 14, wordBreak: 'break-word' }}>
          {currentUser?.bio || '프로필 설정에서 자기소개를 입력해주세요.'}
        </div>
      </div>

      {/* 모임 만들기 */}
      <div style={{ margin: '0 16px' }}>
        <div
          onClick={() => setScreen('createGroup')}
          style={{ border: '1px solid #eee', borderRadius: 12, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>모임 만들기</span>
          <span style={{ color: '#aaa' }}>›</span>
        </div>
      </div>
    </div>
  )
}
