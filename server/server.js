
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
