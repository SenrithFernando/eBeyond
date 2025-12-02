/**
 * Local EmailJS Wrapper
 * Simulates EmailJS API but sends via your backend PHP instead
 * This avoids CDN blocking while maintaining EmailJS-compatible API
 */

window.emailjs = window.emailjs || {};

(function() {
    let initialized = false;
    let publicKey = 'ydL5BIdCscYu9cchS';

    emailjs.init = function(key) {
        publicKey = key;
        initialized = true;
        console.log('EmailJS initialized locally (backend mode) with public key:', key.slice(0, 5) + '...');
    };

    emailjs.send = function(serviceId, templateId, params) {
        return new Promise((resolve, reject) => {
            if (!initialized) {
                return reject(new Error('EmailJS not initialized. Call emailjs.init() first.'));
            }

            // Map EmailJS params to backend form field names
            const fieldMapping = {
                'from_name': 'first_name',  // kept for backward-compatibility
                'user_name': 'first_name',  // will be split into first/last below
                'from_email': 'email',
                'user_email': 'email',
                'phone': 'telephone',
                'message': 'message'
            };

            // Prepare form data to send to backend
            const formData = new FormData();
            
            // Map params to backend field names
            for (let key in params) {
                if (params.hasOwnProperty(key)) {
                    let backendKey = fieldMapping[key] || key;
                    formData.append(backendKey, params[key]);
                }
            }

            // Split name (try 'user_name' then 'from_name') into first_name and last_name
            const fromName = params.user_name || params.from_name || '';
            const nameParts = fromName.trim() ? fromName.trim().split(/\s+/) : [];
            if (nameParts.length >= 2) {
                formData.set('first_name', nameParts[0]);
                formData.set('last_name', nameParts.slice(1).join(' '));
            } else if (nameParts.length === 1) {
                formData.set('first_name', nameParts[0]);
                formData.set('last_name', '');
            }

            // Add agreed_terms checkbox (required by backend)
            formData.set('agreed_terms', '1');

            console.log('Sending form data to backend:', Object.fromEntries(formData));

            // Send to backend email handler (absolute path from root)
            fetch('/eBeyonds/php/insertContact.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Simulate EmailJS response
                    resolve({
                        status: 200,
                        text: 'Email sent successfully (backend)',
                        messageId: data.messageId
                    });
                } else {
                    // Pass through validation errors as resolved response (not rejected)
                    // so the frontend can display them properly
                    resolve({
                        status: 400,
                        text: data.message || 'Validation error',
                        errors: data.errors || null,
                        data: data
                    });
                }
            })
            .catch(error => {
                reject(new Error('Backend email handler error: ' + error.message));
            });
        });
    };

    // Mark as loaded globally
    window.emailjs.__initialized = false;
})();
