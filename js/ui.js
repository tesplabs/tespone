window.UI = {
    createInput(field) {
        const div = document.createElement('div');
        div.className = 'form-group';

        const label = document.createElement('label');
        label.className = 'form-label';
        label.innerText = field.label;
        label.htmlFor = field.name;

        let input;
        if (field.type === 'textarea') {
            input = document.createElement('textarea');
            input.rows = field.rows || 3;
        } else if (field.type === 'select') {
            input = document.createElement('select');
            field.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt;
                option.innerText = opt;
                input.appendChild(option);
            });
        } else {
            input = document.createElement('input');
            input.type = field.type || 'text';
        }

        input.className = 'form-control';
        input.name = field.name;
        input.id = field.name;
        if (field.placeholder) input.placeholder = field.placeholder;

        div.appendChild(label);
        div.appendChild(input);
        return div;
    },

    createForm(config, onSave, onCancel) {
        const container = document.createElement('div');

        // Title
        if (config.title) {
            const title = document.createElement('h2');
            title.className = 'page-title';
            title.innerText = config.title;
            container.appendChild(title);
        }

        const form = document.createElement('form');
        form.id = `form-${config.id}`;

        config.fields.forEach(field => {
            form.appendChild(this.createInput(field));
        });

        // Actions
        const actions = document.createElement('div');
        actions.className = 'form-actions';
        actions.style.marginTop = '24px';
        actions.style.display = 'flex';
        actions.style.gap = '16px';

        const saveBtn = document.createElement('button');
        saveBtn.type = 'submit';
        saveBtn.className = 'btn btn-primary';
        saveBtn.innerText = 'Save';

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn btn-secondary';
        cancelBtn.innerText = 'Cancel';

        actions.appendChild(saveBtn);
        actions.appendChild(cancelBtn);
        form.appendChild(actions);

        // Event Listeners
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            onSave(data);
        });

        cancelBtn.addEventListener('click', () => {
            form.reset();
            onCancel();
        });

        container.appendChild(form);
        return container;
    },

    renderLayout(appContainer, menuItems, contentCallback) {
        appContainer.innerHTML = '';

        // Header
        const header = document.createElement('header');
        header.className = 'app-header';

        // Logo
        const logo = document.createElement('div');
        logo.className = 'app-logo';
        // Importing config here might be circular if not careful, better to pass branding data
        logo.innerHTML = `<img src="assets/A01-Header Logo.svg" alt="Tesp Labs Logo" style="height: 40px;">`;

        // Nav
        const nav = document.createElement('nav');
        const ul = document.createElement('ul');
        ul.className = 'nav-list';

        menuItems.forEach(item => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${item.id}`;
            a.innerText = item.label;
            a.className = 'nav-link';
            li.appendChild(a);
            ul.appendChild(li);
        });

        nav.appendChild(ul);

        // Hamburger Menu
        const hamburger = document.createElement('button');
        hamburger.className = 'hamburger';
        hamburger.innerHTML = '&#9776;'; // Hamburger icon
        hamburger.onclick = () => {
            ul.classList.toggle('show');
        };

        // Close menu when a link is clicked
        ul.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => ul.classList.remove('show'));
        });

        header.appendChild(logo);
        header.appendChild(hamburger); // Add hamburger to header
        header.appendChild(nav);

        // Logout Button (Responsiveness: Hide on very small screens if needed, or keep)
        // For simplicity, we keep it in the header.
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'btn btn-secondary';
        logoutBtn.innerText = 'Logout';
        logoutBtn.style.marginLeft = 'auto'; // Push to right if using plain flex
        logoutBtn.style.marginRight = '16px'; // Spacing for hamburger
        logoutBtn.onclick = () => window.Auth.logout();

        // On mobile we might want this inside the menu, but for now let's keep it accessible.
        // To make it look good with hamburger, we place it before hamburger?
        // Header is flex space-between. Logo (left), Nav (center/right), Logout (right).
        // If we want Logo - [Spacer] - Logout - Hamburger(mobile)

        // Re-ordering elements for better flex behavior
        // Create a wrapper for the right side elements
        const rightSection = document.createElement('div');
        rightSection.className = 'header-right';
        rightSection.style.display = 'flex';
        rightSection.style.alignItems = 'center';
        rightSection.style.gap = '24px'; // Space between Nav and Logout/Hamburger

        // Remove margins from Nav as we handle spacing via the wrapper gap
        nav.style.margin = '0';
        logoutBtn.style.margin = '0';

        // Add elements to the wrapper
        rightSection.appendChild(nav); // Contains ul
        rightSection.appendChild(logoutBtn);
        rightSection.appendChild(hamburger);

        // Clear header to rebuild order
        header.innerHTML = '';
        header.appendChild(logo);
        header.appendChild(rightSection);

        // Content
        const main = document.createElement('main');
        main.id = 'main-content';
        main.className = 'container';

        appContainer.appendChild(header);
        appContainer.appendChild(main);
    },

    renderLogin(appContainer, onLogin) {
        appContainer.innerHTML = '';

        const loginContainer = document.createElement('div');
        loginContainer.className = 'login-container';

        const card = document.createElement('div');
        card.className = 'login-card';

        const logo = document.createElement('div');
        logo.className = 'login-logo';
        logo.innerHTML = `<img src="assets/A01-Header Logo.svg" alt="Tesp Labs Logo" style="height: 60px;">`;

        const form = document.createElement('form');

        const emailField = this.createInput({ name: 'email', label: 'Email', type: 'email', placeholder: 'user@tesplabs.com' });
        const passField = this.createInput({ name: 'password', label: 'Password', type: 'password' });

        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.className = 'btn btn-primary';
        submitBtn.style.width = '100%';
        submitBtn.innerText = 'Login';

        form.appendChild(emailField);
        form.appendChild(passField);
        form.appendChild(submitBtn);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            onLogin();
        });

        card.appendChild(logo);
        card.appendChild(form);
        loginContainer.appendChild(card);
        appContainer.appendChild(loginContainer);
    }
};
