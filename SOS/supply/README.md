# Oferta comuna

Aquí hi viuen els paquets d'**habilitats i objectes** que els territoris han
decidit publicar. És el germà de `SOS/atles/`: mateix camí, mateixes regles.

## Què hi ha en un paquet

Files **agregades**: categoria, direcció (s'ofereix / es busca), municipi, node,
quantes n'hi ha i **quantes persones** — un número, mai qui. El paquet diu **on
preguntar, no a qui**.

Els camps permesos són exactament els de `PUBLIC_SUPPLY_FIELDS` a
`SOS/index.html`. Qualsevol altra cosa es descarta en llegir-lo, encara que
arribi des d'aquest repositori: confiar en l'origen és com es cola una fuita.

## Com aportar-hi

1. Al SOS: **🌐 Publica habilitats i objectes** → tria quins nodes publiquen →
   comprova la taula (això és exactament el que sortirà) → **Descarrega el paquet**.
2. Obre una *pull request* amb el fitxer en aquesta carpeta.
3. Afegeix-hi l'entrada a `index.json`:

```json
{ "name": "Alt Penedès", "file": "alt-penedes-2026-08.json" }
```

Es revisa i es publica. A partir d'aquí, qualsevol el llegeix amb
**🔎 Què hi ha a prop → Actualitza l'oferta comuna**.

## El que això no és

**No és permanent.** Si algú esborra el repositori, desapareix. És públic,
versionat, amb historial i amb un CID que prova integritat — que és molt més que
tenir el paquet al calaix, i menys que Arweave. Quan calgui permanència de debò,
el mateix fitxer es pot pinnar a IPFS o pujar a Arweave: ja porta el seu CID.

**Publicar no es pot desfer.** Un paquet que algú ja ha copiat no es retira.
