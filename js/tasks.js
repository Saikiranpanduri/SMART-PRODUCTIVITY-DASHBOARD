// tasks.js - Logic for the Tasks Page

document.addEventListener('DOMContentLoaded', () => {
    // Inject components
    document.getElementById('sidebar-container').innerHTML = injectSidebar();
    document.getElementById('header-container').innerHTML = injectHeader('Tasks', 'Manage your daily to-dos');
    
    // Initialize tasks
    initTasks();
});

let tasks = [];
let userId = 'default';

function initTasks() {
    userId = currentUser ? currentUser.id : 'default';
    const storedTasks = localStorage.getItem(`smart_tasks_${userId}`);
    
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
    
    renderTasks();
    
    // Event listener for adding task
    document.getElementById('taskForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('taskInput');
        addTask(input.value);
        input.value = '';
    });
}

function saveTasks() {
    localStorage.setItem(`smart_tasks_${userId}`, JSON.stringify(tasks));
}

function addTask(title) {
    if (!title.trim()) return;
    
    const newTask = {
        id: Date.now().toString(),
        title: title.trim(),
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.unshift(newTask); // Add to beginning
    saveTasks();
    renderTasks();
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

function renderTasks() {
    const list = document.getElementById('taskList');
    list.innerHTML = '';
    
    if (tasks.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-check"></i>
                <p>No tasks yet. Add one above!</p>
            </div>
        `;
        return;
    }
    
    // Sort tasks: uncompleted first, then completed. Recently created first in each group.
    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.completed === b.completed) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return a.completed ? 1 : -1;
    });
    
    sortedTasks.forEach(task => {
        const item = document.createElement('li');
        item.className = `task-item glass-panel ${task.completed ? 'completed' : ''}`;
        
        item.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="toggleTask('${task.id}')">
                <span class="task-text">${escapeHTML(task.title)}</span>
            </div>
            <div class="task-actions">
                <button onclick="deleteTask('${task.id}')" title="Delete Task">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        
        list.appendChild(item);
    });
}

// Utility to prevent XSS
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
