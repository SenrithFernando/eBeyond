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

    // Submit form via EmailJS + Backend
    function submitForm() {
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        // Collect form data
        const firstName = contactForm.querySelector('[name="first_name"]').value;
        const lastName = contactForm.querySelector('[name="last_name"]').value;
        const email = contactForm.querySelector('[name="email"]').value;
        const telephone = contactForm.querySelector('[name="telephone"]').value;
        const message = contactForm.querySelector('[name="message"]').value;

        // Prepare EmailJS parameters (match EmailJS template variables)
        const emailParams = {
            user_name: firstName + ' ' + lastName,
            user_email: email,
            message: message,
            phone: telephone || 'N/A',
            to_email: 'rihansenrith@gmail.com'
        };

            ensureEmailJSInitialized()
                .then(() => {
                    return window.emailjs.send('service_7byi7fq', 'template_zqizdbl', emailParams);
                })
                .then(function(response) {
                    console.log('EmailJS Response:', response);
                
                    // Check if there were validation errors from backend
                    if (response.status === 400 && response.errors) {
                        displayBackendErrors(response.errors);
                        throw new Error('Validation failed');
                    }
                    
                    if (response.status !== 200) {
                        throw new Error(response.text || 'Unknown error');
                    }

                    // Success - now optionally save again to backend (already saved by wrapper)
                    console.log('Message saved successfully');
                    showMessage('Thank you! Your message has been sent successfully. We will get back to you soon.', 'success');
                    contactForm.reset();
                    termsCheckbox.classList.remove('is-invalid');
                    
                    // Auto-hide success message after 5 seconds
                    setTimeout(() => {
                        formMessage.style.display = 'none';
                    }, 5000);
                    return response;
                })
                .catch(error => {
                    console.error('EmailJS error:', error);

                    // If validation errors, already displayed above
                    if (error.message === 'Validation failed') {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                        return;
                    }

                    // For other errors, show generic message
                    showMessage('Error: ' + error.message, 'danger');
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                });
    }

        function loadEmailJSScript() {
            return new Promise((resolve, reject) => {
                if (window.emailjs) return resolve(window.emailjs);

                const cdnUrls = [
                    'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/index.min.js',
                    'https://unpkg.com/@emailjs/browser@3/dist/index.min.js'
                ];

                let idx = 0;

                function tryCdn() {
                    if (idx >= cdnUrls.length) {
                        // All CDNs failed — fall back to local wrapper
                        const local = document.createElement('script');
                        local.src = '/eBeyonds/js/emailjs/emailjs-local.js';
                        local.async = true;
                        local.setAttribute('data-emailjs', '1');
                        local.onload = () => {
                            if (window.emailjs) return resolve(window.emailjs);
                            setTimeout(() => {
                                if (window.emailjs) return resolve(window.emailjs);
                                reject(new Error('EmailJS wrapper loaded but not available'));
                            }, 50);
                        };
                        local.onerror = () => reject(new Error('Failed to load EmailJS wrapper (local)'));
                        document.head.appendChild(local);
                        return;
                    }

                    const script = document.createElement('script');
                    script.src = cdnUrls[idx];
                    script.async = true;
                    script.setAttribute('data-emailjs-cdn', idx);
                    script.onload = () => {
                        if (window.emailjs) return resolve(window.emailjs);
                        // wait a tick, then if still not available try next
                        setTimeout(() => {
                            if (window.emailjs) return resolve(window.emailjs);
                            idx++;
                            document.head.removeChild(script);
                            tryCdn();
                        }, 60);
                    };
                    script.onerror = () => {
                        idx++;
                        tryCdn();
                    };
                    document.head.appendChild(script);
                }

                tryCdn();
            });
        }

        function ensureEmailJSInitialized() {
            return new Promise((resolve, reject) => {
                loadEmailJSScript().then(() => {
                    try {
                        if (!window.emailjs.__initialized) {
                            // Replace the public key below with your EmailJS Public Key if different
                            window.emailjs.init && window.emailjs.init('ydL5BIdCscYu9cchS');
                            window.emailjs.__initialized = true;
                        }
                        resolve(window.emailjs);
                    } catch (err) {
                        reject(err);
                    }
                }).catch(reject);
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
