---
name: importa
description: Porta al cervell el que ja hi ha (la web d'ara, documents, un CSV) i escriu el dossier amb la font de cada afirmació. Fes-la servir el primer dia o quan arriba material nou.
argument-hint: "<url o carpeta>"
---

# Importar el que ja hi ha

Que tot el que se sap del negoci sigui a `cerebro/fonts/`, i que `cerebro/dossier.md` ho resumeixi dient d'on surt cada cosa.

## Passos

1. **Importa.** Executa `node eines/importa.mjs $ARGUMENTS` (Node 18 o més nou; `--max 30` limita les pàgines). Escriu `cerebro/fonts/web/`, `cerebro/fonts/docs/`, `cerebro/fonts/dades/`, `cerebro/fonts/index.md` i `cerebro/fonts/fonts.json`.
   - **Una web, només la de qui t'ho demana i amb el seu permís:** afegeix `--autoritzat <domini>` (el mateix domini que llegeixes). Si no és la seva web, para.
   - **D'una taula (.csv) només entra la capçalera** i quantes files té. Pregunta quines columnes calen i torna-la a importar amb `--columnes "a,b"`. Les de persona no hi entren mai.
   - Si no pots executar ordres (per exemple, a claude.ai), demana a la persona que t'enganxi o pugi el text de les pàgines i dels documents. Escriu tu els fitxers, amb el mateix format: un `.md` per font a `web/`, `docs/` o `dades/`, que comença així, i afegeix cada font a `cerebro/fonts/index.md`:

   ```markdown
   ---
   font: https://la-web-actual/serveis (o el nom del fitxer)
   tipus: web
   titol: Serveis
   importat: AAAA-MM-DD
   ---
   ```

   `tipus` és `web`, `doc` o `dades`.
2. **Llegeix `cerebro/fonts/index.md`**, i després les fonts que hi surten.
3. **El que no s'ha pogut llegir.** A `cerebro/fonts/fonts.json`, la llista `fora` diu què ha quedat fora (els PDF i els Word, per exemple). Fes-ne la llista i demana-ho a la persona, enganxat com a text o pujat.
4. **Escriu o actualitza `cerebro/dossier.md`:** què és el negoci, què ofereix, a qui i com hi treballa. **Cada afirmació porta l'enllaç a la seva font**, per exemple `([font](fonts/web/serveis.md))`. Sense font, no s'escriu: va a la llista «Per confirmar», al final. Si el dossier ja existeix, conserva el que hi ha i afegeix-hi.
5. **Cap dada personal.** L'importador amaga correus i telèfons: no els tornis a posar. No copiïs noms de persones, ni de clients ni de l'equip: parla de rols. Els preus pactats i els contractes van al CRM.
6. **Si encara no hi ha mapa** (`cerebro/mapa-real.json`), proposa'n un esborrany a `cerebro/proposta-mapa.json`, amb el format de l'editor del mapa de valor:
   `{"abast": "…", "roles": ["…"], "pairs": [["A", "B", "tangible", "el que va d'A a B", "intangible", "el que torna de B a A"]], "processos": [{"id": "…", "nom": "…", "d": "…"}], "seq": {"A→B": ["id del procés", 1]}, "troballes": [{"t": "…", "d": "…"}], "dubtes": []}`
   - A `seq`, cada flux porta `[procés, pas]` o `"sempre"`.
   - De 6 a 12 rols. Un rol és el que algú fa, no una persona ni un càrrec.
   - Com a mínim un terç dels lliuraments, intangibles.
   - Tot vincle és recíproc: cada parell porta un lliurament en cada sentit.
   - Cap nom propi de persona ni d'empresa.
   - És una proposta. La persona la carrega a l'editor i es valida a la sessió. No la copiïs a `mapa-real.json`.
7. **Acaba amb un resum:** què s'ha importat (quantes fonts de cada tipus i quantes dades amagades), què falta i la llista «Per confirmar».
