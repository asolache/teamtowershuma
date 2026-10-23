# L'estructura estàndard d'un cervell

> Decidit per l'Àlvar el 23/10/2026: «ja està tot inventat». L'estructura de
> carpetes d'un cervell no s'inventa: es pren de taxonomies que ja existeixen i
> s'adapta a avui. El que és nostre és el manifest (`cervell.json`), que diu on
> és cada cosa, i la guarda (`cervell.js --check`), que comprova que és veritat.

## D'on surt

| Per ordenar… | Fem servir | Per què |
|---|---|---|
| Les àrees de l'organització | **APQC Process Classification Framework**, resumit en els 12 rols de la taxonomia universal | Recursos humans, màrqueting, vendes, producció, operacions, logística, finances… ja estan classificats i provats en milers d'empreses i administracions |
| El cicle de vida de les coses | **PARA** (projectes, àrees, recursos, arxiu) | Separa el que té data de fi del que es manté sempre |
| Els textos de saber | **Diátaxis** (tutorial, guia pràctica, referència, explicació) | Cada document sap si ensenya, resol, informa o explica |
| La capçalera de cada document | **Dublin Core** (títol, autor, data, tipus, tema, drets) | L'estàndard de metadades de biblioteques i arxius; qualsevol IA l'entén |
| El mapa de valor | **VNA de Verna Allee** | Ja és el nostre mètode |

## L'arbre

```
cervell.json        el manifest: on és cada peça
CLAUDE.md           com es treballa amb la IA
saber/              el cervell: codex, taxonomia, MAPA, contracte de la IA, backlog, folksonomia
areas/<rol>/        el que es manté sempre, una carpeta per àrea en ús
proyectos/<nom>/    el que té principi i fi
recursos/           material de referència
mapa/               el mapa de valor (el JSON de l'editor)
guardas/            les eines que ho comproven
```

Els noms de carpeta van en la llengua del cervell (la plantilla és en
castellà: `areas`, `proyectos`, `recursos`, `guardas`). El manifest diu quina
és la carpeta de les àrees (`"arees": "areas"`) i quines carpetes porten
documents amb capçalera (`"documents": ["areas", "proyectos"]`).

## Les àrees: els dotze rols

Una subcarpeta d'`areas/` ha de ser un dels rols de
`taxonomia-universal.json`. Val el nom en català, en castellà, en anglès o
qualsevol àlies: `ventas`, `vendes`, `sales` o `comercial` són la mateixa àrea.
Una carpeta que no és cap rol fa petar la guarda.

| Rol | ca | es | APQC |
|---|---|---|---|
| strategy | estrategia | estrategia | 1.0 Visió i estratègia |
| communication | comunicacio | comunicacion | 3.0 (part) i relacions externes |
| marketing | marqueting | marketing | 3.0 Màrqueting |
| sales | vendes | ventas | 3.0 Vendes |
| finance | finances | finanzas | 9.0 Recursos financers |
| logistics | logistica | logistica | 4.0 Lliurament de productes físics |
| production | produccio | produccion | 2.0 Desenvolupament de productes i serveis |
| operations | operacions | operaciones | 5.0 Lliurament de serveis, 6.0 Atenció al client |
| people | persones | personas | 7.0 Capital humà |
| network | xarxa | red | 13.0 Capacitats de negoci (aliances) |
| systems | sistemes | sistemas | 8.0 Tecnologia de la informació |
| legal | legal | legal | 11.0 Riscos, compliment i legal |

## Tres regles

- **Només les carpetes que es fan servir.** Una àrea apareix quan hi entra el
  seu primer document. No es creen carpetes buides per completar la llista.
- **Sense carpeta d'arxiu.** El que és vell no es mou: la capçalera passa a
  `estado: superado`. Així no es trenca cap enllaç, i el mapa ho mostra.
- **Res no es mou sense dir-ho.** Aplicar l'estàndard a un cervell que ja
  existeix només hi afegeix el que falta (`cervell.js --actualitza`); moure un
  fitxer és decisió de qui en té cura.

## La capçalera

És el tronc comú de `taxonomia-universal.json` (tipus, de qui, rol, fase, qui
ho veu, estat) més les etiquetes lliures de la folksonomia. Els camps es
corresponen amb Dublin Core: `tipo` → *type*, `rol` → *subject*, `de` →
*creator*, `visible` → *rights*. Un document d'`areas/ventas/` porta `rol:
ventas` (i pot portar-ne més).

## Cervells que ja hi són

TeamTowers Humà no es reorganitza: el seu manifest ja diu on és cada cosa.
Els cervells fills reben aquest fitxer heretat a `saber/heredado/` amb
`--actualitza`, i adopten l'arbre quan qui en té cura ho decideix.
