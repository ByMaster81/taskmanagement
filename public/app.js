document.addEventListener('DOMContentLoaded', () => {
   
    const API_URL = 'http://localhost:3000';

  
    const userForm = document.getElementById('user-form');
    const taskForm = document.getElementById('task-form');
    const assignmentForm = document.getElementById('assignment-form');

    
    const userList = document.getElementById('user-list');
    const taskList = document.getElementById('task-list');
    const assignmentList = document.getElementById('assignment-list');
    const userSelect = document.getElementById('user-select');
    const taskSelect = document.getElementById('task-select');

    

    
    const fetchAndRenderAll = async () => {
        try {
            
            const [users, tasks, assignments] = await Promise.all([
                fetch(`${API_URL}/users`).then(res => res.json()),
                fetch(`${API_URL}/tasks`).then(res => res.json()),
                fetch(`${API_URL}/assignments`).then(res => res.json())
            ]);

            renderUsers(users);
            renderTasks(tasks);
            renderAssignments(assignments);

        } catch (error) {
            console.error('Veri alınırken bir hata oluştu:', error);
            alert('Veriler sunucudan alınamadı. Lütfen backend sunucunuzun çalıştığından emin olun.');
        }
    };

    const renderUsers = (users) => {
        userList.innerHTML = '';
        userSelect.innerHTML = '<option value="" disabled selected>Önce Kullanıcı Seçin...</option>';
        users.forEach(user => {
            // Liste için li elementi oluştur
            const li = document.createElement('li');
            li.textContent = `${user.name} (${user.email})`;
            userList.appendChild(li);

            // Select kutusu için option elementi oluştur
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            userSelect.appendChild(option);
        });
    };

    const renderTasks = (tasks) => {
        taskList.innerHTML = '';
        taskSelect.innerHTML = '<option value="" disabled selected>Sonra Görev Seçin...</option>';
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.textContent = `${task.title} (Durum: ${task.status})`;
            taskList.appendChild(li);

            const option = document.createElement('option');
            option.value = task.id;
            option.textContent = task.title;
            taskSelect.appendChild(option);
        });
    };

    const renderAssignments = (assignments) => {
        assignmentList.innerHTML = '';
        if (assignments.length === 0) {
            assignmentList.innerHTML = '<li>Henüz bir atama yapılmamış.</li>';
            return;
        }
        assignments.forEach(assignment => {
            const li = document.createElement('li');
            const userInfo = assignment.user ? assignment.user.name : 'Bilinmeyen Kullanıcı';
            const taskInfo = assignment.task ? assignment.task.title : 'Bilinmeyen Görev';
            
            li.innerHTML = `<span><strong>${taskInfo}</strong> &rarr; ${userInfo}</span>
                          <button class="secondary outline" data-id="${assignment.id}">Atamayı Sil</button>`;
            assignmentList.appendChild(li);
        });
    };


    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(userForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error((await response.json()).errors[0].msg);
            
            userForm.reset();
            fetchAndRenderAll(); 
        } catch (error) {
            alert(`Hata: ${error.message}`);
        }
    });

    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(taskForm);
        const data = Object.fromEntries(formData.entries());

        await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        taskForm.reset();
        fetchAndRenderAll();
    });

    assignmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(assignmentForm);
        const data = Object.fromEntries(formData.entries());

        if (!data.userId || !data.taskId) {
            alert('Lütfen hem kullanıcı hem de görev seçin.');
            return;
        }

        await fetch(`${API_URL}/assignments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        assignmentForm.reset();
        fetchAndRenderAll();
    });

   
    assignmentList.addEventListener('click', async (e) => {
      
        if (e.target.matches('button[data-id]')) {
            const id = e.target.dataset.id;
            if (confirm('Bu atamayı silmek istediğinizden emin misiniz?')) {
                await fetch(`${API_URL}/assignments/${id}`, {
                    method: 'DELETE'
                });
                fetchAndRenderAll();
            }
        }
    });

   
    fetchAndRenderAll();
});