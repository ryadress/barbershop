const http = require('http');
const fs = require('fs');
const path = require('path');
const port = 8000;
const root = process.cwd();

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  let filePath = path.join(root, decodeURIComponent(reqPath));
  if (!filePath.startsWith(root)) filePath = path.join(root, 'index.html');

  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not found');
    }
    if (stats.isDirectory()) filePath = path.join(filePath, 'index.html');

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('Server error');
      }
      const ext = path.extname(filePath).toLowerCase();
      const map = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp'
      };
      res.writeHead(200, { 'Content-Type': map[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });
});

server.listen(port, '127.0.0.1', () => {
  const start = Date.now();
  http.get({ host: '127.0.0.1', port, path: '/' }, res => {
    const ttfb = Date.now() - start;
    let body = '';
    res.on('data', chunk => body += chunk.toString());
    res.on('end', () => {
      const total = Date.now() - start;
      const titleMatch = body.match(/<title>([^<]*)</i);
      console.log('STATUS', res.statusCode);
      console.log('TTFB', ttfb + ' ms');
      console.log('TOTAL', total + ' ms');
      console.log('BODY_LENGTH', body.length);
      console.log('TITLE', titleMatch ? titleMatch[1] : 'n/a');
      server.close();
    });
  }).on('error', err => {
    console.error('ERROR', err.message);
    server.close();
  });
});
