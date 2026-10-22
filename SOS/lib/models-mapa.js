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
    "ca": {
     "nom": "El meu negoci",
     "diu": "El mapa de valor del teu negoci: qui hi dona què, i què torna.",
     "roles": [
      "El negoci",
      "Clients",
      "Equip",
      "Proveïdors",
      "Aliats"
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
      ]
     ]
    },
    "es": {
     "nom": "Mi negocio",
     "diu": "El mapa de valor de tu negocio: quién da qué y qué vuelve.",
     "roles": [
      "El negocio",
      "Clientes",
      "Equipo",
      "Proveedores",
      "Aliados"
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
      ]
     ]
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
    }
   },
   {
    "id": "servei_proximitat",
    "icona": "🛎",
    "ca": {
     "nom": "Servei de proximitat",
     "diu": "Servei que s'ofereix directament a la comunitat local (educació, cures, reparacions, atenció).",
     "roles": [
      "Persones oferents",
      "Persones usuàries",
      "Nucli gestor",
      "Referent territorial",
      "Ecosistema aliat"
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
      ]
     ]
    },
    "es": {
     "nom": "Servicio de proximidad",
     "diu": "Servicio que se ofrece directamente a la comunidad local (educación, cuidados, reparaciones, atención).",
     "roles": [
      "Personas que ofrecen",
      "Personas usuarias",
      "Núcleo gestor",
      "Referente territorial",
      "Ecosistema aliado"
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
      ]
     ]
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
    }
   },
   {
    "id": "producte_artesa",
    "icona": "🧶",
    "ca": {
     "nom": "Producte artesà / manufactura",
     "diu": "Producció física en petit format, taller propi o compartit.",
     "roles": [
      "Artesans/es",
      "Proveïdors locals",
      "Punt de venda",
      "Clientes",
      "Comunitat i formació"
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
      ]
     ]
    },
    "es": {
     "nom": "Producto artesano / manufactura",
     "diu": "Producción física en pequeño formato, taller propio o compartido.",
     "roles": [
      "Artesanos/as",
      "Proveedores locales",
      "Punto de venta",
      "Clientes",
      "Comunidad y formación"
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
      ]
     ]
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
    }
   },
   {
    "id": "servei_tecnic",
    "icona": "💼",
    "ca": {
     "nom": "Consultoria / servei tècnic",
     "diu": "Consultoria, disseny, IT, arquitectura, assessoria — projecte per projecte.",
     "roles": [
      "Consultors/es",
      "Clients institucionals",
      "Clients privats",
      "Xarxa de partners",
      "Nucli operatiu"
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
      ]
     ]
    },
    "es": {
     "nom": "Consultoría / servicio técnico",
     "diu": "Consultoría, diseño, IT, arquitectura, asesoría — proyecto a proyecto.",
     "roles": [
      "Consultores/as",
      "Clientes institucionales",
      "Clientes privados",
      "Red de partners",
      "Núcleo operativo"
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
      ]
     ]
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
    }
   },
   {
    "id": "producte_digital",
    "icona": "📱",
    "ca": {
     "nom": "Producte digital / SaaS",
     "diu": "App, plataforma, servei online — usuaris massius o de nínxol.",
     "roles": [
      "Equip producte",
      "Usuaris/es",
      "Comunitat contributora",
      "Patrocini i inversió",
      "Infraestructura"
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
      ]
     ]
    },
    "es": {
     "nom": "Producto digital / SaaS",
     "diu": "App, plataforma, servicio online — usuarios masivos o de nicho.",
     "roles": [
      "Equipo de producto",
      "Usuarios/as",
      "Comunidad que contribuye",
      "Patrocinio e inversión",
      "Infraestructura"
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
      ]
     ]
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
    }
   },
   {
    "id": "cura_social",
    "icona": "💗",
    "ca": {
     "nom": "Cura i acompanyament social",
     "diu": "Xarxa de cures, salut comunitària, acompanyament a persones vulnerables.",
     "roles": [
      "Persones cuidadores",
      "Persones cuidades",
      "Famílies",
      "Serveis socials/CAP",
      "Voluntariat"
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
      ]
     ]
    },
    "es": {
     "nom": "Cuidados y acompañamiento social",
     "diu": "Red de cuidados, salud comunitaria, acompañamiento a personas vulnerables.",
     "roles": [
      "Personas cuidadoras",
      "Personas cuidadas",
      "Familias",
      "Servicios sociales / centro de salud",
      "Voluntariado"
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
      ]
     ]
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
    }
   },
   {
    "id": "formacio",
    "icona": "📚",
    "ca": {
     "nom": "Educació / formació",
     "diu": "Formació reglada o lliure, mentoria, escola comunitària.",
     "roles": [
      "Formadors/es",
      "Aprenents",
      "Coordinació pedagògica",
      "Espai formatiu",
      "Comunitat de pràctica"
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
      ]
     ]
    },
    "es": {
     "nom": "Educación / formación",
     "diu": "Formación reglada o libre, mentoría, escuela comunitaria.",
     "roles": [
      "Formadores/as",
      "Alumnos",
      "Coordinación pedagógica",
      "Espacio de formación",
      "Comunidad de práctica"
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
      ]
     ]
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
    }
   }
  ];
  /* Els sectors de la Matriu: rols, fluxos i els passos per posar-ho en marxa. */
  var SECTORS = [
   {
    "id": "dinamitzacio_comercial",
    "icona": "🏪",
    "ca": {
     "nom": "Dinamització comercial",
     "diu": "Revitalitzar el comerç i l'economia de proximitat.",
     "roles": [
      "Comerços de proximitat",
      "Ajuntament",
      "Associació de comerciants",
      "Veïnat",
      "Consumidors"
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
      ]
     ],
     "passos": [
      "Diagnòstic del teixit comercial",
      "Constituir l'associació",
      "Campanya de proximitat",
      "Fires i mercats",
      "Fidelització i moneda local"
     ]
    },
    "es": {
     "nom": "Dinamización comercial",
     "diu": "Revitalizar el comercio y la economía de proximidad.",
     "roles": [
      "Comercios de proximidad",
      "Ayuntamiento",
      "Asociación de comerciantes",
      "Vecindario",
      "Consumidores"
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
      ]
     ],
     "passos": [
      "Diagnóstico del tejido comercial",
      "Constituir la asociación",
      "Campaña de proximidad",
      "Ferias y mercados",
      "Fidelización y moneda local"
     ]
    }
   },
   {
    "id": "ocupacio",
    "icona": "💼",
    "ca": {
     "nom": "Ocupació i inserció laboral",
     "diu": "Crear ocupació digna i itineraris d'inserció.",
     "roles": [
      "Persones en cerca de feina",
      "Empreses locals",
      "Ajuntament",
      "Entitats formatives",
      "Servei d'ocupació"
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
      ]
     ],
     "passos": [
      "Mapar necessitats i perfils",
      "Aliances amb empreses",
      "Formació a mida",
      "Pràctiques i inserció",
      "Seguiment"
     ]
    },
    "es": {
     "nom": "Empleo e inserción laboral",
     "diu": "Crear empleo digno e itinerarios de inserción.",
     "roles": [
      "Personas que buscan trabajo",
      "Empresas locales",
      "Ayuntamiento",
      "Entidades formativas",
      "Servicio de empleo"
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
      ]
     ],
     "passos": [
      "Mapear necesidades y perfiles",
      "Alianzas con empresas",
      "Formación a medida",
      "Prácticas e inserción",
      "Seguimiento"
     ]
    }
   },
   {
    "id": "habitatge",
    "icona": "🏘️",
    "ca": {
     "nom": "Habitatge assequible",
     "diu": "Accés a habitatge digne sense especulació.",
     "roles": [
      "Grup motor",
      "Administració",
      "Finançament ètic",
      "Cooperativa",
      "Unitats de convivència"
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
     ]
    },
    "es": {
     "nom": "Vivienda asequible",
     "diu": "Acceso a una vivienda digna sin especulación.",
     "roles": [
      "Grupo motor",
      "Administración",
      "Financiación ética",
      "Cooperativa",
      "Unidades de convivencia"
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
     ]
    }
   },
   {
    "id": "energia",
    "icona": "⚡",
    "ca": {
     "nom": "Comunitat energètica",
     "diu": "Produir i compartir energia renovable localment.",
     "roles": [
      "Nucli promotor",
      "Sòcies consumidores",
      "Ajuntament",
      "Instal·ladora",
      "Assessoria"
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
     ]
    },
    "es": {
     "nom": "Comunidad energética",
     "diu": "Producir y compartir energía renovable localmente.",
     "roles": [
      "Núcleo promotor",
      "Socias consumidoras",
      "Ayuntamiento",
      "Instaladora",
      "Asesoría"
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
     ]
    }
   },
   {
    "id": "alimentacio",
    "icona": "🥬",
    "ca": {
     "nom": "Alimentació sostenible",
     "diu": "Aliments sans i de proximitat, de la terra al plat.",
     "roles": [
      "Pagesia local",
      "Grup de consum",
      "Obrador",
      "Punt de repartiment",
      "Consumidors"
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
      ]
     ],
     "passos": [
      "Formar el grup",
      "Contactar pagesia",
      "Logística",
      "Sistema de comandes",
      "Primera cistella",
      "Obrador"
     ]
    },
    "es": {
     "nom": "Alimentación sostenible",
     "diu": "Alimentos sanos y de proximidad, de la tierra al plato.",
     "roles": [
      "Campesinado local",
      "Grupo de consumo",
      "Obrador",
      "Punto de reparto",
      "Consumidores"
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
      ]
     ],
     "passos": [
      "Formar el grupo",
      "Contactar con el campesinado",
      "Logística",
      "Sistema de pedidos",
      "Primera cesta",
      "Obrador"
     ]
    }
   },
   {
    "id": "cures",
    "icona": "💗",
    "ca": {
     "nom": "Cures i salut comunitària",
     "diu": "Xarxa de cures i benestar contra la soledat.",
     "roles": [
      "Nucli de cura",
      "Veïnat",
      "Gent gran",
      "CAP / serveis socials",
      "Voluntariat"
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
      ]
     ],
     "passos": [
      "Detectar necessitats",
      "Formar el grup",
      "Protocol",
      "Primers acompanyaments",
      "Coordinació amb serveis"
     ]
    },
    "es": {
     "nom": "Cuidados y salud comunitaria",
     "diu": "Red de cuidados y bienestar contra la soledad.",
     "roles": [
      "Núcleo de cuidado",
      "Vecindario",
      "Personas mayores",
      "CAP / servicios sociales",
      "Voluntariado"
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
      ]
     ],
     "passos": [
      "Detectar necesidades",
      "Formar el grupo",
      "Protocolo",
      "Primeros acompañamientos",
      "Coordinación con servicios"
     ]
    }
   },
   {
    "id": "cultura",
    "icona": "🎭",
    "ca": {
     "nom": "Cultura i patrimoni",
     "diu": "Activar la cultura, la festa i el patrimoni local.",
     "roles": [
      "Entitats culturals",
      "Ajuntament",
      "Artistes",
      "Veïnat",
      "Escoles"
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
      ]
     ],
     "passos": [
      "Mapa d'agents culturals",
      "Programació compartida",
      "Recuperar patrimoni",
      "Festa major participativa",
      "Avaluació"
     ]
    },
    "es": {
     "nom": "Cultura y patrimonio",
     "diu": "Activar la cultura, la fiesta y el patrimonio local.",
     "roles": [
      "Entidades culturales",
      "Ayuntamiento",
      "Artistas",
      "Vecindario",
      "Escuelas"
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
      ]
     ],
     "passos": [
      "Mapa de agentes culturales",
      "Programación compartida",
      "Recuperar patrimonio",
      "Fiesta mayor participativa",
      "Evaluación"
     ]
    }
   },
   {
    "id": "turisme",
    "icona": "🧭",
    "ca": {
     "nom": "Turisme de poble sostenible",
     "diu": "Turisme responsable que reverteix al territori.",
     "roles": [
      "Allotjaments",
      "Ajuntament",
      "Restauració",
      "Guies locals",
      "Productors"
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
      ]
     ],
     "passos": [
      "Inventari d'atractius",
      "Producte turístic",
      "Aliances locals",
      "Promoció responsable",
      "Gestió de fluxos"
     ]
    },
    "es": {
     "nom": "Turismo de pueblo sostenible",
     "diu": "Turismo responsable que revierte en el territorio.",
     "roles": [
      "Alojamientos",
      "Ayuntamiento",
      "Restauración",
      "Guías locales",
      "Productores"
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
      ]
     ],
     "passos": [
      "Inventario de atractivos",
      "Producto turístico",
      "Alianzas locales",
      "Promoción responsable",
      "Gestión de flujos"
     ]
    }
   },
   {
    "id": "economia_circular",
    "icona": "♻️",
    "ca": {
     "nom": "Economia circular",
     "diu": "Reduir, reparar i reutilitzar en clau local.",
     "roles": [
      "Nucli gestor",
      "Veïnat",
      "Comerços",
      "Ajuntament",
      "Recicladors"
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
      ]
     ],
     "passos": [
      "Punt de reparació",
      "Biblioteca de les coses",
      "Mercat de segona mà",
      "Compostatge",
      "Sensibilització"
     ]
    },
    "es": {
     "nom": "Economía circular",
     "diu": "Reducir, reparar y reutilizar en clave local.",
     "roles": [
      "Núcleo gestor",
      "Vecindario",
      "Comercios",
      "Ayuntamiento",
      "Recicladores"
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
      ]
     ],
     "passos": [
      "Punto de reparación",
      "Biblioteca de las cosas",
      "Mercado de segunda mano",
      "Compostaje",
      "Sensibilización"
     ]
    }
   },
   {
    "id": "digitalitzacio",
    "icona": "🖥️",
    "ca": {
     "nom": "Digitalització i sobirania tecnològica",
     "diu": "Autonomia digital del teixit local.",
     "roles": [
      "Nucli tècnic",
      "Entitats",
      "Ajuntament",
      "Veïnat",
      "Formadors"
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
      ]
     ],
     "passos": [
      "Diagnòstic digital",
      "Formació bàsica",
      "Eines sobiranes",
      "Presència digital",
      "Manteniment comunitari"
     ]
    },
    "es": {
     "nom": "Digitalización y soberanía tecnológica",
     "diu": "Autonomía digital del tejido local.",
     "roles": [
      "Núcleo técnico",
      "Entidades",
      "Ayuntamiento",
      "Vecindario",
      "Formadores"
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
      ]
     ],
     "passos": [
      "Diagnóstico digital",
      "Formación básica",
      "Herramientas soberanas",
      "Presencia digital",
      "Mantenimiento comunitario"
     ]
    }
   },
   {
    "id": "joventut",
    "icona": "🛹",
    "ca": {
     "nom": "Joventut i lleure",
     "diu": "Espais i oportunitats per al jovent.",
     "roles": [
      "Jovent",
      "Esplai / entitats",
      "Ajuntament",
      "Escoles",
      "Monitoratge"
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
      ]
     ],
     "passos": [
      "Escoltar el jovent",
      "Espai jove",
      "Programació",
      "Projectes liderats per joves",
      "Relleu"
     ]
    },
    "es": {
     "nom": "Juventud y ocio",
     "diu": "Espacios y oportunidades para la juventud.",
     "roles": [
      "Juventud",
      "Esplai / entidades",
      "Ayuntamiento",
      "Escuelas",
      "Monitores"
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
      ]
     ],
     "passos": [
      "Escuchar a la juventud",
      "Espacio joven",
      "Programación",
      "Proyectos liderados por jóvenes",
      "Relevo"
     ]
    }
   },
   {
    "id": "mobilitat",
    "icona": "🚲",
    "ca": {
     "nom": "Mobilitat sostenible",
     "diu": "Moure's millor amb menys cotxe.",
     "roles": [
      "Veïnat",
      "Ajuntament",
      "Transport públic",
      "Grups ciclistes",
      "Escoles"
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
      ]
     ],
     "passos": [
      "Diagnòstic de mobilitat",
      "Camins escolars",
      "Cotxe compartit",
      "Carril bici",
      "Avaluació"
     ]
    },
    "es": {
     "nom": "Movilidad sostenible",
     "diu": "Moverse mejor con menos coche.",
     "roles": [
      "Vecindario",
      "Ayuntamiento",
      "Transporte público",
      "Grupos ciclistas",
      "Escuelas"
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
      ]
     ],
     "passos": [
      "Diagnóstico de movilidad",
      "Caminos escolares",
      "Coche compartido",
      "Carril bici",
      "Evaluación"
     ]
    }
   },
   {
    "id": "acollida",
    "icona": "🫂",
    "ca": {
     "nom": "Acollida i inclusió",
     "diu": "Integrar i cohesionar amb qui arriba.",
     "roles": [
      "Nouvinguts",
      "Entitats d'acollida",
      "Ajuntament",
      "Veïnat",
      "Escoles"
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
      ]
     ],
     "passos": [
      "Mapa de necessitats",
      "Punt d'acollida",
      "Aprenentatge de la llengua",
      "Mentories veïnals",
      "Participació"
     ]
    },
    "es": {
     "nom": "Acogida e inclusión",
     "diu": "Integrar y cohesionar con quien llega.",
     "roles": [
      "Recién llegados",
      "Entidades de acogida",
      "Ayuntamiento",
      "Vecindario",
      "Escuelas"
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
      ]
     ],
     "passos": [
      "Mapa de necesidades",
      "Punto de acogida",
      "Aprendizaje de la lengua",
      "Mentorías vecinales",
      "Participación"
     ]
    }
   },
   {
    "id": "territori",
    "icona": "🌳",
    "ca": {
     "nom": "Custòdia del territori",
     "diu": "Tenir cura del medi natural i agrari.",
     "roles": [
      "Custòdia / entitat",
      "Propietaris",
      "Ajuntament",
      "Voluntariat",
      "Pagesia"
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
      ]
     ],
     "passos": [
      "Diagnòstic ambiental",
      "Acords de custòdia",
      "Jornades de voluntariat",
      "Recuperació d'hàbitats",
      "Seguiment"
     ]
    },
    "es": {
     "nom": "Custodia del territorio",
     "diu": "Cuidar el medio natural y agrario.",
     "roles": [
      "Custodia / entidad",
      "Propietarios",
      "Ayuntamiento",
      "Voluntariado",
      "Campesinado"
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
      ]
     ],
     "passos": [
      "Diagnóstico ambiental",
      "Acuerdos de custodia",
      "Jornadas de voluntariado",
      "Recuperación de hábitats",
      "Seguimiento"
     ]
    }
   }
  ];
  /* El rol que més dona i rep: el que fa de «tu» quan algú comença per aquest model. */
  function centre(m) { var n = {}; m.pairs.forEach(function (p) { n[p[0]] = (n[p[0]] || 0) + 1; n[p[1]] = (n[p[1]] || 0) + 1; });
    return m.roles.slice().sort(function (a, b) { return (n[b] || 0) - (n[a] || 0); })[0]; }
  /* El model en una llengua, amb el centre canviat pel nom de qui el fa servir. */
  function mapa(id, llengua, casa) {
    var M = MODELS.concat(SECTORS).filter(function (x) { return x.id === id; })[0]; if (!M) return null;
    var m = M[llengua] || M.es || M.ca, c = centre(m), r = function (x) { return casa && x === c ? casa : x; };
    return { abast: '', roles: m.roles.map(r), pairs: m.pairs.map(function (p) { return [r(p[0]), r(p[1]), p[2], p[3], p[4], p[5]]; }), centre: casa || c, nom: m.nom };
  }
  return { MODELS: MODELS, SECTORS: SECTORS, centre: centre, mapa: mapa };
});
