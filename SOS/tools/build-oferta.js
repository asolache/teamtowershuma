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
    subEs: 'Que pase de verdad, y que el lunes siga pasando' }
];

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

/* El sostre. Un ajuntament o un consell comarcal contracta fins aquí sense
   obrir un expedient llarg; per sobre, la proposta deixa de ser una decisió
   d'una regidoria i passa a ser un procediment. Els paquets per a empresa no
   tenen aquest sostre i no cal que en tinguin. */
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
  { id: 'diagnostic-teixit', fam: 'consultoria', ve: 'S1', punt: 'adaptacio',
    preu: 1800, publica: true, enllac: '/SOS/vna.html',
    nom: 'Diagnòstic del teixit local',
    nomEs: 'Diagnóstico del tejido local',
    qui: 'Ajuntaments, consells comarcals i entitats',
    quiEs: 'Ayuntamientos, consejos comarcales y entidades',
    dura: '2 sessions · 3 setmanes',
    duraEs: '2 sesiones · 3 semanas',
    endus: 'L\'informe amb el mapa de valor del teixit real: qui sosté què, quins fluxos falten i de qui penja tot abans que es cremi.',
    endusEs: 'El informe con el mapa de valor del tejido real: quién sostiene qué, qué flujos faltan y de quién cuelga todo antes de que se queme.',
    diners: 'Catàleg de serveis de la Diputació · partida de participació ciutadana',
    dinersEs: 'Catálogo de servicios de la Diputación · partida de participación ciudadana' },

  { id: 'mapa-organitzacio', fam: 'consultoria', ve: 'README', punt: 'provat',
    preu: 3500, publica: false, enllac: '/SOS/vna.html',
    nom: 'Mapa de valor d\'una organització',
    nomEs: 'Mapa de valor de una organización',
    qui: 'Empreses, cooperatives i entitats amb equip propi',
    quiEs: 'Empresas, cooperativas y entidades con equipo propio',
    dura: '3 sessions · 4-6 setmanes',
    duraEs: '3 sesiones · 4-6 semanas',
    endus: 'El mapa dels intercanvis reals, tangibles i intangibles, i on es perd valor sense que ho vegi ningú. Mètode VNA de Verna Allee.',
    endusEs: 'El mapa de los intercambios reales, tangibles e intangibles, y dónde se pierde valor sin que lo vea nadie. Método VNA de Verna Allee.',
    diners: 'Pressupost propi de millora o de formació',
    dinersEs: 'Presupuesto propio de mejora o de formación' },

  { id: 'mapa-comarcal', fam: 'consultoria', ve: 'S1', punt: 'nou',
    preu: 4800, publica: true, enllac: '/SOS/vna.html',
    nom: 'Mapa comarcal i assemblea federativa',
    nomEs: 'Mapa comarcal y asamblea federativa',
    qui: 'Consells comarcals i mancomunitats',
    quiEs: 'Consejos comarcales y mancomunidades',
    dura: '4 sessions amb diversos municipis · 2-3 mesos',
    duraEs: '4 sesiones con varios municipios · 2-3 meses',
    endus: 'El mapa de tota la comarca i una decisió presa i registrada amb pes per arrel de població i correcció de desigualtat: el municipi gran no decideix pels petits, i els petits no valen el mateix que el gran.',
    endusEs: 'El mapa de toda la comarca y una decisión tomada y registrada con peso por raíz de población y corrección de desigualdad: el municipio grande no decide por los pequeños, y los pequeños no valen lo mismo que el grande.',
    diners: 'Pressupost de cooperació intermunicipal',
    dinersEs: 'Presupuesto de cooperación intermunicipal' },

  { id: 'impacte', fam: 'consultoria', ve: 'S7', punt: 'nou',
    preu: 900, publica: true, enllac: '',
    nom: 'Mesura d\'impacte i justificació',
    nomEs: 'Medida de impacto y justificación',
    qui: 'Ajuntaments, fundacions i finançadors',
    quiEs: 'Ayuntamientos, fundaciones y financiadores',
    dura: 'Informe semestral o anual · 2 setmanes',
    duraEs: 'Informe semestral o anual · 2 semanas',
    endus: 'Hores donades, persones actives i reciprocitat, sortint d\'un registre signat i comprovable — no d\'una enquesta de satisfacció.',
    endusEs: 'Horas donadas, personas activas y reciprocidad, saliendo de un registro firmado y comprobable — no de una encuesta de satisfacción.',
    diners: 'La mateixa partida que ja finança el projecte que es justifica',
    dinersEs: 'La misma partida que ya financia el proyecto que se justifica' },

  { id: 'persones-cultura', fam: 'consultoria', ve: 'README', punt: 'provat',
    preu: 2400, publica: false, enllac: '',
    nom: 'Diagnòstic de persones i cultura',
    nomEs: 'Diagnóstico de personas y cultura',
    qui: 'Empreses i cooperatives amb equip',
    quiEs: 'Empresas y cooperativas con equipo',
    dura: '3 sessions · 6 setmanes',
    duraEs: '3 sesiones · 6 semanas',
    endus: 'On es trenca la col·laboració, qui sosté el que no consta enlloc, i què caldria canviar primer. És la porta d\'entrada a la consultoria de persones; el que ve després es dimensiona amb aquest informe a la mà.',
    endusEs: 'Dónde se rompe la colaboración, quién sostiene lo que no consta en ningún sitio, y qué habría que cambiar primero. Es la puerta de entrada a la consultoría de personas; lo que viene después se dimensiona con este informe en la mano.',
    diners: 'Pressupost propi de recursos humans',
    dinersEs: 'Presupuesto propio de recursos humanos' },

  /* ── 2 · Formació ────────────────────────────────────────────────────── */
  { id: 'gestor', fam: 'formacio', ve: 'S3', punt: 'nou',
    preu: 1800, publica: true, enllac: '/SOS/formacio.html',
    nom: 'Programa de Gestor/a',
    nomEs: 'Programa de Gestor/a',
    qui: 'Tècnics municipals i professionals · preu per persona',
    quiEs: 'Técnicos municipales y profesionales · precio por persona',
    dura: '~45 h en 3-4 mesos',
    duraEs: '~45 h en 3-4 meses',
    endus: 'Una persona del territori que sap engegar i sostenir participació sense dependre de ningú. Es fa sobre el vostre projecte, no sobre un cas inventat.',
    endusEs: 'Una persona del territorio que sabe arrancar y sostener participación sin depender de nadie. Se hace sobre vuestro proyecto, no sobre un caso inventado.',
    diners: 'Pla de formació municipal · subvenció de Diputació',
    dinersEs: 'Plan de formación municipal · subvención de Diputación' },

  { id: 'equip-gestor', fam: 'formacio', ve: 'S3', punt: 'nou',
    preu: 4900, publica: true, enllac: '/SOS/formacio.html',
    nom: 'Programa d\'equip gestor',
    nomEs: 'Programa de equipo gestor',
    qui: 'Una entitat del territori, finançada per l\'ajuntament',
    quiEs: 'Una entidad del territorio, financiada por el ayuntamiento',
    dura: '12 setmanes · 5 rols · ~34 h de mentoria',
    duraEs: '12 semanas · 5 roles · ~34 h de mentoría',
    endus: 'Un equip de cinc a set persones amb els rols repartits i el relleu previst, i la dinàmica funcionant. Forma un equip i no una persona, perquè un territori no el sosté un gestor.',
    endusEs: 'Un equipo de cinco a siete personas con los roles repartidos y el relevo previsto, y la dinámica funcionando. Forma un equipo y no una persona, porque un territorio no lo sostiene un gestor.',
    diners: 'Partida de participació · Ateneus Cooperatius',
    dinersEs: 'Partida de participación · Ateneus Cooperatius' },

  { id: 'comunitats-practica', fam: 'formacio', ve: 'README', punt: 'provat',
    preu: 3900, publica: false, enllac: '',
    nom: 'Comunitats de pràctica',
    nomEs: 'Comunidades de práctica',
    qui: 'Organitzacions amb coneixement dispers',
    quiEs: 'Organizaciones con conocimiento disperso',
    dura: '6 sessions en 3 mesos',
    duraEs: '6 sesiones en 3 meses',
    endus: 'El mapa del coneixement que ja teniu i un grup que el fa circular sol quan nosaltres marxem.',
    endusEs: 'El mapa del conocimiento que ya tenéis y un grupo que lo hace circular solo cuando nosotros nos vamos.',
    diners: 'Pressupost de formació',
    dinersEs: 'Presupuesto de formación' },

  { id: 'formacio-equips', fam: 'formacio', ve: 'README', punt: 'provat',
    preu: 1600, publica: false, enllac: '',
    nom: 'Formació d\'equips',
    nomEs: 'Formación de equipos',
    qui: 'Empreses, cooperatives i equips tècnics',
    quiEs: 'Empresas, cooperativas y equipos técnicos',
    dura: 'Mitja jornada · més sessions, a escalar',
    duraEs: 'Media jornada · más sesiones, a escalar',
    endus: 'Lideratge col·laboratiu i gestió del canvi amb metodologia castellera: repartir el pes, avisar abans de cedir i poder dir el que es pensa sense por.',
    endusEs: 'Liderazgo colaborativo y gestión del cambio con metodología castellera: repartir el peso, avisar antes de ceder y poder decir lo que se piensa sin miedo.',
    diners: 'Pressupost de formació',
    dinersEs: 'Presupuesto de formación' },

  { id: 'escola', fam: 'formacio', ve: 'repo', punt: 'nou',
    preu: 2400, publica: true, enllac: '/SOS/escola.html',
    nom: 'La Fàbrica de Superherois',
    nomEs: 'La Fábrica de Superhéroes',
    qui: 'Escoles i AFA · 6 a 13 anys',
    quiEs: 'Escuelas y AFA · 6 a 13 años',
    dura: '8 sessions',
    duraEs: '8 sesiones',
    endus: 'Una classe amb el seu mapa de recursos i ajuda intercanviada de veritat. Els superpoders es guanyen quan un company confirma que l\'has ajudat, i cap nom real surt de l\'aula.',
    endusEs: 'Una clase con su mapa de recursos y ayuda intercambiada de verdad. Los superpoderes se ganan cuando un compañero confirma que le has ayudado, y ningún nombre real sale del aula.',
    diners: 'Pla educatiu d\'entorn · regidoria d\'educació',
    dinersEs: 'Plan educativo de entorno · concejalía de educación' },

  { id: 'formar-formadors', fam: 'formacio', ve: 'S5', punt: 'nou',
    preu: 2900, publica: false, enllac: '/SOS/formacio.html',
    nom: 'Formació de formadors',
    nomEs: 'Formación de formadores',
    qui: 'Ateneus Cooperatius i professionals independents',
    quiEs: 'Ateneus Cooperatius y profesionales independientes',
    dura: '20 h + tutela de 2 casos',
    duraEs: '20 h + tutela de 2 casos',
    endus: 'Poder formar i acreditar altres, amb el teu recorregut al registre signat i auditable. És el que fa que això escali sense passar per nosaltres.',
    endusEs: 'Poder formar y acreditar a otros, con tu recorrido en el registro firmado y auditable. Es lo que hace que esto escale sin pasar por nosotros.',
    diners: 'Programa propi de l\'Ateneu · formació de professionals',
    dinersEs: 'Programa propio del Ateneu · formación de profesionales' },

  /* ── 3 · Producció i dinamització ────────────────────────────────────── */
  { id: 'comu-diada', fam: 'dinamitzacio', ve: 'repo', punt: 'nou',
    preu: 2900, publica: true, enllac: '',
    nom: 'Comú-diada',
    nomEs: 'Comú-diada',
    qui: 'Ajuntaments, consells comarcals i entitats',
    quiEs: 'Ayuntamientos, consejos comarcales y entidades',
    dura: 'Una jornada · 3 setmanes de producció abans',
    duraEs: 'Una jornada · 3 semanas de producción antes',
    endus: 'La jornada feta i, el dilluns, la gent apuntada i la dinàmica engegada. La diferència amb una festa és que el dimarts encara hi ha alguna cosa en marxa.',
    endusEs: 'La jornada hecha y, el lunes, la gente apuntada y la dinámica en marcha. La diferencia con una fiesta es que el martes todavía hay algo funcionando.',
    diners: 'Partida de festes, participació o promoció econòmica',
    dinersEs: 'Partida de fiestas, participación o promoción económica' },

  { id: 'fent-pinya', fam: 'dinamitzacio', ve: 'README', punt: 'provat',
    preu: 2200, publica: true, enllac: '',
    nom: 'Fent Pinya',
    nomEs: 'Fent Pinya',
    qui: 'Equips d\'empresa, plens municipals i taules comunitàries',
    quiEs: 'Equipos de empresa, plenos municipales y mesas comunitarias',
    dura: '2 h',
    duraEs: '2 h',
    endus: 'Un grup que ha experimentat repartir el pes de debò —perquè s\'ha aixecat un castell— i el vocabulari per parlar-ne l\'endemà a la feina.',
    endusEs: 'Un grupo que ha experimentado repartir el peso de verdad —porque se ha levantado un castell— y el vocabulario para hablar de ello al día siguiente en el trabajo.',
    diners: 'Pressupost de formació o de festes',
    dinersEs: 'Presupuesto de formación o de fiestas' },

  { id: 'produccio', fam: 'dinamitzacio', ve: 'README', punt: 'provat',
    preu: 4500, publica: true, enllac: '',
    nom: 'Producció d\'esdeveniments',
    nomEs: 'Producción de eventos',
    qui: 'Empreses, ajuntaments i festivals',
    quiEs: 'Empresas, ayuntamientos y festivales',
    dura: 'Una jornada, de la idea al desmuntatge',
    duraEs: 'Una jornada, de la idea al desmontaje',
    endus: 'L\'esdeveniment produït sencer: proveïdors, permisos, muntatge, equip i tancament. Els festivals i els formats de diversos dies es dimensionen a part.',
    endusEs: 'El evento producido entero: proveedores, permisos, montaje, equipo y cierre. Los festivales y los formatos de varios días se dimensionan aparte.',
    diners: 'Pressupost de l\'esdeveniment',
    dinersEs: 'Presupuesto del evento' },

  { id: 'posar-en-marxa', fam: 'dinamitzacio', ve: 'S4', punt: 'adaptacio',
    preu: 3600, publica: true, enllac: '/SOS/molekulandia.html',
    nom: 'Posada en marxa d\'una dinàmica',
    nomEs: 'Puesta en marcha de una dinámica',
    qui: 'Entitats i grups promotors, finançat per l\'ajuntament',
    quiEs: 'Entidades y grupos promotores, financiado por el ayuntamiento',
    dura: '6 mesos · sessions quinzenals',
    duraEs: '6 meses · sesiones quincenales',
    endus: 'La dinàmica funcionant amb rols, governança i comptes: banc de temps, biblioteca de les coses, grup de consum, cures veïnals, comunitat energètica o habitatge en cessió d\'ús.',
    endusEs: 'La dinámica funcionando con roles, gobernanza y cuentas: banco de tiempo, biblioteca de las cosas, grupo de consumo, cuidados vecinales, comunidad energética o vivienda en cesión de uso.',
    diners: 'Partida de participació · Ateneus Cooperatius',
    dinersEs: 'Partida de participación · Ateneus Cooperatius' }
];

/* ══ AL VOLTANT DEL SOS ═══════════════════════════════════════════════════
   El SOS no és una família del catàleg: és el projecte, i és lliure. Això és
   el que sí que es contracta al seu voltant.

   `C3` és el cas que obliga a escriure aquesta nota: al repositori **no hi ha
   contractes intel·ligents construïts**. Per això es ven l'estudi i no la
   peça —un informe de si val la pena és un entregable real; una eina que no
   existeix, no—, i la fitxa ho diu a la cara. És la mateixa regla que ja
   vigila Molekulandia: cap porta cap a un lloc que no hi és. */
const SOS_PAQUETS = [
  { id: 'implantacio', ve: 'S6', punt: 'nou', preu: 1500, publica: true, enllac: '/SOS/',
    nom: 'Implantació i suport',
    nomEs: 'Implantación y soporte',
    qui: 'Ajuntaments, consells comarcals i Ateneus',
    quiEs: 'Ayuntamientos, consejos comarcales y Ateneus',
    dura: '3 setmanes',
    duraEs: '3 semanas',
    endus: 'L\'eina amb el vostre cas a dins, la sincronització entre aparells resolta i la gent sabent-la fer servir. Les dades es queden al vostre navegador.',
    endusEs: 'La herramienta con vuestro caso dentro, la sincronización entre aparatos resuelta y la gente sabiendo usarla. Los datos se quedan en vuestro navegador.',
    diners: 'Partida de digitalització · fons Next Generation',
    dinersEs: 'Partida de digitalización · fondos Next Generation' },

  { id: 'ia-amb-frens', ve: 'repo', punt: 'adaptacio', preu: 900, publica: true, enllac: '',
    nom: 'IA amb frens · sessió de viabilitat',
    nomEs: 'IA con frenos · sesión de viabilidad',
    qui: 'Qui es plantegi fer servir IA amb dades de persones',
    quiEs: 'Quien se plantee usar IA con datos de personas',
    dura: '1 sessió + informe · 2 setmanes',
    duraEs: '1 sesión + informe · 2 semanas',
    endus: 'Què es pot automatitzar amb garanties i què no, amb el criteri escrit: la màquina proposa, res entra sense que una persona ho hagi comprovat, i sempre es diu d\'on ho ha tret.',
    endusEs: 'Qué se puede automatizar con garantías y qué no, con el criterio escrito: la máquina propone, nada entra sin que una persona lo haya comprobado, y siempre se dice de dónde lo ha sacado.',
    diners: 'Partida de digitalització',
    dinersEs: 'Partida de digitalización' },

  { id: 'contractes', ve: 'repo', punt: 'nou', preu: 1500, publica: true, enllac: '',
    nom: 'Contractes intel·ligents · estudi de viabilitat',
    nomEs: 'Contratos inteligentes · estudio de viabilidad',
    qui: 'Cooperatives i administracions que vulguin automatitzar acords',
    quiEs: 'Cooperativas y administraciones que quieran automatizar acuerdos',
    dura: '3 setmanes',
    duraEs: '3 semanas',
    endus: 'Un informe de si val la pena, què costaria i quins riscos té. Es ven l\'estudi i no l\'eina: al SOS això encara no està construït, i l\'informe ho diu.',
    endusEs: 'Un informe de si vale la pena, qué costaría y qué riesgos tiene. Se vende el estudio y no la herramienta: en el SOS esto todavía no está construido, y el informe lo dice.',
    diners: 'Fons d\'innovació · Next Generation',
    dinersEs: 'Fondos de innovación · Next Generation' }
];

/* ══ Generació ════════════════════════════════════════════════════════════ */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const eur = n => n.toLocaleString('ca-ES').replace(/ /g, '.') + ' €';
const k = (id, camp) => 'pk.' + id + '.' + camp;

function fitxa(p) {
  const pt = PUNTS[p.punt];
  const nom = p.enllac
    ? `<a href="${p.enllac}" data-i18n="${k(p.id, 'n')}">${esc(p.nom)}</a>`
    : `<span data-i18n="${k(p.id, 'n')}">${esc(p.nom)}</span>`;
  return `        <article class="paquet" id="pk-${p.id}">
          <header>
            <h4>${nom}</h4>
            <span class="pk-punt ${pt.cls}" data-i18n="pk.punt.${p.punt}">${esc(pt.lbl)}</span>
          </header>
          <p class="pk-endus" data-i18n="${k(p.id, 'e')}">${esc(p.endus)}</p>
          <dl class="pk-dades">
            <dt data-i18n="pk.lbl.qui">Per a qui</dt><dd data-i18n="${k(p.id, 'q')}">${esc(p.qui)}</dd>
            <dt data-i18n="pk.lbl.dura">Quant dura</dt><dd data-i18n="${k(p.id, 'd')}">${esc(p.dura)}</dd>
            <dt data-i18n="pk.lbl.diners">Amb quins diners</dt><dd data-i18n="${k(p.id, 'f')}">${esc(p.diners)}</dd>
          </dl>
          <div class="pk-preu"><strong>${eur(p.preu)}</strong></div>
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
  files.push(`  ${q('pk.lbl.qui')}:${q(es ? 'Para quién' : 'Per a qui')},` +
             `${q('pk.lbl.dura')}:${q(es ? 'Cuánto dura' : 'Quant dura')},` +
             `${q('pk.lbl.diners')}:${q(es ? 'Con qué dinero' : 'Amb quins diners')},`);
  PAQUETS.concat(SOS_PAQUETS).forEach(p => {
    files.push(`  ${q(k(p.id, 'n'))}:${q(es ? p.nomEs : p.nom)},` +
               `${q(k(p.id, 'e'))}:${q(es ? p.endusEs : p.endus)},`);
    files.push(`  ${q(k(p.id, 'q'))}:${q(es ? p.quiEs : p.qui)},` +
               `${q(k(p.id, 'd'))}:${q(es ? p.duraEs : p.dura)},` +
               `${q(k(p.id, 'f'))}:${q(es ? p.dinersEs : p.diners)},`);
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
  const fila = p => `| **${p.nomEs}** | ${p.quiEs} | ${p.duraEs} | ${eur(p.preu)} | ${PUNTS[p.punt].lblEs} |`;
  const taula = llista => [
    '| Paquete | Para quién | Cuánto dura | Precio | Punto |',
    '|---|---|---|---|---|',
    ...llista.map(fila)
  ].join('\n');
  const fams = FAMILIES.map(f =>
    `### ${f.ic} ${f.nomEs}\n\n*${f.subEs}*\n\n` + taula(PAQUETS.filter(p => p.fam === f.id))
  ).join('\n\n');
  return fams + '\n\n### 🖥️ Alrededor del SOS\n\n*La herramienta es libre. Esto es lo que sí se contrata.*\n\n'
    + taula(SOS_PAQUETS);
}

/* ══ Escriure ═════════════════════════════════════════════════════════════ */
const MARQUES = [
  ['<!--TT-OFERTA-->', '<!--/TT-OFERTA-->', blocCataleg],
  ['<!--TT-SOS-->', '<!--/TT-SOS-->', blocSos],
  ['/*TT-I18N-CA*/', '/*/TT-I18N-CA*/', () => diccionari('ca')],
  ['/*TT-I18N-ES*/', '/*/TT-I18N-ES*/', () => diccionari('es')]
];
const MARQUES_MD = [['<!--TT-OFERTA-MD-->', '<!--/TT-OFERTA-MD-->', taulaMd]];

function posa(src, marques) {
  let out = src, faltaven = [];
  for (const [obre, tanca, fn] of marques) {
    const i = out.indexOf(obre), j = out.indexOf(tanca);
    if (i < 0 || j < 0 || j < i) { faltaven.push(obre); continue; }
    out = out.slice(0, i + obre.length) + '\n\n' + fn() + '\n\n' + out.slice(j);
  }
  return { out, faltaven };
}

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
