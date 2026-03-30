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
            title.style.marginBottom = '2rem';
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
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            // Find API URL from config and call PUT
            let msgDiv = form.querySelector('.form-status-msg');
            if (!msgDiv) {
                msgDiv = document.createElement('div');
                msgDiv.className = 'form-status-msg';
                msgDiv.style.marginLeft = '24px';
                msgDiv.style.alignSelf = 'center';
                msgDiv.style.fontWeight = 'bold';
                actions.appendChild(msgDiv);
            }
            clearTimeout(msgDiv._hideTimeout);
            if (config.api) {
                try {
                    await window.http.put(config.api, data);
                    msgDiv.innerText = 'Settings saved successfully';
                    msgDiv.style.color = '#2e7d32'; // green
                } catch (err) {
                    msgDiv.innerText = 'Failed to save: ' + (err && err.message ? err.message : err);
                    msgDiv.style.color = '#c62828'; // red
                }
                msgDiv.style.display = 'inline-block';
                msgDiv._hideTimeout = setTimeout(() => {
                    msgDiv.style.display = 'none';
                }, 5000);
            }
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
            labelEl.style.color = '#E53212';
            labelEl.style.fontSize = '15px';
            labelEl.style.fontWeight = 'bold';
            // fontStretch is deprecated and not supported in JS. Use font-family or font-variation-settings if needed.
            labelEl.style.marginBottom = '6px';
            labelEl.style.letterSpacing = '0.3px';
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

        // User Profile Dropdown
        const userProfileWrapper = document.createElement('div');
        userProfileWrapper.className = 'user-profile-wrapper';
        userProfileWrapper.style.position = 'relative';
        userProfileWrapper.style.display = 'flex';
        userProfileWrapper.style.alignItems = 'center';
        userProfileWrapper.style.gap = '8px';

        // Get username from localStorage or fallback
        let username = localStorage.getItem('tesp_username') || 'User';
        const userProfileBtn = document.createElement('button');
        userProfileBtn.className = 'btn btn-profile';
        userProfileBtn.style.display = 'flex';
        userProfileBtn.style.alignItems = 'center';
        userProfileBtn.style.gap = '8px';
        userProfileBtn.style.background = 'none';
        userProfileBtn.style.border = 'none';
        userProfileBtn.style.color = '#333';
        userProfileBtn.style.fontWeight = 'bold';
        userProfileBtn.style.cursor = 'pointer';
        userProfileBtn.style.fontSize = '1rem';
        userProfileBtn.style.padding = '4px 12px';

        // User icon (SVG)
        const userIcon = document.createElement('span');
        userIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="6.5" r="3.5" stroke="#333" stroke-width="1.5"/><path d="M3.5 16.5C3.5 13.7386 6.23858 11.5 10 11.5C13.7614 11.5 16.5 13.7386 16.5 16.5" stroke="#333" stroke-width="1.5" stroke-linecap="round"/></svg>`;
        userIcon.style.display = 'inline-flex';
        userIcon.style.alignItems = 'center';

        // Dropdown arrow (SVG)
        const arrowIcon = document.createElement('span');
        arrowIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6L8 10L12 6" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        arrowIcon.style.display = 'inline-flex';
        arrowIcon.style.alignItems = 'center';

        // Username text
        const usernameSpan = document.createElement('span');
        usernameSpan.innerText = username;
        usernameSpan.style.color = '#E53212';

        userProfileBtn.innerHTML = '';
        userProfileBtn.appendChild(userIcon);
        userProfileBtn.appendChild(usernameSpan);
        userProfileBtn.appendChild(arrowIcon);
        userProfileBtn.style.background = 'none';
        userProfileBtn.style.border = 'none';
        userProfileBtn.style.color = '#333';
        userProfileBtn.style.fontWeight = 'bold';
        userProfileBtn.style.cursor = 'pointer';
        userProfileBtn.style.fontSize = '1rem';
        userProfileBtn.style.padding = '4px 12px';

        // Dropdown menu
        const dropdown = document.createElement('div');
        dropdown.className = 'user-dropdown';
        dropdown.style.display = 'none';
        dropdown.style.position = 'absolute';
        dropdown.style.top = '110%';
        dropdown.style.right = '0';
        dropdown.style.background = '#fff';
        dropdown.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
        dropdown.style.borderRadius = '6px';
        dropdown.style.minWidth = '160px';
        dropdown.style.zIndex = '1000';

        // Change Password Option
        const changePwd = document.createElement('div');
        changePwd.innerText = 'Change Password';
            changePwd.style.color = '#E53212';
                changePwd.style.fontWeight = 'bold';
            changePwd.style.whiteSpace = 'nowrap';
        changePwd.style.padding = '12px 16px';
        changePwd.style.cursor = 'pointer';
        changePwd.style.fontSize = '1rem';
        changePwd.onmouseover = () => changePwd.style.background = '#f5f5f5';
        changePwd.onmouseout = () => changePwd.style.background = 'none';
        changePwd.onclick = () => {
            dropdown.style.display = 'none';
            // Create modal overlay
            const modalOverlay = document.createElement('div');
            modalOverlay.style.position = 'fixed';
            modalOverlay.style.top = '0';
            modalOverlay.style.left = '0';
            modalOverlay.style.width = '100vw';
            modalOverlay.style.height = '100vh';
            modalOverlay.style.background = 'rgba(0,0,0,0.25)';
            modalOverlay.style.display = 'flex';
            modalOverlay.style.alignItems = 'center';
            modalOverlay.style.justifyContent = 'center';
            modalOverlay.style.zIndex = '2000';

            // Modal dialog
            const modal = document.createElement('div');
            modal.style.background = '#fff';
            modal.style.borderRadius = '10px';
            modal.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
            modal.style.padding = '32px 28px 24px 28px';
            modal.style.minWidth = '340px';
            modal.style.maxWidth = '95vw';
            modal.style.position = 'relative';

            // Close button
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '&times;';
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '12px';
            closeBtn.style.right = '16px';
            closeBtn.style.background = 'none';
            closeBtn.style.border = 'none';
            closeBtn.style.fontSize = '1.5rem';
            closeBtn.style.cursor = 'pointer';
            closeBtn.onclick = () => document.body.removeChild(modalOverlay);
            modal.appendChild(closeBtn);

            // Title
            const title = document.createElement('h3');
            title.innerText = 'Change Password';
            title.style.color = '#E53212';
            title.style.marginBottom = '18px';
            modal.appendChild(title);

            // Password rule
            const rule = document.createElement('div');
            rule.innerText = 'Password must be at least 8 characters, include a number, an uppercase, and a lowercase letter.';
            rule.style.fontSize = '0.95rem';
            rule.style.color = '#666';
            rule.style.marginBottom = '18px';
            modal.appendChild(rule);

            // Form
            const form = document.createElement('form');
            form.style.display = 'flex';
            form.style.flexDirection = 'column';
            form.style.gap = '16px';

            // Old password
            const oldPwd = document.createElement('input');
            oldPwd.type = 'password';
            oldPwd.placeholder = 'Old Password';
            oldPwd.required = true;
            oldPwd.style.padding = '10px';
            oldPwd.style.fontSize = '1rem';
            oldPwd.style.border = '1px solid #ccc';
            oldPwd.style.borderRadius = '4px';

            // New password
            const newPwd = document.createElement('input');
            newPwd.type = 'password';
            newPwd.placeholder = 'New Password';
            newPwd.required = true;
            newPwd.style.padding = '10px';
            newPwd.style.fontSize = '1rem';
            newPwd.style.border = '1px solid #ccc';
            newPwd.style.borderRadius = '4px';

            // Confirm password
            const confirmPwd = document.createElement('input');
            confirmPwd.type = 'password';
            confirmPwd.placeholder = 'Confirm New Password';
            confirmPwd.required = true;
            confirmPwd.style.padding = '10px';
            confirmPwd.style.fontSize = '1rem';
            confirmPwd.style.border = '1px solid #ccc';
            confirmPwd.style.borderRadius = '4px';

            // Feedback message
            const msg = document.createElement('div');
            msg.style.fontSize = '0.98rem';
            msg.style.marginTop = '4px';
            msg.style.height = '22px';
            msg.style.color = '#c62828';

            // Buttons
            const btnRow = document.createElement('div');
            btnRow.style.display = 'flex';
            btnRow.style.gap = '16px';
            btnRow.style.marginTop = '8px';

            const updateBtn = document.createElement('button');
            updateBtn.type = 'submit';
            updateBtn.className = 'btn btn-primary';
            updateBtn.innerText = 'Update';

            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.className = 'btn btn-secondary';
            cancelBtn.innerText = 'Cancel';
            cancelBtn.onclick = () => document.body.removeChild(modalOverlay);

            btnRow.appendChild(updateBtn);
            btnRow.appendChild(cancelBtn);

            form.appendChild(oldPwd);
            form.appendChild(newPwd);
            form.appendChild(confirmPwd);
            form.appendChild(msg);
            form.appendChild(btnRow);

            // Password validation helper
            function validatePassword(pwd) {
                return pwd.length >= 8 && /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd);
            }

            form.onsubmit = async (e) => {
                e.preventDefault();
                msg.style.color = '#c62828';
                msg.innerText = '';
                if (!validatePassword(newPwd.value)) {
                    msg.innerText = 'New password does not meet requirements.';
                    return;
                }
                if (newPwd.value !== confirmPwd.value) {
                    msg.innerText = 'Passwords do not match.';
                    return;
                }
                // Provision for API call
                updateBtn.disabled = true;
                updateBtn.innerText = 'Updating...';
                try {
                    // Replace with your actual API call
                    // Example: await window.http.post('/api/change-password', { oldPassword: oldPwd.value, newPassword: newPwd.value });
                    await new Promise(res => setTimeout(res, 1000)); // Simulate API
                    msg.style.color = '#2e7d32';
                    msg.innerText = 'Password updated successfully!';
                    setTimeout(() => document.body.removeChild(modalOverlay), 1200);
                } catch (err) {
                    msg.innerText = 'Failed to update password.';
                } finally {
                    updateBtn.disabled = false;
                    updateBtn.innerText = 'Update';
                }
            };

            modal.appendChild(form);
            modalOverlay.appendChild(modal);
            document.body.appendChild(modalOverlay);
        };
        dropdown.appendChild(changePwd);

        userProfileBtn.onclick = (e) => {
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        };
        document.addEventListener('click', () => {
            dropdown.style.display = 'none';
        });

        userProfileWrapper.appendChild(userProfileBtn);
        userProfileWrapper.appendChild(dropdown);

        rightSection.appendChild(userProfileWrapper);
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

        const usernameField = this.createInput({ name: 'username', label: 'Username', type: 'text' });
        const passField = this.createInput({ name: 'password', label: 'Password', type: 'password' });

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
            labelEl.style.color = '#E53212';
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
        title.style.marginBottom = '2rem';
        container.appendChild(title);

        // Content Container (formerly card, now just a block)
        const contentDiv = document.createElement('div');
        contentDiv.style.maxWidth = '600px';
        // Default block alignment is left, which matches snapshot

        // Helper to create standardized vertical rows (Label top, Input bottom)
        const createRow = (label, content) => {
            const row = document.createElement('div');
            row.className = 'form-group';
            row.style.marginBottom = '1.5rem';

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
        progressText.style.color = '#333';
        progressText.style.fontSize = '12px';
        progressText.style.fontWeight = 'bold';
        progressText.style.textShadow = '0px 0px 2px rgba(0,0,0,0.5)';

        progressContainer.appendChild(progressBar);
        progressContainer.appendChild(progressText);

        // Status Message
        const statusMsg = document.createElement('div');
        statusMsg.style.marginTop = '15px';
        statusMsg.style.color = '#E53212';
        statusMsg.style.fontWeight = 'bold';
        statusMsg.style.display = 'none';

        // Event Logic
        upgradeBtn.onclick = () => {

            if (!hiddenInput.files[0]) {
                statusMsg.innerText = 'Please select a file first.';
                statusMsg.style.color = '#c62828';
                statusMsg.style.display = 'block';
                return;
            }
            progressContainer.style.display = 'block';
            upgradeBtn.disabled = true;
            upgradeBtn.classList.add('disabled');
            upgradeBtn.style.opacity = '0.5';
            upgradeBtn.style.pointerEvents = 'none';
            upgradeBtn.style.cursor = 'not-allowed';
            selectBtn.disabled = true;
            selectBtn.classList.add('disabled');
            selectBtn.style.opacity = '0.5';
            selectBtn.style.pointerEvents = 'none';
            selectBtn.style.cursor = 'not-allowed';
            statusMsg.style.display = 'none';

            // Reset progress bar
            progressBar.style.width = '0%';
            progressText.innerText = 'Upgrading...';

            (async () => {
                try {
                    // Upload firmware file
                    const uploadUrl = '/api/firmwareupload';
                    const formData = new FormData();
                    formData.append('file', hiddenInput.files[0]);
                    const uploadResp = await fetch(uploadUrl, {
                        method: 'POST',
                        body: formData
                    });
                    const uploadResult = await uploadResp.json();
                    if (!uploadResp.ok || uploadResult.status !== 'success') {
                        throw new Error(uploadResult.message || 'Firmware upload failed');
                    }
                    // Only if upload succeeded, call trigger upgrade
                    const triggerUrl = '/api/triggerupgrade';
                    const triggerPayload = { forceUpgrade: false };
                    const triggerResp = await window.http.post(triggerUrl, triggerPayload);
                    if (triggerResp.status === 'success') {
                        statusMsg.innerText = 'Upgrade started: ' + (triggerResp.message || '');
                        statusMsg.style.color = '#E53212)';
                        statusMsg.style.display = 'block';
                        // Start polling upgrade status
                        let polling = true;
                        async function pollStatus() {
                            try {
                                const statusResp = await window.http.get('/api/upgradestatus');
                                // Always keep buttons disabled while polling
                                upgradeBtn.disabled = true;
                                upgradeBtn.classList.add('disabled');
                                selectBtn.disabled = true;
                                selectBtn.classList.add('disabled');

                                // Support both old and new backend response fields
                                const isFailed = statusResp.status === 'error' || statusResp.upgradeStatus === 'failed' || statusResp.Status === 'Signature Verification Failure';
                                const isSuccess = statusResp.upgradeStatus === 'success' || statusResp.Status === 'Success';
                                if (isFailed) {
                                    progressBar.style.width = '100%';
                                    progressText.innerText = 'Upgrade Failed';
                                    statusMsg.innerText = statusResp.message || statusResp.Status || 'Upgrade failed.';
                                    statusMsg.style.color = '#c62828';
                                    polling = false;
                                } else if (isSuccess) {
                                    progressBar.style.width = '100%';
                                    progressText.innerText = 'Upgrade Complete';
                                    statusMsg.innerText = statusResp.message || statusResp.Status || 'Upgrade successful!';
                                    statusMsg.style.color = '#E53212)';
                                    polling = false;
                                } else {
                                    // in progress
                                    let pct = statusResp.percentage || statusResp.Progress || 0;
                                    progressBar.style.width = pct + '%';
                                    progressText.innerText = `Upgrading... (${pct}%)`;
                                    statusMsg.innerText = statusResp.message || statusResp.Status || 'Upgrade in progress...';
                                    statusMsg.style.color = '#E53212)';
                                }
                            } catch (err) {
                                progressBar.style.width = '100%';
                                progressText.innerText = 'Upgrade Failed';
                                statusMsg.innerText = 'Upgrade failed: ' + (err && err.message ? err.message : err);
                                statusMsg.style.color = '#c62828';
                                polling = false;
                            }
                            if (polling) {
                                setTimeout(pollStatus, 2000);
                            } else {
                                upgradeBtn.disabled = false;
                                upgradeBtn.classList.remove('disabled');
                                upgradeBtn.style.opacity = '';
                                upgradeBtn.style.pointerEvents = '';
                                upgradeBtn.style.cursor = '';
                                selectBtn.disabled = false;
                                selectBtn.classList.remove('disabled');
                                selectBtn.style.opacity = '';
                                selectBtn.style.pointerEvents = '';
                                selectBtn.style.cursor = '';
                            }
                        }
                        pollStatus();
                    } else {
                        throw new Error(triggerResp.message || 'Upgrade could not be started');
                    }
                } catch (err) {
                    statusMsg.innerText = 'Upgrade failed: ' + (err && err.message ? err.message : err);
                    statusMsg.style.color = '#c62828';
                    statusMsg.style.display = 'block';
                    progressBar.style.width = '100%';
                    progressText.innerText = 'Upgrade Failed';
                    upgradeBtn.disabled = false;
                    upgradeBtn.classList.remove('disabled');
                    upgradeBtn.style.opacity = '';
                    upgradeBtn.style.pointerEvents = '';
                    upgradeBtn.style.cursor = '';
                    selectBtn.disabled = false;
                    selectBtn.classList.remove('disabled');
                    selectBtn.style.opacity = '';
                    selectBtn.style.pointerEvents = '';
                    selectBtn.style.cursor = '';
                }
            })();
        };

        // Assemble
        // Note: Title is added to container
        contentDiv.appendChild(row1);
        contentDiv.appendChild(row2);
        contentDiv.appendChild(actions);
        contentDiv.appendChild(progressContainer);
        contentDiv.appendChild(statusMsg);

        container.appendChild(contentDiv);
    }
};
