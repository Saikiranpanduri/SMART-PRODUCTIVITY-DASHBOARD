// expenses.js - Logic for the Expense Tracker

document.addEventListener('DOMContentLoaded', () => {
    // Inject Layout
    document.getElementById('sidebar-container').innerHTML = injectSidebar();
    document.getElementById('header-container').innerHTML = injectHeader('Expense Tracker', 'Manage your finances and budget');
    
    // Initialize
    initExpenses();
});

let transactions = [];
let userId = 'default';
let expenseChart = null;

function initExpenses() {
    userId = currentUser ? currentUser.id : 'default';
    const storedData = localStorage.getItem(`smart_expenses_${userId}`);
    
    if (storedData) {
        transactions = JSON.parse(storedData);
    }
    
    document.getElementById('expenseForm').addEventListener('submit', addTransaction);
    
    updateUI();
}

function saveTransactions() {
    localStorage.setItem(`smart_expenses_${userId}`, JSON.stringify(transactions));
}

function addTransaction(e) {
    e.preventDefault();
    
    const type = document.getElementById('transType').value;
    const desc = document.getElementById('transDesc').value.trim();
    const amount = parseFloat(document.getElementById('transAmount').value);
    const category = document.getElementById('transCat').value;
    
    if (!desc || isNaN(amount) || amount <= 0) return;
    
    const transaction = {
        id: Date.now().toString(),
        type,
        description: desc,
        amount,
        category,
        date: new Date().toISOString()
    };
    
    transactions.unshift(transaction); // Add to beginning
    saveTransactions();
    
    // Reset form
    document.getElementById('transDesc').value = '';
    document.getElementById('transAmount').value = '';
    
    updateUI();
}

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    updateUI();
}

function updateUI() {
    // Calculate totals
    let income = 0;
    let expense = 0;
    
    transactions.forEach(t => {
        if (t.type === 'income') income += t.amount;
        else expense += t.amount;
    });
    
    const balance = income - expense;
    
    // Update DOM
    const balanceEl = document.getElementById('totalBalance');
    balanceEl.textContent = `$${balance.toFixed(2)}`;
    balanceEl.className = `balance-amount ${balance >= 0 ? 'positive' : 'negative'}`;
    
    document.getElementById('totalIncome').textContent = `+$${income.toFixed(2)}`;
    document.getElementById('totalExpense').textContent = `-$${expense.toFixed(2)}`;
    
    renderTransactionList();
    renderChart();
}

function renderTransactionList() {
    const list = document.getElementById('transactionList');
    list.innerHTML = '';
    
    if (transactions.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
                <p>No transactions yet.</p>
            </div>
        `;
        return;
    }
    
    transactions.forEach(t => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        
        const isIncome = t.type === 'income';
        const icon = getCategoryIcon(t.category, isIncome);
        const dateStr = new Date(t.date).toLocaleDateString();
        
        item.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-icon ${t.type}">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="transaction-details">
                    <h4>${escapeHTML(t.description)}</h4>
                    <p>${t.category} • ${dateStr}</p>
                </div>
            </div>
            <div class="transaction-amount ${t.type}">
                ${isIncome ? '+' : '-'}$${t.amount.toFixed(2)}
                <button class="delete-btn" onclick="deleteTransaction('${t.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        list.appendChild(item);
    });
}

function renderChart() {
    const ctx = document.getElementById('expenseChartCanvas');
    if (!ctx) return;
    
    // Only chart expenses
    const expenses = transactions.filter(t => t.type === 'expense');
    
    const categories = {};
    expenses.forEach(e => {
        categories[e.category] = (categories[e.category] || 0) + e.amount;
    });
    
    const labels = Object.keys(categories);
    const data = Object.values(categories);
    
    // Default empty state for chart
    if (labels.length === 0) {
        labels.push('No Expenses');
        data.push(1);
    }
    
    if (expenseChart) {
        expenseChart.destroy();
    }
    
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.1)';
    
    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: labels[0] === 'No Expenses' ? ['rgba(255,255,255,0.1)'] : ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: { boxWidth: 12 }
                }
            }
        }
    });
}

function getCategoryIcon(category, isIncome) {
    if (isIncome) return 'fa-arrow-down';
    
    const icons = {
        'Food': 'fa-utensils',
        'Transport': 'fa-car',
        'Shopping': 'fa-shopping-bag',
        'Bills': 'fa-file-invoice-dollar',
        'Entertainment': 'fa-film',
        'Salary': 'fa-money-bill-wave',
        'Other': 'fa-receipt'
    };
    
    return icons[category] || 'fa-receipt';
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
