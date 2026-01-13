const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = 8080;
const DIST_DIR = path.join(__dirname, 'dist');

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`Request: ${req.url}`);

    let filePath = req.url === '/' ? '/index.html' : decodeURIComponent(req.url);
    // Map to local path, BUT we need to check if .gz exists
    // In our dist folder, EVERYTHING is .gz (e.g., index.html.gz, main.js.gz)

    let ext = path.extname(filePath);
    let contentType = mimeTypes[ext] || 'application/octet-stream';

    // Construct local path. Since files are flat in dist, we just join.
    // However, req.url might come as /assets/foo.svg if we messed up patching,
    // or /foo.svg if we did it right.
    // Our build is FLAT, so we should allow serving flattened files even if requested with path? 
    // No, strictly verify the build works as intended (requests should be flat).

    // BUT we need to handle the fact that the file on disk has .gz appended.
    let fullPath = path.join(DIST_DIR, filePath);

    // First check if the file exists AS IS (uncompressed - unlikely given our build)
    if (fs.existsSync(fullPath)) {
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(fullPath).pipe(res);
        return;
    }

    // Check for .gz version
    let gzPath = fullPath + '.gz';
    if (fs.existsSync(gzPath)) {
        res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Encoding': 'gzip'
        });
        fs.createReadStream(gzPath).pipe(res);
        return;
    }

    // 404
    console.log(`404: ${fullPath} (and .gz)`);
    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Serving gzipped content from ${DIST_DIR}`);
});
