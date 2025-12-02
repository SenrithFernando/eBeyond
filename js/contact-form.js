// Handle contact form submission
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    const termsCheckbox = document.getElementById('termsCheck');

    if (!contactForm) return;

    // Validate terms checkbox before form submission
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Check if terms checkbox is checked
        if (!termsCheckbox || !termsCheckbox.checked) {
            showMessage('You must agree to the Terms & Conditions to proceed', 'danger');
            // Highlight the checkbox
            if (termsCheckbox) {
                termsCheckbox.classList.add('is-invalid');
            }
            return false;
        }

        // Remove invalid class if checkbox is checked
        if (termsCheckbox) {
            termsCheckbox.classList.remove('is-invalid');
        }

        // Validate all required fields
        const firstName = contactForm.querySelector('[name="first_name"]');
        const lastName = contactForm.querySelector('[name="last_name"]');
        const email = contactForm.querySelector('[name="email"]');
        const message = contactForm.querySelector('[name="message"]');

        if (!firstName.value.trim()) {
            showMessage('First name is required', 'danger');
            firstName.focus();
            return false;
        }

        if (!lastName.value.trim()) {
            showMessage('Last name is required', 'danger');
            lastName.focus();
            return false;
        }

        if (!email.value.trim() || !isValidEmail(email.value)) {
            showMessage('Valid email is required', 'danger');
            email.focus();
            return false;
        }

        if (!message.value.trim()) {
            showMessage('Message is required', 'danger');
            message.focus();
            return false;
        }

        // All validations passed, submit form
        submitForm();
    });

    // Remove invalid class when checkbox is clicked
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', function() {
            if (this.checked) {
                this.classList.remove('is-invalid');
            }
        });
    }

    // Validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Show message helper
    function showMessage(message, type) {
        formMessage.style.display = 'block';
        formMessage.className = `alert alert-${type}`;
        formMessage.textContent = message;
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Submit form via AJAX
    function submitForm() {
        // Create FormData object
        const formData = new FormData(contactForm);

        // Show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        // Send to server
        fetch('./php/insertContact.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Success
                showMessage(data.message, 'success');
                contactForm.reset();
                termsCheckbox.classList.remove('is-invalid');
                
                // Auto-hide success message after 5 seconds
                setTimeout(() => {
                    formMessage.style.display = 'none';
                }, 5000);
            } else {
                // Check if there are field-specific errors (backend validation)
                if (data.errors && typeof data.errors === 'object') {
                    displayBackendErrors(data.errors);
                } else {
                    // General error message
                    showMessage(data.message, 'danger');
                }
            }
        })
        .catch(error => {
            showMessage('Error sending message. Please try again.', 'danger');
            console.error('Error:', error);
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
    }

    // Helper function to display backend validation errors
    function displayBackendErrors(errors) {
        let errorHTML = '<strong>Please correct the following errors:</strong><ul>';
        for (let field in errors) {
            errorHTML += `<li>${errors[field]}</li>`;
        }
        errorHTML += '</ul>';
        
        formMessage.style.display = 'block';
        formMessage.className = 'alert alert-danger';
        formMessage.innerHTML = errorHTML;
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});
