// httpservices.js
// Reusable HTTP service for GET, POST, PUT, DELETE requests

const http = {
  get: async function(url, options = {}) {
    const response = await fetch(url, { ...options, method: 'GET' });
    return handleResponse(response);
  },

  post: async function(url, data, options = {}) {
    const response = await fetch(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  
  put: async function(url, data, options = {}) {
    const response = await fetch(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  delete: async function(url, options = {}) {
    const response = await fetch(url, { ...options, method: 'DELETE' });
    return handleResponse(response);
  }
};

async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  if (response.status === 401) {
    // Unauthorized: clear auth and redirect to login
    localStorage.removeItem('tesp_auth');
    window.location.href = '/';
    return; // Stop further processing
  }
  if (!response.ok) {
    let errorText = await response.text();
    // Try to parse as JSON if possible
    let errorObj = null;
    if (contentType && contentType.indexOf('application/json') !== -1) {
      try {
        errorObj = JSON.parse(errorText);
      } catch (e) {}
    }
    throw errorObj || new Error(errorText || response.statusText);
  }
  if (contentType && contentType.indexOf('application/json') !== -1) {
    return response.json();
  }
  return response.text();
}

// Export for use in other modules
window.http = http;
