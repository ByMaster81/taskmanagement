document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------
    // --- 1. DEĞİŞKENLER VE ELEMENT REFERANSLARI ---
    // ----------------------------------------------------------------
    const API_URL = ''; // Sunucuyla aynı adresten çalışacak
    let authToken = localStorage.getItem('token');
    let currentUserId = null; 
    let allUsers = []; 
    let socket = null; 

    // --- HTML Element Referansları (TAM LİSTE) ---
    const authView = document.getElementById('auth-view');
    const loginForm = document.getElementById('login-form');
    const adminDashboardView = document.getElementById('admin-dashboard-view');
    const userDashboardView = document.getElementById('user-dashboard-view');
    
    const loginError = document.getElementById('login-error'); 

    const userTaskList = document.getElementById('user-task-list');

    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    const userLogoutBtn = document.getElementById('user-logout-btn');
    const adminWelcomeMessage = document.getElementById('admin-welcome-message'); 
    const userWelcomeMessage = document.getElementById('user-welcome-message');

    const createTaskForm = document.getElementById('create-task-form'); 
    const assignTaskForm = document.getElementById('assign-task-form'); 
    const userSelect = document.getElementById('user-select'); 
    const taskSelect = document.getElementById('task-select'); 
    const adminUserList = document.getElementById('admin-user-list'); 
    const adminAssignmentList = document.getElementById('admin-assignment-list'); 
    const createUserForm = document.getElementById('create-user-form'); 
    
    const adminTaskList = document.getElementById('admin-task-list'); 

    // Mesajlaşma Elementleri
    const messageModal = document.getElementById('message-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const openMessagingCenterBtn = document.getElementById('open-messaging-center-btn');
    const openMessagingCenterBtnUser = document.getElementById('open-messaging-center-btn-user');
    const conversationsList = document.getElementById('conversations-list');
    const chatWindow = document.getElementById('chat-window');
    const chatPartnerName = document.getElementById('chat-partner-name');
    const messageHistory = document.getElementById('message-history');
    const sendMessageForm = document.getElementById('send-message-form');
    const messageContentInput = document.getElementById('message-content');
    const receiverIdInput = document.getElementById('receiver-id');
    
    // --- 2. YARDIMCI VE GENEL FONKSİYONLAR ---

    // Hangi görünümün aktif olacağını yönetir
    const showView = (viewId) => {
        [authView, adminDashboardView, userDashboardView].forEach(view => view.classList.add('hidden'));
        const viewToShow = document.getElementById(viewId);
        if (viewToShow) viewToShow.classList.remove('hidden');
    };

    // JWT'nin payload kısmını decode eder
    const decodeToken = (token) => {
        try {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            currentUserId = decoded.id; 
            return decoded;
        } catch (e) {
            currentUserId = null; 
            return null;
        }
    };

    const loadAdminDashboardData = async () => { 
        await fetchAllUsersForAdmin(); 
        fetchAllTasksForAdmin(); 
        fetchAllAssignmentsForAdmin(); 
        fetchAllTasksForAdminList(); 
    };

    // Giriş yapınca WebSocket bağlantısını da başlatır
    const navigateToDashboard = () => {
        if (!authToken) return showView('auth-view');
        const user = decodeToken(authToken);

        if (adminWelcomeMessage) adminWelcomeMessage.textContent = '';
        if (userWelcomeMessage) userWelcomeMessage.textContent = '';

        if (user && user.role === 'ADMINUSER') {
            showView('admin-dashboard-view');
            if (adminWelcomeMessage) adminWelcomeMessage.textContent = `Hoş geldin, ${user.name}`;
            loadAdminDashboardData(); 
        } else if (user) {
            showView('user-dashboard-view');
            if (userWelcomeMessage) userWelcomeMessage.textContent = `Hoş geldin, ${user.name}`;
            fetchMyTasks();
        } else {
            return handleLogout(); 
        }

        // WebSocket'e bağlan
        connectToWebSocket();
    };


    // --- 3. WEBSOCKET FONKSİYONLARI ---

    const appendMessageToHistory = (msg) => {
        const emptyMsg = messageHistory.querySelector('.empty-chat-msg');
        if(emptyMsg) emptyMsg.remove();

        const p = document.createElement('p');
        const senderName = msg.sender ? msg.sender.name : 'Bilinmeyen';
        const senderId = msg.sender ? msg.sender.id : msg.senderId;

        const isMe = senderId === currentUserId; 
        p.className = isMe ? 'sender' : 'receiver'; 
        p.innerHTML = `<strong>${isMe ? 'Siz' : senderName}:</strong> ${msg.content}`;
        messageHistory.appendChild(p);
        
        messageHistory.scrollTop = messageHistory.scrollHeight; 
    };

    const connectToWebSocket = () => {
        if (socket && socket.connected) return;

        socket = io(API_URL, { 
            auth: {
                token: authToken
            }
        });

        socket.on('connect', () => {
            console.log('Socket.IO bağlantısı başarılı. ID:', socket.id);
        });

        
        socket.on('receiveMessage', (newMessage) => {
            console.log("Yeni mesaj alındı:", newMessage);
            
            const isChatOpen = !chatWindow.classList.contains('hidden');
            const currentPartnerId = receiverIdInput.value;
            const senderId = newMessage.sender ? newMessage.sender.id : newMessage.senderId;
            
            if (isChatOpen && 
                (senderId === currentPartnerId || senderId === currentUserId)) {
                appendMessageToHistory(newMessage);
            } else {
                console.log("Bildirim: Yeni mesaj alındı ama pencere kapalı.");
            }
        });

        socket.on('connect_error', (err) => {
            console.error('Socket bağlantı hatası:', err.message);
            if (err.message.includes('Geçersiz token')) {
                handleLogout(); 
            }
        });
    };
    
    // --- 4. MESAJLAŞMA (HTTP) FONKSİYONLARI ---

    const openMessagingCenter = async () => {
        chatWindow.classList.add('hidden'); 
        conversationsList.innerHTML = '<p>Yükleniyor...</p>';
        messageModal.showModal(); 
        try {
            const response = await fetch(`${API_URL}/users`, { headers: { 'Authorization': `Bearer ${authToken}` } });
            if (!response.ok) throw new Error('Kullanıcılar yüklenemedi.');
            
            const users = await response.json();
            conversationsList.innerHTML = '';
            
            users.forEach(user => {
                if (user.id === currentUserId) return; 
                
                const userButton = document.createElement('button');
                userButton.className = 'conversation-user-btn';
                userButton.textContent = user.name;
                userButton.dataset.userId = user.id;
                userButton.dataset.userName = user.name;
                conversationsList.appendChild(userButton);
            });
        } catch (error) {
            conversationsList.innerHTML = `<p class="error">${error.message}</p>`;
        }
    };

    const selectConversation = (userId, userName) => {
        chatWindow.classList.remove('hidden'); 
        chatPartnerName.textContent = `${userName} ile sohbet`;
        receiverIdInput.value = userId; 
        

        fetchMessageHistory(userId); 
    };

    const fetchMessageHistory = async (otherUserId) => {
        messageHistory.innerHTML = '<p>Yükleniyor...</p>';
        try {
            const response = await fetch(`${API_URL}/messages/${otherUserId}`, { headers: { 'Authorization': `Bearer ${authToken}` } });
            if (!response.ok) {
                let errorMsg = `Mesajlar alınamadı (HTTP ${response.status})`; 
                try {
                    const errResult = await response.json();
                    errorMsg = errResult.message || errResult.error || errorMsg;
                } catch (e) { errorMsg = response.statusText || errorMsg; }
                throw new Error(errorMsg); 
            }

            const messages = await response.json();
            messageHistory.innerHTML = '';
            
            if (messages.length === 0) {
                messageHistory.innerHTML = '<p class="empty-chat-msg" style="text-align: center; opacity: 0.7;">Sohbet geçmişi boş.</p>';
                return;
            }

            messages.forEach(msg => {
                appendMessageToHistory(msg);
            });
        
        } catch (error) {
            messageHistory.innerHTML = `<p class="error">Hata: ${error.message}</p>`;
        }
    };


    const handleSendMessage = async (e) => {
        e.preventDefault();
        const data = {
            receiverId: receiverIdInput.value,
            content: messageContentInput.value.trim()
        };

        if (!data.content || !data.receiverId || !socket) return; 

        socket.emit('sendMessage', data);
        messageContentInput.value = ''; 
    };

    const closeMessageModal = (e) => {
        if (e) e.preventDefault(); 
        messageModal.close();
    };

    // Çıkış yaparken socket bağlantısını kes
    const handleLogout = () => {
        if (socket) {
            socket.disconnect(); 
            socket = null;
        }
        authToken = null;
        currentUserId = null; 
        allUsers = []; 
        localStorage.removeItem('token');
        showView('auth-view');
    };

    // --- 5. GÖREV/KULLANICI/ATAMA (CRUD) FONKSİYONLARI ---
    
    const fetchAllUsersForAdmin = async () => {
        adminUserList.innerHTML = '<p>Yükleniyor...</p>';
        userSelect.innerHTML = '<option>Yükleniyor...</option>'; 
        const response = await fetch(`${API_URL}/users`, { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (response.ok) {
            const users = await response.json();
            allUsers = users; 
            adminUserList.innerHTML = '';
            userSelect.innerHTML = '<option value="">Kullanıcı Seçin</option>';
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.name} (${user.role})`;
                userSelect.appendChild(option);
                const row = document.createElement('div');
                row.className = 'data-row user-row';
                row.innerHTML = `
                    <span>${user.name}</span>
                    <span>${user.role}</span>
                    <button class="secondary delete-user-btn" data-id="${user.id}" data-name="${user.name}">Sil</button>
                `;
                adminUserList.appendChild(row);
            });
        }
    };
    const fetchAllTasksForAdmin = async () => {
        taskSelect.innerHTML = '<option>Yükleniyor...</option>';
        const response = await fetch(`${API_URL}/tasks`, { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (response.ok) {
            const tasks = await response.json();
            taskSelect.innerHTML = '<option value="">Görev Seçin</option>';
            tasks.forEach(task => {
                const option = document.createElement('option');
                option.value = task.id;
                option.textContent = task.title;
                taskSelect.appendChild(option);
            });
        }
    };
    const fetchAllTasksForAdminList = async () => {
        adminTaskList.innerHTML = '<p>Yükleniyor...</p>';
        const response = await fetch(`${API_URL}/tasks`, { 
            headers: { 'Authorization': `Bearer ${authToken}` } 
        });
        if (response.ok) {
            const tasks = await response.json();
            adminTaskList.innerHTML = '';
            tasks.forEach(task => {
                const row = document.createElement('div');
                row.className = 'data-row task-row';
                const currentStatus = task.status;
                const taskId = task.id;
                const statusOptions = ['PENDING', 'IN_PROGRESS', 'DONE']
                    .map(status => `<option value="${status}" ${status === currentStatus ? 'selected' : ''}>${status}</option>`)
                    .join('');
                row.innerHTML = `
                    <span>${task.title}</span>
                    <span>${task.description || '<i>Yok</i>'}</span>
                    <td>
                        <select class="status-select" data-task-id="${taskId}">
                            ${statusOptions}
                        </select>
                    </td>
                    <td>
                        <button class="secondary delete-task-btn" data-id="${task.id}" data-name="${task.title}">
                            Sil
                        </button>
                    </td>
                `;
                adminTaskList.appendChild(row);
            });
        } else {
            adminTaskList.innerHTML = '<p class="error">Görevler yüklenemedi.</p>';
        }
    };
    const fetchAllAssignmentsForAdmin = async () => {
        adminAssignmentList.innerHTML = '<p>Yükleniyor...</p>';
        if (allUsers.length === 0) {
            adminAssignmentList.innerHTML = '<p class="error">Önce kullanıcılar yüklenmeli.</p>';
            return;
        }
        const response = await fetch(`${API_URL}/assignments`, { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (response.ok) {
            const assignments = await response.json();
            adminAssignmentList.innerHTML = '';
            assignments.forEach(assignment => {
                const row = document.createElement('div');
                row.className = 'data-row assignment-row'; 
                const currentUserId = assignment.user.id;
                const assignmentId = assignment.id;
                const userOptions = allUsers
                    .map(user => `<option value="${user.id}" ${user.id === currentUserId ? 'selected' : ''}>${user.name}</option>`)
                    .join('');
                row.innerHTML = `
                    <span>${assignment.task.title}</span>
                    <td>
                        <select class="assignee-select" data-assignment-id="${assignmentId}">
                            ${userOptions}
                        </select>
                    </td>
                    <td>
                        <button class="secondary remove-assignment-btn" data-id="${assignment.id}">
                        Kaldır
                        </button>
                    </td>
                `;
                adminAssignmentList.appendChild(row);
            });
        }
    };
    const fetchMyTasks = async () => {
        userTaskList.innerHTML = '<li>Görevler yükleniyor...</li>';
        const response = await fetch(`${API_URL}/assignments/me`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (response.ok) {
            const assignments = await response.json();
            userTaskList.innerHTML = '';
            if (assignments.length === 0) {
                userTaskList.innerHTML = '<li>Size atanmış görev bulunmuyor.</li>';
                return;
            }
            assignments.forEach(assignment => {
                const li = document.createElement('li');
                li.textContent = `Görev: ${assignment.task.title} (Durum: ${assignment.task.status})`;
                userTaskList.appendChild(li);
            });
        } else {
            userTaskList.innerHTML = '<li>Görevler yüklenemedi.</li>';
        }
    };
    const updateAssignmentUser = async (assignmentId, newUserId) => {
        const response = await fetch(`${API_URL}/assignments/${assignmentId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}` 
            },
            body: JSON.stringify({ userId: newUserId })
        });
        if (response.ok) {
            alert('Atanan kullanıcı başarıyla güncellendi!');
            fetchAllAssignmentsForAdmin(); 
        } else {
            alert('Atanan kullanıcı güncellenemedi.');
            fetchAllAssignmentsForAdmin();
        }
    };
    const updateTaskStatus = async (taskId, newStatus) => {
        const response = await fetch(`${API_URL}/tasks/${taskId}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}` 
            },
            body: JSON.stringify({ status: newStatus })
        });
        if (response.ok) {
            alert('Görev durumu başarıyla güncellendi!');
            fetchAllTasksForAdminList(); 
            fetchAllAssignmentsForAdmin();
        } else {
            alert('Durum güncellenemedi.');
        }
    };

    // --- 6. OLAY DİNLEYİCİLERİ (EVENT LISTENERS) ---
    
   
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.classList.add('hidden');
        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (response.ok) {
                authToken = result.token;
                localStorage.setItem('token', authToken);
                navigateToDashboard(); 
            } else {
                loginError.textContent = result.error || 'Bir hata oluştu.';
                loginError.classList.remove('hidden');
            }
        } catch (error) {
            console.error("Giriş fetch hatası:", error);
            loginError.textContent = 'Sunucuya bağlanılamadı. (Backend sunucusu çalışmıyor olabilir)';
            loginError.classList.remove('hidden');
        }
    });

    // createUserForm artık tanımlı
    createUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(createUserForm);
        const data = Object.fromEntries(formData.entries());
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${authToken}` 
            },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (response.ok) {
            alert(`Kullanıcı "${result.name}" başarıyla oluşturuldu!`);
            createUserForm.reset();
            await fetchAllUsersForAdmin();
            fetchAllAssignmentsForAdmin();
        } else {
            alert(`Hata: ${result.error || 'Kullanıcı oluşturulamadı.'}`);
        }
    });
    
    adminAssignmentList.addEventListener('change', (e) => {
        if (e.target.matches('.assignee-select')) {
            const assignmentId = e.target.dataset.assignmentId;
            const newUserId = e.target.value;
            if (confirm('Bu görevin atandığı kullanıcıyı değiştirmek istediğinizden emin misiniz?')) {
                updateAssignmentUser(assignmentId, newUserId);
            } else {
                fetchAllAssignmentsForAdmin(); 
            }
        }
    });
    
    adminAssignmentList.addEventListener('click', async (e) => {
        if (e.target.matches('.remove-assignment-btn')) {
            const assignmentId = e.target.dataset.id;
            if (confirm('Bu görev atamasını kaldırmak istediğinizden emin misiniz?')) {
                const response = await fetch(`${API_URL}/assignments/${assignmentId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                if (response.ok) {
                    alert('Atama başarıyla kaldırıldı.');
                    fetchAllAssignmentsForAdmin(); 
                } else {
                    const result = await response.json();
                    alert(`Hata: ${result.error || 'Atama kaldırılamadı.'}`);
                }
            }
        }
    });
    
    adminUserList.addEventListener('click', async (e) => {
        if (e.target.matches('.delete-user-btn')) {
            const userId = e.target.dataset.id;
            const userName = e.target.dataset.name;
            if (confirm(`'${userName}' adlı kullanıcıyı kalıcı olarak silmek istediğinizden emin misiniz?`)) {
                const response = await fetch(`${API_URL}/users/${userId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                if (response.ok) {
                    loadAdminDashboardData(); 
                } else {
                    const result = await response.json();
                    alert(`Hata: ${result.error || 'Kullanıcı silinemedi.'}`);
                }
            }
        }
    });
    
    adminTaskList.addEventListener('click', async (e) => {
        if (e.target.matches('.delete-task-btn')) {
            const taskId = e.target.dataset.id;
            const taskName = e.target.dataset.name;
            if (confirm(`'${taskName}' adlı görevi kalıcı olarak silmek istediğinizden emin misiniz?`)) {
                const response = await fetch(`${API_URL}/tasks/${taskId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                if (response.ok) {
                    loadAdminDashboardData(); 
                } else {
                    const result = await response.json();
                    alert(`Hata: ${result.error || 'Görev silinemedi.'}`);
                }
            }
        }
    });
    
    adminTaskList.addEventListener('change', (e) => {
        if (e.target.matches('.status-select')) {
            const taskId = e.target.dataset.taskId;
            const newStatus = e.target.value;
            updateTaskStatus(taskId, newStatus);
        }
    });
    
    adminLogoutBtn.addEventListener('click', handleLogout);
    userLogoutBtn.addEventListener('click', handleLogout);
    
    createTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(createTaskForm);
        const data = Object.fromEntries(formData.entries());
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
            body: JSON.stringify(data),
        });
        if (response.ok) {
            alert('Görev başarıyla oluşturuldu!');
            createTaskForm.reset();
            fetchAllTasksForAdmin(); 
            fetchAllTasksForAdminList(); 
        } else {
            alert('Görev oluşturulamadı.');
        }
    });
    
    assignTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(assignTaskForm);
        const data = Object.fromEntries(formData.entries());
        const response = await fetch(`${API_URL}/assignments`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${authToken}` 
            },
            body: JSON.stringify(data),
        });
        if (response.ok) {
            alert('Görev başarıyla atandı!');
            assignTaskForm.reset();
            fetchAllAssignmentsForAdmin(); 
        } else {
            const result = await response.json();
            alert(`Hata: ${result.error || 'Görev atanamadı.'}`);
        }
    });
    
    // --- MESAJLAŞMA DİNLEYİCİLERİ ---
    if (openMessagingCenterBtn) {
        openMessagingCenterBtn.addEventListener('click', openMessagingCenter);
    }
    if (openMessagingCenterBtnUser) {
        openMessagingCenterBtnUser.addEventListener('click', openMessagingCenter);
    }
    closeModalBtn.addEventListener('click', closeMessageModal);
    messageModal.addEventListener('click', (e) => {
        if (e.target === messageModal) {
            closeMessageModal();
        }
    });
    conversationsList.addEventListener('click', (e) => {
        const button = e.target.closest('.conversation-user-btn');
        if (button) {
            const userId = button.dataset.userId;
            const userName = button.dataset.userName;
            selectConversation(userId, userName);
        }
    });
    
   
    sendMessageForm.addEventListener('submit', handleSendMessage);
    
    
    // --- UYGULAMA BAŞLANGICI ---
    navigateToDashboard();
});