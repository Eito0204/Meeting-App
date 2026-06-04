import { useState, useEffect } from 'react'
import NavBar from './components/NavBar'
import { storage } from './utils/storage'

import LoginScreen        from './screens/LoginScreen'
import SignupScreen       from './screens/SignupScreen'
import ProfileSetupScreen from './screens/ProfileSetupScreen'
import HomeScreen         from './screens/HomeScreen'
import CategoryScreen     from './screens/CategoryScreen'
import MyGroupsScreen     from './screens/MyGroupsScreen'
import ProfileScreen      from './screens/ProfileScreen'
import GroupDetailScreen  from './screens/GroupDetailScreen'
import SearchScreen       from './screens/SearchScreen'
import NotificationsScreen from './screens/NotificationsScreen'
import CreateGroupScreen  from './screens/CreateGroupScreen'
import SettingsScreen     from './screens/SettingsScreen'

// 하단 탭바가 있는 메인 화면 목록
const TAB_SCREENS = {
  home:      HomeScreen,
  category:  CategoryScreen,
  mygroups:  MyGroupsScreen,
  profile:   ProfileScreen,
}

export default function App() {
  // 사용자 관리
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [groups, setGroups] = useState([])

  // UI 상태
  const [screen, setScreen]             = useState('login')
  const [selectedGroup, setSelectedGroup] = useState(null)

  // 필터 상태
  const [filterArea, setFilterArea] = useState('')
  const [filterCat, setFilterCat] = useState(null)
  const [filterDate, setFilterDate] = useState(null)

  // localStorage에서 데이터 로드 (마운트 시)
  useEffect(() => {
    console.log('[App] 마운트됨')
    const loadedUsers = storage.getUsers()
    const loadedGroups = storage.getGroups()
    const loadedCurrentUser = storage.getCurrentUser()

    setUsers(loadedUsers)
    setGroups(loadedGroups)
    
    if (loadedCurrentUser) {
      setCurrentUser(loadedCurrentUser)
      setScreen('home')
    }
    
    console.log('[App] 초기화 상태:', storage.getStatus())
  }, [])

  // users 변경 시 localStorage에 저장
  useEffect(() => {
    storage.setUsers(users)
  }, [users])

  // groups 변경 시 localStorage에 저장
  useEffect(() => {
    storage.setGroups(groups)
  }, [groups])

  // currentUser 변경 시 localStorage에 저장
  useEffect(() => {
    storage.setCurrentUser(currentUser)
  }, [currentUser])

  // 현재 활성 탭 계산 (설정 화면은 프로필 탭에 속함)
  const activeTab = screen === 'settings' ? 'profile' : screen

  // 탭 클릭 시 해당 메인 화면으로 이동
  const handleTabChange = (tab) => setScreen(tab)

  // 탭바가 붙는 메인 화면인지 확인
  const isTabScreen = screen in TAB_SCREENS || screen === 'settings'

  const phoneStyle = {
    width: 390,
    minHeight: 844,
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    fontFamily: "'Noto Sans KR', sans-serif",
    boxShadow: '0 24px 80px rgba(120,80,200,0.18)',
    borderRadius: 40,
    overflow: 'hidden',
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh', padding: '24px 0' }}>
      <div style={phoneStyle}>

        {/* ── 비로그인 화면 ─────────────────────── */}
        {screen === 'login'        && <LoginScreen        setScreen={setScreen} users={users} setCurrentUser={setCurrentUser} />}
        {screen === 'signup'       && <SignupScreen        setScreen={setScreen} users={users} setUsers={setUsers} />}
        {screen === 'profileSetup' && <ProfileSetupScreen  setScreen={setScreen} currentUser={currentUser} setCurrentUser={setCurrentUser} />}

        {/* ── 검색 / 알림 / 생성 ────────────────── */}
        {screen === 'search'        && <SearchScreen         setScreen={setScreen} setSelectedGroup={setSelectedGroup} groups={groups} />}
        {screen === 'notifications' && <NotificationsScreen   setScreen={setScreen} groups={groups} currentUser={currentUser} />}
        {screen === 'createGroup'   && <CreateGroupScreen     setScreen={setScreen} groups={groups} setGroups={setGroups} currentUser={currentUser} />}

        {/* ── 모임 상세 ─────────────────────────── */}
        {screen === 'groupDetail' && (
          <GroupDetailScreen group={groups.find(g => g.id === selectedGroup?.id) || selectedGroup} setScreen={setScreen} groups={groups} setGroups={setGroups} currentUser={currentUser} />
        )}

        {/* ── 탭 메인 화면 ──────────────────────── */}
        {screen === 'home' && (
          <HomeScreen setScreen={setScreen} setSelectedGroup={setSelectedGroup} groups={groups} filterArea={filterArea} setFilterArea={setFilterArea} filterCat={filterCat} setFilterCat={setFilterCat} filterDate={filterDate} setFilterDate={setFilterDate} />
        )}
        {screen === 'category' && (
          <CategoryScreen setScreen={setScreen} setSelectedGroup={setSelectedGroup} groups={groups} />
        )}
        {screen === 'mygroups' && (
          <MyGroupsScreen setScreen={setScreen} setSelectedGroup={setSelectedGroup} groups={groups} setGroups={setGroups} currentUser={currentUser} />
        )}
        {screen === 'profile' && (
          <ProfileScreen setScreen={setScreen} currentUser={currentUser} />
        )}
        {screen === 'settings' && (
          <SettingsScreen setScreen={setScreen} setCurrentUser={setCurrentUser} />
        )}

        {/* ── 하단 탭바 (메인 화면에만 표시) ──────── */}
        {isTabScreen && (
          <NavBar tab={activeTab} setTab={handleTabChange} />
        )}
      </div>
    </div>
  )
}
