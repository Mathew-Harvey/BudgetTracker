/**
 * Login page functionality for the Budget Tracker application
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');
    const loginBtnText = document.getElementById('login-btn-text');
    const loginBtnLoader = document.getElementById('login-btn-loader');
    
    // Handle form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember-me').checked;
            
            // Validate inputs
            if (!email || !password) {
                return showAlert('Please enter both email and password.');
            }
            
            // Show loading state
            setLoading(true);
            
            try {
                // Call login API
                const response = await API.auth.login({ email, password });
                
                // If remember me is checked, store data for extended session
                if (rememberMe) {
                    // Set longer expiration for token if needed 
                    // This depends on your backend implementation
                }
                
                // Show success message
                showAlert('Login successful! Redirecting...', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 1000);
                
            } catch (error) {
                console.error('Login error:', error);
                showAlert(error.message || 'Failed to log in. Please check your credentials.');
                setLoading(false);
            }
        });
    }
    
    // Handle loading state UI
    function setLoading(isLoading) {
        if (isLoading) {
            loginBtn.disabled = true;
            loginBtnText.style.display = 'none';
            loginBtnLoader.classList.remove('hidden');
        } else {
            loginBtn.disabled = false;
            loginBtnText.style.display = 'block';
            loginBtnLoader.classList.add('hidden');
        }
    }
    
    // Show alert message
    function showAlert(message, type = 'error') {
        const alertContainer = document.getElementById('alert-container');
        if (alertContainer) {
            const alertClass = type === 'success' ? 'alert-success' : 
                            type === 'warning' ? 'alert-warning' : 'alert-danger';
            
            alertContainer.innerHTML = `
                <div class="alert ${alertClass}">
                    ${message}
                </div>
            `;
            
            // Auto-hide alert after 5 seconds for success messages
            if (type === 'success') {
                setTimeout(() => {
                    alertContainer.innerHTML = '';
                }, 5000);
            }
        }
    }
}); 