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

**Nada de preguntar quién eres antes de dar valor.** Con la web del negocio y
una frase de lo que hace basta para empezar. El contacto se pide, si hace
falta, al entregar la propuesta, nunca al principio.

## Los siete pasos

### 1 · Leer lo que hay

Leer la web del negocio (y, si los hay, el catálogo o la ficha que haya enviado).
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
- Las troballas `mitjana` y `baixa` **no se esconden**: son la mitad del valor
  de la propuesta. Cada una trae su pregunta; esas preguntas van al paso 4.
- No se toca el diagnóstico para que pase. Si una regla parece equivocada para
  este caso, se dice en la propuesta y se apunta en el backlog.

### 4 · Las preguntas que tu web no contesta

Por cada rol externo: qué necesita saber para dar lo que da, y **si la web se lo
dice o no**, con la fuente del paso 1. Más las preguntas del diagnóstico. Como
mucho diez, ordenadas por lo que más valor mueve. Van en
`propuesta/preguntas.md`.

### 5 · La web que sale del mapa

```bash
node SOS/tools/web-del-mapa.js propuesta/mapa.json propuesta/web/ --llengua es --nom "Nombre del negocio"
```

Una puerta por rol que no es de casa (`--casa "Rol"` marca los de casa), HTML
del W3C sin JavaScript, JSON-LD en cada página, formularios de Netlify y
`permaweb.json` con la huella de cada fichero. **No se editan los HTML a mano:**
si algo de la web está mal, lo que está mal es el mapa.

### 6 · La propuesta, en una página

`propuesta/README.md`, marcada como **borrador**:

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

## Lo que nunca entra

- **Datos personales** de quien pide la propuesta, ni en el mapa ni en el repositorio.
- **Precios en euros** que nadie ha aprobado.
- **Un mapa que no ha pasado `revisa-mapa.js`.**
- **Un proyecto interno o una idea que no se ha validado** en un texto que va fuera.
