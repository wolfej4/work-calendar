import http from 'http';
import https from 'https';
import { parse as parseUrl } from 'url';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

const PORT = 8080;
const SETTINGS_PATH = '/data/settings.json';

mkdirSync('/data', { recursive: true });

function corsHeaders() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
  };
}

function handleSettings(req, res) {
  if (req.method === 'GET') {
    if (existsSync(SETTINGS_PATH)) {
      const data = readFileSync(SETTINGS_PATH, 'utf8');
      res.writeHead(200, { ...corsHeaders(), 'content-type': 'application/json' });
      return res.end(data);
    }
    res.writeHead(404, corsHeaders());
    return res.end('{}');
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        JSON.parse(body); // validate before writing
        writeFileSync(SETTINGS_PATH, body, 'utf8');
        res.writeHead(200, { ...corsHeaders(), 'content-type': 'application/json' });
        res.end('{"ok":true}');
      } catch {
        res.writeHead(400, corsHeaders());
        res.end('Invalid JSON');
      }
    });
    return;
  }

  res.writeHead(405, corsHeaders());
  res.end('Method Not Allowed');
}

function handleProxy(req, res) {
  const target = decodeURIComponent((req.url ?? '').slice(1));

  if (!target.startsWith('http://') && !target.startsWith('https://')) {
    res.writeHead(200, corsHeaders());
    return res.end('CORS proxy OK');
  }

  const parsed = parseUrl(target);
  const mod = parsed.protocol === 'https:' ? https : http;

  const opts = {
    hostname: parsed.hostname,
    port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
    path: parsed.path || '/',
    method: 'GET',
    headers: {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      'accept': 'text/calendar, text/plain, */*',
    },
  };

  const proxyReq = mod.request(opts, (upstream) => {
    res.writeHead(upstream.statusCode ?? 200, {
      ...corsHeaders(),
      'content-type': upstream.headers['content-type'] ?? 'text/calendar',
    });
    upstream.pipe(res);
  });

  proxyReq.on('error', (e) => {
    res.writeHead(502, corsHeaders());
    res.end(e.message);
  });

  proxyReq.end();
}

http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    return res.end();
  }

  if (req.url === '/api/settings') {
    return handleSettings(req, res);
  }

  handleProxy(req, res);

}).listen(PORT, () => console.log(`Listening on :${PORT}`));
