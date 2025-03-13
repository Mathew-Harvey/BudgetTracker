/**
 * Registration page functionality for the Budget Tracker application
 */

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const registerBtn = document.getElementById('register-btn');
    const registerBtnText = document.getElementById('register-btn-text');
    const registerBtnLoader = document.getElementById('register-btn-loader');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const passwordStrengthEl = document.getElementById('password-strength');
    const passwordMatchEl = document.getElementById('password-match');
    
    // Add password strength checker
    if (passwordInput) {
        passwordInput.addEventListener('input', checkPasswordStrength);
    }
    
    // Add password match checker
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    }
    
    // Handle form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            const termsChecked = document.getElementById('terms').checked;
            
            // Validate inputs
            if (!name || !email || !password) {
                return showAlert('Please fill in all required fields.');
            }
            
            if (password !== confirmPassword) {
                return showAlert('Passwords do not match.');
            }
            
            if (!isPasswordStrong(password)) {
                return showAlert('Please choose a stronger password.');
            }
            
            if (!termsChecked) {
                return showAlert('You must agree to the Terms of Service and Privacy Policy.');
            }
            
            // Show loading state
            setLoading(true);
            
            try {
                // Call register API
                const response = await API.auth.register({ 
                    name, 
                    email, 
                    password,
                    profileName: name 
                });
                
                // Show success message
                showAlert('Registration successful! Redirecting to dashboard...', 'success');
                
                // Redirect to dashboard after a delay
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 1500);
                
            } catch (error) {
                console.error('Registration error:', error);
                showAlert(error.message || 'Failed to register account. Please try again.');
                setLoading(false);
            }
        });
    }
    
    // Check password strength
    function checkPasswordStrength() {
        const password = passwordInput.value;
        
        if (!password) {
            passwordStrengthEl.textContent = '';
            return;
        }
        
        // Check password strength
        const strength = getPasswordStrength(password);
        
        // Update UI based on strength
        if (strength === 'strong') {
            passwordStrengthEl.textContent = 'Strong password';
            passwordStrengthEl.style.color = 'var(--success-color)';
        } else if (strength === 'medium') {
            passwordStrengthEl.textContent = 'Medium strength password';
            passwordStrengthEl.style.color = 'var(--warning-color)';
        } else {
            passwordStrengthEl.textContent = 'Weak password - use at least 8 characters with letters, numbers, and symbols';
            passwordStrengthEl.style.color = 'var(--danger-color)';
        }
    }
    
    // Calculate password strength
    function getPasswordStrength(password) {
        // Criteria:
        // - At least 8 characters
        // - Contains numbers
        // - Contains uppercase and lowercase letters
        // - Contains special characters
        
        let score = 0;
        
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/\d/.test(password)) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;
        
        if (score >= 4) return 'strong';
        if (score >= 3) return 'medium';
        return 'weak';
    }
    
    // Check if password is sufficiently strong
    function isPasswordStrong(password) {
        return getPasswordStrength(password) !== 'weak';
    }
    
    // Check if passwords match
    function checkPasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (!confirmPassword) {
            passwordMatchEl.textContent = '';
            return;
        }
        
        if (password === confirmPassword) {
            passwordMatchEl.textContent = 'Passwords match';
            passwordMatchEl.style.color = 'var(--success-color)';
        } else {
            passwordMatchEl.textContent = 'Passwords do not match';
            passwordMatchEl.style.color = 'var(--danger-color)';
        }
    }
    
    // Handle loading state UI
    function setLoading(isLoading) {
        if (isLoading) {
            registerBtn.disabled = true;
            registerBtnText.style.display = 'none';
            registerBtnLoader.classList.remove('hidden');
        } else {
            registerBtn.disabled = false;
            registerBtnText.style.display = 'block';
            registerBtnLoader.classList.add('hidden');
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