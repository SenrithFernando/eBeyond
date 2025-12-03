// Only create wrapper if real EmailJS is not already loaded
// Real EmailJS has sendForm method or send function doesn't include our wrapper code
(function() {
    'use strict';
    
    const isRealEmailJS = window.emailjs && 
                         window.emailjs.send && 
                         (!window.emailjs.send.toString().includes('insertContact.php') || 
                          window.emailjs.sendForm);

    if (isRealEmailJS) {
        // Real EmailJS is already loaded, don't create wrapper
        console.log('Real EmailJS already loaded, skipping local wrapper');
        return;
    }
    // Real EmailJS not loaded, create wrapper
    window.emailjs = window.emailjs || {};

(function() {
    let initialized = false;
    let publicKey = '';

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
                'from_name': 'first_name',  
                'user_name': 'first_name',  
                'from_email': 'email',
                'user_email': 'email',
                'phone': 'telephone',
                'message': 'message'
            };

            // Prepare form data to send to database
            const formData = new FormData();
            
            // If first_name and last_name are already in params, use them directly
            if (params.first_name && params.last_name) {
                formData.append('first_name', params.first_name);
                formData.append('last_name', params.last_name);
            } else {
                // Otherwise, try to split from full name
                const fromName = params.user_name || params.from_name || params.name || '';
                const nameParts = fromName.trim() ? fromName.trim().split(/\s+/) : [];
                if (nameParts.length >= 2) {
                    formData.append('first_name', nameParts[0]);
                    formData.append('last_name', nameParts.slice(1).join(' '));
                } else if (nameParts.length === 1) {
                    formData.append('first_name', nameParts[0]);
                    formData.append('last_name', '');
                } else if (params.first_name) {
                    formData.append('first_name', params.first_name);
                    formData.append('last_name', params.last_name || '');
                }
            }
            
            // Map other params to backend field names
            const emailValue = params.user_email || params.from_email || params.email || '';
            const phoneValue = params.phone || params.telephone || '';
            const messageValue = params.message || '';
            
            if (emailValue) formData.append('email', emailValue);
            if (phoneValue) formData.append('telephone', phoneValue);
            if (messageValue) formData.append('message', messageValue);

            // Add agreed_terms checkbox 
            formData.set('agreed_terms', '1');

            console.log('Sending to EmailJS REST API and database...');
            console.log('EmailJS params:', params);
            console.log('EmailJS config:', { serviceId, templateId, publicKey: publicKey.substring(0, 5) + '...' });

            // Send to BOTH EmailJS REST API and Database in parallel
            const emailjsPromise = fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    service_id: serviceId,
                    template_id: templateId,
                    user_id: publicKey,
                    template_params: params
                })
            })
            .then(async response => {
                if (response.ok) {
                    // EmailJS API returns "OK" as plain text on success, or JSON in some cases
                    const contentType = response.headers.get('content-type');
                    let data;
                    try {
                        if (contentType && contentType.includes('application/json')) {
                            data = await response.json();
                        } else {
                            const text = await response.text();
                            // If response is "OK" or empty, consider it success
                            data = text === 'OK' || text === '' ? { status: 'OK' } : JSON.parse(text);
                        }
                    } catch (e) {
                        // If parsing fails but status is OK, it's still success
                        const text = await response.text();
                        data = { status: text === 'OK' ? 'OK' : 'success', response: text };
                    }
                    return {
                        status: 200,
                        text: 'Email sent successfully via EmailJS',
                        emailjsData: data
                    };
                } else {
                    const errorText = await response.text();
                    return {
                        status: response.status,
                        text: 'EmailJS API error: ' + errorText,
                        error: true
                    };
                }
            })
            .catch(error => {
                console.warn('EmailJS REST API error (non-critical):', error);
                return {
                    status: 500,
                    text: 'EmailJS API failed: ' + error.message,
                    error: true
                };
            });

            const databasePromise = fetch('/eBeyonds/php/insertContact.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    return {
                        success: true,
                        messageId: data.messageId,
                        message: 'Saved to database successfully'
                    };
                } else {
                    return {
                        success: false,
                        message: data.message || 'Database save failed',
                        errors: data.errors || null
                    };
                }
            })
            .catch(error => {
                console.error('Database save error:', error);
                return {
                    success: false,
                    message: 'Database error: ' + error.message,
                    error: true
                };
            });

            // Wait for both operations
            Promise.all([emailjsPromise, databasePromise])
            .then(([emailjsResult, dbResult]) => {
                console.log('EmailJS Result:', emailjsResult);
                console.log('Database Result:', dbResult);

                // Database save is critical - fail if it fails
                if (!dbResult.success) {
                    if (dbResult.errors) {
                        resolve({
                            status: 400,
                            text: dbResult.message || 'Validation error',
                            errors: dbResult.errors,
                            emailjsStatus: emailjsResult.status
                        });
                    } else {
                        reject(new Error('Database save failed: ' + dbResult.message));
                    }
                    return;
                }

                // Both succeeded or EmailJS failed but DB succeeded
                if (emailjsResult.status === 200) {
                    resolve({
                        status: 200,
                        text: 'Email sent via EmailJS and saved to database',
                        messageId: dbResult.messageId,
                        emailjsData: emailjsResult.emailjsData
                    });
                } else {
                    // Database saved but EmailJS failed - still success but note the issue
                    resolve({
                        status: 200,
                        text: 'Saved to database. EmailJS notification failed but message was received.',
                        messageId: dbResult.messageId,
                        emailjsError: emailjsResult.text
                    });
                }
            })
            .catch(error => {
                reject(new Error('Form submission error: ' + error.message));
            });
        });
    };

    // Mark as loaded globally
    window.emailjs.__initialized = false;
})();
})();
