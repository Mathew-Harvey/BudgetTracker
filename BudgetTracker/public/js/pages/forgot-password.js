/**
 * Forgot password page functionality for the Budget Tracker application
 */

document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const resetBtn = document.getElementById('reset-btn');
    const resetBtnText = document.getElementById('reset-btn-text');
    const resetBtnLoader = document.getElementById('reset-btn-loader');
    
    // Handle form submission
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const email = document.getElementById('email').value;
            
            // Validate inputs
            if (!email) {
                return showAlert('Please enter your email address.');
            }
            
            // Show loading state
            setLoading(true);
            
            try {
                // Call forgot password API
                await API.auth.forgotPassword({ email });
                
                // Show success message
                showAlert('Password reset instructions have been sent to your email.', 'success');
                
                // Clear the form
                forgotPasswordForm.reset();
                
                // Reset loading state
                setLoading(false);
                
            } catch (error) {
                console.error('Forgot password error:', error);
                showAlert(error.message || 'Failed to send reset instructions. Please try again.');
                setLoading(false);
            }
        });
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