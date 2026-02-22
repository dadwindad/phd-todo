document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const deadlineInput = document.getElementById('deadline-input');
    const addBtn = document.getElementById('add-btn');
    const taskList = document.getElementById('task-list');
    const itemsLeft = document.getElementById('items-left');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const currentDate = document.getElementById('current-date');
    const filterBtns = document.querySelectorAll('.filter-btn');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';

    // Set Current Date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDate.textContent = new Date().toLocaleDateString('en-US', options);

    // Initial Render
    renderTasks();

    // Add Task Function
    function addTask() {
        const text = taskInput.value.trim();
        const deadline = deadlineInput.value;
        if (text) {
            const newTask = {
                id: Date.now(),
                text: text,
                completed: false,
                deadline: deadline
            };
            tasks.push(newTask);
            saveTasks();
            renderTasks();
            taskInput.value = '';
            deadlineInput.value = '';
            taskInput.focus();
        }
    }

    // Save to LocalStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateItemsLeft();
    }

    // Update Items Left Counter
    function updateItemsLeft() {
        const activeTasks = tasks.filter(task => !task.completed).length;
        itemsLeft.textContent = `${activeTasks} items left`;
    }

    // Delete Task
    function deleteTask(id) {
        const item = document.querySelector(`[data-id="${id}"]`);
        item.classList.add('removing');
        item.addEventListener('animationend', () => {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
        }, { once: true });
    }

    // Toggle Complete
    function toggleComplete(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveTasks();
        renderTasks();
    }

    // Render Tasks
    function renderTasks() {
        taskList.innerHTML = '';

        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.setAttribute('data-id', task.id);

            let deadlineHtml = '';
            if (task.deadline) {
                const date = new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                deadlineHtml = `
                    <div class="deadline-tag">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>Due ${date}</span>
                    </div>
                `;
            }

            li.innerHTML = `
                <div class="checkbox-container">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <div class="task-text">
                    <span class="text">${task.text}</span>
                    ${deadlineHtml}
                </div>
                <button class="delete-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                    </svg>
                </button>
            `;

            li.querySelector('.checkbox-container').addEventListener('click', () => toggleComplete(task.id));
            li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));

            taskList.appendChild(li);
        });

        updateItemsLeft();
    }

    // Event Listeners
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    clearCompletedBtn.addEventListener('click', () => {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });
});
