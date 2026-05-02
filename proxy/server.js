import http from 'http';
import https from 'https';
import { parse as parseUrl } from 'url';

const PORT = 8080;

function corsHeaders() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, OPTIONS',
    'access-control-allow-headers': '*',
  };
}

http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    return res.end();
  }

  // Target URL is everything after the leading slash, URI-decoded
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
      // Use a browser-like User-Agent; Apple rejects non-browser agents
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

}).listen(PORT, () => console.log(`CORS proxy listening on :${PORT}`));
