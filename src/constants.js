// ─── 색상 ───────────────────────────────────────────────
export const GRADIENT = 'linear-gradient(135deg, #FF6B8A 0%, #9B6BF0 100%)'
export const ACCENT = '#7B5FDC'
export const PINK = '#FF6B8A'

// ─── 카테고리 ─────────────────────────────────────────────
export const categories = [
  '독서', '운동', '게임', '요리', '여행',
  '음악', '영화', '사진', '스터디', '기타',
]

export const catEmojis = [
  '📚', '🏃', '🎲', '🍳', '✈️',
  '🎵', '🎬', '📷', '📝', '✨',
]

// ─── 공통 스타일 ──────────────────────────────────────────
export const S = {
  page:         { flex: 1, overflowY: 'auto', paddingBottom: 80 },
  header:       { padding: '56px 16px 12px', display: 'flex', alignItems: 'center', gap: 10 },
  backBtn:      { fontSize: 20, cursor: 'pointer', color: '#111', background: 'none', border: 'none', padding: 4 },
  input:        { width: '100%', padding: '14px 16px', border: '1.5px solid #e0e0e0', borderRadius: 12, fontSize: 15, outline: 'none', boxSizing: 'border-box', color: '#111', background: '#fafafa' },
  gradBtn:      { width: '100%', padding: '16px', borderRadius: 30, background: GRADIENT, color: '#fff', fontSize: 17, fontWeight: 700, border: 'none', cursor: 'pointer', letterSpacing: 2 },
  outlineBtn:   { padding: '10px 20px', borderRadius: 20, background: 'transparent', color: ACCENT, fontSize: 14, fontWeight: 600, border: `1.5px solid ${ACCENT}`, cursor: 'pointer' },
  blueBtn:      { padding: '12px', borderRadius: 10, background: '#1e90ff', color: '#fff', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'center' },
  navBar:       { display: 'flex', borderTop: '1px solid #eee', background: '#fff', position: 'sticky', bottom: 0, zIndex: 10 },
  navItem:  (active) => ({ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0 14px', cursor: 'pointer', color: active ? ACCENT : '#aaa', fontSize: 11, fontWeight: active ? 700 : 400, gap: 4 }),
  card:         { background: '#fff', border: '1px solid #efefef', borderRadius: 14, padding: 14, display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 },
  imgBox:       { width: 56, height: 56, borderRadius: 10, background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 },
  chip:     (active) => ({ padding: '6px 14px', borderRadius: 20, background: active ? ACCENT : '#f4f4f4', color: active ? '#fff' : '#555', fontSize: 13, fontWeight: active ? 600 : 400, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }),
  section:      { padding: '0 16px 16px' },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 10 },
  scrollRow:    { display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' },
  catCircle: (active) => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', minWidth: 56 }),
  catDot:    (active) => ({ width: 52, height: 52, borderRadius: 26, background: active ? `linear-gradient(135deg,${PINK},${ACCENT})` : '#ececec', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }),
  catLabel:     { fontSize: 11, color: '#555', textAlign: 'center' },
  dday:         { background: '#222', color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700, display: 'inline-block' },
  tag:          { padding: '4px 10px', borderRadius: 20, background: '#f4f4f4', color: '#555', fontSize: 12, border: '1px solid #eee' },
  divider:      { height: 1, background: '#f2f2f2', margin: '12px 0' },
}
