window.Auth = {
    isAuthenticated() {
        return localStorage.getItem('tesp_auth') === 'true';
    },

    login(email, password) {
        // Mock validation
        if (email && password) {
            localStorage.setItem('tesp_auth', 'true');
            return true;
        }
        return false;
    },

    logout() {
        localStorage.removeItem('tesp_auth');
        window.location.reload();
    }
};
