/* El primer flux de nivell 2 · un formulari del web entra al CRM sol
   ─────────────────────────────────────────────────────────────────────────
   Netlify crida una funció que es diu exactament `submission-created` cada
   vegada que un formulari rep un enviament verificat (el que Netlify marca com
   a brossa no hi arriba). Aquí el passem a Zoho CRM com a lead.

   Les tres coses que no es negocien (backlog, «Un CRM que s'actualitza sol»):

   · **Cap clau al client.** Les credencials de Zoho viuen a les variables
     d'entorn de Netlify. Sense elles, la funció no fa res i ho diu al registre:
     el formulari segueix arribant per correu com sempre.
   · **Cap dada personal al registre.** El registre de Netlify el pot llegir
     qui administra el lloc; només hi escrivim el formulari i el resultat.
   · **Només els formularis de la llista.** Un formulari nou no envia res al
     CRM fins que algú l'hi afegeix aquí a propòsit.

   Variables d'entorn (Netlify › Site configuration › Environment variables):
     ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN  · obligatòries
     ZOHO_DC        · centre de dades: eu (per defecte), com, in, com.au, jp…
     ZOHO_DRY_RUN   · «1» per provar: munta el lead i no l'envia
     ZOHO_LEAD_SOURCE · opcional; si el vostre CRM té el valor a la llista
                        «Lead Source», s'hi posa. Si no, l'origen va a la
                        descripció, que no pot fallar.

   La guia per obtenir-les és a SOS/knowledge/dev/guia-zoho-nivell2.md. */

export const FORMULARIS = {
  'diagnostic-org': 'Diagnòstic d\'organització (web)'
};

const net = v => (v == null ? '' : String(v)).trim();
const tall = (v, n) => { const s = net(v); return s.length > n ? s.slice(0, n - 1) + '…' : s; };

/* El nom en dos camps, perquè Zoho exigeix `Last_Name`: tot el que no és el
   primer mot hi va, i si només n'hi ha un, va sencer a `Last_Name`. */
function parteixNom(nom) {
  const t = net(nom).split(/\s+/).filter(Boolean);
  if (t.length < 2) return { First_Name: '', Last_Name: t[0] || 'Sense nom' };
  return { First_Name: t[0], Last_Name: t.slice(1).join(' ') };
}

/* Del que envia el formulari al lead de Zoho. Pura, per poder-la provar. */
export function aLead(formName, d, opts = {}) {
  const origen = FORMULARIS[formName];
  if (!origen) return null;
  const lead = Object.assign(parteixNom(d.nom), {
    Email: tall(d.mail, 100),
    Phone: tall(d.tel, 30),
    Designation: tall(d.carrec, 100),
    Company: tall(d.orgNom, 200) || tall(d.nom, 200) || 'Sense organització',
    Website: tall(d.web, 255),
    City: tall(d.municipi, 100),
    Description: tall([
      'Origen: ' + origen,
      d.dediqueu && 'A què es dediquen: ' + net(d.dediqueu),
      d.objectiu && 'Objectiu: ' + net(d.objectiu),
      d.termini && 'Termini: ' + net(d.termini),
      d.decideix && 'Qui decideix: ' + net(d.decideix),
      d.ampliacio && 'Ho amplien així: ' + net(d.ampliacio),
      d.resum && '\n' + net(d.resum)
    ].filter(Boolean).join('\n'), 32000)
  });
  const n = parseInt(d.persones, 10);
  if (n > 0) lead.No_of_Employees = n;
  if (opts.leadSource) lead.Lead_Source = opts.leadSource;
  Object.keys(lead).forEach(k => { if (lead[k] === '') delete lead[k]; });
  return lead;
}

export function config(env) {
  const dc = net(env.ZOHO_DC) || 'eu';
  if (!/^[a-z.]{2,8}$/.test(dc)) return { ok: false, motiu: 'ZOHO_DC no és un centre de dades' };
  const falta = ['ZOHO_CLIENT_ID', 'ZOHO_CLIENT_SECRET', 'ZOHO_REFRESH_TOKEN'].filter(k => !net(env[k]));
  if (falta.length) return { ok: false, motiu: 'falten ' + falta.join(', ') };
  return {
    ok: true, dc,
    accounts: 'https://accounts.zoho.' + dc,
    api: 'https://www.zohoapis.' + dc,
    dryRun: net(env.ZOHO_DRY_RUN) === '1',
    leadSource: net(env.ZOHO_LEAD_SOURCE)
  };
}

/* Un enviament, de cap a peus. `fetchFn` i `env` s'injecten per als tests. */
export async function processa(body, env, fetchFn = fetch) {
  let ev;
  try { ev = JSON.parse(body || '{}'); } catch (e) { return { estat: 'ignorat', motiu: 'cos que no és JSON' }; }
  const p = ev.payload || {};
  const formName = net(p.form_name || (p.data && p.data['form-name']));
  if (!FORMULARIS[formName]) return { estat: 'ignorat', motiu: 'formulari fora de la llista', formName };
  const c = config(env);
  if (!c.ok) return { estat: 'sense-config', motiu: c.motiu, formName };
  const lead = aLead(formName, p.data || {}, c);
  if (c.dryRun) return { estat: 'prova', formName, lead, camps: Object.keys(lead) };

  const tok = await fetchFn(c.accounts + '/oauth/v2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: env.ZOHO_REFRESH_TOKEN, client_id: env.ZOHO_CLIENT_ID,
      client_secret: env.ZOHO_CLIENT_SECRET, grant_type: 'refresh_token'
    }).toString()
  });
  const tj = await tok.json().catch(() => ({}));
  if (!tok.ok || !tj.access_token) return { estat: 'error', motiu: 'token: ' + (tj.error || tok.status), formName };

  const r = await fetchFn(c.api + '/crm/v2/Leads', {
    method: 'POST',
    headers: { 'Authorization': 'Zoho-oauthtoken ' + tj.access_token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: [lead], trigger: ['workflow'] })
  });
  const rj = await r.json().catch(() => ({}));
  const fila = rj.data && rj.data[0];
  if (!r.ok || !fila || fila.status !== 'success') {
    return { estat: 'error', motiu: 'lead: ' + ((fila && fila.code) || rj.code || r.status), formName };
  }
  return { estat: 'creat', formName, id: fila.details && fila.details.id };
}

export const handler = async (event) => {
  const r = await processa(event.body, process.env);
  /* Al registre, mai el lead: només què ha passat. */
  console.log('[submission-created]', JSON.stringify({ estat: r.estat, formName: r.formName, motiu: r.motiu, id: r.id, camps: r.camps }));
  return { statusCode: 200, body: JSON.stringify({ estat: r.estat }) };
};
