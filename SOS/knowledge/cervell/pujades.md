# De pujada · el que els projectes fills ensenyen a la matriu

> Generat per `cervell.js --recull <projecte>`. No l'editis: per adoptar o
> descartar, canvia `estat` a `pujades.json` (`adoptada <veda>` o
> `descartada <motiu>`) i torna a recollir.

## Events Penedès

### veda 4 — Un precio no lleva el IVA mezclado · proposada

Los precios van sin IVA salvo que `iva_incluido` diga lo contrario. Un precio
que a veces lo lleva y a veces no acaba sumado con otro que no lo lleva, y el
error llega a una propuesta. Viene de `CLAUDE.md` («Lo que nunca entra»).

### veda 5 — Quien paga y quien recibe el valor no son el mismo rol · proposada

El dinero viene del cliente; el intangible lo recibe el participante. Toda la
venta consiste en hacer creíble algo que va a sentir un tercero, y por eso una
propuesta a medida sin precio funciona mejor que una tarifa. Lo enseñó el mapa
de valor (`estudios/mapa-valor-eventspenedes.md`, 03/10/2026).

### veda 6 — No se cobra comisión por el trabajo de otro · proposada

Con comisión, el proveedor pagaba por ser recomendado y competía con el cliente
por el criterio del productor. Cobrando por horas ese flujo desaparece y la
relación queda recíproca. El modelo de cobro dibuja la red: se elige mirando el
mapa, no la hoja de cálculo (`desarrollo/modelo-honorarios.md`).

### veda 7 — Un modelo de honorarios se mide, no se supone · proposada

Las horas reales de cada evento se apuntan al lado de las facturadas. Es lo
único que dice si el modelo se sostiene; una estimación de horas escrita en un
plan se lee igual que una medida. La guarda es `tools/check-dedicacion.mjs`.

### veda 8 — Una red estrella necesita su segundo nodo · proposada

Casi todo pasa por el productor. El rol que más falta no es un proveedor más,
sino un segundo productor para los eventos grandes. Un mapa de valor que solo
se lee como lista de proveedores no enseña este riesgo; leído como red, sí.

### veda 9 — Una foto cedida para un dossier no está cedida para una web · proposada

Cada uso de una imagen de un tercero necesita su permiso por escrito para ese
uso. Lo que se cedió para mandar a una agencia no se puede publicar.

### veda 10 — Lo interno no sale fuera sin el guardián · proposada

Un proyecto interno en un texto externo, sin validar, es una promesa que nadie
ha hecho. Los correos pasan por `tools/check-comunicacion.mjs`, con el guardián
en `data/comunicacion.json`; ninguna IA marca la validación por su cuenta.

### producte Del formulario a la propuesta · adoptada al catàleg (17/10/2026)

### producte Tu día en una pantalla · adoptada al catàleg (17/10/2026)

### producte La red que se mantiene sola · adoptada al catàleg (17/10/2026)

### producte Tu catálogo de partners · adoptada al catàleg (17/10/2026)

### producte Leads ordenados por potencial · adoptada al catàleg (17/10/2026)

### producte Tu red en el mapa · adoptada al catàleg (17/10/2026)

## Álvaro Solache

### veda 4 — El cerebro de la web lee el codex, no lo copia · proposada

**Dicho por Álvaro el 17/10/2026** al pedir el cerebro como grafo (PR #5).
`cerebro-datos.js` lo escribe `herramientas/cerebro-codex.mjs` leyendo el codex
de cada fuente; no se edita a mano. Lo único que se escribe a mano son las capas
fijadas (`capas.json`) y lo que enseña cada veda (`sintesis.json`). Si el codex
cambia, se vuelve a generar. Es la veda 71 de TeamTowers aplicada a esta web:
una copia a mano diverge en silencio.

**Guarda:** el generador para si una veda trae un saber que no está en la lista.
Que el CI compruebe que `cerebro-datos.js` está al día queda en el backlog.

### veda 5 — Esta web es hija de la matriz: lo heredado no se repite · proposada

**Dicho por Álvaro el 17/10/2026:** «Estoy haciendo tu cerebro #codex.
Intégralo y evoluciónate» y «Sé DRY». El cerebro de este proyecto es el de
TeamTowers, instalado con `cervell.js --nou` y puesto al día con
`--actualitza`. Una regla que ya está en `vedas-heredadas.md` se cita, no se
reescribe: por ejemplo, «una cifra sin fuente no se publica» es la veda 67
heredada. Aquí solo entran las vedas que nacen de esta web, y las que valgan
para todos suben a la matriz con `cervell.js --recull`.

**Guarda:** `guardas/cervell.js --check` en CI. Y el cerebro de la web no
muestra las vedas de la plantilla (1 a 3) como propias: ya están en la matriz.

### veda 6 — La IA se declara, y lo que gasta se elige · adoptada 167
