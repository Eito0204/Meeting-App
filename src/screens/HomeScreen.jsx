import { useState, useEffect } from 'react'
import { S, ACCENT, PINK, GRADIENT, categories, catEmojis } from '../constants'
import GroupCard from '../components/GroupCard'

const TABS = ['활동', '정모', '추천']
const WEEK_DAYS = ['월', '화', '수', '목', '금', '토']

export default function HomeScreen({ setScreen, setSelectedGroup, groups, filterArea, setFilterArea, filterCat, setFilterCat, filterDate, setFilterDate }) {
  const [activeTab, setActiveTab] = useState('활동')
  const [areaSearchOpen, setAreaSearchOpen] = useState(false)
  const [today, setToday] = useState(new Date())
  
  // 매 초마다 현재 시간 업데이트
  useEffect(() => {
    const interval = setInterval(() => setToday(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // 현재 날짜 기반으로 주간 날짜 계산
  const currentDate = today.getDate()
  const currentMonth = today.getMonth() + 1
  const WEEK_DATES = Array.from({ length: 6 }).map((_, i) => currentDate + i)

  // 필터링된 모임 계산
  const filteredGroups = groups.filter(g => {
    if (filterCat && g.cat !== filterCat) return false
    if (filterArea && !g.area.includes(filterArea)) return false
    return true
  })

  // 선택된 날짜에 해당하는 이벤트만 필터링
  const filteredEvents = filteredGroups
    .flatMap(g => (g.events || []).map(e => ({ ...e, groupId: g.id, groupTitle: g.title })))
    .filter(e => !filterDate || e.date.includes(filterDate.split('.')[1]))

  const handleGroupClick = (g) => {
    setSelectedGroup(g)
    setScreen('groupDetail')
  }

  return (
    <div style={S.page}>
      {/* 헤더 */}
      <div style={{ padding: '56px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div 
          style={{ fontSize: 17, fontWeight: 700, color: '#111', cursor: 'pointer' }}
          onClick={() => setAreaSearchOpen(!areaSearchOpen)}
        >
          나의 활동지역 <span style={{ color: ACCENT }}>›</span>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <span style={{ fontSize: 22, cursor: 'pointer' }} onClick={() => setScreen('search')}>🔍</span>
          <span style={{ fontSize: 22, cursor: 'pointer' }} onClick={() => setScreen('notifications')}>🔔</span>
          <span style={{ fontSize: 22, cursor: 'pointer' }}>💬</span>
        </div>
      </div>

      {/* 지역 검색 필터 */}
      {areaSearchOpen && (
        <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8 }}>
          <input
            style={S.input}
            placeholder="지역명 검색 (예: 강남구)"
            value={filterArea}
            onChange={e => setFilterArea(e.target.value)}
            autoFocus
          />
          <button
            onClick={() => { setFilterArea(''); setAreaSearchOpen(false) }}
            style={{ ...S.outlineBtn, padding: '12px 16px', minWidth: 'auto' }}
          >
            초기화
          </button>
        </div>
      )}

      {/* 활동/정모/추천 탭 */}
      <div style={{ display: 'flex', borderBottom: '1px solid #eee', margin: '0 16px' }}>
        {TABS.map(t => (
          <div
            key={t}
            onClick={() => setActiveTab(t)}
            style={{ flex: 1, textAlign: 'center', padding: '10px 0', fontSize: 14, fontWeight: activeTab === t ? 700 : 400, color: activeTab === t ? ACCENT : '#999', borderBottom: activeTab === t ? `2px solid ${ACCENT}` : '2px solid transparent', cursor: 'pointer' }}
          >
            {t}
          </div>
        ))}
      </div>

      {/* 카테고리 원형 아이콘 */}
      <div style={{ padding: '16px 16px 4px' }}>
        <div style={S.scrollRow}>
          {categories.map((c, i) => (
            <div key={c} style={S.catCircle(filterCat === c)} onClick={() => setFilterCat(filterCat === c ? null : c)}>
              <div style={S.catDot(filterCat === c)}>{catEmojis[i]}</div>
              <span style={S.catLabel}>{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 활동이 활발한 모임 */}
      <div style={S.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0 10px' }}>
          <div style={S.sectionTitle}>활동이 활발한 모임</div>
        </div>
        {filteredGroups.length > 0 ? (
          filteredGroups.map(g => (
            <GroupCard key={g.id} g={g} onClick={() => handleGroupClick(g)} />
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '24px', color: '#999' }}>모임이 없습니다.</div>
        )}
      </div>

      {/* 다가오는 정기 모임 캘린더 */}
      {filteredGroups.length > 0 && (
        <div style={{ margin: '0 16px 16px', background: '#f9f9f9', borderRadius: 14, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={S.sectionTitle}>다가오는 정기 모임</div>
            <span style={{ fontSize: 13, color: '#999' }}>2026년 {currentMonth}월</span>
          </div>

          {/* 주간 달력 */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {WEEK_DATES.map((d, i) => (
              <div key={d} onClick={() => setFilterDate(`${currentMonth}.${d}`)} style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: currentDate === d ? GRADIENT : 'transparent', color: currentDate === d ? '#fff' : '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, margin: '0 auto 2px' }}>
                  {d}
                </div>
                <div style={{ fontSize: 11, color: '#aaa' }}>{WEEK_DAYS[i]}</div>
              </div>
            ))}
          </div>

          {filteredEvents.length > 0 ? (
            filteredEvents.map((ev, i) => (
              <div key={i} style={{ ...S.card, background: '#fff' }}>
                <div style={S.imgBox}>📅</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{ev.title}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{ev.date} · {ev.location} · {ev.attending || 0}/{ev.max || 20}명</div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '16px', color: '#999', fontSize: 13 }}>예정된 정기모임이 없습니다.</div>
          )}
        </div>
      )}
    </div>
  )
}
