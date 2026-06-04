import { useState, useEffect, useRef } from 'react'
import { S, ACCENT, GRADIENT } from '../constants'

const PHOTO_EMOJIS = ['🌸','🌿','🎨','🍀','🌈','🌻','🦋','🍁','⛅']

export default function GroupDetailScreen({ group, setScreen, groups, setGroups, currentUser }) {
  // 항상 최신 그룹 데이터 사용
  const g = group
  
  const [joined, setJoined] = useState(false)
  const [detailTab, setDetailTab] = useState('홈')
  const [showEventForm, setShowEventForm] = useState(false)
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    location: '',
    max: 20,
    attending: 0,
  })
  
  // 게시판 상태
  const [showPostForm, setShowPostForm] = useState(false)
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
  })
  
  // 채팅 상태
  const [chatMessage, setChatMessage] = useState('')
  const chatEndRef = useRef(null)
  
  // 사진 상태
  const [showPhotoForm, setShowPhotoForm] = useState(false)
  const [photoEmoji, setPhotoEmoji] = useState(PHOTO_EMOJIS[0])
  
  // 채팅 메시지가 추가될 때 자동 스크롤
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [g?.chat?.length])

  if (!g) return <div style={{ ...S.page, textAlign: 'center', padding: '100px 16px' }}>모임을 찾을 수 없습니다.</div>

  const isCreator = currentUser && g.creator === currentUser.id
  const TABS = ['홈', '게시판', '사진', '채팅']

  const handleCreateEvent = () => {
    if (!eventForm.title || !eventForm.date || !eventForm.location) {
      alert('모든 필드를 입력해주세요.')
      return
    }

    const updatedGroups = groups.map(grp => {
      if (grp.id === g.id) {
        return {
          ...grp,
          events: [
            ...(grp.events || []),
            { ...eventForm, id: Date.now(), createdAt: new Date().toISOString() }
          ]
        }
      }
      return grp
    })

    setGroups(updatedGroups)
    setShowEventForm(false)
    setEventForm({ title: '', date: '', location: '', max: 20, attending: 0 })
  }
  
  // 게시글 작성
  const handleCreatePost = () => {
    if (!postForm.title || !postForm.content) {
      alert('제목과 내용을 입력해주세요.')
      return
    }

    const updatedGroups = groups.map(grp => {
      if (grp.id === g.id) {
        return {
          ...grp,
          posts: [
            ...(grp.posts || []),
            {
              id: Date.now(),
              author: currentUser?.nickname || currentUser?.id,
              title: postForm.title,
              content: postForm.content,
              createdAt: new Date().toISOString(),
            }
          ]
        }
      }
      return grp
    })

    setGroups(updatedGroups)
    setShowPostForm(false)
    setPostForm({ title: '', content: '' })
  }
  
  // 채팅 메시지 전송
  const handleSendChat = () => {
    if (!chatMessage.trim()) return

    const updatedGroups = groups.map(grp => {
      if (grp.id === g.id) {
        return {
          ...grp,
          chat: [
            ...(grp.chat || []),
            {
              id: Date.now(),
              author: currentUser?.nickname || currentUser?.id,
              message: chatMessage,
              createdAt: new Date().toISOString(),
            }
          ]
        }
      }
      return grp
    })

    setGroups(updatedGroups)
    setChatMessage('')
  }

  return (
    <div style={{ ...S.page, paddingBottom: 0 }}>
      {/* 헤더 */}
      <div style={{ padding: '56px 16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button style={S.backBtn} onClick={() => setScreen('home')}>←</button>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#111' }}>{g.title}</div>
      </div>

      {/* 탭바 */}
      <div style={{ display: 'flex', borderBottom: '1px solid #eee', margin: '12px 16px 0' }}>
        {TABS.map(t => (
          <div
            key={t}
            onClick={() => setDetailTab(t)}
            style={{ flex: 1, textAlign: 'center', padding: '10px 0', fontSize: 14, fontWeight: detailTab === t ? 700 : 400, color: detailTab === t ? ACCENT : '#aaa', borderBottom: detailTab === t ? `2px solid ${ACCENT}` : '2px solid transparent', cursor: 'pointer' }}
          >
            {t}
          </div>
        ))}
      </div>

      {/* ── 홈 탭 ─────────────────────────────────── */}
      {detailTab === '홈' && (
        <div style={{ overflowY: 'auto', paddingBottom: 40 }}>
          {/* 대표 이미지 */}
          <div style={{ margin: 16, background: '#f5f5f5', borderRadius: 14, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
            {g.img}
          </div>

          {/* 태그 */}
          <div style={{ padding: '0 16px', display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={S.tag}>{g.area}</span>
            <span style={S.tag}>{g.cat}</span>
            <span style={S.tag}>인원 {g.count}/{g.max}명</span>
          </div>

          {/* 제목 & 설명 */}
          <div style={{ padding: '0 16px 12px' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 4 }}>{g.title}</div>
            <div style={{ fontSize: 14, color: '#555', lineHeight: 1.6 }}>{g.desc}</div>
          </div>

          <div style={S.divider} />

          {/* 정기모임 섹션 */}
          <div style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>정기모임</div>
              {isCreator && (
                <button
                  onClick={() => setShowEventForm(!showEventForm)}
                  style={{ ...S.outlineBtn, fontSize: 13, padding: '6px 14px' }}
                >
                  {showEventForm ? '취소' : '만들기'}
                </button>
              )}
            </div>

            {/* 정기모임 생성 폼 */}
            {showEventForm && isCreator && (
              <div style={{ background: '#f9f9f9', borderRadius: 12, padding: 14, marginBottom: 14 }}>
                <input
                  style={S.input}
                  placeholder="정기모임 제목"
                  value={eventForm.title}
                  onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                />
                <input
                  style={S.input}
                  placeholder="날짜 (예: 5.25)"
                  value={eventForm.date}
                  onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                />
                <input
                  style={S.input}
                  placeholder="장소"
                  value={eventForm.location}
                  onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                />
                <input
                  style={S.input}
                  type="number"
                  placeholder="정원"
                  value={eventForm.max}
                  onChange={e => setEventForm({ ...eventForm, max: parseInt(e.target.value) || 20 })}
                />
                <button onClick={handleCreateEvent} style={S.gradBtn}>생성</button>
              </div>
            )}

            {/* 정기모임 목록 */}
            {(g.events || []).length > 0 ? (
              (g.events || []).map((ev, i) => (
                <div key={ev.id || i} style={{ border: '1px solid #eee', borderRadius: 12, padding: 14, marginBottom: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 8 }}>{ev.title}</div>
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>📅 {ev.date}</div>
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>📍 {ev.location}</div>
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 10 }}>👥 {ev.attending || 0}/{ev.max}명 참석중</div>
                  <button style={S.blueBtn}>{joined ? '참가완료' : '참가'}</button>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999', fontSize: 13 }}>
                아직 정기모임이 없습니다.
              </div>
            )}
          </div>

          <div style={S.divider} />

          {/* 가입하기 버튼 */}
          {!joined && (
            <div style={{ padding: '16px' }}>
              <button onClick={() => setJoined(true)} style={S.gradBtn}>모임 참가</button>
            </div>
          )}
        </div>
      )}

      {/* ── 게시판 탭 ───────────────────────────── */}
      {detailTab === '게시판' && (
        <div style={{ overflowY: 'auto', paddingBottom: 40 }}>
          {/* 게시글 작성 버튼 */}
          <div style={{ padding: '12px 16px' }}>
            <button
              onClick={() => setShowPostForm(!showPostForm)}
              style={S.gradBtn}
            >
              {showPostForm ? '취소' : '게시글 작성'}
            </button>
          </div>

          {/* 게시글 작성 폼 */}
          {showPostForm && (
            <div style={{ padding: '0 16px 16px' }}>
              <div style={{ background: '#f9f9f9', borderRadius: 12, padding: 14 }}>
                <input
                  style={S.input}
                  placeholder="제목"
                  value={postForm.title}
                  onChange={e => setPostForm({ ...postForm, title: e.target.value })}
                />
                <textarea
                  style={{ ...S.input, minHeight: 100, resize: 'none', marginTop: 10 }}
                  placeholder="내용"
                  value={postForm.content}
                  onChange={e => setPostForm({ ...postForm, content: e.target.value })}
                />
                <button
                  onClick={handleCreatePost}
                  style={{ ...S.gradBtn, marginTop: 10 }}
                >
                  등록
                </button>
              </div>
            </div>
          )}

          {/* 게시글 목록 */}
          <div style={{ padding: '0 16px' }}>
            {(g.posts || []).length > 0 ? (
              (g.posts || []).map(post => (
                <div key={post.id} style={{ ...S.card, marginBottom: 12, background: '#fafafa', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{post.title}</div>
                  <div style={{ fontSize: 13, color: '#555' }}>{post.content}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>
                    {post.author} · {new Date(post.createdAt).toLocaleString('ko-KR')}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: '#999' }}>
                아직 게시글이 없습니다.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 채팅 탭 ───────────────────────────── */}
      {detailTab === '채팅' && (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
          {/* 채팅 메시지 목록 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {(g.chat || []).length > 0 ? (
              (g.chat || []).map((msg, idx) => (
                <div key={msg.id || idx} style={{ marginBottom: 12, display: 'flex', flexDirection: msg.author === currentUser?.nickname || msg.author === currentUser?.id ? 'row-reverse' : 'row', gap: 8 }}>
                  <div style={{
                    background: msg.author === currentUser?.nickname || msg.author === currentUser?.id ? ACCENT : '#efefef',
                    color: msg.author === currentUser?.nickname || msg.author === currentUser?.id ? '#fff' : '#111',
                    borderRadius: 12,
                    padding: '10px 14px',
                    maxWidth: '70%',
                    wordWrap: 'break-word'
                  }}>
                    <div style={{ fontSize: 13 }}>{msg.message}</div>
                    <div style={{ fontSize: 11, color: msg.author === currentUser?.nickname || msg.author === currentUser?.id ? 'rgba(255,255,255,0.6)' : '#999', marginTop: 4 }}>
                      {new Date(msg.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: '#999', paddingTop: 40 }}>
                아직 채팅 메시지가 없습니다.
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* 채팅 입력 폼 */}
          <div style={{ padding: 12, borderTop: '1px solid #eee', display: 'flex', gap: 8 }}>
            <input
              style={{ ...S.input, margin: 0, padding: '12px 14px' }}
              placeholder="메시지 입력..."
              value={chatMessage}
              onChange={e => setChatMessage(e.target.value)}
              onKeyPress={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendChat()
                }
              }}
            />
            <button
              onClick={handleSendChat}
              style={{ ...S.outlineBtn, padding: '10px 20px', minWidth: 'auto' }}
            >
              보내기
            </button>
          </div>
        </div>
      )}

      {/* ── 사진 탭 ───────────────────────────── */}
      {detailTab === '사진' && (
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 40 }}>
          {/* 사진 추가 버튼 (모임 개설자만) */}
          {isCreator && (
            <div style={{ padding: '12px 16px' }}>
              <button
                onClick={() => setShowPhotoForm(!showPhotoForm)}
                style={S.gradBtn}
              >
                {showPhotoForm ? '취소' : '사진 추가'}
              </button>
            </div>
          )}

          {/* 사진 추가 폼 */}
          {showPhotoForm && isCreator && (
            <div style={{ padding: '0 16px 16px' }}>
              <div style={{ background: '#f9f9f9', borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 10 }}>사진 선택</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
                  {PHOTO_EMOJIS.map(emoji => (
                    <div
                      key={emoji}
                      onClick={() => setPhotoEmoji(emoji)}
                      style={{
                        aspectRatio: '1',
                        background: photoEmoji === emoji ? ACCENT : '#f0f0f0',
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 28,
                        cursor: 'pointer',
                        border: photoEmoji === emoji ? `3px solid ${ACCENT}` : '1px solid #ddd',
                      }}
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const updatedGroups = groups.map(grp => {
                      if (grp.id === g.id) {
                        return {
                          ...grp,
                          photos: [
                            ...(grp.photos || []),
                            { id: Date.now(), emoji: photoEmoji, createdAt: new Date().toISOString() }
                          ]
                        }
                      }
                      return grp
                    })
                    setGroups(updatedGroups)
                    setShowPhotoForm(false)
                  }}
                  style={S.gradBtn}
                >
                  추가
                </button>
              </div>
            </div>
          )}

          {/* 사진 목록 */}
          <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3 }}>
            {(g.photos || []).length > 0 ? (
              (g.photos || []).map((photo, i) => (
                <div
                  key={photo.id}
                  style={{
                    aspectRatio: '1',
                    background: `hsl(${i * 25},30%,88%)`,
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28
                  }}
                >
                  {photo.emoji}
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 16px', color: '#999' }}>
                아직 사진이 없습니다.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
