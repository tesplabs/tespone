window.appConfig = {
    brand: {
        name: "Tesp Labs",
        logoHtml: `<div class="logo-text">tesp<span class="logo-suffix">LABS</span></div>` // Simplified logo for now
    },
    menu: [
        {
            id: 'home',
            label: 'Home',
            type: 'display',
            title: 'Device Information',
            fields: [
                { name: 'deviceType', label: 'Device Type' },
                { name: 'firmwareVersion', label: 'Firmware Version' },
                { name: 'hardwareVersion', label: 'Hardware Version' },
                { name: 'vendor', label: 'Vendor Name' }
            ],
            api: '/api/deviceinfo'
        },
        {
            id: 'network',
            label: 'Network',
            type: 'form',
            title: 'Ethernet Configuration',
            api: '/api/ethernetconfiguration', // API endpoint for this form
            fields: [
                 { name: 'mode', label: 'Mode', type: 'select', options: ['DHCP', 'Static'] },
                 { name: 'ipAddress', label: 'IP Address', type: 'text', placeholder: '192.168.1.100' },
                 { name: 'subnetMask', label: 'Subnet Mask', type: 'text', placeholder: '255.255.255.0' },
                 { name: 'gateway', label: 'Gateway', type: 'text', placeholder: '192.168.1.1' }
            ]
        },
        {
            id: 'mqtt',
            label: 'MQTT',
            type: 'form',
            title: 'MQTT Configuration',
            api: '/api/mqttconfiguration', // API endpoint for this form
            fields: [
                { name: 'brokerUrl', label: 'Broker URL', type: 'text', placeholder: 'mqtt://broker.hivemq.com' },
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
