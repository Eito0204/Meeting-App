import { useState } from 'react'
import { S, ACCENT, PINK, GRADIENT, categories, catEmojis } from '../constants'
import GroupCard from '../components/GroupCard'

export default function CategoryScreen({ setScreen, setSelectedGroup, groups }) {
  const [activeCat, setActiveCat] = useState('독서')

  return (
    <div style={S.page}>
      <div style={{ padding: '56px 16px 12px' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 12 }}>
          나의 활동지역 <span style={{ color: ACCENT }}>›</span>
        </div>

        {/* 카테고리 2열 그리드 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {categories.map((c, i) => (
            <div
              key={c}
              onClick={() => setActiveCat(c)}
              style={{ padding: '14px 16px', borderRadius: 12, background: activeCat === c ? `linear-gradient(135deg,${PINK}22,${ACCENT}22)` : '#f5f5f5', border: activeCat === c ? `1.5px solid ${ACCENT}` : '1.5px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <span style={{ fontSize: 22 }}>{catEmojis[i]}</span>
              <span style={{ fontSize: 14, fontWeight: activeCat === c ? 700 : 400, color: activeCat === c ? ACCENT : '#333' }}>
                {c}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 선택된 카테고리의 모임 목록 */}
      <div style={S.section}>
        <div style={S.sectionTitle}>{activeCat}</div>
        {groups.filter(g => g.cat === activeCat).length > 0 ? (
          groups.filter(g => g.cat === activeCat).map(g => (
            <GroupCard
              key={g.id}
              g={g}
              onClick={() => { setSelectedGroup(g); setScreen('groupDetail') }}
            />
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: '#999' }}>
            {activeCat} 카테고리의 모임이 없습니다.
          </div>
        )}
      </div>
    </div>
  )
}
