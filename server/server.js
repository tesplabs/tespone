// Firmware upload endpoint
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const path = require('path');
const rbac = require('./rbac');
const db = require('./db');

// Parse command-line arguments for -port and -www
const cmdLineArgs = {};
process.argv.slice(2).forEach((arg, i, arr) => {
  if (arg.startsWith('-')) {
    cmdLineArgs[arg] = arr[i + 1] && !arr[i + 1].startsWith('-') ? arr[i + 1] : true;
  }
});

const HTTP_PORT = parseInt(cmdLineArgs['-port'], 10) || 8000;
const HTTPS_PORT = parseInt(cmdLineArgs['-sslport'], 10) || 8001;
const WWW_ROOT = cmdLineArgs['-www'] ? path.resolve(cmdLineArgs['-www']) : path.resolve(__dirname, '..');

const app = express();
app.use(express.json());
app.use(express.static(WWW_ROOT));

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ status: 'error', message: 'Username and password required' });
  }
  const user = db.Users.find(u => u.UserName === username && u.Password === password);
  if (user) {
    const token = generateToken(username);
    res.cookie('SID', token, { httpOnly: true, maxAge: 3600 * 1000 });
    res.json({
      status: 'success',
      message: 'Login successful',
      expiresIn: 3600
    });
  } else {
    res.status(401).json({
      status: 'error',
      message: 'Invalid username or password'
    });
  }
});
// Logout endpoint
app.post('/api/logout', (req, res) => {
  res.clearCookie('SID');
  res.json({ status: 'success', message: 'Logged out' });
});
function generateToken(username) {
  return Buffer.from(`${username}:${Date.now()}`).toString('base64');
}
// RBAC setup
rbac.setOptions({});
rbac.build(app, db);

app.get('/', (req, res) => {
  res.send('Server is running');
});

// Ethernet Configuration API endpoint
// Helper to parse cookies from request headers
function parseCookies(req) {
  const list = {};
  const rc = req.headers['cookie'];
  if (rc) {
    rc.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
  }
  return list;
}
// Common PUT handler for all /api/* routes
app.put(/^\/api\/.*$/, (req, res) => {
  const cookies = parseCookies(req);
  const sid = cookies['SID'];
  if (!sid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Respond with success and the URL
  res.json({ status: 'success', message: `PUT success for ${req.originalUrl}`, data: req.body });
});
app.get('/api/ethernetconfiguration', (req, res) => {
  // Check for SID cookie
  const cookies = parseCookies(req);
  const sid = cookies['SID'];
  if (!sid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // In production, validate the SID token here
  // For demo, accept any non-empty SID
  res.setHeader('Content-Type', 'application/json');
  res.json({
    mode: 'DHCP',
    ipAddress: '192.168.1.100',
    subnetMask: '255.255.255.0',
    gateway: '192.168.1.1'
  });
});
app.put('/api/ethernetconfiguration', (req, res) => {
  const cookies = parseCookies(req);
  const sid = cookies['SID'];
  if (!sid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Log received data (replace with DB/file save as needed)
  console.log('Received Ethernet config update:', req.body);
  // Respond with success
  res.json({ status: 'success', message: 'Ethernet configuration updated', data: req.body });
});
app.get('/api/mqttconfiguration', (req, res) => {
  // Check for SID cookie
  const cookies = parseCookies(req);
  const sid = cookies['SID'];
  if (!sid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Example static data (replace with DB fetch if needed)
  res.setHeader('Content-Type', 'application/json');
  res.json({
    brokerUrl: 'mqtt://broker.hivemq.com',
    port: 1883,
    username: 'admin',
    password: 'admin',
    secured: 'yes'
  });
});

app.get('/api/deviceinfo', (req, res) => {
  const cookies = parseCookies(req);
  const sid = cookies['SID'];
  if (!sid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.setHeader('Content-Type', 'application/json');
  res.json({
    deviceType: 'Sandesh',
    firmwareVersion: '10.2.3',
    hardwareVersion: '1.2',
    vendor: 'Tesplabs Pvt Ltd'
  });
});
app.post('/api/firmwareupload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: 'error',
      message: 'Firmware upload failed. Invalid file or network error.'
    });
  }
  // Reset upgrade progress on new upload
  upgradeProgress = 0;
  // You can add more validation here (file type, size, etc.)
  res.json({
    status: 'success',
    message: 'Firmware file uploaded successfully',
    fileName: req.file.originalname,
    fileSize: req.file.size
  });
});
// Simulate firmware upgrade trigger
app.post('/api/triggerupgrade', (req, res) => {
  // You can add logic to check device state, firmware validity, etc.
  // For now, always respond with success and in_progress status
  const { forceUpgrade } = req.body;
  // Simulate a busy device or invalid firmware with a random error (for demo)
  if (forceUpgrade === 'fail') {
    return res.status(400).json({
      status: 'error',
      message: 'Firmware upgrade could not be started. Device busy or invalid firmware.'
    });
  }
  res.json({
    status: 'success',
    message: 'Firmware upgrade initiated',
    currentVersion: '10.2.3',
    targetVersion: '10.3.0',
    upgradeStatus: 'in_progress'
  });
});

// Simulate upgrade status polling
// Firmware upgrade state
let upgradeProgress = 0;
let upgradeStatus = 'idle';
let upgradeCurrentVersion = '10.2.3';
let upgradeTargetVersion = '10.3.0';

app.post('/api/triggerupgrade', (req, res) => {
  // Reset and start upgrade
  upgradeProgress = 0;
  upgradeStatus = 'in_progress';
  upgradeCurrentVersion = '10.2.3';
  upgradeTargetVersion = '10.3.0';
  res.json({
    status: 'success',
    message: 'Firmware upgrade initiated',
    currentVersion: upgradeCurrentVersion,
    targetVersion: upgradeTargetVersion,
    upgradeStatus: 'in_progress',
    percentage: upgradeProgress
  });
});

app.get('/api/upgradestatus', (req, res) => {
 
    upgradeProgress += 5;
    if (upgradeProgress >= 100) {
      upgradeProgress = 100;
      upgradeStatus = 'success';
      upgradeCurrentVersion = upgradeTargetVersion;
      return res.json({
        status: 'success',
        message: 'Firmware upgrade completed successfully',
        currentVersion: upgradeCurrentVersion,
        targetVersion: upgradeTargetVersion,
        upgradeStatus: 'success',
        percentage: 100
      });
    }
    return res.json({
      status: 'in progress',
      message: 'Firmware upgrade in progress',
      currentVersion: upgradeCurrentVersion,
      targetVersion: upgradeTargetVersion,
      upgradeStatus: 'in_progress',
      percentage: upgradeProgress
    });
});
// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// 500 handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});


const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'server.cert'))
};

// HTTP server
const httpserver = http.createServer(app);
httpserver.listen(HTTP_PORT, function() {
  console.log('listening HTTP on port %d', httpserver.address().port);
});

// HTTPS server
const httpsserver = https.createServer(sslOptions, app);
httpsserver.listen(HTTPS_PORT, function() {
  console.log('listening HTTPS on port %d', httpsserver.address().port);
});
