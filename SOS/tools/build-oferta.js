#!/usr/bin/env node
/* El catàleg de paquets · declarat un cop, escrit a la portada
 * ─────────────────────────────────────────────────────────────────────────
 * Hi havia tres catàlegs que no es parlaven. El `README.md` venia sis serveis
 * corporatius amb vint anys d'entrega darrere (castells per a equips, VNA,
 * comunitats de pràctica, RRHH, producció d'esdeveniments, formació d'equips).
 * La portada en venia tretze de comunitaris que el README ignorava. I
 * `SOS/knowledge/negoci/formacio-mentoria.md` —que és l'únic que té públics,
 * dolors, vies de finançament i preus— no arribava a cap pantalla.
 *
 * Cap dels tres es podia portar a una visita, perquè cap deia el que decideix
 * una compra: **qui la fa, quant dura, què s'endú, quant costa, amb quins
 * diners es paga i quantes vegades s'ha fet.** Un quadre que explica molt bé
 * què és una cosa no es pot portar a una junta.
 *
 * Això no inventa oferta nova: **paquetitza la que ja existeix**. Els sis del
 * README hi són sencers, els S1–S7 del document de negoci també, i cada paquet
 * declara en quin punt d'adaptació al mercat està.
 *
 * ── Per què generat i no escrit ──────────────────────────────────────────
 * Cada paquet viu en cinc llocs de la pàgina: el quadre, la taula de preus,
 * la clau catalana i la castellana del diccionari, i l'àncora del menú. Escrit
 * a mà, canviar un preu vol dir encertar-los tots cinc —i el dia que se
 * n'oblida un, la pàgina diu dos preus alhora i ningú ho veu perquè el
 * castellà el llegeixen altres persones que el català.
 *
 * Es declara aquí, es genera allà, i `--check` peta al CI si s'han desviat.
 * Mateix patró que `build-nav.js`, `build-mapa.js` i `build-molekulandia.js`.
 *
 * ── Dues decisions que no són òbvies ─────────────────────────────────────
 * · **Surt HTML estàtic, no pintat per JavaScript.** Les objeccions de la
 *   portada ja van en `<details>` natiu precisament perquè funcionin sense JS
 *   i el cercador les indexi; un catàleg que necessités JS per existir seria
 *   un catàleg que Google no llegeix.
 * · **El punt d'adaptació és un camp obligatori.** Sense ell, els vint anys de
 *   món corporatiu servirien de prova d'un producte comunitari que encara no
 *   en té —que és exactament el que fa avui el README.
 *
 * Ús:  node SOS/tools/build-oferta.js [--check]
 */
'use strict';
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const PORTADA = join(ARREL, 'index.html');
const README = join(ARREL, 'README.md');
const CHECK = process.argv.includes('--check');

/* ══ LES FAMÍLIES ════════════════════════════════════════════════════════
   Tres, i són **els tres oficis**: consultor, formador, i qui produeix i
   dinamitza. No estan ordenades per importància sinó pel camí que fa un
   client: primer mira, després aprèn, després ho fa passar. */
const FAMILIES = [
  { id: 'consultoria', ic: '🕸️',
    nom: 'Consultoria', nomEs: 'Consultoría',
    sub: 'Mirar i decidir amb el mapa a la mà',
    subEs: 'Mirar y decidir con el mapa en la mano' },
  { id: 'formacio', ic: '🎓',
    nom: 'Formació', nomEs: 'Formación',
    sub: 'S\'aprèn fent, sobre el vostre cas i no sobre un d\'inventat',
    subEs: 'Se aprende haciendo, sobre vuestro caso y no sobre uno inventado' },
  { id: 'dinamitzacio', ic: '🎪',
    nom: 'Producció i dinamització', nomEs: 'Producción y dinamización',
    sub: 'Que passi de debò, i que el dilluns segueixi passant',
    subEs: 'Que pase de verdad, y que el lunes siga pasando' },
  /* La quarta família no és una moda: és on cauen les dues coses que abans no
     tenien lloc al catàleg —automatitzar fluxos i construir peces— i que es
     venen a empresa i a administració exactament igual. */
  { id: 'digital', ic: '⚙️',
    nom: 'Digital i IA', nomEs: 'Digital e IA',
    sub: 'Automatitzar el que es repeteix, posar valor al que no es veu',
    subEs: 'Automatizar lo que se repite, poner valor a lo que no se ve' }
];

/* ══ EL SECTOR ════════════════════════════════════════════════════════════
   El catàleg parla a dues cases que compren de manera diferent: una empresa
   decideix i signa, i una administració ha de poder-ho encaixar en una
   partida i sota un sostre de contractació. Fins ara la portada només parlava
   a la segona —«per a ajuntaments, consells comarcals i entitats» era la
   primera línia de la pàgina— i la meitat de l'oferta, la que té vint anys de
   quilòmetres, quedava fora del que la pàgina deia que venia.

   Es declara al paquet i el filtre de la portada el llegeix de l'atribut. Sense
   JavaScript surten tots, que és el que ha de passar. */
const SECTORS = {
  privat: { lbl: 'Empreses i cooperatives', lblEs: 'Empresas y cooperativas' },
  public: { lbl: 'Administració i entitats', lblEs: 'Administración y entidades' },
  tots:   { lbl: 'Els dos', lblEs: 'Los dos' }
};

/* ══ EL PUNT D'ADAPTACIÓ ══════════════════════════════════════════════════
   El camp que fa honesta tota la resta. Un paquet «provat» té els casos per
   demostrar-ho; un de «nou» encara no, i dir-ho val més que la venda que es
   perd. Veda 137.

   Què vol dir cadascun s'explica una vegada al peu de la secció, que va
   traduït. Un `title` amb el text llarg hauria estat una cadena en català
   damunt de la pàgina en castellà: mig traduir és pitjor que no traduir. */
const PUNTS = {
  provat:    { lbl: 'Provat',        lblEs: 'Probado',        cls: 'pk-provat' },
  adaptacio: { lbl: 'En adaptació',  lblEs: 'En adaptación',  cls: 'pk-adapt'  },
  nou:       { lbl: 'Nou',           lblEs: 'Nuevo',          cls: 'pk-nou'    }
};

/* ══ D'ON SURT EL PREU ═════════════════════════════════════════════════════
   Un preu sense procedència és una xifra que qui la llegeix no pot discutir i
   qui la diu no pot defensar. N'hi ha de tres menes en aquest catàleg i es
   diuen totes tres, perquè no valen el mateix:

     · `mapa`     — no porta xifra publicada. El preu es dimensiona amb el mapa
       de cost (rols, hores i nivells) i es tanca a la proposta. És el cas del
       taller i de les demostracions: el que costen depèn de quanta gent hi ha,
       quanta colla cal moure i on és, i publicar-ne una xifra tancada seria
       comprometre'n una que després s'ha de desdir.
     · `negoci`   — surt de les forquilles del model de negoci
       (`SOS/knowledge/negoci/formacio-mentoria.md` §3), pensades i escrites.
     · `estimacio`— encara no s'ha facturat prou vegades per tenir tarifa.
       Es diu, i és el que la primera conversa ha de tancar.

   Veda 139: una forquilla sense el que la mou és un rang, no un preu. Cada
   paquet diu **què fa pujar o baixar dins de la seva** (`perque`) i **què
   s'endú qui la paga** (`valor`), que és l'única pregunta que decideix. */
const FONTS = {
  mapa:      { lbl: 'Segons mapa de cost', lblEs: 'Según mapa de coste' },
  negoci:    { lbl: 'Forquilla del model', lblEs: 'Horquilla del modelo' },
  estimacio: { lbl: 'A validar',       lblEs: 'A validar' }
};

/* ══ L'ESCALA ═════════════════════════════════════════════════════════════
   Tres nivells i un preu hora, que és com contracta una administració quan
   contracta serveis professionals. El que els separa **no és l'antiguitat**:
   és l'evidència que hi ha al registre del SOS, la mateixa que acredita un
   gestor o un mentor. Un currículum diu el que un vol; el registre diu el que
   ha passat, i qui contracta ho pot verificar sense confiar en ningú.

   Per això aquesta taula i els nivells de la formació són la mateixa cosa i no
   dues de semblants: si algú puja de nivell és perquè té les evidències, i la
   proposta diu quina persona fa quines hores i a quin nivell.

   Les xifres són **sense IVA** i són tarifa proposada per al 2026: encara no
   s'han facturat prou vegades per dir-ne una altra cosa, i dir-ho val més que
   la venda que es perdi. */
const NIVELLS = [
  { id: 'N1', nom: 'Practicant', nomEs: 'Practicante', hora: 35,
    fa: 'Executa la feina acompanyada: recull, registra, prepara sessions i sosté el dia a dia.',
    faEs: 'Ejecuta el trabajo acompañado: recoge, registra, prepara sesiones y sostiene el día a día.',
    ev: 'Perfil actiu i aportacions signades al registre.',
    evEs: 'Perfil activo y aportaciones firmadas en el registro.' },
  { id: 'N2', nom: 'Gestor/a', nomEs: 'Gestor/a', hora: 55,
    fa: 'Sosté un node sencer sol: facilita, mapa, governança, comptes i seguiment.',
    faEs: 'Sostiene un nodo entero solo: facilita, mapa, gobernanza, cuentas y seguimiento.',
    ev: 'Més de 20 h registrades i tres comunitats acompanyades, o una iniciativa liderada.',
    evEs: 'Más de 20 h registradas y tres comunidades acompañadas, o una iniciativa liderada.' },
  { id: 'N3', nom: 'Mentor/a', nomEs: 'Mentor/a', hora: 80,
    fa: 'Dissenya l\'encàrrec, hi posa el criteri, decideix davant del client i forma els altres.',
    faEs: 'Diseña el encargo, pone el criterio, decide ante el cliente y forma a los demás.',
    ev: 'Més de 50 h, tres comunitats, dues iniciatives o una graduada, i gestors formats.',
    evEs: 'Más de 50 h, tres comunidades, dos iniciativas o una graduada, y gestores formados.' }
];

/* Els quatre passos del mapa de cost. Es declaren aquí perquè la portada, el
   README i la pàgina d'IA en diguin exactament el mateix: el dia que el mètode
   canviï, canvia en un lloc. */
const PASSOS_COST = [
  { t: 'Es dibuixa la feina com un mapa de valor',
    tEs: 'Se dibuja el trabajo como un mapa de valor',
    d: 'Quins rols la fan i quins intercanvis hi ha entre ells. És el mateix mapa que us ensenyem a fer, i el mateix que us quedeu.',
    dEs: 'Qué roles la hacen y qué intercambios hay entre ellos. Es el mismo mapa que os enseñamos a hacer, y el mismo que os quedáis.' },
  { t: 'Cada rol porta les seves hores',
    tEs: 'Cada rol lleva sus horas',
    d: 'Les hores surten dels fluxos del mapa, no d\'una intuïció. Si un flux no hi és, no es cobra; si hi és, es pot discutir.',
    dEs: 'Las horas salen de los flujos del mapa, no de una intuición. Si un flujo no está, no se cobra; si está, se puede discutir.' },
  { t: 'Cada rol té el preu del seu nivell',
    tEs: 'Cada rol tiene el precio de su nivel',
    d: 'Tres nivells, i el que els separa és evidència verificable al registre. La proposta diu quina persona fa quines hores.',
    dEs: 'Tres niveles, y lo que los separa es evidencia verificable en el registro. La propuesta dice qué persona hace qué horas.' },
  { t: 'Les despeses directes, al seu preu de factura',
    tEs: 'Los gastos directos, a su precio de factura',
    d: 'Desplaçaments, materials, lloguers, músics, monitors i tercers. Sense marge amagat a sobre: si es revenen, es diu.',
    dEs: 'Desplazamientos, materiales, alquileres, músicos, monitores y terceros. Sin margen escondido encima: si se revenden, se dice.' }
];

/* El sostre. Un ajuntament o un consell comarcal contracta fins aquí sense
   obrir un expedient llarg; per sobre, la proposta deixa de ser una decisió
   d'una regidoria i passa a ser un procediment. El que ha de quedar per sota
   és **l'entrada de la forquilla**: si el mínim ja hi passa, aquell paquet no
   té cap manera d'entrar-hi. Quan el màxim la supera, la fitxa ha de dir què
   l'hi porta —mai una sorpresa a la proposta. */
const SOSTRE_PUBLIC = 5000;

/* ══ ELS PAQUETS ══════════════════════════════════════════════════════════
   `ve` diu d'on surt cadascun, i no és decoració: la guarda comprova que cap
   servei del README s'hagi quedat pel camí i que cap paquet se l'hagi
   inventat ningú.
     · S1–S7  → SOS/knowledge/negoci/formacio-mentoria.md §3
     · README → els sis serveis del README, que ja s'entreguen
     · repo   → una peça que ja existeix al repositori i es pot ensenyar */
const PAQUETS = [

  /* ── 1 · Consultoria ─────────────────────────────────────────────────── */
  { id: 'diagnostic-teixit', sector: 'public', fam: 'consultoria', ve: 'S1', punt: 'adaptacio',
    preuMin: 1500, preuMax: 3000, font: 'negoci', publica: true, enllac: '/SOS/vna.html',
    nom: 'Diagnòstic del teixit local',
    nomEs: 'Diagnóstico del tejido local',
    qui: 'Ajuntaments, consells comarcals i entitats',
    quiEs: 'Ayuntamientos, consejos comarcales y entidades',
    dura: '2 sessions · 3 setmanes',
    duraEs: '2 sesiones · 3 semanas',
    endus: 'L\'informe amb el mapa de valor del teixit real: qui sosté què, quins fluxos falten i de qui penja tot abans que es cremi.',
    endusEs: 'El informe con el mapa de valor del tejido real: quién sostiene qué, qué flujos faltan y de quién cuelga todo antes de que se queme.',
    valor: 'Deixes de decidir per intuïció. Saps quins tres vincles sostenen el poble i quin es trencarà primer, que és el que evita perdre un any en un projecte que no s\'aguantava.',
    valorEs: 'Dejas de decidir por intuición. Sabes qué tres vínculos sostienen el pueblo y cuál se romperá primero, que es lo que evita perder un año en un proyecto que no se aguantaba.',
    perque: 'Puja amb el nombre d\'actors a mapar i amb les sessions de validació amb el teixit; baixa si ja teniu un cens d\'entitats fet.',
    perqueEs: 'Sube con el número de actores a mapear y con las sesiones de validación con el tejido; baja si ya tenéis un censo de entidades hecho.',
    diners: 'Catàleg de serveis de la Diputació · partida de participació ciutadana',
    dinersEs: 'Catálogo de servicios de la Diputación · partida de participación ciudadana' },

  { id: 'mapa-organitzacio', sector: 'privat', fam: 'consultoria', ve: 'README', punt: 'provat',
    preuMin: 2500, preuMax: 4500, font: 'estimacio', publica: false, enllac: '/SOS/vna.html',
    nom: 'Mapa de valor d\'una organització',
    nomEs: 'Mapa de valor de una organización',
    qui: 'Empreses, cooperatives i entitats amb equip propi',
    quiEs: 'Empresas, cooperativas y entidades con equipo propio',
    dura: '3 sessions · 4-6 setmanes',
    duraEs: '3 sesiones · 4-6 semanas',
    endus: 'El mapa dels intercanvis reals, tangibles i intangibles, i on es perd valor sense que ho vegi ningú. Mètode VNA de Verna Allee.',
    endusEs: 'El mapa de los intercambios reales, tangibles e intangibles, y dónde se pierde valor sin que lo vea nadie. Método VNA de Verna Allee.',
    valor: 'Es veu qui sosté el que no consta a cap organigrama. És la conversa que evita que, quan aquella persona plegui, l\'equip descobreixi de cop tot el que feia.',
    valorEs: 'Se ve quién sostiene lo que no consta en ningún organigrama. Es la conversación que evita que, cuando esa persona se vaya, el equipo descubra de golpe todo lo que hacía.',
    perque: 'Puja amb el nombre de rols i de departaments implicats; baixa si el mapa es fa amb un sol equip i no amb tota la casa.',
    perqueEs: 'Sube con el número de roles y departamentos implicados; baja si el mapa se hace con un solo equipo y no con toda la casa.',
    diners: 'Pressupost propi de millora o de formació',
    dinersEs: 'Presupuesto propio de mejora o de formación' },

  { id: 'mapa-comarcal', sector: 'public', fam: 'consultoria', ve: 'S1', punt: 'nou',
    preuMin: 3500, preuMax: 6000, font: 'negoci', publica: true, enllac: '/SOS/vna.html',
    nom: 'Mapa comarcal i assemblea federativa',
    nomEs: 'Mapa comarcal y asamblea federativa',
    qui: 'Consells comarcals i mancomunitats',
    quiEs: 'Consejos comarcales y mancomunidades',
    dura: '4 sessions amb diversos municipis · 2-3 mesos',
    duraEs: '4 sesiones con varios municipios · 2-3 meses',
    endus: 'El mapa de tota la comarca i una decisió presa i registrada amb pes per arrel de població i correcció de desigualtat.',
    endusEs: 'El mapa de toda la comarca y una decisión tomada y registrada con peso por raíz de población y corrección de desigualdad.',
    valor: 'Resol el problema polític que teniu: que el municipi gran no decideixi pels petits i que els petits no valguin el mateix que el gran. Amb això, els acords es prenen; sense, es tornen a ajornar.',
    valorEs: 'Resuelve el problema político que tenéis: que el municipio grande no decida por los pequeños y que los pequeños no valgan lo mismo que el grande. Con esto, los acuerdos se toman; sin ello, se vuelven a aplazar.',
    perque: 'Puja amb el nombre de municipis que hi entren i amb els desplaçaments; per sota de vuit municipis és a la banda baixa i cap sota el sostre de contractació menor.',
    perqueEs: 'Sube con el número de municipios que entran y con los desplazamientos; por debajo de ocho municipios está en la banda baja y cabe bajo el techo de contratación menor.',
    diners: 'Pressupost de cooperació intermunicipal',
    dinersEs: 'Presupuesto de cooperación intermunicipal' },

  { id: 'impacte', sector: 'public', fam: 'consultoria', ve: 'S7', punt: 'nou',
    preuMin: 600, preuMax: 1500, font: 'negoci', publica: true, enllac: '',
    nom: 'Mesura d\'impacte i justificació',
    nomEs: 'Medida de impacto y justificación',
    qui: 'Ajuntaments, fundacions i finançadors',
    quiEs: 'Ayuntamientos, fundaciones y financiadores',
    dura: 'Informe semestral o anual · 2 setmanes',
    duraEs: 'Informe semestral o anual · 2 semanas',
    endus: 'Hores donades, persones actives i reciprocitat, sortint d\'un registre signat i comprovable — no d\'una enquesta de satisfacció.',
    endusEs: 'Horas donadas, personas activas y reciprocidad, saliendo de un registro firmado y comprobable — no de una encuesta de satisfacción.',
    valor: 'Podeu justificar la subvenció amb dades que aguanten una auditoria, i demanar la següent amb el que ha passat de debò en comptes d\'amb el nombre d\'activitats fetes.',
    valorEs: 'Podéis justificar la subvención con datos que aguantan una auditoría, y pedir la siguiente con lo que ha pasado de verdad en vez de con el número de actividades hechas.',
    perque: 'Puja amb el nombre de projectes a agregar i amb l\'ancoratge permanent si el voleu; el primer informe d\'un sol projecte és el mínim.',
    perqueEs: 'Sube con el número de proyectos a agregar y con el anclaje permanente si lo queréis; el primer informe de un solo proyecto es el mínimo.',
    diners: 'La mateixa partida que ja finança el projecte que es justifica',
    dinersEs: 'La misma partida que ya financia el proyecto que se justifica' },

  { id: 'persones-cultura', sector: 'privat', fam: 'consultoria', ve: 'README', punt: 'provat',
    preuMin: 1800, preuMax: 3200, font: 'estimacio', publica: false, enllac: '',
    nom: 'Diagnòstic de persones i cultura',
    nomEs: 'Diagnóstico de personas y cultura',
    qui: 'Empreses i cooperatives amb equip',
    quiEs: 'Empresas y cooperativas con equipo',
    dura: '3 sessions · 6 setmanes',
    duraEs: '3 sesiones · 6 semanas',
    endus: 'On es trenca la col·laboració, qui sosté el que no consta enlloc, i què caldria canviar primer.',
    endusEs: 'Dónde se rompe la colaboración, quién sostiene lo que no consta en ningún sitio, y qué habría que cambiar primero.',
    valor: 'És la porta d\'entrada: el que ve després es dimensiona amb aquest informe a la mà i no amb una proposta a cegues. Sabeu què costarà abans de comprometre-hi un pressupost.',
    valorEs: 'Es la puerta de entrada: lo que viene después se dimensiona con este informe en la mano y no con una propuesta a ciegas. Sabéis qué costará antes de comprometer un presupuesto.',
    perque: 'Puja amb la mida de l\'equip i amb les entrevistes individuals; amb menys de vint persones és a la banda baixa.',
    perqueEs: 'Sube con el tamaño del equipo y con las entrevistas individuales; con menos de veinte personas está en la banda baja.',
    diners: 'Pressupost propi de recursos humans',
    dinersEs: 'Presupuesto propio de recursos humanos' },

  /* ── 2 · Formació ────────────────────────────────────────────────────── */
  { id: 'gestor', sector: 'public', fam: 'formacio', ve: 'S3', punt: 'nou',
    preuMin: 1200, preuMax: 2000, font: 'negoci', publica: true, enllac: '/SOS/formacio.html',
    nom: 'Programa de Gestor/a',
    nomEs: 'Programa de Gestor/a',
    qui: 'Tècnics municipals i professionals · preu per persona',
    quiEs: 'Técnicos municipales y profesionales · precio por persona',
    dura: '~45 h en 3-4 mesos',
    duraEs: '~45 h en 3-4 meses',
    endus: 'Una persona del territori que sap engegar i sostenir participació sense dependre de ningú. Es fa sobre el vostre projecte, no sobre un cas inventat.',
    endusEs: 'Una persona del territorio que sabe arrancar y sostener participación sin depender de nadie. Se hace sobre vuestro proyecto, no sobre un caso inventado.',
    valor: 'Deixeu de dependre d\'una consultora per sostenir el que ja teniu. El que abans es tornava a contractar cada any queda a dins de la casa.',
    valorEs: 'Dejáis de depender de una consultora para sostener lo que ya tenéis. Lo que antes se volvía a contratar cada año queda dentro de la casa.',
    perque: 'Baixa per persona a partir de la tercera del mateix territori; puja si el projecte sobre el qual es treballa encara no existeix i cal muntar-lo.',
    perqueEs: 'Baja por persona a partir de la tercera del mismo territorio; sube si el proyecto sobre el que se trabaja todavía no existe y hay que montarlo.',
    diners: 'Pla de formació municipal · subvenció de Diputació',
    dinersEs: 'Plan de formación municipal · subvención de Diputación' },

  { id: 'equip-gestor', sector: 'public', fam: 'formacio', ve: 'S3', punt: 'nou',
    preuMin: 4500, preuMax: 7000, font: 'negoci', publica: true, enllac: '/SOS/formacio.html',
    nom: 'Programa d\'equip gestor',
    nomEs: 'Programa de equipo gestor',
    qui: 'Una entitat del territori, finançada per l\'ajuntament',
    quiEs: 'Una entidad del territorio, financiada por el ayuntamiento',
    dura: '12 setmanes · 5 rols · ~34 h de mentoria',
    duraEs: '12 semanas · 5 roles · ~34 h de mentoría',
    endus: 'Un equip de cinc a set persones amb els rols repartits i el relleu previst, i la dinàmica funcionant.',
    endusEs: 'Un equipo de cinco a siete personas con los roles repartidos y el relevo previsto, y la dinámica funcionando.',
    valor: 'Forma un equip i no una persona. És la diferència entre una dinàmica que sobreviu a qui la va engegar i una que es mor quan aquella persona es cansa —que és com moren la majoria.',
    valorEs: 'Forma un equipo y no una persona. Es la diferencia entre una dinámica que sobrevive a quien la arrancó y una que se muere cuando esa persona se cansa —que es como mueren la mayoría.',
    perque: 'Entra sota el sostre de contractació menor amb cinc persones i dotze setmanes; puja si l\'equip és més gran o si l\'acompanyament s\'allarga més enllà del trimestre.',
    perqueEs: 'Entra bajo el techo de contratación menor con cinco personas y doce semanas; sube si el equipo es mayor o si el acompañamiento se alarga más allá del trimestre.',
    diners: 'Partida de participació · Ateneus Cooperatius',
    dinersEs: 'Partida de participación · Ateneus Cooperatius' },

  { id: 'comunitats-practica', sector: 'privat', fam: 'formacio', ve: 'README', punt: 'provat',
    preuMin: 3000, preuMax: 5500, font: 'estimacio', publica: false, enllac: '',
    nom: 'Comunitats de pràctica',
    nomEs: 'Comunidades de práctica',
    qui: 'Organitzacions amb coneixement dispers',
    quiEs: 'Organizaciones con conocimiento disperso',
    dura: '6 sessions en 3 mesos',
    duraEs: '6 sesiones en 3 meses',
    endus: 'El mapa del coneixement que ja teniu i un grup que el fa circular sol quan nosaltres marxem.',
    endusEs: 'El mapa del conocimiento que ya tenéis y un grupo que lo hace circular solo cuando nosotros nos vamos.',
    valor: 'El que sap una persona deixa de sortir per la porta amb ella. Qui entra nou no torna a començar de zero, i això es nota al temps que triga a ser útil.',
    valorEs: 'Lo que sabe una persona deja de salir por la puerta con ella. Quien entra nuevo no vuelve a empezar de cero, y eso se nota en el tiempo que tarda en ser útil.',
    perque: 'Puja amb el nombre de comunitats que s\'engeguen alhora i amb les seus; una sola comunitat en un sol centre és el mínim.',
    perqueEs: 'Sube con el número de comunidades que se arrancan a la vez y con las sedes; una sola comunidad en un solo centro es el mínimo.',
    diners: 'Pressupost de formació',
    dinersEs: 'Presupuesto de formación' },

  { id: 'formacio-equips', sector: 'privat', fam: 'formacio', ve: 'README', punt: 'provat',
    preuMin: 1200, preuMax: 2800, font: 'estimacio', publica: false, enllac: '',
    nom: 'Formació d\'equips',
    nomEs: 'Formación de equipos',
    qui: 'Empreses, cooperatives i equips tècnics',
    quiEs: 'Empresas, cooperativas y equipos técnicos',
    dura: 'De mitja jornada a quatre sessions',
    duraEs: 'De media jornada a cuatro sesiones',
    endus: 'Lideratge col·laboratiu i gestió del canvi amb metodologia castellera: repartir el pes, avisar abans de cedir i poder dir el que es pensa sense por.',
    endusEs: 'Liderazgo colaborativo y gestión del cambio con metodología castellera: repartir el peso, avisar antes de ceder y poder decir lo que se piensa sin miedo.',
    valor: 'L\'equip surt amb un vocabulari compartit per parlar del que abans no es deia. La conversa difícil de dilluns es pot tenir, perquè hi ha paraules per tenir-la.',
    valorEs: 'El equipo sale con un vocabulario compartido para hablar de lo que antes no se decía. La conversación difícil del lunes se puede tener, porque hay palabras para tenerla.',
    perque: 'Mitja jornada és el mínim; puja amb el nombre de sessions i amb el seguiment posterior.',
    perqueEs: 'Media jornada es el mínimo; sube con el número de sesiones y con el seguimiento posterior.',
    diners: 'Pressupost de formació',
    dinersEs: 'Presupuesto de formación' },

  { id: 'escola', sector: 'public', fam: 'formacio', ve: 'repo', punt: 'nou',
    preuMin: 1800, preuMax: 3200, font: 'estimacio', publica: true, enllac: '/SOS/escola.html',
    nom: 'La Fàbrica de Superherois',
    nomEs: 'La Fábrica de Superhéroes',
    qui: 'Escoles i AFA · 6 a 13 anys',
    quiEs: 'Escuelas y AFA · 6 a 13 años',
    dura: '8 sessions',
    duraEs: '8 sesiones',
    endus: 'Una classe amb el seu mapa de recursos i ajuda intercanviada de veritat. Els superpoders es guanyen quan un company confirma que l\'has ajudat, i cap nom real surt de l\'aula.',
    endusEs: 'Una clase con su mapa de recursos y ayuda intercambiada de verdad. Los superpoderes se ganan cuando un compañero confirma que le has ayudado, y ningún nombre real sale del aula.',
    valor: 'La criatura descobreix que té alguna cosa per donar, i ho descobreix perquè algú altre ho confirma. Això és el que després sosté una comunitat, i s\'aprèn abans dels tretze.',
    valorEs: 'La criatura descubre que tiene algo que dar, y lo descubre porque otro lo confirma. Eso es lo que después sostiene una comunidad, y se aprende antes de los trece.',
    perque: 'Puja amb el nombre de grups-classe; una sola aula és el mínim i tot el cicle superior d\'una escola és la banda alta.',
    perqueEs: 'Sube con el número de grupos-clase; una sola aula es el mínimo y todo el ciclo superior de una escuela es la banda alta.',
    diners: 'Pla educatiu d\'entorn · regidoria d\'educació',
    dinersEs: 'Plan educativo de entorno · concejalía de educación' },

  { id: 'formar-formadors', sector: 'tots', fam: 'formacio', ve: 'S5', punt: 'nou',
    preuMin: 2000, preuMax: 3500, font: 'negoci', publica: false, enllac: '/SOS/formacio.html',
    nom: 'Formació de formadors',
    nomEs: 'Formación de formadores',
    qui: 'Ateneus Cooperatius i professionals independents',
    quiEs: 'Ateneus Cooperatius y profesionales independientes',
    dura: '20 h + tutela de 2 casos',
    duraEs: '20 h + tutela de 2 casos',
    endus: 'Poder formar i acreditar altres, amb el teu recorregut al registre signat i auditable.',
    endusEs: 'Poder formar y acreditar a otros, con tu recorrido en el registro firmado y auditable.',
    valor: 'És l\'únic paquet que multiplica sense consumir les nostres hores: un Ateneu format acompanya desenes de projectes que nosaltres no tocaríem mai.',
    valorEs: 'Es el único paquete que multiplica sin consumir nuestras horas: un Ateneu formado acompaña decenas de proyectos que nosotros no tocaríamos nunca.',
    perque: 'Puja amb el nombre de casos tutelats i amb els materials propis que vulgueu; dos casos i els materials de sèrie són el mínim.',
    perqueEs: 'Sube con el número de casos tutelados y con los materiales propios que queráis; dos casos y los materiales de serie son el mínimo.',
    diners: 'Programa propi de l\'Ateneu · formació de professionals',
    dinersEs: 'Programa propio del Ateneu · formación de profesionales' },

  { id: 'mentoria-directiva', sector: 'tots', fam: 'formacio', ve: 'S5', punt: 'nou',
    preuMin: 3500, preuMax: 9000, font: 'estimacio', publica: true,
    enllac: '/SOS/formacio.html',
    nom: 'Mentoria per a equips directius',
    nomEs: 'Mentoría para equipos directivos',
    qui: 'Direcció, persones, innovació i organització · empreses, cooperatives i sector públic',
    quiEs: 'Dirección, personas, innovación y organización · empresas, cooperativas y sector público',
    dura: '6 mesos · sessió quinzenal d\'1 h per persona',
    duraEs: '6 meses · sesión quincenal de 1 h por persona',
    endus: 'De tres a sis persones amb responsabilitat d\'equip, cadascuna amb el seu itinerari, treballant sobre un encàrrec real de la casa. Cada competència tanca amb una evidència comprovable, no amb un certificat d\'assistència.',
    endusEs: 'De tres a seis personas con responsabilidad de equipo, cada una con su itinerario, trabajando sobre un encargo real de la casa. Cada competencia cierra con una evidencia comprobable, no con un certificado de asistencia.',
    valor: 'El que es compra no són sessions: és que unes competències concretes quedin desenvolupades i es puguin ensenyar. Si al final del programa una evidència no hi és, les sessions que calguin per tancar-la no es tornen a facturar.',
    valorEs: 'Lo que se compra no son sesiones: es que unas competencias concretas queden desarrolladas y se puedan enseñar. Si al final del programa una evidencia no está, las sesiones que hagan falta para cerrarla no se vuelven a facturar.',
    perque: 'Puja amb el nombre de persones i amb els itineraris diferents que s\'obren alhora; tres persones amb un mateix itinerari i sis mesos és el mínim.',
    perqueEs: 'Sube con el número de personas y con los itinerarios distintos que se abren a la vez; tres personas con un mismo itinerario y seis meses es el mínimo.',
    diners: 'Pla de formació · Fundae · pla de formació de l\'administració',
    dinersEs: 'Plan de formación · Fundae · plan de formación de la administración' },

  /* ── 3 · Producció i dinamització ────────────────────────────────────── */
  { id: 'comu-diada', sector: 'public', fam: 'dinamitzacio', ve: 'repo', punt: 'nou',
    preuMin: 2200, preuMax: 4500, font: 'estimacio', publica: true, enllac: '',
    nom: 'Comú-diada',
    nomEs: 'Comú-diada',
    qui: 'Ajuntaments, consells comarcals i entitats',
    quiEs: 'Ayuntamientos, consejos comarcales y entidades',
    dura: 'Una jornada · 3 setmanes de producció abans',
    duraEs: 'Una jornada · 3 semanas de producción antes',
    endus: 'La jornada feta i, el dilluns, la gent apuntada i la dinàmica engegada.',
    endusEs: 'La jornada hecha y, el lunes, la gente apuntada y la dinámica en marcha.',
    valor: 'La diferència amb una festa és que el dimarts encara hi ha alguna cosa en marxa. Es paga una jornada i queda una dinàmica amb gent apuntada, no un àlbum de fotos.',
    valorEs: 'La diferencia con una fiesta es que el martes todavía hay algo funcionando. Se paga una jornada y queda una dinámica con gente apuntada, no un álbum de fotos.',
    perque: 'Puja amb el nombre d\'entitats que s\'hi impliquen, amb els espais i amb la producció tècnica; una plaça i quatre entitats és el mínim.',
    perqueEs: 'Sube con el número de entidades implicadas, con los espacios y con la producción técnica; una plaza y cuatro entidades es el mínimo.',
    diners: 'Partida de festes, participació o promoció econòmica',
    dinersEs: 'Partida de fiestas, participación o promoción económica' },

  /* El taller i les demostracions **no publiquen preu**, i és una decisió, no
     un descuit. El que costen depèn de tres coses que no es poden endevinar
     des d'una pàgina —quanta gent hi ha, quanta colla cal moure i a quina
     distància— i publicar-ne una xifra tancada vol dir una de dues: o es diu
     alta i espanta la meitat dels que trucarien, o es diu baixa i s'ha de
     desdir a la proposta, que és pitjor.

     El que sí que es publica és **com es calcula**, que és el que qui compra
     necessita per saber si li encaixa: rols, hores i nivells del mapa de cost,
     més les despeses directes al seu preu de factura. La secció `#cost` de la
     portada ho explica sencer. */
  { id: 'fent-pinya', sector: 'tots', fam: 'dinamitzacio', ve: 'README', punt: 'provat',
    mida: true, font: 'mapa', publica: true, enllac: '',
    nom: 'Taller de castells «Fent Pinya»',
    nomEs: 'Taller de castells «Fent Pinya»',
    qui: 'Equips d\'empresa, plens municipals, escoles i taules comunitàries · de 10 a 1.000 persones',
    quiEs: 'Equipos de empresa, plenos municipales, escuelas y mesas comunitarias · de 10 a 1.000 personas',
    dura: '2 h + 30 min de reflexió',
    duraEs: '2 h + 30 min de reflexión',
    endus: 'Un dinamitzador, un mínim de quatre monitors castellers i dos músics, faixes de lloguer, assegurança de responsabilitat civil i material didàctic. Es fa en qualsevol espai de 10×10×5 m, en castellà, català, anglès, alemany o francès.',
    endusEs: 'Un dinamizador, un mínimo de cuatro monitores castellers y dos músicos, fajas de alquiler, seguro de responsabilidad civil y material didáctico. Se hace en cualquier espacio de 10×10×5 m, en castellano, catalán, inglés, alemán o francés.',
    valor: 'Un grup que ha repartit el pes de debò, perquè s\'ha aixecat un castell, i que en surt amb el vocabulari per parlar-ne l\'endemà. És el producte amb més quilòmetres de la casa: 60.000 persones des del 2005.',
    valorEs: 'Un grupo que ha repartido el peso de verdad, porque se ha levantado un castell, y que sale con el vocabulario para hablar de ello al día siguiente. Es el producto con más kilómetros de la casa: 60.000 personas desde 2005.',
    perque: 'El pressupost surt del mapa de cost: dinamitzador, monitors castellers i músics segons el nombre de participants, més faixes, assegurança i desplaçament. S\'ensenya desglossat i sense marge amagat.',
    perqueEs: 'El presupuesto sale del mapa de coste: dinamizador, monitores castellers y músicos según el número de participantes, más fajas, seguro y desplazamiento. Se enseña desglosado y sin margen escondido.',
    diners: 'Pressupost de formació, d\'esdeveniment o de festes',
    dinersEs: 'Presupuesto de formación, de evento o de fiestas' },

  { id: 'demos', sector: 'tots', fam: 'dinamitzacio', ve: 'README', punt: 'provat',
    mida: true, font: 'mapa', publica: true, enllac: '',
    nom: 'Demostració castellera',
    nomEs: 'Demostración castellera',
    qui: 'Empreses, ajuntaments, festes majors i agències d\'esdeveniments',
    quiEs: 'Empresas, ayuntamientos, fiestas mayores y agencias de eventos',
    dura: 'Fins a 4 castells per actuació',
    duraEs: 'Hasta 4 castells por actuación',
    endus: 'Una colla professional aixecant castells de fins a sis pisos: pilars, torres i tres de sis segons l\'alçada contractada.',
    endusEs: 'Una colla profesional levantando castells de hasta seis pisos: pilares, torres y tres de seis según la altura contratada.',
    valor: 'És la peça cultural que es recorda i es comparteix. No és formació —no toca ningú de l\'equip— i per això no substitueix el taller: l\'acompanya.',
    valorEs: 'Es la pieza cultural que se recuerda y se comparte. No es formación —no toca a nadie del equipo— y por eso no sustituye al taller: lo acompaña.',
    perque: 'El que el mou és l\'alçada, que és quanta colla cal moure, i la distància. Màxim quatre castells per actuació, per qualitat. El pressupost es presenta desglossat: colla, coordinació, desplaçament i assegurança.',
    perqueEs: 'Lo que lo mueve es la altura, que es cuánta colla hay que mover, y la distancia. Máximo cuatro castells por actuación, por calidad. El presupuesto se presenta desglosado: colla, coordinación, desplazamiento y seguro.',
    diners: 'Pressupost de l\'esdeveniment o de festes',
    dinersEs: 'Presupuesto del evento o de fiestas' },

  { id: 'produccio', sector: 'tots', fam: 'dinamitzacio', ve: 'README', punt: 'provat',
    preuMin: 3000, preuMax: 9000, font: 'estimacio', publica: true, enllac: '',
    nom: 'Producció d\'esdeveniments',
    nomEs: 'Producción de eventos',
    qui: 'Empreses, ajuntaments i festivals',
    quiEs: 'Empresas, ayuntamientos y festivales',
    dura: 'D\'una jornada a un festival de diversos dies',
    duraEs: 'De una jornada a un festival de varios días',
    endus: 'L\'esdeveniment produït sencer: proveïdors, permisos, muntatge, equip i tancament.',
    endusEs: 'El evento producido entero: proveedores, permisos, montaje, equipo y cierre.',
    valor: 'Una sola persona responsable de tot el que pot sortir malament, i vint anys sabent què surt malament. El que compreu no és el muntatge: és no haver-hi de ser.',
    valorEs: 'Una sola persona responsable de todo lo que puede salir mal, y veinte años sabiendo qué sale mal. Lo que compráis no es el montaje: es no tener que estar.',
    perque: 'Puja amb els dies, els escenaris i el nombre de proveïdors a coordinar. Una jornada d\'un sol espai entra sota el sostre de contractació menor; un festival, no.',
    perqueEs: 'Sube con los días, los escenarios y el número de proveedores a coordinar. Una jornada de un solo espacio entra bajo el techo de contratación menor; un festival, no.',
    diners: 'Pressupost de l\'esdeveniment',
    dinersEs: 'Presupuesto del evento' },

  { id: 'posar-en-marxa', sector: 'public', fam: 'dinamitzacio', ve: 'S4', punt: 'adaptacio',
    preuMin: 2400, preuMax: 5400, font: 'negoci', publica: true, enllac: '/SOS/molekulandia.html',
    nom: 'Posada en marxa d\'una dinàmica',
    nomEs: 'Puesta en marcha de una dinámica',
    qui: 'Entitats i grups promotors, finançat per l\'ajuntament',
    quiEs: 'Entidades y grupos promotores, financiado por el ayuntamiento',
    dura: '6 mesos · sessions quinzenals',
    duraEs: '6 meses · sesiones quincenales',
    endus: 'La dinàmica funcionant amb rols, governança i comptes: banc de temps, biblioteca de les coses, grup de consum, cures veïnals, comunitat energètica o habitatge en cessió d\'ús.',
    endusEs: 'La dinámica funcionando con roles, gobernanza y cuentas: banco de tiempo, biblioteca de las cosas, grupo de consumo, cuidados vecinales, comunidad energética o vivienda en cesión de uso.',
    valor: 'Al sisè mes hi ha intercanvis registrats i gent que sap portar-ho. La diferència amb un pla estratègic és que això es pot ensenyar funcionant.',
    valorEs: 'Al sexto mes hay intercambios registrados y gente que sabe llevarlo. La diferencia con un plan estratégico es que esto se puede enseñar funcionando.',
    perque: 'Són de 400 a 900 € al mes segons la mida del grup i si cal constituir res; sis mesos és el mínim per veure si s\'aguanta sol.',
    perqueEs: 'Son de 400 a 900 € al mes según el tamaño del grupo y si hay que constituir algo; seis meses es el mínimo para ver si se aguanta solo.',
    diners: 'Partida de participació · Ateneus Cooperatius',
    dinersEs: 'Partida de participación · Ateneus Cooperatius' },

  /* ── 4 · Digital i IA ─────────────────────────────────────────────────── */
  { id: 'fluxos-ia', sector: 'tots', fam: 'digital', ve: 'repo', punt: 'adaptacio',
    preuMin: 1800, preuMax: 4500, font: 'estimacio', publica: true, enllac: '/SOS/ia.html',
    nom: 'Fluxos amb IA · consultoria i formació',
    nomEs: 'Flujos con IA · consultoría y formación',
    qui: 'Empreses, cooperatives, ajuntaments i entitats amb equip propi',
    quiEs: 'Empresas, cooperativas, ayuntamientos y entidades con equipo propio',
    dura: '4 sessions · 6-8 setmanes',
    duraEs: '4 sesiones · 6-8 semanas',
    endus: 'El mapa dels vostres fluxos amb cadascun marcat: quins es repeteixen igual i es poden automatitzar, quins porten criteri i no s\'han de tocar, i quins són intangibles que no consten enlloc. Amb dos fluxos automatitzats de debò i el criteri de fre escrit.',
    endusEs: 'El mapa de vuestros flujos con cada uno marcado: cuáles se repiten igual y se pueden automatizar, cuáles llevan criterio y no hay que tocar, y cuáles son intangibles que no constan en ningún sitio. Con dos flujos automatizados de verdad y el criterio de freno escrito.',
    valor: 'Recupereu hores de feina que es repetia, i ho feu sense trencar pel camí el que sostenia la relació amb qui us compra o us vota. L\'equip en surt sabent decidir sol què toca la màquina i què no.',
    valorEs: 'Recuperáis horas de trabajo que se repetía, y lo hacéis sin romper por el camino lo que sostenía la relación con quien os compra o os vota. El equipo sale sabiendo decidir solo qué toca la máquina y qué no.',
    perque: 'Puja amb el nombre de fluxos a mapar i amb els que es deixen automatitzats i funcionant; un sol equip i dos fluxos és el mínim.',
    perqueEs: 'Sube con el número de flujos a mapear y con los que se dejan automatizados y funcionando; un solo equipo y dos flujos es el mínimo.',
    diners: 'Pressupost de millora o de formació · partida de digitalització',
    dinersEs: 'Presupuesto de mejora o de formación · partida de digitalización' },

  { id: 'web-ia', sector: 'tots', fam: 'digital', ve: 'repo', punt: 'adaptacio',
    preuMin: 2500, preuMax: 8000, font: 'estimacio', publica: true, enllac: '/SOS/ia.html',
    nom: 'Web o eina feta amb IA',
    nomEs: 'Web o herramienta hecha con IA',
    qui: 'Empreses, cooperatives, ajuntaments i entitats',
    quiEs: 'Empresas, cooperativas, ayuntamientos y entidades',
    dura: '4-10 setmanes',
    duraEs: '4-10 semanas',
    endus: 'La peça funcionant, els fitxers vostres i sense lligam amb ningú, i les guardes que comproven a cada canvi que segueix dient la veritat: un preu declarat un cop, cap enllaç mort, i les dues llengües sempre iguals.',
    endusEs: 'La pieza funcionando, los ficheros vuestros y sin atadura con nadie, y las guardas que comprueban en cada cambio que sigue diciendo la verdad: un precio declarado una vez, ningún enlace muerto, y los dos idiomas siempre iguales.',
    valor: 'La diferència amb una web feta amb IA i prou es veu al tercer mes: aquesta la pot canviar el vostre equip sense trencar-la, perquè el que la manté honesta és un programa i no la memòria de qui la va fer.',
    valorEs: 'La diferencia con una web hecha con IA y ya está se ve al tercer mes: esta la puede cambiar vuestro equipo sin romperla, porque lo que la mantiene honesta es un programa y no la memoria de quien la hizo.',
    perque: 'Puja amb el nombre de pantalles, amb els idiomes i amb les dades que ha de llegir; una pàgina de presentació amb un idioma és el mínim i una eina amb dades a dins és la banda alta.',
    perqueEs: 'Sube con el número de pantallas, con los idiomas y con los datos que tiene que leer; una página de presentación con un idioma es el mínimo y una herramienta con datos dentro es la banda alta.',
    diners: 'Pressupost de comunicació · partida de digitalització · Next Generation',
    dinersEs: 'Presupuesto de comunicación · partida de digitalización · Next Generation' },

  { id: 'transmedia', sector: 'tots', fam: 'digital', ve: 'repo', punt: 'nou',
    preuMin: 4000, preuMax: 12000, font: 'estimacio', publica: false, enllac: '/SOS/comando.html',
    nom: 'Projecte transmèdia',
    nomEs: 'Proyecto transmedia',
    qui: 'Ajuntaments, fundacions, marques i programes educatius',
    quiEs: 'Ayuntamientos, fundaciones, marcas y programas educativos',
    dura: '3-6 mesos',
    duraEs: '3-6 meses',
    endus: 'Història, personatges, joc i registre: el model del Comando Molekulon aplicat al vostre encàrrec, amb la condició que acabi en alguna cosa registrada i no en visites.',
    endusEs: 'Historia, personajes, juego y registro: el modelo del Comando Molekulon aplicado a vuestro encargo, con la condición de que acabe en algo registrado y no en visitas.',
    valor: 'Una campanya deixa impressions; això deixa gent donada d\'alta fent alguna cosa que queda comptada. Sis mesos després encara es pot ensenyar què va passar, que és el que cap informe de campanya sap respondre.',
    valorEs: 'Una campaña deja impresiones; esto deja gente dada de alta haciendo algo que queda contado. Seis meses después todavía se puede enseñar qué pasó, que es lo que ningún informe de campaña sabe responder.',
    perque: 'Es contracta sencer o per peces. Puja amb la il·lustració, amb el joc i amb els idiomes; una història amb personatges i alta al registre, sense joc, és el mínim.',
    perqueEs: 'Se contrata entero o por piezas. Sube con la ilustración, con el juego y con los idiomas; una historia con personajes y alta en el registro, sin juego, es el mínimo.',
    diners: 'Pressupost de comunicació · obra social · programa educatiu',
    dinersEs: 'Presupuesto de comunicación · obra social · programa educativo' }
];

/* ══ AL VOLTANT DEL SOS ═══════════════════════════════════════════════════
   El SOS no és una família del catàleg: és el projecte, i és lliure. Això és
   el que sí que es contracta al seu voltant.

   `contractes` és el cas que obliga a escriure aquesta nota: al repositori
   **no hi ha contractes intel·ligents construïts**. Per això es ven l'estudi i
   no la peça —un informe de si val la pena és un entregable real; una eina que
   no existeix, no—, i la fitxa ho diu a la cara. */
const SOS_PAQUETS = [
  { id: 'implantacio', sector: 'public', ve: 'S6', punt: 'nou', preuMin: 800, preuMax: 2500,
    font: 'negoci', publica: true, enllac: '/SOS/',
    nom: 'Implantació i suport',
    nomEs: 'Implantación y soporte',
    qui: 'Ajuntaments, consells comarcals i Ateneus',
    quiEs: 'Ayuntamientos, consejos comarcales y Ateneus',
    dura: '3 setmanes',
    duraEs: '3 semanas',
    endus: 'L\'eina amb el vostre cas a dins, la sincronització entre aparells resolta i la gent sabent-la fer servir. Les dades es queden al vostre navegador.',
    endusEs: 'La herramienta con vuestro caso dentro, la sincronización entre aparatos resuelta y la gente sabiendo usarla. Los datos se quedan en vuestro navegador.',
    valor: 'L\'eina és gratuïta i te la pots endur. El que es paga és no haver de descobrir sol com es munta, i que el dia u ja hi hagi les vostres dades a dins.',
    valorEs: 'La herramienta es gratuita y te la puedes llevar. Lo que se paga es no tener que descubrir solo cómo se monta, y que el día uno ya estén vuestros datos dentro.',
    perque: 'Puja amb el volum de dades a migrar i amb l\'ancoratge permanent; una instal·lació neta amb formació d\'un equip és el mínim.',
    perqueEs: 'Sube con el volumen de datos a migrar y con el anclaje permanente; una instalación limpia con formación de un equipo es el mínimo.',
    diners: 'Partida de digitalització · fons Next Generation',
    dinersEs: 'Partida de digitalización · fondos Next Generation' },

  { id: 'ia-amb-frens', sector: 'tots', ve: 'repo', punt: 'adaptacio', preuMin: 600, preuMax: 1500,
    font: 'estimacio', publica: true, enllac: '',
    nom: 'IA amb frens · sessió de viabilitat',
    nomEs: 'IA con frenos · sesión de viabilidad',
    qui: 'Qui es plantegi fer servir IA amb dades de persones',
    quiEs: 'Quien se plantee usar IA con datos de personas',
    dura: '1 sessió + informe · 2 setmanes',
    duraEs: '1 sesión + informe · 2 semanas',
    endus: 'Què es pot automatitzar amb garanties i què no, amb el criteri escrit: la màquina proposa, res entra sense que una persona ho hagi comprovat, i sempre es diu d\'on ho ha tret.',
    endusEs: 'Qué se puede automatizar con garantías y qué no, con el criterio escrito: la máquina propone, nada entra sin que una persona lo haya comprobado, y siempre se dice de dónde lo ha sacado.',
    valor: 'Sortiu de la reunió amb una decisió escrita i no amb una intuïció. I amb el criteri de fre posat abans de comprar res, que és quan encara es pot posar.',
    valorEs: 'Salís de la reunión con una decisión escrita y no con una intuición. Y con el criterio de freno puesto antes de comprar nada, que es cuando todavía se puede poner.',
    perque: 'Puja si cal revisar processos que ja toquen dades de persones; una sessió d\'exploració és el mínim.',
    perqueEs: 'Sube si hay que revisar procesos que ya tocan datos de personas; una sesión de exploración es el mínimo.',
    diners: 'Partida de digitalització',
    dinersEs: 'Partida de digitalización' },

  { id: 'contractes', sector: 'tots', ve: 'repo', punt: 'nou', preuMin: 1200, preuMax: 2500,
    font: 'estimacio', publica: true, enllac: '',
    nom: 'Contractes intel·ligents · estudi de viabilitat',
    nomEs: 'Contratos inteligentes · estudio de viabilidad',
    qui: 'Cooperatives i administracions que vulguin automatitzar acords',
    quiEs: 'Cooperativas y administraciones que quieran automatizar acuerdos',
    dura: '3 setmanes',
    duraEs: '3 semanas',
    endus: 'Un informe de si val la pena, què costaria i quins riscos té. Es ven l\'estudi i no l\'eina: al SOS això encara no està construït, i l\'informe ho diu.',
    endusEs: 'Un informe de si vale la pena, qué costaría y qué riesgos tiene. Se vende el estudio y no la herramienta: en el SOS esto todavía no está construido, y el informe lo dice.',
    valor: 'Sabreu si això us serveix abans de gastar-hi res. Un «no val la pena» amb els números al costat val el mateix que un «sí», i és més barat que descobrir-ho construint.',
    valorEs: 'Sabréis si esto os sirve antes de gastar nada. Un «no vale la pena» con los números al lado vale lo mismo que un «sí», y es más barato que descubrirlo construyendo.',
    perque: 'Puja amb el nombre d\'acords a modelar i amb la part jurídica; un sol cas d\'ús és el mínim.',
    perqueEs: 'Sube con el número de acuerdos a modelar y con la parte jurídica; un solo caso de uso es el mínimo.',
    diners: 'Fons d\'innovació · Next Generation',
    dinersEs: 'Fondos de innovación · Next Generation' }
];

/* ══ Generació ════════════════════════════════════════════════════════════ */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const eur = n => n.toLocaleString('ca-ES').replace(/ /g, '.') + ' €';
/* «De 1.500 a 3.000 €» i no «1.500-3.000 €»: en una taula de preus el guionet
   es llegeix com un menys, i qui té pressa hi veu un descompte. */
const forq = p => p.preuMin === p.preuMax ? eur(p.preuMin)
  : 'De ' + eur(p.preuMin).replace(' €', '') + ' a ' + eur(p.preuMax);
const k = (id, camp) => 'pk.' + id + '.' + camp;

function fitxa(p) {
  const pt = PUNTS[p.punt], fo = FONTS[p.font];
  const nom = p.enllac
    ? `<a href="${p.enllac}" data-i18n="${k(p.id, 'n')}">${esc(p.nom)}</a>`
    : `<span data-i18n="${k(p.id, 'n')}">${esc(p.nom)}</span>`;
  /* Un paquet «a mida» no diu «consulta'ns», que és el que fa tothom i el que
     obliga a trucar per saber si t'ho pots ni plantejar: diu **com es calcula**
     i hi porta. Sense aquest enllaç, no publicar preu seria amagar-lo. */
  const preu = p.mida
    ? `<strong class="pk-mida"><a href="#cost" data-i18n="pk.mida">A mida · calculat amb el mapa de cost</a></strong>`
    : `<strong>${forq(p)}</strong>`;
  return `        <article class="paquet" id="pk-${p.id}" data-sector="${p.sector}">
          <header>
            <h4>${nom}</h4>
            <span class="pk-punt ${pt.cls}" data-i18n="pk.punt.${p.punt}">${esc(pt.lbl)}</span>
          </header>
          <p class="pk-endus" data-i18n="${k(p.id, 'e')}">${esc(p.endus)}</p>
          <p class="pk-valor"><span class="pk-valor-l" data-i18n="pk.lbl.valor">Què t'aporta</span>
            <span data-i18n="${k(p.id, 'v')}">${esc(p.valor)}</span></p>
          <dl class="pk-dades">
            <dt data-i18n="pk.lbl.qui">Per a qui</dt><dd data-i18n="${k(p.id, 'q')}">${esc(p.qui)}</dd>
            <dt data-i18n="pk.lbl.dura">Quant dura</dt><dd data-i18n="${k(p.id, 'd')}">${esc(p.dura)}</dd>
            <dt data-i18n="pk.lbl.diners">Amb quins diners</dt><dd data-i18n="${k(p.id, 'f')}">${esc(p.diners)}</dd>
          </dl>
          <div class="pk-preu">
            ${preu}
            <span class="pk-font" data-i18n="pk.font.${p.font}">${esc(fo.lbl)}</span>
            <p class="pk-perque" data-i18n="${k(p.id, 'p')}">${esc(p.perque)}</p>
          </div>
        </article>`;
}

function blocCataleg() {
  return FAMILIES.map(f => {
    const seus = PAQUETS.filter(p => p.fam === f.id);
    return `      <div class="pk-fam" id="fam-${f.id}">
        <div class="pk-fam-cap">
          <span class="pk-fam-ic" aria-hidden="true">${f.ic}</span>
          <h3 data-i18n="pk.fam.${f.id}">${esc(f.nom)}</h3>
          <p data-i18n="pk.fam.${f.id}.s">${esc(f.sub)}</p>
        </div>
        <div class="pk-graella">
${seus.map(fitxa).join('\n')}
        </div>
      </div>`;
  }).join('\n');
}

function blocSos() {
  return `      <div class="pk-graella">
${SOS_PAQUETS.map(fitxa).join('\n')}
      </div>`;
}

/* ══ El filtre de sector ══════════════════════════════════════════════════
   Va generat i no escrit a mà per un motiu concret: el dia que s'afegeixi un
   sector, el botó ha de sortir sol. Un filtre escrit a mà que no coneix un
   valor no falla —simplement amaga paquets sense que ho digui ningú.

   `data-sec="tot"` primer i marcat: sense JavaScript surten tots els paquets,
   que és l'estat correcte, i els botons no fan res però tampoc menteixen. */
function blocFiltre() {
  const bt = (id, lbl, clau, on) =>
    `<button type="button" class="pk-f${on ? ' on' : ''}" data-sec="${id}" data-i18n="${clau}">${esc(lbl)}</button>`;
  return `      <div class="pk-filtre" role="group" aria-label="Filtra per sector">
        ${bt('tot', 'Tot el catàleg', 'pk.f.tot', true)}
        ${bt('privat', SECTORS.privat.lbl, 'pk.f.privat', false)}
        ${bt('public', SECTORS.public.lbl, 'pk.f.public', false)}
      </div>`;
}

/* ══ El mapa de cost ══════════════════════════════════════════════════════
   La secció que substitueix les tarifes que ja no es publiquen. No és una
   nota al peu: és **el mètode**, i va sencer a la pàgina perquè qui llegeix
   pugui fer el càlcul pel seu compte abans de trucar. Un preu que només es pot
   saber trucant és un preu que qui no truca no sabrà mai. */
function blocCost() {
  const passos = PASSOS_COST.map((p, i) => `        <li class="cm-pas">
          <h4 data-i18n="cm.p${i + 1}.t">${esc(p.t)}</h4>
          <p data-i18n="cm.p${i + 1}.d">${esc(p.d)}</p>
        </li>`).join('\n');
  const files = NIVELLS.map(n => `          <tr>
            <th><span class="cm-niv">${n.id}</span> <span data-i18n="cm.${n.id}.n">${esc(n.nom)}</span></th>
            <td data-i18n="cm.${n.id}.f">${esc(n.fa)}</td>
            <td data-i18n="cm.${n.id}.e">${esc(n.ev)}</td>
            <td class="cm-h">${n.hora} €/h</td>
          </tr>`).join('\n');
  return `      <ol class="cm-passos">
${passos}
      </ol>
      <h3 class="cm-h3" data-i18n="cm.esc.h">L'escala, i què separa un nivell del següent</h3>
      <p class="cm-int" data-i18n="cm.esc.i">Per a contractacions per hores —que és com contracta el sector públic quan contracta serveis professionals— aquesta és la taula que presentem. El que separa un nivell del següent no és l'antiguitat: és evidència registrada i verificable, la mateixa que acredita un gestor o un mentor a la formació. La proposta diu sempre quina persona fa quines hores i a quin nivell.</p>
      <div class="cm-taula-scroll">
        <table class="cm-taula">
          <thead><tr>
            <th data-i18n="cm.th.niv">Nivell</th>
            <th data-i18n="cm.th.fa">Què fa</th>
            <th data-i18n="cm.th.ev">Com s'acredita</th>
            <th data-i18n="cm.th.h">Preu hora</th>
          </tr></thead>
          <tbody>
${files}
          </tbody>
        </table>
      </div>
      <p class="cm-peu" data-i18n-html="cm.peu">Tots els preus d'aquesta pàgina són <strong>sense IVA</strong>. L'escala és tarifa proposada per al 2026 i es revisa cada any. El taller «Fent Pinya» i les demostracions castelleres es pressuposten així i no porten preu tancat publicat: el que costen depèn de quanta gent hi ha, quanta colla cal moure i a quina distància, i preferim ensenyar el desglossament que comprometre una xifra que després s'hagi de desdir.</p>`;
}

/* Les claus dels dos idiomes surten de la mateixa declaració, i per això no
   poden divergir: mig traduir és pitjor que no traduir. */
function diccionari(llengua) {
  const es = llengua === 'es';
  const q = s => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
  const files = [];
  FAMILIES.forEach(f => {
    files.push(`  ${q('pk.fam.' + f.id)}:${q(es ? f.nomEs : f.nom)},${q('pk.fam.' + f.id + '.s')}:${q(es ? f.subEs : f.sub)},`);
  });
  Object.keys(PUNTS).forEach(id => {
    files.push(`  ${q('pk.punt.' + id)}:${q(es ? PUNTS[id].lblEs : PUNTS[id].lbl)},`);
  });
  Object.keys(FONTS).forEach(id => {
    files.push(`  ${q('pk.font.' + id)}:${q(es ? FONTS[id].lblEs : FONTS[id].lbl)},`);
  });
  files.push(`  ${q('pk.lbl.qui')}:${q(es ? 'Para quién' : 'Per a qui')},` +
             `${q('pk.lbl.dura')}:${q(es ? 'Cuánto dura' : 'Quant dura')},` +
             `${q('pk.lbl.diners')}:${q(es ? 'Con qué dinero' : 'Amb quins diners')},` +
             `${q('pk.lbl.valor')}:${q(es ? 'Qué te aporta' : "Què t'aporta")},`);
  /* El filtre i el preu a mida. Van al mateix diccionari perquè el dia que
     canviï el nom d'un sector no hi hagi un botó en català sobre la pàgina
     castellana. */
  files.push(`  ${q('pk.f.tot')}:${q(es ? 'Todo el catálogo' : 'Tot el catàleg')},` +
             `${q('pk.f.privat')}:${q(es ? SECTORS.privat.lblEs : SECTORS.privat.lbl)},` +
             `${q('pk.f.public')}:${q(es ? SECTORS.public.lblEs : SECTORS.public.lbl)},` +
             `${q('pk.mida')}:${q(es ? 'A medida · calculado con el mapa de coste' : 'A mida · calculat amb el mapa de cost')},`);
  /* El mapa de cost: quatre passos, tres nivells i el peu. */
  PASSOS_COST.forEach((p, i) => {
    files.push(`  ${q('cm.p' + (i + 1) + '.t')}:${q(es ? p.tEs : p.t)},${q('cm.p' + (i + 1) + '.d')}:${q(es ? p.dEs : p.d)},`);
  });
  NIVELLS.forEach(n => {
    files.push(`  ${q('cm.' + n.id + '.n')}:${q(es ? n.nomEs : n.nom)},` +
               `${q('cm.' + n.id + '.f')}:${q(es ? n.faEs : n.fa)},` +
               `${q('cm.' + n.id + '.e')}:${q(es ? n.evEs : n.ev)},`);
  });
  files.push(`  ${q('cm.th.niv')}:${q(es ? 'Nivel' : 'Nivell')},` +
             `${q('cm.th.fa')}:${q(es ? 'Qué hace' : 'Què fa')},` +
             `${q('cm.th.ev')}:${q(es ? 'Cómo se acredita' : "Com s'acredita")},` +
             `${q('cm.th.h')}:${q(es ? 'Precio hora' : 'Preu hora')},`);
  files.push(`  ${q('cm.esc.h')}:${q(es ? 'La escala, y qué separa un nivel del siguiente' : "L'escala, i què separa un nivell del següent")},`);
  files.push(`  ${q('cm.esc.i')}:${q(es
    ? 'Para contrataciones por horas —que es como contrata el sector público cuando contrata servicios profesionales— esta es la tabla que presentamos. Lo que separa un nivel del siguiente no es la antigüedad: es evidencia registrada y verificable, la misma que acredita a un gestor o a un mentor en la formación. La propuesta dice siempre qué persona hace qué horas y a qué nivel.'
    : "Per a contractacions per hores —que és com contracta el sector públic quan contracta serveis professionals— aquesta és la taula que presentem. El que separa un nivell del següent no és l'antiguitat: és evidència registrada i verificable, la mateixa que acredita un gestor o un mentor a la formació. La proposta diu sempre quina persona fa quines hores i a quin nivell.")},`);
  files.push(`  ${q('cm.peu')}:${q(es
    ? 'Todos los precios de esta página son <strong>sin IVA</strong>. La escala es tarifa propuesta para 2026 y se revisa cada año. El taller «Fent Pinya» y las demostraciones castelleras se presupuestan así y no llevan precio cerrado publicado: lo que cuestan depende de cuánta gente hay, cuánta colla hay que mover y a qué distancia, y preferimos enseñar el desglose que comprometer una cifra que después haya que desdecir.'
    : "Tots els preus d'aquesta pàgina són <strong>sense IVA</strong>. L'escala és tarifa proposada per al 2026 i es revisa cada any. El taller «Fent Pinya» i les demostracions castelleres es pressuposten així i no porten preu tancat publicat: el que costen depèn de quanta gent hi ha, quanta colla cal moure i a quina distància, i preferim ensenyar el desglossament que comprometre una xifra que després s'hagi de desdir.")},`);
  PAQUETS.concat(SOS_PAQUETS).forEach(p => {
    files.push(`  ${q(k(p.id, 'n'))}:${q(es ? p.nomEs : p.nom)},` +
               `${q(k(p.id, 'e'))}:${q(es ? p.endusEs : p.endus)},`);
    files.push(`  ${q(k(p.id, 'q'))}:${q(es ? p.quiEs : p.qui)},` +
               `${q(k(p.id, 'd'))}:${q(es ? p.duraEs : p.dura)},` +
               `${q(k(p.id, 'f'))}:${q(es ? p.dinersEs : p.diners)},`);
    files.push(`  ${q(k(p.id, 'v'))}:${q(es ? p.valorEs : p.valor)},` +
               `${q(k(p.id, 'p'))}:${q(es ? p.perqueEs : p.perque)},`);
  });
  return files.join('\n');
}

/* El README és la porta d'entrada de qui arriba pel repositori, i durant molt
   de temps va vendre una empresa diferent de la que venia la portada. Ara surt
   de la mateixa declaració: una taula per família, amb el mateix preu i el
   mateix punt d'adaptació. No pot divergir perquè no s'escriu dues vegades. */
function taulaMd() {
  /* El README és en castellà de dalt a baix; una taula en català a dins seria
     mitja traducció, que és el que la guia de marca prohibeix expressament. */
  /* Un paquet a mida no porta cifra al README tampoc. Si la portada no la
     publica i el README sí, el que hi ha són dos preus i un de fals. */
  const preuEs = p => p.mida
    ? 'A medida · [mapa de coste](#el-mapa-de-coste)'
    : (p.preuMin === p.preuMax ? eur(p.preuMin)
       : 'De ' + eur(p.preuMin).replace(' €', '') + ' a ' + eur(p.preuMax));
  const fila = p => `| **${p.nomEs}** | ${p.quiEs} | ${p.duraEs} | ${preuEs(p)} | ${p.valorEs} | ${PUNTS[p.punt].lblEs} · ${FONTS[p.font].lblEs} |`;
  const taula = llista => [
    '| Paquete | Para quién | Cuánto dura | Precio | Qué aporta | Punto · Precio |',
    '|---|---|---|---|---|---|',
    ...llista.map(fila)
  ].join('\n');
  const fams = FAMILIES.map(f =>
    `### ${f.ic} ${f.nomEs}\n\n*${f.subEs}*\n\n` + taula(PAQUETS.filter(p => p.fam === f.id))
  ).join('\n\n');
  return fams + '\n\n### 🖥️ Alrededor del SOS\n\n*La herramienta es libre. Esto es lo que sí se contrata.*\n\n'
    + taula(SOS_PAQUETS);
}

/* El mateix mètode al README, perquè qui arriba pel repositori pugui fer el
   càlcul sense obrir la portada. */
function costMd() {
  const passos = PASSOS_COST.map((p, i) => `${i + 1}. **${p.tEs}** — ${p.dEs}`).join('\n');
  const files = NIVELLS.map(n =>
    `| **${n.id} · ${n.nomEs}** | ${n.faEs} | ${n.evEs} | ${n.hora} €/h |`).join('\n');
  return passos + '\n\n| Nivel | Qué hace | Cómo se acredita | Precio hora |\n|---|---|---|---|\n' + files +
    '\n\nTodos los precios son **sin IVA**. La escala es tarifa propuesta para 2026 y se revisa cada año. ' +
    'El taller «Fent Pinya» y las demostraciones castelleras se presupuestan así y **no llevan precio cerrado publicado**: ' +
    'lo que cuestan depende de cuánta gente hay, cuánta colla hay que mover y a qué distancia.';
}

/* ══ Escriure ═════════════════════════════════════════════════════════════ */
const MARQUES = [
  ['<!--TT-OFERTA-->', '<!--/TT-OFERTA-->', blocCataleg],
  ['<!--TT-FILTRE-->', '<!--/TT-FILTRE-->', blocFiltre],
  ['<!--TT-COST-->', '<!--/TT-COST-->', blocCost],
  ['<!--TT-SOS-->', '<!--/TT-SOS-->', blocSos],
  ['/*TT-I18N-CA*/', '/*/TT-I18N-CA*/', () => diccionari('ca')],
  ['/*TT-I18N-ES*/', '/*/TT-I18N-ES*/', () => diccionari('es')]
];
const MARQUES_MD = [
  ['<!--TT-OFERTA-MD-->', '<!--/TT-OFERTA-MD-->', taulaMd],
  ['<!--TT-COST-MD-->', '<!--/TT-COST-MD-->', costMd]
];

function posa(src, marques) {
  let out = src, faltaven = [];
  for (const [obre, tanca, fn] of marques) {
    const i = out.indexOf(obre), j = out.indexOf(tanca);
    if (i < 0 || j < 0 || j < i) { faltaven.push(obre); continue; }
    out = out.slice(0, i + obre.length) + '\n\n' + fn() + '\n\n' + out.slice(j);
  }
  return { out, faltaven };
}

/* El catàleg és la font única, i el formulari de pressupost necessita la
   mateixa llista de paquets i la mateixa escala per calcular. S'exporta en
   comptes de copiar-se, i per això aquest fitxer només fa la seva feina quan
   s'executa: si escrivís en carregar-se, requerir-lo des d'una altra eina
   reescriuria la portada de rebot. */
module.exports = { FAMILIES, SECTORS, PUNTS, FONTS, NIVELLS, PASSOS_COST, PAQUETS, SOS_PAQUETS };
if (require.main !== module) return;

const src = readFileSync(PORTADA, 'utf8');
const { out, faltaven } = posa(src, MARQUES);
const srcMd = readFileSync(README, 'utf8');
const { out: outMd, faltaven: faltavenMd } = posa(srcMd, MARQUES_MD);

if (faltaven.length || faltavenMd.length) {
  console.error('✗ Falten marques: ' + faltaven.concat(faltavenMd).join(', '));
  console.error('  Sense elles el generador no sap on escriure i no s\'inventa el lloc.');
  process.exit(1);
}

/* Els enllaços es comproven aquí i no només a la guarda: generar una porta cap
   a un fitxer que no existeix i adonar-se'n al CI és tard, i pel camí algú ja
   ha vist la pàgina. */
const trencats = PAQUETS.concat(SOS_PAQUETS)
  .filter(p => p.enllac)
  .filter(p => {
    const dest = p.enllac.replace(/^\//, '').replace(/\/$/, '/index.html');
    return !existsSync(join(ARREL, dest));
  })
  .map(p => p.id + ' → ' + p.enllac);
if (trencats.length) {
  console.error('✗ Paquets que apunten a un fitxer que no existeix:\n  ' + trencats.join('\n  '));
  process.exit(1);
}

const total = PAQUETS.length + SOS_PAQUETS.length;
const resum = `${total} paquets · ${FAMILIES.length} famílies + el SOS`;

if (CHECK) {
  const desviats = [out === src ? null : 'index.html', outMd === srcMd ? null : 'README.md']
    .filter(Boolean);
  if (!desviats.length) { console.log(`✅ El catàleg al dia · ${resum}`); process.exit(0); }
  console.error('❌ El catàleg no correspon al que hi ha declarat: ' + desviats.join(', '));
  console.error('   Arregla-ho amb:  node SOS/tools/build-oferta.js');
  process.exit(1);
}

writeFileSync(PORTADA, out);
writeFileSync(README, outMd);
console.log(`✅ index.html i README.md · ${resum}`);
