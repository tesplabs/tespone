window.appConfig = {
    brand: {
        name: "Tesp Labs",
        logoHtml: `<div class="logo-text">tesp<span class="logo-suffix">LABS</span></div>` // Simplified logo for now
    },
    menu: [
        // {
        //     id: 'home',
        //     label: 'Home',
        //     type: 'page',
        //     content: `
        //         <div class="hero-section">
        //             <h1 class="hero-title">Transform your business<br>through <span class="highlight">Our Custom Tailored</span><br><span class="highlight">Smart Interconnectivity</span> Solutions</h1>
        //         </div>
        //     `
        // },
        // {
        //     id: 'contact',
        //     label: 'Contact Us',
        //     type: 'form',
        //     title: 'Contact Information',
        //     fields: [
        //         { name: 'email', label: 'Email Address', type: 'email', placeholder: 'enter email' },
        //         { name: 'website', label: 'Website', type: 'url', placeholder: 'www.tesplabs.com' },
        //         { name: 'address', label: 'Address', type: 'textarea', placeholder: 'Enter address', rows: 4 }
        //     ]
        // },
        {
            id: 'network',
            label: 'Network',
            type: 'form',
            title: 'Ethernet Configuration',
            fields: [
                { name: 'mode', label: 'Mode', type: 'select', options: ['DHCP', 'Static'] },
                { name: 'ip_address', label: 'IP Address', type: 'text', placeholder: '192.168.1.100' },
                { name: 'subnet_mask', label: 'Subnet Mask', type: 'text', placeholder: '255.255.255.0' },
                { name: 'gateway', label: 'Gateway', type: 'text', placeholder: '192.168.1.1' }
            ]
        }
    ]
};
