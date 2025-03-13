/**
 * Reset password page functionality for the Budget Tracker application
 */

document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordForm = document.getElementById('reset-password-form');
    const resetBtn = document.getElementById('reset-btn');
    const resetBtnText = document.getElementById('reset-btn-text');
    const resetBtnLoader = document.getElementById('reset-btn-loader');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const passwordStrengthEl = document.getElementById('password-strength');
    const passwordMatchEl = document.getElementById('password-match');
    const resetTokenInput = document.getElementById('reset-token');
    
    // Extract token from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    // Set token in hidden input
    if (resetTokenInput && token) {
        resetTokenInput.value = token;
    } else if (!token) {
        // If no token is provided, show error and redirect to forgot password page
        showAlert('Invalid or missing reset token. Please request a new password reset.', 'error');
        setTimeout(() => {
            window.location.href = '/forgot-password.html';
        }, 3000);
    }
    
    // Add password strength checker
    if (passwordInput) {
        passwordInput.addEventListener('input', checkPasswordStrength);
    }
    
    // Add password match checker
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    }
    
    // Handle form submission
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            const resetToken = resetTokenInput.value;
            
            // Validate inputs
            if (!password || !confirmPassword) {
                return showAlert('Please fill in all required fields.');
            }
            
            if (password !== confirmPassword) {
                return showAlert('Passwords do not match.');
            }
            
            if (!isPasswordStrong(password)) {
                return showAlert('Please choose a stronger password.');
            }
            
            if (!resetToken) {
                return showAlert('Reset token is missing. Please request a new password reset.');
            }
            
            // Show loading state
            setLoading(true);
            
            try {
                // Call reset password API
                await API.auth.resetPassword(resetToken, { password });
                
                // Show success message
                showAlert('Password has been reset successfully! Redirecting to login...', 'success');
                
                // Redirect to login page after a delay
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
                
            } catch (error) {
                console.error('Reset password error:', error);
                showAlert(error.message || 'Failed to reset password. Please try again or request a new reset link.');
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
            resetBtn.disabled = true;
            resetBtnText.style.display = 'none';
            resetBtnLoader.classList.remove('hidden');
        } else {
            resetBtn.disabled = false;
            resetBtnText.style.display = 'block';
            resetBtnLoader.classList.add('hidden');
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