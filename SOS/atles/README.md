# Atles SOS — directori públic i col·laboratiu d'economia social

Aquest directori és un **bé comú**: un catàleg obert d'entitats i iniciatives del teixit
comunitari de Catalunya (bancs de temps, biblioteques de les coses, cooperatives,
associacions, ajuntaments, casals, colles…), amb **focus a l'Alt Penedès i el Garraf** però
sense excloure cap territori.

- **Descentralitzat i a cost zero.** Viu com a fitxers JSON en aquest repositori públic i
  es distribueix gratis per CDN. L'app SOS (`/SOS/`) el llegeix amb el botó **"Actualitza
  l'atles"** i el fusiona localment (guanya la versió més recent de cada entitat, LWW).
- **Local-first i privat per defecte.** Només es publica la **capa directori**: que una
  entitat existeix, el seu tipus, la ubicació i la web pública. El mapa de valor (VNA), el
  tauler i la comptabilitat de cada usuari **mai** surten d'aquí: es queden al seu navegador
  i, si de cas, se sincronitzen P2P entre gent de confiança.

## Estructura

- `index.json` — manifest: llista de packs (un per comarca).
- `<comarca>.json` — pack d'entitats d'una comarca (esquema `sos:AtlesPack`).

## Esquema d'una entitat (`sos:Entity`, JSON-LD)

```json
{
  "id": "e_<nivell>_<territori>_<tipus>_<nom>",
  "@type": "sos:Entity",
  "name": "Nom de l'entitat",
  "entityType": "ajuntament | associacio | cooperativa | banc_temps | biblioteca_coses | casal | colla | consell | …",
  "status": "existing | forming",
  "geo": { "level": "municipi", "territoryName": "Vilafranca del Penedès", "parentChain": ["Catalunya", "Barcelona", "Alt Penedès"] },
  "contact": { "url": "https://…" },
  "description": "Una frase.",
  "tags": ["…"],
  "verification": { "verified": true, "by": "…", "at": "ISO-8601", "confidence": 1 },
  "source": "pack:seed | manual | ai",
  "updatedAt": "ISO-8601"
}
```

L'`id` és **determinista** (slug de nivell + territori + tipus + nom) perquè registres
independents de la mateixa entitat **convergeixin** en lloc de duplicar-se.

## Com contribuir

1. A l'app SOS, registra o verifica entitats (marca-les **públiques**).
2. Prem **"Comparteix al commons"** → es descarrega un pack amb només la capa pública.
3. Obre una **Pull Request** afegint/actualitzant el fitxer de la comarca corresponent en
   aquesta carpeta.
4. Es revisa (curació humana, contra invencions) i es publica. Qualsevol persona el podrà
   baixar amb "Actualitza l'atles".

> Verificació: no incloguis entitats inventades. Les propostes generades amb IA entren com a
> **"per verificar"** i només s'han de publicar un cop confirmades com a reals.
