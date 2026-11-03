/* Captura de totes les pantalles de l'app SOS per al diagnòstic d'UX.
   Obre l'exemple viu, recorre portades, pestanyes de cada tipus de node,
   rutes modals i els `open*` exposats, i desa per pantalla una imatge
   (escriptori i mòbil) i unes mesures: quina part de la finestra ocupa,
   quants botons, camps, plecs i paraules té. No envia res enlloc.
   Ús: node SOS/tools/captura-ux.mjs <carpeta-sortida> */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { serve } from '../tests/serve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = process.argv[2] || 'captures-ux';
mkdirSync(OUT, { recursive: true });
const PORT = 8765 + Math.floor(Math.random() * 200);
const srv = await serve(ROOT, PORT);
const APP = `http://127.0.0.1:${PORT}/SOS/index.html`;
const VIEWS = { escriptori: { width: 1366, height: 900 }, mobil: { width: 390, height: 844 } };
const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

const mesura = () => {
  const vw = innerWidth, vh = innerHeight;
  const m = document.querySelector('#modalRoot .modal');
  const zona = m || document.querySelector('.workspace,.main,main') || document.body;
  const r = m ? m.getBoundingClientRect() : null;
  const vis = e => e.offsetParent || e.getClientRects().length;
  const q = s => [...zona.querySelectorAll(s)].filter(vis).length;
  const text = (zona.innerText || '').replace(/\s+/g, ' ').trim();
  return {
    modal: !!m,
    modals: document.querySelectorAll('#modalRoot .modal').length,
    ocupaAmple: r ? +(r.width / vw).toFixed(2) : 1,
    ocupaAlt: r ? +(r.height / vh).toFixed(2) : 1,
    scrollIntern: m ? +(m.scrollHeight / Math.max(1, m.clientHeight)).toFixed(1) : +(document.documentElement.scrollHeight / vh).toFixed(1),
    botons: q('button,a.btn,[role=button]'),
    camps: q('input:not([type=hidden]),select,textarea'),
    plecs: q('details'),
    titols: q('h1,h2,h3'),
    paraules: text ? text.split(' ').length : 0,
    titol: ((m || document).querySelector('h1,h2') || {}).textContent?.trim().slice(0, 90) || '',
    hash: location.hash,
    text: text.slice(0, 1200)
  };
};

const inventari = [];
let n = 0;
async function captura(page, vista, nom, grup) {
  await page.waitForTimeout(250);
  const m = await page.evaluate(mesura).catch(() => null);
  if (!m) return;
  const id = String(++n).padStart(3, '0') + '-' + vista + '-' + nom.replace(/[^a-z0-9]+/gi, '-').slice(0, 40);
  await page.screenshot({ path: join(OUT, id + '.jpg'), type: 'jpeg', quality: 55, fullPage: false });
  inventari.push(Object.assign({ id, vista, nom, grup }, m));
}
const tanca = page => page.evaluate(() => { const S = window.__SOS; try { S.closeModal(); } catch (e) {} document.querySelector('#modalRoot').innerHTML = ''; });

for (const [vista, vp] of Object.entries(VIEWS)) {
  const ctx = await b.newContext({ viewport: vp });
  const page = await ctx.newPage();
  await page.goto(APP + '?viu');
  await page.waitForFunction(() => window.__SOS);
  await page.waitForTimeout(1500);
  await tanca(page);
  await page.evaluate(() => window.__SOS.setShowAllTabs(true));

  // 1 · portades
  for (const hv of await page.evaluate(() => window.__SOS.HOME_VIEWS)) {
    await page.evaluate(v => { const S = window.__SOS; S.state.activeId = null; S.state.homeView = v; S.render(); }, hv);
    await captura(page, vista, 'portada-' + hv, 'portada');
  }
  // 2 · un node de cada tipus, totes les pestanyes
  const nodes = await page.evaluate(() => {
    const S = window.__SOS, vist = {}, out = [];
    Object.values(S.state.nodes || {}).forEach(nd => {
      if (!nd || !nd.id || nd.type === 'meta') return;
      const k = (nd.nodeLevel || '') + '|' + (nd.dynamicType || '');
      if (vist[k]) return; vist[k] = 1; out.push({ id: nd.id, k, nom: nd.name || nd.title || nd.id });
    });
    return out.slice(0, 12);
  });
  for (const nd of nodes) {
    await page.evaluate(id => { const S = window.__SOS; S.selectNode(id); }, nd.id);
    await page.waitForTimeout(300);
    const tabs = await page.evaluate(() => [...document.querySelectorAll('.tabs .tab:not(.tab-more)')].map((b, i) => i));
    for (const i of tabs) {
      await page.evaluate(i => document.querySelectorAll('.tabs .tab:not(.tab-more)')[i].click(), i);
      const lbl = await page.evaluate(i => (document.querySelectorAll('.tabs .tab:not(.tab-more)')[i] || {}).textContent || '', i);
      await captura(page, vista, 'node-' + nd.k + '-' + lbl, 'pestanya');
    }
  }
  // 3 · rutes modals
  for (const r of await page.evaluate(() => Object.keys(window.__SOS.MODAL_ROUTES))) {
    await tanca(page);
    await page.evaluate(r => { try { window.__SOS.MODAL_ROUTES[r].open(); } catch (e) {} }, r);
    if (await page.evaluate(() => window.__SOS.modalOpen())) await captura(page, vista, 'ruta-' + r, 'modal-ruta');
  }
  // 4 · la resta d'open* exposats, amb el node actiu si en demanen
  await page.evaluate(() => { const S = window.__SOS; const nd = Object.values(S.state.nodes).find(x => x && x.vna); if (nd) S.selectNode(nd.id); });
  const fns = await page.evaluate(() => Object.keys(window.__SOS).filter(k => /^open[A-Z]/.test(k) && typeof window.__SOS[k] === 'function'));
  for (const f of fns) {
    await tanca(page);
    const ok = await page.evaluate(async f => {
      const S = window.__SOS, nd = S.byId(S.state.activeId);
      const orig = window.prompt, oc = window.confirm; window.prompt = () => null; window.confirm = () => false;
      try { const p = S[f].length ? S[f](nd) : S[f](); if (p && p.then) await Promise.race([p, new Promise(r => setTimeout(r, 1500))]); } catch (e) {}
      window.prompt = orig; window.confirm = oc;
      return S.modalOpen();
    }, f).catch(() => false);
    if (ok) await captura(page, vista, f, 'modal');
  }
  await ctx.close();
}
writeFileSync(join(OUT, 'inventari.json'), JSON.stringify(inventari, null, 1));
console.log('pantalles:', inventari.length);
await b.close(); srv.close();
