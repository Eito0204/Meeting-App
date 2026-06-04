// localStorage 유틸 함수
export const storageKeys = {
  users: 'meetupUsers',
  groups: 'meetupGroups',
  currentUser: 'meetupCurrentUser',
}

export const storage = {
  // 데이터 저장
  setUsers: (users) => {
    try {
      localStorage.setItem(storageKeys.users, JSON.stringify(users))
      console.log('[Storage] Users 저장:', users.length, '명')
    } catch (error) {
      console.error('[Storage] Users 저장 실패:', error)
    }
  },

  setGroups: (groups) => {
    try {
      localStorage.setItem(storageKeys.groups, JSON.stringify(groups))
      console.log('[Storage] Groups 저장:', groups.length, '개')
    } catch (error) {
      console.error('[Storage] Groups 저장 실패:', error)
    }
  },

  setCurrentUser: (user) => {
    try {
      if (user) {
        localStorage.setItem(storageKeys.currentUser, JSON.stringify(user))
        console.log('[Storage] CurrentUser 저장:', user.id)
      } else {
        localStorage.removeItem(storageKeys.currentUser)
        console.log('[Storage] CurrentUser 제거')
      }
    } catch (error) {
      console.error('[Storage] CurrentUser 저장 실패:', error)
    }
  },

  // 데이터 로드
  getUsers: () => {
    try {
      const data = localStorage.getItem(storageKeys.users)
      const users = data ? JSON.parse(data) : []
      console.log('[Storage] Users 로드:', users.length, '명')
      return Array.isArray(users) ? users : []
    } catch (error) {
      console.error('[Storage] Users 로드 실패:', error)
      return []
    }
  },

  getGroups: () => {
    try {
      const data = localStorage.getItem(storageKeys.groups)
      const groups = data ? JSON.parse(data) : []
      console.log('[Storage] Groups 로드:', groups.length, '개')
      return Array.isArray(groups) ? groups : []
    } catch (error) {
      console.error('[Storage] Groups 로드 실패:', error)
      return []
    }
  },

  getCurrentUser: () => {
    try {
      const data = localStorage.getItem(storageKeys.currentUser)
      const user = data ? JSON.parse(data) : null
      if (user) console.log('[Storage] CurrentUser 로드:', user.id)
      return user
    } catch (error) {
      console.error('[Storage] CurrentUser 로드 실패:', error)
      return null
    }
  },

  // 전체 데이터 초기화
  clear: () => {
    try {
      localStorage.removeItem(storageKeys.users)
      localStorage.removeItem(storageKeys.groups)
      localStorage.removeItem(storageKeys.currentUser)
      console.log('[Storage] 모든 데이터 삭제됨')
    } catch (error) {
      console.error('[Storage] 초기화 실패:', error)
    }
  },

  // 저장소 상태 확인
  getStatus: () => {
    return {
      users: storage.getUsers().length,
      groups: storage.getGroups().length,
      currentUser: storage.getCurrentUser() ? '있음' : '없음',
    }
  }
}
