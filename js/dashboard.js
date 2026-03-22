// dashboard.js - Handles dashboard stats and charts

document.addEventListener('DOMContentLoaded', () => {
    // Inject Layout
    document.getElementById('sidebar-container').innerHTML = injectSidebar();
    
    // Set up header with user greeting
    const user = currentUser;
    const greetingTime = getGreetingTime();
    document.getElementById('header-container').innerHTML = injectHeader(
        `Good ${greetingTime}, ${user ? user.name.split(' ')[0] : 'User'}!`,
        `Here's your productivity overview for today.`
    );
    
    // Load data and update UI
    loadDashboardStats();
    
    // Initialize charts
    initCharts();
});

function getGreetingTime() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
}

function loadDashboardStats() {
    // Prefix user ID to keys to make data user-specific
    const userId = currentUser ? currentUser.id : 'default';
    
    // 1. Tasks Stat
    const tasksData = JSON.parse(localStorage.getItem(`smart_tasks_${userId}`) || '[]');
    document.getElementById('stat-tasks').textContent = tasksData.length;
    
    // 2. Notes Stat
    const notesData = JSON.parse(localStorage.getItem(`smart_notes_${userId}`) || '[]');
    document.getElementById('stat-notes').textContent = notesData.length;
    
    // 3. Expenses Stat
    const expensesData = JSON.parse(localStorage.getItem(`smart_expenses_${userId}`) || '[]');
    const totalExpenses = expensesData
        .filter(exp => exp.type === 'expense')
        .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    document.getElementById('stat-expenses').textContent = `$${totalExpenses.toFixed(2)}`;
}

function initCharts() {
    // Common Chart.js options for Dark Theme
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.1)';
    
    // 1. Tasks Line Chart (Mock Trend Data as we don't store historical task completion date)
    const ctxTasks = document.getElementById('tasksChart');
    if (ctxTasks) {
        new Chart(ctxTasks, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Tasks Completed',
                    data: [3, 5, 2, 8, 4, 1, 6], // Mock data for visual purpose
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // 2. Expenses Doughnut Chart
    const userId = currentUser ? currentUser.id : 'default';
    const expensesData = JSON.parse(localStorage.getItem(`smart_expenses_${userId}`) || '[]');
    
    // Group expenses by category
    const categories = {};
    expensesData.filter(e => e.type === 'expense').forEach(exp => {
        const cat = exp.category || 'Other';
        categories[cat] = (categories[cat] || 0) + parseFloat(exp.amount);
    });
    
    const labels = Object.keys(categories).length > 0 ? Object.keys(categories) : ['No Data'];
    const data = Object.keys(categories).length > 0 ? Object.values(categories) : [1];
    const bgColors = Object.keys(categories).length > 0 
        ? ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'] 
        : ['rgba(255,255,255,0.1)'];

    const ctxExp = document.getElementById('expensesChart');
    if (ctxExp) {
        new Chart(ctxExp, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: bgColors,
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
}
