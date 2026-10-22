/* GENERAT per SOS/tools/build-models-mapa.js des de SOS/index.html (DYNAMICS «negoci»
   i PROTOTYPE_MAPS) · no s'edita a mà. Els mapes tipus del SOS en tres llengües. */
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
  /* El rol que més dona i rep: el que fa de «tu» quan algú comença per aquest model. */
  function centre(m) { var n = {}; m.pairs.forEach(function (p) { n[p[0]] = (n[p[0]] || 0) + 1; n[p[1]] = (n[p[1]] || 0) + 1; });
    return m.roles.slice().sort(function (a, b) { return (n[b] || 0) - (n[a] || 0); })[0]; }
  /* El model en una llengua, amb el centre canviat pel nom de qui el fa servir. */
  function mapa(id, llengua, casa) {
    var M = MODELS.filter(function (x) { return x.id === id; })[0]; if (!M) return null;
    var m = M[llengua] || M.ca, c = centre(m), r = function (x) { return casa && x === c ? casa : x; };
    return { abast: '', roles: m.roles.map(r), pairs: m.pairs.map(function (p) { return [r(p[0]), r(p[1]), p[2], p[3], p[4], p[5]]; }), centre: casa || c, nom: m.nom };
  }
  return { MODELS: MODELS, centre: centre, mapa: mapa };
});
