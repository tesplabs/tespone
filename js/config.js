window.appConfig = {
    brand: {
        name: "Tesp Labs",
        logoHtml: `<div class="logo-text">tesp<span class="logo-suffix">LABS</span></div>` // Simplified logo for now
    },
    menu: [
        {
            id: 'home',
            label: 'Home',
            type: 'home'
        },
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
        },
        {
            id: 'mqtt',
            label: 'MQTT',
            type: 'form',
            title: 'MQTT Configuration',
            fields: [
                { name: 'broker', label: 'Broker URL', type: 'text', placeholder: 'mqtt://broker.hivemq.com' },
                { name: 'port', label: 'Port', type: 'number', placeholder: '1883' },
                { name: 'username', label: 'Username', type: 'text', placeholder: '' },
                { name: 'password', label: 'Password', type: 'password', placeholder: '' },
                { name: 'secured', label: 'Secured', type: 'checkbox', placeholder: '' },
 
            ]
        },
        {
            id: 'maintenance',
            label: 'Maintenance',
            type: 'maintenance'
        }
    ]
};
