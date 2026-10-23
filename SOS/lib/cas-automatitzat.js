/* GENERAT per SOS/tools/build-cas-automatitzat.js des del mapa de valor privat de la xarxa i el seu
   catàleg d'operacions, sense noms ni projectes interns. No s'edita a mà. */
(function (g) {
  var C = {
   "nom": {
    "es": "Una productora de eventos de empresa",
    "ca": "Una productora d'esdeveniments d'empresa"
   },
   "diu": {
    "es": "Una persona y su red de proveedores locales organizan jornadas de equipo con espacio, comida, vino y actividad. La IA y los programas preparan; la persona decide y valida. Así lleva lo que antes pedía una oficina. El mapa es real; los nombres no están.",
    "ca": "Una persona i la seva xarxa de proveïdors locals organitzen jornades d'equip amb espai, menjar, vi i activitat. La IA i els programes preparen; la persona decideix i valida. Així porta el que abans demanava una oficina. El mapa és real; els noms no hi són."
   },
   "nivells": {
    "solo": {
     "icona": "⚡",
     "es": "Va solo, sin esperar a nadie",
     "ca": "Va sol, sense esperar ningú"
    },
    "ia": {
     "icona": "✦",
     "es": "La IA lo prepara y una persona lo valida",
     "ca": "La IA ho prepara i una persona ho valida"
    },
    "maquina": {
     "icona": "⚙",
     "es": "Un programa lo prepara con los datos y una persona lo valida",
     "ca": "Un programa ho prepara amb les dades i una persona ho valida"
    },
    "persona": {
     "icona": "·",
     "es": "Lo hace una persona",
     "ca": "Ho fa una persona"
    }
   },
   "escalons": {
    "automatizado": {
     "es": "automatizado",
     "ca": "automatitzat"
    },
    "definido": {
     "es": "definido: listo para automatizar",
     "ca": "definit: a punt per automatitzar"
    },
    "presencial": {
     "es": "cara a cara: no se automatiza",
     "ca": "cara a cara: no s'automatitza"
    },
    "por_montar": {
     "es": "por montar",
     "ca": "per muntar"
    },
    "sin_definir": {
     "es": "sin definir",
     "ca": "sense definir"
    }
   },
   "roles": {
    "es": [
     "Quien encarga el evento",
     "Quien lo revende",
     "Quien produce y coordina",
     "Quien acoge",
     "Quien elabora el vino",
     "Quien sirve en el evento",
     "Quien dinamiza la actividad",
     "Quien asiste",
     "Quien factura y cobra"
    ],
    "ca": [
     "Qui encarrega l'esdeveniment",
     "Qui el revèn",
     "Qui produeix i coordina",
     "Qui acull",
     "Qui elabora el vi",
     "Qui serveix a l'esdeveniment",
     "Qui dinamitza l'activitat",
     "Qui hi assisteix",
     "Qui factura i cobra"
    ]
   },
   "processos": [
    {
     "id": "venta",
     "nom": {
      "es": "La venta",
      "ca": "La venda"
     },
     "compte": {
      "automatizado": 4,
      "definido": 6,
      "presencial": 0,
      "por_montar": 0,
      "sin_definir": 0
     }
    },
    {
     "id": "produccion",
     "nom": {
      "es": "La producción",
      "ca": "La producció"
     },
     "compte": {
      "automatizado": 2,
      "definido": 1,
      "presencial": 3,
      "por_montar": 1,
      "sin_definir": 0
     }
    },
    {
     "id": "cobro",
     "nom": {
      "es": "El cobro",
      "ca": "El cobrament"
     },
     "compte": {
      "automatizado": 6,
      "definido": 0,
      "presencial": 0,
      "por_montar": 0,
      "sin_definir": 0
     }
    },
    {
     "id": "siempre",
     "nom": {
      "es": "Siempre",
      "ca": "Sempre"
     },
     "compte": {
      "automatizado": 0,
      "definido": 0,
      "presencial": 0,
      "por_montar": 1,
      "sin_definir": 0
     }
    }
   ],
   "fluxos": [
    {
     "de": {
      "es": "Quien encarga el evento",
      "ca": "Qui encarrega l'esdeveniment"
     },
     "a": {
      "es": "Quien produce y coordina",
      "ca": "Qui produeix i coordina"
     },
     "mena": "tangible",
     "que": {
      "es": "el pedido con fecha, personas, actividad y zona",
      "ca": "la comanda amb data, persones, activitat i zona"
     },
     "qui": "solo",
     "escalo": "automatizado",
     "proces": "venta"
    },
    {
     "de": {
      "es": "Quien produce y coordina",
      "ca": "Qui produeix i coordina"
     },
     "a": {
      "es": "Quien encarga el evento",
      "ca": "Qui encarrega l'esdeveniment"
     },
     "mena": "tangible",
     "que": {
      "es": "la respuesta en el día y la propuesta con opciones cerradas y complementos",
      "ca": "la resposta el mateix dia i la proposta amb opcions tancades i complements"
     },
     "qui": "ia",
     "escalo": "automatizado",
     "proces": "venta"
    },
    {
     "de": {
      "es": "Quien lo revende",
      "ca": "Qui el revèn"
     },
     "a": {
      "es": "Quien produce y coordina",
      "ca": "Qui produeix i coordina"
     },
     "mena": "tangible",
     "que": {
      "es": "el encargo en marca blanca",
      "ca": "l'encàrrec en marca blanca"
     },
     "qui": "solo",
     "escalo": "automatizado",
     "proces": "venta"
    },
    {
     "de": {
      "es": "Quien produce y coordina",
      "ca": "Qui produeix i coordina"
     },
     "a": {
      "es": "Quien lo revende",
      "ca": "Qui el revèn"
     },
     "mena": "tangible",
     "que": {
      "es": "la tarifa de agencia y la producción en destino",
      "ca": "la tarifa d'agència i la producció a destinació"
     },
     "qui": "ia",
     "escalo": "automatizado",
     "proces": "venta"
    },
    {
     "de": {
      "es": "Quien encarga el evento",
      "ca": "Qui encarrega l'esdeveniment"
     },
     "a": {
      "es": "Quien lo revende",
      "ca": "Qui el revèn"
     },
     "mena": "tangible",
     "que": {
      "es": "el pago del evento a la agencia",
      "ca": "el pagament de l'esdeveniment a l'agència"
     },
     "qui": "persona",
     "escalo": null,
     "proces": null
    },
    {
     "de": {
      "es": "Quien lo revende",
      "ca": "Qui el revèn"
     },
     "a": {
      "es": "Quien encarga el evento",
      "ca": "Qui encarrega l'esdeveniment"
     },
     "mena": "tangible",
     "que": {
      "es": "el evento con la marca de la agencia",
      "ca": "l'esdeveniment amb la marca de l'agència"
     },
     "qui": "persona",
     "escalo": null,
     "proces": null
    },
    {
     "de": {
      "es": "Quien produce y coordina",
      "ca": "Qui produeix i coordina"
     },
     "a": {
      "es": "Quien acoge",
      "ca": "Qui acull"
     },
     "mena": "tangible",
     "que": {
      "es": "la consulta de disponibilidad con sus opciones del catálogo ya montadas y, al elegir, la reserva",
      "ca": "la consulta de disponibilitat amb les seves opcions del catàleg ja muntades i, en triar, la reserva"
     },
     "qui": "persona",
     "escalo": "definido",
     "proces": "venta"
    },
    {
     "de": {
      "es": "Quien acoge",
      "ca": "Qui acull"
     },
     "a": {
      "es": "Quien produce y coordina",
      "ca": "Qui produeix i coordina"
     },
     "mena": "tangible",
     "que": {
      "es": "la disponibilidad y las propuestas cerradas para el grupo, desde su ficha y sus paquetes",
      "ca": "la disponibilitat i les propostes tancades per al grup, des de la seva fitxa i els seus paquets"
     },
     "qui": "persona",
     "escalo": "definido",
     "proces": "venta"
    },
    {
     "de": {
      "es": "Quien produce y coordina",
      "ca": "Qui produeix i coordina"
     },
     "a": {
      "es": "Quien sirve en el evento",
      "ca": "Qui serveix a l'esdeveniment"
     },
     "mena": "tangible",
     "que": {
      "es": "la consulta con sus menús del catálogo ya montados para el grupo y, al elegir, el encargo",
      "ca": "la consulta amb els seus menús del catàleg ja muntats per al grup i, en triar, l'encàrrec"
     },
     "qui": "persona",
     "escalo": "definido",
     "proces": "venta"
    },
    {
     "de": {
      "es": "Quien sirve en el evento",
      "ca": "Qui serveix a l'esdeveniment"
     },
     "a": {
      "es": "Quien produce y coordina",
      "ca": "Qui produeix i coordina"
     },
     "mena": "tangible",
     "que": {
      "es": "las propuestas cerradas con precio por persona",
      "ca": "les propostes tancades amb preu per persona"
     },
     "qui": "persona",
     "escalo": "definido",
     "proces": "venta"
    },
    {
     "de": {
      "es": "Quien produce y coordina",
      "ca": "Qui produeix i coordina"
     },
     "a": {
      "es": "Quien dinamiza la actividad",
      "ca": "Qui dinamitza l'activitat"
     },
     "mena": "tangible",
     "que": {
      "es": "el encargo del taller",
      "ca": "l'encàrrec del taller"
     },
     "qui": "persona",
     "escalo": "definido",
     "proces": "produccion"
    },
    {
     "de": {
      "es": "Quien dinamiza la actividad",
      "ca": "Qui dinamitza l'activitat"
     },
     "a": {
      "es": "Quien produce y coordina",
      "ca": "Qui produeix i coordina"
     },
     "mena": "tangible",
     "que": {
      "es": "el taller con monitores y material",
      "ca": "el taller amb monitors i material"
     },
     "qui": "persona",
     "escalo": "presencial",
     "proces": "produccion"
    },
    {
     "de": {
      "es": "Quien produce y coordina",
      "ca": "Qui produeix i coordina"
     },
     "a": {
      "es": "Quien asiste",
      "ca": "Qui hi assisteix"
     },
     "mena": "intangible",
     "que": {
      "es": "la atención al detalle durante el día",
      "ca": "l'atenció al detall durant el dia"
     },
     "qui": "persona",
     "escalo": "por_montar",
     "proces": "produccion"
    },
    {
     "de": {
      "es": "Quien asiste",
      "ca": "Qui hi assisteix"
     },
     "a": {
      "es": "Quien produce y coordina",
      "ca": "Qui produeix i coordina"
     },
     "mena": "intangible",
     "que": {
      "es": "la valoración y las fotos que comparte",
      "ca": "la valoració i les fotos que comparteix"
     },
     "qui": "ia",
     "escalo": "automatizado",
     "proces": "produccion"
    },
    {
     "de": {
      "es": "Quien acoge",
      "ca": "Qui acull"
     },
     "a": {
      "es": "Quien asiste",
      "ca": "Qui hi assisteix"
     },
     "mena": "intangible",
     "que": {
      "es": "el lugar y su historia",
      "ca": "el lloc i la seva història"
     },
     "qui": "persona",
     "escalo": null,
     "proces": null
    },
    {
     "de": {
      "es": "Quien asiste",
      "ca": "Qui hi assisteix"
     },
     "a": {
      "es": "Quien acoge",
      "ca": "Qui acull"
     },
     "mena": "intangible",
     "que": {
      "es": "la visita que vuelve y lo recomienda",
      "ca": "la visita que torna i el recomana"
     },
     "qui": "persona",
     "escalo": null,
     "proces": null
    },
    {
     "de": {
      "es": "Quien sirve en el evento",
      "ca": "Qui serveix a l'esdeveniment"
     },
     "a": {
      "es": "Quien asiste",
      "ca": "Qui hi assisteix"
     },
     "mena": "intangible",
     "que": {
      "es": "el relato de quien elabora el producto",
      "ca": "el relat de qui elabora el producte"
     },
     "qui": "persona",
     "escalo": null,
     "proces": null
    },
    {
     "de": {
      "es": "Quien asiste",
      "ca": "Qui hi assisteix"
     },
     "a": {
      "es": "Quien sirve en el evento",
      "ca": "Qui serveix a l'esdeveniment"
     },
     "mena": "intangible",
     "que": {
      "es": "la compra y la recomendación posterior",
      "ca": "la compra i la recomanació posterior"
     },
     "qui": "persona",
     "escalo": null,
     "proces": null
    },
    {
     "de": {
      "es": "Quien dinamiza la actividad",
      "ca": "Qui dinamitza l'activitat"
     },
     "a": {
      "es": "Quien asiste",
      "ca": "Qui hi assisteix"
     },
     "mena": "intangible",
     "que": {
      "es": "la vivencia de construir algo juntos",
      "ca": "la vivència de construir alguna cosa junts"
     },
     "qui": "persona",
     "escalo": "presencial",
     "proces": "produccion"
    },
    {
     "de": {
      "es": "Quien asiste",
      "ca": "Qui hi assisteix"
     },
     "a": {
      "es": "Quien dinamiza la actividad",
      "ca": "Qui dinamitza l'activitat"
     },
     "mena": "intangible",
     "que": {
      "es": "el testimonio del grupo",
      "ca": "el testimoni del grup"
     },
     "qui": "ia",
     "escalo": "automatizado",
     "proces": "produccion"
    },
    {
     "de": {
      "es": "Quien factura y cobra",
      "ca": "Qui factura i cobra"
     },
     "a": {
      "es": "Quien encarga el evento",
      "ca": "Qui encarrega l'esdeveniment"
     },
     "mena": "tangible",
     "que": {
      "es": "la proforma de la reserva no reembolsable al confirmar y, al terminar, la factura del resto",
      "ca": "la proforma de la reserva no reemborsable en confirmar i, en acabar, la factura de la resta"
     },
     "qui": "maquina",
     "escalo": "automatizado",
     "proces": "cobro"
    },
    {
     "de": {
      "es": "Quien encarga el evento",
      "ca": "Qui encarrega l'esdeveniment"
     },
     "a": {
      "es": "Quien factura y cobra",
      "ca": "Qui factura i cobra"
     },
     "mena": "tangible",
     "que": {
      "es": "sus datos fiscales, el pago de la reserva y el del resto",
      "ca": "les seves dades fiscals, el pagament de la reserva i el de la resta"
     },
     "qui": "maquina",
     "escalo": "automatizado",
     "proces": "cobro"
    },
    {
     "de": {
      "es": "Quien factura y cobra",
      "ca": "Qui factura i cobra"
     },
     "a": {
      "es": "Quien lo revende",
      "ca": "Qui el revèn"
     },
     "mena": "tangible",
     "que": {
      "es": "la proforma neta de la reserva no reembolsable al confirmar y, al terminar, la factura del resto",
      "ca": "la proforma neta de la reserva no reemborsable en confirmar i, en acabar, la factura de la resta"
     },
     "qui": "maquina",
     "escalo": "automatizado",
     "proces": "cobro"
    },
    {
     "de": {
      "es": "Quien lo revende",
      "ca": "Qui el revèn"
     },
     "a": {
      "es": "Quien factura y cobra",
      "ca": "Qui factura i cobra"
     },
     "mena": "tangible",
     "que": {
      "es": "sus datos fiscales, el pago de la reserva y el del resto",
      "ca": "les seves dades fiscals, el pagament de la reserva i el de la resta"
     },
     "qui": "maquina",
     "escalo": "automatizado",
     "proces": "cobro"
    },
    {
     "de": {
      "es": "Quien produce y coordina",
      "ca": "Qui produeix i coordina"
     },
     "a": {
      "es": "Quien factura y cobra",
      "ca": "Qui factura i cobra"
     },
     "mena": "tangible",
     "que": {
      "es": "las líneas de venta de cada evento",
      "ca": "les línies de venda de cada esdeveniment"
     },
     "qui": "maquina",
     "escalo": "automatizado",
     "proces": "cobro"
    },
    {
     "de": {
      "es": "Quien factura y cobra",
      "ca": "Qui factura i cobra"
     },
     "a": {
      "es": "Quien produce y coordina",
      "ca": "Qui produeix i coordina"
     },
     "mena": "intangible",
     "que": {
      "es": "saber qué deja cada evento",
      "ca": "saber què deixa cada esdeveniment"
     },
     "qui": "maquina",
     "escalo": "automatizado",
     "proces": "cobro"
    },
    {
     "de": {
      "es": "Quien dinamiza la actividad",
      "ca": "Qui dinamitza l'activitat"
     },
     "a": {
      "es": "Quien encarga el evento",
      "ca": "Qui encarrega l'esdeveniment"
     },
     "mena": "intangible",
     "que": {
      "es": "la metáfora del equipo que se lleva a la oficina",
      "ca": "la metàfora de l'equip que s'emporta a l'oficina"
     },
     "qui": "persona",
     "escalo": "presencial",
     "proces": "produccion"
    },
    {
     "de": {
      "es": "Quien encarga el evento",
      "ca": "Qui encarrega l'esdeveniment"
     },
     "a": {
      "es": "Quien dinamiza la actividad",
      "ca": "Qui dinamitza l'activitat"
     },
     "mena": "intangible",
     "que": {
      "es": "un caso de empresa que se puede contar",
      "ca": "un cas d'empresa que es pot explicar"
     },
     "qui": "persona",
     "escalo": "por_montar",
     "proces": "siempre"
    },
    {
     "de": {
      "es": "Quien encarga el evento",
      "ca": "Qui encarrega l'esdeveniment"
     },
     "a": {
      "es": "Quien asiste",
      "ca": "Qui hi assisteix"
     },
     "mena": "tangible",
     "que": {
      "es": "la convocatoria a la jornada",
      "ca": "la convocatòria a la jornada"
     },
     "qui": "persona",
     "escalo": null,
     "proces": null
    },
    {
     "de": {
      "es": "Quien asiste",
      "ca": "Qui hi assisteix"
     },
     "a": {
      "es": "Quien encarga el evento",
      "ca": "Qui encarrega l'esdeveniment"
     },
     "mena": "intangible",
     "que": {
      "es": "un equipo más unido",
      "ca": "un equip més unit"
     },
     "qui": "persona",
     "escalo": null,
     "proces": null
    },
    {
     "de": {
      "es": "Quien produce y coordina",
      "ca": "Qui produeix i coordina"
     },
     "a": {
      "es": "Quien elabora el vino",
      "ca": "Qui elabora el vi"
     },
     "mena": "tangible",
     "que": {
      "es": "la consulta con sus experiencias del catálogo ya montadas y, al elegir, el encargo de la visita o la cata",
      "ca": "la consulta amb les seves experiències del catàleg ja muntades i, en triar, l'encàrrec de la visita o el tast"
     },
     "qui": "persona",
     "escalo": "definido",
     "proces": "venta"
    },
    {
     "de": {
      "es": "Quien elabora el vino",
      "ca": "Qui elabora el vi"
     },
     "a": {
      "es": "Quien produce y coordina",
      "ca": "Qui produeix i coordina"
     },
     "mena": "tangible",
     "que": {
      "es": "la disponibilidad y las propuestas cerradas, desde la ficha de la bodega",
      "ca": "la disponibilitat i les propostes tancades, des de la fitxa del celler"
     },
     "qui": "persona",
     "escalo": "definido",
     "proces": "venta"
    },
    {
     "de": {
      "es": "Quien elabora el vino",
      "ca": "Qui elabora el vi"
     },
     "a": {
      "es": "Quien asiste",
      "ca": "Qui hi assisteix"
     },
     "mena": "tangible",
     "que": {
      "es": "la cata y el vino que se lleva",
      "ca": "el tast i el vi que s'emporta"
     },
     "qui": "persona",
     "escalo": null,
     "proces": null
    },
    {
     "de": {
      "es": "Quien asiste",
      "ca": "Qui hi assisteix"
     },
     "a": {
      "es": "Quien elabora el vino",
      "ca": "Qui elabora el vi"
     },
     "mena": "intangible",
     "que": {
      "es": "la recomendación de la bodega a otros",
      "ca": "la recomanació del celler a altres"
     },
     "qui": "persona",
     "escalo": null,
     "proces": null
    },
    {
     "de": {
      "es": "Quien elabora el vino",
      "ca": "Qui elabora el vi"
     },
     "a": {
      "es": "Quien acoge",
      "ca": "Qui acull"
     },
     "mena": "intangible",
     "que": {
      "es": "la historia de la casa que da sentido al lugar",
      "ca": "la història de la casa que dona sentit al lloc"
     },
     "qui": "persona",
     "escalo": null,
     "proces": null
    },
    {
     "de": {
      "es": "Quien acoge",
      "ca": "Qui acull"
     },
     "a": {
      "es": "Quien elabora el vino",
      "ca": "Qui elabora el vi"
     },
     "mena": "intangible",
     "que": {
      "es": "visitantes que conocen y vuelven a la bodega",
      "ca": "visitants que coneixen el celler i hi tornen"
     },
     "qui": "persona",
     "escalo": null,
     "proces": null
    }
   ]
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = C; else g.CasAutomatitzat = C;
})(this);
