window.Router = {
    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute(); // Handle initial load
    },

    handleRoute() {
        if (!window.Auth.isAuthenticated()) {
            window.UI.renderLogin(document.getElementById('app'), async () => {
                const app = document.getElementById('app');
                const username = app.querySelector('input[name="username"]').value;
                const password = app.querySelector('input[name="password"]').value;
                const result = await window.Auth.login(username, password);
                
                if (result.success) {
                    this.forceReload();
                } else {
                    // Show error message below the form
                    let err = app.querySelector('.login-error');
                    if (!err) {
                        err = document.createElement('div');
                        err.className = 'login-error';
                        err.style.color = 'red';
                        err.style.marginTop = '12px';
                        app.querySelector('form').appendChild(err);
                    }
                    // Show inner message if present, else fallback
                    const errorMsg = (result && result.message && result.message.message) ? result.message.message : result.message;
                    console.error('Login failed:', errorMsg);
                    err.textContent = errorMsg;
                }
            });
            return;
        }

        const hash = window.location.hash.slice(1) || 'home';
        const appContainer = document.getElementById('app');

        // Ensure layout is there (Header + Content Wrapper)
        // We only re-render layout if it's not already there or if we just logged in
        if (!document.querySelector('.app-header')) {
            window.UI.renderLayout(appContainer, window.appConfig.menu);
        }

        // Highlight active menu
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${hash}`) {
                link.classList.add('active');
            }
        });

        // Resolve Content
        const mainContent = document.getElementById('main-content');
        this.renderPage(hash, mainContent);
    },

    renderPage(routeId, container) {
        container.innerHTML = '';
        const menuItem = window.appConfig.menu.find(m => m.id === routeId);

        if (!menuItem) {
            container.innerHTML = '<h1>404 - Page Not Found</h1>';
            return;
        }

        if (menuItem.type === 'page') {
            container.innerHTML = menuItem.content;
        } else if (menuItem.type === 'form') {
            const formContainer = window.UI.createForm(
                menuItem,
                (data) => {
                    console.log(`[API Mock] Saving data for ${menuItem.id}:`, data);
                    alert('Settings saved! (Check console for payload)');
                },
                () => {
                    console.log('Form cancelled/reset');
                }
            );
            container.appendChild(formContainer);
            // Fetch and map API data for this form if api property exists
            if (typeof loadAndMapForm === 'function' && menuItem.api) {
                loadAndMapForm(menuItem.id);
            }
        } else if (menuItem.type === 'maintenance') {
            window.UI.renderMaintenance(container);
        } else if (menuItem.type === 'display') {
            // If API is specified, fetch data, else render with empty/default
            if (menuItem.api) {
                // Get access token from Auth module if available
                let accessToken = '';
                if (window.Auth && typeof window.Auth.getAccessToken === 'function') {
                    accessToken = window.Auth.getAccessToken();
                } else if (window.Auth && window.Auth.token) {
                    accessToken = window.Auth.token;
                }
                fetch(menuItem.api, {
                    headers: {
                        'Accept': 'application/json',
                        ...(accessToken ? { 'Authorization': 'Bearer ' + accessToken } : {})
                    }
                })
                    .then(res => res.ok ? res.json() : {})
                    .then(data => {
                        window.UI.renderReadonly(container, menuItem, data);
                    })
                    .catch(() => {
                        window.UI.renderReadonly(container, menuItem, {});
                    });
            } else {
                window.UI.renderReadonly(container, menuItem, {});
            }
        }
    },

    forceReload() {
        window.location.hash = ''; // Reset hash
        window.location.reload();
    }
};
