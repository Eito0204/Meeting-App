import { useState } from 'react'
import { GRADIENT, ACCENT } from '../constants'

export default function LoginScreen({ setScreen, users, setCurrentUser }) {
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = () => {
    if (!id || !password) {
      setError('아이디와 비밀번호를 모두 입력해주세요.')
      return
    }

    const user = users.find(u => u.id === id && u.password === password)
    if (user) {
      setCurrentUser(user)
      setScreen('home')
      setError('')
    } else {
      setError('아이디 또는 비밀번호가 일치하지 않습니다.')
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '60px 28px 40px' }}>
      {/* 로고 */}
      <div style={{ textAlign: 'center', marginBottom: 50 }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: GRADIENT, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>
          🤝
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#111', letterSpacing: -1 }}>모임 매칭 앱</div>
        <div style={{ fontSize: 13, color: '#aaa', marginTop: 4 }}>함께라서 더 즐거운 모임</div>
      </div>

      {/* 입력 폼 */}
      <div style={{ flex: 1 }}>
        <input 
          style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #e0e0e0', borderRadius: 12, fontSize: 15, outline: 'none', marginBottom: 12, boxSizing: 'border-box', background: '#fafafa' }} 
          placeholder="ID" 
          value={id}
          onChange={e => setId(e.target.value)}
        />
        <input 
          style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #e0e0e0', borderRadius: 12, fontSize: 15, outline: 'none', marginBottom: 12, boxSizing: 'border-box', background: '#fafafa' }} 
          placeholder="비밀번호" 
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleLogin()}
        />

        {error && (
          <div style={{ color: '#ff6b6b', fontSize: 13, marginBottom: 12, padding: '8px 12px', background: '#ffe0e0', borderRadius: 8 }}>
            {error}
          </div>
        )}

        <button style={{ width: '100%', padding: '16px', borderRadius: 30, background: GRADIENT, color: '#fff', fontSize: 17, fontWeight: 700, border: 'none', cursor: 'pointer', letterSpacing: 2 }}
          onClick={handleLogin}>
          로그인
        </button>

        {/* 간편 로그인 구분선 */}
        <div style={{ textAlign: 'center', margin: '20px 0', position: 'relative' }}>
          <div style={{ height: 1, background: '#eee', position: 'absolute', top: '50%', left: 0, right: 0 }} />
          <span style={{ background: '#fff', padding: '0 12px', color: '#aaa', fontSize: 13, position: 'relative' }}>간편로그인</span>
        </div>

        {/* 소셜 로그인 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 30 }}>
          {/* Google */}
          <div style={{ width: 52, height: 52, borderRadius: 26, background: '#fff', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <span style={{ fontSize: 20, fontWeight: 800, background: 'linear-gradient(45deg,#4285F4,#EA4335,#FBBC05,#34A853)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>G</span>
          </div>
          {/* Naver */}
          <div style={{ width: 52, height: 52, borderRadius: 26, background: '#03C75A', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <span style={{ color: '#fff', fontSize: 18, fontWeight: 800 }}>N</span>
          </div>
          {[0, 1].map(i => (
            <div key={i} style={{ width: 52, height: 52, borderRadius: 26, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} />
          ))}
        </div>
      </div>

      {/* 하단 링크 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 32 }}>
        <span onClick={() => setScreen('signup')}       style={{ fontSize: 14, color: '#555', cursor: 'pointer', textDecoration: 'underline' }}>회원 가입</span>
        <span onClick={() => setScreen('changePassword')} style={{ fontSize: 14, color: '#555', cursor: 'pointer', textDecoration: 'underline' }}>아이디/비번 변경</span>
      </div>
    </div>
  )
}
