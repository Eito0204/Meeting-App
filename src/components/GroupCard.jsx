import { S, ACCENT } from '../constants'

export default function GroupCard({ g, onClick, onEdit, onDelete }) {
  return (
    <div style={{ ...S.card, cursor: 'pointer' }} onClick={onClick}>
      <div style={S.imgBox}>{g.img}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 3 }}>
          {g.title}
        </div>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {g.desc}
        </div>
        <div style={{ fontSize: 12, color: '#999' }}>
          <span style={{ color: ACCENT, fontWeight: 600 }}>{g.cat}</span>
          {' · '}{g.area}{' · '}{g.count}/{g.max}명
        </div>
      </div>
      {onEdit && onDelete && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={(e) => { e.stopPropagation(); onEdit(g) }} style={{ ...S.outlineBtn, fontSize: 12, padding: '4px 8px' }}>편집</button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(g.id) }} style={{ ...S.outlineBtn, fontSize: 12, padding: '4px 8px', borderColor: '#ff6b6b', color: '#ff6b6b' }}>삭제</button>
        </div>
      )}
    </div>
  )
}
