/**
 * EmailJS Configuration
 * 
 * To set up EmailJS:
 * 1. Go to https://www.emailjs.com/ and create an account
 * 2. Create an Email Service (Gmail, Outlook, etc.)
 * 3. Create an Email Template with variables: {{user_name}}, {{user_email}}, {{message}}, {{phone}}
 * 4. Get your Public Key from EmailJS Dashboard > Account > API Keys
 * 5. Update the configuration below with your credentials:
 */
const EMAILJS_CONFIG = {
    // Your EmailJS Public Key (found in EmailJS Dashboard > Account > API Keys)
    PUBLIC_KEY: 'ydL5BIdCscYu9cchS',
    
    // Your EmailJS Service ID (found in EmailJS Dashboard > Email Services)
    SERVICE_ID: 'service_7byi7fq',
    
    // Your EmailJS Template ID (found in EmailJS Dashboard > Email Templates)
    TEMPLATE_ID: 'template_zqizdbl',
    
    // Recipient email (can also be set in EmailJS template)
    TO_EMAIL: 'rihansenrith@gmail.com'
};

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

    // Submit form via EmailJS + Database
    function submitForm() {
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        // Collect form data
        const firstName = contactForm.querySelector('[name="first_name"]').value.trim();
        const lastName = contactForm.querySelector('[name="last_name"]').value.trim();
        const email = contactForm.querySelector('[name="email"]').value.trim();
        const telephone = contactForm.querySelector('[name="telephone"]').value.trim();
        const message = contactForm.querySelector('[name="message"]').value.trim();

        // Prepare EmailJS parameters (match EmailJS template variables)
        // Include multiple variable name formats for compatibility
        const fullName = firstName + ' ' + lastName;
        const emailParams = {
            // Common variable names
            user_name: fullName,
            user_email: email,
            message: message,
            phone: telephone || 'N/A',
            telephone: telephone || 'N/A',
            // Alternative variable names
            from_name: fullName,
            from_email: email,
            name: fullName,
            email: email,
            // Additional fields
            first_name: firstName,
            last_name: lastName,
            to_email: EMAILJS_CONFIG.TO_EMAIL,
            // Subject line (if template uses it)
            subject: `New contact form submission from ${fullName}`
        };

        // Prepare form data for database
        const formData = new FormData();
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('email', email);
        formData.append('telephone', telephone);
        formData.append('message', message);
        formData.append('agreed_terms', '1');

        // Function to save to database
        function saveToDatabase() {
            return fetch('/eBeyonds/php/insertContact.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    // If validation errors, return them
                    if (data.errors) {
                        return { success: false, errors: data.errors, message: data.message };
                    }
                    throw new Error(data.message || 'Database save failed');
                }
                return { success: true, messageId: data.messageId };
            });
        }

        // Function to check if using local wrapper
        function isUsingLocalWrapper() {
            if (!window.emailjs || !window.emailjs.send) return false;
            const emailjsStr = window.emailjs.send.toString();
            return emailjsStr.includes('insertContact.php') || 
                   emailjsStr.includes('api.emailjs.com/api/v1.0/email/send');
        }

        // Function to send via EmailJS
        function sendViaEmailJS() {
            return ensureEmailJSInitialized()
                .then(() => {
                    // Check if using real EmailJS or local wrapper
                    const usingWrapper = isUsingLocalWrapper();
                    
                    if (usingWrapper) {
                        // Local wrapper - it handles BOTH EmailJS REST API and database
                        console.log('Using local wrapper - will send via EmailJS REST API and save to database');
                        return window.emailjs.send(
                            EMAILJS_CONFIG.SERVICE_ID, 
                            EMAILJS_CONFIG.TEMPLATE_ID, 
                            emailParams
                        );
                    } else {
                        // Real EmailJS SDK - use it for email
                        console.log('Using real EmailJS SDK');
                        return window.emailjs.send(
                            EMAILJS_CONFIG.SERVICE_ID, 
                            EMAILJS_CONFIG.TEMPLATE_ID, 
                            emailParams
                        );
                    }
                });
        }

        // Check if using wrapper (it handles both EmailJS and database)
        ensureEmailJSInitialized()
        .then(() => {
            const usingWrapper = isUsingLocalWrapper();
            
            if (usingWrapper) {
                // Wrapper handles both EmailJS and database
                console.log('Wrapper mode: handling both EmailJS and database');
                return sendViaEmailJS()
                    .then(result => {
                        console.log('Wrapper Result (EmailJS + Database):', result);
                        
                        // Check for validation errors
                        if (result.status === 400 && result.errors) {
                            displayBackendErrors(result.errors);
                            throw new Error('Validation failed');
                        }
                        
                        if (result.status !== 200) {
                            throw new Error(result.text || 'Submission failed');
                        }
                        
                        // Success
                        const emailjsSuccess = result.emailjsData || !result.emailjsError;
                        if (emailjsSuccess) {
                            showMessage('Thank you! Your message has been sent successfully via EmailJS and saved to database. We will get back to you soon.', 'success');
                        } else {
                            showMessage('Thank you! Your message has been saved to our database. Email notification may have failed, but we received your message.', 'success');
                        }
                        
                        // Reset form
                        contactForm.reset();
                        if (termsCheckbox) {
                            termsCheckbox.classList.remove('is-invalid');
                        }
                        
                        // Auto-hide success message after 5 seconds
                        setTimeout(() => {
                            formMessage.style.display = 'none';
                        }, 5000);
                    });
            } else {
                // Real EmailJS - send to both EmailJS and database separately
                console.log('Real EmailJS mode: sending to EmailJS and database separately');
                return Promise.all([
                    sendViaEmailJS().catch(err => {
                        console.warn('EmailJS error (non-critical):', err);
                        return { status: 500, text: 'EmailJS failed but continuing', error: err.message };
                    }),
                    saveToDatabase().catch(err => {
                        console.error('Database save error:', err);
                        throw err; // Database save is critical
                    })
                ])
                .then(([emailjsResult, dbResult]) => {
                    console.log('EmailJS Result:', emailjsResult);
                    console.log('Database Result:', dbResult);

                    // Check database result first (it's critical)
                    if (!dbResult.success) {
                        if (dbResult.errors) {
                            displayBackendErrors(dbResult.errors);
                            throw new Error('Validation failed');
                        }
                        throw new Error(dbResult.message || 'Failed to save to database');
                    }

                    // Check EmailJS result (non-critical but log it)
                    const emailjsSuccess = emailjsResult.status === 200;
                    
                    if (emailjsSuccess) {
                        showMessage('Thank you! Your message has been sent successfully via EmailJS and saved to database. We will get back to you soon.', 'success');
                    } else {
                        // Database saved but EmailJS failed - still show success but with note
                        showMessage('Thank you! Your message has been saved to our database. Email notification may have failed, but we received your message.', 'success');
                    }
                    
                    // Reset form
                    contactForm.reset();
                    if (termsCheckbox) {
                        termsCheckbox.classList.remove('is-invalid');
                    }
                    
                    // Auto-hide success message after 5 seconds
                    setTimeout(() => {
                        formMessage.style.display = 'none';
                    }, 5000);
                });
            }
        })
        .catch(error => {
            console.error('Form submission error:', error);

            // If validation errors, already displayed
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
                // Check if EmailJS is already loaded (from static script tag or previous load)
                if (window.emailjs) {
                    // Wait a moment for it to fully initialize
                    setTimeout(() => {
                        const emailjsStr = window.emailjs.send ? window.emailjs.send.toString() : '';
                        const isRealEmailJS = !emailjsStr.includes('insertContact.php') && 
                                             !emailjsStr.includes('FormData') &&
                                             (window.emailjs.sendForm || emailjsStr.length > 200);
                        if (isRealEmailJS) {
                            console.log('Real EmailJS already loaded (from static script or previous load)');
                            return resolve(window.emailjs);
                        }
                        // If it's the wrapper, continue to try loading real EmailJS
                        console.log('Local wrapper detected, attempting to load real EmailJS...');
                        tryLoadFromCDN();
                    }, 100);
                    return;
                }
                
                // EmailJS not loaded yet, try to load it
                tryLoadFromCDN();
                
                function tryLoadFromCDN() {

                    const cdnUrls = [
                        'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/index.min.js',
                        'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/index.min.js',
                        'https://unpkg.com/@emailjs/browser@4/dist/index.min.js',
                        'https://unpkg.com/@emailjs/browser@3/dist/index.min.js',
                        'https://cdnjs.cloudflare.com/ajax/libs/emailjs/4.0.0/email.min.js'
                    ];

                    let idx = 0;

                    function tryCdn() {
                    if (idx >= cdnUrls.length) {
                        // All CDNs failed — fall back to local wrapper as last resort
                        console.warn('All EmailJS CDNs failed, falling back to local wrapper');
                        const local = document.createElement('script');
                        local.src = '/eBeyonds/js/emailjs/emailjs-local.js';
                        local.async = true;
                        local.setAttribute('data-emailjs', 'local-wrapper');
                        local.onload = () => {
                            if (window.emailjs) {
                                console.log('Local EmailJS wrapper loaded');
                                return resolve(window.emailjs);
                            }
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
                        // Wait a bit for EmailJS to fully initialize
                        setTimeout(() => {
                            // Check if real EmailJS loaded
                            if (window.emailjs && window.emailjs.send) {
                                const emailjsStr = window.emailjs.send.toString();
                                const isRealEmailJS = !emailjsStr.includes('insertContact.php') && 
                                                     !emailjsStr.includes('FormData') &&
                                                     (window.emailjs.sendForm || emailjsStr.length > 200);
                                if (isRealEmailJS) {
                                    console.log('Real EmailJS SDK loaded from CDN:', cdnUrls[idx]);
                                    return resolve(window.emailjs);
                                }
                            }
                            // Try again after a longer delay (some CDNs load async)
                            setTimeout(() => {
                                if (window.emailjs && window.emailjs.send) {
                                    const emailjsStr = window.emailjs.send.toString();
                                    const isRealEmailJS = !emailjsStr.includes('insertContact.php') && 
                                                         !emailjsStr.includes('FormData');
                                    if (isRealEmailJS) {
                                        console.log('Real EmailJS SDK loaded from CDN (delayed):', cdnUrls[idx]);
                                        return resolve(window.emailjs);
                                    }
                                }
                                // Not real EmailJS, try next CDN
                                console.warn('EmailJS not properly loaded from:', cdnUrls[idx]);
                                idx++;
                                if (script.parentNode) {
                                    document.head.removeChild(script);
                                }
                                tryCdn();
                            }, 200);
                        }, 150);
                    };
                    script.onerror = () => {
                        idx++;
                        if (script.parentNode) {
                            document.head.removeChild(script);
                        }
                        tryCdn();
                    };
                    document.head.appendChild(script);
                    }

                    tryCdn();
                }
            });
        }

        function ensureEmailJSInitialized() {
            return new Promise((resolve, reject) => {
                loadEmailJSScript().then(() => {
                    try {
                        // Check if EmailJS is already initialized
                        const isInitialized = window.emailjs.__initialized || 
                                            (window.emailjs.init && window.emailjs._publicKey);
                        
                        if (!isInitialized) {
                            // Initialize EmailJS with your Public Key from config
                            if (window.emailjs.init) {
                                window.emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
                            }
                            window.emailjs.__initialized = true;
                            console.log('EmailJS initialized successfully with Public Key:', EMAILJS_CONFIG.PUBLIC_KEY.substring(0, 5) + '...');
                        }
                        resolve(window.emailjs);
                    } catch (err) {
                        console.error('EmailJS initialization error:', err);
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
