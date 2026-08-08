/* Servidor de relé de mentida que parla el protocol de debò.

   Sense això, del relé només es podria comprovar que l'URL es construeix bé —i
   això no és provar res. Aquí hi ha un WebSocket a pèl (RFC 6455) que respon
   com respon Supabase Realtime: `phx_join` → `phx_reply` ok, `presence track` →
   `presence_state` i `presence_diff` a tothom, i `broadcast` reenviat a la resta
   del canal. Amb dos navegadors contra això es veu si la peça funciona.

   No pretén ser Supabase: només el tros del protocol que el SOS fa servir. */
import { createServer } from 'node:http';
import { createHash, randomUUID } from 'node:crypto';

const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const accept = k => createHash('sha1').update(k + GUID).digest('base64');

// ── Trames: només text, que és tot el que fa servir el protocol ──
function encode(str) {
  const p = Buffer.from(str, 'utf8'), n = p.length;
  let head;
  if (n < 126) head = Buffer.from([0x81, n]);
  else if (n < 65536) { head = Buffer.alloc(4); head[0] = 0x81; head[1] = 126; head.writeUInt16BE(n, 2); }
  else { head = Buffer.alloc(10); head[0] = 0x81; head[1] = 127; head.writeBigUInt64BE(BigInt(n), 2); }
  return Buffer.concat([head, p]);
}
// Retorna [missatges, romanent]. El client emmascara sempre; el servidor mai.
function decode(buf) {
  const out = [];
  let off = 0;
  while (buf.length - off >= 2) {
    const b0 = buf[off], b1 = buf[off + 1];
    const op = b0 & 0x0f, masked = (b1 & 0x80) === 0x80;
    let len = b1 & 0x7f, p = off + 2;
    if (len === 126) { if (buf.length < p + 2) break; len = buf.readUInt16BE(p); p += 2; }
    else if (len === 127) { if (buf.length < p + 8) break; len = Number(buf.readBigUInt64BE(p)); p += 8; }
    let mask = null;
    if (masked) { if (buf.length < p + 4) break; mask = buf.slice(p, p + 4); p += 4; }
    if (buf.length < p + len) break;
    const data = buf.slice(p, p + len);
    if (mask) for (let i = 0; i < data.length; i++) data[i] ^= mask[i % 4];
    off = p + len;
    if (op === 8) { out.push({ close: true }); continue; }
    if (op === 1) out.push({ text: data.toString('utf8') });
  }
  return [out, buf.slice(off)];
}

export function startRelayMock(port = 0) {
  const clients = new Set();                  // {sock, topic, key, meta}
  const send = (c, o) => { try { c.sock.write(encode(JSON.stringify(o))); } catch (e) {} };
  const inTopic = t => [...clients].filter(c => c.topic === t);
  const stateOf = t => {
    const s = {};
    inTopic(t).forEach(c => { if (c.key) s[c.key] = { metas: [c.meta || {}] }; });
    return s;
  };

  const server = createServer((req, res) => { res.writeHead(426); res.end('upgrade'); });

  server.on('upgrade', (req, sock) => {
    const key = req.headers['sec-websocket-key'];
    if (!key) { sock.destroy(); return; }
    sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\n' +
      'Connection: Upgrade\r\nSec-WebSocket-Accept: ' + accept(key) + '\r\n\r\n');
    const c = { sock, topic: null, key: null, meta: null, id: randomUUID() };
    clients.add(c);
    let buf = Buffer.alloc(0);

    sock.on('data', chunk => {
      buf = Buffer.concat([buf, chunk]);
      const [msgs, rest] = decode(buf); buf = rest;
      for (const m of msgs) {
        if (m.close) { sock.end(); continue; }
        let j; try { j = JSON.parse(m.text); } catch (e) { continue; }

        if (j.event === 'heartbeat') { send(c, { topic: 'phoenix', event: 'phx_reply', ref: j.ref, payload: { status: 'ok', response: {} } }); continue; }

        if (j.event === 'phx_join') {
          c.topic = j.topic;
          c.key = ((j.payload || {}).config || {}).presence?.key || c.id;
          send(c, { topic: j.topic, event: 'phx_reply', ref: j.ref, payload: { status: 'ok', response: {} } });
          send(c, { topic: j.topic, event: 'presence_state', payload: stateOf(j.topic) });
          continue;
        }

        if (j.event === 'presence' && (j.payload || {}).event === 'track') {
          c.meta = j.payload.payload || {};
          const diff = { joins: { [c.key]: { metas: [c.meta] } }, leaves: {} };
          inTopic(c.topic).forEach(o => send(o, { topic: c.topic, event: 'presence_diff', payload: diff }));
          continue;
        }

        if (j.event === 'broadcast') {
          // self:false — qui l'envia no el rep de tornada.
          inTopic(c.topic).forEach(o => { if (o !== c) send(o, { topic: c.topic, event: 'broadcast', payload: j.payload }); });
          continue;
        }
      }
    });

    const bye = () => {
      if (!clients.has(c)) return;
      clients.delete(c);
      if (c.topic && c.key) {
        const diff = { joins: {}, leaves: { [c.key]: { metas: [c.meta || {}] } } };
        inTopic(c.topic).forEach(o => send(o, { topic: c.topic, event: 'presence_diff', payload: diff }));
      }
    };
    sock.on('close', bye); sock.on('error', bye);
  });

  return new Promise(res => server.listen(port, '127.0.0.1', () => {
    const p = server.address().port;
    res({ port: p, host: '127.0.0.1:' + p, url: 'ws://127.0.0.1:' + p,
      clients, close: () => { clients.forEach(c => { try { c.sock.destroy(); } catch (e) {} }); server.close(); } });
  }));
}
