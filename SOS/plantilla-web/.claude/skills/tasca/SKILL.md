---
name: tasca
description: Prepara l'esborrany d'una tasca de rutina de cerebro/tasques-ia.md perquè l'accepti una persona del rol que la produeix. Fes-la servir quan toca un lliurament tangible que la IA pot esborranyar.
argument-hint: "<lliurament o id>"
---

# Preparar l'esborrany d'una tasca

La màquina proposa, una persona accepta. Aquesta skill només fa esborranys: no envia, no publica, no paga ni signa res.

## Passos

1. Llegeix `cerebro/tasques-ia.json` i busca la tasca (`$ARGUMENTS`) pel seu `id` o pel lliurament (`q`). Si n'hi encaixa més d'una, pregunta quina. Si no n'hi ha cap, digues-ho i para.
2. **Si no té `pot: true`, explica per què i para:**
   - Intangible: el fa una persona del rol, mai la IA. Cap esborrany, ni «només per ajudar».
   - Tangible sense tipus declarat, o sense mena: cal decidir-ne el tipus a la sessió i anotar-lo al mapa.
   - El tipus no surt d'una màquina: el redacta qui hi ha estat.
3. Mira què demana `cal` i pregunta a la persona el que falti. Si alguna dada porta noms de persona, demana-la per rols.
4. Escriu l'esborrany a `cerebro/esborranys/AAAA-MM-DD-<id>.md` (la data d'avui), amb la forma que diu `surt`. Comença amb aquesta capçalera, perquè digui qui l'ha fet:

   ```markdown
   ---
   tasca: <id>
   tipus: <tipus>
   de: <rol que el produeix>
   a: <rol que el rep>
   fet: esborrany fet amb IA (Claude), AAAA-MM-DD
   accepta: <rol>
   estat: esborrany
   ---
   ```

5. Cada dada que no tens, `[a completar]`. No t'inventis cap xifra, data, acord ni nom. Cap nom de persona: només rols. Ni preus pactats ni dades personals.
6. Digues qui l'ha d'acceptar: una persona del rol de `accepta`, que és qui produeix el lliurament.
7. Obre una PR amb l'esborrany, o dona el fitxer si no pots. Quan aquella persona l'accepta, a la mateixa PR passa a `estat: acceptat AAAA-MM-DD`.
8. **Fins que l'accepta, l'esborrany no existeix:** no es fa servir, no s'envia i no es publica.
