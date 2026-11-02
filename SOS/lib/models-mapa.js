/* GENERAT per SOS/tools/build-models-mapa.js des de SOS/index.html (DYNAMICS «negoci»,
   PROTOTYPE_MAPS i CRITICAL_ACTIVITIES de la Matriu) · no s'edita a mà. Els mapes tipus del SOS en
   tres llengües i els catorze sectors en català i castellà: la base de coneixement de fluxos de valor. */
(function (arrel, fabrica) {
  if (typeof module === 'object' && module.exports) module.exports = fabrica();
  else arrel.ModelsMapa = fabrica();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var MODELS = [
   {
    "id": "negoci",
    "icona": "🏪",
    "paraules": "negocio negoci empresa pyme pime tienda botiga clientes clients ventas vendes",
    "ca": {
     "nom": "El meu negoci",
     "diu": "El mapa de valor del teu negoci: qui hi dona què, i què torna.",
     "roles": [
      "El negoci",
      "Clients",
      "Equip",
      "Proveïdors",
      "Aliats",
      "Qui et recomana"
     ],
     "pairs": [
      [
       "El negoci",
       "Clients",
       "tangible",
       "producte o servei",
       "tangible",
       "pagament"
      ],
      [
       "Clients",
       "El negoci",
       "intangible",
       "opinió i recomanació",
       "intangible",
       "confiança"
      ],
      [
       "Equip",
       "El negoci",
       "tangible",
       "hores de feina",
       "tangible",
       "sou"
      ],
      [
       "Proveïdors",
       "El negoci",
       "tangible",
       "matèria primera",
       "tangible",
       "pagament"
      ],
      [
       "Aliats",
       "Clients",
       "intangible",
       "recomanació",
       "intangible",
       "reconeixement"
      ],
      [
       "Qui et recomana",
       "El negoci",
       "intangible",
       "clients nous i confiança",
       "intangible",
       "reconeixement i novetats abans que ningú"
      ],
      [
       "Equip",
       "Clients",
       "intangible",
       "tracte i consell",
       "intangible",
       "idees de millora"
      ]
     ],
     "passos": [
      "Dibuixar el mapa ideal",
      "Apuntar el que passa",
      "Comparar real i ideal",
      "Decidir el següent pas"
     ],
     "centre": "El negoci",
     "bona": "El que no es paga (recomanacions, confiança, idees) és el que fa créixer un negoci. Posa-ho al mapa."
    },
    "es": {
     "nom": "Mi negocio",
     "diu": "El mapa de valor de tu negocio: quién da qué y qué vuelve.",
     "roles": [
      "El negocio",
      "Clientes",
      "Equipo",
      "Proveedores",
      "Aliados",
      "Quien te recomienda"
     ],
     "pairs": [
      [
       "El negocio",
       "Clientes",
       "tangible",
       "producto o servicio",
       "tangible",
       "pago"
      ],
      [
       "Clientes",
       "El negocio",
       "intangible",
       "opinión y recomendación",
       "intangible",
       "confianza"
      ],
      [
       "Equipo",
       "El negocio",
       "tangible",
       "horas de trabajo",
       "tangible",
       "sueldo"
      ],
      [
       "Proveedores",
       "El negocio",
       "tangible",
       "materia prima",
       "tangible",
       "pago"
      ],
      [
       "Aliados",
       "Clientes",
       "intangible",
       "recomendación",
       "intangible",
       "reconocimiento"
      ],
      [
       "Quien te recomienda",
       "El negocio",
       "intangible",
       "clientes nuevos y confianza",
       "intangible",
       "reconocimiento y novedades antes que nadie"
      ],
      [
       "Equipo",
       "Clientes",
       "intangible",
       "trato y consejo",
       "intangible",
       "ideas de mejora"
      ]
     ],
     "passos": [
      "Dibujar el mapa ideal",
      "Apuntar lo que pasa",
      "Comparar real e ideal",
      "Decidir el siguiente paso"
     ],
     "centre": "El negocio",
     "bona": "Lo que no se paga (recomendaciones, confianza, ideas) es lo que hace crecer un negocio. Ponlo en el mapa."
    },
    "en": {
     "nom": "My business",
     "diu": "The value map of your business: who gives what, and what comes back.",
     "roles": [
      "The business",
      "Customers",
      "Team",
      "Suppliers",
      "Allies"
     ],
     "pairs": [
      [
       "The business",
       "Customers",
       "tangible",
       "product or service",
       "tangible",
       "payment"
      ],
      [
       "Customers",
       "The business",
       "intangible",
       "feedback and referrals",
       "intangible",
       "trust"
      ],
      [
       "Team",
       "The business",
       "tangible",
       "working hours",
       "tangible",
       "salary"
      ],
      [
       "Suppliers",
       "The business",
       "tangible",
       "raw materials",
       "tangible",
       "payment"
      ],
      [
       "Allies",
       "Customers",
       "intangible",
       "referral",
       "intangible",
       "recognition"
      ]
     ]
    },
    "veda": {
     "clau": [
      "**Qui et recomana → el negoci: clients nous i confiança.** És el canal més barat i el que més dura; si no és al mapa, ningú el cuida.",
      "**Equip → clients: tracte i consell.** El que fa tornar un client és com se l'ha tractat, no el producte sol.",
      "**Clients → el negoci: opinió.** Sense aquest retorn, el negoci decideix a cegues."
     ],
     "preguntes": [
      "D'on va venir el teu últim client bo? Qui te'l va enviar?",
      "Què et diuen els clients quan alguna cosa no els agrada, i a qui li ho diuen?",
      "Què rep el teu equip, a més del sou, que el fa quedar-se?"
     ],
     "falta": [
      "Qui recomana: gairebé mai es dibuixa i és qui porta la meitat dels clients nous.",
      "El que torna a l'equip a més del sou: reconeixement, aprenentatge, veu en les decisions."
     ]
    }
   },
   {
    "id": "servei_proximitat",
    "icona": "🛎",
    "paraules": "barrio barri vecinos veïns reparaciones reparacions atención atenció domicilio proximidad proximitat",
    "ca": {
     "nom": "Servei de proximitat",
     "diu": "Servei que s'ofereix directament a la comunitat local (educació, cures, reparacions, atenció).",
     "roles": [
      "Persones oferents",
      "Persones usuàries",
      "Nucli gestor",
      "Referent territorial",
      "Ecosistema aliat",
      "Qui ho recomana al barri"
     ],
     "pairs": [
      [
       "Persones oferents",
       "Persones usuàries",
       "tangible",
       "servei directe",
       "tangible",
       "pagament o hores del banc de temps"
      ],
      [
       "Persones oferents",
       "Nucli gestor",
       "tangible",
       "disponibilitat i qualitat",
       "intangible",
       "coordinació, formació i cura"
      ],
      [
       "Persones usuàries",
       "Nucli gestor",
       "intangible",
       "reputació i vincle",
       "intangible",
       "garantia i resolució d'incidències"
      ],
      [
       "Referent territorial",
       "Nucli gestor",
       "tangible",
       "legitimitat i espai",
       "tangible",
       "memòria i indicadors d'ús"
      ],
      [
       "Ecosistema aliat",
       "Nucli gestor",
       "tangible",
       "derivacions",
       "intangible",
       "coneixement i confiança"
      ],
      [
       "Ecosistema aliat",
       "Persones usuàries",
       "intangible",
       "informació del servei",
       "intangible",
       "necessitats detectades"
      ],
      [
       "Referent territorial",
       "Persones usuàries",
       "tangible",
       "difusió pública",
       "intangible",
       "valoració del servei"
      ],
      [
       "Persones oferents",
       "Ecosistema aliat",
       "intangible",
       "pràctica reflexiva compartida",
       "intangible",
       "criteris i bones pràctiques"
      ],
      [
       "Qui ho recomana al barri",
       "Nucli gestor",
       "intangible",
       "persones noves que confien",
       "intangible",
       "visibilitat i agraïment"
      ]
     ],
     "passos": [
      "Definir el servei mínim viable",
      "Formar el primer equip d'oferents",
      "Publicar al banc de temps",
      "Primeres 10 prestacions",
      "Retorn i ajust",
      "Ampliació territorial"
     ],
     "centre": "Nucli gestor",
     "bona": "Un servei de proximitat creix de boca-orella: qui el recomana és part de la xarxa."
    },
    "es": {
     "nom": "Servicio de proximidad",
     "diu": "Servicio que se ofrece directamente a la comunidad local (educación, cuidados, reparaciones, atención).",
     "roles": [
      "Personas que ofrecen",
      "Personas usuarias",
      "Núcleo gestor",
      "Referente territorial",
      "Ecosistema aliado",
      "Quien lo recomienda en el barrio"
     ],
     "pairs": [
      [
       "Personas que ofrecen",
       "Personas usuarias",
       "tangible",
       "servicio directo",
       "tangible",
       "pago u horas del banco de tiempo"
      ],
      [
       "Personas que ofrecen",
       "Núcleo gestor",
       "tangible",
       "disponibilidad y calidad",
       "intangible",
       "coordinación, formación y cuidado"
      ],
      [
       "Personas usuarias",
       "Núcleo gestor",
       "intangible",
       "reputación y vínculo",
       "intangible",
       "garantía y resolución de incidencias"
      ],
      [
       "Referente territorial",
       "Núcleo gestor",
       "tangible",
       "legitimidad y espacio",
       "tangible",
       "memoria e indicadores de uso"
      ],
      [
       "Ecosistema aliado",
       "Núcleo gestor",
       "tangible",
       "derivaciones",
       "intangible",
       "conocimiento y confianza"
      ],
      [
       "Ecosistema aliado",
       "Personas usuarias",
       "intangible",
       "información del servicio",
       "intangible",
       "necesidades detectadas"
      ],
      [
       "Referente territorial",
       "Personas usuarias",
       "tangible",
       "difusión pública",
       "intangible",
       "valoración del servicio"
      ],
      [
       "Personas que ofrecen",
       "Ecosistema aliado",
       "intangible",
       "práctica reflexiva compartida",
       "intangible",
       "criterios y buenas prácticas"
      ],
      [
       "Quien lo recomienda en el barrio",
       "Núcleo gestor",
       "intangible",
       "personas nuevas que confían",
       "intangible",
       "visibilidad y agradecimiento"
      ]
     ],
     "passos": [
      "Definir el servicio mínimo viable",
      "Formar el primer equipo de oferentes",
      "Publicar en el banco de tiempo",
      "Primeras 10 prestaciones",
      "Retorno y ajuste",
      "Ampliación territorial"
     ],
     "centre": "Núcleo gestor",
     "bona": "Un servicio de proximidad crece por el boca a boca: quien lo recomienda es parte de la red."
    },
    "en": {
     "nom": "Local service",
     "diu": "A service offered directly to the local community (education, care, repairs, support).",
     "roles": [
      "Providers",
      "Users",
      "Core team",
      "Local authority",
      "Partner ecosystem"
     ],
     "pairs": [
      [
       "Providers",
       "Users",
       "tangible",
       "direct service",
       "tangible",
       "payment or time-bank hours"
      ],
      [
       "Providers",
       "Core team",
       "tangible",
       "availability and quality",
       "intangible",
       "coordination, training and care"
      ],
      [
       "Users",
       "Core team",
       "intangible",
       "reputation and bond",
       "intangible",
       "guarantee and issue resolution"
      ],
      [
       "Local authority",
       "Core team",
       "tangible",
       "legitimacy and space",
       "tangible",
       "report and usage indicators"
      ],
      [
       "Partner ecosystem",
       "Core team",
       "tangible",
       "referrals",
       "intangible",
       "knowledge and trust"
      ],
      [
       "Partner ecosystem",
       "Users",
       "intangible",
       "service information",
       "intangible",
       "needs spotted"
      ],
      [
       "Local authority",
       "Users",
       "tangible",
       "public promotion",
       "intangible",
       "service rating"
      ],
      [
       "Providers",
       "Partner ecosystem",
       "intangible",
       "shared reflective practice",
       "intangible",
       "criteria and good practice"
      ]
     ]
    },
    "veda": {
     "clau": [
      "**Qui ho recomana al barri → nucli gestor: persones noves que confien.** Un servei de proximitat viu del boca-orella.",
      "**Persones usuàries ↔ persones oferents: confiança.** Sense confiança, la relació no es repeteix.",
      "**Referent territorial → nucli gestor: legitimitat.** Obre portes que el servei sol no obre."
     ],
     "preguntes": [
      "Com t'ha trobat la darrera persona que ha fet servir el servei?",
      "Qui al barri parla bé de vosaltres sense que li ho demaneu?",
      "Què fa que una persona torni a fer servir el servei?"
     ],
     "falta": [
      "El retorn a qui ofereix el servei: reconeixement i continuïtat, no només pagament.",
      "Qui fa de pont amb el barri (l'escola, la farmàcia, l'associació)."
     ]
    }
   },
   {
    "id": "producte_artesa",
    "icona": "🧶",
    "paraules": "artesano artesà taller cerámica ceràmica manufactura fabricamos fabriquem obrador elaboramos elaborem bodega celler vino vi",
    "ca": {
     "nom": "Producte artesà / manufactura",
     "diu": "Producció física en petit format, taller propi o compartit.",
     "roles": [
      "Artesans/es",
      "Proveïdors locals",
      "Punt de venda",
      "Clientes",
      "Comunitat i formació",
      "Qui ho explica (premsa, xarxes)"
     ],
     "pairs": [
      [
       "Proveïdors locals",
       "Artesans/es",
       "tangible",
       "matèria primera km0",
       "tangible",
       "comandes estables i pagament just"
      ],
      [
       "Artesans/es",
       "Punt de venda",
       "tangible",
       "producte acabat",
       "tangible",
       "liquidació de vendes"
      ],
      [
       "Punt de venda",
       "Clientes",
       "tangible",
       "venda i assessorament",
       "tangible",
       "ingressos"
      ],
      [
       "Clientes",
       "Artesans/es",
       "intangible",
       "retorn i encàrrecs a mida",
       "intangible",
       "història i traçabilitat de la peça"
      ],
      [
       "Artesans/es",
       "Comunitat i formació",
       "intangible",
       "ofici i tallers",
       "intangible",
       "aprenents i renovació"
      ],
      [
       "Comunitat i formació",
       "Clientes",
       "intangible",
       "cultura del fet a mà",
       "intangible",
       "demanda que valora l'ofici"
      ],
      [
       "Punt de venda",
       "Proveïdors locals",
       "tangible",
       "previsió de demanda",
       "tangible",
       "estoc i terminis"
      ],
      [
       "Comunitat i formació",
       "Proveïdors locals",
       "intangible",
       "coneixement del material",
       "tangible",
       "restes i materials per practicar"
      ],
      [
       "Qui ho explica (premsa, xarxes)",
       "Artesans/es",
       "intangible",
       "relat i visibilitat",
       "intangible",
       "històries i accés al taller"
      ]
     ],
     "passos": [
      "Prototipar 3 referències",
      "Muntar el taller",
      "Preus i marges",
      "Primer canal de venda",
      "Iterar amb el retorn de la clientela",
      "Escalar producció"
     ],
     "centre": "Artesans/es",
     "bona": "L'ofici es ven pel relat: qui l'explica fora del taller hi aporta tant com el punt de venda."
    },
    "es": {
     "nom": "Producto artesano / manufactura",
     "diu": "Producción física en pequeño formato, taller propio o compartido.",
     "roles": [
      "Artesanos/as",
      "Proveedores locales",
      "Punto de venta",
      "Clientes",
      "Comunidad y formación",
      "Quien lo cuenta (prensa, redes)"
     ],
     "pairs": [
      [
       "Proveedores locales",
       "Artesanos/as",
       "tangible",
       "materia prima de proximidad",
       "tangible",
       "pedidos estables y pago justo"
      ],
      [
       "Artesanos/as",
       "Punto de venta",
       "tangible",
       "producto acabado",
       "tangible",
       "liquidación de ventas"
      ],
      [
       "Punto de venta",
       "Clientes",
       "tangible",
       "venta y asesoramiento",
       "tangible",
       "ingresos"
      ],
      [
       "Clientes",
       "Artesanos/as",
       "intangible",
       "opinión y encargos a medida",
       "intangible",
       "historia y trazabilidad de la pieza"
      ],
      [
       "Artesanos/as",
       "Comunidad y formación",
       "intangible",
       "oficio y talleres",
       "intangible",
       "aprendices y relevo"
      ],
      [
       "Comunidad y formación",
       "Clientes",
       "intangible",
       "cultura de lo hecho a mano",
       "intangible",
       "demanda que valora el oficio"
      ],
      [
       "Punto de venta",
       "Proveedores locales",
       "tangible",
       "previsión de demanda",
       "tangible",
       "stock y plazos"
      ],
      [
       "Comunidad y formación",
       "Proveedores locales",
       "intangible",
       "conocimiento del material",
       "tangible",
       "restos y materiales para practicar"
      ],
      [
       "Quien lo cuenta (prensa, redes)",
       "Artesanos/as",
       "intangible",
       "relato y visibilidad",
       "intangible",
       "historias y acceso al taller"
      ]
     ],
     "passos": [
      "Prototipar 3 referencias",
      "Montar el taller",
      "Precios y márgenes",
      "Canal de venta piloto",
      "Iterar con lo que dice la clientela",
      "Escalar la producción"
     ],
     "centre": "Artesanos/as",
     "bona": "El oficio se vende por el relato: quien lo cuenta fuera del taller aporta tanto como el punto de venta."
    },
    "en": {
     "nom": "Craft product / manufacturing",
     "diu": "Small-scale physical production, own or shared workshop.",
     "roles": [
      "Makers",
      "Local suppliers",
      "Shop",
      "Customers",
      "Community and training"
     ],
     "pairs": [
      [
       "Local suppliers",
       "Makers",
       "tangible",
       "local raw materials",
       "tangible",
       "steady orders and fair pay"
      ],
      [
       "Makers",
       "Shop",
       "tangible",
       "finished product",
       "tangible",
       "sales settlement"
      ],
      [
       "Shop",
       "Customers",
       "tangible",
       "sales and advice",
       "tangible",
       "income"
      ],
      [
       "Customers",
       "Makers",
       "intangible",
       "feedback and custom orders",
       "intangible",
       "the piece's story and traceability"
      ],
      [
       "Makers",
       "Community and training",
       "intangible",
       "craft and workshops",
       "intangible",
       "apprentices and renewal"
      ],
      [
       "Community and training",
       "Customers",
       "intangible",
       "handmade culture",
       "intangible",
       "demand that values the craft"
      ],
      [
       "Shop",
       "Local suppliers",
       "tangible",
       "demand forecast",
       "tangible",
       "stock and lead times"
      ],
      [
       "Community and training",
       "Local suppliers",
       "intangible",
       "knowledge of materials",
       "tangible",
       "offcuts and practice materials"
      ]
     ]
    },
    "veda": {
     "clau": [
      "**Qui ho explica → artesans: relat i visibilitat.** L'ofici es ven pel relat de com es fa.",
      "**Proveïdors locals ↔ artesans: matèria i compromís.** La qualitat comença abans del taller.",
      "**Comunitat i formació → artesans: relleu.** Sense aprenents, l'ofici s'acaba amb qui el fa."
     ],
     "preguntes": [
      "Qui explica la teva feina quan tu no hi ets?",
      "Què et donen els teus proveïdors a més del material?",
      "Qui aprèn de tu, i què et torna?"
     ],
     "falta": [
      "Qui explica l'ofici fora del taller (premsa, xarxes, botigues que en parlen).",
      "El retorn a la comunitat que t'ha format o et forma."
     ]
    }
   },
   {
    "id": "servei_tecnic",
    "icona": "💼",
    "paraules": "consultoría consultoria consultor consultora asesoría assessoria estrategia estratègia ingeniería enginyeria despacho despatx proyectos projectes",
    "ca": {
     "nom": "Consultoria / servei tècnic",
     "diu": "Consultoria, disseny, IT, arquitectura, assessoria — projecte per projecte.",
     "roles": [
      "Consultors/es",
      "Clients institucionals",
      "Clients privats",
      "Xarxa de partners",
      "Nucli operatiu",
      "Antics clients"
     ],
     "pairs": [
      [
       "Consultors/es",
       "Clients institucionals",
       "tangible",
       "entregable especialitzat",
       "tangible",
       "honoraris"
      ],
      [
       "Consultors/es",
       "Clients privats",
       "tangible",
       "entregable especialitzat",
       "tangible",
       "honoraris"
      ],
      [
       "Xarxa de partners",
       "Consultors/es",
       "intangible",
       "revisió entre iguals",
       "tangible",
       "sub-encàrrecs"
      ],
      [
       "Nucli operatiu",
       "Consultors/es",
       "intangible",
       "administració i comercial",
       "tangible",
       "% de facturació"
      ],
      [
       "Clients institucionals",
       "Nucli operatiu",
       "tangible",
       "licitacions i marc de contractació",
       "tangible",
       "documentació i justificació"
      ],
      [
       "Clients privats",
       "Xarxa de partners",
       "intangible",
       "recomanació",
       "tangible",
       "capacitat extra quan cal"
      ],
      [
       "Nucli operatiu",
       "Xarxa de partners",
       "tangible",
       "contractes marc",
       "intangible",
       "fiabilitat i compliment"
      ],
      [
       "Clients institucionals",
       "Clients privats",
       "intangible",
       "cas d'ús públic replicable",
       "intangible",
       "validació de mercat"
      ],
      [
       "Antics clients",
       "Consultors/es",
       "intangible",
       "referències i casos",
       "intangible",
       "seguiment i novetats"
      ]
     ],
     "passos": [
      "Definir 2-3 verticals",
      "Cas d'ús de referència",
      "Portfoli i propostes tipus",
      "Primer contracte",
      "Bucle de recomanació",
      "Estabilitzar cartera"
     ],
     "centre": "Consultors/es",
     "bona": "Al servei tècnic, el següent client arriba per un cas que ja ha funcionat: cuida qui ja hi ha passat."
    },
    "es": {
     "nom": "Consultoría / servicio técnico",
     "diu": "Consultoría, diseño, IT, arquitectura, asesoría — proyecto a proyecto.",
     "roles": [
      "Consultores/as",
      "Clientes institucionales",
      "Clientes privados",
      "Red de partners",
      "Núcleo operativo",
      "Antiguos clientes"
     ],
     "pairs": [
      [
       "Consultores/as",
       "Clientes institucionales",
       "tangible",
       "entregable especializado",
       "tangible",
       "honorarios"
      ],
      [
       "Consultores/as",
       "Clientes privados",
       "tangible",
       "entregable especializado",
       "tangible",
       "honorarios"
      ],
      [
       "Red de partners",
       "Consultores/as",
       "intangible",
       "revisión entre iguales",
       "tangible",
       "subencargos"
      ],
      [
       "Núcleo operativo",
       "Consultores/as",
       "intangible",
       "administración y comercial",
       "tangible",
       "% de la facturación"
      ],
      [
       "Clientes institucionales",
       "Núcleo operativo",
       "tangible",
       "licitaciones y marco de contratación",
       "tangible",
       "documentación y justificación"
      ],
      [
       "Clientes privados",
       "Red de partners",
       "intangible",
       "recomendación",
       "tangible",
       "capacidad extra cuando hace falta"
      ],
      [
       "Núcleo operativo",
       "Red de partners",
       "tangible",
       "contratos marco",
       "intangible",
       "fiabilidad y cumplimiento"
      ],
      [
       "Clientes institucionales",
       "Clientes privados",
       "intangible",
       "caso de uso público replicable",
       "intangible",
       "validación de mercado"
      ],
      [
       "Antiguos clientes",
       "Consultores/as",
       "intangible",
       "referencias y casos",
       "intangible",
       "seguimiento y novedades"
      ]
     ],
     "passos": [
      "Definir 2-3 verticales",
      "Caso de uso de referencia",
      "Portfolio y propuestas tipo",
      "Primer contrato",
      "Bucle de recomendación",
      "Estabilizar la cartera"
     ],
     "centre": "Consultores/as",
     "bona": "En el servicio técnico, el siguiente cliente llega por un caso que ya ha funcionado: cuida a quien ya ha pasado por ahí."
    },
    "en": {
     "nom": "Consulting / technical service",
     "diu": "Consulting, design, IT, architecture, advisory — project by project.",
     "roles": [
      "Consultants",
      "Public-sector clients",
      "Private clients",
      "Partner network",
      "Operations core"
     ],
     "pairs": [
      [
       "Consultants",
       "Public-sector clients",
       "tangible",
       "specialised deliverable",
       "tangible",
       "fees"
      ],
      [
       "Consultants",
       "Private clients",
       "tangible",
       "specialised deliverable",
       "tangible",
       "fees"
      ],
      [
       "Partner network",
       "Consultants",
       "intangible",
       "peer review",
       "tangible",
       "subcontracts"
      ],
      [
       "Operations core",
       "Consultants",
       "intangible",
       "admin and sales",
       "tangible",
       "% of billing"
      ],
      [
       "Public-sector clients",
       "Operations core",
       "tangible",
       "tenders and procurement framework",
       "tangible",
       "documentation and reporting"
      ],
      [
       "Private clients",
       "Partner network",
       "intangible",
       "referral",
       "tangible",
       "extra capacity when needed"
      ],
      [
       "Operations core",
       "Partner network",
       "tangible",
       "framework contracts",
       "intangible",
       "reliability and delivery"
      ],
      [
       "Public-sector clients",
       "Private clients",
       "intangible",
       "replicable public use case",
       "intangible",
       "market validation"
      ]
     ]
    },
    "veda": {
     "clau": [
      "**Antics clients → consultors: referències i casos.** El següent encàrrec arriba per un cas que ha funcionat.",
      "**Xarxa de partners ↔ consultors: encàrrecs i coneixement.** Ningú cobreix tot sol tots els fronts.",
      "**Clients → consultors: el problema ben explicat.** Un encàrrec mal dit és un projecte que es torça."
     ],
     "preguntes": [
      "Quin client antic et recomanaria avui sense dubtar? Quan hi vas parlar per última vegada?",
      "Amb qui comparteixes encàrrecs, i què et dona a part dels diners?",
      "Què aprèn l'equip de cada projecte, i on queda escrit?"
     ],
     "falta": [
      "El seguiment de qui ja ha estat client: és qui més recomana i qui menys es cuida.",
      "El coneixement que torna de cada projecte a l'equip."
     ]
    }
   },
   {
    "id": "producte_digital",
    "icona": "📱",
    "paraules": "app aplicación aplicació software plataforma saas digital usuarios usuaris suscripción subscripció online",
    "ca": {
     "nom": "Producte digital / SaaS",
     "diu": "App, plataforma, servei online — usuaris massius o de nínxol.",
     "roles": [
      "Equip producte",
      "Usuaris/es",
      "Comunitat contributora",
      "Patrocini i inversió",
      "Infraestructura",
      "Qui ho recomana"
     ],
     "pairs": [
      [
       "Equip producte",
       "Usuaris/es",
       "tangible",
       "funcionalitat",
       "tangible",
       "subscripció o donació"
      ],
      [
       "Usuaris/es",
       "Comunitat contributora",
       "intangible",
       "retorn i casos d'ús",
       "intangible",
       "suport entre iguals"
      ],
      [
       "Comunitat contributora",
       "Equip producte",
       "tangible",
       "PRs, traduccions i docs",
       "intangible",
       "governança oberta i mèrit"
      ],
      [
       "Patrocini i inversió",
       "Equip producte",
       "tangible",
       "capital",
       "intangible",
       "tracció i mètriques"
      ],
      [
       "Infraestructura",
       "Equip producte",
       "tangible",
       "servidors i dades",
       "tangible",
       "pagament de l'allotjament"
      ],
      [
       "Usuaris/es",
       "Patrocini i inversió",
       "intangible",
       "prova d'ús real",
       "tangible",
       "finançament que abarateix el servei"
      ],
      [
       "Comunitat contributora",
       "Infraestructura",
       "tangible",
       "rèpliques i mirroring",
       "tangible",
       "accés i quotes"
      ],
      [
       "Equip producte",
       "Comunitat contributora",
       "intangible",
       "full de ruta obert",
       "intangible",
       "prioritats de la base"
      ],
      [
       "Qui ho recomana",
       "Equip producte",
       "intangible",
       "usuaris nous i ressenyes",
       "intangible",
       "accés anticipat i reconeixement"
      ]
     ],
     "passos": [
      "Prototip de fum",
      "Pàgina d'entrada i llista d'espera",
      "Primer usuari real",
      "Iterar amb el retorn de la gent",
      "Model de monetització",
      "Escalar amb la comunitat"
     ],
     "centre": "Equip producte",
     "bona": "Un producte digital viu de les ressenyes i de qui el recomana: dona-li accés abans que a ningú."
    },
    "es": {
     "nom": "Producto digital / SaaS",
     "diu": "App, plataforma, servicio online — usuarios masivos o de nicho.",
     "roles": [
      "Equipo de producto",
      "Usuarios/as",
      "Comunidad que contribuye",
      "Patrocinio e inversión",
      "Infraestructura",
      "Quien lo recomienda"
     ],
     "pairs": [
      [
       "Equipo de producto",
       "Usuarios/as",
       "tangible",
       "funcionalidad",
       "tangible",
       "suscripción o donación"
      ],
      [
       "Usuarios/as",
       "Comunidad que contribuye",
       "intangible",
       "opiniones y casos de uso",
       "intangible",
       "apoyo entre iguales"
      ],
      [
       "Comunidad que contribuye",
       "Equipo de producto",
       "tangible",
       "mejoras, traducciones y documentación",
       "intangible",
       "gobernanza abierta y mérito"
      ],
      [
       "Patrocinio e inversión",
       "Equipo de producto",
       "tangible",
       "capital",
       "intangible",
       "tracción y métricas"
      ],
      [
       "Infraestructura",
       "Equipo de producto",
       "tangible",
       "servidores y datos",
       "tangible",
       "pago del alojamiento"
      ],
      [
       "Usuarios/as",
       "Patrocinio e inversión",
       "intangible",
       "prueba de uso real",
       "tangible",
       "financiación que abarata el servicio"
      ],
      [
       "Comunidad que contribuye",
       "Infraestructura",
       "tangible",
       "réplicas y espejos",
       "tangible",
       "acceso y cuotas"
      ],
      [
       "Equipo de producto",
       "Comunidad que contribuye",
       "intangible",
       "hoja de ruta abierta",
       "intangible",
       "prioridades de la base"
      ],
      [
       "Quien lo recomienda",
       "Equipo de producto",
       "intangible",
       "usuarios nuevos y reseñas",
       "intangible",
       "acceso anticipado y reconocimiento"
      ]
     ],
     "passos": [
      "Prototipo de humo",
      "Página de entrada y lista de espera",
      "Primer usuario real",
      "Iterar con lo que dice la gente",
      "Modelo de monetización",
      "Escalar con la comunidad"
     ],
     "centre": "Equipo de producto",
     "bona": "Un producto digital vive de las reseñas y de quien lo recomienda: dale acceso antes que a nadie."
    },
    "en": {
     "nom": "Digital product / SaaS",
     "diu": "App, platform, online service — mass or niche users.",
     "roles": [
      "Product team",
      "Users",
      "Contributor community",
      "Sponsors and investors",
      "Infrastructure"
     ],
     "pairs": [
      [
       "Product team",
       "Users",
       "tangible",
       "features",
       "tangible",
       "subscription or donation"
      ],
      [
       "Users",
       "Contributor community",
       "intangible",
       "feedback and use cases",
       "intangible",
       "peer support"
      ],
      [
       "Contributor community",
       "Product team",
       "tangible",
       "contributions, translations and docs",
       "intangible",
       "open governance and credit"
      ],
      [
       "Sponsors and investors",
       "Product team",
       "tangible",
       "capital",
       "intangible",
       "traction and metrics"
      ],
      [
       "Infrastructure",
       "Product team",
       "tangible",
       "servers and data",
       "tangible",
       "hosting payment"
      ],
      [
       "Users",
       "Sponsors and investors",
       "intangible",
       "proof of real use",
       "tangible",
       "funding that makes the service cheaper"
      ],
      [
       "Contributor community",
       "Infrastructure",
       "tangible",
       "replicas and mirrors",
       "tangible",
       "access and quotas"
      ],
      [
       "Product team",
       "Contributor community",
       "intangible",
       "open roadmap",
       "intangible",
       "grassroots priorities"
      ]
     ]
    },
    "veda": {
     "clau": [
      "**Qui ho recomana → equip de producte: usuaris nous i ressenyes.** El creixement orgànic és el que dura.",
      "**Comunitat contributora → equip: millores i suport entre usuaris.** Fa el producte millor que l'equip sol.",
      "**Usuaris → equip: ús i opinions.** Sense això, es construeix el que ningú demana."
     ],
     "preguntes": [
      "Per què el recomana qui el recomana?",
      "Qui respon les preguntes dels usuaris a part de vosaltres?",
      "Què reben a canvi les persones que contribueixen?"
     ],
     "falta": [
      "El reconeixement a qui contribueix: accés anticipat, nom als crèdits, veu en el que es fa.",
      "Qui ho recomana i per què."
     ]
    }
   },
   {
    "id": "cura_social",
    "icona": "💗",
    "paraules": "cuidado cures acompañamiento acompanyament mayores grans dependencia dependència familias famílies soledad soledat",
    "ca": {
     "nom": "Cura i acompanyament social",
     "diu": "Xarxa de cures, salut comunitària, acompanyament a persones vulnerables.",
     "roles": [
      "Persones cuidadores",
      "Persones cuidades",
      "Famílies",
      "Serveis socials/CAP",
      "Voluntariat",
      "Xarxa veïnal"
     ],
     "pairs": [
      [
       "Persones cuidadores",
       "Persones cuidades",
       "intangible",
       "acompanyament i escolta",
       "intangible",
       "vincle i sentit"
      ],
      [
       "Famílies",
       "Persones cuidadores",
       "tangible",
       "confiança i suport econòmic",
       "tangible",
       "descàrrega i informació"
      ],
      [
       "Serveis socials/CAP",
       "Persones cuidadores",
       "tangible",
       "derivacions i formació",
       "tangible",
       "dades i seguiment"
      ],
      [
       "Voluntariat",
       "Persones cuidadores",
       "tangible",
       "hores gratuïtes",
       "intangible",
       "formació i cura mútua"
      ],
      [
       "Voluntariat",
       "Persones cuidades",
       "tangible",
       "companyia i gestions",
       "intangible",
       "confiança i històries"
      ],
      [
       "Famílies",
       "Serveis socials/CAP",
       "intangible",
       "context i alertes",
       "tangible",
       "recursos i prestacions"
      ],
      [
       "Persones cuidades",
       "Serveis socials/CAP",
       "intangible",
       "consentiment i preferències",
       "tangible",
       "atenció adaptada"
      ],
      [
       "Famílies",
       "Voluntariat",
       "intangible",
       "acollida a casa",
       "intangible",
       "relleu i respir"
      ],
      [
       "Xarxa veïnal",
       "Persones cuidadores",
       "intangible",
       "avisos i suport puntual",
       "intangible",
       "confiança i acompanyament"
      ]
     ],
     "passos": [
      "Diagnòstic de necessitats",
      "Formar cuidadores",
      "Protocol de casos",
      "Primeres 5 famílies",
      "Enllaç serveis públics",
      "Prevenció del burnout"
     ],
     "centre": "Persones cuidadores",
     "bona": "La cura no s'aguanta només amb professionals: la xarxa veïnal avisa abans que ningú."
    },
    "es": {
     "nom": "Cuidados y acompañamiento social",
     "diu": "Red de cuidados, salud comunitaria, acompañamiento a personas vulnerables.",
     "roles": [
      "Personas cuidadoras",
      "Personas cuidadas",
      "Familias",
      "Servicios sociales / centro de salud",
      "Voluntariado",
      "Red vecinal"
     ],
     "pairs": [
      [
       "Personas cuidadoras",
       "Personas cuidadas",
       "intangible",
       "acompañamiento y escucha",
       "intangible",
       "vínculo y sentido"
      ],
      [
       "Familias",
       "Personas cuidadoras",
       "tangible",
       "confianza y apoyo económico",
       "tangible",
       "respiro e información"
      ],
      [
       "Servicios sociales / centro de salud",
       "Personas cuidadoras",
       "tangible",
       "derivaciones y formación",
       "tangible",
       "datos y seguimiento"
      ],
      [
       "Voluntariado",
       "Personas cuidadoras",
       "tangible",
       "horas gratuitas",
       "intangible",
       "formación y cuidado mutuo"
      ],
      [
       "Voluntariado",
       "Personas cuidadas",
       "tangible",
       "compañía y gestiones",
       "intangible",
       "confianza e historias"
      ],
      [
       "Familias",
       "Servicios sociales / centro de salud",
       "intangible",
       "contexto y alertas",
       "tangible",
       "recursos y prestaciones"
      ],
      [
       "Personas cuidadas",
       "Servicios sociales / centro de salud",
       "intangible",
       "consentimiento y preferencias",
       "tangible",
       "atención adaptada"
      ],
      [
       "Familias",
       "Voluntariado",
       "intangible",
       "acogida en casa",
       "intangible",
       "relevo y respiro"
      ],
      [
       "Red vecinal",
       "Personas cuidadoras",
       "intangible",
       "avisos y apoyo puntual",
       "intangible",
       "confianza y acompañamiento"
      ]
     ],
     "passos": [
      "Diagnóstico de necesidades",
      "Formar cuidadoras",
      "Protocolo de casos",
      "Primeras 5 familias",
      "Enlace con los servicios públicos",
      "Prevención del agotamiento"
     ],
     "centre": "Personas cuidadoras",
     "bona": "El cuidado no se sostiene solo con profesionales: la red vecinal avisa antes que nadie."
    },
    "en": {
     "nom": "Care and social support",
     "diu": "Care network, community health, support for vulnerable people.",
     "roles": [
      "Carers",
      "People cared for",
      "Families",
      "Social services / health centre",
      "Volunteers"
     ],
     "pairs": [
      [
       "Carers",
       "People cared for",
       "intangible",
       "company and listening",
       "intangible",
       "bond and meaning"
      ],
      [
       "Families",
       "Carers",
       "tangible",
       "trust and financial support",
       "tangible",
       "relief and information"
      ],
      [
       "Social services / health centre",
       "Carers",
       "tangible",
       "referrals and training",
       "tangible",
       "data and follow-up"
      ],
      [
       "Volunteers",
       "Carers",
       "tangible",
       "free hours",
       "intangible",
       "training and mutual care"
      ],
      [
       "Volunteers",
       "People cared for",
       "tangible",
       "company and errands",
       "intangible",
       "trust and stories"
      ],
      [
       "Families",
       "Social services / health centre",
       "intangible",
       "context and alerts",
       "tangible",
       "resources and benefits"
      ],
      [
       "People cared for",
       "Social services / health centre",
       "intangible",
       "consent and preferences",
       "tangible",
       "tailored care"
      ],
      [
       "Families",
       "Volunteers",
       "intangible",
       "welcome at home",
       "intangible",
       "cover and respite"
      ]
     ]
    },
    "veda": {
     "clau": [
      "**Xarxa veïnal → persones cuidadores: avisos i suport.** Arriba abans que cap servei.",
      "**Famílies ↔ persones cuidadores: informació i confiança.** Sense, la cura es fa a mitges.",
      "**Serveis socials / CAP ↔ cuidadores: derivació i criteri.** Cadascú fa el que li toca."
     ],
     "preguntes": [
      "Qui s'adona primer que una persona necessita ajuda?",
      "Qui cuida les persones cuidadores?",
      "Com us passeu la informació amb el CAP o els serveis socials?"
     ],
     "falta": [
      "La cura de qui cuida: descans, formació, reconeixement.",
      "El veïnat com a part de la xarxa, no com a espectador."
     ]
    }
   },
   {
    "id": "formacio",
    "icona": "📚",
    "paraules": "escuela escola academia acadèmia cursos curso curs formación formació profesores professors alumnos alumnes idiomas idiomes clases classes enseñar ensenyar",
    "ca": {
     "nom": "Educació / formació",
     "diu": "Formació reglada o lliure, mentoria, escola comunitària.",
     "roles": [
      "Formadors/es",
      "Aprenents",
      "Coordinació pedagògica",
      "Espai formatiu",
      "Comunitat de pràctica",
      "Antics alumnes"
     ],
     "pairs": [
      [
       "Formadors/es",
       "Aprenents",
       "tangible",
       "sessions i materials",
       "tangible",
       "matrícula o hores del banc"
      ],
      [
       "Coordinació pedagògica",
       "Formadors/es",
       "intangible",
       "disseny curricular",
       "tangible",
       "avaluació i millora"
      ],
      [
       "Espai formatiu",
       "Formadors/es",
       "tangible",
       "aules i eines",
       "tangible",
       "ús i manteniment"
      ],
      [
       "Aprenents",
       "Comunitat de pràctica",
       "intangible",
       "xarxa d'exalumnes",
       "intangible",
       "mentoria entre iguals"
      ],
      [
       "Formadors/es",
       "Comunitat de pràctica",
       "intangible",
       "recerca compartida",
       "intangible",
       "casos reals per ensenyar"
      ],
      [
       "Coordinació pedagògica",
       "Aprenents",
       "intangible",
       "itinerari i acreditació",
       "intangible",
       "expectatives i necessitats"
      ],
      [
       "Espai formatiu",
       "Aprenents",
       "tangible",
       "lloc de trobada",
       "intangible",
       "vida i ús de l'equipament"
      ],
      [
       "Comunitat de pràctica",
       "Coordinació pedagògica",
       "intangible",
       "què demana el sector",
       "intangible",
       "formació que s'hi ajusta"
      ],
      [
       "Antics alumnes",
       "Formadors/es",
       "intangible",
       "recomanacions i testimonis",
       "intangible",
       "comunitat i ofertes de feina"
      ]
     ],
     "passos": [
      "Currículum mínim",
      "Reclutar formadors",
      "Espai i horaris",
      "Primera cohort",
      "Avaluació i certificació",
      "Bucle amb ex-alumnes"
     ],
     "centre": "Formadors/es",
     "bona": "Els antics alumnes són la millor porta d'entrada: si la comunitat continua viva, recomanen."
    },
    "es": {
     "nom": "Educación / formación",
     "diu": "Formación reglada o libre, mentoría, escuela comunitaria.",
     "roles": [
      "Formadores/as",
      "Alumnos",
      "Coordinación pedagógica",
      "Espacio de formación",
      "Comunidad de práctica",
      "Antiguos alumnos"
     ],
     "pairs": [
      [
       "Formadores/as",
       "Alumnos",
       "tangible",
       "sesiones y materiales",
       "tangible",
       "matrícula u horas del banco de tiempo"
      ],
      [
       "Coordinación pedagógica",
       "Formadores/as",
       "intangible",
       "diseño del programa",
       "tangible",
       "evaluación y mejora"
      ],
      [
       "Espacio de formación",
       "Formadores/as",
       "tangible",
       "aulas y herramientas",
       "tangible",
       "uso y mantenimiento"
      ],
      [
       "Alumnos",
       "Comunidad de práctica",
       "intangible",
       "red de antiguos alumnos",
       "intangible",
       "mentoría entre iguales"
      ],
      [
       "Formadores/as",
       "Comunidad de práctica",
       "intangible",
       "investigación compartida",
       "intangible",
       "casos reales para enseñar"
      ],
      [
       "Coordinación pedagógica",
       "Alumnos",
       "intangible",
       "itinerario y titulación",
       "intangible",
       "expectativas y necesidades"
      ],
      [
       "Espacio de formación",
       "Alumnos",
       "tangible",
       "lugar de encuentro",
       "intangible",
       "vida y uso del espacio"
      ],
      [
       "Comunidad de práctica",
       "Coordinación pedagógica",
       "intangible",
       "qué pide el sector",
       "intangible",
       "formación que se ajusta"
      ],
      [
       "Antiguos alumnos",
       "Formadores/as",
       "intangible",
       "recomendaciones y testimonios",
       "intangible",
       "comunidad y ofertas de trabajo"
      ]
     ],
     "passos": [
      "Currículum mínimo",
      "Reclutar formadores",
      "Espacio y horarios",
      "Cohorte piloto",
      "Evaluación y certificación",
      "Bucle con antiguos alumnos"
     ],
     "centre": "Formadores/as",
     "bona": "Los antiguos alumnos son la mejor puerta de entrada: si la comunidad sigue viva, recomiendan."
    },
    "en": {
     "nom": "Education / training",
     "diu": "Formal or open training, mentoring, community school.",
     "roles": [
      "Trainers",
      "Learners",
      "Academic coordination",
      "Training venue",
      "Community of practice"
     ],
     "pairs": [
      [
       "Trainers",
       "Learners",
       "tangible",
       "sessions and materials",
       "tangible",
       "tuition or time-bank hours"
      ],
      [
       "Academic coordination",
       "Trainers",
       "intangible",
       "curriculum design",
       "tangible",
       "evaluation and improvement"
      ],
      [
       "Training venue",
       "Trainers",
       "tangible",
       "classrooms and tools",
       "tangible",
       "use and upkeep"
      ],
      [
       "Learners",
       "Community of practice",
       "intangible",
       "alumni network",
       "intangible",
       "peer mentoring"
      ],
      [
       "Trainers",
       "Community of practice",
       "intangible",
       "shared research",
       "intangible",
       "real cases to teach with"
      ],
      [
       "Academic coordination",
       "Learners",
       "intangible",
       "pathway and accreditation",
       "intangible",
       "expectations and needs"
      ],
      [
       "Training venue",
       "Learners",
       "tangible",
       "meeting place",
       "intangible",
       "life and use of the venue"
      ],
      [
       "Community of practice",
       "Academic coordination",
       "intangible",
       "what the sector asks for",
       "intangible",
       "training that fits"
      ]
     ]
    },
    "veda": {
     "clau": [
      "**Antics alumnes → formadors: recomanacions i testimonis.** La millor porta d'entrada.",
      "**Comunitat de pràctica ↔ formadors: casos i actualització.** Manté viu el que s'ensenya.",
      "**Aprenents → formadors: el que no s'ha entès.** Sense, el curs no millora."
     ],
     "preguntes": [
      "Què passa amb els alumnes quan acaben? Hi seguiu en contacte?",
      "Qui contracta o acull els que acaben, i què us diu d'ells?",
      "On recolliu el que els alumnes no han entès?"
     ],
     "falta": [
      "La comunitat d'antics alumnes: ofertes de feina, trobades, el contacte després del curs.",
      "Qui contracta els que acaben: el sentit del curs per a molts."
     ]
    }
   }
  ];
  /* Els sectors de la Matriu: rols, fluxos i els passos per posar-ho en marxa. */
  var SECTORS = [
   {
    "id": "dinamitzacio_comercial",
    "icona": "🏪",
    "paraules": "comercio comerç tiendas botigues comerciantes comerciants mercado mercat compra local proximidad",
    "ca": {
     "nom": "Dinamització comercial",
     "diu": "Revitalitzar el comerç i l'economia de proximitat.",
     "roles": [
      "Comerços de proximitat",
      "Ajuntament",
      "Associació de comerciants",
      "Veïnat",
      "Consumidors",
      "Entitats del barri"
     ],
     "pairs": [
      [
       "Comerços de proximitat",
       "Consumidors",
       "tangible",
       "producte i servei de proximitat",
       "tangible",
       "compra local"
      ],
      [
       "Associació de comerciants",
       "Comerços de proximitat",
       "tangible",
       "campanyes i formació",
       "tangible",
       "quotes i participació"
      ],
      [
       "Ajuntament",
       "Associació de comerciants",
       "tangible",
       "fires i finançament",
       "intangible",
       "diagnòstic del carrer"
      ],
      [
       "Veïnat",
       "Comerços de proximitat",
       "intangible",
       "fidelitat i boca-orella",
       "intangible",
       "vida i seguretat al carrer"
      ],
      [
       "Ajuntament",
       "Veïnat",
       "tangible",
       "espai públic i mercats",
       "intangible",
       "legitimitat de les mesures"
      ],
      [
       "Associació de comerciants",
       "Consumidors",
       "tangible",
       "moneda local i promocions",
       "tangible",
       "despesa que es queda al poble"
      ],
      [
       "Entitats del barri",
       "Associació de comerciants",
       "intangible",
       "activitats i públic",
       "intangible",
       "espai a les campanyes"
      ],
      [
       "Consumidors",
       "Comerços de proximitat",
       "intangible",
       "fidelitat i boca-orella",
       "intangible",
       "tracte proper"
      ]
     ],
     "passos": [
      "Diagnòstic del teixit comercial",
      "Constituir l'associació",
      "Campanya de proximitat",
      "Fires i mercats",
      "Fidelització i moneda local"
     ],
     "centre": "Associació de comerciants",
     "bona": "El comerç de proximitat guanya quan el barri hi és: les entitats porten públic i el tracte fa fidelitat."
    },
    "es": {
     "nom": "Dinamización comercial",
     "diu": "Revitalizar el comercio y la economía de proximidad.",
     "roles": [
      "Comercios de proximidad",
      "Ayuntamiento",
      "Asociación de comerciantes",
      "Vecindario",
      "Consumidores",
      "Entidades del barrio"
     ],
     "pairs": [
      [
       "Comercios de proximidad",
       "Consumidores",
       "tangible",
       "producto y servicio de proximidad",
       "tangible",
       "compra local"
      ],
      [
       "Asociación de comerciantes",
       "Comercios de proximidad",
       "tangible",
       "campañas y formación",
       "tangible",
       "cuotas y participación"
      ],
      [
       "Ayuntamiento",
       "Asociación de comerciantes",
       "tangible",
       "ferias y financiación",
       "intangible",
       "diagnóstico de la calle"
      ],
      [
       "Vecindario",
       "Comercios de proximidad",
       "intangible",
       "fidelidad y boca a boca",
       "intangible",
       "vida y seguridad en la calle"
      ],
      [
       "Ayuntamiento",
       "Vecindario",
       "tangible",
       "espacio público y mercados",
       "intangible",
       "legitimidad de las medidas"
      ],
      [
       "Asociación de comerciantes",
       "Consumidores",
       "tangible",
       "moneda local y promociones",
       "tangible",
       "gasto que se queda en el pueblo"
      ],
      [
       "Entidades del barrio",
       "Asociación de comerciantes",
       "intangible",
       "actividades y público",
       "intangible",
       "espacio en las campañas"
      ],
      [
       "Consumidores",
       "Comercios de proximidad",
       "intangible",
       "fidelidad y boca a boca",
       "intangible",
       "trato cercano"
      ]
     ],
     "passos": [
      "Diagnóstico del tejido comercial",
      "Constituir la asociación",
      "Campaña de proximidad",
      "Ferias y mercados",
      "Fidelización y moneda local"
     ],
     "centre": "Asociación de comerciantes",
     "bona": "El comercio de proximidad gana cuando el barrio está: las entidades traen público y el trato crea fidelidad."
    },
    "veda": {
     "clau": [
      "**Consumidors → comerços: fidelitat i boca-orella.** És el que el comerç gran no pot comprar.",
      "**Entitats del barri → associació: activitats i públic.** Les campanyes que funcionen són del barri.",
      "**Ajuntament ↔ associació: suport i interlocució.** Un sol interlocutor fa més fàcil tot."
     ],
     "preguntes": [
      "Què fa que un veí compri aquí i no fora?",
      "Quines entitats del barri podrien fer una activitat amb els comerços?",
      "Qui parla amb l'ajuntament en nom de tots?"
     ],
     "falta": [
      "Les entitats del barri a les campanyes, no només els comerços.",
      "El retorn al consumidor fidel: tracte, avantatges, sentir-se part."
     ]
    }
   },
   {
    "id": "ocupacio",
    "icona": "💼",
    "paraules": "empleo ocupació trabajo feina inserción inserció parados aturats orientación orientació currículum",
    "ca": {
     "nom": "Ocupació i inserció laboral",
     "diu": "Crear ocupació digna i itineraris d'inserció.",
     "roles": [
      "Persones en cerca de feina",
      "Empreses locals",
      "Ajuntament",
      "Entitats formatives",
      "Servei d'ocupació",
      "Persones ja contractades"
     ],
     "pairs": [
      [
       "Persones en cerca de feina",
       "Empreses locals",
       "tangible",
       "treball i talent",
       "tangible",
       "contracte i salari"
      ],
      [
       "Entitats formatives",
       "Persones en cerca de feina",
       "tangible",
       "formació i acreditació",
       "intangible",
       "motivació i assistència"
      ],
      [
       "Servei d'ocupació",
       "Persones en cerca de feina",
       "tangible",
       "orientació i intermediació",
       "tangible",
       "perfil i disponibilitat"
      ],
      [
       "Empreses locals",
       "Entitats formatives",
       "intangible",
       "què necessita el sector",
       "tangible",
       "pràctiques i formació dual"
      ],
      [
       "Ajuntament",
       "Servei d'ocupació",
       "tangible",
       "plans i recursos",
       "tangible",
       "dades d'inserció"
      ],
      [
       "Ajuntament",
       "Empreses locals",
       "tangible",
       "sòl, incentius i contractació",
       "tangible",
       "ocupació arrelada al municipi"
      ],
      [
       "Persones ja contractades",
       "Persones en cerca de feina",
       "intangible",
       "referents i consells",
       "intangible",
       "reconeixement"
      ],
      [
       "Persones ja contractades",
       "Servei d'ocupació",
       "intangible",
       "retorn de com ha anat",
       "intangible",
       "acompanyament posterior"
      ],
      [
       "Empreses locals",
       "Servei d'ocupació",
       "intangible",
       "perfils que necessiten",
       "intangible",
       "candidatures ajustades"
      ]
     ],
     "passos": [
      "Mapar necessitats i perfils",
      "Aliances amb empreses",
      "Formació a mida",
      "Pràctiques i inserció",
      "Seguiment"
     ],
     "centre": "Servei d'ocupació",
     "bona": "La inserció no acaba amb el contracte: qui ja treballa fa de referent i diu què ha funcionat."
    },
    "es": {
     "nom": "Empleo e inserción laboral",
     "diu": "Crear empleo digno e itinerarios de inserción.",
     "roles": [
      "Personas que buscan trabajo",
      "Empresas locales",
      "Ayuntamiento",
      "Entidades formativas",
      "Servicio de empleo",
      "Personas ya contratadas"
     ],
     "pairs": [
      [
       "Personas que buscan trabajo",
       "Empresas locales",
       "tangible",
       "trabajo y talento",
       "tangible",
       "contrato y salario"
      ],
      [
       "Entidades formativas",
       "Personas que buscan trabajo",
       "tangible",
       "formación y acreditación",
       "intangible",
       "motivación y asistencia"
      ],
      [
       "Servicio de empleo",
       "Personas que buscan trabajo",
       "tangible",
       "orientación e intermediación",
       "tangible",
       "perfil y disponibilidad"
      ],
      [
       "Empresas locales",
       "Entidades formativas",
       "intangible",
       "qué necesita el sector",
       "tangible",
       "prácticas y formación dual"
      ],
      [
       "Ayuntamiento",
       "Servicio de empleo",
       "tangible",
       "planes y recursos",
       "tangible",
       "datos de inserción"
      ],
      [
       "Ayuntamiento",
       "Empresas locales",
       "tangible",
       "suelo, incentivos y contratación",
       "tangible",
       "empleo arraigado en el municipio"
      ],
      [
       "Personas ya contratadas",
       "Personas que buscan trabajo",
       "intangible",
       "referentes y consejos",
       "intangible",
       "reconocimiento"
      ],
      [
       "Personas ya contratadas",
       "Servicio de empleo",
       "intangible",
       "retorno de cómo ha ido",
       "intangible",
       "acompañamiento posterior"
      ],
      [
       "Empresas locales",
       "Servicio de empleo",
       "intangible",
       "perfiles que necesitan",
       "intangible",
       "candidaturas ajustadas"
      ]
     ],
     "passos": [
      "Mapear necesidades y perfiles",
      "Alianzas con empresas",
      "Formación a medida",
      "Prácticas e inserción",
      "Seguimiento"
     ],
     "centre": "Servicio de empleo",
     "bona": "La inserción no acaba con el contrato: quien ya trabaja hace de referente y dice qué ha funcionado."
    },
    "veda": {
     "clau": [
      "**Persones ja contractades → persones en cerca: referents i consells.** Fa més creïble l'itinerari que cap fullet.",
      "**Empreses locals → servei d'ocupació: perfils que necessiten.** Sense, es forma per a feines que no hi són.",
      "**Servei d'ocupació → persones contractades: acompanyament posterior.** La inserció no acaba amb el contracte."
     ],
     "preguntes": [
      "Què ha passat amb les persones que van trobar feina l'any passat?",
      "Què necessiten de debò les empreses del territori, dit per elles?",
      "Qui pot fer de referent per a qui comença?"
     ],
     "falta": [
      "El seguiment després del contracte i el retorn de com ha anat.",
      "Les empreses com a part que també rep: candidatures ajustades, no només subvenció."
     ]
    }
   },
   {
    "id": "habitatge",
    "icona": "🏘️",
    "paraules": "vivienda habitatge pisos alquiler lloguer cooperativa cesión cessió masovería masoveria",
    "ca": {
     "nom": "Habitatge assequible",
     "diu": "Accés a habitatge digne sense especulació.",
     "roles": [
      "Grup motor",
      "Administració",
      "Finançament ètic",
      "Cooperativa",
      "Unitats de convivència",
      "Veïnat de l'entorn"
     ],
     "pairs": [
      [
       "Administració",
       "Cooperativa",
       "tangible",
       "cessió de sòl o dret de superfície",
       "intangible",
       "retorn social i mixtura"
      ],
      [
       "Unitats de convivència",
       "Cooperativa",
       "tangible",
       "aportació i quota d'ús",
       "tangible",
       "dret d'ús indefinit"
      ],
      [
       "Finançament ètic",
       "Cooperativa",
       "tangible",
       "préstec",
       "intangible",
       "projecte solvent i valors"
      ],
      [
       "Grup motor",
       "Unitats de convivència",
       "intangible",
       "convivència i confiança",
       "intangible",
       "implicació i cura"
      ],
      [
       "Grup motor",
       "Administració",
       "intangible",
       "interlocució i pressió",
       "tangible",
       "informació de sòl i terminis"
      ],
      [
       "Grup motor",
       "Finançament ètic",
       "tangible",
       "pla econòmic",
       "intangible",
       "criteris i acompanyament"
      ],
      [
       "Veïnat de l'entorn",
       "Grup motor",
       "intangible",
       "acollida i suport",
       "intangible",
       "espais comuns oberts"
      ]
     ],
     "passos": [
      "Grup motor",
      "Cerca de sòl",
      "Viabilitat",
      "Constitució",
      "Finançament",
      "Obra",
      "Convivència"
     ],
     "centre": "Grup motor",
     "bona": "Un projecte d'habitatge s'arrela si obre els seus espais al veïnat: el suport de l'entorn també és valor."
    },
    "es": {
     "nom": "Vivienda asequible",
     "diu": "Acceso a una vivienda digna sin especulación.",
     "roles": [
      "Grupo motor",
      "Administración",
      "Financiación ética",
      "Cooperativa",
      "Unidades de convivencia",
      "Vecindario del entorno"
     ],
     "pairs": [
      [
       "Administración",
       "Cooperativa",
       "tangible",
       "cesión de suelo o derecho de superficie",
       "intangible",
       "retorno social y mezcla"
      ],
      [
       "Unidades de convivencia",
       "Cooperativa",
       "tangible",
       "aportación y cuota de uso",
       "tangible",
       "derecho de uso indefinido"
      ],
      [
       "Financiación ética",
       "Cooperativa",
       "tangible",
       "préstamo",
       "intangible",
       "proyecto solvente y valores"
      ],
      [
       "Grupo motor",
       "Unidades de convivencia",
       "intangible",
       "convivencia y confianza",
       "intangible",
       "implicación y cuidado"
      ],
      [
       "Grupo motor",
       "Administración",
       "intangible",
       "interlocución y presión",
       "tangible",
       "información de suelo y plazos"
      ],
      [
       "Grupo motor",
       "Financiación ética",
       "tangible",
       "plan económico",
       "intangible",
       "criterios y acompañamiento"
      ],
      [
       "Vecindario del entorno",
       "Grupo motor",
       "intangible",
       "acogida y apoyo",
       "intangible",
       "espacios comunes abiertos"
      ]
     ],
     "passos": [
      "Grupo motor",
      "Búsqueda de suelo",
      "Viabilidad",
      "Constitución",
      "Financiación",
      "Obra",
      "Convivencia"
     ],
     "centre": "Grupo motor",
     "bona": "Un proyecto de vivienda arraiga si abre sus espacios al vecindario: el apoyo del entorno también es valor."
    },
    "veda": {
     "clau": [
      "**Veïnat de l'entorn → grup motor: acollida i suport.** Un projecte que no s'arrela es queda en un edifici.",
      "**Finançament ètic ↔ cooperativa: crèdit i confiança.** Sense, el projecte no arrenca.",
      "**Unitats de convivència ↔ cooperativa: cura dels espais i normes.** La convivència és el producte."
     ],
     "preguntes": [
      "Què ofereix el projecte al barri on s'instal·la?",
      "Com es prenen les decisions de convivència, i qui les cuida?",
      "Qui us dona confiança davant del finançament?"
     ],
     "falta": [
      "L'obertura al veïnat: espais comuns oberts, activitats.",
      "La cura de la convivència després de l'obra."
     ]
    }
   },
   {
    "id": "energia",
    "icona": "⚡",
    "paraules": "energía energia solar placas plaques renovable autoconsumo autoconsum tejados teulades",
    "ca": {
     "nom": "Comunitat energètica",
     "diu": "Produir i compartir energia renovable localment.",
     "roles": [
      "Nucli promotor",
      "Sòcies consumidores",
      "Ajuntament",
      "Instal·ladora",
      "Assessoria",
      "Altres comunitats energètiques"
     ],
     "pairs": [
      [
       "Sòcies consumidores",
       "Nucli promotor",
       "tangible",
       "inversió i quotes",
       "tangible",
       "energia i estalvi"
      ],
      [
       "Ajuntament",
       "Nucli promotor",
       "tangible",
       "cessió de teulades",
       "intangible",
       "transició energètica amb dades"
      ],
      [
       "Instal·ladora",
       "Nucli promotor",
       "tangible",
       "instal·lació i manteniment",
       "tangible",
       "contracte i pagament"
      ],
      [
       "Assessoria",
       "Nucli promotor",
       "intangible",
       "viabilitat i seguretat jurídica",
       "tangible",
       "encàrrec i cas replicable"
      ],
      [
       "Instal·ladora",
       "Sòcies consumidores",
       "tangible",
       "posada en marxa a casa",
       "intangible",
       "recomanacions"
      ],
      [
       "Ajuntament",
       "Sòcies consumidores",
       "tangible",
       "difusió i tràmits",
       "intangible",
       "mandat ciutadà"
      ],
      [
       "Altres comunitats energètiques",
       "Nucli promotor",
       "intangible",
       "experiència i errors a evitar",
       "intangible",
       "dades i aprenentatges"
      ]
     ],
     "passos": [
      "Viabilitat",
      "Captació de sòcies",
      "Teulada",
      "Finançament",
      "Constitució",
      "Instal·lació",
      "Posada en marxa"
     ],
     "centre": "Nucli promotor",
     "bona": "Cap comunitat energètica comença de zero: compartir errors i dades amb les altres estalvia mesos."
    },
    "es": {
     "nom": "Comunidad energética",
     "diu": "Producir y compartir energía renovable localmente.",
     "roles": [
      "Núcleo promotor",
      "Socias consumidoras",
      "Ayuntamiento",
      "Instaladora",
      "Asesoría",
      "Otras comunidades energéticas"
     ],
     "pairs": [
      [
       "Socias consumidoras",
       "Núcleo promotor",
       "tangible",
       "inversión y cuotas",
       "tangible",
       "energía y ahorro"
      ],
      [
       "Ayuntamiento",
       "Núcleo promotor",
       "tangible",
       "cesión de tejados",
       "intangible",
       "transición energética con datos"
      ],
      [
       "Instaladora",
       "Núcleo promotor",
       "tangible",
       "instalación y mantenimiento",
       "tangible",
       "contrato y pago"
      ],
      [
       "Asesoría",
       "Núcleo promotor",
       "intangible",
       "viabilidad y seguridad jurídica",
       "tangible",
       "encargo y caso replicable"
      ],
      [
       "Instaladora",
       "Socias consumidoras",
       "tangible",
       "puesta en marcha en casa",
       "intangible",
       "recomendaciones"
      ],
      [
       "Ayuntamiento",
       "Socias consumidoras",
       "tangible",
       "difusión y trámites",
       "intangible",
       "mandato ciudadano"
      ],
      [
       "Otras comunidades energéticas",
       "Núcleo promotor",
       "intangible",
       "experiencia y errores a evitar",
       "intangible",
       "datos y aprendizajes"
      ]
     ],
     "passos": [
      "Viabilidad",
      "Captación de socias",
      "Tejado",
      "Financiación",
      "Constitución",
      "Instalación",
      "Puesta en marcha"
     ],
     "centre": "Núcleo promotor",
     "bona": "Ninguna comunidad energética empieza de cero: compartir errores y datos con las demás ahorra meses."
    },
    "veda": {
     "clau": [
      "**Altres comunitats energètiques → nucli promotor: experiència.** Estalvia mesos i errors.",
      "**Sòcies consumidores ↔ nucli: compromís i informació clara.** Sense, la comunitat és només una factura.",
      "**Ajuntament → nucli: teulades i tràmits.** L'espai i el permís són el coll d'ampolla."
     ],
     "preguntes": [
      "Quina altra comunitat energètica coneixeu, i què us ha explicat?",
      "Què saben les sòcies del que passa a la instal·lació?",
      "Qui té la teulada, i què hi guanya?"
     ],
     "falta": [
      "L'intercanvi amb altres comunitats.",
      "La informació a les sòcies: què produeix, què estalvia, què decideixen."
     ]
    }
   },
   {
    "id": "alimentacio",
    "icona": "🥬",
    "paraules": "alimentación alimentació comida menjar agricultura pagès payés campesinos cestas cistelles huerta horta ecológico ecològic consumo consum",
    "ca": {
     "nom": "Alimentació sostenible",
     "diu": "Aliments sans i de proximitat, de la terra al plat.",
     "roles": [
      "Pagesia local",
      "Grup de consum",
      "Obrador",
      "Punt de repartiment",
      "Consumidors",
      "Escoles i menjadors"
     ],
     "pairs": [
      [
       "Pagesia local",
       "Grup de consum",
       "tangible",
       "cistelles i producte",
       "tangible",
       "comandes i preu just"
      ],
      [
       "Obrador",
       "Pagesia local",
       "tangible",
       "transformació del producte",
       "tangible",
       "matèria primera"
      ],
      [
       "Punt de repartiment",
       "Grup de consum",
       "tangible",
       "lloc i horari",
       "intangible",
       "vida al local"
      ],
      [
       "Grup de consum",
       "Consumidors",
       "tangible",
       "accés a producte de proximitat",
       "tangible",
       "quotes i rotació de tasques"
      ],
      [
       "Consumidors",
       "Pagesia local",
       "intangible",
       "confiança i traçabilitat",
       "intangible",
       "mercat estable"
      ],
      [
       "Obrador",
       "Consumidors",
       "tangible",
       "producte elaborat",
       "tangible",
       "demanda que sosté l'obrador"
      ],
      [
       "Escoles i menjadors",
       "Pagesia local",
       "tangible",
       "comandes regulars",
       "intangible",
       "visites i aprenentatge"
      ],
      [
       "Consumidors",
       "Pagesia local",
       "intangible",
       "fidelitat i suggeriments",
       "intangible",
       "confiança i transparència"
      ],
      [
       "Pagesia local",
       "Grup de consum",
       "intangible",
       "saber de temporada i de cultiu",
       "intangible",
       "compromís de compra"
      ]
     ],
     "passos": [
      "Formar el grup",
      "Contactar pagesia",
      "Logística",
      "Sistema de comandes",
      "Primera cistella",
      "Obrador"
     ],
     "centre": "Pagesia local",
     "bona": "La pagesia aguanta amb compra estable i confiança: els menjadors donen volum i les visites, vincle."
    },
    "es": {
     "nom": "Alimentación sostenible",
     "diu": "Alimentos sanos y de proximidad, de la tierra al plato.",
     "roles": [
      "Campesinado local",
      "Grupo de consumo",
      "Obrador",
      "Punto de reparto",
      "Consumidores",
      "Escuelas y comedores"
     ],
     "pairs": [
      [
       "Campesinado local",
       "Grupo de consumo",
       "tangible",
       "cestas y producto",
       "tangible",
       "pedidos y precio justo"
      ],
      [
       "Obrador",
       "Campesinado local",
       "tangible",
       "transformación del producto",
       "tangible",
       "materia prima"
      ],
      [
       "Punto de reparto",
       "Grupo de consumo",
       "tangible",
       "lugar y horario",
       "intangible",
       "vida en el local"
      ],
      [
       "Grupo de consumo",
       "Consumidores",
       "tangible",
       "acceso a producto de proximidad",
       "tangible",
       "cuotas y rotación de tareas"
      ],
      [
       "Consumidores",
       "Campesinado local",
       "intangible",
       "confianza y trazabilidad",
       "intangible",
       "mercado estable"
      ],
      [
       "Obrador",
       "Consumidores",
       "tangible",
       "producto elaborado",
       "tangible",
       "demanda que sostiene el obrador"
      ],
      [
       "Escuelas y comedores",
       "Campesinado local",
       "tangible",
       "pedidos regulares",
       "intangible",
       "visitas y aprendizaje"
      ],
      [
       "Consumidores",
       "Campesinado local",
       "intangible",
       "fidelidad y sugerencias",
       "intangible",
       "confianza y transparencia"
      ],
      [
       "Campesinado local",
       "Grupo de consumo",
       "intangible",
       "saber de temporada y de cultivo",
       "intangible",
       "compromiso de compra"
      ]
     ],
     "passos": [
      "Formar el grupo",
      "Contactar con el campesinado",
      "Logística",
      "Sistema de pedidos",
      "Primera cesta",
      "Obrador"
     ],
     "centre": "Campesinado local",
     "bona": "El campesinado aguanta con compra estable y confianza: los comedores dan volumen y las visitas, vínculo."
    },
    "veda": {
     "clau": [
      "**Escoles i menjadors → pagesia: comandes regulars.** Donen volum estable.",
      "**Pagesia → grup de consum: saber de temporada.** Educa el consum.",
      "**Consumidors → pagesia: fidelitat i suggeriments.** Sense, el projecte depèn de l'entusiasme."
     ],
     "preguntes": [
      "Quina compra és prou estable perquè la pagesia planifiqui?",
      "Què sap el grup de consum de com es cultiva el que menja?",
      "Què passa quan una setmana falta producte?"
     ],
     "falta": [
      "La compra estable (menjadors, restauració) que fa viable la pagesia.",
      "El coneixement de la pagesia cap a qui menja."
     ]
    }
   },
   {
    "id": "cures",
    "icona": "💗",
    "paraules": "salud salut comunitaria comunitària soledad soledat mayores grans voluntariado voluntariat",
    "ca": {
     "nom": "Cures i salut comunitària",
     "diu": "Xarxa de cures i benestar contra la soledat.",
     "roles": [
      "Nucli de cura",
      "Veïnat",
      "Gent gran",
      "CAP / serveis socials",
      "Voluntariat",
      "Comerços del barri"
     ],
     "pairs": [
      [
       "Nucli de cura",
       "Gent gran",
       "intangible",
       "acompanyament",
       "intangible",
       "saber i memòria viva"
      ],
      [
       "Veïnat",
       "Nucli de cura",
       "intangible",
       "detecció i alerta",
       "intangible",
       "formació per detectar"
      ],
      [
       "CAP / serveis socials",
       "Nucli de cura",
       "tangible",
       "derivació i suport",
       "intangible",
       "detecció precoç i dades"
      ],
      [
       "Voluntariat",
       "Nucli de cura",
       "tangible",
       "hores de cura",
       "intangible",
       "sentit i pertinença"
      ],
      [
       "Voluntariat",
       "Gent gran",
       "tangible",
       "companyia i gestions",
       "intangible",
       "confiança i històries"
      ],
      [
       "CAP / serveis socials",
       "Veïnat",
       "tangible",
       "salut comunitària",
       "intangible",
       "coneixement del carrer"
      ],
      [
       "Comerços del barri",
       "Nucli de cura",
       "intangible",
       "avisos de qui necessita ajuda",
       "intangible",
       "xarxa i reconeixement"
      ]
     ],
     "passos": [
      "Detectar necessitats",
      "Formar el grup",
      "Protocol",
      "Primers acompanyaments",
      "Coordinació amb serveis"
     ],
     "centre": "Nucli de cura",
     "bona": "Qui veu cada dia la gent gran (la farmàcia, el forn) és qui avisa primer: compta-hi."
    },
    "es": {
     "nom": "Cuidados y salud comunitaria",
     "diu": "Red de cuidados y bienestar contra la soledad.",
     "roles": [
      "Núcleo de cuidado",
      "Vecindario",
      "Personas mayores",
      "CAP / servicios sociales",
      "Voluntariado",
      "Comercios del barrio"
     ],
     "pairs": [
      [
       "Núcleo de cuidado",
       "Personas mayores",
       "intangible",
       "acompañamiento",
       "intangible",
       "saber y memoria viva"
      ],
      [
       "Vecindario",
       "Núcleo de cuidado",
       "intangible",
       "detección y alerta",
       "intangible",
       "formación para detectar"
      ],
      [
       "CAP / servicios sociales",
       "Núcleo de cuidado",
       "tangible",
       "derivación y apoyo",
       "intangible",
       "detección precoz y datos"
      ],
      [
       "Voluntariado",
       "Núcleo de cuidado",
       "tangible",
       "horas de cuidado",
       "intangible",
       "sentido y pertenencia"
      ],
      [
       "Voluntariado",
       "Personas mayores",
       "tangible",
       "compañía y gestiones",
       "intangible",
       "confianza e historias"
      ],
      [
       "CAP / servicios sociales",
       "Vecindario",
       "tangible",
       "salud comunitaria",
       "intangible",
       "conocimiento de la calle"
      ],
      [
       "Comercios del barrio",
       "Núcleo de cuidado",
       "intangible",
       "avisos de quien necesita ayuda",
       "intangible",
       "red y reconocimiento"
      ]
     ],
     "passos": [
      "Detectar necesidades",
      "Formar el grupo",
      "Protocolo",
      "Primeros acompañamientos",
      "Coordinación con servicios"
     ],
     "centre": "Núcleo de cuidado",
     "bona": "Quien ve cada día a las personas mayores (la farmacia, el horno) es quien avisa primero: cuenta con ello."
    },
    "veda": {
     "clau": [
      "**Comerços del barri → nucli de cura: avisos.** Qui veu cada dia la gent gran avisa primer.",
      "**Voluntariat ↔ nucli: temps i formació.** La qualitat de la cura ve de la formació.",
      "**CAP / serveis socials ↔ nucli: coordinació.** Evita duplicar i deixar forats."
     ],
     "preguntes": [
      "Qui veu cada dia les persones grans que viuen soles?",
      "Com es forma i es cuida el voluntariat?",
      "Com us coordineu amb el CAP?"
     ],
     "falta": [
      "Els comerços i els veïns com a detectors.",
      "La cura del voluntariat."
     ]
    }
   },
   {
    "id": "cultura",
    "icona": "🎭",
    "paraules": "cultura cultural festival fiesta festa conciertos concerts teatro teatre música patrimonio patrimoni museo museu arte art artistas artistes",
    "ca": {
     "nom": "Cultura i patrimoni",
     "diu": "Activar la cultura, la festa i el patrimoni local.",
     "roles": [
      "Entitats culturals",
      "Ajuntament",
      "Artistes",
      "Veïnat",
      "Escoles",
      "Públic fidel"
     ],
     "pairs": [
      [
       "Ajuntament",
       "Entitats culturals",
       "tangible",
       "equipaments i subvenció",
       "intangible",
       "programació i vida cultural"
      ],
      [
       "Artistes",
       "Veïnat",
       "intangible",
       "experiència cultural",
       "tangible",
       "públic i taquilla"
      ],
      [
       "Escoles",
       "Veïnat",
       "intangible",
       "patrimoni viu",
       "intangible",
       "implicació de les famílies"
      ],
      [
       "Entitats culturals",
       "Artistes",
       "tangible",
       "espai i caixet",
       "tangible",
       "obra i assaig"
      ],
      [
       "Escoles",
       "Entitats culturals",
       "tangible",
       "cantera i espais",
       "intangible",
       "arrelament de l'alumnat"
      ],
      [
       "Ajuntament",
       "Veïnat",
       "tangible",
       "festa major i espai públic",
       "intangible",
       "participació i memòria"
      ],
      [
       "Públic fidel",
       "Entitats culturals",
       "intangible",
       "assistència i difusió",
       "intangible",
       "pertinença i programació propera"
      ]
     ],
     "passos": [
      "Mapa d'agents culturals",
      "Programació compartida",
      "Recuperar patrimoni",
      "Festa major participativa",
      "Avaluació"
     ],
     "centre": "Entitats culturals",
     "bona": "El públic fidel és el que omple i difon: fes-lo sentir part de la programació."
    },
    "es": {
     "nom": "Cultura y patrimonio",
     "diu": "Activar la cultura, la fiesta y el patrimonio local.",
     "roles": [
      "Entidades culturales",
      "Ayuntamiento",
      "Artistas",
      "Vecindario",
      "Escuelas",
      "Público fiel"
     ],
     "pairs": [
      [
       "Ayuntamiento",
       "Entidades culturales",
       "tangible",
       "equipamientos y subvención",
       "intangible",
       "programación y vida cultural"
      ],
      [
       "Artistas",
       "Vecindario",
       "intangible",
       "experiencia cultural",
       "tangible",
       "público y taquilla"
      ],
      [
       "Escuelas",
       "Vecindario",
       "intangible",
       "patrimonio vivo",
       "intangible",
       "implicación de las familias"
      ],
      [
       "Entidades culturales",
       "Artistas",
       "tangible",
       "espacio y caché",
       "tangible",
       "obra y ensayo"
      ],
      [
       "Escuelas",
       "Entidades culturales",
       "tangible",
       "cantera y espacios",
       "intangible",
       "arraigo del alumnado"
      ],
      [
       "Ayuntamiento",
       "Vecindario",
       "tangible",
       "fiesta mayor y espacio público",
       "intangible",
       "participación y memoria"
      ],
      [
       "Público fiel",
       "Entidades culturales",
       "intangible",
       "asistencia y difusión",
       "intangible",
       "pertenencia y programación cercana"
      ]
     ],
     "passos": [
      "Mapa de agentes culturales",
      "Programación compartida",
      "Recuperar patrimonio",
      "Fiesta mayor participativa",
      "Evaluación"
     ],
     "centre": "Entidades culturales",
     "bona": "El público fiel es el que llena y difunde: hazlo sentir parte de la programación."
    },
    "veda": {
     "clau": [
      "**Públic fidel → entitats: assistència i difusió.** Omple i porta gent nova.",
      "**Artistes ↔ entitats: programació i espai.** Sense, la cultura és importada.",
      "**Escoles ↔ entitats: relleu i públic de demà.** Assegura la continuïtat."
     ],
     "preguntes": [
      "Qui ve sempre, i què li agradaria proposar?",
      "Quins artistes locals no han tingut mai espai?",
      "Què fan les escoles amb la festa i el patrimoni?"
     ],
     "falta": [
      "El públic com a part que decideix.",
      "Les escoles com a pedrera de públic i d'entitats."
     ]
    }
   },
   {
    "id": "turisme",
    "icona": "🧭",
    "paraules": "turismo turisme turistas turistes visitas visites alojamiento allotjament hotel enoturismo enoturisme rutas rutes catas tasts experiencias experiències",
    "ca": {
     "nom": "Turisme de poble sostenible",
     "diu": "Turisme responsable que reverteix al territori.",
     "roles": [
      "Allotjaments",
      "Ajuntament",
      "Restauració",
      "Guies locals",
      "Productors",
      "Ens de destinació"
     ],
     "pairs": [
      [
       "Guies locals",
       "Allotjaments",
       "tangible",
       "experiències",
       "tangible",
       "clientela i comissió"
      ],
      [
       "Ajuntament",
       "Restauració",
       "tangible",
       "promoció i fires",
       "tangible",
       "taxes i activitat"
      ],
      [
       "Productors",
       "Restauració",
       "tangible",
       "producte km0",
       "tangible",
       "compra estable"
      ],
      [
       "Allotjaments",
       "Productors",
       "tangible",
       "esmorzars i botiga",
       "intangible",
       "visibilitat del producte"
      ],
      [
       "Ajuntament",
       "Guies locals",
       "tangible",
       "formació i acreditació",
       "intangible",
       "relat del territori"
      ],
      [
       "Restauració",
       "Guies locals",
       "tangible",
       "àpats i rutes",
       "tangible",
       "reserves i grups"
      ],
      [
       "Ens de destinació",
       "Allotjaments",
       "intangible",
       "relat comú i coordinació",
       "intangible",
       "dades de visitants"
      ],
      [
       "Ens de destinació",
       "Productors",
       "intangible",
       "visibilitat del producte local",
       "intangible",
       "autenticitat del relat"
      ],
      [
       "Ajuntament",
       "Ens de destinació",
       "tangible",
       "suport i recursos",
       "intangible",
       "reputació del territori"
      ]
     ],
     "passos": [
      "Inventari d'atractius",
      "Producte turístic",
      "Aliances locals",
      "Promoció responsable",
      "Gestió de fluxos"
     ],
     "centre": "Ens de destinació",
     "bona": "Una destinació és una xarxa, no una suma d'empreses: algú ha de cosir el relat comú i compartir-ne les dades."
    },
    "es": {
     "nom": "Turismo de pueblo sostenible",
     "diu": "Turismo responsable que revierte en el territorio.",
     "roles": [
      "Alojamientos",
      "Ayuntamiento",
      "Restauración",
      "Guías locales",
      "Productores",
      "Ente de destino"
     ],
     "pairs": [
      [
       "Guías locales",
       "Alojamientos",
       "tangible",
       "experiencias",
       "tangible",
       "clientela y comisión"
      ],
      [
       "Ayuntamiento",
       "Restauración",
       "tangible",
       "promoción y ferias",
       "tangible",
       "tasas y actividad"
      ],
      [
       "Productores",
       "Restauración",
       "tangible",
       "producto km0",
       "tangible",
       "compra estable"
      ],
      [
       "Alojamientos",
       "Productores",
       "tangible",
       "desayunos y tienda",
       "intangible",
       "visibilidad del producto"
      ],
      [
       "Ayuntamiento",
       "Guías locales",
       "tangible",
       "formación y acreditación",
       "intangible",
       "relato del territorio"
      ],
      [
       "Restauración",
       "Guías locales",
       "tangible",
       "comidas y rutas",
       "tangible",
       "reservas y grupos"
      ],
      [
       "Ente de destino",
       "Alojamientos",
       "intangible",
       "relato común y coordinación",
       "intangible",
       "datos de visitantes"
      ],
      [
       "Ente de destino",
       "Productores",
       "intangible",
       "visibilidad del producto local",
       "intangible",
       "autenticidad del relato"
      ],
      [
       "Ayuntamiento",
       "Ente de destino",
       "tangible",
       "apoyo y recursos",
       "intangible",
       "reputación del territorio"
      ]
     ],
     "passos": [
      "Inventario de atractivos",
      "Producto turístico",
      "Alianzas locales",
      "Promoción responsable",
      "Gestión de flujos"
     ],
     "centre": "Ente de destino",
     "bona": "Un destino es una red, no una suma de empresas: alguien tiene que coser el relato común y compartir sus datos."
    },
    "veda": {
     "clau": [
      "**Ens de destinació → allotjaments i productors: relat comú.** Una destinació és una xarxa.",
      "**Productors → restauració: producte km0.** Fa la diferència que el visitant recorda.",
      "**Allotjaments → ens de destinació: dades de visitants.** Sense, la promoció és a cegues."
     ],
     "preguntes": [
      "Qui explica el territori de la mateixa manera a tots els visitants?",
      "Què compra el visitant que s'ha fet aquí?",
      "Què en treu el veïnat que no viu del turisme?"
     ],
     "falta": [
      "Qui cus el relat comú i comparteix dades.",
      "El retorn al territori: veïnat, productors, paisatge."
     ]
    }
   },
   {
    "id": "economia_circular",
    "icona": "♻️",
    "paraules": "reparar reparamos reutilizar reutilitzar segunda mà mano residuos residus reciclaje reciclatge compost circular muebles mobles",
    "ca": {
     "nom": "Economia circular",
     "diu": "Reduir, reparar i reutilitzar en clau local.",
     "roles": [
      "Nucli gestor",
      "Veïnat",
      "Comerços",
      "Ajuntament",
      "Recicladors",
      "Persones reparadores voluntàries"
     ],
     "pairs": [
      [
       "Veïnat",
       "Nucli gestor",
       "tangible",
       "objectes i residus",
       "tangible",
       "productes reparats"
      ],
      [
       "Ajuntament",
       "Nucli gestor",
       "tangible",
       "espai i suport",
       "tangible",
       "residus evitats amb dades"
      ],
      [
       "Recicladors",
       "Nucli gestor",
       "tangible",
       "tractament del que no es repara",
       "tangible",
       "material separat i net"
      ],
      [
       "Comerços",
       "Nucli gestor",
       "tangible",
       "excedents i estocs",
       "intangible",
       "imatge i clientela conscient"
      ],
      [
       "Comerços",
       "Veïnat",
       "tangible",
       "reparació i segona mà",
       "tangible",
       "compra reparada"
      ],
      [
       "Recicladors",
       "Ajuntament",
       "tangible",
       "valorització i informe",
       "tangible",
       "contracte i taxa"
      ],
      [
       "Persones reparadores voluntàries",
       "Nucli gestor",
       "intangible",
       "saber reparar",
       "intangible",
       "comunitat i reconeixement"
      ],
      [
       "Persones reparadores voluntàries",
       "Veïnat",
       "intangible",
       "aprendre a reparar",
       "intangible",
       "confiança i objectes per salvar"
      ],
      [
       "Veïnat",
       "Comerços",
       "intangible",
       "boca-orella",
       "intangible",
       "consell de consum"
      ]
     ],
     "passos": [
      "Punt de reparació",
      "Biblioteca de les coses",
      "Mercat de segona mà",
      "Compostatge",
      "Sensibilització"
     ],
     "centre": "Nucli gestor",
     "bona": "L'economia circular és sobretot saber compartit: qui ensenya a reparar multiplica el que es salva."
    },
    "es": {
     "nom": "Economía circular",
     "diu": "Reducir, reparar y reutilizar en clave local.",
     "roles": [
      "Núcleo gestor",
      "Vecindario",
      "Comercios",
      "Ayuntamiento",
      "Recicladores",
      "Personas reparadoras voluntarias"
     ],
     "pairs": [
      [
       "Vecindario",
       "Núcleo gestor",
       "tangible",
       "objetos y residuos",
       "tangible",
       "productos reparados"
      ],
      [
       "Ayuntamiento",
       "Núcleo gestor",
       "tangible",
       "espacio y apoyo",
       "tangible",
       "residuos evitados con datos"
      ],
      [
       "Recicladores",
       "Núcleo gestor",
       "tangible",
       "tratamiento de lo que no se repara",
       "tangible",
       "material separado y limpio"
      ],
      [
       "Comercios",
       "Núcleo gestor",
       "tangible",
       "excedentes y stocks",
       "intangible",
       "imagen y clientela consciente"
      ],
      [
       "Comercios",
       "Vecindario",
       "tangible",
       "reparación y segunda mano",
       "tangible",
       "compra reparada"
      ],
      [
       "Recicladores",
       "Ayuntamiento",
       "tangible",
       "valorización e informe",
       "tangible",
       "contrato y tasa"
      ],
      [
       "Personas reparadoras voluntarias",
       "Núcleo gestor",
       "intangible",
       "saber reparar",
       "intangible",
       "comunidad y reconocimiento"
      ],
      [
       "Personas reparadoras voluntarias",
       "Vecindario",
       "intangible",
       "aprender a reparar",
       "intangible",
       "confianza y objetos por salvar"
      ],
      [
       "Vecindario",
       "Comercios",
       "intangible",
       "boca a boca",
       "intangible",
       "consejo de consumo"
      ]
     ],
     "passos": [
      "Punto de reparación",
      "Biblioteca de las cosas",
      "Mercado de segunda mano",
      "Compostaje",
      "Sensibilización"
     ],
     "centre": "Núcleo gestor",
     "bona": "La economía circular es sobre todo saber compartido: quien enseña a reparar multiplica lo que se salva."
    },
    "veda": {
     "clau": [
      "**Persones reparadores → veïnat: saber reparar.** Multiplica el que se salva.",
      "**Comerços → nucli: excedents i estocs.** Evita residus abans que n'hi hagi.",
      "**Ajuntament ↔ nucli: espai i dades de residus evitats.** Legitima el projecte."
     ],
     "preguntes": [
      "Qui sap reparar al barri, i ho ensenyaria?",
      "Què llencen els comerços que algú podria fer servir?",
      "Com expliqueu el que heu evitat llençar?"
     ],
     "falta": [
      "L'aprenentatge: no només reparar, sinó ensenyar a reparar.",
      "El boca-orella entre veïns i comerços."
     ]
    }
   },
   {
    "id": "digitalitzacio",
    "icona": "🖥️",
    "paraules": "digital digitalización digitalització informática informàtica software libre lliure ordenadores ordinadors brecha bretxa tecnología tecnologia",
    "ca": {
     "nom": "Digitalització i sobirania tecnològica",
     "diu": "Autonomia digital del teixit local.",
     "roles": [
      "Nucli tècnic",
      "Entitats",
      "Ajuntament",
      "Veïnat",
      "Formadors",
      "Persones mentores"
     ],
     "pairs": [
      [
       "Formadors",
       "Entitats",
       "intangible",
       "capacitació",
       "intangible",
       "casos reals per ensenyar"
      ],
      [
       "Nucli tècnic",
       "Veïnat",
       "tangible",
       "eines digitals sobiranes",
       "intangible",
       "usos i incidències detectades"
      ],
      [
       "Ajuntament",
       "Nucli tècnic",
       "tangible",
       "recursos i infraestructura",
       "tangible",
       "serveis mantinguts"
      ],
      [
       "Nucli tècnic",
       "Entitats",
       "tangible",
       "migració i suport",
       "tangible",
       "contribucions i documentació"
      ],
      [
       "Formadors",
       "Veïnat",
       "tangible",
       "alfabetització digital",
       "intangible",
       "confiança per demanar ajuda"
      ],
      [
       "Ajuntament",
       "Entitats",
       "tangible",
       "connectivitat i espais",
       "intangible",
       "diagnòstic de bretxa"
      ],
      [
       "Persones mentores",
       "Veïnat",
       "intangible",
       "acompanyament pas a pas",
       "intangible",
       "agraïment i confiança"
      ],
      [
       "Persones mentores",
       "Nucli tècnic",
       "intangible",
       "temps i coneixement",
       "intangible",
       "comunitat i formació"
      ]
     ],
     "passos": [
      "Diagnòstic digital",
      "Formació bàsica",
      "Eines sobiranes",
      "Presència digital",
      "Manteniment comunitari"
     ],
     "centre": "Nucli tècnic",
     "bona": "La bretxa digital es tanca de persona a persona: les mentores fan el que cap curs fa."
    },
    "es": {
     "nom": "Digitalización y soberanía tecnológica",
     "diu": "Autonomía digital del tejido local.",
     "roles": [
      "Núcleo técnico",
      "Entidades",
      "Ayuntamiento",
      "Vecindario",
      "Formadores",
      "Personas mentoras"
     ],
     "pairs": [
      [
       "Formadores",
       "Entidades",
       "intangible",
       "capacitación",
       "intangible",
       "casos reales para enseñar"
      ],
      [
       "Núcleo técnico",
       "Vecindario",
       "tangible",
       "herramientas digitales soberanas",
       "intangible",
       "usos e incidencias detectadas"
      ],
      [
       "Ayuntamiento",
       "Núcleo técnico",
       "tangible",
       "recursos e infraestructura",
       "tangible",
       "servicios mantenidos"
      ],
      [
       "Núcleo técnico",
       "Entidades",
       "tangible",
       "migración y apoyo",
       "tangible",
       "contribuciones y documentación"
      ],
      [
       "Formadores",
       "Vecindario",
       "tangible",
       "alfabetización digital",
       "intangible",
       "confianza para pedir ayuda"
      ],
      [
       "Ayuntamiento",
       "Entidades",
       "tangible",
       "conectividad y espacios",
       "intangible",
       "diagnóstico de brecha"
      ],
      [
       "Personas mentoras",
       "Vecindario",
       "intangible",
       "acompañamiento paso a paso",
       "intangible",
       "agradecimiento y confianza"
      ],
      [
       "Personas mentoras",
       "Núcleo técnico",
       "intangible",
       "tiempo y conocimiento",
       "intangible",
       "comunidad y formación"
      ]
     ],
     "passos": [
      "Diagnóstico digital",
      "Formación básica",
      "Herramientas soberanas",
      "Presencia digital",
      "Mantenimiento comunitario"
     ],
     "centre": "Núcleo técnico",
     "bona": "La brecha digital se cierra de persona a persona: las mentoras hacen lo que ningún curso hace."
    },
    "veda": {
     "clau": [
      "**Persones mentores → veïnat: acompanyament pas a pas.** La bretxa es tanca de persona a persona.",
      "**Nucli tècnic → entitats: eines sobiranes.** Autonomia, no dependència.",
      "**Formadors ↔ nucli: continguts i casos.** El que s'ensenya serveix."
     ],
     "preguntes": [
      "Qui ajuda avui els veïns amb el mòbil i els tràmits?",
      "Què passa amb una eina quan el curs s'acaba?",
      "Qui manté les eines de les entitats?"
     ],
     "falta": [
      "Les mentores i el seu reconeixement.",
      "El manteniment comunitari després del curs."
     ]
    }
   },
   {
    "id": "joventut",
    "icona": "🛹",
    "paraules": "jóvenes joves juventud joventut esplai ocio lleure adolescentes adolescents casal monitores monitors",
    "ca": {
     "nom": "Joventut i lleure",
     "diu": "Espais i oportunitats per al jovent.",
     "roles": [
      "Jovent",
      "Esplai / entitats",
      "Ajuntament",
      "Escoles",
      "Monitoratge",
      "Famílies"
     ],
     "pairs": [
      [
       "Ajuntament",
       "Esplai / entitats",
       "tangible",
       "espais i beca",
       "intangible",
       "activitat i cohesió juvenil"
      ],
      [
       "Monitoratge",
       "Jovent",
       "intangible",
       "acompanyament",
       "intangible",
       "confiança i referència"
      ],
      [
       "Jovent",
       "Esplai / entitats",
       "intangible",
       "participació i propostes",
       "tangible",
       "espai i recursos per fer-les"
      ],
      [
       "Escoles",
       "Jovent",
       "tangible",
       "formació i orientació",
       "intangible",
       "clima i implicació"
      ],
      [
       "Esplai / entitats",
       "Monitoratge",
       "tangible",
       "formació i condicions dignes",
       "tangible",
       "hores i projecte educatiu"
      ],
      [
       "Ajuntament",
       "Jovent",
       "tangible",
       "pressupost i espai jove",
       "intangible",
       "mandat i prioritats reals"
      ],
      [
       "Famílies",
       "Esplai / entitats",
       "tangible",
       "quotes i autoritzacions",
       "intangible",
       "confiança i col·laboració"
      ],
      [
       "Famílies",
       "Jovent",
       "intangible",
       "suport i permís",
       "intangible",
       "autonomia i ganes"
      ]
     ],
     "passos": [
      "Escoltar el jovent",
      "Espai jove",
      "Programació",
      "Projectes liderats per joves",
      "Relleu"
     ],
     "centre": "Esplai / entitats",
     "bona": "Amb el jovent, les famílies decideixen molt: si confien, el projecte creix."
    },
    "es": {
     "nom": "Juventud y ocio",
     "diu": "Espacios y oportunidades para la juventud.",
     "roles": [
      "Juventud",
      "Esplai / entidades",
      "Ayuntamiento",
      "Escuelas",
      "Monitores",
      "Familias"
     ],
     "pairs": [
      [
       "Ayuntamiento",
       "Esplai / entidades",
       "tangible",
       "espacios y beca",
       "intangible",
       "actividad y cohesión juvenil"
      ],
      [
       "Monitores",
       "Juventud",
       "intangible",
       "acompañamiento",
       "intangible",
       "confianza y referencia"
      ],
      [
       "Juventud",
       "Esplai / entidades",
       "intangible",
       "participación y propuestas",
       "tangible",
       "espacio y recursos para hacerlas"
      ],
      [
       "Escuelas",
       "Juventud",
       "tangible",
       "formación y orientación",
       "intangible",
       "clima e implicación"
      ],
      [
       "Esplai / entidades",
       "Monitores",
       "tangible",
       "formación y condiciones dignas",
       "tangible",
       "horas y proyecto educativo"
      ],
      [
       "Ayuntamiento",
       "Juventud",
       "tangible",
       "presupuesto y espacio joven",
       "intangible",
       "mandato y prioridades reales"
      ],
      [
       "Familias",
       "Esplai / entidades",
       "tangible",
       "cuotas y autorizaciones",
       "intangible",
       "confianza y colaboración"
      ],
      [
       "Familias",
       "Juventud",
       "intangible",
       "apoyo y permiso",
       "intangible",
       "autonomía y ganas"
      ]
     ],
     "passos": [
      "Escuchar a la juventud",
      "Espacio joven",
      "Programación",
      "Proyectos liderados por jóvenes",
      "Relevo"
     ],
     "centre": "Esplai / entidades",
     "bona": "Con la juventud, las familias deciden mucho: si confían, el proyecto crece."
    },
    "veda": {
     "clau": [
      "**Famílies → esplai: confiança i permís.** Sense, el jovent no hi va.",
      "**Jovent → esplai: idees i lideratge.** El projecte és seu o no és.",
      "**Escoles ↔ esplai: difusió i continuïtat.** Arriba a qui no ve sol."
     ],
     "preguntes": [
      "Quines decisions pren el jovent?",
      "Qui era participant i ara és monitor?",
      "Què necessiten les famílies per confiar?"
     ],
     "falta": [
      "La veu del jovent en les decisions.",
      "El relleu: qui passa de participant a monitor."
     ]
    }
   },
   {
    "id": "mobilitat",
    "icona": "🚲",
    "paraules": "movilidad mobilitat bici bicicleta transporte transport coche cotxe camino escolar escolar peatones vianants",
    "ca": {
     "nom": "Mobilitat sostenible",
     "diu": "Moure's millor amb menys cotxe.",
     "roles": [
      "Veïnat",
      "Ajuntament",
      "Transport públic",
      "Grups ciclistes",
      "Escoles",
      "Plataforma de mobilitat"
     ],
     "pairs": [
      [
       "Ajuntament",
       "Veïnat",
       "tangible",
       "carrils, aparcaments i transport",
       "intangible",
       "ús i legitimitat"
      ],
      [
       "Escoles",
       "Veïnat",
       "intangible",
       "camins escolars",
       "tangible",
       "famílies acompanyants"
      ],
      [
       "Grups ciclistes",
       "Ajuntament",
       "intangible",
       "propostes i diagnòstic",
       "tangible",
       "infraestructura i seguretat"
      ],
      [
       "Transport públic",
       "Veïnat",
       "tangible",
       "freqüència i cobertura",
       "tangible",
       "demanda i validacions"
      ],
      [
       "Ajuntament",
       "Transport públic",
       "tangible",
       "concessió i finançament",
       "tangible",
       "servei i dades d'ús"
      ],
      [
       "Grups ciclistes",
       "Escoles",
       "intangible",
       "formació en bici segura",
       "intangible",
       "nova generació ciclista"
      ],
      [
       "Plataforma de mobilitat",
       "Veïnat",
       "intangible",
       "propostes i camins segurs",
       "intangible",
       "participació i dades d'ús"
      ],
      [
       "Plataforma de mobilitat",
       "Ajuntament",
       "intangible",
       "diagnosi ciutadana",
       "tangible",
       "suport i obres"
      ],
      [
       "Escoles",
       "Plataforma de mobilitat",
       "intangible",
       "camins escolars",
       "intangible",
       "acompanyament"
      ]
     ],
     "passos": [
      "Diagnòstic de mobilitat",
      "Camins escolars",
      "Cotxe compartit",
      "Carril bici",
      "Avaluació"
     ],
     "centre": "Plataforma de mobilitat",
     "bona": "La mobilitat canvia quan el veïnat aporta dades del dia a dia: algú ha de recollir-les i portar-les a qui decideix."
    },
    "es": {
     "nom": "Movilidad sostenible",
     "diu": "Moverse mejor con menos coche.",
     "roles": [
      "Vecindario",
      "Ayuntamiento",
      "Transporte público",
      "Grupos ciclistas",
      "Escuelas",
      "Plataforma de movilidad"
     ],
     "pairs": [
      [
       "Ayuntamiento",
       "Vecindario",
       "tangible",
       "carriles, aparcamientos y transporte",
       "intangible",
       "uso y legitimidad"
      ],
      [
       "Escuelas",
       "Vecindario",
       "intangible",
       "caminos escolares",
       "tangible",
       "familias acompañantes"
      ],
      [
       "Grupos ciclistas",
       "Ayuntamiento",
       "intangible",
       "propuestas y diagnóstico",
       "tangible",
       "infraestructura y seguridad"
      ],
      [
       "Transporte público",
       "Vecindario",
       "tangible",
       "frecuencia y cobertura",
       "tangible",
       "demanda y validaciones"
      ],
      [
       "Ayuntamiento",
       "Transporte público",
       "tangible",
       "concesión y financiación",
       "tangible",
       "servicio y datos de uso"
      ],
      [
       "Grupos ciclistas",
       "Escuelas",
       "intangible",
       "formación en bici segura",
       "intangible",
       "nueva generación ciclista"
      ],
      [
       "Plataforma de movilidad",
       "Vecindario",
       "intangible",
       "propuestas y caminos seguros",
       "intangible",
       "participación y datos de uso"
      ],
      [
       "Plataforma de movilidad",
       "Ayuntamiento",
       "intangible",
       "diagnóstico ciudadano",
       "tangible",
       "apoyo y obras"
      ],
      [
       "Escuelas",
       "Plataforma de movilidad",
       "intangible",
       "caminos escolares",
       "intangible",
       "acompañamiento"
      ]
     ],
     "passos": [
      "Diagnóstico de movilidad",
      "Caminos escolares",
      "Coche compartido",
      "Carril bici",
      "Evaluación"
     ],
     "centre": "Plataforma de movilidad",
     "bona": "La movilidad cambia cuando el vecindario aporta datos del día a día: alguien tiene que recogerlos y llevarlos a quien decide."
    },
    "veda": {
     "clau": [
      "**Plataforma → ajuntament: diagnosi ciutadana.** Decidir amb dades del dia a dia.",
      "**Veïnat → plataforma: participació i dades d'ús.** Sense, els canvis no s'entenen.",
      "**Escoles ↔ plataforma: camins escolars.** El primer canvi visible."
     ],
     "preguntes": [
      "On us sentiu insegurs anant a peu o en bici?",
      "Qui recull el que diu el veïnat i ho porta a l'ajuntament?",
      "Per on van les criatures a l'escola?"
     ],
     "falta": [
      "Qui recull les dades i les porta a qui decideix.",
      "Les escoles com a motor del canvi."
     ]
    }
   },
   {
    "id": "acollida",
    "icona": "🫂",
    "paraules": "acogida acollida migrantes migrants refugiados refugiats recién nouvinguts idioma llengua inclusión inclusió",
    "ca": {
     "nom": "Acollida i inclusió",
     "diu": "Integrar i cohesionar amb qui arriba.",
     "roles": [
      "Nouvinguts",
      "Entitats d'acollida",
      "Ajuntament",
      "Veïnat",
      "Escoles",
      "Persones mentores del veïnat"
     ],
     "pairs": [
      [
       "Entitats d'acollida",
       "Nouvinguts",
       "intangible",
       "acompanyament i orientació",
       "intangible",
       "confiança i xarxa pròpia"
      ],
      [
       "Ajuntament",
       "Entitats d'acollida",
       "tangible",
       "recursos i espai",
       "tangible",
       "itineraris i seguiment"
      ],
      [
       "Veïnat",
       "Nouvinguts",
       "intangible",
       "xarxa i pertinença",
       "intangible",
       "nova mirada i barreja"
      ],
      [
       "Escoles",
       "Nouvinguts",
       "tangible",
       "llengua i escolarització",
       "intangible",
       "diversitat a l'aula"
      ],
      [
       "Escoles",
       "Veïnat",
       "intangible",
       "trobada entre famílies",
       "tangible",
       "mans per a les activitats"
      ],
      [
       "Ajuntament",
       "Nouvinguts",
       "tangible",
       "empadronament i drets",
       "intangible",
       "coneixement de les necessitats reals"
      ],
      [
       "Persones mentores del veïnat",
       "Nouvinguts",
       "intangible",
       "llengua i xarxa",
       "intangible",
       "cultura i amistat"
      ],
      [
       "Persones mentores del veïnat",
       "Entitats d'acollida",
       "intangible",
       "temps voluntari",
       "intangible",
       "formació i suport"
      ]
     ],
     "passos": [
      "Mapa de necessitats",
      "Punt d'acollida",
      "Aprenentatge de la llengua",
      "Mentories veïnals",
      "Participació"
     ],
     "centre": "Entitats d'acollida",
     "bona": "Acollir és fer xarxa: una persona del veïnat que acompanya obre més portes que cap tràmit."
    },
    "es": {
     "nom": "Acogida e inclusión",
     "diu": "Integrar y cohesionar con quien llega.",
     "roles": [
      "Recién llegados",
      "Entidades de acogida",
      "Ayuntamiento",
      "Vecindario",
      "Escuelas",
      "Personas mentoras del vecindario"
     ],
     "pairs": [
      [
       "Entidades de acogida",
       "Recién llegados",
       "intangible",
       "acompañamiento y orientación",
       "intangible",
       "confianza y red propia"
      ],
      [
       "Ayuntamiento",
       "Entidades de acogida",
       "tangible",
       "recursos y espacio",
       "tangible",
       "itinerarios y seguimiento"
      ],
      [
       "Vecindario",
       "Recién llegados",
       "intangible",
       "red y pertenencia",
       "intangible",
       "nueva mirada y mezcla"
      ],
      [
       "Escuelas",
       "Recién llegados",
       "tangible",
       "lengua y escolarización",
       "intangible",
       "diversidad en el aula"
      ],
      [
       "Escuelas",
       "Vecindario",
       "intangible",
       "encuentro entre familias",
       "tangible",
       "manos para las actividades"
      ],
      [
       "Ayuntamiento",
       "Recién llegados",
       "tangible",
       "empadronamiento y derechos",
       "intangible",
       "conocimiento de las necesidades reales"
      ],
      [
       "Personas mentoras del vecindario",
       "Recién llegados",
       "intangible",
       "idioma y red",
       "intangible",
       "cultura y amistad"
      ],
      [
       "Personas mentoras del vecindario",
       "Entidades de acogida",
       "intangible",
       "tiempo voluntario",
       "intangible",
       "formación y apoyo"
      ]
     ],
     "passos": [
      "Mapa de necesidades",
      "Punto de acogida",
      "Aprendizaje de la lengua",
      "Mentorías vecinales",
      "Participación"
     ],
     "centre": "Entidades de acogida",
     "bona": "Acoger es hacer red: una persona del vecindario que acompaña abre más puertas que ningún trámite."
    },
    "veda": {
     "clau": [
      "**Persones mentores del veïnat → nouvinguts: llengua i xarxa.** Obre més portes que cap tràmit.",
      "**Entitats d'acollida ↔ ajuntament: recursos i coordinació.** Ningú queda entre dues finestretes.",
      "**Nouvinguts → veïnat: cultura i amistat.** La integració va en dos sentits."
     ],
     "preguntes": [
      "Qui acompanya una persona el primer mes?",
      "Què aporten els nouvinguts al barri?",
      "On es troben veïns i nouvinguts sense un tràmit pel mig?"
     ],
     "falta": [
      "El que aporten els nouvinguts, no només el que reben.",
      "Les mentories veïnals."
     ]
    }
   },
   {
    "id": "territori",
    "icona": "🌳",
    "paraules": "territorio territori naturaleza natura bosque bosc campo camp custodia custòdia medio ambiente medi ambient fincas finques",
    "ca": {
     "nom": "Custòdia del territori",
     "diu": "Tenir cura del medi natural i agrari.",
     "roles": [
      "Custòdia / entitat",
      "Propietaris",
      "Ajuntament",
      "Voluntariat",
      "Pagesia",
      "Escoles i famílies"
     ],
     "pairs": [
      [
       "Propietaris",
       "Custòdia / entitat",
       "tangible",
       "acord de custòdia",
       "intangible",
       "assessorament i manteniment"
      ],
      [
       "Voluntariat",
       "Custòdia / entitat",
       "tangible",
       "hores de conservació",
       "intangible",
       "formació i natura viscuda"
      ],
      [
       "Ajuntament",
       "Custòdia / entitat",
       "tangible",
       "suport i finançament",
       "tangible",
       "indicadors ambientals"
      ],
      [
       "Pagesia",
       "Custòdia / entitat",
       "tangible",
       "gestió agrària compatible",
       "intangible",
       "reconeixement i assessorament"
      ],
      [
       "Pagesia",
       "Propietaris",
       "tangible",
       "ús productiu de la terra",
       "tangible",
       "arrendament i cura"
      ],
      [
       "Ajuntament",
       "Voluntariat",
       "tangible",
       "jornades i materials",
       "intangible",
       "implicació ciutadana"
      ],
      [
       "Escoles i famílies",
       "Custòdia / entitat",
       "intangible",
       "participació i voluntariat de demà",
       "intangible",
       "educació ambiental"
      ]
     ],
     "passos": [
      "Diagnòstic ambiental",
      "Acords de custòdia",
      "Jornades de voluntariat",
      "Recuperació d'hàbitats",
      "Seguiment"
     ],
     "centre": "Custòdia / entitat",
     "bona": "Custodiar el territori és cosa de generacions: les escoles d'avui són el voluntariat de demà."
    },
    "es": {
     "nom": "Custodia del territorio",
     "diu": "Cuidar el medio natural y agrario.",
     "roles": [
      "Custodia / entidad",
      "Propietarios",
      "Ayuntamiento",
      "Voluntariado",
      "Campesinado",
      "Escuelas y familias"
     ],
     "pairs": [
      [
       "Propietarios",
       "Custodia / entidad",
       "tangible",
       "acuerdo de custodia",
       "intangible",
       "asesoramiento y mantenimiento"
      ],
      [
       "Voluntariado",
       "Custodia / entidad",
       "tangible",
       "horas de conservación",
       "intangible",
       "formación y naturaleza vivida"
      ],
      [
       "Ayuntamiento",
       "Custodia / entidad",
       "tangible",
       "apoyo y financiación",
       "tangible",
       "indicadores ambientales"
      ],
      [
       "Campesinado",
       "Custodia / entidad",
       "tangible",
       "gestión agraria compatible",
       "intangible",
       "reconocimiento y asesoramiento"
      ],
      [
       "Campesinado",
       "Propietarios",
       "tangible",
       "uso productivo de la tierra",
       "tangible",
       "arrendamiento y cuidado"
      ],
      [
       "Ayuntamiento",
       "Voluntariado",
       "tangible",
       "jornadas y materiales",
       "intangible",
       "implicación ciudadana"
      ],
      [
       "Escuelas y familias",
       "Custodia / entidad",
       "intangible",
       "participación y voluntariado de mañana",
       "intangible",
       "educación ambiental"
      ]
     ],
     "passos": [
      "Diagnóstico ambiental",
      "Acuerdos de custodia",
      "Jornadas de voluntariado",
      "Recuperación de hábitats",
      "Seguimiento"
     ],
     "centre": "Custodia / entidad",
     "bona": "Custodiar el territorio es cosa de generaciones: las escuelas de hoy son el voluntariado de mañana."
    },
    "veda": {
     "clau": [
      "**Escoles i famílies → custòdia: el voluntariat de demà.** Custodiar és cosa de generacions.",
      "**Propietaris ↔ custòdia: acords i confiança.** Sense, no hi ha terreny on actuar.",
      "**Pagesia ↔ custòdia: gestió del paisatge.** La pagesia és qui el manté cada dia."
     ],
     "preguntes": [
      "Què guanya el propietari amb l'acord de custòdia?",
      "Com hi participa la pagesia?",
      "Quines escoles hi vénen, i tornen?"
     ],
     "falta": [
      "La pagesia com a aliada, no com a obstacle.",
      "L'educació ambiental amb escoles."
     ]
    }
   }
  ];
  /* Els oficis de pimes i autònoms (knowledge/vna/banc-mapes/oficis.json), en català i castellà. */
  var OFICIS = [{"id":"ofici_estudi_creatiu","icona":"🎨","paraules":"marca, identitat, briefing, concepte, disseny, creatividad, propuesta, tipografia, maqueta, estrategia, idea, cliente, encàrrec, portfoli","ca":{"nom":"Estudi creatiu o agència de disseny","diu":"Per a estudis i agències petites que creen marca, comunicació i peces visuals per a empreses i institucions.","roles":["Estudi creatiu","Client","Equip creatiu","Col·laboradors freelance","Proveïdors de producció","Qui recomana","Comunitat del sector"],"pairs":[["Client","Estudi creatiu","tangible","Encàrrec amb pressupost acordat","tangible","Projecte creatiu lliurat"],["Client","Estudi creatiu","intangible","Context i accés a decisors","intangible","Mirada externa sobre la marca"],["Estudi creatiu","Equip creatiu","tangible","Sou i projectes estables","tangible","Feina creativa executada"],["Equip creatiu","Estudi creatiu","intangible","Idees i criteri propi","intangible","Reconeixement i espai per créixer"],["Estudi creatiu","Col·laboradors freelance","tangible","Encàrrecs puntuals pagats","intangible","Coneixement d'especialitat compartit"],["Estudi creatiu","Proveïdors de producció","tangible","Comandes de producció","intangible","Assessorament tècnic de materials"],["Qui recomana","Estudi creatiu","intangible","Recomanació a clients nous","intangible","Bona imatge davant els seus"],["Estudi creatiu","Comunitat del sector","intangible","Portfoli i coneixement publicat","intangible","Visibilitat i reputació creativa"]],"passos":["Definir el tipus de projectes i clients amb què l'estudi aporta més valor.","Establir un procés clar de briefing, proposta, revisions i lliurament.","Formar un equip estable i una xarxa de freelance i proveïdors de confiança.","Cuidar i publicar el portfoli amb casos que expliquin el raonament, no només el resultat.","Cultivar qui recomana i la comunitat del sector amb seguiment i agraïment."],"centre":"Estudi creatiu","bona":"Un bon briefing compartit amb el client estalvia més revisions que qualsevol talent."},"es":{"nom":"Estudio creativo o agencia de diseño","diu":"Para estudios y agencias pequeñas que crean marca, comunicación y piezas visuales para empresas e instituciones.","roles":["Estudio creativo","Cliente","Equipo creativo","Colaboradores freelance","Proveedores de producción","Quien recomienda","Comunidad del sector"],"pairs":[["Cliente","Estudio creativo","tangible","Encargo con presupuesto acordado","tangible","Proyecto creativo entregado"],["Cliente","Estudio creativo","intangible","Contexto y acceso a decisores","intangible","Mirada externa sobre la marca"],["Estudio creativo","Equipo creativo","tangible","Sueldo y proyectos estables","tangible","Trabajo creativo ejecutado"],["Equipo creativo","Estudio creativo","intangible","Ideas y criterio propio","intangible","Reconocimiento y espacio para crecer"],["Estudio creativo","Colaboradores freelance","tangible","Encargos puntuales pagados","intangible","Conocimiento especializado compartido"],["Estudio creativo","Proveedores de producción","tangible","Pedidos de producción","intangible","Asesoramiento técnico de materiales"],["Quien recomienda","Estudio creativo","intangible","Recomendación a clientes nuevos","intangible","Buena imagen ante los suyos"],["Estudio creativo","Comunidad del sector","intangible","Portfolio y conocimiento publicado","intangible","Visibilidad y reputación creativa"]],"passos":["Definir el tipo de proyectos y clientes con los que el estudio aporta más valor.","Establecer un proceso claro de briefing, propuesta, revisiones y entrega.","Formar un equipo estable y una red de freelance y proveedores de confianza.","Cuidar y publicar el portfolio con casos que expliquen el razonamiento, no solo el resultado.","Cultivar a quien recomienda y a la comunidad del sector con seguimiento y agradecimiento."],"centre":"Estudio creativo","bona":"Un buen briefing compartido con el cliente ahorra más revisiones que cualquier talento."},"veda":{"clau":["**Client → Estudi creatiu: context i accés a decisors.** Sense saber què passa a dins, la proposta queda bonica però buida.","**Equip creatiu → Estudi creatiu: idees i criteri propi.** El que es ven és la mirada de l'equip, no només les hores.","**Qui recomana → Estudi creatiu: recomanació a clients nous.** La majoria d'encàrrecs bons arriben per boca d'algú que confia.","**Proveïdors de producció → Estudi creatiu: assessorament tècnic.** Una impremta que avisa a temps salva un llançament."],"preguntes":["D'on va venir el vostre últim client bo?","Qui del client us dona la informació que de debò necessiteu?","A quin proveïdor o freelance truqueu primer quan hi ha un problema?"],"falta":["El temps de revisions i reunions que el client no veu però que l'estudi regala.","El que els freelance aporten de coneixement nou a l'equip intern.","El retorn a qui recomana: gairebé mai se li diu com ha anat."]}},{"id":"ofici_productora_cultural","icona":"🎤","paraules":"gira, caixet, bolos, booking, programació, cartel, rider, producció, sala, festival, subvenció, públic, artistas, directe, escenario","ca":{"nom":"Productora cultural o musical","diu":"Per a productores, agències de booking i promotores que connecten artistes, escenaris i públic.","roles":["Productora","Artistes","Programadors i sales","Públic","Equip tècnic i producció","Institucions i patrocinadors","Mitjans i prescriptors"],"pairs":[["Artistes","Productora","intangible","Confiança i projecte artístic","tangible","Contracte i gestió de gira"],["Productora","Programadors i sales","tangible","Propostes de concert tancades","tangible","Caixet i data confirmada"],["Programadors i sales","Productora","intangible","Informació d'agenda i públic","intangible","Fiabilitat i compliment tècnic"],["Productora","Públic","tangible","Espectacles i entrades","intangible","Fidelitat i boca-orella"],["Mitjans i prescriptors","Públic","intangible","Recomanació i context crític","intangible","Atenció i confiança"],["Productora","Mitjans i prescriptors","intangible","Accés i continguts exclusius","intangible","Visibilitat i reputació"],["Institucions i patrocinadors","Productora","tangible","Subvencions i patrocini","tangible","Memòria d'impacte justificada"],["Equip tècnic i producció","Productora","tangible","Muntatge i tècnica en directe","intangible","Previsió i bon tracte"],["Productora","Artistes","intangible","Criteri i acompanyament de carrera","intangible","Lleialtat i recomanació a col·legues"]],"passos":["Definir la línia artística i el tipus de projectes que la productora vol defensar.","Tancar un catàleg d'artistes amb acords clars de gira, caixets i drets.","Construir relació estable amb programadors, sales i festivals afins.","Formar un equip tècnic de confiança amb calendari i condicions previsibles.","Activar mitjans, prescriptors i patrocinadors amb continguts i dades d'impacte.","Revisar cada temporada què ha funcionat amb artistes, sales i públic."],"centre":"Productora","bona":"Cuida igual l'artista, la sala i l'equip tècnic: la reputació d'una productora es fa bolo a bolo.\n"},"es":{"nom":"Productora cultural o musical","diu":"Para productoras, agencias de booking y promotoras que conectan artistas, escenarios y público.","roles":["Productora","Artistas","Programadores y salas","Público","Equipo técnico y producción","Instituciones y patrocinadores","Medios y prescriptores"],"pairs":[["Artistas","Productora","intangible","Confianza y proyecto artístico","tangible","Contrato y gestión de gira"],["Productora","Programadores y salas","tangible","Propuestas de concierto cerradas","tangible","Caché y fecha confirmada"],["Programadores y salas","Productora","intangible","Información de agenda y público","intangible","Fiabilidad y cumplimiento técnico"],["Productora","Público","tangible","Espectáculos y entradas","intangible","Fidelidad y boca a boca"],["Medios y prescriptores","Público","intangible","Recomendación y contexto crítico","intangible","Atención y confianza"],["Productora","Medios y prescriptores","intangible","Acceso y contenidos exclusivos","intangible","Visibilidad y reputación"],["Instituciones y patrocinadores","Productora","tangible","Subvenciones y patrocinio","tangible","Memoria de impacto justificada"],["Equipo técnico y producción","Productora","tangible","Montaje y técnica en directo","intangible","Previsión y buen trato"],["Productora","Artistas","intangible","Criterio y acompañamiento de carrera","intangible","Lealtad y recomendación a colegas"]],"passos":["Definir la línea artística y el tipo de proyectos que la productora quiere defender.","Cerrar un catálogo de artistas con acuerdos claros de gira, cachés y derechos.","Construir relación estable con programadores, salas y festivales afines.","Formar un equipo técnico de confianza con calendario y condiciones previsibles.","Activar medios, prescriptores y patrocinadores con contenidos y datos de impacto.","Revisar cada temporada qué ha funcionado con artistas, salas y público."],"centre":"Productora","bona":"Cuida por igual al artista, la sala y el equipo técnico: la reputación de una productora se hace bolo a bolo."},"veda":{"clau":["**Artistes → Productora: confiança.** L'artista posa la seva carrera en mans de qui el mou.","**Programadors i sales → Productora: informació.** Saben quin públic tenen i què encaixa a l'agenda.","**Mitjans i prescriptors → Públic: recomanació.** Una crítica o una playlist omple més que un cartell.","**Productora → Artistes: criteri.** Dir que no a un bolo també és acompanyar una carrera."],"preguntes":["Quina sala o festival et torna a trucar sense que insisteixis?","Quin artista t'ha arribat per recomanació d'un altre artista?","Qui de l'equip tècnic et falta quan no pot venir a un bolo?"],"falta":["El coneixement i la paciència de l'equip tècnic que salva els directes.","La relació entre artistes que es recomanen productores entre ells.","El públic fidel que torna i arrossega amics sense cap campanya."]}},{"id":"ofici_escola_idiomes","icona":"🗣️","paraules":"idiomes, idiomas, classes, clases, alumnes, alumnos, nivell, nivel, exàmens, exámenes, grups, grupos, professorat, certificat, matrícula","ca":{"nom":"Escola d'idiomes o acadèmia","diu":"Per a acadèmies i escoles d'idiomes de barri o de ciutat amb grups reduïts, preparació d'exàmens oficials i formació per a empreses.","roles":["Acadèmia","Alumnes","Famílies","Equip docent","Centres examinadors","Empreses","Qui recomana"],"pairs":[["Acadèmia","Alumnes","tangible","classes en grups reduïts","tangible","quota mensual"],["Acadèmia","Famílies","intangible","informes de progrés clars","intangible","confiança i continuïtat"],["Equip docent","Alumnes","intangible","atenció i seguiment personal","intangible","esforç i progrés visible"],["Acadèmia","Equip docent","tangible","sou i formació contínua","intangible","idees i coneixement d'aula"],["Acadèmia","Centres examinadors","tangible","candidats inscrits i preparats","intangible","reconeixement com a centre"],["Acadèmia","Empreses","tangible","cursos a mida in company","tangible","contracte anual de formació"],["Qui recomana","Famílies","intangible","recomanació de confiança","intangible","gratitud i vincle"],["Acadèmia","Qui recomana","intangible","tracte proper i reconeixement","intangible","nous alumnes referits"],["Alumnes","Equip docent","intangible","opinió sobre les classes","intangible","ajust del ritme"]],"passos":["Definir el públic i els nivells: infants, adults, exàmens o empresa.","Formar l'equip docent amb un mètode i uns criteris comuns.","Posar en marxa la prova de nivell i el seguiment de cada alumne.","Explicar el progrés a alumnes i famílies cada trimestre.","Tancar aliances amb centres examinadors i empreses de la zona.","Cuidar i agrair qui ens recomana."],"centre":"Acadèmia","bona":"Fes visible el progrés de cada alumne cada trimestre: és el que fa que les famílies renovin i recomanin."},"es":{"nom":"Escuela de idiomas o academia","diu":"Para academias y escuelas de idiomas de barrio o de ciudad con grupos reducidos, preparación de exámenes oficiales y formación para empresas.","roles":["Academia","Alumnos","Familias","Equipo docente","Centros examinadores","Empresas","Quien recomienda"],"pairs":[["Academia","Alumnos","tangible","clases en grupos reducidos","tangible","cuota mensual"],["Academia","Familias","intangible","informes de progreso claros","intangible","confianza y continuidad"],["Equipo docente","Alumnos","intangible","atención y seguimiento personal","intangible","esfuerzo y progreso visible"],["Academia","Equipo docente","tangible","sueldo y formación continua","intangible","ideas y conocimiento de aula"],["Academia","Centros examinadores","tangible","candidatos inscritos y preparados","intangible","reconocimiento como centro"],["Academia","Empresas","tangible","cursos a medida in company","tangible","contrato anual de formación"],["Quien recomienda","Familias","intangible","recomendación de confianza","intangible","gratitud y vínculo"],["Academia","Quien recomienda","intangible","trato cercano y reconocimiento","intangible","nuevos alumnos referidos"],["Alumnos","Equipo docente","intangible","opinión sobre las clases","intangible","ajuste del ritmo"]],"passos":["Definir el público y los niveles: niños, adultos, exámenes o empresa.","Formar al equipo docente con un método y unos criterios comunes.","Poner en marcha la prueba de nivel y el seguimiento de cada alumno.","Explicar el progreso a alumnos y familias cada trimestre.","Cerrar alianzas con centros examinadores y empresas de la zona.","Cuidar y agradecer a quien nos recomienda."],"centre":"Academia","bona":"Haz visible el progreso de cada alumno cada trimestre: es lo que hace que las familias renueven y recomienden."},"veda":{"clau":["**Equip docent → Alumnes: motivació.** Sense vincle amb el professor, l'alumne abandona abans de l'estiu.","**Acadèmia → Famílies: visibilitat del progrés.** Les famílies paguen pel que veuen avançar.","**Qui recomana → Famílies: confiança.** La majoria d'alumnes nous arriben pel boca-orella del barri o de l'escola.","**Centres examinadors → Acadèmia: prestigi.** Els aprovats als exàmens oficials són la millor carta de presentació."],"preguntes":["D'on va venir l'últim alumne que es va matricular?","Quan vau explicar per última vegada a una família com avança el seu fill?","Si un professor marxés demà, què es perdria?"],"falta":["El coneixement que el professorat té de cada alumne i que es perd quan marxa.","El paper de les escoles i les AFA com a prescriptores.","L'opinió dels alumnes que deixen el curs a mitges."]}},{"id":"ofici_allotjament_rural","icona":"🏡","paraules":"acollida, acogida, masia, tranquil·litat, esmorzar, desayuno, entorn, territorio, hostes, huéspedes, proximitat, natura, detalls, encanto, família","ca":{"nom":"Casa rural o allotjament amb encant","diu":"Per a qui obre casa seva a hostes i vol que el territori formi part de l'estada.","roles":["Casa rural","Hostes","Qui recomana","Equip de neteja i manteniment","Productors locals","Activitats i restaurants de l'entorn","Plataformes de reserva","Ens de turisme local"],"pairs":[["Casa rural","Hostes","tangible","Estada i esmorzar casolà","tangible","Pagament de la reserva"],["Casa rural","Hostes","intangible","Acollida i consells de l'entorn","intangible","Ressenya sincera i confiança"],["Qui recomana","Casa rural","intangible","Hostes afins recomanats","intangible","Agraïment i tracte preferent"],["Casa rural","Equip de neteja i manteniment","tangible","Sou o tarifa acordada","tangible","Habitacions netes a temps"],["Equip de neteja i manteniment","Casa rural","intangible","Avisos de detalls i avaries","intangible","Confiança i autonomia"],["Productors locals","Casa rural","tangible","Producte de proximitat","tangible","Compra regular i pagament"],["Casa rural","Activitats i restaurants de l'entorn","intangible","Clients recomanats amb criteri","intangible","Recomanacions creuades"],["Plataformes de reserva","Casa rural","tangible","Visibilitat i reserves","tangible","Comissió per reserva"],["Ens de turisme local","Casa rural","intangible","Promoció del territori","intangible","Implicació i coneixement local"]],"passos":["Definir quin tipus d'hoste encaixa amb la casa i el territori.","Teixir acords amb productors, restaurants i activitats de l'entorn.","Preparar l'equip amb protocols clars i espai per avisar de detalls.","Combinar plataformes amb reserva directa i recomanació d'antics hostes.","Recollir opinions després de cada estada i ajustar l'experiència."],"centre":"Casa rural","bona":"Cuidar l'acollida i el vincle amb l'entorn tant com les habitacions, perquè és el que fa tornar i recomanar."},"es":{"nom":"Casa rural o alojamiento con encanto","diu":"Para quien abre su casa a huéspedes y quiere que el territorio forme parte de la estancia.","roles":["Casa rural","Huéspedes","Quien recomienda","Equipo de limpieza y mantenimiento","Productores locales","Actividades y restaurantes del entorno","Plataformas de reserva","Ente de turismo local"],"pairs":[["Casa rural","Huéspedes","tangible","Estancia y desayuno casero","tangible","Pago de la reserva"],["Casa rural","Huéspedes","intangible","Acogida y consejos del entorno","intangible","Reseña sincera y confianza"],["Quien recomienda","Casa rural","intangible","Huéspedes afines recomendados","intangible","Agradecimiento y trato preferente"],["Casa rural","Equipo de limpieza y mantenimiento","tangible","Sueldo o tarifa acordada","tangible","Habitaciones limpias a tiempo"],["Equipo de limpieza y mantenimiento","Casa rural","intangible","Avisos de detalles y averías","intangible","Confianza y autonomía"],["Productores locales","Casa rural","tangible","Producto de proximidad","tangible","Compra regular y pago"],["Casa rural","Actividades y restaurantes del entorno","intangible","Clientes recomendados con criterio","intangible","Recomendaciones cruzadas"],["Plataformas de reserva","Casa rural","tangible","Visibilidad y reservas","tangible","Comisión por reserva"],["Ente de turismo local","Casa rural","intangible","Promoción del territorio","intangible","Implicación y conocimiento local"]],"passos":["Definir qué tipo de huésped encaja con la casa y el territorio.","Tejer acuerdos con productores, restaurantes y actividades del entorno.","Preparar al equipo con protocolos claros y espacio para avisar de detalles.","Combinar plataformas con reserva directa y recomendación de antiguos huéspedes.","Recoger opiniones tras cada estancia y ajustar la experiencia."],"centre":"Casa rural","bona":"Cuidar la acogida y el vínculo con el entorno tanto como las habitaciones, porque es lo que hace volver y recomendar."},"veda":{"clau":["**Casa rural → Hostes: acollida i consells.** La manera de rebre i orientar és el que l'hoste recorda i explica.","**Hostes → Casa rural: ressenya sincera.** Una opinió honesta dona confiança als futurs hostes i orienta millores.","**Qui recomana → Casa rural: hostes afins.** Els antics hostes porten gent que encaixa amb l'estil de la casa.","**Casa rural → Activitats i restaurants de l'entorn: clients amb criteri.** Recomanar bé l'entorn fa que l'entorn també et recomani."],"preguntes":["D'on van venir els tres últims hostes que van repetir o recomanar-te?","A quins restaurants o activitats envies hostes, i ells t'envien algú a tu?","Què et va avisar l'equip l'últim mes que no haguessis vist tu?"],"falta":["Els avisos de l'equip sobre petits detalls que eviten queixes.","El retorn dels productors i negocis de l'entorn quan envien gent a la casa.","La implicació amb el poble i el que el territori aporta a l'estada."]}},{"id":"ofici_formacio_professionals","icona":"🎓","paraules":"formació, formación, docents, claustro, acompanyament, aula, pràctica, certificat, homologación, metodologia, competències, mentoría, comunitat, innovación","ca":{"nom":"Formació de professionals","diu":"Per a centres i persones que formen docents i altres professionals i volen que la formació canviï la pràctica real.","roles":["Centre de formació","Docents en formació","Escoles i equips directius","Administració educativa","Equip de formadors","Docents que recomanen","Universitats i experts"],"pairs":[["Centre de formació","Docents en formació","tangible","cursos certificats i materials","tangible","matrícula i assistència"],["Centre de formació","Escoles i equips directius","tangible","formació a mida al claustre","tangible","contracte i pagament"],["Administració educativa","Centre de formació","tangible","homologació de les activitats","tangible","memòries i assistència justificades"],["Centre de formació","Equip de formadors","tangible","encàrrecs i honoraris","intangible","millores als materials"],["Equip de formadors","Docents en formació","intangible","acompanyament després del curs","intangible","casos reals d'aula"],["Docents que recomanen","Centre de formació","intangible","recomanació a companys","intangible","reconeixement i primícies"],["Universitats i experts","Centre de formació","intangible","evidència i recerca actualitzada","intangible","accés a aules reals"],["Docents en formació","Escoles i equips directius","intangible","pràctiques noves a l'aula","intangible","temps per aplicar-les"],["Escoles i equips directius","Centre de formació","intangible","necessitats reals del claustre","intangible","confiança a llarg termini"]],"passos":["Escolta escoles i docents per detectar necessitats reals abans de dissenyar.","Dissenya formacions curtes, pràctiques i aplicables a l'aula.","Tramita l'homologació i deixa clar què certifica cada curs.","Cohesiona l'equip de formadors amb un estil i materials compartits.","Fes seguiment després del curs i recull evidències d'aplicació."],"centre":"Centre de formació","bona":"Una formació acaba quan es veu a l'aula, no quan es lliura el certificat."},"es":{"nom":"Formación de profesionales","diu":"Para centros y personas que forman a docentes y otros profesionales y quieren que la formación cambie la práctica real.","roles":["Centro de formación","Docentes en formación","Escuelas y equipos directivos","Administración educativa","Equipo de formadores","Docentes que recomiendan","Universidades y expertos"],"pairs":[["Centro de formación","Docentes en formación","tangible","cursos certificados y materiales","tangible","matrícula y asistencia"],["Centro de formación","Escuelas y equipos directivos","tangible","formación a medida al claustro","tangible","contrato y pago"],["Administración educativa","Centro de formación","tangible","homologación de las actividades","tangible","memorias y asistencia justificadas"],["Centro de formación","Equipo de formadores","tangible","encargos y honorarios","intangible","mejoras en los materiales"],["Equipo de formadores","Docentes en formación","intangible","acompañamiento después del curso","intangible","casos reales de aula"],["Docentes que recomiendan","Centro de formación","intangible","recomendación a compañeros","intangible","reconocimiento y primicias"],["Universidades y expertos","Centro de formación","intangible","evidencia e investigación actualizada","intangible","acceso a aulas reales"],["Docentes en formación","Escuelas y equipos directivos","intangible","prácticas nuevas en el aula","intangible","tiempo para aplicarlas"],["Escuelas y equipos directivos","Centro de formación","intangible","necesidades reales del claustro","intangible","confianza a largo plazo"]],"passos":["Escucha a escuelas y docentes para detectar necesidades reales antes de diseñar.","Diseña formaciones cortas, prácticas y aplicables en el aula.","Tramita la homologación y deja claro qué certifica cada curso.","Cohesiona el equipo de formadores con un estilo y materiales compartidos.","Haz seguimiento después del curso y recoge evidencias de aplicación."],"centre":"Centro de formación","bona":"Una formación termina cuando se ve en el aula, no cuando se entrega el certificado."},"veda":{"clau":["**Equip de formadors → Docents en formació: acompanyament després del curs.** És el que converteix una sessió en un canvi real a l'aula.","**Docents que recomanen → Centre de formació: recomanació a companys.** Moltes inscripcions arriben de boca a orella dins del claustre.","**Escoles i equips directius → Centre de formació: necessitats reals del claustre.** Sense aquest diagnòstic es fan cursos que ningú aplica.","**Universitats i experts → Centre de formació: evidència actualitzada.** Dona credibilitat i evita modes pedagògiques sense base."],"preguntes":["Qui us va recomanar l'última vegada que es va omplir un curs?","Què feu amb un docent un mes després d'acabar la formació?","Quina escola us ha demanat una segona formació, i per què?"],"falta":["El temps que l'escola dona, o no, al docent per aplicar el que ha après.","El que els formadors aprenen dels docents i torna als materials.","La relació entre docents d'una mateixa formació un cop acabada."]}},{"id":"ofici_coworking","icona":"🪑","paraules":"comunitat, comunidad, escriptori, mesa, sala, quota, autònoms, emprendedores, sinergies, ambient, flexibilitat, networking, conexiones, acollida","ca":{"nom":"Espai de coworking","diu":"Per a qui gestiona un espai de treball compartit on autònoms, petites empreses i professionals en remot hi troben lloc, servei i comunitat.","roles":["Espai de coworking","Equip de comunitat","Membres","Qui recomana","Empreses que lloguen sales","Propietat del local","Xarxa local d'emprenedoria"],"pairs":[["Espai de coworking","Membres","tangible","lloc de treball equipat","tangible","quota mensual"],["Equip de comunitat","Membres","intangible","presentacions entre membres","intangible","confiança i feedback"],["Membres","Espai de coworking","intangible","ambient i bona reputació","intangible","sentit de pertinença"],["Qui recomana","Espai de coworking","intangible","nous membres de confiança","intangible","reconeixement i visibilitat"],["Espai de coworking","Equip de comunitat","tangible","sou i eines","intangible","coneixement del dia a dia"],["Espai de coworking","Empreses que lloguen sales","tangible","sales per a reunions","tangible","pagament per ús"],["Equip de comunitat","Empreses que lloguen sales","intangible","acollida i atenció","intangible","contactes amb nous clients"],["Propietat del local","Espai de coworking","tangible","local en lloguer estable","tangible","renda puntual"],["Xarxa local d'emprenedoria","Espai de coworking","intangible","derivació d'emprenedors","intangible","espai per a activitats"]],"passos":["Definir per a quin tipus de professional és l'espai i quin ambient s'hi vol.","Acordar amb la propietat un lloguer estable i adequar el local.","Posar a punt llocs, sales, connexió i normes de convivència senzilles.","Designar qui fa d'amfitrió i acull i presenta cada membre nou.","Obrir l'espai a la xarxa local amb activitats i demanar recomanacions als membres satisfets."],"centre":"Espai de coworking","bona":"Presenta cada membre nou a almenys dues persones de la comunitat durant la primera setmana.](no)"},"es":{"nom":"Espacio de coworking","diu":"Para quien gestiona un espacio de trabajo compartido donde autónomos, pequeñas empresas y profesionales en remoto encuentran sitio, servicio y comunidad.","roles":["Espacio de coworking","Equipo de comunidad","Miembros","Quien recomienda","Empresas que alquilan salas","Propiedad del local","Red local de emprendimiento"],"pairs":[["Espacio de coworking","Miembros","tangible","puesto de trabajo equipado","tangible","cuota mensual"],["Equipo de comunidad","Miembros","intangible","presentaciones entre miembros","intangible","confianza y feedback"],["Miembros","Espacio de coworking","intangible","ambiente y buena reputación","intangible","sentido de pertenencia"],["Quien recomienda","Espacio de coworking","intangible","nuevos miembros de confianza","intangible","reconocimiento y visibilidad"],["Espacio de coworking","Equipo de comunidad","tangible","sueldo y herramientas","intangible","conocimiento del día a día"],["Espacio de coworking","Empresas que alquilan salas","tangible","salas para reuniones","tangible","pago por uso"],["Equipo de comunidad","Empresas que alquilan salas","intangible","acogida y atención","intangible","contactos con nuevos clientes"],["Propiedad del local","Espacio de coworking","tangible","local en alquiler estable","tangible","renta puntual"],["Red local de emprendimiento","Espacio de coworking","intangible","derivación de emprendedores","intangible","espacio para actividades"]],"passos":["Definir para qué tipo de profesional es el espacio y qué ambiente se quiere.","Acordar con la propiedad un alquiler estable y adecuar el local.","Poner a punto puestos, salas, conexión y normas de convivencia sencillas.","Designar quién hace de anfitrión y acoge y presenta a cada miembro nuevo.","Abrir el espacio a la red local con actividades y pedir recomendaciones a los miembros satisfechos."],"centre":"Espacio de coworking","bona":"Presenta a cada miembro nuevo al menos a dos personas de la comunidad durante su primera semana."},"veda":{"clau":["**Equip de comunitat → Membres: presentacions.** Una bona presentació val més que una taula millor.","**Membres → Espai de coworking: ambient.** L'ambient el fan els membres i és el que es ven.","**Qui recomana → Espai de coworking: membres de confiança.** La majoria de membres nous arriben per boca-orella.","**Xarxa local d'emprenedoria → Espai de coworking: derivació.** Les entitats locals envien gent que busca on començar."],"preguntes":["Com va arribar el darrer membre que s'hi ha apuntat?","Quins membres han treballat junts després de conèixer-se aquí?","Qui acull la persona nova el primer dia?"],"falta":["Els encàrrecs i col·laboracions que neixen entre membres gràcies a l'espai.","El que l'equip de comunitat sap de cada membre i que no està escrit enlloc.","El que reben les empreses que lloguen sales a més de la sala."]}},{"id":"ofici_experiencies_turistiques","icona":"🧭","paraules":"ruta, territori, territorio, grup, grupo, història, historia, relat, tast, cata, sortida, salida, local, experiència, guia","ca":{"nom":"Guia o experiències turístiques","diu":"Per a guies i petites empreses que dissenyen i condueixen visites, rutes i experiències al territori.","roles":["Guia d'experiències","Viatger","Qui recomana","Equip de guies","Plataforma de reserves","Proveïdors locals","Comunitat i territori"],"pairs":[["Guia d'experiències","Viatger","tangible","experiència guiada reservada","tangible","pagament de la reserva"],["Viatger","Guia d'experiències","intangible","ressenya i fotos compartides","intangible","atenció personal i consells"],["Qui recomana","Guia d'experiències","intangible","recomanació als seus hostes","intangible","hostes ben atesos"],["Guia d'experiències","Qui recomana","intangible","calendari de sortides actualitzat","intangible","confiança per recomanar"],["Guia d'experiències","Equip de guies","tangible","torns i remuneració justa","intangible","coneixement i entusiasme"],["Equip de guies","Guia d'experiències","intangible","retorn de cada grup","intangible","formació i reconeixement"],["Plataforma de reserves","Guia d'experiències","tangible","reserves i visibilitat","tangible","comissió per reserva"],["Proveïdors locals","Guia d'experiències","tangible","tastos i espais acordats","tangible","grups i pagament puntual"],["Comunitat i territori","Guia d'experiències","intangible","història i acollida veïnal","intangible","respecte i retorn local"]],"passos":["Definir l'experiència: què es viu, per a qui i per què aquí.","Pactar amb proveïdors locals i la comunitat què s'hi aporta i què hi torna.","Preparar l'equip de guies amb el relat, la seguretat i el to de la casa.","Obrir canals de reserva propis i de plataforma, i informar qui recomana.","Recollir el retorn de cada grup i ajustar ruta, ritme i relat."],"centre":"Guia d'experiències","bona":"Cuida el territori i qui hi viu tant com el viatger: sense el seu permís tàcit no hi ha experiència.Ara bé, revisa-ho sovint.\n"},"es":{"nom":"Guía o experiencias turísticas","diu":"Para guías y pequeñas empresas que diseñan y conducen visitas, rutas y experiencias en el territorio.","roles":["Guía de experiencias","Viajero","Quien recomienda","Equipo de guías","Plataforma de reservas","Proveedores locales","Comunidad y territorio"],"pairs":[["Guía de experiencias","Viajero","tangible","experiencia guiada reservada","tangible","pago de la reserva"],["Viajero","Guía de experiencias","intangible","reseña y fotos compartidas","intangible","atención personal y consejos"],["Quien recomienda","Guía de experiencias","intangible","recomendación a sus huéspedes","intangible","huéspedes bien atendidos"],["Guía de experiencias","Quien recomienda","intangible","calendario de salidas actualizado","intangible","confianza para recomendar"],["Guía de experiencias","Equipo de guías","tangible","turnos y remuneración justa","intangible","conocimiento y entusiasmo"],["Equipo de guías","Guía de experiencias","intangible","retorno de cada grupo","intangible","formación y reconocimiento"],["Plataforma de reservas","Guía de experiencias","tangible","reservas y visibilidad","tangible","comisión por reserva"],["Proveedores locales","Guía de experiencias","tangible","catas y espacios acordados","tangible","grupos y pago puntual"],["Comunidad y territorio","Guía de experiencias","intangible","historia y acogida vecinal","intangible","respeto y retorno local"]],"passos":["Definir la experiencia: qué se vive, para quién y por qué aquí.","Pactar con proveedores locales y la comunidad qué se aporta y qué vuelve.","Preparar al equipo de guías con el relato, la seguridad y el tono de la casa.","Abrir canales de reserva propios y de plataforma, e informar a quien recomienda.","Recoger el retorno de cada grupo y ajustar ruta, ritmo y relato."],"centre":"Guía de experiencias","bona":"Cuida el territorio y a quien vive en él tanto como al viajero: sin su permiso tácito no hay experiencia."},"veda":{"clau":["**Viatger → Guia d'experiències: ressenya.** Una ressenya concreta i amb fotos val més que qualsevol anunci.","**Qui recomana → Guia d'experiències: recomanació.** Recepcions i allotjaments envien hostes només si confien que tornaran contents.","**Equip de guies → Guia d'experiències: retorn dels grups.** Qui guia cada dia sap què funciona i què avorreix.","**Comunitat i territori → Guia d'experiències: acollida.** Els veïns i la seva història són la matèria primera de l'experiència."],"preguntes":["D'on van venir els tres últims grups que vau tenir?","Qui us envia clients sense cobrar res i què rep a canvi?","Què us diu el veïnat quan passeu amb un grup?"],"falta":["El que l'experiència retorna als veïns i al territori més enllà de pagar proveïdors.","La informació que cal donar a qui recomana perquè ho faci bé.","El coneixement que els guies acumulen i que es perd quan marxen."]}},{"id":"ofici_celler","icona":"🍇","paraules":"verema, vendimia, vinya, viña, celler, bodega, raïm, uva, criança, crianza, terrer, terruño, tast, cata, família","ca":{"nom":"Celler familiar","diu":"Per a cellers de família que elaboren vi de les seves vinyes o de veïns i el venen a prop, a restaurants i a qui els visita.","roles":["Celler familiar","Equip","Viticultors veïns","Restaurants i vinoteques","Visitants d'enoturisme","Club de clients","Qui recomana"],"pairs":[["Viticultors veïns","Celler familiar","tangible","raïm de parcel·les conegudes","intangible","assessorament de vinya compartit"],["Celler familiar","Restaurants i vinoteques","tangible","vi i fitxes tècniques","tangible","comandes i pagament puntual"],["Restaurants i vinoteques","Celler familiar","intangible","opinió dels comensals","intangible","relat i formació del personal"],["Celler familiar","Visitants d'enoturisme","tangible","visita i tast guiats","intangible","ressenyes i fotos compartides"],["Qui recomana","Celler familiar","intangible","prescripció a taula i guies","intangible","accés a vinya i elaborador"],["Equip","Celler familiar","intangible","ofici i coneixement de collita","tangible","sou i calendari estable"],["Celler familiar","Equip","intangible","confiança i veu en decisions","intangible","idees i compromís a la verema"],["Club de clients","Celler familiar","tangible","quotes i compres anuals","intangible","fidelitat i boca-orella"],["Qui recomana","Visitants d'enoturisme","intangible","recomanació de visitar el celler","intangible","experiència per explicar"]],"passos":["Dibuixar d'on ve cada raïm i quina relació hi ha amb cada viticultor.","Escriure el relat del celler: família, vinyes i manera d'elaborar.","Triar pocs restaurants i vinoteques afins i cuidar-los amb visites i formació.","Obrir el celler a visites guiades amb tast i recollir contactes.","Convertir els visitants que repeteixen en un club de clients amb preestrenes.","Revisar després de cada verema què ha après l'equip i què han dit els clients."],"centre":"Celler familiar","bona":"Cuida el viticultor, l'equip i qui et recomana com cuides la vinya: el vi que es ven sol neix d'aquestes relacions."},"es":{"nom":"Bodega familiar","diu":"Para bodegas de familia que elaboran vino de sus viñas o de vecinos y lo venden cerca, a restaurantes y a quien las visita.","roles":["Bodega familiar","Equipo","Viticultores vecinos","Restaurantes y vinotecas","Visitantes de enoturismo","Club de clientes","Quien recomienda"],"pairs":[["Viticultores vecinos","Bodega familiar","tangible","uva de parcelas conocidas","intangible","asesoramiento de viña compartido"],["Bodega familiar","Restaurantes y vinotecas","tangible","vino y fichas técnicas","tangible","pedidos y pago puntual"],["Restaurantes y vinotecas","Bodega familiar","intangible","opinión de los comensales","intangible","relato y formación del personal"],["Bodega familiar","Visitantes de enoturismo","tangible","visita y cata guiadas","intangible","reseñas y fotos compartidas"],["Quien recomienda","Bodega familiar","intangible","prescripción en mesa y guías","intangible","acceso a viña y elaborador"],["Equipo","Bodega familiar","intangible","oficio y conocimiento de cosecha","tangible","sueldo y calendario estable"],["Bodega familiar","Equipo","intangible","confianza y voz en decisiones","intangible","ideas y compromiso en vendimia"],["Club de clientes","Bodega familiar","tangible","cuotas y compras anuales","intangible","fidelidad y boca a boca"],["Quien recomienda","Visitantes de enoturismo","intangible","recomendación de visitar la bodega","intangible","experiencia para contar"]],"passos":["Dibujar de dónde viene cada uva y qué relación hay con cada viticultor.","Escribir el relato de la bodega: familia, viñas y forma de elaborar.","Elegir pocos restaurantes y vinotecas afines y cuidarlos con visitas y formación.","Abrir la bodega a visitas guiadas con cata y recoger contactos.","Convertir a los visitantes que repiten en un club de clientes con preestrenos.","Revisar tras cada vendimia qué ha aprendido el equipo y qué han dicho los clientes."],"centre":"Bodega familiar","bona":"Cuida al viticultor, al equipo y a quien te recomienda como cuidas la viña: el vino que se vende solo nace de esas relaciones."},"veda":{"clau":["**Viticultors veïns → Celler familiar: coneixement de la parcel·la.** Saber com s'ha comportat cada vinya decideix la data de verema.","**Qui recomana → Celler familiar: prescripció a taula.** Un sommelier que explica el vi ven més que qualsevol anunci.","**Visitants d'enoturisme → Celler familiar: ressenyes i fotos.** La visita viscuda es converteix en reputació pública.","**Equip → Celler familiar: ofici de collita.** El que sap l'equip de la verema no està escrit enlloc."],"preguntes":["Quin viticultor us truca abans de la verema per explicar-vos com està la vinya?","Quin restaurant o sommelier us ha portat més clients aquest any sense demanar res?","Què us diuen els visitants en acabar el tast que no surt a cap ressenya?"],"falta":["El relat i la formació que el celler dona al personal de sala dels restaurants.","L'assessorament de vinya que el celler torna als viticultors veïns.","La veu de la generació següent de la família en les decisions."]}},{"id":"ofici_esdeveniments","icona":"🎪","paraules":"esdeveniments, eventos, logística, proveïdors, proveedores, càtering, escaleta, imprevistos, briefing, muntatge, montaje, invitats, invitados, coordinació, timing","ca":{"nom":"Organització d'esdeveniments","diu":"Per a qui organitza esdeveniments, de petits actes a congressos, i coordina clients, proveïdors i equip perquè tot surti bé el dia clau.","roles":["Organitzadora d'esdeveniments","Client","Assistents","Proveïdors","Equip i col·laboradors","Qui recomana","Patrocinadors"],"pairs":[["Client","Organitzadora d'esdeveniments","tangible","encàrrec i pagament","tangible","esdeveniment llest i coordinat"],["Client","Organitzadora d'esdeveniments","intangible","confiança i marge per decidir","intangible","tranquil·litat el dia clau"],["Organitzadora d'esdeveniments","Proveïdors","tangible","comandes ben especificades","tangible","servei puntual i correcte"],["Proveïdors","Organitzadora d'esdeveniments","intangible","flexibilitat d'última hora","intangible","fidelitat i bona paraula"],["Organitzadora d'esdeveniments","Equip i col·laboradors","tangible","feina i honoraris","intangible","compromís el dia D"],["Equip i col·laboradors","Organitzadora d'esdeveniments","intangible","avisos de problemes a temps","intangible","reconeixement i aprenentatge"],["Organitzadora d'esdeveniments","Assistents","intangible","experiència ben cuidada","intangible","opinions i fotos compartides"],["Qui recomana","Organitzadora d'esdeveniments","intangible","recomanació a nous clients","intangible","agraïment i feina ben feta"],["Patrocinadors","Organitzadora d'esdeveniments","tangible","aportació econòmica pactada","tangible","visibilitat i dades acordades"]],"passos":["Fer un briefing a fons amb el client: objectiu, públic, pressupost i què vol que recordin.","Triar i confirmar proveïdors de confiança amb encàrrecs per escrit i un pla B.","Muntar l'equip i repartir rols clars amb una escaleta compartida.","Executar el dia D amb un sol punt de coordinació i comunicació ràpida.","Tancar amb el client i l'equip: recollir opinions, agrair i demanar recomanacions."],"centre":"Organitzadora d'esdeveniments","bona":"Cuida els proveïdors i l'equip com si fossin clients: són ells qui et salven quan apareix l'imprevist."},"es":{"nom":"Organización de eventos","diu":"Para quien organiza eventos, de pequeños actos a congresos, y coordina clientes, proveedores y equipo para que todo salga bien el día clave.","roles":["Organizadora de eventos","Cliente","Asistentes","Proveedores","Equipo y colaboradores","Quien recomienda","Patrocinadores"],"pairs":[["Cliente","Organizadora de eventos","tangible","encargo y pago","tangible","evento listo y coordinado"],["Cliente","Organizadora de eventos","intangible","confianza y margen para decidir","intangible","tranquilidad el día clave"],["Organizadora de eventos","Proveedores","tangible","pedidos bien especificados","tangible","servicio puntual y correcto"],["Proveedores","Organizadora de eventos","intangible","flexibilidad de última hora","intangible","fidelidad y buena palabra"],["Organizadora de eventos","Equipo y colaboradores","tangible","trabajo y honorarios","intangible","compromiso el día D"],["Equipo y colaboradores","Organizadora de eventos","intangible","avisos de problemas a tiempo","intangible","reconocimiento y aprendizaje"],["Organizadora de eventos","Asistentes","intangible","experiencia bien cuidada","intangible","opiniones y fotos compartidas"],["Quien recomienda","Organizadora de eventos","intangible","recomendación a nuevos clientes","intangible","agradecimiento y trabajo bien hecho"],["Patrocinadores","Organizadora de eventos","tangible","aportación económica pactada","tangible","visibilidad y datos acordados"]],"passos":["Hacer un briefing a fondo con el cliente: objetivo, público, presupuesto y qué quiere que recuerden.","Elegir y confirmar proveedores de confianza con encargos por escrito y un plan B.","Montar el equipo y repartir roles claros con una escaleta compartida.","Ejecutar el día D con un solo punto de coordinación y comunicación rápida.","Cerrar con el cliente y el equipo: recoger opiniones, agradecer y pedir recomendaciones."],"centre":"Organizadora de eventos","bona":"Cuida a proveedores y equipo como si fueran clientes: son ellos quienes te salvan cuando aparece el imprevisto."},"veda":{"clau":["**Client → organitzadora: confiança.** Sense marge per decidir, cada detall es converteix en una negociació.","**Proveïdors → organitzadora: flexibilitat d'última hora.** És el que salva l'esdeveniment quan alguna cosa falla.","**Equip → organitzadora: avisos a temps.** Un problema detectat aviat és un problema petit.","**Qui recomana → organitzadora: nous clients.** La major part de la feina arriba per boca-orella."],"preguntes":["Quin proveïdor et va treure d'un apuro l'últim any i com li ho vas agrair?","D'on va venir el teu últim client?","Què fas el dia després d'un esdeveniment amb l'equip i amb el client?"],"falta":["La tranquil·litat que rep el client el dia clau, que és el que realment compra.","Els aprenentatges que l'equip s'emporta de cada esdeveniment i que no es recullen enlloc.","Les fotos i opinions dels assistents com a font de nous encàrrecs."]}},{"id":"ofici_restaurant","icona":"☕","paraules":"barri, barrio, veïns, vecinos, menú, esmorzar, almuerzo, tapes, tapas, terrassa, proximitat, cercanía, casolà, casero, habituals","ca":{"nom":"Restaurant o bar de proximitat","diu":"Per a bars i restaurants de barri o de poble que viuen de la clientela habitual i del veïnat.","roles":["Bar de proximitat","Clientela habitual","Veïnat que recomana","Equip de sala i cuina","Proveïdors de proximitat","Comerç i entitats del barri","Gestoria"],"pairs":[["Bar de proximitat","Clientela habitual","tangible","menjar i beguda servits","tangible","pagament del consum"],["Bar de proximitat","Clientela habitual","intangible","lloc de trobada acollidor","intangible","fidelitat i confiança diària"],["Veïnat que recomana","Bar de proximitat","intangible","recomanacions boca-orella","intangible","tracte proper i reconeixement"],["Bar de proximitat","Equip de sala i cuina","tangible","sou i horaris pactats","intangible","implicació i bon tracte"],["Equip de sala i cuina","Clientela habitual","intangible","memòria dels gustos","intangible","conversa i agraïment"],["Proveïdors de proximitat","Bar de proximitat","tangible","producte fresc de temporada","tangible","pagament puntual"],["Proveïdors de proximitat","Bar de proximitat","intangible","avisos de producte bo","intangible","fidelitat i bona paraula"],["Comerç i entitats del barri","Bar de proximitat","intangible","clients i activitats compartides","intangible","espai per a trobades"],["Gestoria","Bar de proximitat","tangible","comptes i permisos al dia","tangible","quota de serveis"]],"passos":["Dibuixar qui ve cada dia, a quina hora i per què.","Pactar amb l'equip horaris estables i el to del tracte.","Triar dos o tres proveïdors propers i fixar comandes i pagaments.","Teixir aliances amb comerços i entitats del barri.","Revisar cada mes què es diu del bar al barri i a les ressenyes."],"centre":"Bar de proximitat","bona":"Conèixer la clientela pel nom i pels gustos val més que qualsevol oferta."},"es":{"nom":"Restaurante o bar de proximidad","diu":"Para bares y restaurantes de barrio o de pueblo que viven de la clientela habitual y del vecindario.","roles":["Bar de proximidad","Clientela habitual","Vecindario que recomienda","Equipo de sala y cocina","Proveedores de proximidad","Comercio y entidades del barrio","Gestoría"],"pairs":[["Bar de proximidad","Clientela habitual","tangible","comida y bebida servidas","tangible","pago de la consumición"],["Bar de proximidad","Clientela habitual","intangible","lugar de encuentro acogedor","intangible","fidelidad y confianza diaria"],["Vecindario que recomienda","Bar de proximidad","intangible","recomendaciones boca a boca","intangible","trato cercano y reconocimiento"],["Bar de proximidad","Equipo de sala y cocina","tangible","sueldo y horarios pactados","intangible","implicación y buen trato"],["Equipo de sala y cocina","Clientela habitual","intangible","memoria de los gustos","intangible","conversación y agradecimiento"],["Proveedores de proximidad","Bar de proximidad","tangible","producto fresco de temporada","tangible","pago puntual"],["Proveedores de proximidad","Bar de proximidad","intangible","avisos de buen producto","intangible","fidelidad y buena palabra"],["Comercio y entidades del barrio","Bar de proximidad","intangible","clientes y actividades compartidas","intangible","espacio para encuentros"],["Gestoría","Bar de proximidad","tangible","cuentas y permisos al día","tangible","cuota de servicios"]],"passos":["Dibujar quién viene cada día, a qué hora y por qué.","Pactar con el equipo horarios estables y el tono del trato.","Elegir dos o tres proveedores cercanos y fijar pedidos y pagos.","Tejer alianzas con comercios y entidades del barrio.","Revisar cada mes qué se dice del bar en el barrio y en las reseñas."],"centre":"Bar de proximidad","bona":"Conocer a la clientela por su nombre y sus gustos vale más que cualquier oferta."},"veda":{"clau":["**Equip de sala i cuina → Clientela habitual: memòria dels gustos.** Saber el cafè de cadascú fa que la gent torni.","**Bar de proximitat → Clientela habitual: lloc de trobada.** El bar és la sala d'estar del barri.","**Veïnat que recomana → Bar de proximitat: boca-orella.** La recomanació d'un veí omple més taules que la publicitat.","**Proveïdors de proximitat → Bar de proximitat: avisos de producte bo.** El proveïdor de confiança avisa quan arriba el millor."],"preguntes":["Qui són els cinc clients que venen gairebé cada dia?","Quin proveïdor t'ha fet un favor que no t'ha cobrat?","Com t'arriba la majoria de clientela nova?"],"falta":["L'escolta i la contenció que el bar ofereix a veïns grans o sols.","La informació del barri que circula a la barra i que arriba a l'equip.","El suport mutu amb els comerços veïns quan algú té un mal moment."]}},{"id":"ofici_botiga","icona":"🏪","paraules":"barri, barrio, veïns, vecinos, confiança, confianza, proximitat, proximidad, fresc, encàrrecs, encargos, taulell, mostrador, tracte, fiar","ca":{"nom":"Botiga de barri","diu":"Per a botigues de proximitat que viuen del tracte diari amb els veïns i volen entendre què les fa imprescindibles al barri.","roles":["Botiga","Clients del barri","Equip","Veí que recomana","Proveïdors","Productors de proximitat","Comerços veïns"],"pairs":[["Botiga","Clients del barri","tangible","producte fresc i proper","tangible","pagament de la compra"],["Botiga","Clients del barri","intangible","tracte de confiança i escolta","intangible","fidelitat i comentaris sincers"],["Veí que recomana","Botiga","intangible","recomanació boca-orella","intangible","reconeixement i atenció especial"],["Proveïdors","Botiga","tangible","comandes i reposició","tangible","pagament puntual"],["Proveïdors","Botiga","intangible","avís de novetats","intangible","informació del que es demana"],["Productors de proximitat","Botiga","tangible","producte local de temporada","intangible","visibilitat i història explicada"],["Botiga","Equip","tangible","sou i horaris estables","intangible","coneixement dels clients"],["Comerços veïns","Botiga","intangible","derivació de clients","intangible","suport mutu i favors"]],"passos":["Dibuixar qui entra a la botiga cada setmana i per què torna.","Identificar els veïns que ja recomanen i agrair-ho de manera personal.","Parlar amb proveïdors i productors propers per compartir què demana el barri.","Donar a l'equip temps i confiança per conèixer els clients pel nom.","Pactar amb els comerços veïns derivacions i petites accions conjuntes."],"centre":"Botiga","bona":"Conèixer cada client pel nom i pel que necessita val més que qualsevol oferta."},"es":{"nom":"Tienda de barrio","diu":"Para tiendas de proximidad que viven del trato diario con los vecinos y quieren entender qué las hace imprescindibles en el barrio.","roles":["Tienda","Clientes del barrio","Equipo","Vecino que recomienda","Proveedores","Productores de proximidad","Comercios vecinos"],"pairs":[["Tienda","Clientes del barrio","tangible","producto fresco y cercano","tangible","pago de la compra"],["Tienda","Clientes del barrio","intangible","trato de confianza y escucha","intangible","fidelidad y comentarios sinceros"],["Vecino que recomienda","Tienda","intangible","recomendación boca a boca","intangible","reconocimiento y atención especial"],["Proveedores","Tienda","tangible","pedidos y reposición","tangible","pago puntual"],["Proveedores","Tienda","intangible","aviso de novedades","intangible","información de lo que se pide"],["Productores de proximidad","Tienda","tangible","producto local de temporada","intangible","visibilidad e historia contada"],["Tienda","Equipo","tangible","sueldo y horarios estables","intangible","conocimiento de los clientes"],["Comercios vecinos","Tienda","intangible","derivación de clientes","intangible","apoyo mutuo y favores"]],"passos":["Dibujar quién entra en la tienda cada semana y por qué vuelve.","Identificar a los vecinos que ya recomiendan y agradecerlo de forma personal.","Hablar con proveedores y productores cercanos para compartir qué pide el barrio.","Dar al equipo tiempo y confianza para conocer a los clientes por su nombre.","Pactar con los comercios vecinos derivaciones y pequeñas acciones conjuntas."],"centre":"Tienda","bona":"Conocer a cada cliente por su nombre y por lo que necesita vale más que cualquier oferta."},"veda":{"clau":["**Botiga → Clients del barri: tracte de confiança.** És el motiu principal pel qual tornen encara que el súper sigui més barat.","**Veí que recomana → Botiga: boca-orella.** La majoria de clients nous arriben perquè algú del barri els n'ha parlat.","**Equip → Botiga: coneixement dels clients.** Saber gustos, horaris i encàrrecs fa que la compra sigui ràpida i personal.","**Comerços veïns → Botiga: derivació de clients.** Quan un comerç no té una cosa, envia el client al del costat."],"preguntes":["Quins tres clients et van portar més gent nova l'últim any?","Quan un client no troba el que busca, a quina botiga del barri l'envies?","Què saben de tu els proveïdors que no surt a cap factura?"],"falta":["El paper de la botiga com a punt de trobada i de vigilància informal per a la gent gran del barri.","La informació que la botiga dona als proveïdors sobre què demana realment el barri.","Els favors entre comerços veïns: guardar paquets, deixar canvi, avisar d'incidències."]}},{"id":"ofici_salut_autonoma","icona":"🩺","paraules":"pacients, consulta, sessió, escolta, confiança, derivació, seguiment, pauta, tratamiento, evolución, acompañar, alta, col·legiada, autònoma, cuidar","ca":{"nom":"Salut autònoma (fisioteràpia, psicologia, nutrició)","diu":"Per a professionals sanitaris que treballen pel seu compte i volen que els pacients arribin, millorin i tornin a recomanar-los.","roles":["Professional de salut","Pacient","Professional que deriva","Equip de consulta","Família o cuidador","Mútua o asseguradora","Col·legi i formació"],"pairs":[["Professional de salut","Pacient","tangible","sessions i pla de tractament","tangible","pagament per sessió"],["Pacient","Professional de salut","intangible","confiança i relat honest","intangible","escolta sense judici"],["Professional que deriva","Professional de salut","intangible","derivació de pacients adequats","intangible","informe d'evolució clar"],["Equip de consulta","Professional de salut","tangible","agenda i recepció gestionades","tangible","tarifa o sou acordat"],["Professional de salut","Equip de consulta","intangible","criteri clínic compartit","intangible","avisos sobre cada pacient"],["Família o cuidador","Professional de salut","intangible","context de la vida diària","intangible","pautes per acompanyar a casa"],["Mútua o asseguradora","Professional de salut","tangible","pacients concertats i pagament","tangible","factures i informes acordats"],["Col·legi i formació","Professional de salut","tangible","formació i assegurança professional","tangible","quota col·legial"],["Pacient","Professional que deriva","intangible","recomanació a coneguts","intangible","seguiment després de l'alta"]],"passos":["Definir per a quin tipus de pacient treballes millor i què no atens.","Identificar dos o tres professionals que et poden derivar i acordar com us informareu.","Preparar l'acollida: primera visita, pla de tractament clar i preu explicat.","Repartir tasques amb l'equip o col·laboradors i compartir criteri clínic.","Tancar cada procés amb un alta i un seguiment breu que convidi a recomanar."],"centre":"Professional de salut","bona":"Retorna sempre un informe breu a qui t'ha derivat un pacient: és el que fa que torni a fer-ho."},"es":{"nom":"Salud autónoma (fisioterapia, psicología, nutrición)","diu":"Para profesionales sanitarios que trabajan por su cuenta y quieren que los pacientes lleguen, mejoren y los vuelvan a recomendar.","roles":["Profesional de salud","Paciente","Profesional que deriva","Equipo de consulta","Familia o cuidador","Mutua o aseguradora","Colegio y formación"],"pairs":[["Profesional de salud","Paciente","tangible","sesiones y plan de tratamiento","tangible","pago por sesión"],["Paciente","Profesional de salud","intangible","confianza y relato honesto","intangible","escucha sin juicio"],["Profesional que deriva","Profesional de salud","intangible","derivación de pacientes adecuados","intangible","informe de evolución claro"],["Equipo de consulta","Profesional de salud","tangible","agenda y recepción gestionadas","tangible","tarifa o sueldo acordado"],["Profesional de salud","Equipo de consulta","intangible","criterio clínico compartido","intangible","avisos sobre cada paciente"],["Familia o cuidador","Profesional de salud","intangible","contexto de la vida diaria","intangible","pautas para acompañar en casa"],["Mutua o aseguradora","Profesional de salud","tangible","pacientes concertados y pago","tangible","facturas e informes acordados"],["Colegio y formación","Profesional de salud","tangible","formación y seguro profesional","tangible","cuota colegial"],["Paciente","Profesional que deriva","intangible","recomendación a conocidos","intangible","seguimiento tras el alta"]],"passos":["Definir con qué tipo de paciente trabajas mejor y qué no atiendes.","Identificar dos o tres profesionales que pueden derivarte y acordar cómo os informaréis.","Preparar la acogida: primera visita, plan de tratamiento claro y precio explicado.","Repartir tareas con el equipo o colaboradores y compartir criterio clínico.","Cerrar cada proceso con un alta y un seguimiento breve que invite a recomendar."],"centre":"Profesional de salud","bona":"Devuelve siempre un informe breve a quien te ha derivado un paciente: es lo que hace que vuelva a hacerlo."},"veda":{"clau":["**Pacient → professional: confiança.** Sense un relat sincer, el tractament no funciona.","**Professional que deriva → professional: reputació prestada.** Qui deriva hi posa el seu nom.","**Pacient → altres: recomanació.** El boca-orella és la font principal de pacients nous.","**Professional → família: pautes.** La millora es juga a casa, no només a la consulta."],"preguntes":["D'on t'han arribat els tres últims pacients nous?","A qui li has enviat un informe aquest mes?","Què fas quan un pacient rep l'alta?"],"falta":["L'informe de tornada a qui ha derivat, que gairebé mai es fa.","El seguiment després de l'alta, que sosté la recomanació.","El suport entre col·legues per a casos difícils i desgast emocional."]}},{"id":"ofici_serveis_professionals","icona":"🧭","paraules":"asesoramiento, assessorament, diagnóstico, diagnòstic, criterio, criteri, propuesta, proposta, confianza, confiança, honorarios, honoraris, método, mètode, acompanyament","ca":{"nom":"Consultoria i serveis professionals","diu":"Per a despatxos, consultors autònoms i petites firmes que venen coneixement, criteri i acompanyament a empreses i particulars.","roles":["Despatx de consultoria","Client","Equip consultor","Prescriptor","Col·laboradors especialistes","Proveïdors i eines","Xarxa professional i sector"],"pairs":[["Despatx de consultoria","Client","tangible","Diagnòstic i proposta clara","tangible","Honoraris acordats"],["Client","Despatx de consultoria","intangible","Context i accés intern","intangible","Criteri honest i confidencialitat"],["Equip consultor","Despatx de consultoria","intangible","Coneixement i criteri expert","tangible","Sou i pla de creixement"],["Despatx de consultoria","Equip consultor","intangible","Autonomia i mentoria","intangible","Compromís i millores de mètode"],["Prescriptor","Despatx de consultoria","intangible","Recomanació amb context","intangible","Agraïment i clients ben atesos"],["Client","Prescriptor","intangible","Resultats que reforcen confiança","intangible","Escolta i seguiment"],["Col·laboradors especialistes","Despatx de consultoria","tangible","Treball especialitzat subcontractat","intangible","Clients derivats i reconeixement"],["Proveïdors i eines","Despatx de consultoria","tangible","Programari i dades","tangible","Quota de subscripció"],["Xarxa professional i sector","Despatx de consultoria","intangible","Tendències i normativa nova","intangible","Articles i participació activa"],["Despatx de consultoria","Client","intangible","Seguiment després del projecte","intangible","Testimoni i cas d'èxit"]],"passos":["Definir l'especialitat i el tipus de client on aportes més valor.","Identificar qui et recomana i cuidar aquesta relació de manera regular.","Estandarditzar el diagnòstic inicial i el format de proposta.","Preparar l'equip i la xarxa de col·laboradors amb rols i criteris compartits.","Tancar cada projecte amb seguiment, aprenentatge intern i petició de testimoni."],"centre":"Despatx de consultoria","bona":"Diu al client què no cal fer tan clarament com què sí, i torna sempre el context a qui t'ha recomanat."},"es":{"nom":"Consultoría y servicios profesionales","diu":"Para despachos, consultores autónomos y pequeñas firmas que venden conocimiento, criterio y acompañamiento a empresas y particulares.","roles":["Despacho de consultoría","Cliente","Equipo consultor","Prescriptor","Colaboradores especialistas","Proveedores y herramientas","Red profesional y sector"],"pairs":[["Despacho de consultoría","Cliente","tangible","Diagnóstico y propuesta clara","tangible","Honorarios acordados"],["Cliente","Despacho de consultoría","intangible","Contexto y acceso interno","intangible","Criterio honesto y confidencialidad"],["Equipo consultor","Despacho de consultoría","intangible","Conocimiento y criterio experto","tangible","Sueldo y plan de crecimiento"],["Despacho de consultoría","Equipo consultor","intangible","Autonomía y mentoría","intangible","Compromiso y mejoras de método"],["Prescriptor","Despacho de consultoría","intangible","Recomendación con contexto","intangible","Agradecimiento y clientes bien atendidos"],["Cliente","Prescriptor","intangible","Resultados que refuerzan confianza","intangible","Escucha y seguimiento"],["Colaboradores especialistas","Despacho de consultoría","tangible","Trabajo especializado subcontratado","intangible","Clientes derivados y reconocimiento"],["Proveedores y herramientas","Despacho de consultoría","tangible","Software y datos","tangible","Cuota de suscripción"],["Red profesional y sector","Despacho de consultoría","intangible","Tendencias y normativa nueva","intangible","Artículos y participación activa"],["Despacho de consultoría","Cliente","intangible","Seguimiento tras el proyecto","intangible","Testimonio y caso de éxito"]],"passos":["Definir la especialidad y el tipo de cliente donde aportas más valor.","Identificar quién te recomienda y cuidar esa relación de forma regular.","Estandarizar el diagnóstico inicial y el formato de propuesta.","Preparar al equipo y la red de colaboradores con roles y criterios compartidos.","Cerrar cada proyecto con seguimiento, aprendizaje interno y petición de testimonio."],"centre":"Despacho de consultoría","bona":"Dile al cliente qué no hace falta hacer tan claro como qué sí, y devuelve siempre el contexto a quien te ha recomendado."},"veda":{"clau":["**Despatx de consultoria → Client: criteri honest.** Dir què no cal fer genera més confiança que vendre hores.","**Prescriptor → Despatx de consultoria: recomanació amb context.** El client arriba ja amb confiança i la venda s'escurça.","**Client → Despatx de consultoria: context i accés intern.** Sense informació real el diagnòstic no val res.","**Equip consultor → Despatx de consultoria: criteri expert.** El valor del despatx és el que l'equip sap i decideix bé."],"preguntes":["Qui t'ha recomanat els tres darrers clients i li vas dir com va anar?","Què et demana el client que no factures però que valora molt?","Quina feina passes a col·laboradors i quins clients et tornen ells?"],"falta":["El retorn al prescriptor: gairebé ningú li explica com ha anat el client recomanat.","El coneixement que l'equip aprèn a cada projecte i que es perd si no es documenta.","Els clients que els col·laboradors especialistes deriven cap al despatx."]}},{"id":"ofici_taller","icona":"🔧","paraules":"avaria, diagnòstic, recanvi, garantia, pressupost, taller, mecànic, avería, repuesto, presupuesto, arreglar, reparar, confiança, barrio, ofici","ca":{"nom":"Taller de reparació","diu":"Per a tallers de bicis, cotxes o electrònica que viuen de la confiança del client i de tornar a fer funcionar les coses.","roles":["Taller","Client","Equip tècnic","Proveïdor de recanvis","Qui recomana","Fabricant o servei oficial","Comunitat de barri"],"pairs":[["Taller","Client","tangible","Reparació amb garantia","tangible","Pagament de la reparació"],["Taller","Client","intangible","Diagnòstic honest i explicat","intangible","Confiança per tornar"],["Qui recomana","Taller","intangible","Clients nous de confiança","intangible","Reputació de bon consell"],["Equip tècnic","Taller","tangible","Hores de treball qualificat","tangible","Sou i condicions estables"],["Taller","Equip tècnic","intangible","Formació i casos difícils","intangible","Ofici i criteri tècnic"],["Proveïdor de recanvis","Taller","tangible","Recanvis a temps","tangible","Comandes i pagament puntual"],["Proveïdor de recanvis","Taller","intangible","Avís de peces alternatives","intangible","Opinió sobre qualitat de peces"],["Fabricant o servei oficial","Taller","intangible","Documentació tècnica i esquemes","intangible","Dades de fallades reals"],["Comunitat de barri","Taller","intangible","Visibilitat i proximitat","intangible","Consells de manteniment gratuïts"],["Client","Equip tècnic","intangible","Descripció precisa de l'avaria","intangible","Consells per allargar la vida"]],"passos":["Definir què repares i què no, i el temps de resposta que pots prometre.","Establir un diagnòstic amb pressupost clar abans de tocar res.","Assegurar dos o tres proveïdors de recanvis i accés a documentació tècnica.","Formar l'equip perquè sàpiga explicar l'avaria al client amb paraules senzilles.","Fer seguiment després de la reparació i demanar que et recomanin.","Participar al barri amb consells i petites revisions que facin visible l'ofici."],"centre":"Taller","bona":"Explica sempre què falla, què costa i què pot esperar, abans de reparar: la confiança és el teu millor recanvi.}"},"es":{"nom":"Taller de reparación","diu":"Para talleres de bicis, coches o electrónica que viven de la confianza del cliente y de volver a hacer funcionar las cosas.","roles":["Taller","Cliente","Equipo técnico","Proveedor de repuestos","Quien recomienda","Fabricante o servicio oficial","Comunidad de barrio"],"pairs":[["Taller","Cliente","tangible","Reparación con garantía","tangible","Pago de la reparación"],["Taller","Cliente","intangible","Diagnóstico honesto y explicado","intangible","Confianza para volver"],["Quien recomienda","Taller","intangible","Clientes nuevos de confianza","intangible","Reputación de buen consejo"],["Equipo técnico","Taller","tangible","Horas de trabajo cualificado","tangible","Sueldo y condiciones estables"],["Taller","Equipo técnico","intangible","Formación y casos difíciles","intangible","Oficio y criterio técnico"],["Proveedor de repuestos","Taller","tangible","Repuestos a tiempo","tangible","Pedidos y pago puntual"],["Proveedor de repuestos","Taller","intangible","Aviso de piezas alternativas","intangible","Opinión sobre calidad de piezas"],["Fabricante o servicio oficial","Taller","intangible","Documentación técnica y esquemas","intangible","Datos de fallos reales"],["Comunidad de barrio","Taller","intangible","Visibilidad y cercanía","intangible","Consejos de mantenimiento gratuitos"],["Cliente","Equipo técnico","intangible","Descripción precisa de la avería","intangible","Consejos para alargar la vida"]],"passos":["Definir qué reparas y qué no, y el tiempo de respuesta que puedes prometer.","Establecer un diagnóstico con presupuesto claro antes de tocar nada.","Asegurar dos o tres proveedores de repuestos y acceso a documentación técnica.","Formar al equipo para que sepa explicar la avería al cliente con palabras sencillas.","Hacer seguimiento tras la reparación y pedir que te recomienden.","Participar en el barrio con consejos y pequeñas revisiones que hagan visible el oficio."],"centre":"Taller","bona":"Explica siempre qué falla, qué cuesta y qué puede esperar, antes de reparar: la confianza es tu mejor repuesto."},"veda":{"clau":["**Taller → Client: diagnòstic honest.** Explicar l'avaria sense inflar-la és el que fa que el client torni i recomani.","**Qui recomana → Taller: clients de confiança.** La major part de clients nous arriben pel boca-orella d'algú satisfet.","**Proveïdor de recanvis → Taller: avís de peces alternatives.** Saber quina peça hi ha disponible avui estalvia dies d'espera.","**Taller → Equip tècnic: casos difícils.** Les avaries complicades són la millor escola i retenen el bon tècnic."],"preguntes":["Com arriben la majoria dels teus clients nous?","Què expliques al client abans de donar-li el pressupost?","A quin proveïdor truques quan una peça no arriba i què et dona a canvi?"],"falta":["El que el client explica de l'avaria i com ajuda o enganya el diagnòstic.","Els consells de manteniment que el taller regala i que generen fidelitat.","Les dades de fallades reals que el taller podria retornar al fabricant."]}}];
  var TOTS = MODELS.concat(SECTORS, OFICIS);
  /* Qui fa de «tu» quan algú comença per aquest model: el que el promou (`centre`) o, si no el diu, el rol que més dona i rep. */
  function centre(m) { if (m.centre) return m.centre; var n = {}; m.pairs.forEach(function (p) { n[p[0]] = (n[p[0]] || 0) + 1; n[p[1]] = (n[p[1]] || 0) + 1; });
    return m.roles.slice().sort(function (a, b) { return (n[b] || 0) - (n[a] || 0); })[0]; }
  /* El model en una llengua, amb el centre canviat pel nom de qui el fa servir. */
  function mapa(id, llengua, casa) {
    var M = TOTS.filter(function (x) { return x.id === id; })[0]; if (!M) return null;
    var m = M[llengua] || M.es || M.ca, c = centre(m), r = function (x) { return casa && x === c ? casa : x; };
    return { abast: '', roles: m.roles.map(r), pairs: m.pairs.map(function (p) { return [r(p[0]), r(p[1]), p[2], p[3], p[4], p[5]]; }), centre: casa || c, nom: m.nom, bona: m.bona || '', veda: M.veda || null, passos: m.passos || [] };
  }
  /* Quin model o sector s'assembla més al que algú explica amb les seves paraules.
     Sense IA: arrels curtes (sense accents ni plural); el nom i el «diu» compten doble i
     una arrel comuna a molts models pesa menys. Torna null si no n'hi ha prou per dir-ho. */
  var BUIDES = /^(quie|teng|tene|vole|nues|nost|porq|perq|sobr|tamb|todo|tots|dond|cuan|quan|hace|desd|entr|much|molt|pued|pode|esta|somo|siem|semp|ahor|aque|esto|otro|altr|pers|para|como|cosa|bien|vull|vols|fins|hast|dels|unes|unos|haci|ques|aixo|pero|vida|grup|gent|bonit|quer|volem|nece)/;
  function arrels(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/).filter(function (w) { return w.length >= 4; }).map(function (w) { w = w.length > 4 ? w.replace(/s$/, '') : w; return w.length > 5 ? w.slice(0, 5) : w; })
    .filter(function (w) { return !BUIDES.test(w); }); }
  function textDe(m) { return [m.nom, m.nom, m.diu, m.diu, m.roles.join(' '), m.pairs.map(function (p) { return p[3] + ' ' + p[5]; }).join(' ')].join(' '); }
  function suggereix(text, llengua) {
    var meves = {}; arrels(text).forEach(function (w) { meves[w] = 1; });
    var tots = TOTS, df = {}, bosses = tots.map(function (M) {
      var b = {}; arrels(textDe(M[llengua] || M.es || M.ca) + ' ' + M.paraules + ' ' + M.paraules).forEach(function (w) { b[w] = (b[w] || 0) + 1; });
      /* Els oficis no compten per a la raresa: així no diluen els models i sectors que ja hi eren. */
      if (OFICIS.indexOf(M) < 0) Object.keys(b).forEach(function (w) { df[w] = (df[w] || 0) + 1; }); return b; });
    /* Una arrel que surt a molts models diu poc: pesa menys (1 / quants la tenen). */
    var millor = null;
    tots.forEach(function (M, i) {
      var punts = 0, n = 0;
      Object.keys(meves).forEach(function (w) { if (bosses[i][w]) { n++; punts += Math.min(bosses[i][w], 2) / (df[w] || 1); } });
      var m = M[llengua] || M.es || M.ca;
      if (punts >= 1 && (!millor || punts > millor.punts)) millor = { id: M.id, icona: M.icona, nom: m.nom, punts: Math.round(punts * 100) / 100, sector: SECTORS.indexOf(M) >= 0, ofici: OFICIS.indexOf(M) >= 0 };
    });
    return millor;
  }
  /* La regla de l'app (SOS/index.html), tal com és: qui fa cada lliurament. */
  const normKind=k=>{const m=String(k==null?'':k).trim().toLowerCase();
    return(m==='i'||m==='intangible')?'intangible':'tangible';};
  const menaExplicita=k=>{const m=String(k==null?'':k).trim().toLowerCase();
    return m==='t'||m==='tangible'||m==='i'||m==='intangible';};
  const isIntangible=k=>normKind(k)==='intangible';
  const ENTREGABLES=[
    {id:'acta',nom:'Acta de reunió',ic:'📋',maquina:true,
     que:'El que s\'ha decidit, qui hi era i què queda pendent, amb data.',
     cal:['assistents','punts tractats','acords'],
     surt:'Data, assistents, acords numerats i pendents amb responsable i termini.'},
    {id:'informe',nom:'Informe periòdic',ic:'📊',maquina:true,
     que:'El que s\'ha mogut en un període, amb les xifres que ja hi ha al registre.',
     cal:['període','apunts del ledger','rols actius'],
     surt:'Resum, taula d\'activitat, comparació amb el període anterior i avisos.'},
    {id:'justificacio',nom:'Justificació de subvenció',ic:'🧾',maquina:true,
     que:'El que demana la convocatòria, omplert amb el que consta al registre.',
     cal:['convocatòria','despeses','activitat realitzada'],
     surt:'Memòria d\'activitat i taula de despesa, en el format que demani la plantilla.'},
    {id:'inventari',nom:'Inventari',ic:'📦',maquina:true,
     que:'Què hi ha, de qui és, en quin estat i on para.',
     cal:['objectes','estat','ubicació'],
     surt:'Taula amb valor estimat, desgast acumulat i qui n\'és responsable.'},
    {id:'convocatoria',nom:'Convocatòria',ic:'📣',maquina:true,
     que:'Cridar la gent a una cosa concreta, amb tot el que cal saber per venir.',
     cal:['què','quan','on','qui hi ha d\'anar'],
     surt:'Text curt per als canals, amb data, lloc, ordre del dia i com confirmar.'},
    {id:'comanda',nom:'Comanda o repartiment',ic:'🛒',maquina:true,
     que:'Qui ha demanat què, quant costa i com es reparteix.',
     cal:['peticions','preus','punt de repartiment'],
     surt:'Full de comanda per llar, total per proveïdor i full de repartiment.'},
    {id:'fitxa',nom:'Fitxa pública',ic:'🪪',maquina:true,
     que:'Com s\'explica a fora el que fa un node o una dinàmica.',
     cal:['què ofereix','a qui','com s\'hi arriba'],
     surt:'Fitxa breu per al directori, sense cap dada personal.'},
    /* Els de negoci (veda 163): sense eina a l'app encara; al kit, /tasca. */
    {id:'pressupost',nom:'Pressupost',ic:'🧮',maquina:true,
     que:'Què es lliurarà i en quina quantitat, perquè qui el rep ho valori abans de dir que sí.',
     cal:['què demana qui el rep','conceptes i quantitats','tarifa publicada, si n\'hi ha'],
     surt:'Línies amb concepte, quantitat, unitat i preu de la tarifa publicada o [a completar], què no hi entra i fins quan val. Sense total: la màquina no suma.'},
    {id:'proposta',nom:'Proposta',ic:'📝',maquina:true,
     que:'El que s\'ofereix a qui ho ha de decidir: per a què, com, per quins rols i en quins terminis.',
     cal:['què necessita qui la rep','què s\'ofereix','fases i terminis'],
     surt:'Necessitat, el que s\'ofereix, fases amb terminis, quin rol fa què i què queda fora. Sense imports: van al pressupost.'},
    {id:'resposta',nom:'Resposta a una consulta',ic:'💬',maquina:true,
     que:'La resposta escrita a una pregunta concreta, feta amb el que la casa ja té dit.',
     cal:['la consulta, sense dades de qui la fa','el que ja consta (web, fitxa, condicions)'],
     surt:'Text curt que respon punt per punt, marca amb [a completar] el que no se sap i diu com seguir. No promet res que no consti.'},
    /* Els que no poden sortir d'una màquina, i el motiu escrit. Sense aquestes
       entrades, la taxonomia semblaria dir que tot és automatitzable i que els
       que falten és que encara no els hem fet. */
    {id:'acord',nom:'Acord o decisió',ic:'⚖️',maquina:false,
     que:'El que un grup ha decidit i per què. No és el document: és la decisió.',
     cal:['debat','vots','qui ho sosté'],
     surt:'No surt d\'una màquina. El redacta qui ha estat a la sala; la màquina, com a molt, en pren acta després.'},
    /* Els diners (veda 163): redactar-los seria fer veure que s'ha cobrat. */
    {id:'cobrament',nom:'Factura o cobrament',ic:'💶',maquina:false,
     que:'Diners que es cobren o es paguen, i el document que en dona fe. No és el que es demana: és el que es cobra.',
     cal:['import','document fiscal','qui ho cobra'],
     surt:'No surt d\'una màquina. La factura la numera el programa de facturació o qui porta els comptes, i un cobrament només el dona per fet qui el rep.'}
  ];
  const entregableMeta=id=>ENTREGABLES.find(e=>e.id===id)||null;
  
  /* Quin entregable demana un flux, deduït de com està escrit. Mateix patró que
     `RETURN_HINTS`: no s'inventa res, es proposa i es pot corregir a mà posant
     `entregable` a l'intercanvi. Un flux sense tipus reconegut **no és
     automatitzable**, i és la resposta correcta: vol dir que encara no sabem què
     s'ha de produir.
  
     Guanya la primera. Les de negoci, estretes i amb PISTA_MAI (veda 163). Res
     de lookbehind: Safari <16.4 no el compila. */
  const PISTA_MAI='factur|pagament|cobrament|\\bpag(o|os)\\b|\\bcobros?\\b|rebut|recibo|acord|acuerdo|decisi|decidi|vot|aprova|aprob|accept|acept|signa|firma|resoluci|reclamaci|queix|queja|demanda|den[uú]nci|recurs|requeri|legaci|sanci|multa|inspecci|jur[ií]dic|legal|advoca|abogad|laboral|assetja|acoso|p[uú]blic|ciutad|ciudad|municip|ajuntament|ayuntamiento|govern|gobierno|diputaci|generalitat|ministeri|hisenda|hacienda|tribut|fiscal|participati|m[eèé]dic|metge|pacient|salu[td]|sanit|cl[ií]nic|diagn|terap|tractament|tratamiento|psic|veterin';
  const pistaNegoci=(cap,mes)=>new RegExp('^((el|la|els|les|un|una|uns|unes|los|las|nou|nova|nous|noves|nuevo|nueva|nuevos|nuevas) )*'+cap+'(?!.*('+PISTA_MAI+(mes?'|'+mes:'')+'))','i');
  const ENTREGABLE_HINTS=[
    [/^((el|la|els|les|un|una|uns|unes|los|las) |l')*(factur|pagament|cobrament|pagos?\b|cobros?\b)/i,'cobrament'],
    [/\bacta|reuni|assemblea/i,'acta'],
    [/informe|memòria|memoria|indicador|seguiment|retiment/i,'informe'],
    [/justific|subvenc|convocatòria de subvenc|fons/i,'justificacio'],
    [pistaNegoci('(pressupost|presupuest)(?!o?s? [iy] )(os?)?','compte|cuenta|propi|partida|anual|general|despes|gastos|ingress|ingreso|tresorer|tesorer|\\bestat\\b|\\bestado\\b|consell|consejo'),'pressupost'],
    [pistaNegoci('(respost(a|es)|respuestas?) (al|als|a l\'|a) ?((la|les|una|unes|un|uns|el|los|las) )?(consult|pregunt|dubt|dud|client|interessa|interesa)'),'resposta'],
    [/inventari|estoc|material|objecte|\beina|préstec|prestec/i,'inventari'],
    [/convoc|difusió|difusio|crida|comunicat|butlletí|butlleti/i,'convocatoria'],
    [/comanda|comandes|compra|cistell|repartiment|liquidació|liquidacio/i,'comanda'],
    [/factur|pagament|cobrament|\bpagos?\b|\bcobros?\b/i,'cobrament'],
    [/fitxa|directori|alta pública|alta publica|publicació|publicacio/i,'fitxa'],
    [/acord|acuerdo|decisió|decisio|vot|aprovació|aprovacio|aprobaci|resoluci/i,'acord'],
    [pistaNegoci('(propost(a|es)|propuestas?)','econ|de valor|preu|precio|tarif|honorari|salari|\\bsou\\b|sueldo|retribuci|quota|cuota|pressupost|presupuest|licitaci'),'proposta']
  ];
  const entregableDe=x=>{
    if(x&&x.entregable&&entregableMeta(x.entregable))return x.entregable;
    const h=ENTREGABLE_HINTS.find(e=>e[0].test((x&&x.label)||''));
    return h?h[1]:null;
  };
  
  /* Qui ha de fer una carta: la màquina o una persona.
     L'ordre de les comprovacions **és la regla**, i per això l'intangible va
     primer: cap etiqueta, cap tipus i cap configuració el pot convertir en
     candidat. Si algun dia aquesta condició es mou de lloc, el que es trencarà
     no és una funció — és la promesa de la casa. */
  function fluxAutomatitzable(x){
    if(!x)return{pot:false,motiu:'sense flux'};
    /* Doble pany, i els dos abans de mirar cap tipus. El primer és la regla: un
       intangible no s'automatitza mai. El segon és el que la fa sòlida: no n'hi
       ha prou de descartar el que sabem que és intangible, cal **exigir que sigui
       explícitament tangible**. Una mena desconeguda o mal escrita cau del costat
       segur, que és el de la persona, i ho diu amb el seu nom en comptes de
       fer-la passar per intangible. */
    if(isIntangible(x.kind))return{pot:false,motiu:'intangible',tipus:null};
    if(!menaExplicita(x.kind))return{pot:false,motiu:'mena desconeguda',tipus:null};
    const t=entregableDe(x);
    if(!t)return{pot:false,motiu:'sense entregable declarat',tipus:null};
    const m=entregableMeta(t);
    if(!m.maquina)return{pot:false,motiu:'el tipus no surt d\'una màquina',tipus:t};
    return{pot:true,motiu:'',tipus:t};
  }
  var PRODUCTES = [{"nom":"Del formulario a la propuesta","ca":"l'esborrany surt sol de la petició; una persona el revisa abans d'enviar-lo","es":"el borrador sale solo de la petición; una persona lo revisa antes de enviarlo","patrons":["propuesta","proposta","presupuesto","pressupost","cotizaci","cotitzaci","oferta"]},{"nom":"Tu día en una pantalla","ca":"el correu, el calendari i el CRM en una pantalla, sense picar res","es":"el correo, el calendario y el CRM en una pantalla, sin teclear nada","patrons":["agenda","calendari","seguimiento","seguiment","recordatori","aviso","avís","avis","informe de estado","informe d'estat"]},{"nom":"La red que se mantiene sola","ca":"cada partner manté la seva fitxa i autoritza la seva pàgina amb un clic","es":"cada partner mantiene su ficha y autoriza su página con un clic","patrons":["ficha","fitxa","disponibilidad","disponibilitat","datos de proveedor","dades de proveïdor","alta de proveedor","alta de proveïdor"]},{"nom":"Tu catálogo de partners","ca":"el catàleg i els dossiers es generen de les dades, no es maquetan","es":"el catálogo y los dossieres se generan de los datos, no se maquetan","patrons":["catálogo","catalogo","catàleg","cataleg","dossier","tarifa"]},{"nom":"Leads ordenados por potencial","ca":"la llista s'enriqueix i s'ordena sola; a qui es truca ho decideix una persona","es":"la lista se enriquece y se ordena sola; a quién se llama lo decide una persona","patrons":["lead","contactos","contactes","prospecci","base de datos de clientes","base de dades de clients"]},{"nom":"Tu red en el mapa","ca":"on és cada partner i què hi ha a prop, al mapa del territori","es":"dónde está cada partner y qué hay cerca, en el mapa del territorio","patrons":["ubicaci","localizaci","localitzaci","territori","comarca","ruta"]},{"nom":"El diagnòstic","ca":"el formulari del web arriba al CRM com a lead, amb les respostes","es":"el formulario de la web llega al CRM como lead, con las respuestas","patrons":["diagnóstico","diagnostico","diagnòstic","diagnostic","formulario","formulari","encuesta","enquesta","inscripci"]}];
  var pla = function pla(t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
  /* maquina: la prepara la màquina (amb el producte que ja ho fa, si n'hi ha); persona: la fa
     una persona (el que no es paga i els diners, sempre); visita: es decideix a la sessió. */
  function automatitza(que, mena, llengua) {
    var a = fluxAutomatitzable({ kind: mena, label: que });
    var r = { qui: a.pot ? 'maquina' : (a.motiu === 'intangible' || a.tipus) ? 'persona' : 'visita', tipus: a.tipus || null };
    if (r.qui === 'maquina') {
      var t = pla(que), p = PRODUCTES.filter(function (x) {
        return x.patrons.some(function (w) { return new RegExp('(^|[^a-z0-9])' + pla(w).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(t); });
      })[0];
      if (p) { r.producte = p.nom; r.diu = p[llengua] || p.es; }
    }
    return r;
  }
  return { MODELS: MODELS, SECTORS: SECTORS, OFICIS: OFICIS, centre: centre, mapa: mapa, suggereix: suggereix, automatitza: automatitza };
});
