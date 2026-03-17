const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const path = require('path');
const zlib = require('zlib');
const rbac = require('./rbac');
const db = require('./db');

// Parse command-line arguments for -port and -www
const cmdLineArgs = {};
process.argv.slice(2).forEach((arg, i, arr) => {
  if (arg.startsWith('-')) {
    cmdLineArgs[arg] = arr[i + 1] && !arr[i + 1].startsWith('-') ? arr[i + 1] : true;
  }
});

const HTTP_PORT = parseInt(cmdLineArgs['-port'], 10) || 3000;
const HTTPS_PORT = parseInt(cmdLineArgs['-sslport'], 10) || 3001;
const DIST_DIR = path.resolve(__dirname, '../dist');

const app = express();
app.use(express.json());

// --- Gzipped static file server for build output ---
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
};

app.get(/^\/((?!api\/|rs\/).*)$/, (req, res, next) => {
    // Only handle non-API, non-RS requests
    let filePath = req.url === '/' ? '/index.html' : decodeURIComponent(req.url);
    let ext = path.extname(filePath);
    let contentType = mimeTypes[ext] || 'application/octet-stream';
    let fullPath = path.join(DIST_DIR, filePath);

    // Try uncompressed first (should not exist after build, but fallback)
    if (fs.existsSync(fullPath)) {
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(fullPath).pipe(res);
        return;
    }

    // Try .gz version
    let gzPath = fullPath + '.gz';
    if (fs.existsSync(gzPath)) {
        res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Encoding': 'gzip'
        });
        fs.createReadStream(gzPath).pipe(res);
        return;
    }

    // Not found
    res.writeHead(404);
    res.end('Not Found');
});


// --- API and RBAC logic (unchanged) ---
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
app.post('/api/logout', (req, res) => {
  res.clearCookie('SID');
  res.json({ status: 'success', message: 'Logged out' });
});
function generateToken(username) {
  return Buffer.from(`${username}:${Date.now()}`).toString('base64');
}
rbac.setOptions({});
rbac.build(app, db);


// 404 handler (for API/RS only)
app.use((req, res, next) => {
  if (req.url.startsWith('/api/') || req.url.startsWith('/rs/')) {
    res.status(404).json({ error: 'Not Found' });
  } else {
    next();
  }
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
  console.log(`Serving gzipped content from ${DIST_DIR}`);
});

// HTTPS server
const httpsserver = https.createServer(sslOptions, app);
httpsserver.listen(HTTPS_PORT, function() {
  console.log('listening HTTPS on port %d', httpsserver.address().port);
  console.log(`Serving gzipped content from ${DIST_DIR}`);
});
