/* El mapa de valor de Boreal Light España para la animación de SOS/lib/mapa-anima.js
   (data-cas="CasBoreal"). Sale del mapa del holding (holding/negocio/boreal-light-mapa.json),
   sin cifras, sin condiciones y sin nombres. Naranja: lo que activaríamos juntos; azul: lo que
   ya pasa hoy; gris: el socio instalador, por montar. */
(function (g) { g.CasBoreal = {
 "nom": {
  "es": "Boreal Light España",
  "en": "Boreal Light Spain"
 },
 "roles": {
  "es": [
   "Quien fabrica",
   "Quien representa",
   "Quien necesita agua",
   "Quien instala y mantiene",
   "Quien autoriza el agua",
   "Quien financia",
   "Quien bebe y riega",
   "Quien recomienda"
  ],
  "en": [
   "Manufacturer",
   "Local representative",
   "Water customer",
   "Local installer",
   "Water authority",
   "Funder",
   "Local community",
   "Who recommends"
  ]
 },
 "icones": {
  "Quien fabrica": "🏭",
  "Quien representa": "🤝",
  "Quien necesita agua": "🏡",
  "Quien instala y mantiene": "🔧",
  "Quien autoriza el agua": "🏛️",
  "Quien financia": "💶",
  "Quien bebe y riega": "💧",
  "Quien recomienda": "📣",
  "Manufacturer": "🏭",
  "Local representative": "🤝",
  "Water customer": "🏡",
  "Local installer": "🔧",
  "Water authority": "🏛️",
  "Funder": "💶",
  "Local community": "💧",
  "Who recommends": "📣"
 },
 "nivells": {
  "persona": {
   "icona": "·",
   "es": "Lo hace una persona",
   "en": "A person does it"
  },
  "maquina": {
   "icona": "⚡",
   "es": "Lo activaríamos juntos",
   "en": "We would activate it together"
  }
 },
 "processos": [
  {
   "id": "venta",
   "nom": {
    "es": "La venta",
    "en": "The sale"
   }
  },
  {
   "id": "instalacion",
   "nom": {
    "es": "La instalación",
    "en": "The installation"
   }
  },
  {
   "id": "financiacion",
   "nom": {
    "es": "La financiación",
    "en": "The funding"
   }
  },
  {
   "id": "operacion",
   "nom": {
    "es": "La vida de la planta",
    "en": "The life of the plant"
   }
  }
 ],
 "fluxos": [
  {
   "de": {
    "es": "Quien representa",
    "en": "Local representative"
   },
   "a": {
    "es": "Quien fabrica",
    "en": "Manufacturer"
   },
   "mena": "tangible",
   "que": {
    "es": "el pedido con la ficha del sitio y la analítica del agua",
    "en": "the order with the site form and the water analysis"
   },
   "escalo": "definido",
   "proces": "instalacion",
   "qui": "maquina"
  },
  {
   "de": {
    "es": "Quien fabrica",
    "en": "Manufacturer"
   },
   "a": {
    "es": "Quien representa",
    "en": "Local representative"
   },
   "mena": "tangible",
   "que": {
    "es": "la planta y la oferta técnica",
    "en": "the plant and the technical offer"
   },
   "escalo": "definido",
   "proces": "instalacion",
   "qui": "maquina"
  },
  {
   "de": {
    "es": "Quien fabrica",
    "en": "Manufacturer"
   },
   "a": {
    "es": "Quien representa",
    "en": "Local representative"
   },
   "mena": "intangible",
   "que": {
    "es": "la formación técnica y los casos de otros países",
    "en": "technical training and cases from other countries"
   },
   "escalo": "definido",
   "proces": "instalacion",
   "qui": "maquina"
  },
  {
   "de": {
    "es": "Quien representa",
    "en": "Local representative"
   },
   "a": {
    "es": "Quien fabrica",
    "en": "Manufacturer"
   },
   "mena": "intangible",
   "que": {
    "es": "lo que pide el mercado mediterráneo y cómo se vende aquí",
    "en": "what the Mediterranean market asks for and how to sell here"
   },
   "escalo": "definido",
   "proces": "venta",
   "qui": "maquina"
  },
  {
   "de": {
    "es": "Quien representa",
    "en": "Local representative"
   },
   "a": {
    "es": "Quien necesita agua",
    "en": "Water customer"
   },
   "mena": "tangible",
   "que": {
    "es": "el estudio del sitio, la oferta y la planta llave en mano",
    "en": "the site study, the offer and a turnkey plant"
   },
   "escalo": "definido",
   "proces": "venta",
   "qui": "maquina"
  },
  {
   "de": {
    "es": "Quien necesita agua",
    "en": "Water customer"
   },
   "a": {
    "es": "Quien representa",
    "en": "Local representative"
   },
   "mena": "tangible",
   "que": {
    "es": "el contrato y el acceso al sitio",
    "en": "the contract and access to the site"
   },
   "escalo": "definido",
   "proces": "venta",
   "qui": "maquina"
  },
  {
   "de": {
    "es": "Quien fabrica",
    "en": "Manufacturer"
   },
   "a": {
    "es": "Quien necesita agua",
    "en": "Water customer"
   },
   "mena": "tangible",
   "que": {
    "es": "la garantía y la monitorización a distancia",
    "en": "the warranty and remote monitoring"
   },
   "escalo": "persona",
   "proces": "operacion",
   "qui": "persona"
  },
  {
   "de": {
    "es": "Quien necesita agua",
    "en": "Water customer"
   },
   "a": {
    "es": "Quien fabrica",
    "en": "Manufacturer"
   },
   "mena": "intangible",
   "que": {
    "es": "los datos de la planta en un clima nuevo",
    "en": "plant data from a new climate"
   },
   "escalo": "persona",
   "proces": "operacion",
   "qui": "persona"
  },
  {
   "de": {
    "es": "Quien instala y mantiene",
    "en": "Local installer"
   },
   "a": {
    "es": "Quien representa",
    "en": "Local representative"
   },
   "mena": "tangible",
   "que": {
    "es": "la obra, el montaje y las visitas de mantenimiento",
    "en": "the works, assembly and maintenance visits"
   },
   "escalo": "por_montar",
   "proces": "instalacion",
   "qui": "persona"
  },
  {
   "de": {
    "es": "Quien representa",
    "en": "Local representative"
   },
   "a": {
    "es": "Quien instala y mantiene",
    "en": "Local installer"
   },
   "mena": "tangible",
   "que": {
    "es": "el encargo de cada obra",
    "en": "the order for each job"
   },
   "escalo": "por_montar",
   "proces": "instalacion",
   "qui": "persona"
  },
  {
   "de": {
    "es": "Quien instala y mantiene",
    "en": "Local installer"
   },
   "a": {
    "es": "Quien necesita agua",
    "en": "Water customer"
   },
   "mena": "intangible",
   "que": {
    "es": "el aviso temprano cuando algo va a fallar",
    "en": "early warning when something is about to fail"
   },
   "escalo": "por_montar",
   "proces": "operacion",
   "qui": "persona"
  },
  {
   "de": {
    "es": "Quien necesita agua",
    "en": "Water customer"
   },
   "a": {
    "es": "Quien instala y mantiene",
    "en": "Local installer"
   },
   "mena": "intangible",
   "que": {
    "es": "la confianza para volver a llamarle",
    "en": "the trust to call again"
   },
   "escalo": "por_montar",
   "proces": "operacion",
   "qui": "persona"
  },
  {
   "de": {
    "es": "Quien necesita agua",
    "en": "Water customer"
   },
   "a": {
    "es": "Quien autoriza el agua",
    "en": "Water authority"
   },
   "mena": "tangible",
   "que": {
    "es": "la solicitud con la analítica y el proyecto",
    "en": "the application with the analysis and the project"
   },
   "escalo": "persona",
   "proces": "instalacion",
   "qui": "persona"
  },
  {
   "de": {
    "es": "Quien autoriza el agua",
    "en": "Water authority"
   },
   "a": {
    "es": "Quien necesita agua",
    "en": "Water customer"
   },
   "mena": "tangible",
   "que": {
    "es": "la autorización y el control sanitario",
    "en": "the permit and health control"
   },
   "escalo": "persona",
   "proces": "instalacion",
   "qui": "persona"
  },
  {
   "de": {
    "es": "Quien autoriza el agua",
    "en": "Water authority"
   },
   "a": {
    "es": "Quien representa",
    "en": "Local representative"
   },
   "mena": "intangible",
   "que": {
    "es": "qué zonas y qué normas piden solución",
    "en": "which areas and rules call for a solution"
   },
   "escalo": "definido",
   "proces": "venta",
   "qui": "maquina"
  },
  {
   "de": {
    "es": "Quien representa",
    "en": "Local representative"
   },
   "a": {
    "es": "Quien autoriza el agua",
    "en": "Water authority"
   },
   "mena": "intangible",
   "que": {
    "es": "casos de agua limpia sin red que puede enseñar",
    "en": "off-grid clean water cases it can show"
   },
   "escalo": "definido",
   "proces": "venta",
   "qui": "maquina"
  },
  {
   "de": {
    "es": "Quien financia",
    "en": "Funder"
   },
   "a": {
    "es": "Quien necesita agua",
    "en": "Water customer"
   },
   "mena": "tangible",
   "que": {
    "es": "la subvención o el préstamo",
    "en": "the grant or the loan"
   },
   "escalo": "persona",
   "proces": "financiacion",
   "qui": "persona"
  },
  {
   "de": {
    "es": "Quien necesita agua",
    "en": "Water customer"
   },
   "a": {
    "es": "Quien financia",
    "en": "Funder"
   },
   "mena": "tangible",
   "que": {
    "es": "la justificación con el agua producida",
    "en": "reporting on the water produced"
   },
   "escalo": "persona",
   "proces": "financiacion",
   "qui": "persona"
  },
  {
   "de": {
    "es": "Quien representa",
    "en": "Local representative"
   },
   "a": {
    "es": "Quien financia",
    "en": "Funder"
   },
   "mena": "intangible",
   "que": {
    "es": "proyectos maduros, listos para financiar",
    "en": "mature projects, ready to fund"
   },
   "escalo": "definido",
   "proces": "financiacion",
   "qui": "maquina"
  },
  {
   "de": {
    "es": "Quien financia",
    "en": "Funder"
   },
   "a": {
    "es": "Quien representa",
    "en": "Local representative"
   },
   "mena": "intangible",
   "que": {
    "es": "qué convocatorias abren y cuándo",
    "en": "which calls open and when"
   },
   "escalo": "definido",
   "proces": "financiacion",
   "qui": "maquina"
  },
  {
   "de": {
    "es": "Quien necesita agua",
    "en": "Water customer"
   },
   "a": {
    "es": "Quien bebe y riega",
    "en": "Local community"
   },
   "mena": "tangible",
   "que": {
    "es": "el agua potable o de riego cada día",
    "en": "drinking or irrigation water every day"
   },
   "escalo": "persona",
   "proces": "operacion",
   "qui": "persona"
  },
  {
   "de": {
    "es": "Quien bebe y riega",
    "en": "Local community"
   },
   "a": {
    "es": "Quien necesita agua",
    "en": "Water customer"
   },
   "mena": "tangible",
   "que": {
    "es": "el pago del agua o la tasa",
    "en": "paying for the water or the fee"
   },
   "escalo": "persona",
   "proces": "operacion",
   "qui": "persona"
  },
  {
   "de": {
    "es": "Quien bebe y riega",
    "en": "Local community"
   },
   "a": {
    "es": "Quien recomienda",
    "en": "Who recommends"
   },
   "mena": "intangible",
   "que": {
    "es": "la historia del agua recuperada",
    "en": "the story of recovered water"
   },
   "escalo": "persona",
   "proces": "operacion",
   "qui": "persona"
  },
  {
   "de": {
    "es": "Quien recomienda",
    "en": "Who recommends"
   },
   "a": {
    "es": "Quien bebe y riega",
    "en": "Local community"
   },
   "mena": "intangible",
   "que": {
    "es": "voz y visibilidad para su pueblo",
    "en": "voice and visibility for their town"
   },
   "escalo": "persona",
   "proces": "operacion",
   "qui": "persona"
  },
  {
   "de": {
    "es": "Quien recomienda",
    "en": "Who recommends"
   },
   "a": {
    "es": "Quien necesita agua",
    "en": "Water customer"
   },
   "mena": "intangible",
   "que": {
    "es": "la recomendación de una solución probada",
    "en": "the recommendation of a proven solution"
   },
   "escalo": "persona",
   "proces": "venta",
   "qui": "persona"
  },
  {
   "de": {
    "es": "Quien necesita agua",
    "en": "Water customer"
   },
   "a": {
    "es": "Quien recomienda",
    "en": "Who recommends"
   },
   "mena": "intangible",
   "que": {
    "es": "la gratitud y un caso que contar",
    "en": "gratitude and a case to tell"
   },
   "escalo": "persona",
   "proces": "venta",
   "qui": "persona"
  },
  {
   "de": {
    "es": "Quien recomienda",
    "en": "Who recommends"
   },
   "a": {
    "es": "Quien representa",
    "en": "Local representative"
   },
   "mena": "intangible",
   "que": {
    "es": "la presentación a quien tiene el problema del agua",
    "en": "an introduction to whoever has the water problem"
   },
   "escalo": "definido",
   "proces": "venta",
   "qui": "maquina"
  },
  {
   "de": {
    "es": "Quien representa",
    "en": "Local representative"
   },
   "a": {
    "es": "Quien recomienda",
    "en": "Who recommends"
   },
   "mena": "intangible",
   "que": {
    "es": "una solución que puede recomendar sin riesgo",
    "en": "a solution it can recommend without risk"
   },
   "escalo": "definido",
   "proces": "venta",
   "qui": "maquina"
  }
 ],
 "textos": {
  "es": {
   "punt": "los activaríamos juntos",
   "persona": "ya ocurren hoy",
   "muntar": "por montar: el socio instalador",
   "valor": "Una red pequeña y bien tejida lleva lo que antes pedía una oficina.",
   "pinya": "Como en un castell: si la base aguanta, el proyecto llega arriba. Cada entregable que circula es alguien más empujando. En naranja, lo que activaríamos juntos; en azul, lo que ya pasa hoy; en gris, lo que falta montar.",
   "a11y": "Mapa de valor animado de Boreal Light España: {0} roles y {1} entregables"
  },
  "en": {
   "punt": "we would activate together",
   "persona": "already happen today",
   "muntar": "still to set up: the installation partner",
   "valor": "A small, well-woven network carries what used to need an office.",
   "pinya": "Like a human tower: if the base holds, the project reaches the top. Every deliverable that flows is one more person pushing. In orange, what we would activate together; in blue, what already happens today; in grey, what is still to set up.",
   "a11y": "Animated value map of Boreal Light Spain: {0} roles and {1} deliverables"
  }
 }
}; })(typeof window !== 'undefined' ? window : this);
