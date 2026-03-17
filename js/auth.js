window.Auth = {
    isAuthenticated() {
        return localStorage.getItem('tesp_auth') === 'true';
    },

    async login(username, password) {
        try {
            const data = await window.http.post('/api/login', { username, password });
            if (data.status === 'success') {
                localStorage.setItem('tesp_auth', 'true');
                return { success: true, message: data.message, expiresIn: data.expiresIn };
            } else {
                return { success: false, message: data.message || 'Login failed' };
            }
        } catch (e) {
            return { success: false, message: e.message || 'Network error' };
        }
    },

    async logout() {
        try {
            const res = await window.http.post('/api/logout');
            console.log('Logout success:', res && res.message ? res.message : res);
        } catch (e) {
            if (e && e.message) {
                console.error('Logout error:', e.message);
            } else {
                console.error('Logout error:', e);
            }
        }
        localStorage.removeItem('tesp_auth');
        window.location.reload();
    }
};
