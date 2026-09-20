/* =============================================================================
   Events Penedès — i18n + navegación
   Sin dependencias. ES por defecto (el HTML ya está en ES), CA y EN por diccionario.
   ========================================================================== */
(function () {
  'use strict';

  var STORE_KEY = 'ep-lang';
  var DEFAULT = 'es';

  var I18N = {
    es: {}, /* el HTML ya viene en castellano; se rellena en el arranque */

    ca: {
      'skip': 'Vés al contingut principal',
      'nav.services': 'Serveis',
      'nav.venues': 'Localitzacions',
      'nav.activities': 'Activitats',
      'nav.process': 'Com treballem',
      'nav.contact': 'Contacte',

      'hero.eyebrow': 'Alt Penedès · Barcelona',
      'hero.title': 'Produïm esdeveniments a l’<em>Alt Penedès</em>: localitzacions, activitats i logística.',
      'hero.lead': 'Treballem amb agències, espais i empreses finals. Hi posem el terreny, l’equip i la producció perquè l’esdeveniment surti bé: masies i espais amb caràcter, activitats d’equip pròpies i coordinació integral de cap a cap.',
      'hero.cta1': 'Demanar proposta',
      'hero.cta2': 'Veure localitzacions',
      'hero.meta1': 'Producció integral',
      'hero.meta2': 'Localitzacions pròpies i aliades',
      'hero.meta3': 'Activitats d’equip',
      'hero.meta4': 'CA · ES · EN',

      'who.eyebrow': 'Per a qui treballem',
      'who.title': 'Tres maneres de treballar amb nosaltres',
      'who.lead': 'El mateix equip, tres encaixos diferents segons qui ens truca.',
      'who.a1.title': 'Agències',
      'who.a1.text': 'Som el vostre partner local al Penedès: producció a destinació, proveïdors contrastats, scouting d’espais i activitats que podeu revendre amb la vostra marca.',
      'who.a1.i1': 'Producció executiva a destinació',
      'who.a1.i2': 'Scouting i reserva de localitzacions',
      'who.a1.i3': 'Activitats en marca blanca',
      'who.a2.title': 'Localitzacions',
      'who.a2.text': 'Tens una masia, un celler o un espai singular? Hi aportem programa, activitats i producció per convertir-lo en una destinació d’esdeveniments corporatius.',
      'who.a2.i1': 'Programa d’activitats clau en mà',
      'who.a2.i2': 'Comercialització cap a agències i empreses',
      'who.a2.i3': 'Producció i coordinació el dia de l’esdeveniment',
      'who.a3.title': 'Empreses',
      'who.a3.text': 'Una convenció, un incentiu, un kick-off o una jornada d’equip. Un únic interlocutor des del briefing fins a l’informe posterior.',
      'who.a3.i1': 'Convencions, incentius i kick-offs',
      'who.a3.i2': 'Jornades d’equip i celebracions',
      'who.a3.i3': 'Pressupost tancat i un sol interlocutor',

      'svc.eyebrow': 'Serveis',
      'svc.title': 'Què fem',
      'svc.lead': 'Ho pots contractar sencer o només la peça que et falta.',
      'svc.s1.title': 'Producció integral',
      'svc.s1.text': 'Ens fem càrrec de l’esdeveniment complet: planificació, proveïdors, timings, tècnica, muntatge i coordinació el mateix dia.',
      'svc.s1.i1': 'Pressupost, timing i pla de producció',
      'svc.s1.i2': 'Càtering, tècnica, mobiliari i transport',
      'svc.s1.i3': 'Permisos, assegurances i pla de seguretat',
      'svc.s1.i4': 'Direcció de l’esdeveniment sobre el terreny',
      'svc.s2.title': 'Localitzacions',
      'svc.s2.text': 'Espais propis i una xarxa de masies, cellers, hotels i entorns naturals de l’Alt Penedès. Cerquem, visitem i negociem.',
      'svc.s2.i1': 'Scouting segons briefing i pressupost',
      'svc.s2.i2': 'Visites tècniques i fitxes d’espai',
      'svc.s2.i3': 'Reserva, contracte i relació amb l’espai',
      'svc.s3.title': 'Activitats i equip',
      'svc.s3.text': 'Activitats pròpies i dissenyades a mida, des del taller de castells fins a gimcanes a les vinyes o reptes gastronòmics.',
      'svc.s3.i1': 'Taller de castells «Fent Pinya»',
      'svc.s3.i2': 'Gimcanes i activitats outdoor',
      'svc.s3.i3': 'Experiències gastronòmiques i tastos',
      'svc.s3.i4': 'Dinàmiques d’equip amb objectiu definit',

      'ven.eyebrow': 'Localitzacions',
      'ven.title': 'Els nostres espais al Penedès',
      'ven.lead': 'Comencem pels dos espais que gestionem directament, amb TeamTowers, i els completem amb la xarxa d’espais aliats de la comarca.',
      'ven.v1.tag': 'Espai propi · TeamTowers',
      'ven.v1.title': 'La Masia',
      'ven.v1.text': 'Masia de l’Alt Penedès en entorn rural, pensada per a jornades d’empresa: espais interiors per treballar i exterior per a activitats, dinar i sobretaula. Combinable amb el taller de castells la mateixa jornada.',
      'ven.v1.s1': 'Jornades d’empresa',
      'ven.v1.s2': 'Interior + exterior',
      'ven.v1.s3': 'Entorn rural',
      'ven.v1.s4': 'Aforament a consultar',
      'ven.v2.tag': 'Espai propi · TeamTowers',
      'ven.v2.title': 'El Taller de Castells',
      'ven.v2.text': 'Espai cobert d’entrenament casteller, adaptat a grups d’empresa. És la seu natural del taller «Fent Pinya»: es fa plogui o no, amb monitors castellers i tot el material de seguretat.',
      'ven.v2.s1': 'Cobert',
      'ven.v2.s2': 'Grups de 10 a 200',
      'ven.v2.s3': 'Material de seguretat inclòs',
      'ven.v2.s4': 'Monitors experts',
      'ven.v3.tag': 'Xarxa d’espais aliats',
      'ven.v3.title': 'Masies, cellers i entorns naturals',
      'ven.v3.text': 'Quan el projecte demana una altra cosa, treballem amb espais aliats de la comarca: masies, caves i cellers visitables, hotels amb sales i entorns naturals per a activitats a l’aire lliure. Et proposem tres opcions amb fitxa, fotos i preu.',
      'ven.v3.s1': 'Caves i cellers',
      'ven.v3.s2': 'Hotels amb sales',
      'ven.v3.s3': 'Vinyes i natura',
      'ven.v3.s4': '40 min de Barcelona',
      'ven.note': 'Gestiones un espai al Penedès i vols formar part de la xarxa? Escriu-nos.',

      'act.eyebrow': 'Activitats',
      'act.title': 'Experiències que es fan aquí',
      'act.lead': 'Activitats pròpies i de partners locals, adaptades a la mida del grup, l’idioma i l’objectiu.',
      'act.a1.title': 'Taller de castells «Fent Pinya»',
      'act.a1.text': 'Dues hores per construir un castell humà de debò, amb monitors castellers. La metàfora s’explica sola: base, confiança, comunicació i un objectiu que no s’aconsegueix sol. Activitat de TeamTowers.',
      'act.a2.title': 'Gimcana a les vinyes',
      'act.a2.text': 'Recorregut per equips entre vinyes i camins del Penedès, amb proves de col·laboració, orientació i coneixement del territori.',
      'act.a3.title': 'Repte gastronòmic',
      'act.a3.text': 'Format tipus Masterchef amb cuina de producte local: els equips cuinen, presenten i comparteixen. Acaba a taula, que és on es tanca la jornada.',
      'act.a4.title': 'Tast de cava i vi',
      'act.a4.text': 'Tast guiat al celler o a la masia, sol o com a cloenda d’una altra activitat. Disponible en català, castellà i anglès.',
      'act.a5.title': 'Activitats outdoor',
      'act.a5.text': 'Caminades, bicicleta, orientació i jocs d’equip a l’entorn natural de la comarca, amb suport logístic i de seguretat.',
      'act.a6.title': 'A mida',
      'act.a6.text': 'Si tens un objectiu concret —integrar dos equips, arrencar un projecte, celebrar un tancament— dissenyem l’activitat des de zero.',

      'proc.eyebrow': 'Com treballem',
      'proc.title': 'De la trucada a l’esdeveniment',
      'proc.p1.title': 'Briefing',
      'proc.p1.text': 'Una conversa: quants sou, quina data, quin pressupost i què voleu que passi. Sense compromís.',
      'proc.p2.title': 'Proposta',
      'proc.p2.text': 'T’enviem opcions d’espai, programa i pressupost tancat. Normalment en 48–72 h laborables.',
      'proc.p3.title': 'Producció',
      'proc.p3.text': 'Reserves, proveïdors, timing, permisos i pla B. Un interlocutor únic i tota la documentació per escrit.',
      'proc.p4.title': 'El dia i després',
      'proc.p4.text': 'Dirigim l’esdeveniment sobre el terreny i després et passem tancament econòmic i valoració dels participants.',

      'exp.eyebrow': 'Experiència',
      'exp.title': 'D’on venim',
      'exp.lead': 'Events Penedès neix de l’equip de TeamTowers, que des del 2005 fa tallers i esdeveniments d’equip des de Vilafranca del Penedès.',
      'exp.s1': 'Any en què va començar el taller «Fent Pinya»',
      'exp.s2': 'Persones que han passat pels tallers',
      'exp.s3': 'Organitzacions ateses',
      'exp.s4': 'Idiomes de treball',
      'exp.note': 'Les xifres corresponen a l’activitat de TeamTowers (teamtowers.eu) des del 2005. Events Penedès és la marca amb què oferim producció d’esdeveniments i localitzacions a la comarca.',

      'cta.eyebrow': 'Contacte',
      'cta.title': 'Explica’ns el teu esdeveniment',
      'cta.lead': 'Responem en menys de 24 h laborables amb una primera orientació d’espais i pressupost.',
      'cta.i.mail': 'Correu',
      'cta.i.phone': 'Telèfon',
      'cta.i.place': 'On som',
      'cta.i.place.v': 'Vilafranca del Penedès, Barcelona · A 40 min de Barcelona i de l’aeroport',
      'cta.i.lang': 'Idiomes',
      'cta.i.lang.v': 'Català · Castellano · English',
      'cta.f.name': 'Nom',
      'cta.f.org': 'Empresa o agència',
      'cta.f.mail': 'Correu',
      'cta.f.phone': 'Telèfon',
      'cta.f.people': 'Nre. de persones',
      'cta.f.date': 'Data aproximada',
      'cta.f.type': 'Tipus d’esdeveniment',
      'cta.f.t1': 'Jornada d’equip / team building',
      'cta.f.t2': 'Convenció o kick-off',
      'cta.f.t3': 'Incentiu',
      'cta.f.t4': 'Celebració d’empresa',
      'cta.f.t5': 'Soc una agència i busco partner local',
      'cta.f.t6': 'Altres',
      'cta.f.msg': 'Explica’ns',
      'cta.f.send': 'Enviar sol·licitud',
      'cta.f.note': 'En enviar s’obrirà el teu client de correu amb les dades. Si ho prefereixes, escriu-nos directament a hola@eventspenedes.com.',

      'foot.tagline': 'Producció d’esdeveniments, localitzacions i activitats a l’Alt Penedès.',
      'foot.h1': 'Seccions',
      'foot.h2': 'Contacte',
      'foot.city': 'Vilafranca del Penedès, Barcelona',
      'foot.h3': 'Ecosistema',
      'foot.rights': '© 2026 Events Penedès · Un projecte de TeamTowers Humà',
      'foot.prov': 'Web provisional — estem preparant la versió completa.'
    },

    en: {
      'skip': 'Skip to main content',
      'nav.services': 'Services',
      'nav.venues': 'Venues',
      'nav.activities': 'Activities',
      'nav.process': 'How we work',
      'nav.contact': 'Contact',

      'hero.eyebrow': 'Alt Penedès · Barcelona',
      'hero.title': 'Event production in the <em>Alt Penedès</em>: venues, activities and logistics.',
      'hero.lead': 'We work with agencies, venues and end clients. We provide the ground, the crew and the production so the event runs well: characterful farmhouses and spaces, our own team activities and full coordination from start to finish.',
      'hero.cta1': 'Request a proposal',
      'hero.cta2': 'See venues',
      'hero.meta1': 'Full production',
      'hero.meta2': 'Own and partner venues',
      'hero.meta3': 'Team activities',
      'hero.meta4': 'CA · ES · EN',

      'who.eyebrow': 'Who we work for',
      'who.title': 'Three ways to work with us',
      'who.lead': 'The same team, three different fits depending on who calls.',
      'who.a1.title': 'Agencies',
      'who.a1.text': 'We are your local partner in the Penedès: on-the-ground production, vetted suppliers, venue scouting and activities you can resell under your own brand.',
      'who.a1.i1': 'Executive production on site',
      'who.a1.i2': 'Venue scouting and booking',
      'who.a1.i3': 'White-label activities',
      'who.a2.title': 'Venues',
      'who.a2.text': 'Do you run a farmhouse, a winery or a singular space? We bring programme, activities and production to turn it into a corporate events destination.',
      'who.a2.i1': 'Turnkey activity programme',
      'who.a2.i2': 'Sales towards agencies and companies',
      'who.a2.i3': 'Production and on-site coordination',
      'who.a3.title': 'Companies',
      'who.a3.text': 'A convention, an incentive, a kick-off or a team day. One point of contact from briefing to post-event report.',
      'who.a3.i1': 'Conventions, incentives and kick-offs',
      'who.a3.i2': 'Team days and celebrations',
      'who.a3.i3': 'Fixed budget and a single contact',

      'svc.eyebrow': 'Services',
      'svc.title': 'What we do',
      'svc.lead': 'Book the whole thing, or just the piece you are missing.',
      'svc.s1.title': 'Full production',
      'svc.s1.text': 'We take on the entire event: planning, suppliers, timings, technical setup, build and same-day coordination.',
      'svc.s1.i1': 'Budget, timing and production plan',
      'svc.s1.i2': 'Catering, AV, furniture and transport',
      'svc.s1.i3': 'Permits, insurance and safety plan',
      'svc.s1.i4': 'On-site event direction',
      'svc.s2.title': 'Venues',
      'svc.s2.text': 'Our own spaces plus a network of farmhouses, wineries, hotels and natural settings across the Alt Penedès. We search, visit and negotiate.',
      'svc.s2.i1': 'Scouting against brief and budget',
      'svc.s2.i2': 'Technical visits and venue sheets',
      'svc.s2.i3': 'Booking, contract and venue relationship',
      'svc.s3.title': 'Activities and teams',
      'svc.s3.text': 'Our own and bespoke activities, from the human-tower workshop to vineyard treasure hunts and cooking challenges.',
      'svc.s3.i1': 'Human-tower workshop «Fent Pinya»',
      'svc.s3.i2': 'Treasure hunts and outdoor activities',
      'svc.s3.i3': 'Food experiences and tastings',
      'svc.s3.i4': 'Team dynamics with a clear objective',

      'ven.eyebrow': 'Venues',
      'ven.title': 'Our spaces in the Penedès',
      'ven.lead': 'We start with the two spaces we run directly, together with TeamTowers, and complete them with the partner network across the county.',
      'ven.v1.tag': 'Own space · TeamTowers',
      'ven.v1.title': 'The Masia',
      'ven.v1.text': 'A traditional Alt Penedès farmhouse in a rural setting, built for company days: indoor rooms to work in and outdoor space for activities, lunch and the hours after it. Can be combined with the human-tower workshop on the same day.',
      'ven.v1.s1': 'Company days',
      'ven.v1.s2': 'Indoor + outdoor',
      'ven.v1.s3': 'Rural setting',
      'ven.v1.s4': 'Capacity on request',
      'ven.v2.tag': 'Own space · TeamTowers',
      'ven.v2.title': 'The Castells Workshop',
      'ven.v2.text': 'A covered human-tower training hall adapted for corporate groups. It is the natural home of the «Fent Pinya» workshop: it runs rain or shine, with experienced casteller instructors and all safety equipment.',
      'ven.v2.s1': 'Indoor',
      'ven.v2.s2': 'Groups of 10 to 200',
      'ven.v2.s3': 'Safety equipment included',
      'ven.v2.s4': 'Expert instructors',
      'ven.v3.tag': 'Partner venue network',
      'ven.v3.title': 'Farmhouses, wineries and natural settings',
      'ven.v3.text': 'When the project calls for something else, we work with partner venues across the county: farmhouses, cava cellars and wineries open to visits, hotels with meeting rooms, and natural settings for outdoor activities. We send you three options with a fact sheet, photos and price.',
      'ven.v3.s1': 'Cava and wine cellars',
      'ven.v3.s2': 'Hotels with meeting rooms',
      'ven.v3.s3': 'Vineyards and nature',
      'ven.v3.s4': '40 min from Barcelona',
      'ven.note': 'Do you run a space in the Penedès and want to join the network? Get in touch.',

      'act.eyebrow': 'Activities',
      'act.title': 'Experiences that belong here',
      'act.lead': 'Our own activities and those of local partners, adapted to group size, language and objective.',
      'act.a1.title': 'Human-tower workshop «Fent Pinya»',
      'act.a1.text': 'Two hours to build a real human tower, with casteller instructors. The metaphor explains itself: base, trust, communication and a goal nobody reaches alone. A TeamTowers activity.',
      'act.a2.title': 'Vineyard treasure hunt',
      'act.a2.text': 'A route in teams through the vineyards and paths of the Penedès, with challenges on collaboration, orientation and local knowledge.',
      'act.a3.title': 'Cooking challenge',
      'act.a3.text': 'A Masterchef-style format with local produce: teams cook, present and share. It ends at the table, which is where the day is really closed.',
      'act.a4.title': 'Cava and wine tasting',
      'act.a4.text': 'A guided tasting at the winery or the masia, on its own or as the closing of another activity. Available in Catalan, Spanish and English.',
      'act.a5.title': 'Outdoor activities',
      'act.a5.text': 'Walks, cycling, orienteering and team games in the county’s natural surroundings, with logistics and safety support.',
      'act.a6.title': 'Bespoke',
      'act.a6.text': 'If you have a specific goal — merging two teams, launching a project, closing a cycle — we design the activity from scratch.',

      'proc.eyebrow': 'How we work',
      'proc.title': 'From the call to the event',
      'proc.p1.title': 'Briefing',
      'proc.p1.text': 'One conversation: how many of you, what date, what budget and what you want to happen. No commitment.',
      'proc.p2.title': 'Proposal',
      'proc.p2.text': 'We send venue options, programme and a fixed budget. Usually within 48–72 working hours.',
      'proc.p3.title': 'Production',
      'proc.p3.text': 'Bookings, suppliers, timing, permits and a plan B. A single contact and everything documented in writing.',
      'proc.p4.title': 'The day and after',
      'proc.p4.text': 'We run the event on site and then send you the financial close and participant feedback.',

      'exp.eyebrow': 'Experience',
      'exp.title': 'Where we come from',
      'exp.lead': 'Events Penedès grows out of the TeamTowers team, running team workshops and events from Vilafranca del Penedès since 2005.',
      'exp.s1': 'Year the «Fent Pinya» workshop started',
      'exp.s2': 'People who have taken part in the workshops',
      'exp.s3': 'Organisations served',
      'exp.s4': 'Working languages',
      'exp.note': 'Figures cover TeamTowers activity (teamtowers.eu) since 2005. Events Penedès is the brand under which we offer event production and venues in the county.',

      'cta.eyebrow': 'Contact',
      'cta.title': 'Tell us about your event',
      'cta.lead': 'We reply within 24 working hours with a first take on venues and budget.',
      'cta.i.mail': 'Email',
      'cta.i.phone': 'Phone',
      'cta.i.place': 'Where we are',
      'cta.i.place.v': 'Vilafranca del Penedès, Barcelona · 40 min from Barcelona and the airport',
      'cta.i.lang': 'Languages',
      'cta.i.lang.v': 'Català · Castellano · English',
      'cta.f.name': 'Name',
      'cta.f.org': 'Company or agency',
      'cta.f.mail': 'Email',
      'cta.f.phone': 'Phone',
      'cta.f.people': 'Number of people',
      'cta.f.date': 'Approximate date',
      'cta.f.type': 'Type of event',
      'cta.f.t1': 'Team day / team building',
      'cta.f.t2': 'Convention or kick-off',
      'cta.f.t3': 'Incentive',
      'cta.f.t4': 'Company celebration',
      'cta.f.t5': 'I am an agency looking for a local partner',
      'cta.f.t6': 'Other',
      'cta.f.msg': 'Tell us more',
      'cta.f.send': 'Send request',
      'cta.f.note': 'Submitting opens your email client with the details. If you prefer, write directly to hola@eventspenedes.com.',

      'foot.tagline': 'Event production, venues and activities in the Alt Penedès.',
      'foot.h1': 'Sections',
      'foot.h2': 'Contact',
      'foot.city': 'Vilafranca del Penedès, Barcelona',
      'foot.h3': 'Ecosystem',
      'foot.rights': '© 2026 Events Penedès · A TeamTowers Humà project',
      'foot.prov': 'Provisional site — the full version is on its way.'
    }
  };

  var META = {
    es: {
      title: 'Events Penedès · Producción de eventos, localizaciones y actividades en el Alt Penedès',
      desc: 'Producción integral de eventos corporativos en el Alt Penedès: localizaciones con carácter, actividades de equipo y gestión completa para agencias, espacios y empresas.'
    },
    ca: {
      title: 'Events Penedès · Producció d’esdeveniments, localitzacions i activitats a l’Alt Penedès',
      desc: 'Producció integral d’esdeveniments corporatius a l’Alt Penedès: localitzacions amb caràcter, activitats d’equip i gestió completa per a agències, espais i empreses.'
    },
    en: {
      title: 'Events Penedès · Event production, venues and activities in the Alt Penedès',
      desc: 'Full corporate event production in the Alt Penedès: characterful venues, team activities and end-to-end management for agencies, venues and companies.'
    }
  };

  var nodes = [];

  function collect() {
    var list = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      var key = el.getAttribute('data-i18n');
      nodes.push({ el: el, key: key });
      /* Snapshot del castellano tal como está escrito en el HTML */
      if (!(key in I18N.es)) {
        I18N.es[key] = el.innerHTML.trim();
      }
    }
  }

  function apply(lang) {
    var dict = I18N[lang] || I18N[DEFAULT];
    for (var i = 0; i < nodes.length; i++) {
      var txt = dict[nodes[i].key];
      if (typeof txt === 'string') {
        nodes[i].el.innerHTML = txt;
      }
    }

    document.documentElement.lang = lang;

    var meta = META[lang] || META[DEFAULT];
    document.title = meta.title;
    setMeta('name', 'description', meta.desc);
    setMeta('property', 'og:title', meta.title);
    setMeta('property', 'og:description', meta.desc);
    setMeta('property', 'og:locale', lang === 'ca' ? 'ca_ES' : (lang === 'en' ? 'en_GB' : 'es_ES'));

    var btns = document.querySelectorAll('.lang__btn');
    for (var j = 0; j < btns.length; j++) {
      btns[j].setAttribute('aria-pressed', String(btns[j].getAttribute('data-lang') === lang));
    }

    try { localStorage.setItem(STORE_KEY, lang); } catch (e) { /* modo privado */ }
  }

  function setMeta(attr, name, value) {
    var el = document.querySelector('meta[' + attr + '="' + name + '"]');
    if (el) { el.setAttribute('content', value); }
  }

  function initialLang() {
    var stored = null;
    try { stored = localStorage.getItem(STORE_KEY); } catch (e) { /* noop */ }
    if (stored && I18N[stored]) { return stored; }

    var nav = (navigator.language || '').toLowerCase();
    if (nav.indexOf('ca') === 0) { return 'ca'; }
    if (nav.indexOf('es') === 0) { return 'es'; }
    if (nav.indexOf('en') === 0) { return 'en'; }
    return DEFAULT;
  }

  function initLangButtons() {
    var btns = document.querySelectorAll('.lang__btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function (ev) {
        apply(ev.currentTarget.getAttribute('data-lang'));
      });
    }
  }

  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('nav');
    if (!toggle || !nav) { return; }

    toggle.addEventListener('click', function () {
      var open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!open));
      toggle.setAttribute('aria-expanded', String(!open));
    });

    nav.addEventListener('click', function (ev) {
      if (ev.target.tagName === 'A') {
        nav.setAttribute('data-open', 'false');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function init() {
    collect();
    initLangButtons();
    initNav();
    apply(initialLang());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
