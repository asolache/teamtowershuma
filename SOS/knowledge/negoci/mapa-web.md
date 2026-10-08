# Web de red · mapa de valor y web en una sesión de 2 h 30

> **Estado:** borrador (08/10/2026, revisado tras la revisión técnica, de copy y de
> veracidad). Página en [`/mapa-web/`](../../../mapa-web/index.html), con `noindex`
> hasta validar textos y precios y publicar la versión en catalán. Todavía no está en el catálogo
> (`build-oferta.js`) ni en el menú único (`build-nav.js`). Firma TeamTowers;
> TeamTowers Humà no aparece en la página.

## Qué es

Una sesión, individual o de equipo, que encadena tres cosas que en el catálogo
van por separado:

0. **Antes, el borrador.** El material del cliente (web, catálogo, documentos y,
   si hay audio, su transcripción) pasa por la IA con el encargo que prepara el bloque «0» de
   `SOS/vna-suport.html`. La respuesta se carga en la consola, pasa por las diez
   reglas y deja una lista de dudas para la sala. Con el mapa revisado, el botón
   «Copia l'encàrrec de la web» prepara para Claude Code el esqueleto de la web y
   el cerebro (`cerebro/`, `CLAUDE.md`). La sesión revisa; no empieza de cero.
1. **Mapa de valor** con el método VNA de Verna Allee (los seis pasos de
   `SOS/vna-suport.html`), recortado a lo que cabe en una hora.
2. **Flujo de valor → arquitectura web.** Cada rol es una puerta, cada
   intercambio tangible una acción, cada intangible contenido que da confianza,
   y el flujo elegido es el recorrido principal.
3. **Web publicada en directo** con Claude Code + GitHub + Netlify, a nombre
   del cliente, y con una carpeta `cerebro/` en Markdown y un `CLAUDE.md`.

Es la puerta de entrada barata al paquete «Web o herramienta hecha con IA»
(4-10 semanas, 2.500-8.000 €) del catálogo.

## Posicionamiento

**Web de red** (nombre interno; en la página solo aparece dentro de la comparación
con la «web embudo», porque «red» también se lee como internet): la web del cliente no es un embudo para captar contactos, sino la
pieza de su red de valor donde cada rol encuentra lo que recibe y lo que puede
aportar. Esos roles son quien compra, quien revende, quien recomienda, el equipo,
los proveedores y el lugar. La página no usa «disruptivo» ni «innovador»: la
diferencia se demuestra con hechos.

- El borrador previo lo hace la IA.
- El esqueleto de la web sale del mapa.
- La web se publica dentro de la sesión.
- Todo queda a nombre del cliente.
- La cocina está a la vista: lo que propone la IA va en naranja y pasa a verde
  cuando lo valida una persona.

**Excepción de idioma**: la página `/mapa-web/` es solo en español, por decisión
del brief (08/10/2026). La guía de estilo pide catalán por defecto, y la página
predica el bilingüismo: la versión catalana es condición para quitar el `noindex`,
con un enlace «Català» en la cabecera.

## La regla del cerebro

| Repositorio | CRM |
|---|---|
| Mapa, flujos, roles, procesos, decisiones, marca, lugar, historia, textos, reglas para la IA | Datos personales, contratos, precios pactados, conversaciones comerciales, claves |

Criterio: **si no lo colgarías en un tablón, no va al repositorio.** Se deja
escrito en el `CLAUDE.md` del cliente para que la IA también lo cumpla. Los datos
de quien escribe desde la página (correo con plantilla precargada) van al CRM,
nunca al repositorio.

## La página

Orden (guía de estilo §8), después de la revisión del 08/10/2026: promesa
(`#inicio`) → dolor (`#dolor`) → la pinya (`#pinya`) → la red, con la tabla
embudo/red dentro (`#red`) → cómo, cuatro pasos y quién hace qué (`#como`) → lo
que pone una persona (`#sutil`) → qué se queda contigo, con «lo que viene» dentro
(`#cerebro`) → prueba (`#prueba`) → precios (`#precios`) → CTA final (`#empezar`)
→ objeciones y garantías (`#preguntas`) → puertas para agencias, grupos,
prescriptores y facilitadores (`#puertas`). Se quitaron por repetidos: el registro
de una sesión, la tabla «Del mapa a la web» (la regla queda en una frase del paso
3), las tres piezas de `#cerebro` y dos filas de la tabla embudo/red.

- **Primera pantalla.** Eyebrow «Mapa de valor y web · Una hora para cada uno, en
  una sesión de 2 h 30». H1 «Una web para todos los que sostienen tu negocio. No
  solo para quien compra.», el porqué de ahora (una IA hace webs correctas que se
  parecen) y, al lado, el menú de ejemplo «tu web» con la puerta de cada rol
  (visible también en móvil). Debajo, la tríada sin jerga y una franja de prueba
  (VNA de Verna Allee · VNA para IKEA con Pantheon Work, «A validar» · más de 20
  años con equipos).
- **Nombre de Álvaro.** Sale en la bio, en los chips de los pasos y en «Lo hace una
  persona (hoy, Álvaro)». En el resto, «una persona» o TeamTowers: la oferta no
  debe leerse como trabajo de un autónomo ni cerrar la puerta a agencias y
  facilitadores.
- **Compromisos humanos con tope.** Acompañamiento: una revisión semanal con su
  informe, no «cada cambio». Guardas: aviso con causa y arreglo; arreglar entra en
  Cerebro al día.
- **Elemento distintivo «Tu red, a la vista».** Un mapa de ejemplo en SVG con
  tres vistas (web embudo, borrador de la IA, web de red), una casilla «entre
  ellos» y un selector de rol con seis fichas. Funciona entero sin JS: radios,
  casilla y `:has()`. Sin `:has()` se ve todo (vista red, cuerdas y fichas
  completas). El SVG es `role="img"` con `title` y `desc`; la información está
  entera en las fichas. Nunca solo color: tangible = línea continua, intangible
  = discontinua, borrador = borde discontinuo + «?», validado = «✓».
- **Recuento del ejemplo** (comprobación interna): 26 intercambios en las fichas
  (11 tangibles, 15 intangibles) y 10 entre ellos (2 y 8). Total 36, 23
  intangibles (64 %). La regla 7 (concentración) no se cumple a propósito: es una
  vista desde el negocio, y la nota lo dice.
- **Reutilización.** La misma estructura (roles, lente tangible/intangible,
  cuerdas, fichas y pestañas «tu web») es la plantilla que el encargo de la web
  de la consola puede rellenar con el mapa de cada cliente. La vista «Web de red»
  se exportará a PNG de 1200×630 para `og:image` (pendiente).
- **JS**: solo el correo ofuscado (`.js-mail`), que lee `data-asunto` y
  `data-cuerpo` y monta el `mailto:` con la plantilla del borrador, y escribe la
  dirección visible (`.js-dir`) bajo cada botón principal para quien no tiene un
  programa de correo. Sin JS, todos los botones llevan a `/qui-som`. No hay botón «Copiar el texto» ni clic sobre
  los nodos: el texto para reenviar se selecciona entero con un toque.
- **Schema.org**: `Service` con un `OfferCatalog` cuyos precios son los mismos
  que los de la página (0, 390, 1.200, 1.400 y las dos cuotas de mantenimiento),
  cada uno con `valueAddedTaxIncluded: false`. Las lenguas van en
  `availableChannel` (`ServiceChannel`), porque `availableLanguage` no es propiedad
  de `Service`.
- **og:image**: `mapa-web/og.png` (1200×630), generado desde la vista «Web de red»
  con el H1 a la izquierda.
- **Accesibilidad**: `scroll-padding-top` bajo la cabecera fija (WCAG 2.4.11),
  `font-size` raíz al 100 % para respetar la letra elegida en el navegador, modo
  de colores forzados con el SVG en `Canvas`/`CanvasText`, valores catalanes con
  `lang="ca"`, y el árbol del repositorio con los comentarios debajo cuando no
  cabe (consulta de contenedor), sin scroll horizontal.
  Si la franja de mantenimiento no se valida, se quitan el bloque y sus dos
  ofertas del JSON-LD.

## Cadena de trabajo

Entre corchetes, el tiempo de Álvaro (estimación a medir).

1. **Entrada [5 min].** Llega un correo con la plantilla precargada (web, una
   frase, tamaño, material). Álvaro decide si hay encaje. Los datos del contacto
   van al CRM.
2. **Ingesta [0].** La IA lee la web pública, el catálogo y los documentos que se
   pueden compartir. El audio no lo transcribe Claude: hace falta una herramienta
   de transcripción aparte (por decidir), que es otro tercero que trata datos y se
   nombra junto a Anthropic. Deja un `dossier.md` con la fuente de
   cada afirmación. Solo entra material que se colgaría en un tablón.
3. **Borrador del mapa [0].** Se usa el encargo «0» de `/SOS/vna-suport.html`,
   que devuelve un JSON con abast, roles, pairs y dubtes. Se carga en la consola,
   pasa las diez reglas y deja la lista de dudas. Todo va en naranja.
4. **Lectura humana [20–30 min].** Álvaro corrige los roles y añade historia,
   lugar y marca. Elige las tres preguntas que harán salir los intangibles y anota
   la hipótesis de atasco. Se envía el borrador gratuito (plazo por defecto: tres
   días laborables).
5. **Propuesta y reserva [10 min].** La IA redacta la propuesta desde plantilla y
   se cobra. Hay una lista de comprobación de cuentas (GitHub, Netlify, DNS,
   suscripción a la IA) y de consentimientos (material y grabación).
6. **Esqueleto [15–20 min].** Con «Copia l'encàrrec de la web», Claude Code
   genera el repositorio. **Lo que el encargo genera hoy**: `cerebro/mapa-de-valor.json`,
   `mapa-de-valor.md`, `flujo-de-valor.md`, `decisiones.md`, `CLAUDE.md`,
   `index.html` con una puerta por rol y `netlify.toml` (solo `publish = "."`).
   **Por construir en el encargo**: tokens de marca, OG, `AGENTS.md`, `marca.md`,
   `lugar.md`, `historia.md` y un script de comprobaciones para el repositorio
   del cliente. Mientras, en la sesión Claude Code pasa a mano `html-validate`,
   enlaces y axe. Sale una vista previa en Netlify. Álvaro ajusta la marca y la
   revisa.
7. **Sesión [2 h 30; taller 4 h].**
   - Hora 1, el mapa: facilita Álvaro.
   - Hora 2, la web en directo: Claude Code ejecuta, Álvaro dirige y el cliente
     pide.
   - Cierre de 20 min: memoria y oficio. El cliente hace su primer cambio.
8. **Cierre [30–40 min].** La IA pasa el acta a `decisiones.md`, escribe
   `marca.md`, `lugar.md` e `historia.md`, copia las reglas de `CLAUDE.md` a
   `AGENTS.md` (Claude Code lee el primero; otras herramientas, el segundo) y
   genera el mapa final en SVG y Markdown, la guía personalizada y el informe de
   comprobaciones.
   Álvaro revisa lo sensible (historia, nombres, cifras) y lo pasa a verde.
9. **Revisión a las dos semanas [30 min; taller 1 h].** La IA resume los commits
   del cliente y Álvaro los revisa con él. Propone acompañamiento o mantenimiento
   solo si encaja.
10. **Recurrente [5–45 min al mes por cliente]. Por construir.** Una tarea
    programada (GitHub Actions o Netlify) pasaría las comprobaciones y un informe
    redactado por la IA. Hoy no existe, y redactar el informe por API cuesta
    tokens: hay que decidir quién paga ese uso (cuota incluida o cuenta del
    cliente). Álvaro lee el informe; un fallo se avisa con causa y arreglo, y
    arreglarlo entra en «Cerebro al día».
11. **Caso [10 min].** La IA redacta la ficha del caso desde `cerebro/`. Se
    publica solo con la validación escrita del cliente.

## Lo que solo aporta Álvaro (es lo que se factura)

1. **Leer a la persona**: qué quiere de verdad frente a lo que pide, quién decide
   y en qué momento está la casa (fundación, relevo, crisis, crecimiento).
2. **Leer la sala en el taller**: quién habla y quién calla, tensiones y
   alianzas, quién sostiene un valor que nadie nombra.
3. **Las preguntas que hacen salir los intangibles**, y detectar cuándo una
   respuesta es de manual.
4. **Historia y contexto**: generaciones, hitos y conflictos, y qué se puede
   contar y qué no.
5. **Entorno y territorio**: pueblo, comarca, paisaje, fiestas, quién es quién, y
   qué connota allí una palabra o una imagen.
6. **Criterio de marca**: tono, palabras propias y palabras que cansan, y tópicos
   del sector que hay que evitar.
7. **Elegir el flujo prioritario y el atasco**: es una decisión estratégica con
   información incompleta.
8. **Decidir qué se deja fuera**: puertas que no van ahora y cosas que no se
   dicen aunque sean verdad.
9. **Veto de verdad**: nada sin fuente, ni cifras, testimonios o historias
   inventadas por la IA.
10. **Confidencialidad caso a caso**: qué va al repositorio y qué al CRM, y qué
    material puede leer la IA.
11. **Calificar el encaje antes de vender**, y decir «esto no os lo recomiendo».
12. **La relación**: confianza, seguimiento, y cuándo hace falta acompañamiento.
13. **Su propia red**: presentar el cliente a prescriptores, tiendas, entidades y
    otros clientes del Penedès. Ninguna IA lo trae.
14. **Enseñar el oficio a ritmo humano**: desconfiar de la IA y comprobarla.

## Lógica de precio (sin IVA, a validar)

- **Principio.** Precio cerrado por lo que se entrega, no por horas. La IA reduce
  las horas, y ese ahorro llega al cliente como rapidez y como propiedad, no como
  rebaja.
- **Referencias de la casa**: tarifa N3, 80 €/h (`cost-mapa-valor.md`); S1,
  diagnóstico con mapa VNA, 1.500–3.000 €; S4, acompañamiento, 400–900 €/mes;
  «Web o herramienta hecha con IA», 2.500–8.000 €.
- **Precio de validación.** Las diez primeras sesiones y los tres primeros
  talleres van a un precio cercano a la tarifa N3. La contrapartida es concreta:
  20 minutos de conversación y, solo si el cliente quiere, la publicación del
  caso, revisada por él. Es un límite real que se cumple. Nada de cuentas atrás.

| Formato | Validación | Después | Horas de Álvaro (estimación) | €/h efectivo |
|---|---|---|---|---|
| Borrador del mapa | 0 € | 0 € | 30–35 min | — (coste de captación) |
| Sesión individual | 390 € | 690 € | ~4 h 35 | ~85 → ~150 |
| Taller de equipo (4–12 personas) | 1.200 € | 1.800 € | ~7 h 25 | ~160 → ~240 |
| Acompañamiento de 3 meses | 1.400 € | 1.400 € | ~10 h | ~140 |
| Guardas (mes) | — | 35 € | ~5 min | ~420 (la puesta en marcha va en el esqueleto) |
| Cerebro al día (mes) | — | 120 € | ~35 min | ~205 |

- **Lo que no incluye**: dominio y suscripción a la IA, a cargo y a nombre del
  cliente. GitHub y Netlify, en plan gratuito para empezar.
- **Extras**: puerta adicional, 190 €; segundo idioma, 350 €. El desplazamiento
  fuera del Penedès se cobra a precio de factura, sin margen
  (`cost-mapa-valor.md` §4).
- **Puente**: si el cliente contrata la «Web o herramienta hecha con IA» en los
  60 días siguientes, se descuenta lo pagado por la sesión o el taller.
- **Taller**: 1.800 € quedan muy por debajo del tope de 5.000 € que
  `cost-mapa-valor.md` usa para que un ayuntamiento contrate sin expediente largo
  (fuente interna; el umbral legal del contrato menor de servicios es de
  15.000 €, LCSP art. 118). Con más de 12 personas hace falta
  una segunda persona facilitando, y se presupuesta aparte.
- **Canal (a validar)**:
  - *Agencias, con Álvaro facilitando bajo la marca de la agencia*: precio
    público −20 %. El repositorio siempre es del cliente final.
  - *Agencias que facilitan ellas*: Álvaro pone el método, la consola y la
    revisión del mapa (~60 min) por una cuota fija por sesión, a fijar. Es la vía
    que escala sin horas de Álvaro en la sala. La página ya promete «precio de
    partner y tu margen, por escrito antes de empezar», con sello «A validar».
  - *Grupos de negocios*: un taller común al precio del taller, más una sesión de
    web por negocio a ~290 € (a validar). Lo puede pagar la entidad.
  - *Prescriptores*: la página no publica comisión. Para que la puerta tenga un
    tangible (Equilibri), propone con sello «A validar» media hora de revisión de
    la web propia por cada presentación que acabe en sesión. Si se decide otra
    contraprestación, se cambia ahí. Hay
    que revisar la fiscalidad y la neutralidad de gestorías y entidades públicas.
- **El borrador gratis solo se paga si convierte.** Cada borrador que no
  convierte cuesta ~30 min. Con una conversión de 1 de cada 4, la sesión de 690 €
  queda en ~115 €/h. Con 1 de cada 6, en ~95 €/h. Si baja de 1 de cada 6, hay dos
  palancas: una «lectura comentada» de 45 min a 150 € que se descuenta si se
  reserva, o un tope más bajo.
- **Escenario ilustrativo** (no es una previsión): 4 sesiones y 1 taller al mes,
  a precio después de la validación, suman 4.560 € en ~26 h de sala y
  preparación. A eso se añaden 10 «Cerebro al día» y 15 «Guardas», unos 1.725 €
  al mes en ~7 h.
- **Capacidad**: como máximo dos sesiones individuales al día, un taller por
  semana y cuatro borradores por semana. Si se llena, se dice la fecha de
  entrega, no una escasez.
- **Revisión de precios** a las diez primeras sesiones. Si nadie discute el
  precio, se sube. Si frena a más de la mitad, se revisa primero el encaje y
  después el precio.
- **Qué medir en el SOS**: horas reales de Álvaro por formato; borradores que
  acaban en sesión; % de webs publicadas dentro de la sesión; clientes con al
  menos un cambio propio en 30 días (prueba de que el oficio se queda); paso a
  acompañamiento o mantenimiento.

## Riesgos vigilados

- «En una hora» siempre va con «de construcción, dentro de una sesión de 2 h 30»
  y nunca va sola en el H1.
- Las garantías (web terminada en tres días laborables o devolución; mes extra
  del acompañamiento) garantizan entregas y funciones, nunca ventas. Llevan el
  sello «A validar» hasta que Álvaro las confirme: una devolución publicada es un
  compromiso contractual.
- `CLAUDE.md` da instrucciones, no las impone, y solo Claude Code lo carga solo.
  La página dice «no debe tocar», nombra `AGENTS.md` para otras IA y, para
  impedir de verdad, los permisos de Claude Code y la rama protegida.
- «GitHub y Netlify tienen plan gratuito» va fechado (octubre de 2026): son
  condiciones de terceros que cambian.
- Las fuentes se cargan de Google Fonts en todo el sitio. Envía la IP de cada
  visita a Google, lo que choca con el discurso de soberanía de datos (guía §10).
  Servirlas desde el dominio es una decisión de sitio, no de esta página.
- RGPD: el material del cliente pasa por una IA de terceros. Hace falta
  consentimiento explícito, nombrar al proveedor (Anthropic) en una política de
  privacidad, que hoy no existe en el sitio, sin afirmar condiciones de uso sin
  comprobarlas, y consentimiento para grabar la sesión.
- IKEA va en una línea de texto, sin logo, sin atribuir resultados y con sello
  «A validar». Faltan los años y el permiso.
- El recuadro «Lo aplicamos primero en casa» sale de una revisión del catálogo
  con la guía de estilo (`cataleg-teamtowers-2026.md` §2.5), no de un VNA formal.
  En la página lleva el sello «A validar».
- eventspenedes.com y labodegadesara.com salen sin descripción («Ver la web»)
  hasta que haya una línea validada: no se inventa qué son.

## Decisiones pendientes de Álvaro

1. Nombre: «Web de red» (alternativa: «Mapa y web»). «En una hora» o «en una
   tarde».
2. Precios: 390 → 690 €, 1.200 → 1.800 € y 1.400 €. Cuántas sesiones dura la
   validación (propuesta: 10 sesiones y 3 talleres).
3. Plazo del borrador (tres días laborables) y tope semanal (cuatro).
4. Garantías: devolución si la web no se termina por causa nuestra, y mes extra
   del acompañamiento.
5. Publicar o no la franja de mantenimiento (Guardas 35 €, Cerebro al día 120 €).
6. Una línea validada para eventspenedes.com y labodegadesara.com.
7. IKEA: los años y el permiso para usarlo en una página de venta.
8. El recuadro «Lo aplicamos primero en casa».
9. La mención a las seis agencias que llevan Fent Pinya y las condiciones de
   partner.
10. La política de privacidad que nombre al proveedor de IA.
11. La versión en catalán (condición para quitar el `noindex`).
12. Precio de partner y margen de las agencias; tangible para quien recomienda
    (propuesta: media hora de revisión por presentación que acabe en sesión).
13. Qué herramienta transcribe el audio, y nombrarla junto a Anthropic.
14. Quién paga el uso de API de la tarea mensual de «Guardas».
15. Una foto real de Álvaro en sesión y una del Penedès.
16. Una línea por proyecto de cliente (sector y qué rol ganó puerta).
17. Servir las fuentes desde el dominio en todo el sitio.

## Fase futura

Cerebro consultable con un LLM en local. Se menciona en la página como «lo que
viene» y **no se vende** hasta tenerlo probado: no aparece en los paquetes, en el
Schema ni en los precios.
