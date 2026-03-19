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
        } else if (field.type === 'checkbox') {
            input = document.createElement('input');
            input.type = 'checkbox';
            // If placeholder is 'yes' or 'true', set checked by default
            if (field.placeholder && (field.placeholder.toLowerCase() === 'yes' || field.placeholder.toLowerCase() === 'true')) {
                input.checked = true;
            }
        } else {
            input = document.createElement('input');
            input.type = field.type || 'text';
        }

        input.className = 'form-control';
        input.name = field.name;
        input.id = field.name;
        if (field.placeholder && field.type !== 'checkbox') input.placeholder = field.placeholder;

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
     // Generic readonly display renderer
    renderReadonly(container, config, data = {}) {
        container.innerHTML = '';
        if (config.title) {
            const title = document.createElement('h2');
            title.innerText = config.title;
            title.className = 'page-title';
            title.style.marginBottom = '2rem';
            container.appendChild(title);
        }
        const contentDiv = document.createElement('div');
        contentDiv.style.maxWidth = '600px';
        config.fields.forEach(field => {
            const block = document.createElement('div');
            block.style.marginBottom = '1.5rem';
            const labelEl = document.createElement('div');
            labelEl.innerText = field.label || field.name;
            labelEl.style.color = 'var(--text-secondary, #666)';
            labelEl.style.fontSize = '0.85rem';
            labelEl.style.textTransform = 'uppercase';
            labelEl.style.letterSpacing = '0.05em';
            const valueEl = document.createElement('div');
            valueEl.innerText = (data && data[field.name] !== undefined) ? data[field.name] : '';
            valueEl.style.fontSize = '1.1rem';
            valueEl.style.fontWeight = '500';
            valueEl.style.color = '#222';
            block.appendChild(labelEl);
            block.appendChild(valueEl);
            contentDiv.appendChild(block);
        });
        container.appendChild(contentDiv);
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
        logo.innerHTML = `<img src="assets/jako-muller Logo.png" alt="Tesp Labs Logo" style="height: 60px;">`;

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

        // Logout Button
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'btn btn-secondary';
        logoutBtn.innerText = 'Logout';
        logoutBtn.style.marginLeft = 'auto'; // Push to right if using plain flex
        logoutBtn.style.marginRight = '16px'; // Spacing for hamburger
        logoutBtn.onclick = () => window.Auth.logout();

        // Right Section Wrapper
        const rightSection = document.createElement('div');
        rightSection.className = 'header-right';
        rightSection.style.display = 'flex';
        rightSection.style.alignItems = 'center';
        rightSection.style.gap = '24px'; // Space between Nav and Logout/Hamburger

        nav.style.margin = '0';
        logoutBtn.style.margin = '0';

        rightSection.appendChild(nav);
        rightSection.appendChild(logoutBtn);
        rightSection.appendChild(hamburger);

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
        logo.innerHTML = `<img src="assets/jako-muller Logo.png" alt="Tesp Labs Logo" style="height: 60px;">`;

        const form = document.createElement('form');

        const usernameField = this.createInput({ name: 'username', label: 'Username', type: 'text', placeholder: 'admin' });
        const passField = this.createInput({ name: 'password', label: 'Password', type: 'password', placeholder: '*****' });

        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.className = 'btn btn-primary';
        submitBtn.style.width = '100%';
        submitBtn.innerText = 'Login';

        form.appendChild(usernameField);
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
    },

    renderHome(container) {
        container.innerHTML = '';

        const title = document.createElement('h2');
        title.innerText = 'Device Information';
        title.className = 'page-title';
        // Add specific spacing for title
        title.style.marginBottom = '2rem'; // More space below title
        container.appendChild(title);

        const contentDiv = document.createElement('div');
        contentDiv.style.maxWidth = '600px';

        const createInfoBlock = (label, content) => {
            const block = document.createElement('div');
            block.style.marginBottom = '1.5rem'; // Spacing between blocks

            const labelEl = document.createElement('div');
            // labelEl.className = 'form-label'; // Custom style instead
            labelEl.innerText = label;
            labelEl.style.color = 'var(--text-secondary, #666)';
            labelEl.style.fontSize = '0.85rem';
            labelEl.style.textTransform = 'uppercase';
            labelEl.style.letterSpacing = '0.05em';
            labelEl.style.fontWeight = '600';
            labelEl.style.marginBottom = '0.5rem';

            const contentEl = document.createElement('div');
            contentEl.style.fontSize = '1.3rem'; // Much larger for visibility
            contentEl.style.fontWeight = '500';
            contentEl.style.color = 'var(--primary-color, #333)'; // Use brand color or dark text
            contentEl.style.paddingBottom = '0.5rem';
            contentEl.style.borderBottom = '1px solid rgba(0,0,0,0.05)'; // Very subtle line
            contentEl.innerText = content;

            block.appendChild(labelEl);
            block.appendChild(contentEl);
            return block;
        };

        contentDiv.appendChild(createInfoBlock('Device Type', 'Product Model X'));
        contentDiv.appendChild(createInfoBlock('Firmware Version', '1.0.1'));
        contentDiv.appendChild(createInfoBlock('Hardware Version', '1.0.0'));
        contentDiv.appendChild(createInfoBlock('Vendor', 'Tesp Labs'));

        container.appendChild(contentDiv);
    },

    renderMaintenance(container) {
        // Clear container
        container.innerHTML = '';

        // Title (Left aligned like createForm)
        const title = document.createElement('h2');
        title.innerText = 'Firmware Maintenance';
        title.className = 'page-title';
        // title.style.marginBottom = '30px'; 
        container.appendChild(title);

        // Content Container (formerly card, now just a block)
        const contentDiv = document.createElement('div');
        contentDiv.style.maxWidth = '600px';
        // Default block alignment is left, which matches snapshot

        // Helper to create standardized vertical rows (Label top, Input bottom)
        const createRow = (label, content) => {
            const row = document.createElement('div');
            row.className = 'form-group';

            const labelEl = document.createElement('label');
            labelEl.className = 'form-label';
            labelEl.innerText = label;

            row.appendChild(labelEl);
            row.appendChild(content);
            return row;
        };

        // Current Version
        const curVerVal = document.createElement('div');
        curVerVal.innerText = 'v1.2.3';
        // curVerVal.className = 'form-control'; // Maybe not needed if we want plain text
        // curVerVal.style.border = 'none';
        curVerVal.style.padding = '8px 0'; // Slight padding for alignment
        // curVerVal.style.fontWeight = 'bold';
        // wrapper for text
        const row1 = createRow('Current Version', curVerVal);

        // Upgrade File Input
        const fileInputWrapper = document.createElement('div');
        fileInputWrapper.style.display = 'flex';
        fileInputWrapper.style.gap = '10px';
        fileInputWrapper.style.width = '100%';

        const fileDisplay = document.createElement('input');
        fileDisplay.type = 'text';
        fileDisplay.readOnly = true;
        fileDisplay.placeholder = 'Select firmware file...';
        fileDisplay.className = 'form-control';

        const selectBtn = document.createElement('button');
        selectBtn.className = 'btn btn-primary';
        selectBtn.innerText = 'Select File';
        selectBtn.style.whiteSpace = 'nowrap';

        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'file';
        hiddenInput.style.display = 'none';

        selectBtn.onclick = () => hiddenInput.click();
        hiddenInput.onchange = (e) => {
            if (e.target.files[0]) {
                fileDisplay.value = e.target.files[0].name;
                selectedVerDiv.innerText = 'v1.2.5'; // Simulate version parsing
            }
        };

        fileInputWrapper.appendChild(fileDisplay);
        fileInputWrapper.appendChild(selectBtn);
        const row2 = createRow('Upgrade File', fileInputWrapper);

        // Selected FW Version
        const selectedVerDiv = document.createElement('div');
        selectedVerDiv.style.padding = '8px 0';
        selectedVerDiv.innerText = '-';
        const row3 = createRow('Selected FW Version', selectedVerDiv);

        // Upgrade Button
        const upgradeBtn = document.createElement('button');
        upgradeBtn.className = 'btn btn-primary';
        upgradeBtn.innerText = 'Upgrade';
        // Standard button, no special width

        // Actions Wrapper to match form actions
        const actions = document.createElement('div');
        actions.className = 'form-actions';
        actions.style.marginTop = '24px';
        actions.style.display = 'flex';
        actions.style.gap = '16px';
        actions.appendChild(upgradeBtn);

        // Progress Bar
        const progressContainer = document.createElement('div');
        progressContainer.style.display = 'none';
        progressContainer.style.marginTop = '20px';
        progressContainer.style.background = '#e0e0e0';
        progressContainer.style.borderRadius = '4px';
        progressContainer.style.overflow = 'hidden';
        progressContainer.style.height = '24px';
        progressContainer.style.position = 'relative';

        const progressBar = document.createElement('div');
        progressBar.style.width = '0%';
        progressBar.style.height = '100%';
        progressBar.style.backgroundColor = 'var(--primary-light)';
        progressBar.style.transition = 'width 0.2s';

        const progressText = document.createElement('span');
        progressText.innerText = 'Upgrading...';
        progressText.style.position = 'absolute';
        progressText.style.width = '100%';
        progressText.style.textAlign = 'center';
        progressText.style.top = '0';
        progressText.style.lineHeight = '24px';
        progressText.style.color = '#fff';
        progressText.style.fontSize = '12px';
        progressText.style.fontWeight = 'bold';
        progressText.style.textShadow = '0px 0px 2px rgba(0,0,0,0.5)';

        progressContainer.appendChild(progressBar);
        progressContainer.appendChild(progressText);

        // Status Message
        const statusMsg = document.createElement('div');
        statusMsg.style.marginTop = '15px';
        statusMsg.style.color = 'var(--success-color, #388e3c)';
        statusMsg.style.fontWeight = 'bold';
        statusMsg.style.display = 'none';

        // Event Logic
        upgradeBtn.onclick = () => {
            if (!fileDisplay.value) {
                alert('Please select a file first.');
                return;
            }
            progressContainer.style.display = 'block';
            upgradeBtn.disabled = true;
            upgradeBtn.classList.add('disabled');
            statusMsg.style.display = 'none';

            let progress = 0;
            const interval = setInterval(() => {
                progress += 5;
                progressBar.style.width = progress + '%';
                if (progress >= 100) {
                    clearInterval(interval);
                    statusMsg.innerText = 'Status: Success';
                    statusMsg.style.display = 'block';
                    upgradeBtn.disabled = false;
                    upgradeBtn.classList.remove('disabled');
                    progressText.innerText = 'Done';
                }
            }, 100);
        };

        // Assemble
        // Note: Title is added to container
        contentDiv.appendChild(row1);
        contentDiv.appendChild(row2);
        contentDiv.appendChild(row3);
        contentDiv.appendChild(actions);
        contentDiv.appendChild(progressContainer);
        contentDiv.appendChild(statusMsg);

        container.appendChild(contentDiv);
    }
};
