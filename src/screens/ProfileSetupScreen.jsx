import { useState } from 'react'
import { GRADIENT, S, categories, catEmojis } from '../constants'

export default function ProfileSetupScreen({ setScreen, currentUser, setCurrentUser }) {
  const [profile, setProfile] = useState({
    bio: '',
    area: '',
    interests: [],
  })

  const handleInterestToggle = (cat) => {
    setProfile({
      ...profile,
      interests: profile.interests.includes(cat)
        ? profile.interests.filter(c => c !== cat)
        : [...profile.interests, cat]
    })
  }

  const handleComplete = () => {
    const updatedUser = {
      ...currentUser,
      bio: profile.bio,
      area: profile.area,
      interests: profile.interests,
    }
    setCurrentUser(updatedUser)
    setScreen('home')
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '60px 28px 40px' }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 24 }}>프로필 설정</div>

      {/* 프로필 이미지 */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <div style={{ width: 80, height: 80, borderRadius: 40, background: '#ececec', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, cursor: 'pointer' }}>
          👤
        </div>
      </div>

      {/* 자기소개 */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 }}>자기소개</div>
        <textarea 
          style={{ ...S.input, minHeight: 80, resize: 'none' }} 
          placeholder="자기소개를 입력하세요" 
          value={profile.bio}
          onChange={e => setProfile({ ...profile, bio: e.target.value })}
        />
      </div>

      {/* 선호지역 */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 }}>선호지역</div>
        <input style={S.input} placeholder="예: 강남구, 마포구" value={profile.area} onChange={e => setProfile({ ...profile, area: e.target.value })} />
      </div>

      {/* 관심 분야 */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 8 }}>관심 분야</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {categories.map((c, i) => (
            <span 
              key={c} 
              style={{ 
                ...S.tag, 
                cursor: 'pointer',
                background: profile.interests.includes(c) ? '#7B5FDC' : '#f4f4f4',
                color: profile.interests.includes(c) ? '#fff' : '#555'
              }}
              onClick={() => handleInterestToggle(c)}
            >
              {catEmojis[i]} {c}
            </span>
          ))}
        </div>
      </div>

      <button
        style={{ ...S.gradBtn, marginTop: 24 }}
        onClick={handleComplete}
      >
        프로필 완료
      </button>
    </div>
  )
}
