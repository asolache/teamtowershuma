/* Servidor estàtic mínim per als tests que necessiten http:// (l'atles fa fetch,
   i amb file:// el navegador el bloqueja). Els tests que el necessiten se
   l'engeguen ells: dependre d'un servidor que algú havia d'arrencar a mà feia
   que fallessin per infraestructura i no per codi. */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json',
  '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' };
export function serve(root, port) {
  const s = createServer(async (req, res) => {
    try {
      const rel = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
      const body = await readFile(join(root, rel));
      res.writeHead(200, { 'content-type': TYPES[extname(rel)] || 'application/octet-stream' });
      res.end(body);
    } catch (e) { res.writeHead(404); res.end('not found'); }
  });
  return new Promise(r => s.listen(port, '127.0.0.1', () => r(s)));
}
