/* La marca d'una organització · GENERAT per SOS/tools/build-vna-suport.js
   Les regles surten del bloc VS-SITE de SOS/vna-suport.html (la web del client).
   Navegador: window.Marca. Node: require(). */
(function (g) {
'use strict';
const MARCA_LLETRES = {
  sans: 'system-ui,-apple-system,"Segoe UI",sans-serif',
  serif: '"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif',
  rodona: 'ui-rounded,"SF Pro Rounded","Segoe UI",system-ui,sans-serif',
  mono: 'ui-monospace,"SF Mono",Menlo,Consolas,monospace'
};
function marcaHex(x) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(x || '').trim());
  if (!m) return '';
  const h = m[1].length === 3 ? m[1].replace(/./g, c => c + c) : m[1];
  return '#' + h.toLowerCase();
}
function marcaLlum(hex) {
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function marcaContrast(a, b) { const x = marcaLlum(a), y = marcaLlum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
/* Barreja el color cap al negre (o el blanc) a passos petits fins que fa 4,5:1
   amb el fons. Determinista: el mateix color dona sempre el mateix resultat. */
function marcaAjusta(hex, fons, cap) {
  const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)), dest = cap === 'blanc' ? 255 : 0;
  for (let k = 0; k <= 20; k++) {
    const c = '#' + rgb.map(v => Math.round(v + (dest - v) * k / 20).toString(16).padStart(2, '0')).join('');
    if (marcaContrast(c, fons) >= 4.5) return c;
  }
  return cap === 'blanc' ? '#ffffff' : '#000000';
}
function marcaSvg(svg) {
  const s = String(svg || '').trim();
  if (!/^(<\?xml[^>]*>\s*)?<svg[\s>]/i.test(s) || !/<\/svg>\s*$/i.test(s)) return '';
  if (/<script|<foreignObject|\son[a-z]+\s*=|javascript:|<!ENTITY|xlink:href\s*=\s*["']?(?!#)|\shref\s*=\s*["']?(?!#)/i.test(s)) return '';
  return s.length <= 100000 ? s + '\n' : '';
}
function marcaNeta(m) {
  const x = m && typeof m === 'object' ? m : {}, t = v => (typeof v === 'string' ? v.trim().slice(0, 600) : '');
  const out = {};
  if (marcaHex(x.color)) out.color = marcaHex(x.color);
  if (MARCA_LLETRES[x.lletra]) out.lletra = x.lletra;
  if (x.forma === 'recta' || x.forma === 'rodona') out.forma = x.forma;
  if (t(x.lema)) out.lema = t(x.lema);
  if (t(x.presentacio)) out.presentacio = t(x.presentacio);
  const svg = marcaSvg(x.logoSvg);
  if (svg) out.logoSvg = svg;
  const portes = {};
  Object.keys(x.portes && typeof x.portes === 'object' ? x.portes : {}).forEach(r => {
    const p = x.portes[r] || {}, q = {};
    if (t(p.nom)) q.nom = t(p.nom).slice(0, 40);
    if (t(p.intro)) q.intro = t(p.intro);
    if (q.nom || q.intro) portes[r] = q;
  });
  if (Object.keys(portes).length) out.portes = portes;
  const c = x.contacte && typeof x.contacte === 'object' ? x.contacte : {}, cc = {};
  ['adreca', 'telefon', 'horari'].forEach(k => { if (t(c[k])) cc[k] = t(c[k]).slice(0, 200); });
  if (Object.keys(cc).length) out.contacte = cc;
  return out;
}
const pell=function (m) {
      m = m || {};
      let css = '';
      /* `html` davant: guanya la pell, que s'escriu després a la capçalera. */
      if (m.color) css += 'html:root{--indigo:' + marcaAjusta(m.color, '#fbfaf7', 'negre') + '}html:root[data-tema=fosc]{--indigo:' + marcaAjusta(m.color, '#050507', 'blanc') + '}';
      if (m.lletra) css += 'html body{font-family:' + MARCA_LLETRES[m.lletra] + '}';
      if (m.forma === 'recta') css += 'html .btn,html .targeta,html .card,html input,html select,html textarea{border-radius:3px}';
      return css;
    };
const desa=function (json) {
      const m = json ? marcaNeta(typeof json === 'string' ? JSON.parse(json) : json) : {}, css = pell(m);
      try { if (css) localStorage.setItem('sos-marca-css', css); else localStorage.removeItem('sos-marca-css'); } catch (e) {}
      let st = document.getElementById('sosMarca');
      if (!st) { st = document.createElement('style'); st.id = 'sosMarca'; document.head.appendChild(st); }
      st.textContent = css;
      return m;
    };
const Marca={LLETRES:MARCA_LLETRES,neta:marcaNeta,pell,desa,contrast:marcaContrast};
if (typeof module !== 'undefined' && module.exports) module.exports = Marca; else g.Marca = Marca;
})(typeof globalThis !== 'undefined' ? globalThis : this);
