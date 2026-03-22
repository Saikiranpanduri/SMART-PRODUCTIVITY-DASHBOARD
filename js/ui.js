// ui.js - Shared UI interactions (sidebar, mobile nav, page transitions)

document.addEventListener('DOMContentLoaded', () => {
    // Mobile navigation toggle
    const toggleBtn = document.getElementById('mobile-nav-toggle');
    const sidebar = document.getElementById('sidebar');
    
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                sidebar.classList.contains('open') && 
                !sidebar.contains(e.target) && 
                e.target !== toggleBtn &&
                !toggleBtn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }

    // Determine active menu item based on current URL
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Remove active class
        link.classList.remove('active');
        
        // Check if current path ends with this href
        if (currentPath.endsWith(href) || (currentPath.endsWith('/') && href === 'index.html')) {
            link.classList.add('active');
        }
    });
});

// Sidebar HTML Template Injection (so we don't repeat it in every HTML file)
function injectSidebar() {
    return `
    <aside class="sidebar glass-panel" id="sidebar">
        <div class="sidebar-header">
            <div class="sidebar-logo">S</div>
            <div class="sidebar-title">SmartDash</div>
        </div>
        <ul class="nav-links">
            <li>
                <a href="index.html" class="nav-link">
                    <i class="fas fa-home"></i>
                    <span>Dashboard</span>
                </a>
            </li>
            <li>
                <a href="tasks.html" class="nav-link">
                    <i class="fas fa-check-square"></i>
                    <span>Tasks</span>
                </a>
            </li>
            <li>
                <a href="notes.html" class="nav-link">
                    <i class="fas fa-sticky-note"></i>
                    <span>Notes</span>
                </a>
            </li>
            <li>
                <a href="expenses.html" class="nav-link">
                    <i class="fas fa-wallet"></i>
                    <span>Expenses</span>
                </a>
            </li>
            <li>
                <a href="weather.html" class="nav-link">
                    <i class="fas fa-cloud-sun"></i>
                    <span>Weather</span>
                </a>
            </li>
            <li>
                <a href="profile.html" class="nav-link">
                    <i class="fas fa-user"></i>
                    <span>Profile</span>
                </a>
            </li>
        </ul>
        <div class="sidebar-footer">
            <button onclick="logout()" class="nav-link" style="width: 100%; background: transparent; border: none; cursor: pointer; text-align: left;">
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
            </button>
        </div>
    </aside>
    `;
}

// Header HTML Template Injection
function injectHeader(title, subtitle) {
    return `
    <header class="page-header">
        <div class="page-title">
            <div style="display: flex; align-items: center; gap: 15px;">
                <button id="mobile-nav-toggle" class="mobile-nav-toggle">
                    <i class="fas fa-bars"></i>
                </button>
                <div>
                    <h1>${title}</h1>
                    <p>${subtitle}</p>
                </div>
            </div>
        </div>
        <div class="user-profile">
            <div class="user-info" style="display: none;"> <!-- Hidden on very small screens -->
                <div class="user-name" id="header-user-name">User</div>
                <div class="user-role">Smart User</div>
            </div>
            <div class="avatar" id="header-avatar">U</div>
        </div>
    </header>
    `;
}
