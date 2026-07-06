const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  let f = req.url === '/' ? 'index-manifestation.html' : req.url.slice(1);
  f = path.resolve(f);
  if (!fs.existsSync(f)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const ext = path.extname(f);
  const ct = ext === '.js' ? 'application/javascript' : ext === '.css' ? 'text/css' : ext === '.json' ? 'application/json' : 'text/html; charset=utf-8';
  const c = fs.readFileSync(f, 'utf8');
  res.writeHead(200, {'Content-Type': ct});
  res.end(c);
});

server.listen(8765, () => console.log('Server on http://localhost:8765'));
