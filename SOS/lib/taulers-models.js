/* Els taulers de la colla · els models
 * ─────────────────────────────────────────────────────────────────────────────
 * Un tauler és una pinya vista de dalt amb una rengla per factor d'un model de
 * persones o d'equip. Al mig, la font. Cada rengla porta el rol que aquell
 * factor fa a la colla i les skills dels seus dos pols. Veda 184.
 *
 * Aquí només hi ha **noms de factors i la lectura de la casa**. Cap ítem de cap
 * test: els resultats els porta la persona, que ha fet el test per la via que
 * li toca (el 16PF, amb un proveïdor autoritzat; la resta, oberts).
 *
 *   TaulersModels.MODELS      { '16pf': {…}, 'big5': {…}, 'panteo': {…} }
 *   TaulersModels.ORDRE       ['16pf', 'big5', 'panteo']
 *
 * Un model:
 *   { id, nom:{ca,es}, escala:{min,max,mig,nom}, bipolar, llicencia:{ca,es},
 *     font:{nom,url}, factors:[{ id, nom:{ca,es}, en, rol:{ca,es},
 *     alt:{ca,es}, baix:{ca,es} }] }
 * `alt` i `baix` són les skills que cada pol hi aporta. En un model unipolar
 * (el panteó), `baix` diu què s'aprèn ocupant aquell forat.
 */
(function (arrel) {
  function T(ca, es) { return { ca: ca, es: es }; }
  function F(id, en, nom, rol, alt, baix) { return { id: id, en: en, nom: nom, rol: rol, alt: alt, baix: baix }; }

  /* ══ 16PF · Cattell ═══════════════════════════════════════════════════════
     Els setze factors primaris, amb la lletra i el nom de la cinquena edició.
     Els noms en català i castellà són els d'ús comú; els rols i les skills són
     la lectura de TeamTowers, no la interpretació oficial del test. */
  var PF = {
    id: '16pf', nom: T('16PF · setze factors', '16PF · dieciséis factores'),
    escala: { min: 1, max: 10, mig: 5.5, nom: 'sten' }, bipolar: true,
    llicencia: T(
      'El 16PF és un test amb drets d\'editor. Aquí només hi ha els noms dels factors: el test es fa amb un proveïdor autoritzat i cada persona hi posa els seus decatipus (1-10).',
      'El 16PF es un test con derechos de editor. Aquí solo están los nombres de los factores: el test se hace con un proveedor autorizado y cada persona pone sus decatipos (1-10).'),
    font: { nom: 'Cattell, 16PF Questionnaire', url: 'https://en.wikipedia.org/wiki/16PF_Questionnaire' },
    factors: [
      F('A', 'Warmth', T('Calidesa', 'Afabilidad'), T('Acollida i cura de la colla', 'Acogida y cuidado de la colla'),
        T('rebre qui arriba, fer pinya amb el cos, cuidar', 'recibir a quien llega, hacer piña con el cuerpo, cuidar'),
        T('distància serena, tracte just sense favoritismes', 'distancia serena, trato justo sin favoritismos')),
      F('B', 'Reasoning', T('Raonament', 'Razonamiento'), T('Tècnica del castell', 'Técnica del castell'),
        T('analitzar la construcció, llegir per què cau', 'analizar la construcción, leer por qué cae'),
        T('fer sense donar-hi voltes, seguir l\'assaig pas a pas', 'hacer sin darle vueltas, seguir el ensayo paso a paso')),
      F('C', 'Emotional Stability', T('Estabilitat', 'Estabilidad'), T('Baix · aguantar el pes', 'Baix · aguantar el peso'),
        T('serenor sota pressió, no moure\'s quan tremola', 'serenidad bajo presión, no moverse cuando tiembla'),
        T('sentir aviat que alguna cosa no va, i dir-ho', 'sentir pronto que algo no va, y decirlo')),
      F('E', 'Dominance', T('Dominància', 'Dominancia'), T('Cap de colla · decidir', 'Cap de colla · decidir'),
        T('decidir quin castell es fa, manar a plaça', 'decidir qué castell se hace, mandar en la plaza'),
        T('cedir, sumar, fer de crossa del qui mana', 'ceder, sumar, hacer de crossa de quien manda')),
      F('F', 'Liveliness', T('Animació', 'Animación'), T('Gralles, ambient i celebració', 'Grallas, ambiente y celebración'),
        T('encendre la colla, celebrar, fer venir gent', 'encender la colla, celebrar, atraer gente'),
        T('silenci i concentració abans de carregar', 'silencio y concentración antes de cargar')),
      F('G', 'Rule-Consciousness', T('Atenció a les normes', 'Atención a las normas'), T('Seguretat i protocol', 'Seguridad y protocolo'),
        T('cascs, faixes, regles, que tot es faci com s\'ha dit', 'cascos, fajas, reglas, que todo se haga como se dijo'),
        T('adaptar la norma quan la plaça no és la de l\'assaig', 'adaptar la norma cuando la plaza no es la del ensayo')),
      F('H', 'Social Boldness', T('Atreviment', 'Atrevimiento'), T('Relacions i portaveu', 'Relaciones y portavoz'),
        T('parlar en públic, obrir portes, convidar altres colles', 'hablar en público, abrir puertas, invitar a otras collas'),
        T('feina discreta al darrere, escoltar abans de parlar', 'trabajo discreto detrás, escuchar antes de hablar')),
      F('I', 'Sensitivity', T('Sensibilitat', 'Sensibilidad'), T('Canalla i cura', 'Canalla y cuidado'),
        T('acompanyar la canalla, llegir com està cadascú', 'acompañar a la canalla, leer cómo está cada uno'),
        T('pragmatisme: el que cal fer, fet', 'pragmatismo: lo que hay que hacer, hecho')),
      F('L', 'Vigilance', T('Vigilància', 'Vigilancia'), T('Cap de pinya · mirar els riscos', 'Cap de pinya · mirar los riesgos'),
        T('veure el que pot fallar, revisar cada rengla', 'ver lo que puede fallar, revisar cada rengla'),
        T('confiar en la colla, deixar fer', 'confiar en la colla, dejar hacer')),
      F('M', 'Abstractedness', T('Abstracció', 'Abstracción'), T('Visió i castells nous', 'Visión y castells nuevos'),
        T('imaginar el castell que encara no s\'ha fet', 'imaginar el castell que aún no se ha hecho'),
        T('peus a terra, el detall concret de cada posició', 'pies en el suelo, el detalle concreto de cada posición')),
      F('N', 'Privateness', T('Privadesa', 'Privacidad'), T('Diplomàcia i negociació', 'Diplomacia y negociación'),
        T('discreció, negociar amb altres colles i institucions', 'discreción, negociar con otras collas e instituciones'),
        T('franquesa, dir les coses tal com són', 'franqueza, decir las cosas tal como son')),
      F('O', 'Apprehension', T('Aprensió', 'Aprensión'), T('Prevenció i primers auxilis', 'Prevención y primeros auxilios'),
        T('anticipar el que pot anar malament, cuidar els detalls', 'anticipar lo que puede ir mal, cuidar los detalles'),
        T('seguretat en un mateix, treure pes als dubtes', 'seguridad en uno mismo, quitar peso a las dudas')),
      F('Q1', 'Openness to Change', T('Obertura al canvi', 'Apertura al cambio'), T('Innovació i formació', 'Innovación y formación'),
        T('provar maneres noves d\'assajar, ensenyar', 'probar maneras nuevas de ensayar, enseñar'),
        T('tradició: guardar el que ja funciona', 'tradición: guardar lo que ya funciona')),
      F('Q2', 'Self-Reliance', T('Autosuficiència', 'Autosuficiencia'), T('Logística i intendència', 'Logística e intendencia'),
        T('resoldre sol el que cal: material, transport, local', 'resolver solo lo necesario: material, transporte, local'),
        T('fer-ho en grup, sumar-se a la rengla', 'hacerlo en grupo, sumarse a la rengla')),
      F('Q3', 'Perfectionism', T('Perfeccionisme', 'Perfeccionismo'), T('Organització i assaigs', 'Organización y ensayos'),
        T('planificar la temporada, l\'assaig i la diada', 'planificar la temporada, el ensayo y la diada'),
        T('flexibilitat, improvisar quan la plaça ho demana', 'flexibilidad, improvisar cuando la plaza lo pide')),
      F('Q4', 'Tension', T('Tensió', 'Tensión'), T('Empenta i ritme', 'Empuje y ritmo'),
        T('energia i urgència per tirar endavant', 'energía y urgencia para tirar adelante'),
        T('calma, baixar la tensió de la colla', 'calma, bajar la tensión de la colla'))
    ]
  };

  /* ══ Big Five · IPIP ══════════════════════════════════════════════════════
     Els cinc grans, amb els ítems de domini públic de l'IPIP (Goldberg, Oregon
     Research Institute). És el model obert: el test es pot passar sense
     llicència, i és el de les plantilles pròpies. */
  var B5 = {
    id: 'big5', nom: T('Big Five · cinc grans (IPIP, obert)', 'Big Five · cinco grandes (IPIP, abierto)'),
    escala: { min: 1, max: 10, mig: 5.5, nom: '1-10' }, bipolar: true,
    llicencia: T(
      'Model obert: els ítems de l\'IPIP són de domini públic. Cada persona hi posa el seu resultat de 1 a 10.',
      'Modelo abierto: los ítems del IPIP son de dominio público. Cada persona pone su resultado de 1 a 10.'),
    font: { nom: 'International Personality Item Pool', url: 'https://ipip.ori.org/' },
    factors: [
      F('O', 'Openness', T('Obertura', 'Apertura'), T('Visió i innovació', 'Visión e innovación'),
        T('imaginar castells nous, aprendre', 'imaginar castells nuevos, aprender'),
        T('guardar el que funciona, concreció', 'guardar lo que funciona, concreción')),
      F('C', 'Conscientiousness', T('Responsabilitat', 'Responsabilidad'), T('Organització i seguretat', 'Organización y seguridad'),
        T('planificar, complir, revisar', 'planificar, cumplir, revisar'),
        T('flexibilitat, improvisar', 'flexibilidad, improvisar')),
      F('E', 'Extraversion', T('Extraversió', 'Extraversión'), T('Relacions i animació', 'Relaciones y animación'),
        T('encendre la plaça, portar gent', 'encender la plaza, traer gente'),
        T('concentració, feina callada', 'concentración, trabajo callado')),
      F('A', 'Agreeableness', T('Amabilitat', 'Amabilidad'), T('Acollida i cura', 'Acogida y cuidado'),
        T('cuidar, cohesionar la colla', 'cuidar, cohesionar la colla'),
        T('dir que no, defensar el criteri', 'decir que no, defender el criterio')),
      F('N', 'Neuroticism', T('Reactivitat emocional', 'Reactividad emocional'), T('Baix · serenor i prevenció', 'Baix · serenidad y prevención'),
        T('sentir el risc abans que ningú', 'sentir el riesgo antes que nadie'),
        T('aguantar el pes sense moure\'s', 'aguantar el peso sin moverse'))
    ]
  };

  /* ══ El panteó de 12 · Pantheon.work (CC BY) ══════════════════════════════
     Els dotze guardians de `knowledge/references/pantheon-12.md`. No és un
     test de personalitat: és un inventari col·lectiu, i cadascú s'hi puntua de
     1 a 10 (o el grup el puntua). Unipolar: com més alt, més a prop de la font. */
  var P12 = {
    id: 'panteo', nom: T('Panteó de 12 · els guardians (CC BY)', 'Panteón de 12 · los guardianes (CC BY)'),
    escala: { min: 1, max: 10, mig: 5.5, nom: '1-10' }, bipolar: false,
    llicencia: T(
      'Adaptat de l\'exercici de Pantheon.work, llicència CC BY. Cadascú s\'hi puntua de 1 a 10, o el grup el puntua.',
      'Adaptado del ejercicio de Pantheon.work, licencia CC BY. Cada cual se puntúa de 1 a 10, o lo puntúa el grupo.'),
    font: { nom: 'Pantheon.work', url: 'https://www.pantheon.work' },
    factors: [
      F('zeus', 'Zeus', T('Zeus', 'Zeus'), T('Decidir i repartir el valor', 'Decidir y repartir el valor'),
        T('decisió, equitat, repartiment', 'decisión, equidad, reparto'), T('aprendre a decidir en colla', 'aprender a decidir en colla')),
      F('hera', 'Hera', T('Hera', 'Hera'), T('Pactes i confiança', 'Pactos y confianza'),
        T('compromís, expectatives, confiança', 'compromiso, expectativas, confianza'), T('aprendre a segellar acords', 'aprender a sellar acuerdos')),
      F('posido', 'Poseidon', T('Posidó', 'Poseidón'), T('Explorar territori nou', 'Explorar territorio nuevo'),
        T('descobriment, sostenir el canvi', 'descubrimiento, sostener el cambio'), T('aprendre a obrir camí', 'aprender a abrir camino')),
      F('demeter', 'Demeter', T('Demèter', 'Deméter'), T('Fer créixer el valor', 'Hacer crecer el valor'),
        T('crear, generar, cuidar qui hi és', 'crear, generar, cuidar a quien está'), T('aprendre a fer créixer', 'aprender a hacer crecer')),
      F('atenea', 'Athena', T('Atenea', 'Atenea'), T('De la teoria a la pràctica', 'De la teoría a la práctica'),
        T('estratègia, protegir el flux', 'estrategia, proteger el flujo'), T('aprendre estratègia fent', 'aprender estrategia haciendo')),
      F('apollo', 'Apollo', T('Apol·lo', 'Apolo'), T('El coneixement de la colla', 'El conocimiento de la colla'),
        T('anàlisi, estructura, visió', 'análisis, estructura, visión'), T('aprendre a escriure el que sabem', 'aprender a escribir lo que sabemos')),
      F('hebe', 'Hebe', T('Hebe', 'Hebe'), T('Intendència i energia', 'Intendencia y energía'),
        T('logística, aprovisionament, descans', 'logística, aprovisionamiento, descanso'), T('aprendre a sostenir l\'equip', 'aprender a sostener el equipo')),
      F('dionis', 'Dionysus', T('Dionís', 'Dioniso'), T('Celebrar i obrir', 'Celebrar y abrir'),
        T('socialitzar, celebrar, jugar', 'socializar, celebrar, jugar'), T('aprendre a celebrar', 'aprender a celebrar')),
      F('afrodita', 'Aphrodite', T('Afrodita', 'Afrodita'), T('Imatge i experiència', 'Imagen y experiencia'),
        T('estètica, disseny, atracció', 'estética, diseño, atracción'), T('aprendre a fer-ho bonic', 'aprender a hacerlo bonito')),
      F('hefest', 'Hephaestus', T('Hefest', 'Hefesto'), T('Ofici i eines', 'Oficio y herramientas'),
        T('fer, eines, producció', 'hacer, herramientas, producción'), T('aprendre l\'ofici', 'aprender el oficio')),
      F('hermes', 'Hermes', T('Hermes', 'Hermes'), T('Connectar persones', 'Conectar personas'),
        T('comunicar, guiar, intercanviar', 'comunicar, guiar, intercambiar'), T('aprendre a connectar', 'aprender a conectar')),
      F('hestia', 'Hestia', T('Hèstia', 'Hestia'), T('Espais i acollida', 'Espacios y acogida'),
        T('acollir, cuidar les trobades', 'acoger, cuidar los encuentros'), T('aprendre a acollir', 'aprender a acoger'))
    ]
  };

  var MODELS = { '16pf': PF, big5: B5, panteo: P12 };
  var TaulersModels = { MODELS: MODELS, ORDRE: ['16pf', 'big5', 'panteo'] };
  if (typeof module === 'object' && module.exports) module.exports = TaulersModels;
  else arrel.TaulersModels = TaulersModels;
})(this);
