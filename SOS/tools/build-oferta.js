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

/* ══ D'ON SURT EL PREU ═════════════════════════════════════════════════════
   Un preu sense procedència és una xifra que qui la llegeix no pot discutir i
   qui la diu no pot defensar. N'hi ha de tres menes en aquest catàleg i es
   diuen totes tres, perquè no valen el mateix:

     · `tarifari` — surt del catàleg comercial de TeamTowers 2026, que és el
       que es factura de debò. Aquestes no es negocien a l'aire.
     · `negoci`   — surt de les forquilles del model de negoci
       (`SOS/knowledge/negoci/formacio-mentoria.md` §3), pensades i escrites.
     · `estimacio`— encara no s'ha facturat prou vegades per tenir tarifa.
       Es diu, i és el que la primera conversa ha de tancar.

   Veda 139: una forquilla sense el que la mou és un rang, no un preu. Cada
   paquet diu **què fa pujar o baixar dins de la seva** (`perque`) i **què
   s'endú qui la paga** (`valor`), que és l'única pregunta que decideix. */
const FONTS = {
  tarifari:  { lbl: 'Tarifa 2026',     lblEs: 'Tarifa 2026' },
  negoci:    { lbl: 'Forquilla del model', lblEs: 'Horquilla del modelo' },
  estimacio: { lbl: 'A validar',       lblEs: 'A validar' }
};

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
  { id: 'diagnostic-teixit', fam: 'consultoria', ve: 'S1', punt: 'adaptacio',
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

  { id: 'mapa-organitzacio', fam: 'consultoria', ve: 'README', punt: 'provat',
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

  { id: 'mapa-comarcal', fam: 'consultoria', ve: 'S1', punt: 'nou',
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

  { id: 'impacte', fam: 'consultoria', ve: 'S7', punt: 'nou',
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

  { id: 'persones-cultura', fam: 'consultoria', ve: 'README', punt: 'provat',
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
  { id: 'gestor', fam: 'formacio', ve: 'S3', punt: 'nou',
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

  { id: 'equip-gestor', fam: 'formacio', ve: 'S3', punt: 'nou',
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

  { id: 'comunitats-practica', fam: 'formacio', ve: 'README', punt: 'provat',
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

  { id: 'formacio-equips', fam: 'formacio', ve: 'README', punt: 'provat',
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

  { id: 'escola', fam: 'formacio', ve: 'repo', punt: 'nou',
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

  { id: 'formar-formadors', fam: 'formacio', ve: 'S5', punt: 'nou',
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

  /* ── 3 · Producció i dinamització ────────────────────────────────────── */
  { id: 'comu-diada', fam: 'dinamitzacio', ve: 'repo', punt: 'nou',
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

  /* El tarifari de debò, del catàleg comercial 2026. Aquí no hi ha forquilla
     a negociar: hi ha trams per nombre de participants, i per això es pinten
     tal com es facturen. Tot són preus sense IVA i per a esdeveniments a
     menys de dues hores de Barcelona. */
  { id: 'fent-pinya', fam: 'dinamitzacio', ve: 'README', punt: 'provat',
    preuMin: 1700, preuMax: 8925, font: 'tarifari', publica: true, enllac: '',
    trams: [['10-29 persones', 1700], ['30-48', 2100], ['50-99', 3150],
            ['100-199', 4725], ['200-399', 6300], ['+400', 8925]],
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
    perque: 'No es negocia: el preu el fixa el tram de participants. Els desplaçaments a més de dues hores de Barcelona es pressuposten a part.',
    perqueEs: 'No se negocia: el precio lo fija el tramo de participantes. Los desplazamientos a más de dos horas de Barcelona se presupuestan aparte.',
    diners: 'Pressupost de formació, d\'esdeveniment o de festes',
    dinersEs: 'Presupuesto de formación, de evento o de fiestas' },

  { id: 'demos', fam: 'dinamitzacio', ve: 'README', punt: 'provat',
    preuMin: 3300, preuMax: 6500, font: 'tarifari', publica: true, enllac: '',
    trams: [['4 pisos · 13 castellers', 3300], ['5 pisos · 20 castellers', 4800],
            ['6 pisos · 30 castellers', 6500]],
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
    perque: 'El preu el fixa l\'alçada, que és el nombre de castellers que cal moure. Màxim quatre castells per actuació, per qualitat.',
    perqueEs: 'El precio lo fija la altura, que es el número de castellers que hay que mover. Máximo cuatro castells por actuación, por calidad.',
    diners: 'Pressupost de l\'esdeveniment o de festes',
    dinersEs: 'Presupuesto del evento o de fiestas' },

  { id: 'produccio', fam: 'dinamitzacio', ve: 'README', punt: 'provat',
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

  { id: 'posar-en-marxa', fam: 'dinamitzacio', ve: 'S4', punt: 'adaptacio',
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
    dinersEs: 'Partida de participación · Ateneus Cooperatius' }
];

/* ══ AL VOLTANT DEL SOS ═══════════════════════════════════════════════════
   El SOS no és una família del catàleg: és el projecte, i és lliure. Això és
   el que sí que es contracta al seu voltant.

   `contractes` és el cas que obliga a escriure aquesta nota: al repositori
   **no hi ha contractes intel·ligents construïts**. Per això es ven l'estudi i
   no la peça —un informe de si val la pena és un entregable real; una eina que
   no existeix, no—, i la fitxa ho diu a la cara. */
const SOS_PAQUETS = [
  { id: 'implantacio', ve: 'S6', punt: 'nou', preuMin: 800, preuMax: 2500,
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

  { id: 'ia-amb-frens', ve: 'repo', punt: 'adaptacio', preuMin: 600, preuMax: 1500,
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

  { id: 'contractes', ve: 'repo', punt: 'nou', preuMin: 1200, preuMax: 2500,
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
  /* Els trams no són una forquilla: són el preu, i es pinten com una taula
     perquè qui compra sap en quin tram cau abans de trucar. */
  const preu = p.trams
    ? `<table class="pk-trams">${p.trams.map(([q, v]) =>
        `<tr><th>${esc(q)}</th><td>${eur(v)}</td></tr>`).join('')}</table>`
    : `<strong>${forq(p)}</strong>`;
  return `        <article class="paquet" id="pk-${p.id}">
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
  const preuEs = p => p.trams
    ? p.trams.map(([q2, v]) => q2 + ': ' + eur(v)).join(' · ')
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
