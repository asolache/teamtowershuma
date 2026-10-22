#!/usr/bin/env node
/* Els mapes tipus, fora de l'app · SOS/lib/models-mapa.js
 * ─────────────────────────────────────────────────────────────────────────
 * L'app (SOS/index.html) porta els models de referència: «El meu negoci»
 * (DYNAMICS) i els sis prototips que cobreixen el 80 % dels projectes
 * (PROTOTYPE_MAPS). L'Àlvar ho va demanar el 22/10/2026 per a /cliente/: que
 * qui fa el seu mapa pugui començar pels fluxos d'un model en lloc de la
 * pàgina en blanc. Copiar-los voldria dir que un dia divergissin; aquí es
 * llegeixen de l'app tal com hi són i s'escriuen a `SOS/lib/models-mapa.js`
 * amb el castellà i l'anglès d'aquesta taula.
 *
 * `--check` peta si el fitxer no és el que sortiria ara, o si l'app ha afegit
 * un model o un text que aquesta taula encara no tradueix.
 *
 * Ús:  node SOS/tools/build-models-mapa.js [--check]
 */
'use strict';
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..');
const SORTIDA = join(ARREL, 'lib', 'models-mapa.js');

/* català → [castellà, anglès] */
const T = {
  'El meu negoci': ['Mi negocio', 'My business'],
  'El mapa de valor del teu negoci: qui hi dona què, i què torna.': ['El mapa de valor de tu negocio: quién da qué y qué vuelve.', 'The value map of your business: who gives what, and what comes back.'],
  'El negoci': ['El negocio', 'The business'], 'Clients': ['Clientes', 'Customers'], 'Equip': ['Equipo', 'Team'],
  'Proveïdors': ['Proveedores', 'Suppliers'], 'Aliats': ['Aliados', 'Allies'],
  'producte o servei': ['producto o servicio', 'product or service'], 'pagament': ['pago', 'payment'],
  'opinió i recomanació': ['opinión y recomendación', 'feedback and referrals'], 'confiança': ['confianza', 'trust'],
  'hores de feina': ['horas de trabajo', 'working hours'], 'sou': ['sueldo', 'salary'],
  'matèria primera': ['materia prima', 'raw materials'], 'recomanació': ['recomendación', 'referral'], 'reconeixement': ['reconocimiento', 'recognition'],
  'Servei de proximitat': ['Servicio de proximidad', 'Local service'],
  'Servei que s\'ofereix directament a la comunitat local (educació, cures, reparacions, atenció).': ['Servicio que se ofrece directamente a la comunidad local (educación, cuidados, reparaciones, atención).', 'A service offered directly to the local community (education, care, repairs, support).'],
  'Persones oferents': ['Personas que ofrecen', 'Providers'], 'Persones usuàries': ['Personas usuarias', 'Users'],
  'Nucli gestor': ['Núcleo gestor', 'Core team'], 'Referent territorial': ['Referente territorial', 'Local authority'], 'Ecosistema aliat': ['Ecosistema aliado', 'Partner ecosystem'],
  'servei directe': ['servicio directo', 'direct service'], 'pagament o hores del banc de temps': ['pago u horas del banco de tiempo', 'payment or time-bank hours'],
  'disponibilitat i qualitat': ['disponibilidad y calidad', 'availability and quality'], 'coordinació, formació i cura': ['coordinación, formación y cuidado', 'coordination, training and care'],
  'reputació i vincle': ['reputación y vínculo', 'reputation and bond'], 'garantia i resolució d\'incidències': ['garantía y resolución de incidencias', 'guarantee and issue resolution'],
  'legitimitat i espai': ['legitimidad y espacio', 'legitimacy and space'], 'memòria i indicadors d\'ús': ['memoria e indicadores de uso', 'report and usage indicators'],
  'derivacions': ['derivaciones', 'referrals'], 'coneixement i confiança': ['conocimiento y confianza', 'knowledge and trust'],
  'informació del servei': ['información del servicio', 'service information'], 'necessitats detectades': ['necesidades detectadas', 'needs spotted'],
  'difusió pública': ['difusión pública', 'public promotion'], 'valoració del servei': ['valoración del servicio', 'service rating'],
  'pràctica reflexiva compartida': ['práctica reflexiva compartida', 'shared reflective practice'], 'criteris i bones pràctiques': ['criterios y buenas prácticas', 'criteria and good practice'],
  'Producte artesà / manufactura': ['Producto artesano / manufactura', 'Craft product / manufacturing'],
  'Producció física en petit format, taller propi o compartit.': ['Producción física en pequeño formato, taller propio o compartido.', 'Small-scale physical production, own or shared workshop.'],
  'Artesans/es': ['Artesanos/as', 'Makers'], 'Proveïdors locals': ['Proveedores locales', 'Local suppliers'], 'Punt de venda': ['Punto de venta', 'Shop'],
  'Clientes': ['Clientes', 'Customers'], 'Comunitat i formació': ['Comunidad y formación', 'Community and training'],
  'matèria primera km0': ['materia prima de proximidad', 'local raw materials'], 'comandes estables i pagament just': ['pedidos estables y pago justo', 'steady orders and fair pay'],
  'producte acabat': ['producto acabado', 'finished product'], 'liquidació de vendes': ['liquidación de ventas', 'sales settlement'],
  'venda i assessorament': ['venta y asesoramiento', 'sales and advice'], 'ingressos': ['ingresos', 'income'],
  'retorn i encàrrecs a mida': ['opinión y encargos a medida', 'feedback and custom orders'], 'història i traçabilitat de la peça': ['historia y trazabilidad de la pieza', 'the piece\'s story and traceability'],
  'ofici i tallers': ['oficio y talleres', 'craft and workshops'], 'aprenents i renovació': ['aprendices y relevo', 'apprentices and renewal'],
  'cultura del fet a mà': ['cultura de lo hecho a mano', 'handmade culture'], 'demanda que valora l\'ofici': ['demanda que valora el oficio', 'demand that values the craft'],
  'previsió de demanda': ['previsión de demanda', 'demand forecast'], 'estoc i terminis': ['stock y plazos', 'stock and lead times'],
  'coneixement del material': ['conocimiento del material', 'knowledge of materials'], 'restes i materials per practicar': ['restos y materiales para practicar', 'offcuts and practice materials'],
  'Consultoria / servei tècnic': ['Consultoría / servicio técnico', 'Consulting / technical service'],
  'Consultoria, disseny, IT, arquitectura, assessoria — projecte per projecte.': ['Consultoría, diseño, IT, arquitectura, asesoría — proyecto a proyecto.', 'Consulting, design, IT, architecture, advisory — project by project.'],
  'Consultors/es': ['Consultores/as', 'Consultants'], 'Clients institucionals': ['Clientes institucionales', 'Public-sector clients'], 'Clients privats': ['Clientes privados', 'Private clients'],
  'Xarxa de partners': ['Red de partners', 'Partner network'], 'Nucli operatiu': ['Núcleo operativo', 'Operations core'],
  'entregable especialitzat': ['entregable especializado', 'specialised deliverable'], 'honoraris': ['honorarios', 'fees'],
  'revisió entre iguals': ['revisión entre iguales', 'peer review'], 'sub-encàrrecs': ['subencargos', 'subcontracts'],
  'administració i comercial': ['administración y comercial', 'admin and sales'], '% de facturació': ['% de la facturación', '% of billing'],
  'licitacions i marc de contractació': ['licitaciones y marco de contratación', 'tenders and procurement framework'], 'documentació i justificació': ['documentación y justificación', 'documentation and reporting'],
  'capacitat extra quan cal': ['capacidad extra cuando hace falta', 'extra capacity when needed'], 'contractes marc': ['contratos marco', 'framework contracts'],
  'fiabilitat i compliment': ['fiabilidad y cumplimiento', 'reliability and delivery'], 'cas d\'ús públic replicable': ['caso de uso público replicable', 'replicable public use case'], 'validació de mercat': ['validación de mercado', 'market validation'],
  'Producte digital / SaaS': ['Producto digital / SaaS', 'Digital product / SaaS'],
  'App, plataforma, servei online — usuaris massius o de nínxol.': ['App, plataforma, servicio online — usuarios masivos o de nicho.', 'App, platform, online service — mass or niche users.'],
  'Equip producte': ['Equipo de producto', 'Product team'], 'Usuaris/es': ['Usuarios/as', 'Users'], 'Comunitat contributora': ['Comunidad que contribuye', 'Contributor community'],
  'Patrocini i inversió': ['Patrocinio e inversión', 'Sponsors and investors'], 'Infraestructura': ['Infraestructura', 'Infrastructure'],
  'funcionalitat': ['funcionalidad', 'features'], 'subscripció o donació': ['suscripción o donación', 'subscription or donation'],
  'retorn i casos d\'ús': ['opiniones y casos de uso', 'feedback and use cases'], 'suport entre iguals': ['apoyo entre iguales', 'peer support'],
  'PRs, traduccions i docs': ['mejoras, traducciones y documentación', 'contributions, translations and docs'], 'governança oberta i mèrit': ['gobernanza abierta y mérito', 'open governance and credit'],
  'capital': ['capital', 'capital'], 'tracció i mètriques': ['tracción y métricas', 'traction and metrics'],
  'servidors i dades': ['servidores y datos', 'servers and data'], 'pagament de l\'allotjament': ['pago del alojamiento', 'hosting payment'],
  'prova d\'ús real': ['prueba de uso real', 'proof of real use'], 'finançament que abarateix el servei': ['financiación que abarata el servicio', 'funding that makes the service cheaper'],
  'rèpliques i mirroring': ['réplicas y espejos', 'replicas and mirrors'], 'accés i quotes': ['acceso y cuotas', 'access and quotas'],
  'full de ruta obert': ['hoja de ruta abierta', 'open roadmap'], 'prioritats de la base': ['prioridades de la base', 'grassroots priorities'],
  'Cura i acompanyament social': ['Cuidados y acompañamiento social', 'Care and social support'],
  'Xarxa de cures, salut comunitària, acompanyament a persones vulnerables.': ['Red de cuidados, salud comunitaria, acompañamiento a personas vulnerables.', 'Care network, community health, support for vulnerable people.'],
  'Persones cuidadores': ['Personas cuidadoras', 'Carers'], 'Persones cuidades': ['Personas cuidadas', 'People cared for'], 'Famílies': ['Familias', 'Families'],
  'Serveis socials/CAP': ['Servicios sociales / centro de salud', 'Social services / health centre'], 'Voluntariat': ['Voluntariado', 'Volunteers'],
  'acompanyament i escolta': ['acompañamiento y escucha', 'company and listening'], 'vincle i sentit': ['vínculo y sentido', 'bond and meaning'],
  'confiança i suport econòmic': ['confianza y apoyo económico', 'trust and financial support'], 'descàrrega i informació': ['respiro e información', 'relief and information'],
  'derivacions i formació': ['derivaciones y formación', 'referrals and training'], 'dades i seguiment': ['datos y seguimiento', 'data and follow-up'],
  'hores gratuïtes': ['horas gratuitas', 'free hours'], 'formació i cura mútua': ['formación y cuidado mutuo', 'training and mutual care'],
  'companyia i gestions': ['compañía y gestiones', 'company and errands'], 'confiança i històries': ['confianza e historias', 'trust and stories'],
  'context i alertes': ['contexto y alertas', 'context and alerts'], 'recursos i prestacions': ['recursos y prestaciones', 'resources and benefits'],
  'consentiment i preferències': ['consentimiento y preferencias', 'consent and preferences'], 'atenció adaptada': ['atención adaptada', 'tailored care'],
  'acollida a casa': ['acogida en casa', 'welcome at home'], 'relleu i respir': ['relevo y respiro', 'cover and respite'],
  'Educació / formació': ['Educación / formación', 'Education / training'],
  'Formació reglada o lliure, mentoria, escola comunitària.': ['Formación reglada o libre, mentoría, escuela comunitaria.', 'Formal or open training, mentoring, community school.'],
  'Formadors/es': ['Formadores/as', 'Trainers'], 'Aprenents': ['Alumnos', 'Learners'], 'Coordinació pedagògica': ['Coordinación pedagógica', 'Academic coordination'],
  'Espai formatiu': ['Espacio de formación', 'Training venue'], 'Comunitat de pràctica': ['Comunidad de práctica', 'Community of practice'],
  'sessions i materials': ['sesiones y materiales', 'sessions and materials'], 'matrícula o hores del banc': ['matrícula u horas del banco de tiempo', 'tuition or time-bank hours'],
  'disseny curricular': ['diseño del programa', 'curriculum design'], 'avaluació i millora': ['evaluación y mejora', 'evaluation and improvement'],
  'aules i eines': ['aulas y herramientas', 'classrooms and tools'], 'ús i manteniment': ['uso y mantenimiento', 'use and upkeep'],
  'xarxa d\'exalumnes': ['red de antiguos alumnos', 'alumni network'], 'mentoria entre iguals': ['mentoría entre iguales', 'peer mentoring'],
  'recerca compartida': ['investigación compartida', 'shared research'], 'casos reals per ensenyar': ['casos reales para enseñar', 'real cases to teach with'],
  'itinerari i acreditació': ['itinerario y titulación', 'pathway and accreditation'], 'expectatives i necessitats': ['expectativas y necesidades', 'expectations and needs'],
  'lloc de trobada': ['lugar de encuentro', 'meeting place'], 'vida i ús de l\'equipament': ['vida y uso del espacio', 'life and use of the venue'],
  'què demana el sector': ['qué pide el sector', 'what the sector asks for'], 'formació que s\'hi ajusta': ['formación que se ajusta', 'training that fits']
};

/* ══ ELS SECTORS DE LA MATRIU (22/10/2026) ═══════════════════════════════════
   L'Àlvaro: «a la Matriu hi ha força informació de tipologies de projectes i
   els seus mapes de valor: integrem-la a la base de coneixement de fluxos de
   valor, DRY». Són les catorze activitats crítiques del territori
   (CRITICAL_ACTIVITIES de l'app): rols, fluxos i passos de cada sector. Es
   llegeixen de l'app com els models i surten com a `SECTORS`, en català i
   castellà; l'anglès, el dia que l'app el demani (fins llavors, el castellà).
   Els textos que ja són a `T` no es repeteixen aquí. */
const TS = {
  'acompanyament': 'acompañamiento',
  'salut comunitària': 'salud comunitaria',
  'Formadors': 'Formadores',
  'Dinamització comercial': 'Dinamización comercial',
  'Revitalitzar el comerç i l\'economia de proximitat.': 'Revitalizar el comercio y la economía de proximidad.',
  'Comerços de proximitat': 'Comercios de proximidad',
  'Ajuntament': 'Ayuntamiento',
  'Associació de comerciants': 'Asociación de comerciantes',
  'Veïnat': 'Vecindario',
  'Consumidors': 'Consumidores',
  'producte i servei de proximitat': 'producto y servicio de proximidad',
  'compra local': 'compra local',
  'campanyes i formació': 'campañas y formación',
  'quotes i participació': 'cuotas y participación',
  'fires i finançament': 'ferias y financiación',
  'diagnòstic del carrer': 'diagnóstico de la calle',
  'fidelitat i boca-orella': 'fidelidad y boca a boca',
  'vida i seguretat al carrer': 'vida y seguridad en la calle',
  'espai públic i mercats': 'espacio público y mercados',
  'legitimitat de les mesures': 'legitimidad de las medidas',
  'moneda local i promocions': 'moneda local y promociones',
  'despesa que es queda al poble': 'gasto que se queda en el pueblo',
  'Diagnòstic del teixit comercial': 'Diagnóstico del tejido comercial',
  'Constituir l\'associació': 'Constituir la asociación',
  'Campanya de proximitat': 'Campaña de proximidad',
  'Fires i mercats': 'Ferias y mercados',
  'Fidelització i moneda local': 'Fidelización y moneda local',
  'Ocupació i inserció laboral': 'Empleo e inserción laboral',
  'Crear ocupació digna i itineraris d\'inserció.': 'Crear empleo digno e itinerarios de inserción.',
  'Persones en cerca de feina': 'Personas que buscan trabajo',
  'Empreses locals': 'Empresas locales',
  'Entitats formatives': 'Entidades formativas',
  'Servei d\'ocupació': 'Servicio de empleo',
  'treball i talent': 'trabajo y talento',
  'contracte i salari': 'contrato y salario',
  'formació i acreditació': 'formación y acreditación',
  'motivació i assistència': 'motivación y asistencia',
  'orientació i intermediació': 'orientación e intermediación',
  'perfil i disponibilitat': 'perfil y disponibilidad',
  'què necessita el sector': 'qué necesita el sector',
  'pràctiques i formació dual': 'prácticas y formación dual',
  'plans i recursos': 'planes y recursos',
  'dades d\'inserció': 'datos de inserción',
  'sòl, incentius i contractació': 'suelo, incentivos y contratación',
  'ocupació arrelada al municipi': 'empleo arraigado en el municipio',
  'Mapar necessitats i perfils': 'Mapear necesidades y perfiles',
  'Aliances amb empreses': 'Alianzas con empresas',
  'Formació a mida': 'Formación a medida',
  'Pràctiques i inserció': 'Prácticas e inserción',
  'Seguiment': 'Seguimiento',
  'Habitatge assequible': 'Vivienda asequible',
  'Accés a habitatge digne sense especulació.': 'Acceso a una vivienda digna sin especulación.',
  'Grup motor': 'Grupo motor',
  'Administració': 'Administración',
  'Finançament ètic': 'Financiación ética',
  'Cooperativa': 'Cooperativa',
  'Unitats de convivència': 'Unidades de convivencia',
  'cessió de sòl o dret de superfície': 'cesión de suelo o derecho de superficie',
  'retorn social i mixtura': 'retorno social y mezcla',
  'aportació i quota d\'ús': 'aportación y cuota de uso',
  'dret d\'ús indefinit': 'derecho de uso indefinido',
  'préstec': 'préstamo',
  'projecte solvent i valors': 'proyecto solvente y valores',
  'convivència i confiança': 'convivencia y confianza',
  'implicació i cura': 'implicación y cuidado',
  'interlocució i pressió': 'interlocución y presión',
  'informació de sòl i terminis': 'información de suelo y plazos',
  'pla econòmic': 'plan económico',
  'criteris i acompanyament': 'criterios y acompañamiento',
  'Cerca de sòl': 'Búsqueda de suelo',
  'Viabilitat': 'Viabilidad',
  'Constitució': 'Constitución',
  'Finançament': 'Financiación',
  'Obra': 'Obra',
  'Convivència': 'Convivencia',
  'Comunitat energètica': 'Comunidad energética',
  'Produir i compartir energia renovable localment.': 'Producir y compartir energía renovable localmente.',
  'Nucli promotor': 'Núcleo promotor',
  'Sòcies consumidores': 'Socias consumidoras',
  'Instal·ladora': 'Instaladora',
  'Assessoria': 'Asesoría',
  'inversió i quotes': 'inversión y cuotas',
  'energia i estalvi': 'energía y ahorro',
  'cessió de teulades': 'cesión de tejados',
  'transició energètica amb dades': 'transición energética con datos',
  'instal·lació i manteniment': 'instalación y mantenimiento',
  'contracte i pagament': 'contrato y pago',
  'viabilitat i seguretat jurídica': 'viabilidad y seguridad jurídica',
  'encàrrec i cas replicable': 'encargo y caso replicable',
  'posada en marxa a casa': 'puesta en marcha en casa',
  'recomanacions': 'recomendaciones',
  'difusió i tràmits': 'difusión y trámites',
  'mandat ciutadà': 'mandato ciudadano',
  'Captació de sòcies': 'Captación de socias',
  'Teulada': 'Tejado',
  'Instal·lació': 'Instalación',
  'Posada en marxa': 'Puesta en marcha',
  'Alimentació sostenible': 'Alimentación sostenible',
  'Aliments sans i de proximitat, de la terra al plat.': 'Alimentos sanos y de proximidad, de la tierra al plato.',
  'Pagesia local': 'Campesinado local',
  'Grup de consum': 'Grupo de consumo',
  'Obrador': 'Obrador',
  'Punt de repartiment': 'Punto de reparto',
  'cistelles i producte': 'cestas y producto',
  'comandes i preu just': 'pedidos y precio justo',
  'transformació del producte': 'transformación del producto',
  'lloc i horari': 'lugar y horario',
  'vida al local': 'vida en el local',
  'accés a producte de proximitat': 'acceso a producto de proximidad',
  'quotes i rotació de tasques': 'cuotas y rotación de tareas',
  'confiança i traçabilitat': 'confianza y trazabilidad',
  'mercat estable': 'mercado estable',
  'producte elaborat': 'producto elaborado',
  'demanda que sosté l\'obrador': 'demanda que sostiene el obrador',
  'Formar el grup': 'Formar el grupo',
  'Contactar pagesia': 'Contactar con el campesinado',
  'Logística': 'Logística',
  'Sistema de comandes': 'Sistema de pedidos',
  'Primera cistella': 'Primera cesta',
  'Cures i salut comunitària': 'Cuidados y salud comunitaria',
  'Xarxa de cures i benestar contra la soledat.': 'Red de cuidados y bienestar contra la soledad.',
  'Nucli de cura': 'Núcleo de cuidado',
  'Gent gran': 'Personas mayores',
  'CAP / serveis socials': 'CAP / servicios sociales',
  'saber i memòria viva': 'saber y memoria viva',
  'detecció i alerta': 'detección y alerta',
  'formació per detectar': 'formación para detectar',
  'derivació i suport': 'derivación y apoyo',
  'detecció precoç i dades': 'detección precoz y datos',
  'hores de cura': 'horas de cuidado',
  'sentit i pertinença': 'sentido y pertenencia',
  'coneixement del carrer': 'conocimiento de la calle',
  'Detectar necessitats': 'Detectar necesidades',
  'Protocol': 'Protocolo',
  'Primers acompanyaments': 'Primeros acompañamientos',
  'Coordinació amb serveis': 'Coordinación con servicios',
  'Cultura i patrimoni': 'Cultura y patrimonio',
  'Activar la cultura, la festa i el patrimoni local.': 'Activar la cultura, la fiesta y el patrimonio local.',
  'Entitats culturals': 'Entidades culturales',
  'Artistes': 'Artistas',
  'Escoles': 'Escuelas',
  'equipaments i subvenció': 'equipamientos y subvención',
  'programació i vida cultural': 'programación y vida cultural',
  'experiència cultural': 'experiencia cultural',
  'públic i taquilla': 'público y taquilla',
  'patrimoni viu': 'patrimonio vivo',
  'implicació de les famílies': 'implicación de las familias',
  'espai i caixet': 'espacio y caché',
  'obra i assaig': 'obra y ensayo',
  'cantera i espais': 'cantera y espacios',
  'arrelament de l\'alumnat': 'arraigo del alumnado',
  'festa major i espai públic': 'fiesta mayor y espacio público',
  'participació i memòria': 'participación y memoria',
  'Mapa d\'agents culturals': 'Mapa de agentes culturales',
  'Programació compartida': 'Programación compartida',
  'Recuperar patrimoni': 'Recuperar patrimonio',
  'Festa major participativa': 'Fiesta mayor participativa',
  'Avaluació': 'Evaluación',
  'Turisme de poble sostenible': 'Turismo de pueblo sostenible',
  'Turisme responsable que reverteix al territori.': 'Turismo responsable que revierte en el territorio.',
  'Allotjaments': 'Alojamientos',
  'Restauració': 'Restauración',
  'Guies locals': 'Guías locales',
  'Productors': 'Productores',
  'experiències': 'experiencias',
  'clientela i comissió': 'clientela y comisión',
  'promoció i fires': 'promoción y ferias',
  'taxes i activitat': 'tasas y actividad',
  'producte km0': 'producto km0',
  'compra estable': 'compra estable',
  'esmorzars i botiga': 'desayunos y tienda',
  'visibilitat del producte': 'visibilidad del producto',
  'relat del territori': 'relato del territorio',
  'àpats i rutes': 'comidas y rutas',
  'reserves i grups': 'reservas y grupos',
  'Inventari d\'atractius': 'Inventario de atractivos',
  'Producte turístic': 'Producto turístico',
  'Aliances locals': 'Alianzas locales',
  'Promoció responsable': 'Promoción responsable',
  'Gestió de fluxos': 'Gestión de flujos',
  'Economia circular': 'Economía circular',
  'Reduir, reparar i reutilitzar en clau local.': 'Reducir, reparar y reutilizar en clave local.',
  'Comerços': 'Comercios',
  'Recicladors': 'Recicladores',
  'objectes i residus': 'objetos y residuos',
  'productes reparats': 'productos reparados',
  'espai i suport': 'espacio y apoyo',
  'residus evitats amb dades': 'residuos evitados con datos',
  'tractament del que no es repara': 'tratamiento de lo que no se repara',
  'material separat i net': 'material separado y limpio',
  'excedents i estocs': 'excedentes y stocks',
  'imatge i clientela conscient': 'imagen y clientela consciente',
  'reparació i segona mà': 'reparación y segunda mano',
  'compra reparada': 'compra reparada',
  'valorització i informe': 'valorización e informe',
  'contracte i taxa': 'contrato y tasa',
  'Punt de reparació': 'Punto de reparación',
  'Biblioteca de les coses': 'Biblioteca de las cosas',
  'Mercat de segona mà': 'Mercado de segunda mano',
  'Compostatge': 'Compostaje',
  'Sensibilització': 'Sensibilización',
  'Digitalització i sobirania tecnològica': 'Digitalización y soberanía tecnológica',
  'Autonomia digital del teixit local.': 'Autonomía digital del tejido local.',
  'Nucli tècnic': 'Núcleo técnico',
  'Entitats': 'Entidades',
  'capacitació': 'capacitación',
  'eines digitals sobiranes': 'herramientas digitales soberanas',
  'usos i incidències detectades': 'usos e incidencias detectadas',
  'recursos i infraestructura': 'recursos e infraestructura',
  'serveis mantinguts': 'servicios mantenidos',
  'migració i suport': 'migración y apoyo',
  'contribucions i documentació': 'contribuciones y documentación',
  'alfabetització digital': 'alfabetización digital',
  'confiança per demanar ajuda': 'confianza para pedir ayuda',
  'connectivitat i espais': 'conectividad y espacios',
  'diagnòstic de bretxa': 'diagnóstico de brecha',
  'Diagnòstic digital': 'Diagnóstico digital',
  'Formació bàsica': 'Formación básica',
  'Eines sobiranes': 'Herramientas soberanas',
  'Presència digital': 'Presencia digital',
  'Manteniment comunitari': 'Mantenimiento comunitario',
  'Joventut i lleure': 'Juventud y ocio',
  'Espais i oportunitats per al jovent.': 'Espacios y oportunidades para la juventud.',
  'Jovent': 'Juventud',
  'Esplai / entitats': 'Esplai / entidades',
  'Monitoratge': 'Monitores',
  'espais i beca': 'espacios y beca',
  'activitat i cohesió juvenil': 'actividad y cohesión juvenil',
  'confiança i referència': 'confianza y referencia',
  'participació i propostes': 'participación y propuestas',
  'espai i recursos per fer-les': 'espacio y recursos para hacerlas',
  'formació i orientació': 'formación y orientación',
  'clima i implicació': 'clima e implicación',
  'formació i condicions dignes': 'formación y condiciones dignas',
  'hores i projecte educatiu': 'horas y proyecto educativo',
  'pressupost i espai jove': 'presupuesto y espacio joven',
  'mandat i prioritats reals': 'mandato y prioridades reales',
  'Escoltar el jovent': 'Escuchar a la juventud',
  'Espai jove': 'Espacio joven',
  'Programació': 'Programación',
  'Projectes liderats per joves': 'Proyectos liderados por jóvenes',
  'Relleu': 'Relevo',
  'Mobilitat sostenible': 'Movilidad sostenible',
  'Moure\'s millor amb menys cotxe.': 'Moverse mejor con menos coche.',
  'Transport públic': 'Transporte público',
  'Grups ciclistes': 'Grupos ciclistas',
  'carrils, aparcaments i transport': 'carriles, aparcamientos y transporte',
  'ús i legitimitat': 'uso y legitimidad',
  'camins escolars': 'caminos escolares',
  'famílies acompanyants': 'familias acompañantes',
  'propostes i diagnòstic': 'propuestas y diagnóstico',
  'infraestructura i seguretat': 'infraestructura y seguridad',
  'freqüència i cobertura': 'frecuencia y cobertura',
  'demanda i validacions': 'demanda y validaciones',
  'concessió i finançament': 'concesión y financiación',
  'servei i dades d\'ús': 'servicio y datos de uso',
  'formació en bici segura': 'formación en bici segura',
  'nova generació ciclista': 'nueva generación ciclista',
  'Diagnòstic de mobilitat': 'Diagnóstico de movilidad',
  'Camins escolars': 'Caminos escolares',
  'Cotxe compartit': 'Coche compartido',
  'Carril bici': 'Carril bici',
  'Acollida i inclusió': 'Acogida e inclusión',
  'Integrar i cohesionar amb qui arriba.': 'Integrar y cohesionar con quien llega.',
  'Nouvinguts': 'Recién llegados',
  'Entitats d\'acollida': 'Entidades de acogida',
  'acompanyament i orientació': 'acompañamiento y orientación',
  'confiança i xarxa pròpia': 'confianza y red propia',
  'recursos i espai': 'recursos y espacio',
  'itineraris i seguiment': 'itinerarios y seguimiento',
  'xarxa i pertinença': 'red y pertenencia',
  'nova mirada i barreja': 'nueva mirada y mezcla',
  'llengua i escolarització': 'lengua y escolarización',
  'diversitat a l\'aula': 'diversidad en el aula',
  'trobada entre famílies': 'encuentro entre familias',
  'mans per a les activitats': 'manos para las actividades',
  'empadronament i drets': 'empadronamiento y derechos',
  'coneixement de les necessitats reals': 'conocimiento de las necesidades reales',
  'Mapa de necessitats': 'Mapa de necesidades',
  'Punt d\'acollida': 'Punto de acogida',
  'Aprenentatge de la llengua': 'Aprendizaje de la lengua',
  'Mentories veïnals': 'Mentorías vecinales',
  'Participació': 'Participación',
  'Custòdia del territori': 'Custodia del territorio',
  'Tenir cura del medi natural i agrari.': 'Cuidar el medio natural y agrario.',
  'Custòdia / entitat': 'Custodia / entidad',
  'Propietaris': 'Propietarios',
  'Pagesia': 'Campesinado',
  'acord de custòdia': 'acuerdo de custodia',
  'assessorament i manteniment': 'asesoramiento y mantenimiento',
  'hores de conservació': 'horas de conservación',
  'formació i natura viscuda': 'formación y naturaleza vivida',
  'suport i finançament': 'apoyo y financiación',
  'indicadors ambientals': 'indicadores ambientales',
  'gestió agrària compatible': 'gestión agraria compatible',
  'reconeixement i assessorament': 'reconocimiento y asesoramiento',
  'ús productiu de la terra': 'uso productivo de la tierra',
  'arrendament i cura': 'arrendamiento y cuidado',
  'jornades i materials': 'jornadas y materiales',
  'implicació ciutadana': 'implicación ciudadana',
  'Diagnòstic ambiental': 'Diagnóstico ambiental',
  'Acords de custòdia': 'Acuerdos de custodia',
  'Jornades de voluntariat': 'Jornadas de voluntariado',
  'Recuperació d\'hàbitats': 'Recuperación de hábitats',
};

function llegeixSectors() {
  const h = readFileSync(join(ARREL, 'index.html'), 'utf8');
  const c = h.indexOf('const CRITICAL_ACTIVITIES=['), d = h.indexOf('\n];', c);
  return Function('return [' + h.slice(c + 'const CRITICAL_ACTIVITIES=['.length, d) + ']')();
}

function llegeixApp() {
  const h = readFileSync(join(ARREL, 'index.html'), 'utf8');
  const a = h.indexOf('const DYNAMICS=['), b = h.indexOf("\n {id:'", a + 20);
  const negoci = Function('return ' + h.slice(a + 'const DYNAMICS=['.length, b).trim().replace(/,$/, ''))();
  const c = h.indexOf('const PROTOTYPE_MAPS=['), d = h.indexOf('\n];', c);
  const proto = Function('return [' + h.slice(c + 'const PROTOTYPE_MAPS=['.length, d) + ']')();
  return [negoci].concat(proto);
}

function models() {
  const falten = new Set();
  const tr = (x, i) => { if (!T[x]) { falten.add(x); return x; } return T[x][i]; };
  const llengua = (m, i) => ({
    nom: i < 0 ? m.name : tr(m.name, i), diu: i < 0 ? m.one : tr(m.one, i),
    roles: m.roles.map(r => (i < 0 ? r : tr(r, i))),
    pairs: m.pairs.map(p => [0, 1, 2, 3, 4, 5].map(k => (k === 2 || k === 4 || i < 0 ? p[k] : tr(p[k], i))))
  });
  const out = llegeixApp().map(m => ({ id: m.id, icona: m.icon, ca: llengua(m, -1), es: llengua(m, 0), en: llengua(m, 1) }));
  const es = x => TS[x] || (T[x] ? T[x][0] : (falten.add(x), x));
  const sector = (a, cat) => ({
    nom: cat ? a.name : es(a.name), diu: cat ? a.one : es(a.one),
    roles: a.roles.map(r => (cat ? r : es(r))),
    pairs: a.pairs.map(p => [0, 1, 2, 3, 4, 5].map(k => (k === 2 || k === 4 || cat ? p[k] : es(p[k])))),
    passos: (a.kanban || []).map(k => (cat ? k : es(k)))
  });
  const sectors = llegeixSectors().map(a => ({ id: a.id, icona: a.icon, ca: sector(a, true), es: sector(a, false) }));
  return { out, sectors, falten: [...falten] };
}

/* El rol on passa més: el centre del mapa, el que a /cliente/ passa a ser «tu». */
function genera() {
  const { out, sectors, falten } = models();
  const cos = '/* GENERAT per SOS/tools/build-models-mapa.js des de SOS/index.html (DYNAMICS «negoci»,\n'
    + '   PROTOTYPE_MAPS i CRITICAL_ACTIVITIES de la Matriu) · no s\'edita a mà. Els mapes tipus del SOS en\n'
    + '   tres llengües i els catorze sectors en català i castellà: la base de coneixement de fluxos de valor. */\n'
    + '(function (arrel, fabrica) {\n'
    + '  if (typeof module === \'object\' && module.exports) module.exports = fabrica();\n'
    + '  else arrel.ModelsMapa = fabrica();\n'
    + '})(typeof self !== \'undefined\' ? self : this, function () {\n'
    + '  \'use strict\';\n'
    + '  var MODELS = ' + JSON.stringify(out, null, 1).replace(/\n/g, '\n  ') + ';\n'
    + '  /* Els sectors de la Matriu: rols, fluxos i els passos per posar-ho en marxa. */\n'
    + '  var SECTORS = ' + JSON.stringify(sectors, null, 1).replace(/\n/g, '\n  ') + ';\n'
    + '  /* El rol que més dona i rep: el que fa de «tu» quan algú comença per aquest model. */\n'
    + '  function centre(m) { var n = {}; m.pairs.forEach(function (p) { n[p[0]] = (n[p[0]] || 0) + 1; n[p[1]] = (n[p[1]] || 0) + 1; });\n'
    + '    return m.roles.slice().sort(function (a, b) { return (n[b] || 0) - (n[a] || 0); })[0]; }\n'
    + '  /* El model en una llengua, amb el centre canviat pel nom de qui el fa servir. */\n'
    + '  function mapa(id, llengua, casa) {\n'
    + '    var M = MODELS.concat(SECTORS).filter(function (x) { return x.id === id; })[0]; if (!M) return null;\n'
    + '    var m = M[llengua] || M.es || M.ca, c = centre(m), r = function (x) { return casa && x === c ? casa : x; };\n'
    + '    return { abast: \'\', roles: m.roles.map(r), pairs: m.pairs.map(function (p) { return [r(p[0]), r(p[1]), p[2], p[3], p[4], p[5]]; }), centre: casa || c, nom: m.nom };\n'
    + '  }\n'
    + '  return { MODELS: MODELS, SECTORS: SECTORS, centre: centre, mapa: mapa };\n'
    + '});\n';
  return { cos, falten };
}

if (require.main === module) {
  const { cos, falten } = genera();
  if (falten.length) { console.error('✗ Textos de l\'app sense traduir a build-models-mapa.js:\n  ' + falten.join('\n  ')); process.exit(1); }
  if (process.argv.includes('--check')) {
    const ara = existsSync(SORTIDA) ? readFileSync(SORTIDA, 'utf8') : '';
    if (ara !== cos) { console.error('✗ SOS/lib/models-mapa.js no és el que sortiria ara: node SOS/tools/build-models-mapa.js'); process.exit(1); }
    console.log('✓ Els mapes tipus de l\'app i els sectors de la Matriu, al dia i traduïts');
  } else { writeFileSync(SORTIDA, cos); console.log('Escrit ' + SORTIDA); }
}
module.exports = { genera, models };
