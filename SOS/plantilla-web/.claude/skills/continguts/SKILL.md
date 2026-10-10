---
name: continguts
description: Escriu o actualitza el text de les pàgines de la web (cerebro/continguts) a partir del dossier, les fonts i el mapa. Fes-la servir després d'importar o quan cal canviar el text d'una pàgina.
argument-hint: "[pàgina]"
---

# Escriure el text de la web

Les pàgines surten del mapa. El text de dins surt d'aquí: un fitxer per pàgina a `cerebro/continguts/<id>.md`. El generador el fa HTML i no el sobreescriu mai.

## Quines pàgines

- `inici`: la portada.
- `serveis`: la pàgina de serveis.
- La porta de cada rol: el nom del seu fitxer a la web generada, sense `.html` (si hi ha `qui-compra.html`, l'id és `qui-compra`).
- Pàgines noves, amb un id curt en minúscules i guions (`qui-som`, `preguntes-frequents`) i `menu: si` perquè surtin al menú.
- Aquests id no es poden fer servir: `equip`, `registre`, `gracies`, `404`, `estil`, `web`, `index`.

Si et diuen una pàgina (`$ARGUMENTS`), treballa només en aquella. Si no, proposa la llista i comença per `inici`.

## El format

```markdown
---
titol: Qui som
menu: si
font: cerebro/fonts/web/qui-som.md, cerebro/dossier.md
fet: esborrany fet amb IA (Claude), AAAA-MM-DD
---

## Un títol de secció

Un paràgraf.
```

Només aquest Markdown: `##` i `###`, paràgrafs, llistes, **negreta**, *cursiva*, enllaços `http(s)`, `mailto:` o relatius, i imatges només relatives, dins `imatges/`. La resta surt com a text: res d'HTML.

## Passos

1. Llegeix `cerebro/dossier.md`, `cerebro/fonts/index.md`, el mapa (`cerebro/mapa-real.json`) i el contingut que ja té la pàgina, si en té.
2. Escriu només el que diuen les fonts, i posa-les a `font:`. Res inventat: ni xifres, ni clients, ni cites, ni promeses.
3. On falta alguna cosa, `[a completar]`. Digues-ho al resum.
4. Cap dada personal (noms de persona, correus, telèfons) ni cap preu pactat. Això va al CRM.
5. Escriu en la llengua de qui visita la web i amb el to que ja fa servir la casa a les fonts. Frases curtes, paraules planes.
6. Executa `node eines/genera.mjs` i mira la pàgina generada (`<id>.html`, o `index.html` per a `inici`): que es llegeixi bé i que els enllaços vagin.
7. Obre una PR amb el canvi, mai directament a la branca principal: la persona mira la vista prèvia de Netlify i decideix. **Acceptar la PR és acceptar el text**, i queda dit qui ho ha fet. Si no pots obrir-la, dona-li els fitxers perquè els pugi.
