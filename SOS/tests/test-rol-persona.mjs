/* Qui porta cada rol del mapa · l'assignació per defecte
   ──────────────────────────────────────────────────────
   Un mapa amb els rols buits és un pòster. A l'app els rols els dibuixa la
   gent, així que el que demana cada rol també l'ha de dir la gent — però la
   resta de la regla és la mateixa que a les pàgines de mapa:

   · **El vocabulari i la puntuació són els mateixos** que a `vna.html` i
     `compra.html`. Si aquí la llista fos més curta, la mateixa persona rebria
     propostes diferents segons per quina pantalla hi entrés.
   · **Es proposa, no s'imposa.** L'assignació automàtica no toca els rols que
     algú ja ha triat a mà.
   · **Concentrar rols en poca gent es diu.** Portar-ne tres no és eficiència:
     és el que aquest mètode serveix per veure abans que passi, i per això la
     proposta ho penalitza i la pantalla ho avisa.
   · **Sense saber què demana un rol, no es proposa ningú.** Triar algú per a un
     rol que no ha descrit ningú és triar-lo a dit. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const page = await b.newPage();
page.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
await page.goto(APP);
await page.waitForFunction(() => window.__SOS && window.__SOS.suggestRoleMembers);
await page.evaluate(async () => { await window.__SOS.markOnboardingDone(); });

/* Un node amb el mapa d'una dinàmica de debò i quatre persones amb capacitats
   diferents: és el cas que es viu a una sessió. */
const seed = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Grup de consum de prova', 'projecte', null);
  n.dynamicType = 'consum_agroecologic';
  S.seedFromDynamic(n, S.dynById('consum_agroecologic'));
  S.state.nodes.push(n);
  const gent = [['Aina', ['ordre', 'temps', 'numeros']], ['Biel', ['espai', 'temps']],
    ['Carme', ['ofici', 'transport']], ['Dani', []]];
  gent.forEach(([nom, ap]) => {
    const m = S.newMember({ name: nom });
    m.aports = ap; S.membersOf(n).push(m);
  });
  await S.persist(n); S.selectNode(n.id);
  return { id: n.id, rols: n.vna.roles.map(r => r.name), gent: S.membersOf(n).length };
});

console.log('\n1 · El mateix vocabulari que als altres mapes');
{
  const r = await page.evaluate(() => {
    const S = window.__SOS;
    return { aports: S.APORTS.map(a => a.id), pes: S.PES, clau: S.PERFIL_CLAU,
      identitat: S.APORTS.some(a => /nom|correu|edat|dni/i.test(a.id)) };
  });
  ok(r.aports.length === 10, `deu capacitats, les mateixes que a les pàgines de mapa`);
  ok(r.clau === 'sos_perfil_aports', `i la mateixa clau de perfil: «${r.clau}»`);
  ok(JSON.stringify(r.pes) === JSON.stringify({ cobreix: 60, usa: 25, pes: 15 }),
    'i els mateixos pesos de puntuació');
  ok(!r.identitat, 'cap capacitat és una dada d\'identitat');
  ok(seed.rols.length >= 5 && seed.gent === 4,
    `el node de prova té ${seed.rols.length} rols i ${seed.gent} persones`);
}

console.log('\n2 · Sense saber què demana el rol, no es proposa ningú');
{
  const r = await page.evaluate(id => {
    const S = window.__SOS, n = S.byId(id);
    const rol = n.vna.roles[0];
    const sense = S.suggestRoleMembers(n, rol);
    const auto = S.autoAssignRoles(n);
    return { cal: S.roleCal(rol).length, punts: sense.map(x => x.punts),
      assignats: auto.fets.length, sense: auto.sense.length,
      motiu: auto.sense[0] && auto.sense[0].per };
  }, seed.id);
  ok(r.cal === 0, 'un rol acabat de sembrar no diu què demana');
  ok(r.punts.every(p => p === 0), 'i llavors ningú puntua: triar seria triar a dit');
  ok(r.assignats === 0 && r.sense > 0, `l'assignació automàtica no n'assigna cap i diu per què`);
  ok(/no diu què demana/.test(r.motiu || ''), `«${r.motiu}»`);
}

console.log('\n3 · Amb el que demana escrit, proposa qui ho porta — i diu què li falta');
{
  const r = await page.evaluate(async id => {
    const S = window.__SOS, n = S.byId(id);
    const byNom = nm => n.vna.roles.find(x => x.name === nm);
    S.setRoleCal(n, byNom('Coordinació'), ['ordre', 'temps', 'numeros']);
    S.setRoleCal(n, byNom('Punt de repartiment'), ['espai', 'temps']);
    S.setRoleCal(n, byNom('Productors/es locals'), ['ofici', 'transport']);
    await S.persist(n);
    const co = S.suggestRoleMembers(n, byNom('Coordinació'));
    const pu = S.suggestRoleMembers(n, byNom('Punt de repartiment'));
    return { co: co.map(x => x.member.name + ':' + x.punts),
      coTop: co[0].member.name, coFalten: co[0].falten.length,
      puTop: pu[0].member.name,
      ultim: co[co.length - 1].member.name, ultimPunts: co[co.length - 1].punts,
      te: co[0].te.length, ordenat: co.every((x, i) => i === 0 || co[i - 1].punts >= x.punts) };
  }, seed.id);
  ok(r.coTop === 'Aina' && r.coFalten === 0,
    `«Coordinació» demana ordre, temps i números → proposa Aina, que ho porta tot`);
  ok(r.puTop === 'Biel', '«Punt de repartiment» demana espai i temps → proposa Biel');
  ok(r.ordenat, 'la llista va de més a menys encaix');
  ok(r.ultim === 'Dani' && r.ultimPunts === 0,
    'i qui encara no ha dit què pot posar-hi queda l\'últim amb zero, no amagat');
}

console.log('\n4 · Assigna per defecte: omple els buits i no toca els triats');
{
  const r = await page.evaluate(async id => {
    const S = window.__SOS, n = S.byId(id);
    const byNom = nm => n.vna.roles.find(x => x.name === nm);
    /* Una decisió presa a mà: Carme porta la coordinació encara que no hi
       encaixi. L'automàtic no la pot desfer. */
    S.assignRoleMember(n, byNom('Coordinació'), S.membersOf(n).find(m => m.name === 'Carme').id);
    const res = S.autoAssignRoles(n);
    await S.persist(n);
    return { coord: (S.roleOwner(n, byNom('Coordinació')) || {}).name,
      punt: (S.roleOwner(n, byNom('Punt de repartiment')) || {}).name,
      prod: (S.roleOwner(n, byNom('Productors/es locals')) || {}).name,
      fets: res.fets.map(f => f.role + '→' + f.qui), sense: res.sense.length };
  }, seed.id);
  ok(r.coord === 'Carme', 'el rol triat a mà segueix sent de qui el va triar: una proposta no desfà una decisió');
  ok(r.punt === 'Biel' && r.prod === 'Carme',
    `i omple els buits amb qui hi encaixa: ${r.fets.join(', ')}`);
  ok(r.sense > 0, 'i els rols que no diuen què demanen es queden buits i comptats');
}

console.log('\n5 · Concentrar rols en poca gent es penalitza i es diu');
{
  const r = await page.evaluate(id => {
    const S = window.__SOS, n = S.byId(id);
    const byNom = nm => n.vna.roles.find(x => x.name === nm);
    const sob = S.rolesSobrecarrega(n);
    /* Carme ja porta dos rols: per a un tercer que li aniria com anell al dit,
       la seva puntuació ha de baixar respecte del seu encaix brut. */
    const lliure = byNom('Comunitat');
    S.setRoleCal(n, lliure, ['ofici', 'transport']);
    const ll = S.suggestRoleMembers(n, lliure);
    const carme = ll.find(x => x.member.name === 'Carme');
    return { sob: sob.map(x => x.member.name + ':' + x.rols),
      brut: carme.brut, punts: carme.punts, jaPorta: carme.jaPorta,
      penal: S.PENAL_ROLS, guanya: ll[0].member.name };
  }, seed.id);
  ok(r.sob.length > 0, `es diu qui porta més d'un rol: ${r.sob.join(', ')}`);
  ok(r.jaPorta === 2 && r.punts < r.brut,
    `qui ja en porta ${r.jaPorta} puntua menys per al següent (${r.brut} → ${r.punts})`);
  ok(r.penal > 0 && r.penal < 1, 'la penalització existeix i no anul·la ningú: és un pes, no un veto');
}

console.log('\n6 · El rol es pot deixar lliure, i el mapa ho reflecteix');
{
  const r = await page.evaluate(async id => {
    const S = window.__SOS, n = S.byId(id);
    const rol = n.vna.roles.find(x => x.name === 'Punt de repartiment');
    const abans = (S.roleOwner(n, rol) || {}).name;
    S.assignRoleMember(n, rol, null);
    await S.persist(n);
    return { abans, despres: S.roleOwner(n, rol), camp: 'memberId' in rol };
  }, seed.id);
  ok(!!r.abans, `«Punt de repartiment» el portava ${r.abans}`);
  ok(r.despres === null && !r.camp,
    'i deixar-lo lliure el treu de debò: no queda un camp buit fent-hi ombra');
}

console.log('\n7 · Un rol només demana coses per al que el mapa diu que lliura');
{
  const r = await page.evaluate(id => {
    const S = window.__SOS, n = S.byId(id);
    const amb = n.vna.roles.filter(x => S.roleDelivers(n, x).length);
    const cap = n.vna.roles.filter(x => !S.roleDelivers(n, x).length);
    const rol = amb[0];
    return { amb: amb.length, cap: cap.length, dona: S.roleDelivers(n, rol),
      nom: rol.name,
      /* i les capacitats que es poden demanar són sempre del vocabulari */
      neteja: (() => { S.setRoleCal(n, rol, ['ordre', 'inventat']);
        return S.roleCal(rol); })() };
  }, seed.id);
  ok(r.amb > 0, `${r.amb} rols del mapa lliuren alguna cosa, i és el que es posa davant de qui decideix què demanen`);
  ok(r.dona.length > 0, `«${r.nom}» lliura: ${r.dona.slice(0, 2).join(' · ')}`);
  ok(r.neteja.length === 1 && r.neteja[0] === 'ordre',
    'i una capacitat inventada no s\'hi queda: el vocabulari és tancat');
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
