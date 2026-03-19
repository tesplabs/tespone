// Generic API loader and UI mapper for forms defined in window.appConfig
// Usage: call loadAndMapForm('network') or loadAndMapForm('mqtt')

function loadAndMapForm(formId) {
    const menu = window.appConfig.menu;
    const formConfig = menu.find(item => item.id === formId && item.type === 'form');
    if (!formConfig || !formConfig.api) {
        console.warn('No API configured for form:', formId);
        return;
    }
    // Get access token from Auth module if available
    let accessToken = '';
    if (window.Auth && typeof window.Auth.getAccessToken === 'function') {
        accessToken = window.Auth.getAccessToken();
    } else if (window.Auth && window.Auth.token) {
        accessToken = window.Auth.token;
    }
    fetch(formConfig.api, {
        headers: {
            'Accept': 'application/json',
            ...(accessToken ? { 'Authorization': 'Bearer ' + accessToken } : {})
        }
    })
        .then(res => {
            if (!res.ok) throw new Error('API error: ' + res.status);
            return res.json();
        })
        .then(data => {
            formConfig.fields.forEach(field => {
                const value = data[field.name];
                // Try both [name=] and [id=] selectors for flexibility
                const el = document.querySelector(`#form-${formId} [name='${field.name}'], #form-${formId} [id='${field.name}']`);
                if (el) {
                    if (field.type === 'checkbox') {
                        // Accept boolean, 'yes', 'true', '1' as checked
                        if (typeof value === 'string') {
                            el.checked = value.toLowerCase() === 'yes' || value.toLowerCase() === 'true' || value === '1';
                        } else {
                            el.checked = !!value;
                        }
                    } else {
                        el.value = value !== undefined ? value : '';
                    }
                }
            });
        })
        .catch(err => {
            console.error('API fetch error for', formId, err);
        });
}

// Example: call this after rendering the form HTML for 'network' or 'mqtt'
// loadAndMapForm('network');
// loadAndMapForm('mqtt');
