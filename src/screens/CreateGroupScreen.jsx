import { useState } from 'react'
import { S, categories, catEmojis } from '../constants'

export default function CreateGroupScreen({ setScreen, groups, setGroups, currentUser }) {
  const [form, setForm] = useState({
    title: '',
    desc: '',
    area: '',
    max: 20,
    cat: categories[0],
    img: '🤝'
  })

  const handleSubmit = () => {
    if (!form.title || !form.desc || !form.area) {
      alert('모든 필드를 입력해주세요.')
      return
    }

    const newGroup = {
      id: Date.now(),
      ...form,
      count: 1,
      creator: currentUser?.id || 'unknown',
      createdAt: new Date().toISOString(),
      events: [],
      members: [currentUser?.id || 'unknown'],
      posts: [],
      chat: [],
      photos: [],
    }

    setGroups([...groups, newGroup])
    setScreen('mygroups')
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '56px 16px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button style={S.backBtn} onClick={() => setScreen('home')}>←</button>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#111' }}>모임 만들기</div>
      </div>

      <div style={S.section}>
        {/* 이미지 업로드 */}
        <div style={{ width: '100%', height: 140, background: '#f5f5f5', borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 16 }}>
          <span style={{ fontSize: 32 }}>{form.img}</span>
          <span style={{ fontSize: 13, color: '#aaa', marginTop: 6 }}>이미지 선택</span>
        </div>

        {/* 지역 */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 }}>지역</div>
          <input style={S.input} placeholder="동 · 읍 · 면" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} />
        </div>

        {/* 모임 이름 */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 }}>모임 이름</div>
          <input style={S.input} placeholder="모임 이름을 입력하세요" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>

        {/* 설명 */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 }}>모임 설명</div>
          <textarea
            style={{ ...S.input, minHeight: 100, resize: 'none' }}
            placeholder="이 모임에 대한 설명을 적어주세요"
            value={form.desc}
            onChange={e => setForm({ ...form, desc: e.target.value })}
          />
        </div>

        {/* 정원 */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 }}>정원 (1~100명)</div>
          <input style={S.input} type="number" placeholder="20" value={form.max} onChange={e => setForm({ ...form, max: parseInt(e.target.value) || 20 })} />
        </div>

        {/* 카테고리 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 8 }}>카테고리</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {categories.map((c, i) => (
              <span 
                key={c} 
                style={{ ...S.tag, cursor: 'pointer', background: form.cat === c ? '#7B5FDC' : '#f4f4f4', color: form.cat === c ? '#fff' : '#555' }} 
                onClick={() => setForm({ ...form, cat: c })}
              >
                {catEmojis[i]} {c}
              </span>
            ))}
          </div>
        </div>

        {/* 만들기 버튼 */}
        <button style={S.gradBtn} onClick={handleSubmit}>모임 만들기</button>
      </div>
    </div>
  )
}
