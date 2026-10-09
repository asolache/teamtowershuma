/* El flux de nivell 2 · formulari → Zoho CRM, provat sense xarxa
   ─────────────────────────────────────────────────────────────────────────
   `netlify/functions/submission-created.mjs` es prova en Node pur, amb un
   `fetch` fals: així corre a la CI i no toca cap CRM de debò. El que es prova:

   · Un formulari fora de la llista no envia res.
   · Sense credencials no fa res (i ho diu), i en mode prova munta el lead
     sense enviar-lo.
   · El lead porta el que toca, i el nom es parteix com demana Zoho.
   · El camí bo: un token i un lead, amb les adreces del centre de dades.
   · Els dos errors (token i lead) tornen «error» sense rebentar.
   · El registre no porta cap dada personal. */
import { processa, aLead, config, handler } from '../../netlify/functions/submission-created.mjs';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const DADES = {
  'form-name': 'diagnostic-org', nom: 'Júlia Ferrer i Puig', mail: 'julia@example.org', tel: '600000000',
  carrec: 'Direcció de persones', orgNom: 'La Cooperativa', web: 'https://example.org',
  municipi: 'Vilafranca del Penedès', persones: '45', dediqueu: 'distribució', objectiu: 'Cohesió',
  termini: '3 mesos', decideix: 'gerència', ampliacio: '', resum: 'Resum del diagnòstic'
};
const cos = (form = 'diagnostic-org', data = DADES) => JSON.stringify({ payload: { form_name: form, data } });
const ENV = { ZOHO_CLIENT_ID: 'id', ZOHO_CLIENT_SECRET: 'secret', ZOHO_REFRESH_TOKEN: 'refresh' };

const fals = (respostes) => {
  const crides = [];
  const f = async (url, opts) => {
    crides.push({ url, opts });
    const r = respostes[crides.length - 1];
    return { ok: r.status < 400, status: r.status, json: async () => r.json };
  };
  f.crides = crides;
  return f;
};

console.log('\n1 · Què no envia res');
{
  const f = fals([]);
  let r = await processa(cos('un-altre'), ENV, f);
  ok(r.estat === 'ignorat' && !f.crides.length, 'un formulari fora de la llista s\'ignora');
  r = await processa('no és json', ENV, f);
  ok(r.estat === 'ignorat', 'un cos que no és JSON s\'ignora');
  r = await processa(cos(), {}, f);
  ok(r.estat === 'sense-config' && /ZOHO_CLIENT_ID/.test(r.motiu) && !f.crides.length, 'sense credencials no crida res i diu què falta');
  ok(!config({ ...ENV, ZOHO_DC: 'evil.com/x' }).ok, 'un centre de dades estrany no es fa servir per muntar adreces');
  r = await processa(cos(), { ...ENV, ZOHO_DRY_RUN: '1' }, f);
  ok(r.estat === 'prova' && r.lead.Email === 'julia@example.org' && !f.crides.length, 'en mode prova munta el lead i no l\'envia');
}

console.log('\n2 · El lead');
{
  const l = aLead('diagnostic-org', DADES);
  ok(l.First_Name === 'Júlia' && l.Last_Name === 'Ferrer i Puig', 'el nom es parteix: primer mot i la resta');
  ok(aLead('diagnostic-org', { nom: 'Júlia' }).Last_Name === 'Júlia', 'amb un sol mot, va sencer a Last_Name (obligatori a Zoho)');
  ok(l.Company === 'La Cooperativa' && l.City === 'Vilafranca del Penedès' && l.No_of_Employees === 45, 'organització, municipi i persones');
  ok(/Origen: Diagnòstic d'organització/.test(l.Description) && /Resum del diagnòstic/.test(l.Description), 'la descripció diu d\'on ve i porta el resum');
  ok(!('Lead_Source' in l), 'sense ZOHO_LEAD_SOURCE no s\'inventa un valor de la llista');
  ok(aLead('diagnostic-org', DADES, { leadSource: 'Web' }).Lead_Source === 'Web', 'i amb ell, s\'hi posa');
  ok(!Object.values(l).includes(''), 'cap camp buit viatja');
  ok(aLead('x', DADES) === null, 'un formulari desconegut no fa lead');
}

console.log('\n2b · La comanda de la pàgina de preus');
{
  const c = aLead('comanda', { nom: 'Júlia Ferrer', mail: 'julia@example.org', orgNom: 'La Cooperativa',
    paquet: 'Taller d\'equip', preu: 'a confirmar', quan: 'dimarts', notes: 'som 8', resum: 'COMANDA · Taller d\'equip' });
  ok(c && c.Email === 'julia@example.org' && c.Company === 'La Cooperativa', 'la comanda també entra com a lead');
  ok(/Origen: Comanda des de la pàgina de preus/.test(c.Description) && /Comanda: Taller d'equip · a confirmar/.test(c.Description),
    'i la descripció diu què s\'ha contractat i a quin preu');
  ok(/Quan: dimarts/.test(c.Description) && /Notes: som 8/.test(c.Description), 'amb quan i les notes');
}

console.log('\n3 · El camí bo');
{
  const f = fals([{ status: 200, json: { access_token: 'tok' } }, { status: 201, json: { data: [{ status: 'success', code: 'SUCCESS', details: { id: '123' } }] } }]);
  const r = await processa(cos(), { ...ENV, ZOHO_DC: 'com' }, f);
  ok(r.estat === 'creat' && r.id === '123', 'crea el lead i en torna l\'id');
  ok(f.crides[0].url === 'https://accounts.zoho.com/oauth/v2/token' && /grant_type=refresh_token/.test(f.crides[0].opts.body), 'primer el token, al centre de dades triat');
  const c2 = f.crides[1];
  ok(c2.url === 'https://www.zohoapis.com/crm/v2/Leads' && c2.opts.headers.Authorization === 'Zoho-oauthtoken tok', 'després el lead, amb el token');
  ok(JSON.parse(c2.opts.body).data[0].Email === 'julia@example.org', 'i el lead viatja sencer');
  const f2 = fals([{ status: 200, json: { access_token: 't' } }, { status: 201, json: { data: [{ status: 'success', details: { id: '1' } }] } }]);
  await processa(cos(), ENV, f2);
  ok(f2.crides[0].url.startsWith('https://accounts.zoho.eu/'), 'per defecte, el centre de dades europeu');
}

console.log('\n4 · Els errors no rebenten');
{
  let f = fals([{ status: 400, json: { error: 'invalid_code' } }]);
  let r = await processa(cos(), ENV, f);
  ok(r.estat === 'error' && /invalid_code/.test(r.motiu) && f.crides.length === 1, 'un token dolent atura abans del lead');
  f = fals([{ status: 200, json: { access_token: 't' } }, { status: 400, json: { data: [{ status: 'error', code: 'MANDATORY_NOT_FOUND' }] } }]);
  r = await processa(cos(), ENV, f);
  ok(r.estat === 'error' && /MANDATORY_NOT_FOUND/.test(r.motiu), 'un lead rebutjat diu el codi de Zoho');
}

console.log('\n5 · El registre');
{
  const vell = console.log, linies = [];
  console.log = (...a) => linies.push(a.join(' '));
  const envVell = process.env.ZOHO_DRY_RUN;
  Object.assign(process.env, ENV, { ZOHO_DRY_RUN: '1' });
  const res = await handler({ body: cos() });
  console.log = vell;
  ['ZOHO_CLIENT_ID', 'ZOHO_CLIENT_SECRET', 'ZOHO_REFRESH_TOKEN'].forEach(k => delete process.env[k]);
  if (envVell === undefined) delete process.env.ZOHO_DRY_RUN; else process.env.ZOHO_DRY_RUN = envVell;
  const txt = linies.join('\n');
  ok(res.statusCode === 200 && /"estat":"prova"/.test(txt), 'respon 200 i diu què ha passat');
  ok(!/julia|Júlia|600000000|Cooperativa/.test(txt), 'el registre no porta cap dada personal');
  ok(/"camps":\["First_Name"/.test(txt), 'en mode prova, només els noms dels camps');
}

console.log(`\n${fail ? '❌' : '✅'} ${pass} correctes, ${fail} errors`);
process.exit(fail ? 1 : 0);
