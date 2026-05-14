let currentUser = null
let currentProjectId = null
let currentThreadId = null

async function doLogin() {
  const email = document.getElementById('login-email').value
  const password = document.getElementById('login-pass').value
  const res = await fetch('/sessions/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  const data = await res.json()
  if (!res.ok) return showToast(data.xeta, 'error')
  await loadCurrentUser()
  showApp()
}

async function doRegister() {
  const name = document.getElementById('reg-name').value
  const email = document.getElementById('reg-email').value
  const password = document.getElementById('reg-pass').value
  const res = await fetch('/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  })
  const data = await res.json()
  if (!res.ok) return showToast(data.xeta, 'error')
  showToast('Qeydiyyat uğurlu! Daxil olun.')
  switchAuth('login')
}

async function doLogout() {
  await fetch('/sessions/logout', { method: 'DELETE' })
  currentUser = null
  document.getElementById('app-screen').style.display = 'none'
  document.getElementById('auth-screen').style.display = 'flex'
}

async function loadCurrentUser() {
  const res = await fetch('/sessions/me')
  if (!res.ok) return
  currentUser = await res.json()
}

function showApp() {
  document.getElementById('auth-screen').style.display = 'none'
  document.getElementById('app-screen').style.display = 'block'
  document.getElementById('nav-name').textContent = currentUser.name
  const badge = document.getElementById('nav-admin-badge')
  badge.style.display = currentUser.isAdmin ? 'inline' : 'none'


  const tabs = document.querySelectorAll('#main-tabs .tab-btn')
  tabs.forEach(btn => {
    if (btn.textContent.trim() === 'İstifadəçilər') {
      btn.style.display = currentUser.isAdmin ? 'inline-block' : 'none'
    }
  })

  loadProjects()
}

function switchAuth(tab) {
  document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none'
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none'
  document.querySelectorAll('#auth-screen .tab-btn').forEach((b, i) => {
    b.classList.toggle('active', (tab === 'login' && i === 0) || (tab === 'register' && i === 1))
  })
}

function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'))
  document.getElementById('section-' + name).classList.add('active')
  document.querySelectorAll('#main-tabs .tab-btn').forEach(b => b.classList.remove('active'))
  event.target.classList.add('active')
  if (name === 'users') loadUsers()
  if (name === 'projects') loadProjects()
}

async function loadProjects() {
  const res = await fetch('/projects')
  const projects = await res.json()
  const list = document.getElementById('project-list')
  if (!projects.length) return list.innerHTML = '<div class="empty">Proyekt yoxdur</div>'
  list.innerHTML = projects.map(p => `
    <div class="item">
      <div>
        <b>${p.title}</b>
        <small>${p.description || ''}</small>
      </div>
      <div class="item-actions">
        <button class="btn btn-sm" onclick="showProject(${p.id})">Bax</button>
        <button class="btn btn-sm" onclick="openEdit(${p.id}, '${escStr(p.title)}', '${escStr(p.description || '')}')">Redaktə</button>
        <button class="btn btn-danger btn-sm" onclick="deleteProject(${p.id})">Sil</button>
      </div>
    </div>
  `).join('')
}

async function createProject() {
  const title = document.getElementById('proj-title').value
  const description = document.getElementById('proj-desc').value
  const res = await fetch('/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description })
  })
  const data = await res.json()
  if (!res.ok) return showToast(data.xeta, 'error')
  showToast('Proyekt yaradıldı!')
  document.getElementById('proj-title').value = ''
  document.getElementById('proj-desc').value = ''
  showSection('projects')
  loadProjects()
}

function openEdit(id, title, description) {
  document.getElementById('edit-proj-id').value = id
  document.getElementById('edit-proj-title').value = title
  document.getElementById('edit-proj-desc').value = description
  document.getElementById('edit-modal').style.display = 'flex'
}
function closeEdit() { document.getElementById('edit-modal').style.display = 'none' }

async function saveEdit() {
  const id = document.getElementById('edit-proj-id').value
  const title = document.getElementById('edit-proj-title').value
  const description = document.getElementById('edit-proj-desc').value
  const res = await fetch(`/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description })
  })
  const data = await res.json()
  if (!res.ok) return showToast(data.xeta, 'error')
  showToast('Yadda saxlanıldı!')
  closeEdit()
  loadProjects()
}

async function deleteProject(id) {
  const confirm = await Swal.fire({
    title: 'Silmək istəyirsən?', icon: 'warning',
    showCancelButton: true, confirmButtonText: 'Bəli, sil', cancelButtonText: 'Ləğv et'
  })
  if (!confirm.isConfirmed) return
  const res = await fetch(`/projects/${id}`, { method: 'DELETE' })
  const data = await res.json()
  if (!res.ok) return showToast(data.xeta, 'error')
  showToast('Silindi!')
  loadProjects()
}

async function showProject(id) {
  currentProjectId = id
  const res = await fetch(`/projects/${id}`)
  const p = await res.json()

  document.getElementById('show-proj-title').textContent = p.title
  document.getElementById('show-proj-desc').textContent = p.description || ''
  document.getElementById('show-proj-author').textContent = p.User ? p.User.name : 'Naməlum'
  document.getElementById('project-show-modal').style.display = 'flex'

  const isOwnerOrAdmin = p.userId === currentUser.id || currentUser.isAdmin

  document.getElementById('add-member-form').style.display = isOwnerOrAdmin ? 'flex' : 'none'

  document.getElementById('new-thread-form').style.display = isOwnerOrAdmin ? 'flex' : 'none'

  if (isOwnerOrAdmin) loadAllUsersForSelect(id)

  loadMembers(id)
  loadAttachments(id)
  loadThreads(id)
}

function closeProjectShow() {
  document.getElementById('project-show-modal').style.display = 'none'
}

async function loadMembers(projectId) {
  const res = await fetch(`/projects/${projectId}/members`)
  const members = await res.json()
  const projRes = await fetch(`/projects/${projectId}`)
  const proj = await projRes.json()
  const isOwner = proj.userId === currentUser.id

  document.getElementById('members-list').innerHTML = members.length
    ? members.map(m => `
        <div class="item" style="padding:6px 0">
          <span style="font-size:14px">👤 ${m.User ? m.User.name : ''}</span>
          ${isOwner ? `<button class="btn btn-danger btn-sm" onclick="removeMember(${projectId}, ${m.userId})">Sil</button>` : ''}
        </div>`).join('')
    : '<small style="color:var(--muted)">Üzv yoxdur</small>'
}
async function loadAllUsersForSelect(projectId) {
  const [usersRes, membersRes, projRes] = await Promise.all([
    fetch('/users'),
    fetch(`/projects/${projectId}/members`),
    fetch(`/projects/${projectId}`)
  ])
  const users = await usersRes.json()
  const members = await membersRes.json()
  const proj = await projRes.json()
  const memberIds = members.map(m => m.userId)
  memberIds.push(proj.userId)

  const select = document.getElementById('member-user-select')
  const filtered = users.filter(u => !memberIds.includes(u.id) && !u.isAdmin)
  select.innerHTML = filtered.length
    ? filtered.map(u => `<option value="${u.id}">${u.name}</option>`).join('')
    : '<option disabled>Əlavə ediləcək istifadəçi yoxdur</option>'
}

async function addMember() {
  const userId = document.getElementById('member-user-select').value
  if (!userId) return
  const res = await fetch(`/projects/${currentProjectId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  })
  if (!res.ok) return showToast('Xəta baş verdi', 'error')
  showToast('Üzv əlavə edildi!')
  loadMembers(currentProjectId)
  loadAllUsersForSelect(currentProjectId)
}

async function removeMember(projectId, userId) {
  await fetch(`/projects/${projectId}/members/${userId}`, { method: 'DELETE' })
  showToast('Üzv silindi!')
  loadMembers(projectId)
  loadAllUsersForSelect(projectId)
}

async function loadAttachments(projectId) {
  const res = await fetch(`/projects/${projectId}/attachments`)
  if (!res.ok) return
  const list = await res.json()
  document.getElementById('attachments-list').innerHTML = list.length
    ? list.map(a => `
        <div class="item" style="padding:6px 0">
          <span style="font-size:14px">
            📄 <a href="${a.data}" download="${a.filename}" style="color:var(--accent);text-decoration:none;font-weight:500">${a.filename}</a>
            <small style="color:var(--muted)">(${a.format})</small>
          </span>
          <button class="btn btn-danger btn-sm" onclick="deleteAttachment(${a.id})">Sil</button>
        </div>`).join('')
    : '<small style="color:var(--muted)">Fayl yoxdur</small>'
}

async function uploadAttachment() {
  const fileInput = document.getElementById('attachment-file')
  const file = fileInput.files[0]
  if (!file) return showToast('Fayl seçin', 'error')

  const allowed = ['png', 'jpg', 'pdf', 'txt']
  const ext = file.name.split('.').pop().toLowerCase()
  if (!allowed.includes(ext)) return showToast('Yalnız png, jpg, pdf, txt', 'error')

  const reader = new FileReader()
  reader.onload = async (e) => {
    const res = await fetch(`/projects/${currentProjectId}/attachments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, data: e.target.result })
    })
    const data = await res.json()
    if (!res.ok) return showToast(data.xeta || 'Yükləmə xətası', 'error')
    showToast('Fayl yükləndi!')
    fileInput.value = ''
    await loadAttachments(currentProjectId)
  }
  reader.readAsDataURL(file)
}

async function deleteAttachment(id) {
  const confirm = await Swal.fire({
    title: 'Faylı silmək istəyirsən?', icon: 'warning',
    showCancelButton: true, confirmButtonText: 'Bəli', cancelButtonText: 'Ləğv et'
  })
  if (!confirm.isConfirmed) return
  await fetch(`/projects/${currentProjectId}/attachments/${id}`, { method: 'DELETE' })
  showToast('Silindi!')
  loadAttachments(currentProjectId)
}

async function loadThreads(projectId) {
  const res = await fetch(`/projects/${projectId}/threads`)
  const list = await res.json()
  document.getElementById('threads-list').innerHTML = list.length
    ? list.map(t => `
        <div class="item" style="padding:6px 0">
          <span style="font-size:14px;cursor:pointer;color:var(--accent)" onclick="openThread(${t.id}, '${escStr(t.title)}')">💬 ${t.title}</span>
          <div class="item-actions">
            ${t.userId === currentUser.id ? `
              <button class="btn btn-sm" onclick="editThreadPrompt(${t.id}, '${escStr(t.title)}')">Redaktə</button>
              <button class="btn btn-danger btn-sm" onclick="deleteThread(${t.id})">Sil</button>
            ` : ''}
          </div>
        </div>`).join('')
    : '<small style="color:var(--muted)">Müzakirə yoxdur</small>'
}

async function createThread() {
  const title = document.getElementById('thread-title-input').value.trim()
  if (!title) return showToast('Başlıq daxil edin', 'error')
  const res = await fetch(`/projects/${currentProjectId}/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  })
  if (!res.ok) return showToast('Xəta baş verdi', 'error')
  showToast('Thread yaradıldı!')
  document.getElementById('thread-title-input').value = ''
  loadThreads(currentProjectId)
}

async function editThreadPrompt(id, currentTitle) {
  const { value } = await Swal.fire({
    title: 'Thread-i redaktə et',
    input: 'text',
    inputValue: currentTitle,
    showCancelButton: true,
    confirmButtonText: 'Saxla',
    cancelButtonText: 'Ləğv et'
  })
  if (!value) return
  const res = await fetch(`/projects/${currentProjectId}/threads/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: value })
  })
  if (!res.ok) return showToast('Xəta baş verdi', 'error')
  showToast('Yeniləndi!')
  loadThreads(currentProjectId)
}

async function deleteThread(id) {
  const confirm = await Swal.fire({
    title: 'Thread-i silmək istəyirsən?', icon: 'warning',
    showCancelButton: true, confirmButtonText: 'Bəli', cancelButtonText: 'Ləğv et'
  })
  if (!confirm.isConfirmed) return
  await fetch(`/projects/${currentProjectId}/threads/${id}`, { method: 'DELETE' })
  showToast('Silindi!')
  loadThreads(currentProjectId)
}

async function openThread(id, title) {
  currentThreadId = id
  document.getElementById('thread-modal-title').textContent = title
  document.getElementById('new-message-input').value = ''
  document.getElementById('thread-show-modal').style.display = 'flex'
  await loadMessages(id)
}

function closeThreadShow() {
  document.getElementById('thread-show-modal').style.display = 'none'
}

async function loadMessages(threadId) {
  const res = await fetch(`/projects/${currentProjectId}/threads/${threadId}`)
  const thread = await res.json()
  const messages = thread.Messages || []
  const container = document.getElementById('messages-list')
  container.innerHTML = messages.length
    ? messages.map(m => `
        <div class="message-bubble">
          <div class="msg-header">
            <span class="msg-author">${m.User ? m.User.name : 'İstifadəçi'}</span>
            <span class="msg-time">${new Date(m.createdAt).toLocaleString()}</span>
          </div>
          <div class="msg-body">${m.body}</div>
          ${m.userId === currentUser.id ? `
            <div class="msg-actions">
              <button class="btn btn-sm" onclick="editMessagePrompt(${m.id}, \`${escStr(m.body)}\`)">Redaktə</button>
              <button class="btn btn-danger btn-sm" onclick="deleteMessage(${m.id})">Sil</button>
            </div>
          ` : ''}
        </div>`).join('')
    : '<small style="color:var(--muted)">Mesaj yoxdur</small>'
  container.scrollTop = container.scrollHeight
}

async function sendMessage() {
  const body = document.getElementById('new-message-input').value.trim()
  if (!body) return showToast('Mesaj yazın', 'error')
  const res = await fetch(`/threads/${currentThreadId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body })
  })
  if (!res.ok) return showToast('Xəta baş verdi', 'error')
  document.getElementById('new-message-input').value = ''
  loadMessages(currentThreadId)
}

async function editMessagePrompt(id, currentBody) {
  const { value } = await Swal.fire({
    title: 'Mesajı redaktə et',
    input: 'textarea',
    inputValue: currentBody,
    showCancelButton: true,
    confirmButtonText: 'Saxla',
    cancelButtonText: 'Ləğv et'
  })
  if (!value) return
  const res = await fetch(`/threads/${currentThreadId}/messages/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body: value })
  })
  if (!res.ok) return showToast('Xəta baş verdi', 'error')
  showToast('Mesaj yeniləndi!')
  loadMessages(currentThreadId)
}

async function deleteMessage(id) {
  await fetch(`/threads/${currentThreadId}/messages/${id}`, { method: 'DELETE' })
  showToast('Silindi!')
  loadMessages(currentThreadId)
}

async function loadUsers() {
  const res = await fetch('/users')
  if (!res.ok) return document.getElementById('user-list').innerHTML = '<div class="empty">İcazə yoxdur</div>'
  const users = await res.json()
  const list = document.getElementById('user-list')
  if (!users.length) return list.innerHTML = '<div class="empty">İstifadəçi yoxdur</div>'
  list.innerHTML = users.map(u => `
    <div class="item">
      <div>
        <b>${u.name}</b>
        <small>${u.email}${u.isAdmin ? ' · Admin' : ''}</small>
      </div>
      <div class="item-actions">
        <button class="btn btn-sm" onclick="showUser(${u.id})">Bax</button>
        ${currentUser.isAdmin ? `
          <button class="btn btn-sm" onclick="toggleAdmin(${u.id})">${u.isAdmin ? 'Admini sil' : 'Admin et'}</button>
          <button class="btn btn-danger btn-sm" onclick="deleteUser(${u.id})">Sil</button>
        ` : ''}
      </div>
    </div>
  `).join('')
}

async function showUser(id) {
  const res = await fetch(`/users/${id}`)
  const u = await res.json()
  document.getElementById('show-user-name').textContent = u.name
  document.getElementById('show-user-email').textContent = u.email
  document.getElementById('show-user-admin').textContent = u.isAdmin ? 'Bəli' : 'Xeyr'
  document.getElementById('user-show-modal').style.display = 'flex'
}
function closeUserShow() { document.getElementById('user-show-modal').style.display = 'none' }

async function toggleAdmin(id) {
  const res = await fetch(`/users/${id}/admin`, { method: 'PATCH' })
  const data = await res.json()
  if (!res.ok) return showToast(data.xeta, 'error')
  showToast('Admin statusu dəyişdirildi!')
  loadUsers()
}

async function deleteUser(id) {
  const confirm = await Swal.fire({
    title: 'İstifadəçini silmək istəyirsən?', icon: 'warning',
    showCancelButton: true, confirmButtonText: 'Bəli, sil', cancelButtonText: 'Ləğv et'
  })
  if (!confirm.isConfirmed) return
  const res = await fetch(`/users/${id}`, { method: 'DELETE' })
  const data = await res.json()
  if (!res.ok) return showToast(data.xeta, 'error')
  showToast('İstifadəçi silindi!')
  loadUsers()
}

async function showProfile() {
  const res = await fetch('/users/profile')
  const u = await res.json()
  document.getElementById('profile-name').value = u.name || ''
  document.getElementById('profile-email').value = u.email || ''
  document.getElementById('profile-password').value = ''
  document.getElementById('profile-modal').style.display = 'flex'
}
function closeProfile() { document.getElementById('profile-modal').style.display = 'none' }

async function saveProfile() {
  const name = document.getElementById('profile-name').value
  const email = document.getElementById('profile-email').value
  const password = document.getElementById('profile-password').value
  const body = { name, email }
  if (password) body.password = password
  const res = await fetch('/users/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const data = await res.json()
  if (!res.ok) return showToast(data.xeta, 'error')
  showToast('Profil yeniləndi!')
  currentUser.name = data.name
  document.getElementById('nav-name').textContent = data.name
  closeProfile()
}

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast')
  t.textContent = msg
  t.className = 'show ' + type
  setTimeout(() => t.className = '', 3000)
}

function escStr(s) {
  return String(s).replace(/'/g, "\\'").replace(/`/g, '\\`')
}

window.onload = async () => {
  document.getElementById('app-screen').style.display = 'none'
  await loadCurrentUser()
  if (currentUser) showApp()
}