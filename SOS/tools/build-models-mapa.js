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
  /* Les fases de la Matriu dels models de negoci (kanban de PROTOTYPE_MAPS i «negoci»). */
  'Dibuixar el mapa ideal': 'Dibujar el mapa ideal',
  'Apuntar el que passa': 'Apuntar lo que pasa',
  'Comparar real i ideal': 'Comparar real e ideal',
  'Decidir el següent pas': 'Decidir el siguiente paso',
  'Definir el servei mínim viable': 'Definir el servicio mínimo viable',
  'Formar el primer equip d\'oferents': 'Formar el primer equipo de oferentes',
  'Publicar al banc de temps': 'Publicar en el banco de tiempo',
  'Primeres 10 prestacions': 'Primeras 10 prestaciones',
  'Retorn i ajust': 'Retorno y ajuste',
  'Ampliació territorial': 'Ampliación territorial',
  'Prototipar 3 referències': 'Prototipar 3 referencias',
  'Muntar el taller': 'Montar el taller',
  'Preus i marges': 'Precios y márgenes',
  'Canal de venda pilot': 'Canal de venta piloto',
  'Iterar amb el retorn de la clientela': 'Iterar con lo que dice la clientela',
  'Escalar producció': 'Escalar la producción',
  'Definir 2-3 verticals': 'Definir 2-3 verticales',
  'Cas d\'ús de referència': 'Caso de uso de referencia',
  'Portfoli i propostes tipus': 'Portfolio y propuestas tipo',
  'Primer contracte': 'Primer contrato',
  'Bucle de recomanació': 'Bucle de recomendación',
  'Estabilitzar cartera': 'Estabilizar la cartera',
  'Prototip de fum': 'Prototipo de humo',
  'Pàgina d\'entrada i llista d\'espera': 'Página de entrada y lista de espera',
  'Primer usuari real': 'Primer usuario real',
  'Iterar amb el retorn de la gent': 'Iterar con lo que dice la gente',
  'Model de monetització': 'Modelo de monetización',
  'Escalar amb la comunitat': 'Escalar con la comunidad',
  'Diagnòstic de necessitats': 'Diagnóstico de necesidades',
  'Formar cuidadores': 'Formar cuidadoras',
  'Protocol de casos': 'Protocolo de casos',
  'Primeres 5 famílies': 'Primeras 5 familias',
  'Enllaç serveis públics': 'Enlace con los servicios públicos',
  'Prevenció del burnout': 'Prevención del agotamiento',
  'Currículum mínim': 'Currículum mínimo',
  'Reclutar formadors': 'Reclutar formadores',
  'Espai i horaris': 'Espacio y horarios',
  'Cohort pilot': 'Cohorte piloto',
  'Avaluació i certificació': 'Evaluación y certificación',
  'Bucle amb ex-alumnes': 'Bucle con antiguos alumnos',
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

/* Les paraules amb què la gent descriu cada tipus de projecte, en català i
   castellà: el que fa que «una escola d'idiomes» trobi «Educació / formació»
   encara que el model no ho digui així. És coneixement de la base, no de l'app. */
const PARAULES = {
  negoci: 'negocio negoci empresa pyme pime tienda botiga clientes clients ventas vendes',
  servei_proximitat: 'barrio barri vecinos veïns reparaciones reparacions atención atenció domicilio proximidad proximitat',
  producte_artesa: 'artesano artesà taller cerámica ceràmica manufactura fabricamos fabriquem obrador elaboramos elaborem bodega celler vino vi',
  servei_tecnic: 'consultoría consultoria consultor consultora asesoría assessoria estrategia estratègia ingeniería enginyeria despacho despatx proyectos projectes',
  producte_digital: 'app aplicación aplicació software plataforma saas digital usuarios usuaris suscripción subscripció online',
  cura_social: 'cuidado cures acompañamiento acompanyament mayores grans dependencia dependència familias famílies soledad soledat',
  formacio: 'escuela escola academia acadèmia cursos curso curs formación formació profesores professors alumnos alumnes idiomas idiomes clases classes enseñar ensenyar',
  dinamitzacio_comercial: 'comercio comerç tiendas botigues comerciantes comerciants mercado mercat compra local proximidad',
  ocupacio: 'empleo ocupació trabajo feina inserción inserció parados aturats orientación orientació currículum',
  habitatge: 'vivienda habitatge pisos alquiler lloguer cooperativa cesión cessió masovería masoveria',
  energia: 'energía energia solar placas plaques renovable autoconsumo autoconsum tejados teulades',
  alimentacio: 'alimentación alimentació comida menjar agricultura pagès payés campesinos cestas cistelles huerta horta ecológico ecològic consumo consum',
  cures: 'salud salut comunitaria comunitària soledad soledat mayores grans voluntariado voluntariat',
  cultura: 'cultura cultural festival fiesta festa conciertos concerts teatro teatre música patrimonio patrimoni museo museu arte art artistas artistes',
  turisme: 'turismo turisme turistas turistes visitas visites alojamiento allotjament hotel enoturismo enoturisme rutas rutes catas tasts experiencias experiències',
  economia_circular: 'reparar reparamos reutilizar reutilitzar segunda mà mano residuos residus reciclaje reciclatge compost circular muebles mobles',
  digitalitzacio: 'digital digitalización digitalització informática informàtica software libre lliure ordenadores ordinadors brecha bretxa tecnología tecnologia',
  joventut: 'jóvenes joves juventud joventut esplai ocio lleure adolescentes adolescents casal monitores monitors',
  mobilitat: 'movilidad mobilitat bici bicicleta transporte transport coche cotxe camino escolar escolar peatones vianants',
  acollida: 'acogida acollida migrantes migrants refugiados refugiats recién nouvinguts idioma llengua inclusión inclusió',
  territori: 'territorio territori naturaleza natura bosque bosc campo camp custodia custòdia medio ambiente medi ambient fincas finques',
};

/* ══ LES BONES PRÀCTIQUES (22/10/2026) ═══════════════════════════════════
   L'auditoria dels 21 models (demanada per l'Àlvar el 22/10/2026) va donar que
   **cap** passava les regles que /cliente/ ensenya: tots tenien 5 rols (en
   calen de 6 a 12) i cinc no arribaven a un terç d'intangibles. Un model que
   suspèn les seves pròpies regles ensenya el contrari del mètode.

   Aquí, per a cada model, el que el completa: qui fa de «tu» (`centre`, el que
   promou el projecte, no qui el rep), el rol que hi faltava i els fluxos que
   no es paguen i sostenen la xarxa, amb la frase que explica per què (`bona`).
   L'app conserva els seus prototips tal com són; la guarda peta si un model
   publicat deixa de complir les regles 2 a 5. */
const BONES = {
  negoci: {
    ca: { centre: 'El negoci', rol: 'Qui et recomana', pairs: [['Qui et recomana', 'El negoci', 'intangible', 'clients nous i confiança', 'intangible', 'reconeixement i novetats abans que ningú'], ['Equip', 'Clients', 'intangible', 'tracte i consell', 'intangible', 'idees de millora']],
      bona: 'El que no es paga (recomanacions, confiança, idees) és el que fa créixer un negoci. Posa-ho al mapa.' },
    es: { centre: 'El negocio', rol: 'Quien te recomienda', pairs: [['Quien te recomienda', 'El negocio', 'intangible', 'clientes nuevos y confianza', 'intangible', 'reconocimiento y novedades antes que nadie'], ['Equipo', 'Clientes', 'intangible', 'trato y consejo', 'intangible', 'ideas de mejora']],
      bona: 'Lo que no se paga (recomendaciones, confianza, ideas) es lo que hace crecer un negocio. Ponlo en el mapa.' } },
  servei_proximitat: {
    ca: { centre: 'Nucli gestor', rol: 'Qui ho recomana al barri', pairs: [['Qui ho recomana al barri', 'Nucli gestor', 'intangible', 'persones noves que confien', 'intangible', 'visibilitat i agraïment']],
      bona: 'Un servei de proximitat creix de boca-orella: qui el recomana és part de la xarxa.' },
    es: { centre: 'Núcleo gestor', rol: 'Quien lo recomienda en el barrio', pairs: [['Quien lo recomienda en el barrio', 'Núcleo gestor', 'intangible', 'personas nuevas que confían', 'intangible', 'visibilidad y agradecimiento']],
      bona: 'Un servicio de proximidad crece por el boca a boca: quien lo recomienda es parte de la red.' } },
  producte_artesa: {
    ca: { centre: 'Artesans/es', rol: 'Qui ho explica (premsa, xarxes)', pairs: [['Qui ho explica (premsa, xarxes)', 'Artesans/es', 'intangible', 'relat i visibilitat', 'intangible', 'històries i accés al taller']],
      bona: 'L\'ofici es ven pel relat: qui l\'explica fora del taller hi aporta tant com el punt de venda.' },
    es: { centre: 'Artesanos/as', rol: 'Quien lo cuenta (prensa, redes)', pairs: [['Quien lo cuenta (prensa, redes)', 'Artesanos/as', 'intangible', 'relato y visibilidad', 'intangible', 'historias y acceso al taller']],
      bona: 'El oficio se vende por el relato: quien lo cuenta fuera del taller aporta tanto como el punto de venta.' } },
  servei_tecnic: {
    ca: { centre: 'Consultors/es', rol: 'Antics clients', pairs: [['Antics clients', 'Consultors/es', 'intangible', 'referències i casos', 'intangible', 'seguiment i novetats']],
      bona: 'Al servei tècnic, el següent client arriba per un cas que ja ha funcionat: cuida qui ja hi ha passat.' },
    es: { centre: 'Consultores/as', rol: 'Antiguos clientes', pairs: [['Antiguos clientes', 'Consultores/as', 'intangible', 'referencias y casos', 'intangible', 'seguimiento y novedades']],
      bona: 'En el servicio técnico, el siguiente cliente llega por un caso que ya ha funcionado: cuida a quien ya ha pasado por ahí.' } },
  producte_digital: {
    ca: { centre: 'Equip producte', rol: 'Qui ho recomana', pairs: [['Qui ho recomana', 'Equip producte', 'intangible', 'usuaris nous i ressenyes', 'intangible', 'accés anticipat i reconeixement']],
      bona: 'Un producte digital viu de les ressenyes i de qui el recomana: dona-li accés abans que a ningú.' },
    es: { centre: 'Equipo de producto', rol: 'Quien lo recomienda', pairs: [['Quien lo recomienda', 'Equipo de producto', 'intangible', 'usuarios nuevos y reseñas', 'intangible', 'acceso anticipado y reconocimiento']],
      bona: 'Un producto digital vive de las reseñas y de quien lo recomienda: dale acceso antes que a nadie.' } },
  cura_social: {
    ca: { centre: 'Persones cuidadores', rol: 'Xarxa veïnal', pairs: [['Xarxa veïnal', 'Persones cuidadores', 'intangible', 'avisos i suport puntual', 'intangible', 'confiança i acompanyament']],
      bona: 'La cura no s\'aguanta només amb professionals: la xarxa veïnal avisa abans que ningú.' },
    es: { centre: 'Personas cuidadoras', rol: 'Red vecinal', pairs: [['Red vecinal', 'Personas cuidadoras', 'intangible', 'avisos y apoyo puntual', 'intangible', 'confianza y acompañamiento']],
      bona: 'El cuidado no se sostiene solo con profesionales: la red vecinal avisa antes que nadie.' } },
  formacio: {
    ca: { centre: 'Formadors/es', rol: 'Antics alumnes', pairs: [['Antics alumnes', 'Formadors/es', 'intangible', 'recomanacions i testimonis', 'intangible', 'comunitat i ofertes de feina']],
      bona: 'Els antics alumnes són la millor porta d\'entrada: si la comunitat continua viva, recomanen.' },
    es: { centre: 'Formadores/as', rol: 'Antiguos alumnos', pairs: [['Antiguos alumnos', 'Formadores/as', 'intangible', 'recomendaciones y testimonios', 'intangible', 'comunidad y ofertas de trabajo']],
      bona: 'Los antiguos alumnos son la mejor puerta de entrada: si la comunidad sigue viva, recomiendan.' } },
  dinamitzacio_comercial: {
    ca: { centre: 'Associació de comerciants', rol: 'Entitats del barri', pairs: [['Entitats del barri', 'Associació de comerciants', 'intangible', 'activitats i públic', 'intangible', 'espai a les campanyes'], ['Consumidors', 'Comerços de proximitat', 'intangible', 'fidelitat i boca-orella', 'intangible', 'tracte proper']],
      bona: 'El comerç de proximitat guanya quan el barri hi és: les entitats porten públic i el tracte fa fidelitat.' },
    es: { centre: 'Asociación de comerciantes', rol: 'Entidades del barrio', pairs: [['Entidades del barrio', 'Asociación de comerciantes', 'intangible', 'actividades y público', 'intangible', 'espacio en las campañas'], ['Consumidores', 'Comercios de proximidad', 'intangible', 'fidelidad y boca a boca', 'intangible', 'trato cercano']],
      bona: 'El comercio de proximidad gana cuando el barrio está: las entidades traen público y el trato crea fidelidad.' } },
  ocupacio: {
    ca: { centre: 'Servei d\'ocupació', rol: 'Persones ja contractades', pairs: [['Persones ja contractades', 'Persones en cerca de feina', 'intangible', 'referents i consells', 'intangible', 'reconeixement'], ['Persones ja contractades', 'Servei d\'ocupació', 'intangible', 'retorn de com ha anat', 'intangible', 'acompanyament posterior'], ['Empreses locals', 'Servei d\'ocupació', 'intangible', 'perfils que necessiten', 'intangible', 'candidatures ajustades']],
      bona: 'La inserció no acaba amb el contracte: qui ja treballa fa de referent i diu què ha funcionat.' },
    es: { centre: 'Servicio de empleo', rol: 'Personas ya contratadas', pairs: [['Personas ya contratadas', 'Personas que buscan trabajo', 'intangible', 'referentes y consejos', 'intangible', 'reconocimiento'], ['Personas ya contratadas', 'Servicio de empleo', 'intangible', 'retorno de cómo ha ido', 'intangible', 'acompañamiento posterior'], ['Empresas locales', 'Servicio de empleo', 'intangible', 'perfiles que necesitan', 'intangible', 'candidaturas ajustadas']],
      bona: 'La inserción no acaba con el contrato: quien ya trabaja hace de referente y dice qué ha funcionado.' } },
  habitatge: {
    ca: { centre: 'Grup motor', rol: 'Veïnat de l\'entorn', pairs: [['Veïnat de l\'entorn', 'Grup motor', 'intangible', 'acollida i suport', 'intangible', 'espais comuns oberts']],
      bona: 'Un projecte d\'habitatge s\'arrela si obre els seus espais al veïnat: el suport de l\'entorn també és valor.' },
    es: { centre: 'Grupo motor', rol: 'Vecindario del entorno', pairs: [['Vecindario del entorno', 'Grupo motor', 'intangible', 'acogida y apoyo', 'intangible', 'espacios comunes abiertos']],
      bona: 'Un proyecto de vivienda arraiga si abre sus espacios al vecindario: el apoyo del entorno también es valor.' } },
  energia: {
    ca: { centre: 'Nucli promotor', rol: 'Altres comunitats energètiques', pairs: [['Altres comunitats energètiques', 'Nucli promotor', 'intangible', 'experiència i errors a evitar', 'intangible', 'dades i aprenentatges']],
      bona: 'Cap comunitat energètica comença de zero: compartir errors i dades amb les altres estalvia mesos.' },
    es: { centre: 'Núcleo promotor', rol: 'Otras comunidades energéticas', pairs: [['Otras comunidades energéticas', 'Núcleo promotor', 'intangible', 'experiencia y errores a evitar', 'intangible', 'datos y aprendizajes']],
      bona: 'Ninguna comunidad energética empieza de cero: compartir errores y datos con las demás ahorra meses.' } },
  alimentacio: {
    ca: { centre: 'Pagesia local', rol: 'Escoles i menjadors', pairs: [['Escoles i menjadors', 'Pagesia local', 'tangible', 'comandes regulars', 'intangible', 'visites i aprenentatge'], ['Consumidors', 'Pagesia local', 'intangible', 'fidelitat i suggeriments', 'intangible', 'confiança i transparència'], ['Pagesia local', 'Grup de consum', 'intangible', 'saber de temporada i de cultiu', 'intangible', 'compromís de compra']],
      bona: 'La pagesia aguanta amb compra estable i confiança: els menjadors donen volum i les visites, vincle.' },
    es: { centre: 'Campesinado local', rol: 'Escuelas y comedores', pairs: [['Escuelas y comedores', 'Campesinado local', 'tangible', 'pedidos regulares', 'intangible', 'visitas y aprendizaje'], ['Consumidores', 'Campesinado local', 'intangible', 'fidelidad y sugerencias', 'intangible', 'confianza y transparencia'], ['Campesinado local', 'Grupo de consumo', 'intangible', 'saber de temporada y de cultivo', 'intangible', 'compromiso de compra']],
      bona: 'El campesinado aguanta con compra estable y confianza: los comedores dan volumen y las visitas, vínculo.' } },
  cures: {
    ca: { centre: 'Nucli de cura', rol: 'Comerços del barri', pairs: [['Comerços del barri', 'Nucli de cura', 'intangible', 'avisos de qui necessita ajuda', 'intangible', 'xarxa i reconeixement']],
      bona: 'Qui veu cada dia la gent gran (la farmàcia, el forn) és qui avisa primer: compta-hi.' },
    es: { centre: 'Núcleo de cuidado', rol: 'Comercios del barrio', pairs: [['Comercios del barrio', 'Núcleo de cuidado', 'intangible', 'avisos de quien necesita ayuda', 'intangible', 'red y reconocimiento']],
      bona: 'Quien ve cada día a las personas mayores (la farmacia, el horno) es quien avisa primero: cuenta con ello.' } },
  cultura: {
    ca: { centre: 'Entitats culturals', rol: 'Públic fidel', pairs: [['Públic fidel', 'Entitats culturals', 'intangible', 'assistència i difusió', 'intangible', 'pertinença i programació propera']],
      bona: 'El públic fidel és el que omple i difon: fes-lo sentir part de la programació.' },
    es: { centre: 'Entidades culturales', rol: 'Público fiel', pairs: [['Público fiel', 'Entidades culturales', 'intangible', 'asistencia y difusión', 'intangible', 'pertenencia y programación cercana']],
      bona: 'El público fiel es el que llena y difunde: hazlo sentir parte de la programación.' } },
  turisme: {
    ca: { centre: 'Ens de destinació', rol: 'Ens de destinació', pairs: [['Ens de destinació', 'Allotjaments', 'intangible', 'relat comú i coordinació', 'intangible', 'dades de visitants'], ['Ens de destinació', 'Productors', 'intangible', 'visibilitat del producte local', 'intangible', 'autenticitat del relat'], ['Ajuntament', 'Ens de destinació', 'tangible', 'suport i recursos', 'intangible', 'reputació del territori']],
      bona: 'Una destinació és una xarxa, no una suma d\'empreses: algú ha de cosir el relat comú i compartir-ne les dades.' },
    es: { centre: 'Ente de destino', rol: 'Ente de destino', pairs: [['Ente de destino', 'Alojamientos', 'intangible', 'relato común y coordinación', 'intangible', 'datos de visitantes'], ['Ente de destino', 'Productores', 'intangible', 'visibilidad del producto local', 'intangible', 'autenticidad del relato'], ['Ayuntamiento', 'Ente de destino', 'tangible', 'apoyo y recursos', 'intangible', 'reputación del territorio']],
      bona: 'Un destino es una red, no una suma de empresas: alguien tiene que coser el relato común y compartir sus datos.' } },
  economia_circular: {
    ca: { centre: 'Nucli gestor', rol: 'Persones reparadores voluntàries', pairs: [['Persones reparadores voluntàries', 'Nucli gestor', 'intangible', 'saber reparar', 'intangible', 'comunitat i reconeixement'], ['Persones reparadores voluntàries', 'Veïnat', 'intangible', 'aprendre a reparar', 'intangible', 'confiança i objectes per salvar'], ['Veïnat', 'Comerços', 'intangible', 'boca-orella', 'intangible', 'consell de consum']],
      bona: 'L\'economia circular és sobretot saber compartit: qui ensenya a reparar multiplica el que es salva.' },
    es: { centre: 'Núcleo gestor', rol: 'Personas reparadoras voluntarias', pairs: [['Personas reparadoras voluntarias', 'Núcleo gestor', 'intangible', 'saber reparar', 'intangible', 'comunidad y reconocimiento'], ['Personas reparadoras voluntarias', 'Vecindario', 'intangible', 'aprender a reparar', 'intangible', 'confianza y objetos por salvar'], ['Vecindario', 'Comercios', 'intangible', 'boca a boca', 'intangible', 'consejo de consumo']],
      bona: 'La economía circular es sobre todo saber compartido: quien enseña a reparar multiplica lo que se salva.' } },
  digitalitzacio: {
    ca: { centre: 'Nucli tècnic', rol: 'Persones mentores', pairs: [['Persones mentores', 'Veïnat', 'intangible', 'acompanyament pas a pas', 'intangible', 'agraïment i confiança'], ['Persones mentores', 'Nucli tècnic', 'intangible', 'temps i coneixement', 'intangible', 'comunitat i formació']],
      bona: 'La bretxa digital es tanca de persona a persona: les mentores fan el que cap curs fa.' },
    es: { centre: 'Núcleo técnico', rol: 'Personas mentoras', pairs: [['Personas mentoras', 'Vecindario', 'intangible', 'acompañamiento paso a paso', 'intangible', 'agradecimiento y confianza'], ['Personas mentoras', 'Núcleo técnico', 'intangible', 'tiempo y conocimiento', 'intangible', 'comunidad y formación']],
      bona: 'La brecha digital se cierra de persona a persona: las mentoras hacen lo que ningún curso hace.' } },
  joventut: {
    ca: { centre: 'Esplai / entitats', rol: 'Famílies', pairs: [['Famílies', 'Esplai / entitats', 'tangible', 'quotes i autoritzacions', 'intangible', 'confiança i col·laboració'], ['Famílies', 'Jovent', 'intangible', 'suport i permís', 'intangible', 'autonomia i ganes']],
      bona: 'Amb el jovent, les famílies decideixen molt: si confien, el projecte creix.' },
    es: { centre: 'Esplai / entidades', rol: 'Familias', pairs: [['Familias', 'Esplai / entidades', 'tangible', 'cuotas y autorizaciones', 'intangible', 'confianza y colaboración'], ['Familias', 'Juventud', 'intangible', 'apoyo y permiso', 'intangible', 'autonomía y ganas']],
      bona: 'Con la juventud, las familias deciden mucho: si confían, el proyecto crece.' } },
  mobilitat: {
    ca: { centre: 'Plataforma de mobilitat', rol: 'Plataforma de mobilitat', pairs: [['Plataforma de mobilitat', 'Veïnat', 'intangible', 'propostes i camins segurs', 'intangible', 'participació i dades d\'ús'], ['Plataforma de mobilitat', 'Ajuntament', 'intangible', 'diagnosi ciutadana', 'tangible', 'suport i obres'], ['Escoles', 'Plataforma de mobilitat', 'intangible', 'camins escolars', 'intangible', 'acompanyament']],
      bona: 'La mobilitat canvia quan el veïnat aporta dades del dia a dia: algú ha de recollir-les i portar-les a qui decideix.' },
    es: { centre: 'Plataforma de movilidad', rol: 'Plataforma de movilidad', pairs: [['Plataforma de movilidad', 'Vecindario', 'intangible', 'propuestas y caminos seguros', 'intangible', 'participación y datos de uso'], ['Plataforma de movilidad', 'Ayuntamiento', 'intangible', 'diagnóstico ciudadano', 'tangible', 'apoyo y obras'], ['Escuelas', 'Plataforma de movilidad', 'intangible', 'caminos escolares', 'intangible', 'acompañamiento']],
      bona: 'La movilidad cambia cuando el vecindario aporta datos del día a día: alguien tiene que recogerlos y llevarlos a quien decide.' } },
  acollida: {
    ca: { centre: 'Entitats d\'acollida', rol: 'Persones mentores del veïnat', pairs: [['Persones mentores del veïnat', 'Nouvinguts', 'intangible', 'llengua i xarxa', 'intangible', 'cultura i amistat'], ['Persones mentores del veïnat', 'Entitats d\'acollida', 'intangible', 'temps voluntari', 'intangible', 'formació i suport']],
      bona: 'Acollir és fer xarxa: una persona del veïnat que acompanya obre més portes que cap tràmit.' },
    es: { centre: 'Entidades de acogida', rol: 'Personas mentoras del vecindario', pairs: [['Personas mentoras del vecindario', 'Recién llegados', 'intangible', 'idioma y red', 'intangible', 'cultura y amistad'], ['Personas mentoras del vecindario', 'Entidades de acogida', 'intangible', 'tiempo voluntario', 'intangible', 'formación y apoyo']],
      bona: 'Acoger es hacer red: una persona del vecindario que acompaña abre más puertas que ningún trámite.' } },
  territori: {
    ca: { centre: 'Custòdia / entitat', rol: 'Escoles i famílies', pairs: [['Escoles i famílies', 'Custòdia / entitat', 'intangible', 'participació i voluntariat de demà', 'intangible', 'educació ambiental']],
      bona: 'Custodiar el territori és cosa de generacions: les escoles d\'avui són el voluntariat de demà.' },
    es: { centre: 'Custodia / entidad', rol: 'Escuelas y familias', pairs: [['Escuelas y familias', 'Custodia / entidad', 'intangible', 'participación y voluntariado de mañana', 'intangible', 'educación ambiental']],
      bona: 'Custodiar el territorio es cosa de generaciones: las escuelas de hoy son el voluntariado de mañana.' } }
};
/* El model complet en una llengua: el de l'app (o de la Matriu) amb el que el
   completa. Un rol o un centre que no hi és es diu, no es dibuixa a cegues. */
function completa(id, m, ll, falten) {
  const b = BONES[id] && BONES[id][ll];
  if (!b) { falten.add('BONES.' + id + '.' + ll); return m; }
  const roles = m.roles.indexOf(b.rol) < 0 ? m.roles.concat([b.rol]) : m.roles.slice();
  b.pairs.forEach(p => [p[0], p[1]].forEach(r => { if (roles.indexOf(r) < 0) falten.add('BONES.' + id + '.' + ll + ': rol desconegut «' + r + '»'); }));
  if (roles.indexOf(b.centre) < 0) falten.add('BONES.' + id + '.' + ll + ': centre desconegut «' + b.centre + '»');
  return Object.assign({}, m, { roles, pairs: m.pairs.concat(b.pairs), centre: b.centre, bona: b.bona });
}

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
  const es = x => TS[x] || (T[x] ? T[x][0] : (falten.add(x), x));
  /* Les fases que la Matriu proposa en crear el projecte (el `kanban` de l'app): el camí per posar-ho en marxa. */
  const ambPassos = (m, cat) => Object.assign(m, { passos: (m._k || []).map(k => (cat ? k : es(k))) });
  /* L'anglès queda com a l'app: les bones pràctiques, de moment, en català i castellà. */
  const out = llegeixApp().map(m => ({ id: m.id, icona: m.icon, paraules: PARAULES[m.id] || '',
    ca: completa(m.id, ambPassos(Object.assign(llengua(m, -1), { _k: m.kanban }), true), 'ca', falten),
    es: completa(m.id, ambPassos(Object.assign(llengua(m, 0), { _k: m.kanban }), false), 'es', falten), en: llengua(m, 1) }));
  out.forEach(M => ['ca', 'es'].forEach(ll => { delete M[ll]._k; }));
  const sector = (a, cat) => ({
    nom: cat ? a.name : es(a.name), diu: cat ? a.one : es(a.one),
    roles: a.roles.map(r => (cat ? r : es(r))),
    pairs: a.pairs.map(p => [0, 1, 2, 3, 4, 5].map(k => (k === 2 || k === 4 || cat ? p[k] : es(p[k])))),
    passos: (a.kanban || []).map(k => (cat ? k : es(k)))
  });
  const sectors = llegeixSectors().map(a => ({ id: a.id, icona: a.icon, paraules: PARAULES[a.id] || '', ca: completa(a.id, sector(a, true), 'ca', falten), es: completa(a.id, sector(a, false), 'es', falten) }));
  out.concat(sectors).filter(m => !PARAULES[m.id]).forEach(m => falten.add('PARAULES.' + m.id));
  return { out, sectors, falten: [...falten] };
}

/* Qui fa cada lliurament: la regla del Kanban de l'app (`fluxAutomatitzable`,
   veda 164), llegida de SOS/index.html tal com és, igual que fa
   `automatitza.js`, i els noms dels productes de
   `knowledge/cervell/automatitzable.json`. A /cliente/ marca què pot preparar la
   màquina al mapa de cada client (demanat per l'Àlvar el 22/10/2026). Un
   intangible i els diners són sempre de persona perquè l'app ho diu. */
function regla() {
  const app = readFileSync(join(ARREL, 'index.html'), 'utf8');
  const tros = (inici, fi) => {
    const a = app.indexOf(inici), b = a < 0 ? -1 : app.indexOf(fi, a);
    if (b < 0) throw new Error('La regla de l\'app no es troba a SOS/index.html: ' + inici);
    return app.slice(a, b + fi.length);
  };
  const codi = tros('const normKind=', 'const isIntangible=k=>normKind(k)===\'intangible\';') + '\n'
    + tros('const ENTREGABLES=[', '\n  return{pot:true,motiu:\'\',tipus:t};\n}');
  const prods = JSON.parse(readFileSync(join(ARREL, 'knowledge', 'cervell', 'automatitzable.json'), 'utf8')).productes
    .map(p => ({ nom: p.nom, ca: p.diu, es: p.diu_es || p.diu, patrons: p.patrons }));
  return { codi, prods };
}

/* Les dues funcions que viatgen a la llibreria tal com s'escriuen aquí. */
function pla(t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
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

/* El rol on passa més: el centre del mapa, el que a /cliente/ passa a ser «tu». */
/* ══ LES VEDES DE SECTOR (23/10/2026) ════════════════════════════════════
   «Veda» vol dir veritat. Les del codex són les que hem après dels errors (per
   aquí no és); aquestes són les veritats de cada àmbit: com flueix el valor en
   un projecte d'aquest tipus quan funciona. Una per model, a
   `knowledge/vna/sectors/<id>.md`, demanades per l'Àlvar perquè el sistema
   comenci amb una base excel·lent i ensenyi el camí al client.

   El text el escriu una persona; el mapa de referència de cada veda el genera
   aquí, entre `<!--TT-MAPA-->` i `<!--/TT-MAPA-->`, des del mateix model que
   fa servir /cliente/: cap còpia. I de la veda tornen a la llibreria «com es
   pregunta» i «el que sol faltar», que la IA de /cliente/ fa servir. */
const VEDES = join(ARREL, 'knowledge', 'vna', 'sectors');
const SECCIONS = ['Els intangibles que ja se saben', 'El que sol faltar', 'Com es pregunta a la sessió', 'Senyals que la xarxa està sana'];
const vinyetes = (t, titol) => {
  const i = t.indexOf('## ' + titol + '\n'); if (i < 0) return null;
  const tros = t.slice(i + titol.length + 4).split(/\n## /)[0];
  return tros.split('\n').filter(l => /^- /.test(l)).map(l => l.slice(2).trim());
};
function llegeixVeda(id, falten) {
  const f = join(VEDES, id + '.md');
  if (!existsSync(f)) { falten.add('la veda knowledge/vna/sectors/' + id + '.md'); return null; }
  const t = readFileSync(f, 'utf8');
  if (t.indexOf('<!--TT-MAPA-->') < 0 || t.indexOf('<!--/TT-MAPA-->') < 0) falten.add(id + '.md: les marques <!--TT-MAPA--> … <!--/TT-MAPA-->');
  SECCIONS.forEach(s => { const v = vinyetes(t, s); if (!v || !v.length) falten.add(id + '.md: la secció «' + s + '» amb una llista'); });
  return { clau: vinyetes(t, 'Els intangibles que ja se saben') || [], preguntes: vinyetes(t, 'Com es pregunta a la sessió') || [], falta: vinyetes(t, 'El que sol faltar') || [] };
}
const MENA_CA = { tangible: 'es paga', intangible: 'no es paga' };
const QUI_CA = { maquina: '⚙ la prepara la màquina, la revisa una persona', persona: 'una persona', visita: 'es decideix a la sessió' };
function blocVeda(MM, M) {
  const m = M.ca, c = MM.centre(m), l = ['', '## El mapa de referència', '',
    `**Qui fa de «tu».** ${c}: qui promou el projecte. ${m.roles.length} rols i ${m.pairs.length} relacions.`, '',
    '| Qui dona | A qui | Què | | Qui ho fa |', '|---|---|---|---|---|'];
  const fila = (de, a, que, mena) => l.push(`| ${de} | ${a} | ${que} | ${MENA_CA[mena] || mena} | ${QUI_CA[MM.automatitza(que, mena, 'ca').qui]} |`);
  m.pairs.forEach(p => { if (p[3]) fila(p[0], p[1], p[3], p[2]); if (p[5]) fila(p[1], p[0], p[5], p[4]); });
  l.push('', `**La bona pràctica.** ${m.bona}`);
  if ((m.passos || []).length) l.push('', `**Per posar-ho en marxa.** ${m.passos.join(' → ')}.`);
  l.push('', '_Generat per `SOS/tools/build-models-mapa.js` des de `SOS/lib/models-mapa.js`; «qui ho fa» és la regla del tauler de l\'app. No s\'edita a mà._', '');
  return l.join('\n');
}
function vedesAra(MM) {
  return MM.MODELS.concat(MM.SECTORS).map(M => {
    const f = join(VEDES, M.id + '.md'), t = readFileSync(f, 'utf8');
    const a = t.indexOf('<!--TT-MAPA-->') + '<!--TT-MAPA-->'.length, b = t.indexOf('<!--/TT-MAPA-->');
    return { f, abans: t, ara: t.slice(0, a) + blocVeda(MM, M) + t.slice(b) };
  });
}

function genera() {
  const { out, sectors, falten } = models();
  out.concat(sectors).forEach(M => { const v = llegeixVeda(M.id, falten); if (v) M.veda = v; });
  const R = regla();
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
    + '  /* Qui fa de «tu» quan algú comença per aquest model: el que el promou (`centre`) o, si no el diu, el rol que més dona i rep. */\n'
    + '  function centre(m) { if (m.centre) return m.centre; var n = {}; m.pairs.forEach(function (p) { n[p[0]] = (n[p[0]] || 0) + 1; n[p[1]] = (n[p[1]] || 0) + 1; });\n'
    + '    return m.roles.slice().sort(function (a, b) { return (n[b] || 0) - (n[a] || 0); })[0]; }\n'
    + '  /* El model en una llengua, amb el centre canviat pel nom de qui el fa servir. */\n'
    + '  function mapa(id, llengua, casa) {\n'
    + '    var M = MODELS.concat(SECTORS).filter(function (x) { return x.id === id; })[0]; if (!M) return null;\n'
    + '    var m = M[llengua] || M.es || M.ca, c = centre(m), r = function (x) { return casa && x === c ? casa : x; };\n'
    + '    return { abast: \'\', roles: m.roles.map(r), pairs: m.pairs.map(function (p) { return [r(p[0]), r(p[1]), p[2], p[3], p[4], p[5]]; }), centre: casa || c, nom: m.nom, bona: m.bona || \'\', veda: M.veda || null, passos: m.passos || [] };\n'
    + '  }\n'
    + '  /* Quin model o sector s\'assembla més al que algú explica amb les seves paraules.\n'
    + '     Sense IA: arrels curtes (sense accents ni plural); el nom i el «diu» compten doble i\n'
    + '     una arrel comuna a molts models pesa menys. Torna null si no n\'hi ha prou per dir-ho. */\n'
    + '  var BUIDES = /^(quie|teng|tene|vole|nues|nost|porq|perq|sobr|tamb|todo|tots|dond|cuan|quan|hace|desd|entr|much|molt|pued|pode|esta|somo|siem|semp|ahor|aque|esto|otro|altr|pers|para|como|cosa|bien|vull|vols|fins|hast|dels|unes|unos|haci|ques|aixo|pero|vida|grup|gent|bonit|quer|volem|nece)/;\n'
    + '  function arrels(t) { return String(t || \'\').toLowerCase().normalize(\'NFD\').replace(/[\\u0300-\\u036f]/g, \'\')\n'
    + '    .split(/[^a-z0-9]+/).filter(function (w) { return w.length >= 4; }).map(function (w) { w = w.length > 4 ? w.replace(/s$/, \'\') : w; return w.length > 5 ? w.slice(0, 5) : w; })\n'
    + '    .filter(function (w) { return !BUIDES.test(w); }); }\n'
    + '  function textDe(m) { return [m.nom, m.nom, m.diu, m.diu, m.roles.join(\' \'), m.pairs.map(function (p) { return p[3] + \' \' + p[5]; }).join(\' \')].join(\' \'); }\n'
    + '  function suggereix(text, llengua) {\n'
    + '    var meves = {}; arrels(text).forEach(function (w) { meves[w] = 1; });\n'
    + '    var tots = MODELS.concat(SECTORS), df = {}, bosses = tots.map(function (M) {\n'
    + '      var b = {}; arrels(textDe(M[llengua] || M.es || M.ca) + \' \' + M.paraules + \' \' + M.paraules).forEach(function (w) { b[w] = (b[w] || 0) + 1; });\n'
    + '      Object.keys(b).forEach(function (w) { df[w] = (df[w] || 0) + 1; }); return b; });\n'
    + '    /* Una arrel que surt a molts models diu poc: pesa menys (1 / quants la tenen). */\n'
    + '    var millor = null;\n'
    + '    tots.forEach(function (M, i) {\n'
    + '      var punts = 0, n = 0;\n'
    + '      Object.keys(meves).forEach(function (w) { if (bosses[i][w]) { n++; punts += Math.min(bosses[i][w], 2) / df[w]; } });\n'
    + '      var m = M[llengua] || M.es || M.ca;\n'
    + '      if (punts >= 1 && (!millor || punts > millor.punts)) millor = { id: M.id, icona: M.icona, nom: m.nom, punts: Math.round(punts * 100) / 100, sector: SECTORS.indexOf(M) >= 0 };\n'
    + '    });\n'
    + '    return millor;\n'
    + '  }\n'
    + '  /* La regla de l\'app (SOS/index.html), tal com és: qui fa cada lliurament. */\n'
    + '  ' + R.codi.replace(/\n/g, '\n  ') + '\n'
    + '  var PRODUCTES = ' + JSON.stringify(R.prods) + ';\n'
    + '  var pla = ' + pla.toString() + ';\n'
    + '  /* maquina: la prepara la màquina (amb el producte que ja ho fa, si n\'hi ha); persona: la fa\n'
    + '     una persona (el que no es paga i els diners, sempre); visita: es decideix a la sessió. */\n'
    + '  ' + automatitza.toString().replace(/\n/g, '\n  ') + '\n'
    + '  return { MODELS: MODELS, SECTORS: SECTORS, centre: centre, mapa: mapa, suggereix: suggereix, automatitza: automatitza };\n'
    + '});\n';
  return { cos, falten };
}

if (require.main === module) {
  const { cos, falten } = genera();
  if (falten.length) { console.error('✗ Textos de l\'app sense traduir a build-models-mapa.js:\n  ' + falten.join('\n  ')); process.exit(1); }
  /* La qualitat: cada model publicat, en cada llengua, compleix les regles 2 a 5
     del mètode (de 6 a 12 rols, un terç d'intangibles, tot recíproc, cap rol
     solt) tal com les compta mapa-valor.js. L'abast el posa qui el fa servir. */
  {
    const MV = require('../lib/mapa-valor.js'), MM = Function('module', cos + ';return module.exports')({ exports: {} });
    const REGLES = ['rols', 'menes', 'reciprocitat', 'solts'], mals = [];
    MM.MODELS.concat(MM.SECTORS).forEach(M => ['ca', 'es'].forEach(ll => {
      const m = MM.mapa(M.id, ll, null), r = MV.revisa({ abast: '-', roles: m.roles, pairs: m.pairs });
      const ko = r.regles.filter(x => REGLES.indexOf(x.id) >= 0 && !x.ok).map(x => x.id);
      if (ko.length) mals.push(M.id + ' (' + ll + '): ' + ko.join(', '));
    }));
    if (mals.length) { console.error('✗ Models que no compleixen les regles del mapa (BONES):\n  ' + mals.join('\n  ')); process.exit(1); }
    console.log('✓ Els ' + (MM.MODELS.length + MM.SECTORS.length) + ' models compleixen les regles 2 a 5 en català i castellà');
  }
  if (process.argv.includes('--check')) {
    const ara = existsSync(SORTIDA) ? readFileSync(SORTIDA, 'utf8') : '';
    if (ara !== cos) { console.error('✗ SOS/lib/models-mapa.js no és el que sortiria ara: node SOS/tools/build-models-mapa.js'); process.exit(1); }
    console.log('✓ Els mapes tipus de l\'app i els sectors de la Matriu, al dia i traduïts');
  } else { writeFileSync(SORTIDA, cos); console.log('Escrit ' + SORTIDA); }
  {
    const MM = Function('module', cos + ';return module.exports')({ exports: {} }), vs = vedesAra(MM);
    if (process.argv.includes('--check')) {
      const velles = vs.filter(v => v.abans !== v.ara).map(v => v.f.replace(ARREL + '/', ''));
      if (velles.length) { console.error('✗ Vedes amb el mapa de referència desfasat: ' + velles.join(', ') + ' · node SOS/tools/build-models-mapa.js'); process.exit(1); }
      console.log('✓ Les ' + vs.length + ' vedes de sector porten el mapa del seu model');
    } else vs.forEach(v => { if (v.abans !== v.ara) writeFileSync(v.f, v.ara); });
  }
}
module.exports = { genera, models };
