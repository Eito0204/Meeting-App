import { S, ACCENT } from '../constants'
import GroupCard from '../components/GroupCard'

const MY_CATEGORIES = ['독서', '운동', '게임', '영화']

export default function MyGroupsScreen({ setScreen, setSelectedGroup, groups, setGroups, currentUser }) {
  // 현재 사용자가 만든 모임만 필터링
  const myGroups = groups.filter(g => g.creator === currentUser?.id)

  const handleEdit = (group) => {
    const newTitle = prompt('새 제목:', group.title)
    if (newTitle) {
      setGroups(groups.map(g => g.id === group.id ? { ...g, title: newTitle } : g))
    }
  }

  const handleDelete = (id) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setGroups(groups.filter(g => g.id !== id))
    }
  }

  return (
    <div style={S.page}>
      <div style={{ padding: '56px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>
          내 모임
        </div>
        <button onClick={() => setScreen('createGroup')} style={S.outlineBtn}>새 모임</button>
      </div>

      <div style={S.section}>
        {myGroups.length > 0 ? (
          myGroups.map(g => (
            <GroupCard
              key={g.id}
              g={g}
              onClick={() => { setSelectedGroup(g); setScreen('groupDetail') }}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: '#999' }}>
            만든 모임이 없습니다.
          </div>
        )}
      </div>
    </div>
  )
}
