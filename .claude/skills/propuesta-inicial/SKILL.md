---
name: propuesta-inicial
description: Preparar la propuesta inicial de un negocio, es decir el borrador del mapa de valor, las preguntas que su web no contesta y una web propuesta que sale del mapa, revisado todo con las reglas de la casa y sin API. Úsala cuando alguien pida una propuesta, un borrador de mapa a partir de una web, «el borrador gratis», o arrancar un proyecto nuevo de mapa y web.
---

# Propuesta inicial · del sitio que hay a la web que sale del mapa

> **Lo que esta skill impide.** Una propuesta hecha a mano en tres días que
> llega con un organigrama con flechas, preguntas genéricas y una web de
> plantilla. Aquí el mapa pasa por **el mismo diagnóstico que el editor**, las
> preguntas salen de lo que la web de verdad no dice y la web sale del mapa con
> **el mismo código** que el botón «Descarrega la web». Nada se escribe dos veces.

**Sin API.** Esto lo hace la sesión de Claude que trabaja en el repositorio del
proyecto, con el cerebro que instala TeamTowers (`cervell.js --nou`), no en el
repositorio de TeamTowers. La persona
entra en ese proyecto de Claude y ve el trabajo en el hilo; la web pública no
llama a ningún modelo ni guarda ninguna clave. Integrarse con TeamTowers es
eso: el mismo cerebro, las mismas vedas, las mismas herramientas.

## Antes de nada

1. **El cerebro del proyecto**, en su orden de lectura (`CLAUDE.md` lo dice).
2. **La skill `mapa-de-valor`** (`.claude/skills/mapa-de-valor/SKILL.md`): las
   seis pasas y las diez reglas. Esta skill no las repite; las usa.
3. **El formato del mapa:** `node SOS/tools/revisa-mapa.js --exemple` imprime el
   caso del celler completo. *Un ejemplo completo vale más que una instrucción.*
4. **El sí para leer su web.** La web del negocio solo se lee con el sí por
   escrito de quien es su titular, para ese mismo dominio, y ese sí va al CRM.
   Sin él se trabaja solo con lo que la persona ha enviado.

**Nada de preguntar quién eres antes de dar valor.** Con la web del negocio y
una frase de lo que hace basta para empezar. El contacto se pide, si hace
falta, al entregar la propuesta, nunca al principio.

## El atajo: lo mecánico, de un solo orden

```bash
node SOS/tools/proposta.js propuesta/ --llengua es --nom "Nombre del negocio" [--baixa https://su-web.example --autoritzat su-web.example]
```

Lee `propuesta/fuentes/` (las páginas guardadas, el catálogo, el CSS, el logo en
SVG). Con `--baixa` las descarga, solo con `--autoritzat` y el mismo dominio: el
sí por escrito de quien es su titular, que va al CRM y no a ningún repositorio.
Respeta robots.txt y espera un segundo entre peticiones. Escribe `analisis.md` (quién sale y
qué se da, con la frase donde sale, y lo que la web no dice), propone
`marca.json` y un esbozo de mapa, revisa el mapa y saca la web: a `web-esbozo/`
mientras no haya un `mapa.json` que pase las reglas duras, y a `web/` cuando lo
hay. `estado.md` dice lo que falta. Sale con 3 mientras solo haya esbozo.

Si el entorno no deja descargar la web (un fallo de red o del entorno, no de
robots.txt) y hay ese sí, se puede leer con la herramienta de lectura web, con
las mismas reglas: primero robots.txt, solo el dominio del sí, solo lo que
robots.txt deja y una página cada vez. Si `proposta.js` dejó una página fuera
por robots.txt o porque «porta fora del lloc», no se lee por otro camino: se le
pide a la persona. Lo leído se guarda en `fuentes/` como `.md`, diciendo que es
un resumen y no el texto literal. Lo que queda es criterio, y son los pasos de abajo: **el mapa
(pasos 2 y 3) y la marca (paso 5)**. `proposta.js` no inventa intangibles: por
eso el esbozo sale siempre provisional.

## Los siete pasos

### 1 · Leer lo que hay

Leer la web del negocio, solo con su sí (ver «Antes de nada»), y el catálogo o
la ficha que haya enviado, si los hay.
Escribir en `propuesta/fuentes.md` **qué se leyó, de dónde y en qué fecha**, y
lo que dice de cada actor: quién compra, quién revende, quién recomienda, quién
suministra, quién trabaja, qué lugar o comunidad lo sostiene.

> Lo que no está en ninguna fuente no se inventa: va como pregunta (veda 61 y
> «lo que no se sabe va a `null`»).

Si `propuesta/` no existe, se crea y se declara en `saber/taxonomia.md`
(`- \`propuesta\` · obra · La propuesta inicial: fuentes, mapa, preguntas y web`),
o el CI fallará por carpeta sin cara.

### 2 · El borrador del mapa

Con la skill `mapa-de-valor`: **un flujo**, no el negocio entero. La frontera
(`abast`) en una frase; de seis a doce roles dichos por lo que **hacen**;
cada vínculo con lo tangible y lo intangible en las dos direcciones; los
procesos y la secuencia. Guardarlo en `propuesta/mapa.json` con el formato del
ejemplo.

### 3 · Revisarlo con las reglas de la casa

```bash
node SOS/tools/revisa-mapa.js propuesta/mapa.json
```

- **Si sale provisional, no se entrega:** hay una regla dura abierta. Se corrige
  el mapa y se vuelve a revisar.
- Una troballa de conversión («quién pagaría por…») se mira contra lo que el
  negocio **ya cobra** (paso 1) antes de proponerla como nueva: a veces ya es un
  servicio que no llega a quien lo recibe.
- El diagnóstico habla en catalán: las troballas se traducen a la lengua de la
  propuesta, sin cambiarles el sentido.
- Las troballas `mitjana` y `baixa` **no se esconden**: son la mitad del valor
  de la propuesta. Cada una trae su pregunta; esas preguntas van al paso 4.
- No se toca el diagnóstico para que pase. Si una regla parece equivocada para
  este caso, se dice en la propuesta y se apunta en el backlog.

### 4 · Las preguntas que tu web no contesta

Por cada rol externo: qué necesita saber para dar lo que da, y **si la web se lo
dice o no**, con la fuente del paso 1. Más las preguntas del diagnóstico. Como
mucho diez, ordenadas por lo que más valor mueve. Van en
`propuesta/preguntas.md`.

### 5 · La web que sale del mapa, con su cara

Revisar `propuesta/marca.json` (lo propone el análisis; solo lo que dicen las
fuentes):

- `color`, `lletra` (`sans`, `serif`, `rodona`, `mono`), `forma` (`rodona`,
  `recta`) y `logo` (un SVG, relativo a `marca.json`). Si el color no se lee
  sobre el fondo, la web lo ajusta sola.
- `lema` y `presentacio`, con las palabras del negocio.
- `portes`: para cada rol del mapa, **el nombre corto del menú** («Catas»,
  «Restaurantes»: las palabras de su menú actual) y una `intro`.
- `contacte`: dirección, teléfono y horario del negocio, si la web los publica.

```bash
node SOS/tools/proposta.js propuesta/ --llengua es --nom "Nombre del negocio"
```

(o, solo la web: `node SOS/tools/web-del-mapa.js propuesta/mapa.json propuesta/web/ --llengua es --nom "…" --marca propuesta/marca.json`)

Una puerta por rol que no es de casa (`--casa "Rol"` marca los de casa), HTML
del W3C sin JavaScript, JSON-LD en cada página, formularios de Netlify y
`permaweb.json` con la huella de cada fichero. **No se editan los HTML a mano:**
si algo de la web está mal, lo que está mal es el mapa o la marca.

### 6 · La propuesta, en una página

`propuesta/README.md`, marcada como **borrador**. `proposta.js` escribe uno
con esta estructura mientras lleve su línea de marca; al hacerlo tuyo, borra
esa línea y ya no se toca (igual con `preguntas.md`):

1. En una frase, el flujo que se ha mirado y por qué ese.
2. El mapa: roles y lo que se dan, y cómo abrirlo en el editor
   (https://teamtowershuma.com/SOS/vna-suport.html, botón «Obre un fitxer .json»).
3. Lo que el diagnóstico ha encontrado: las tres para empezar.
4. Las preguntas (enlace a `preguntas.md`).
5. La web propuesta (enlace a `web/index.html`, que se abre con doble clic).
6. Los siguientes pasos **por flujos**: sesión, taller o acompañamiento. **Sin
   importes**: el precio sale del presupuesto por flujos y no se escribe aquí.

### 7 · Dejarlo mejor

- Volver a generar el mapa y la página del cerebro (`node guardas/cervell.js`) y
  pasar `--check`.
- Una entrada en el backlog con lo que queda abierto.
- Si algo ha fallado de verdad, o una regla no encajaba, va al contrato
  («Los antipatrones que hemos cometido de verdad») y, si vale para todos los
  proyectos, se propone a TeamTowers como veda. Así vuelve heredada a todos.

## Lo que se entrega: el backoffice, no una web nueva

Si el negocio **ya tiene web**, la web que sale del mapa es una propuesta de
mejora, no un sustituto. Lo que se le entrega es su backoffice: la carpeta del
cerebro entera, que se abre por `EMPIEZA-AQUI.html` (lo escribe `proposta.js`
en la raíz). Esa página, con su marca, le dice qué hacer la primera media hora,
cada mes y con Claude, y lleva la propuesta y las preguntas tal como son.

Antes de enviarla: `node guardas/cervell.js --check` en verde, y ningún dato
personal ni importe en la carpeta.

## Enviar antes de la visita · la página del lead

Cuando un lead va a recibir visita, antes se le manda una página con el x % de
su mapa que el sistema ya puede preparar. Así la visita se dedica a lo
estratégico y lo táctico. Lo decidió Álvaro el 17/10/2026; el detalle está en
el backlog («La pàgina per al lead»). Se hace desde el repositorio de
TeamTowers, no desde el del cliente.

1. **El sí, por escrito.** Sin el sí del lead no se lee su web. El correo de
   «Pedir mi borrador» de /mapa-web/ ya lo pide. El sí va al CRM.
2. **El borrador interno.** La carpeta del lead va **fuera** del repositorio
   de TeamTowers, que se publica: si está dentro, no se escribe nada. `--lead`
   escribe `lead.html`, con «BORRADOR INTERNO» arriba y sin botón:

   ```bash
   node SOS/tools/proposta.js ../leads/<negocio>/ --llengua es --nom "Nombre del negocio" --lead
   ```

   Se abre y se lee entera, en el móvil.
3. **Revisarla.** Hace falta un `mapa.json` que pase las reglas duras: el
   esbozo no se envía. En castellano, las tres preguntas para la visita van en
   `preguntas-visita.md`, una por línea, numerada o con guion, porque las del
   diagnóstico salen en catalán. Después, `--lead --revisat`. Si sale con 4, la
   página no se ha escrito y la consola dice por qué:
   - no hay `mapa.json`, o es provisional;
   - falta `preguntas-visita.md`, o está vacío;
   - hay un correo, un teléfono, un importe o una frase copiada de su web en el
     mapa, en las preguntas o en `--nom`;
   - la carpeta está dentro del repositorio.

   Se corrige lo que señala la consola (`mapa.json`, `preguntas-visita.md` o
   `--nom`), nunca la página.
4. **Publicarla** en el repositorio privado de las páginas de leads, con su
   sitio de Netlify, en una carpeta con la referencia de `lead.json` como
   nombre. Nunca en el repositorio público. Ese repositorio lo crea Álvaro
   (paso 7 del backlog).
5. **Anotarlo en Zoho:** «enviado» y la fecha, a mano hasta que haya permiso
   para actualizar leads (paso 9). Si el lead responde en /visita/, llega como
   lead nuevo con la referencia de su página. Es la única forma de saber que la
   ha abierto: la página no lleva ningún píxel.
6. **Borrarla después de la visita.**

## Lo que nunca entra

- **Datos personales** de quien pide la propuesta, ni en el mapa ni en el repositorio.
- **Precios en euros** que nadie ha aprobado.
- **Un mapa que no ha pasado `revisa-mapa.js`.**
- **Un proyecto interno o una idea que no se ha validado** en un texto que va fuera.
