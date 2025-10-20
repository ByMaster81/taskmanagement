document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000';
    let authToken = localStorage.getItem('token');

    // --- HTML Element Referansları ---
    const authView = document.getElementById('auth-view');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const adminDashboardView = document.getElementById('admin-dashboard-view');
    const userDashboardView = document.getElementById('user-dashboard-view');
    
    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');
    
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');

 
    const userTaskList = document.getElementById('user-task-list');

    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    const userLogoutBtn = document.getElementById('user-logout-btn');

    const createTaskForm = document.getElementById('create-task-form');
    const assignTaskForm = document.getElementById('assign-task-form');
    const userSelect = document.getElementById('user-select');
    const taskSelect = document.getElementById('task-select');
    const adminUserList = document.getElementById('admin-user-list');
    const adminAssignmentList = document.getElementById('admin-assignment-list');
    const createUserForm = document.getElementById('create-user-form');

    

    // Hangi görünümün aktif olacağını yönetir
    const showView = (viewId) => {
        [authView, adminDashboardView, userDashboardView].forEach(view => view.classList.add('hidden'));
        const viewToShow = document.getElementById(viewId);
        if (viewToShow) viewToShow.classList.remove('hidden');
    };

    // JWT'nin payload kısmını decode eder (rolü öğrenmek için)
    const decodeToken = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    };


        const loadAdminDashboardData = () => {
        fetchAllUsersForAdmin();
        fetchAllTasksForAdmin();
        fetchAllAssignmentsForAdmin();
    };
    // Giriş yapmış kullanıcıya göre
    const navigateToDashboard = () => {
        if (!authToken) return showView('auth-view');
        const user = decodeToken(authToken);
        if (user && user.role === 'ADMINUSER') {
            showView('admin-dashboard-view');
            loadAdminDashboardData(); // Admin panosu verilerini yükle
        } else if (user) {
            showView('user-dashboard-view');
            fetchMyTasks();
        } else {
            handleLogout();
        }
    };

const fetchAllUsersForAdmin = async () => {
    adminUserList.innerHTML = '<tr><td colspan="3">Yükleniyor...</td></tr>';
    const response = await fetch(`${API_URL}/users`, { headers: { 'Authorization': `Bearer ${authToken}` } });
    if (response.ok) {
        const users = await response.json();
        adminUserList.innerHTML = '';
        userSelect.innerHTML = '<option value="">Kullanıcı Seçin</option>';
        
        users.forEach(user => {
            // Atama select kutusuna ekleme
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.name} (${user.role})`;
            userSelect.appendChild(option);

            // Görünen tabloya satır (tr) olarak ekleme
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.name}</td>
                <td>${user.role}</td>
                <td>
                    <button class="secondary outline contrast delete-user-btn" data-id="${user.id}" data-name="${user.name}">
                      Sil
                    </button>
                </td>
            `;
            adminUserList.appendChild(tr);
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

    
    const fetchAllAssignmentsForAdmin = async () => {
        adminAssignmentList.innerHTML = '<tr><td colspan="4">Yükleniyor...</td></tr>';
        const response = await fetch(`${API_URL}/assignments`, { headers: { 'Authorization': `Bearer ${authToken}` } });
        
        if (response.ok) {
            const assignments = await response.json();
            adminAssignmentList.innerHTML = '';
            
            assignments.forEach(assignment => {
                const tr = document.createElement('tr');
                const currentStatus = assignment.task.status;
                const taskId = assignment.task.id;

                const statusOptions = ['PENDING', 'IN_PROGRESS', 'DONE']
                    .map(status => `<option value="${status}" ${status === currentStatus ? 'selected' : ''}>${status}</option>`)
                    .join('');

                tr.innerHTML = `
                    <td>${assignment.task.title}</td>
                    <td>${assignment.user.name}</td>
                    <td>
                        <select class="status-select" data-task-id="${taskId}">
                            ${statusOptions}
                        </select>
                    </td>
                    <td>
                        <button class="secondary outline contrast remove-assignment-btn" data-id="${assignment.id}">
                        Kaldır
                        </button>
                    </td>
                `;
                adminAssignmentList.appendChild(tr);
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
    

    // --- OLAY DİNLEYİCİLERİ (EVENT LISTENERS) ---

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.classList.add('hidden');
        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());

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
    });
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
            fetchAllUsersForAdmin(); 
        } else {
            alert(`Hata: ${result.error || 'Kullanıcı oluşturulamadı.'}`);
        }
    });
    // Kayıt formu gönderildiğinde
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        registerError.classList.add('hidden');
        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData.entries());

        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (response.ok) {
            registerForm.reset();
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            alert('Kayıt başarılı! Lütfen giriş yapın.');
        } else {
            registerError.textContent = result.error || 'Bir hata oluştu.';
            registerError.classList.remove('hidden');
        }
    });

    adminAssignmentList.addEventListener('change', (e) => {
        // Olayın bir durum select menüsünden gelip gelmediğini kontrol et
        if (e.target.matches('.status-select')) {
            const taskId = e.target.dataset.taskId;
            const newStatus = e.target.value;
            updateTaskStatus(taskId, newStatus);
        }
    });
    adminAssignmentList.addEventListener('click', async (e) => {
        // Tıklanan elementin bir "atamayı kaldır" butonu olup olmadığını kontrol et
        if (e.target.matches('.remove-assignment-btn')) {
            const assignmentId = e.target.dataset.id;
            
            if (confirm('Bu görev atamasını kaldırmak istediğinizden emin misiniz? (Görevin kendisi silinmeyecektir)')) {
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
            
            if (confirm(`'${userName}' adlı kullanıcıyı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
                const response = await fetch(`${API_URL}/users/${userId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });

                if (response.ok) {
                    const result = await response.json();
                    alert(`Kullanıcı "${result.user.name}" başarıyla silindi.`);
                    
                    fetchAllUsersForAdmin(); 
                } else {
                    const result = await response.json();
                    alert(`Hata: ${result.error || 'Kullanıcı silinemedi.'}`);
                }
            }
        }
    });

    // Çıkış yapma
    const handleLogout = () => {
        authToken = null;
        localStorage.removeItem('token');
        showView('auth-view');
    };
    adminLogoutBtn.addEventListener('click', handleLogout);
    userLogoutBtn.addEventListener('click', handleLogout);

    // Form değiştirme linkleri
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });
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
        } else {
            alert('Görev oluşturulamadı.');
        }
    });

    // YENİ: Atama formu gönderildiğinde
    assignTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(assignTaskForm);
        const data = Object.fromEntries(formData.entries());

        const response = await fetch(`${API_URL}/assignments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            alert('Görev başarıyla atandı!');
            assignTaskForm.reset();
            fetchAllAssignmentsForAdmin(); 
        } else {
            alert('Görev atanamadı.');
        }
    });

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
            //Listeyi yeniden yükleyerek tutarlılık garanti edilebilir(?)
            // fetchAllAssignmentsForAdmin(); 
        } else {
            alert('Durum güncellenemedi.');
        }
    };
    navigateToDashboard();
});