// auth.js - Handles Authentication and Session

// Check authentication on page load
function checkAuth(requireAuth = true) {
    const userStr = localStorage.getItem('smart_dashboard_user');
    const isLoggedIn = userStr !== null;
    
    // Pages like login.html/signup.html shouldn't be accessed if logged in
    const path = window.location.pathname;
    const isAuthPage = path.endsWith('login.html') || path.endsWith('signup.html');
    
    // Redirect if accessing a protected page while not logged in
    if (requireAuth && !isLoggedIn && !isAuthPage) {
        window.location.href = 'login.html';
        return null;
    }
    
    // Redirect to dashboard if accessing auth pages while already logged in
    if (isLoggedIn && isAuthPage) {
        window.location.href = 'index.html';
    }
    
    return isLoggedIn ? JSON.parse(userStr) : null;
}

// Global user object
const currentUser = checkAuth();

// Show user info in header if element exists
document.addEventListener('DOMContentLoaded', () => {
    const userNameEl = document.getElementById('header-user-name');
    const avatarEl = document.getElementById('header-avatar');
    
    if (userNameEl && currentUser) {
        userNameEl.textContent = currentUser.name;
    }
    
    if (avatarEl && currentUser) {
        avatarEl.textContent = currentUser.name.charAt(0).toUpperCase();
    }
});

// Logout function
function logout() {
    localStorage.removeItem('smart_dashboard_user');
    window.location.href = 'login.html';
}
