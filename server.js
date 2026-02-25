const http = require('http');
const fs = require('fs');
const path = require('path');
const port = 8899;
const base = __dirname;
const mimes = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
  '.ico': 'image/x-icon', '.json': 'application/json'
};
http.createServer((req, res) => {
  let fp = path.join(base, req.url.split('?')[0]);
  if (fs.existsSync(fp) && fs.statSync(fp).isDirectory()) fp = path.join(fp, 'index.html');
  const ext = path.extname(fp);
  try {
    const data = fs.readFileSync(fp);
    res.writeHead(200, { 'Content-Type': mimes[ext] || 'text/plain', 'Access-Control-Allow-Origin': '*' });
    res.end(data);
  } catch (e) {
    res.writeHead(404); res.end('Not found');
  }
}).listen(port, () => console.log('Server running on port ' + port));
