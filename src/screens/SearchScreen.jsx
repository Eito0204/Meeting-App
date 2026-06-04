import { useState } from 'react'
import { S, categories, catEmojis } from '../constants'

const SUGGESTED = ['온라인 게임', '운동', '기타(etc)']

export default function SearchScreen({ setScreen, setSelectedGroup, groups }) {
  const [query, setQuery] = useState('')
  const keyword = query.trim().toLowerCase()
  const filteredGroups = groups.filter(g => {
    if (!keyword) return false
    return [g.title, g.desc, g.area, g.cat]
      .some(value => value.toLowerCase().includes(keyword))
  })

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {/* 검색 헤더 */}
      <div style={{ padding: '56px 16px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button style={S.backBtn} onClick={() => setScreen('home')}>←</button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#f5f5f5', borderRadius: 20, padding: '10px 16px', gap: 8 }}>
          <span>🔍</span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="검색어 입력"
            style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: 15, fontFamily: 'inherit' }}
          />
        </div>
      </div>

      <div style={S.section}>
        {/* 최근 검색어 */}
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 10 }}>최근 검색어</div>
        <div style={{ fontSize: 13, color: '#aaa', marginBottom: 20 }}>검색 내역이 없습니다.</div>

        {/* 추천 검색어 */}
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 8 }}>추천 검색어</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {SUGGESTED.map(s => (
            <span key={s} onClick={() => setQuery(s)} style={{ ...S.tag, cursor: 'pointer' }}>{s}</span>
          ))}
        </div>

        {/* 카테고리 */}
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 12 }}>카테고리</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 20 }}>
          {categories.map((c, i) => (
            <div key={c} onClick={() => setQuery(c)} style={S.catCircle(false)}>
              <div style={S.catDot(false)}>{catEmojis[i]}</div>
              <span style={S.catLabel}>{c}</span>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 10 }}>검색 결과</div>
        {keyword === '' ? (
          <div style={{ fontSize: 13, color: '#999' }}>검색어를 입력하면 모임을 찾을 수 있습니다.</div>
        ) : filteredGroups.length > 0 ? (
          filteredGroups.map(g => (
            <div key={g.id} onClick={() => { setSelectedGroup(g); setScreen('groupDetail') }}>
              <div style={{ ...S.card, cursor: 'pointer', marginBottom: 12 }}>
                <div style={S.imgBox}>{g.img}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 3 }}>{g.title}</div>
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.desc}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{g.cat} · {g.area} · {g.count}/{g.max}명</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ fontSize: 13, color: '#999' }}>검색 결과가 없습니다.</div>
        )}
      </div>
    </div>
  )
}
