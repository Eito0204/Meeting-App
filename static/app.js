const tokenKey = "meeting_app_token";
const views = document.querySelectorAll(".view");
const viewTriggers = document.querySelectorAll("[data-view]");
const navButtons = document.querySelectorAll(".nav-button[data-view]");
const meetingList = document.querySelector("#meetingList");
const meetingCount = document.querySelector("#meetingCount");
const meetingPageList = document.querySelector("#meetingPageList");
const calendarList = document.querySelector("#calendarList");
const chatMessages = document.querySelector("#chatMessages");
const chatState = document.querySelector("#chatState");
const chatRoomTitle = document.querySelector("#chatRoomTitle");
const chatRoomListView = document.querySelector("#chatRoomListView");
const screenTitle = document.querySelector("#screenTitle");
const screenSubTitle = document.querySelector("#screenSubTitle");
const meetingDetail = document.querySelector("#meetingDetail");
const meetingSearch = document.querySelector("#meetingSearch");
const applicationList = document.querySelector("#applicationList");

let cachedMeetings = [];
let chatSocket = null;
let notifySocket = null;
let activeRoomId = 1;
let currentUser = null;
let viewHistory = [];
let notifications = [];

function setView(viewName) {
  const currentActive = document.querySelector(".view.active");
  if (currentActive && currentActive.id !== viewName) {
    viewHistory.push(currentActive.id);
  }
  views.forEach((view) => view.classList.toggle("active", view.id === viewName));
  navButtons.forEach((button) => button.classList.toggle("active", button.dataset.view === viewName));
  const currentView = document.querySelector(`#${viewName}`);
  if (currentView) {
    screenTitle.textContent = currentView.dataset.title || "이음";
    screenSubTitle.textContent = currentView.dataset.subtitle || "Team 알잘딱깔센";
  }
  const backButton = document.querySelector("#backButton");
  if (backButton) backButton.style.visibility = viewHistory.length > 0 ? "visible" : "hidden";

  if (viewName === "notifications") renderNotifications();
  if (viewName === "meetings") loadMeetingPage();
  if (viewName === "calendar") loadCalendar();
  if (viewName === "chat") loadChatView();
  if (viewName === "profile") loadApplications();
  if (viewName === "myposts") loadMyPosts();
  if (viewName === "myapplications") loadMyApplications();
  if (viewName === "editprofile") loadEditProfile();
}

document.querySelector("#backButton").addEventListener("click", () => {
  if (viewHistory.length === 0) return;
  const prev = viewHistory.pop();
  views.forEach((view) => view.classList.toggle("active", view.id === prev));
  navButtons.forEach((button) => button.classList.toggle("active", button.dataset.view === prev));
  const prevView = document.querySelector(`#${prev}`);
  if (prevView) {
    screenTitle.textContent = prevView.dataset.title || "이음";
    screenSubTitle.textContent = prevView.dataset.subtitle || "Team 알잘딱깔센";
  }
  const backButton = document.querySelector("#backButton");
  if (backButton) backButton.style.visibility = viewHistory.length > 0 ? "visible" : "hidden";
});

function authHeaders() {
  const token = localStorage.getItem(tokenKey);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function authToken() {
  return localStorage.getItem(tokenKey);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.detail || `HTTP ${response.status}`);
  }
  return data;
}

function splitInterests(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatDate(value) {
  return new Date(value).toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function meetingCard(meeting, index = 0, compact = false) {
  const joined = Math.max(meeting.approved_members || 0, 0);
  const max = Math.max(meeting.max_members || 1, 1);
  const percent = Math.min(Math.round((joined / max) * 100), 100);
  const initial = meeting.title.trim().slice(0, 1).toUpperCase();
  const gradients = [
    "linear-gradient(135deg, #2451d6, #22b496)",
    "linear-gradient(135deg, #111318, #ff6b4a)",
    "linear-gradient(135deg, #7c3aed, #06b6d4)",
    "linear-gradient(135deg, #0f766e, #f59e0b)",
  ];

  return `
    <article class="meeting-item ${compact ? "wide" : ""}" data-meeting-id="${meeting.id}" aria-label="${meeting.title}">
      <div class="meeting-cover" style="background: ${gradients[index % gradients.length]}">
        <span class="meeting-chip">${meeting.category}</span>
        <div class="meeting-avatar">${initial}</div>
      </div>
      <div>
        <h3>${meeting.title}</h3>
        <p class="meeting-description">${meeting.description}</p>
        <div class="meeting-meta">
          <span>${meeting.location}</span>
          <span>${formatDate(meeting.start_at)}</span>
          <span>${joined}/${max}명 참여 중</span>
        </div>
      </div>
      <div class="meeting-progress" aria-label="모집률 ${percent}%">
        <span style="width: ${percent}%"></span>
      </div>
    </article>
  `;
}

function emptyCard(title, description) {
  return `
    <article class="meeting-item">
      <div class="meeting-cover">
        <span class="meeting-chip">MOIUM</span>
        <div class="meeting-avatar">+</div>
      </div>
      <div>
        <h3>${title}</h3>
        <p class="meeting-description">${description}</p>
        <div class="meeting-meta"><span>모임 만들기 버튼으로 바로 시작할 수 있어요.</span></div>
      </div>
    </article>
  `;
}

function bindMeetingCards() {
  document.querySelectorAll("[data-meeting-id]").forEach((card) => {
    card.addEventListener("click", () => {
      const meeting = cachedMeetings.find((item) => String(item.id) === card.dataset.meetingId);
      if (meeting) renderMeetingDetail(meeting);
    });
  });
}

function renderMeetings(meetings) {
  meetingCount.textContent = meetings.length;
  meetingList.innerHTML = meetings.length
    ? meetings.map((meeting, index) => meetingCard(meeting, index)).join("")
    : emptyCard("아직 등록된 모임이 없습니다.", "첫 모임을 만들어 피드에 보여주세요.");
  bindMeetingCards();
}

function renderMeetingPage(meetings) {
  meetingPageList.innerHTML = meetings.length
    ? meetings.map((meeting, index) => meetingCard(meeting, index, true)).join("")
    : emptyCard("탐색할 모임이 없습니다.", "새 모임을 만들면 이곳에 카드로 표시됩니다.");
  bindMeetingCards();
}

function renderChatRooms(meetings) {
  if (!authToken()) {
    chatRoomListView.innerHTML = '<div class="empty-panel">로그인하면 참여한 모임의 채팅방을 이용할 수 있습니다.</div>';
    return;
  }
  
  if (meetings.length === 0) {
    chatRoomListView.innerHTML = '<div class="empty-panel">참여한 모임이 없습니다.</div>';
    return;
  }

  chatRoomListView.innerHTML = meetings
    .map(
      (meeting) => `
        <button class="chat-room" data-room="${meeting.id}">
          <span class="thumb"></span>
          <div>
            <strong>${meeting.title}</strong>
            <small>${meeting.category} · ${formatDate(meeting.start_at)}</small>
          </div>
        </button>
      `,
    )
    .join("");
  
  document.querySelectorAll(".chat-room").forEach((button) => {
    button.addEventListener("click", () => {
      const roomId = Number(button.dataset.room);
      const roomTitle = button.querySelector("strong").textContent;
      enterChatRoom(roomId, roomTitle);
    });
  });
}

function enterChatRoom(roomId, roomTitle) {
  activeRoomId = roomId;
  chatRoomTitle.textContent = roomTitle;
  setView("chatRoom");
  connectChat(roomId);
}

async function loadMyMeetings() {
  if (!authToken()) return [];
  try {
    return await api("/api/my-meetings");
  } catch {
    return [];
  }
}

function renderMeetingDetail(meeting) {
  const initial = meeting.title.trim().slice(0, 1).toUpperCase();
  const isOwner = currentUser && meeting.owner.id === currentUser.id;
  const isFull = meeting.approved_members >= meeting.max_members;
  meetingDetail.innerHTML = `
    <div class="detail-hero">${initial}</div>
    <div>
      <span class="meeting-chip">${meeting.category}</span>
      ${isFull ? '<span class="meeting-chip" style="background:rgba(244,63,94,0.85);">마감</span>' : ''}
      <h2>${meeting.title}</h2>
    </div>
    <p>${meeting.description}</p>
    <div class="meeting-meta">
      <span>장소 ${meeting.location}</span>
      <span>일정 ${formatDate(meeting.start_at)}</span>
      <span>참여 ${meeting.approved_members}/${meeting.max_members}명</span>
    </div>
    ${isOwner ? `
      <button class="primary-button" type="button" id="editMeetingButton" data-id="${meeting.id}">모임 수정</button>
      <button class="primary-button" type="button" id="manageMembersButton" data-id="${meeting.id}">참여인원 관리</button>
      <button class="primary-button" type="button" id="deleteMeetingButton" data-id="${meeting.id}" style="background:#f43f5e;">모임 삭제</button>
    ` : `
      ${!isFull ? '<button class="primary-button" type="button" id="applyMeetingButton">참여 신청</button>' : '<button class="primary-button" type="button" disabled style="background:#94a3b8;">모집 마감</button>'}
    `}
    <p class="status-text" id="applyStatus"></p>
    <div id="membersList"></div>
    <div id="publicMembersList"></div>
  `;
  
  if (isOwner) {
    document.querySelector("#editMeetingButton")?.addEventListener("click", () => {
      const mid = Number(document.querySelector("#editMeetingButton").dataset.id);
      loadEditMeeting(mid, meeting);
    });
    document.querySelector("#manageMembersButton")?.addEventListener("click", async () => {
      const meetingId = Number(document.querySelector("#manageMembersButton").dataset.id);
      await loadMembers(meetingId);
    });
    document.querySelector("#deleteMeetingButton")?.addEventListener("click", async () => {
      const meetingId = Number(document.querySelector("#deleteMeetingButton").dataset.id);
      if (!confirm("정말 이 모임을 삭제하시겠습니까?")) return;
      try {
        await api(`/api/meetings/${meetingId}`, { method: "DELETE" });
        viewHistory = [];
        await loadMeetings();
        setView("meetings");
      } catch (error) {
        alert(error.message);
      }
    });
  } else {
    // 참여인원 공개 표시
    api(`/api/meetings/${meeting.id}/members/all`).then(members => {
      const el = document.querySelector("#publicMembersList");
      if (!el || !members.length) return;
      el.innerHTML = `<div style="padding:10px 0;"><strong style="font-size:13px;">참여인원 ${members.length}명</strong><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">${members.map(m => `<span style="background:var(--primary-light);color:var(--primary);padding:4px 10px;border-radius:999px;font-size:12px;font-weight:700;">${m.user.name}</span>`).join('')}</div></div>`;
    }).catch(() => {});
    document.querySelector("#applyMeetingButton")?.addEventListener("click", async () => {
      const status = document.querySelector("#applyStatus");
      if (!authToken()) {
        status.textContent = "로그인 후 참여 신청할 수 있습니다.";
        setView("login");
        return;
      }
      try {
        await api(`/api/meetings/${meeting.id}/apply`, {
          method: "POST",
          body: JSON.stringify({ message: "참여하고 싶어요." }),
        });
        status.textContent = "참여 신청이 완료되었습니다. 모임장 승인을 기다려주세요.";
      } catch (error) {
        status.textContent = error.message;
      }
    });
  }

  // 모임 게시판
  const postSection = document.querySelector("#meetingPostSection");
  postSection.style.display = "block";
  const meetingPostForm = document.querySelector("#meetingPostForm");
  meetingPostForm.dataset.meetingId = meeting.id;
  loadMeetingPosts(meeting.id);

  const postForm = document.querySelector("#meetingPostForm");
  postForm.onsubmit = async (e) => {
    e.preventDefault();
    if (!authToken()) { setView("login"); return; }
    const fd = new FormData(postForm);
    const mid = Number(postForm.dataset.meetingId);
    const postStatus = document.querySelector("#meetingPostStatus");
    try {
      await api("/api/posts", {
        method: "POST",
        body: JSON.stringify({ title: fd.get("title"), content: fd.get("content"), meeting_id: mid }),
      });
      postForm.reset();
      postStatus.textContent = "";
      await loadMeetingPosts(mid);
    } catch (err) {
      postStatus.textContent = err.message;
    }
  };

  document.querySelector("#refreshMeetingPosts").onclick = () => loadMeetingPosts(meeting.id);

  setView("detail");
}

async function loadMembers(meetingId) {
  try {
    const members = await api(`/api/meetings/${meetingId}/members`);
    const membersList = document.querySelector("#membersList");
    membersList.innerHTML = `
      <h3>참여 인원 목록</h3>
      ${members.map(member => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee;">
          <span>${member.user.name} (${member.user.email})</span>
          ${member.user.id !== currentUser.id ? `
            <button onclick="removeMember(${meetingId}, ${member.user.id})" style="background: #dc2626; color: white; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer;">강퇴</button>
          ` : '<span style="color: #22b496;">모임장</span>'}
        </div>
      `).join("")}
    `;
  } catch (error) {
    alert(error.message);
  }
}

window.removeMember = async function(meetingId, userId) {
  if (!confirm("정말 이 참여자를 강퇴하시겠습니까?")) return;
  try {
    await api(`/api/meetings/${meetingId}/members/${userId}`, { method: "DELETE" });
    alert("참여자가 강퇴되었습니다.");
    await loadMembers(meetingId);
    await loadMeetings();
  } catch (error) {
    alert(error.message);
  }
}

async function loadMeetings() {
  try {
    cachedMeetings = await api("/api/meetings");
    renderMeetings(cachedMeetings);
    renderMeetingPage(cachedMeetings);
    const myMeetings = await loadMyMeetings();
    renderChatRooms(myMeetings);
  } catch (error) {
    meetingList.innerHTML = `<div class="meeting-item"><h3>불러오기 실패</h3><p>${error.message}</p></div>`;
  }
}

async function loadChatView() {
  const myMeetings = await loadMyMeetings();
  renderChatRooms(myMeetings);
}

async function loadMeetingPage() {
  if (!cachedMeetings.length) {
    await loadMeetings();
    return;
  }
  const keyword = meetingSearch?.value.trim().toLowerCase() || "";
  const location = document.querySelector("#locationSearch")?.value.trim().toLowerCase() || "";
  const filtered = cachedMeetings.filter((meeting) => {
    const matchKeyword = !keyword || [meeting.title, meeting.category, meeting.description, meeting.location].join(" ").toLowerCase().includes(keyword);
    const matchLocation = !location || meeting.location.toLowerCase().includes(location);
    return matchKeyword && matchLocation;
  });
  renderMeetingPage(filtered);
}

window.deletePost = async function(postId) {
  if (!confirm("정말 이 게시글을 삭제하시겠습니까?")) return;
  try {
    await api(`/api/posts/${postId}`, { method: "DELETE" });
    alert("게시글이 삭제되었습니다.");
    await loadPosts();
  } catch (error) {
    alert(error.message);
  }
}

async function loadMeetingPosts(meetingId) {
  const list = document.querySelector("#meetingPostList");
  try {
    const posts = await api(`/api/meetings/${meetingId}/posts`);
    list.innerHTML = posts.length
      ? posts.map(post => `
          <article class="post-item">
            <span class="thumb"></span>
            <div>
              <small>${post.author?.name || ''} · ${formatDate(post.created_at)}</small>
              <h3>${post.title}</h3>
              <p>${post.content}</p>
              ${currentUser && post.author.id === currentUser.id ? `
                <div style="margin-top:8px;display:flex;gap:6px;">
                  <button onclick="deletePost(${post.id}, ${meetingId})" style="background:#f43f5e;color:white;padding:4px 10px;border:none;border-radius:6px;cursor:pointer;font-size:12px;">삭제</button>
                </div>` : ''}
            </div>
          </article>`).join("")
      : '<div class="empty-panel">아직 게시글이 없습니다.</div>';
  } catch (e) {
    list.innerHTML = `<div class="empty-panel">${e.message}</div>`;
  }
}

window.deletePost = async function(postId, meetingId) {
  if (!confirm("정말 삭제하시겠습니까?")) return;
  try {
    await api(`/api/posts/${postId}`, { method: "DELETE" });
    await loadMeetingPosts(meetingId);
  } catch (e) {
    alert(e.message);
  }
}

function connectNotifySocket() {
  if (!authToken()) return;
  if (notifySocket) notifySocket.close();
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  notifySocket = new WebSocket(`${protocol}://${window.location.host}/ws/notify?token=${encodeURIComponent(authToken())}`);
  notifySocket.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);
    notifications.unshift(payload);
    document.querySelector("#notifyBadge").style.display = "block";
    showToast(payload.message);
  });
  notifySocket.addEventListener("close", () => {
    setTimeout(() => { if (authToken()) connectNotifySocket(); }, 3000);
  });
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.cssText = `position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:#0f172a;color:#fff;padding:12px 20px;border-radius:12px;font-size:13px;font-weight:700;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.3);max-width:320px;text-align:center;`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function renderNotifications() {
  const list = document.querySelector("#notificationList");
  document.querySelector("#notifyBadge").style.display = "none";
  list.innerHTML = notifications.length
    ? notifications.map(n => `
        <article class="application-item">
          <span class="thumb" style="background:linear-gradient(135deg,var(--primary),#8b5cf6);"></span>
          <div>
            <small>${n.type === 'approved' ? '승인' : n.type === 'rejected' ? '거절' : '신청'}</small>
            <p>${n.message}</p>
          </div>
        </article>`).join("")
    : '<div class="empty-panel">알림이 없습니다.</div>';
}

document.querySelector("#notifyButton").addEventListener("click", () => setView("notifications"));

function loadEditMeeting(meetingId, meeting) {
  meetingDetail.innerHTML = `
    <form id="editMeetingForm" class="form-screen">
      <label>모임명<input name="title" value="${meeting.title}" required /></label>
      <label>소개<textarea name="description" required>${meeting.description}</textarea></label>
      <label>장소<input name="location" value="${meeting.location}" required /></label>
      <label>최대 인원<input name="max_members" type="number" min="2" value="${meeting.max_members}" required /></label>
      <button class="primary-button" type="submit">저장</button>
      <p id="editMeetingStatus" class="status-text"></p>
    </form>
  `;
  document.querySelector("#editMeetingForm").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await api(`/api/meetings/${meetingId}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: fd.get("title"),
          description: fd.get("description"),
          location: fd.get("location"),
          max_members: Number(fd.get("max_members")),
        }),
      });
      await loadMeetings();
      viewHistory.pop();
      setView("meetings");
    } catch (err) {
      document.querySelector("#editMeetingStatus").textContent = err.message;
    }
  };
}

async function loadMyApplications() {
  const list = document.querySelector("#myApplicationList");
  if (!authToken()) {
    list.innerHTML = '<div class="empty-panel">로그인 후 확인할 수 있습니다.</div>';
    return;
  }
  try {
    const apps = await api("/api/applications/my");
    list.innerHTML = apps.length
      ? apps.map(a => `
        <article class="application-item">
          <span class="thumb"></span>
          <div>
            <small>${a.meeting_title}</small>
            <h3>${a.meeting_title}</h3>
            <p>${a.message || '신청 메시지 없음'}</p>
            <span style="display:inline-block;margin-top:6px;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;background:${
              a.status === 'approved' ? '#d1fae5' : a.status === 'rejected' ? '#fee2e2' : '#e0e7ff'
            };color:${
              a.status === 'approved' ? '#059669' : a.status === 'rejected' ? '#f43f5e' : '#6366f1'
            };">${applicationStatusLabel(a.status)}</span>
          </div>
        </article>`).join("")
      : '<div class="empty-panel">신청한 모임이 없습니다.</div>';
  } catch (e) {
    list.innerHTML = `<div class="empty-panel">${e.message}</div>`;
  }
}

async function loadEditProfile() {
  if (!currentUser) return;
  const form = document.querySelector("#editProfileForm");
  form.name.value = currentUser.name || '';
  form.bio.value = currentUser.bio || '';
  form.interests.value = currentUser.interests?.map(i => i.name).join(', ') || '';
}

document.querySelector("#editProfileForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  const statusEl = document.querySelector("#editProfileStatus");
  try {
    currentUser = await api("/api/users/me", {
      method: "PATCH",
      body: JSON.stringify({
        name: fd.get("name"),
        bio: fd.get("bio"),
        interests: splitInterests(fd.get("interests") || ""),
      }),
    });
    updateProfile();
    statusEl.textContent = "저장되었습니다.";
  } catch (err) {
    statusEl.textContent = err.message;
  }
});

document.querySelector("#logoutButton")?.addEventListener("click", () => {
  localStorage.removeItem(tokenKey);
  currentUser = null;
  updateProfile();
  loadMeetings();
  setView("home");
});

async function loadMyPosts() {
  const myPostList = document.querySelector("#myPostList");
  const myPostsCount = document.querySelector("#myPostsCount");
  const deleteBtn = document.querySelector("#deleteSelectedPosts");
  if (!authToken()) {
    myPostList.innerHTML = '<div class="empty-panel">로그인 후 확인할 수 있습니다.</div>';
    return;
  }
  try {
    const posts = await api("/api/my-posts");
    myPostsCount.textContent = `${posts.length}개의 글`;
    if (posts.length === 0) {
      myPostList.innerHTML = '<div class="empty-panel">작성한 게시글이 없습니다.</div>';
      deleteBtn.style.display = "none";
      return;
    }
    deleteBtn.style.display = "block";
    myPostList.innerHTML = posts.map(post => `
      <article class="post-item" style="position: relative;">
        <label style="position: absolute; top: 12px; right: 12px; cursor: pointer;">
          <input type="checkbox" class="post-checkbox" data-post-id="${post.id}" style="width: 18px; height: 18px; accent-color: var(--primary);">
        </label>
        <span class="thumb"></span>
        <div>
          <small>${post.meeting_title || '일반 게시판'} · ${formatDate(post.created_at)}</small>
          <h3>${post.title}</h3>
          <p>${post.content}</p>
        </div>
      </article>
    `).join("");

    deleteBtn.onclick = async () => {
      const checked = [...document.querySelectorAll(".post-checkbox:checked")];
      if (checked.length === 0) { alert("삭제할 게시글을 선택해주세요."); return; }
      if (!confirm(`${checked.length}개의 게시글을 삭제하시겠습니까?`)) return;
      await Promise.all(checked.map(cb => api(`/api/posts/${cb.dataset.postId}`, { method: "DELETE" })));
      await loadMyPosts();
    };
  } catch (error) {
    myPostList.innerHTML = `<div class="empty-panel">${error.message}</div>`;
  }
}

function applicationStatusLabel(status) {
  if (status === "approved") return "승인됨";
  if (status === "rejected") return "거절됨";
  return "대기중";
}

async function decideApplication(applicationId, status) {
  await api(`/api/applications/${applicationId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  await loadApplications();
  await loadMeetings();
}

async function loadApplications() {
  if (!applicationList) return;
  if (!authToken()) {
    applicationList.innerHTML = '<div class="empty-panel">로그인하면 내가 만든 모임의 신청 알림이 표시됩니다.</div>';
    return;
  }

  try {
    const applications = await api("/api/applications/inbox");
    applicationList.innerHTML = applications.length
      ? applications
          .map(
            (application) => `
              <article class="application-item">
                <span class="thumb"></span>
                <div>
                  <small>${application.meeting_title} · ${applicationStatusLabel(application.status)}</small>
                  <h3>${application.user.name}님의 참여 신청</h3>
                  <p>${application.message || "참여 신청 메시지가 없습니다."}</p>
                  ${
                    application.status === "pending"
                      ? `<div class="application-actions">
                          <button data-application-id="${application.id}" data-decision="approved">승인</button>
                          <button data-application-id="${application.id}" data-decision="rejected">거절</button>
                        </div>`
                      : ""
                  }
                </div>
              </article>
            `,
          )
          .join("")
      : '<div class="empty-panel">아직 들어온 참여 신청이 없습니다.</div>';

    applicationList.querySelectorAll("[data-application-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        await decideApplication(button.dataset.applicationId, button.dataset.decision);
      });
    });
  } catch (error) {
    applicationList.innerHTML = `<div class="empty-panel">${error.message}</div>`;
  }
}

async function loadCalendar() {
  if (!authToken()) {
    calendarList.innerHTML = '<div class="empty-panel">로그인하면 내가 속한 모임의 일정을 확인할 수 있습니다.</div>';
    return;
  }
  try {
    const meetings = await api("/api/calendar");
    calendarList.innerHTML = meetings.length
      ? meetings
          .map(
            (meeting) => `
              <article class="calendar-item">
                <time>${formatDate(meeting.start_at)}</time>
                <div>
                  <h3>${meeting.title}</h3>
                  <p>${meeting.category} · ${meeting.location}</p>
                </div>
                <strong>${meeting.approved_members}/${meeting.max_members}</strong>
              </article>
            `,
          )
          .join("")
      : '<div class="empty-panel">내가 속한 모임의 일정이 없습니다.</div>';
  } catch (error) {
    calendarList.innerHTML = `<div class="empty-panel">${error.message}</div>`;
  }
}

function addChatMessage(sender, content, mine = false) {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${mine ? "mine" : ""}`;
  bubble.innerHTML = `<strong>${sender}</strong><p>${content}</p>`;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function loadChatHistory(roomId) {
  try {
    const messages = await api(`/api/meetings/${roomId}/messages`);
    chatMessages.innerHTML = "";
    messages.forEach((message) => {
      addChatMessage(
        message.sender?.name || "참여자",
        message.content,
        currentUser?.id === message.sender?.id,
      );
    });
  } catch {
    chatMessages.innerHTML = "";
  }
}

async function connectChat(roomId) {
  if (chatSocket) chatSocket.close();
  activeRoomId = roomId;
  chatMessages.innerHTML = "";
  if (!authToken()) {
    chatState.textContent = "로그인 필요";
    addChatMessage("이음", "로그인하면 팀원들과 실시간 채팅할 수 있습니다.");
    return;
  }

  chatState.textContent = "연결 중";
  await loadChatHistory(roomId);

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  chatSocket = new WebSocket(
    `${protocol}://${window.location.host}/ws/meetings/${roomId}/chat?token=${encodeURIComponent(authToken())}`,
  );
  chatSocket.addEventListener("open", () => {
    chatState.textContent = "연결됨";
  });
  chatSocket.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);
    addChatMessage(payload.sender || "참여자", payload.content || "", payload.sender === currentUser?.name);
  });
  chatSocket.addEventListener("close", () => {
    chatState.textContent = "연결 종료";
  });
}

viewTriggers.forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

document.querySelector("#refreshApplications")?.addEventListener("click", loadApplications);
meetingSearch?.addEventListener("input", loadMeetingPage);
document.querySelector("#locationSearch")?.addEventListener("input", loadMeetingPage);

navButtons.forEach((button) => {
  if (button.dataset.view === "home") {
    button.addEventListener("click", () => {
      loadMeetings();
    });
  }
});

document.querySelector("#signupForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const status = document.querySelector("#authStatus");
  try {
    await api("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        bio: form.get("bio"),
        interests: splitInterests(form.get("interests") || ""),
      }),
    });
    const data = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    localStorage.setItem(tokenKey, data.access_token);
    currentUser = await api("/api/users/me");
    updateProfile();
    status.textContent = "회원가입과 로그인이 완료되었습니다.";
    event.currentTarget.reset();
    await loadMeetings();
    await loadApplications();
    setView("home");
  } catch (error) {
    status.textContent = error.message;
  }
});

document.querySelector("#loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const status = document.querySelector("#authStatus");
  try {
    const data = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    localStorage.setItem(tokenKey, data.access_token);
    currentUser = await api("/api/users/me");
    status.textContent = "로그인되었습니다.";
    updateProfile();
    await loadMeetings();
    await loadApplications();
    connectNotifySocket();
    setView("home");
  } catch (error) {
    status.textContent = error.message;
  }
});

document.querySelector("#meetingForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const status = document.querySelector("#meetingStatus");
  if (!authToken()) {
    status.textContent = "로그인 후 모임을 만들 수 있습니다.";
    setView("login");
    return;
  }
  const category = formData.get("category");
  if (!category) {
    status.textContent = "카테고리를 선택해주세요.";
    return;
  }
  try {
    await api("/api/meetings", {
      method: "POST",
      body: JSON.stringify({
        title: formData.get("title"),
        description: formData.get("description"),
        category: category,
        location: formData.get("location"),
        max_members: Number(formData.get("max_members")),
        start_at: new Date(formData.get("start_at")).toISOString(),
      }),
    });
    status.textContent = "모임이 등록되었습니다.";
    form.reset();
    await loadMeetings();
    setView("meetings");
  } catch (error) {
    status.textContent = error.message;
  }
});

document.querySelector("#chatForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const content = form.get("content");
  if (!authToken()) {
    addChatMessage("이음", "로그인 후 채팅할 수 있습니다.");
    return;
  }
  if (!content || !chatSocket || chatSocket.readyState !== WebSocket.OPEN) return;
  chatSocket.send(JSON.stringify({ content }));
  event.currentTarget.reset();
});

function updateProfile() {
  document.querySelector("#profileName").textContent = currentUser?.name || "게스트";
  document.querySelector("#profileEmail").textContent = currentUser?.email || "로그인 후 추천을 받을 수 있어요.";
}

async function restoreSession() {
  if (!authToken()) {
    updateProfile();
    await loadMeetings();
    return;
  }
  try {
    currentUser = await api("/api/users/me");
  } catch {
    localStorage.removeItem(tokenKey);
    currentUser = null;
  }
  updateProfile();
  await loadMeetings();
  await loadApplications();
  connectNotifySocket();
}

restoreSession();

document.querySelector("#backButton").style.visibility = "hidden";
