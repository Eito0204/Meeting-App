import { useState } from 'react'
import { GRADIENT } from '../constants'

export default function SignupScreen({ setScreen, users, setUsers }) {
  const [form, setForm] = useState({
    id: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
  })
  const [error, setError] = useState('')

  const handleSignup = () => {
    if (!form.id || !form.password || !form.passwordConfirm || !form.nickname) {
      setError('모든 필드를 입력해주세요.')
      return
    }

    if (form.id.length < 3) {
      setError('아이디는 3글자 이상이어야 합니다.')
      return
    }

    if (form.password.length < 4) {
      setError('비밀번호는 4글자 이상이어야 합니다.')
      return
    }

    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    // 중복 확인
    if (users.find(u => u.id === form.id)) {
      setError('이미 존재하는 아이디입니다.')
      return
    }

    // 회원가입 완료
    const newUser = {
      id: form.id,
      password: form.password,
      nickname: form.nickname,
      bio: '',
      interests: [],
      area: '',
      createdAt: new Date().toISOString(),
    }

    setUsers([...users, newUser])
    // 회원가입 후 프로필 설정 화면으로
    alert('회원가입이 완료되었습니다. 로그인해주세요.')
    setScreen('login')
  }

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value })
    setError('')
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '60px 28px 40px' }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 28 }}>회원 가입</div>

      <input 
        style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #e0e0e0', borderRadius: 12, fontSize: 15, outline: 'none', marginBottom: 12, boxSizing: 'border-box', background: '#fafafa' }} 
        placeholder="아이디" 
        value={form.id}
        onChange={e => handleChange('id', e.target.value)}
      />

      <input 
        style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #e0e0e0', borderRadius: 12, fontSize: 15, outline: 'none', marginBottom: 12, boxSizing: 'border-box', background: '#fafafa' }} 
        placeholder="비밀번호" 
        type="password"
        value={form.password}
        onChange={e => handleChange('password', e.target.value)}
      />

      <input 
        style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #e0e0e0', borderRadius: 12, fontSize: 15, outline: 'none', marginBottom: 12, boxSizing: 'border-box', background: '#fafafa' }} 
        placeholder="비밀번호 확인" 
        type="password"
        value={form.passwordConfirm}
        onChange={e => handleChange('passwordConfirm', e.target.value)}
      />

      <input 
        style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #e0e0e0', borderRadius: 12, fontSize: 15, outline: 'none', marginBottom: 12, boxSizing: 'border-box', background: '#fafafa' }} 
        placeholder="닉네임" 
        value={form.nickname}
        onChange={e => handleChange('nickname', e.target.value)}
      />

      {error && (
        <div style={{ color: '#ff6b6b', fontSize: 13, marginBottom: 12, padding: '8px 12px', background: '#ffe0e0', borderRadius: 8 }}>
          {error}
        </div>
      )}

      <button
        style={{ width: '100%', padding: '16px', borderRadius: 30, background: GRADIENT, color: '#fff', fontSize: 17, fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: 12 }}
        onClick={handleSignup}
      >
        가입
      </button>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <span onClick={() => setScreen('login')} style={{ fontSize: 13, color: '#aaa', cursor: 'pointer' }}>
          이미 계정이 있으신가요? 로그인
        </span>
      </div>
    </div>
  )
}
