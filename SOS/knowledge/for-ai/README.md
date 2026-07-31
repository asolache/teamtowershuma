# Documentació per IAs · com llegir aquest projecte

Aquest directori és el **manual per a qualsevol IA** (Claude, GPT, altre) que hagi de contribuir a SOS. Segueix-lo abans d'escriure una línia.

## 1. Punts d'entrada (ordre de lectura)

1. **`SOS/knowledge/codex.md`** — els 18 vedes que governen tot. Lectura obligatòria per qualsevol canvi.
2. **`SOS/knowledge/dev/backlog.md`** — què s'ha fet, què queda, què està bloquejat.
3. **`CLAUDE.md`** a l'arrel — preferència de comunicació de l'usuari.
4. **`SOS/index.html`** — tot el codi. Autocontingut. `Grep` la funció que necessites.
5. **`SOS/knowledge/references/*.md`** — referents conceptuals (Verna Allee, Penrose, Ostrom…).
6. **`SOS/prompts/*.md`** — un `.md` per cada intent d'IA (Knowledge Loop del codex).

## 2. Regles no-negociables

- **Autocontingut a `SOS/index.html`** per defecte (codex V2 · Frontend-only).
- **Zero Redundancy**: si veus 2 llocs on faries el mateix, extreu un helper primer i utilitza'l.
- **W3C excel·lència**: prova la API nadiva abans d'inclourer cap dependència.
- **Signa'l tot**: qualsevol escritura al ledger passa per `pushLedger()` (signada + encadenada).
- **Local-First**: cap servidor propi de TeamTowers.

## 3. Contracte d'estil per nou codi

- Modules dins d'`<script type="module">`.
- Funcions concentrades i lligades per un helper si compartides.
- CSS al principi del fitxer amb tokens.
- Test Playwright per a cada nou model o UI a `/tmp/claude-.../scratchpad/test-*.mjs`.
- Exposar helpers testables a `window.__SOS` (línia ~3800 aprox.).

## 4. Contracte de PR

- Un PR = un tema atómic. Títol amb prefix `SOS:` + resum en una línia.
- Body: motiu · què canvia · verificació (número de tests).
- **Cada commit signat com a `Claude <noreply@anthropic.com>`** (git config, no amend).
- Rebuild de la branca a `origin/main` abans de fer PR.

## 5. Diccionari clau (evitar confusions)

- **Node**: territori (país/província/comarca/municipi/barri) O projecte (dinàmica).
- **Dinàmica** (`dynamicType`): banc de temps, biblioteca, MATRIU, energia, habitatge, cures…
- **MATRIU**: node contenidor de ventures econòmiques. Fons cooperatiu local.
- **Superheroi**: persona amb superpoders (skills al banc) + superarmes (objectes a la biblioteca).
- **Molekulon**: grup de 5-12 superheroi coordinats en un projecte.
- **Comando Molekulon**: tribu creativa global — tots els superheroi de l'ecosistema. Objectiu 150.000.
- **Sabiduria**: sistema de govern (owner + stewards + quòrum + propostes signades).
- **Guardian**: sinònim de steward de node.
- **Fons cooperatiu**: valor mobilitzat per la MATRIU (roll-up de ventures, hores, objectes, capital).

## 6. Antipatrons a evitar

- **No mutar `state.nodes[i].xxx` directament sense passar per `persist(node)`**.
- **No usar `localStorage`** (codex V9 · Zero localStorage → IndexedDB via `dbPut`).
- **No fer fetch a un tercer que no sigui `api.anthropic.com`, `github.com`, o l'atles Git-pull** sense declarar-ho al codex.
- **No inventar noms d'entitats** amb IA — el sistema té `discover_entities` verify-first per això.
- **No trencar les subs de xifratge** (envelope per membre, no passphrase compartida).

## 7. Com testejar

- Playwright + Chromium (`/opt/pw-browsers/chromium`).
- Un test per fitxer nou; regressions dels adjacents.
- `page.goto('file://...' + 'SOS/index.html')` — funciona offline.
- Per crides a IA: mock `window.fetch` per intercepció.

## 8. Rutes crítiques del fitxer (aproximades)

- **Estat + persistència**: 720-770 (`dbPut`, `dbGetAll`, `state`).
- **Identitat (did:sos + ECDH)**: 745-800.
- **Firma + cadena hash**: 800-870.
- **Xifratge (AES-GCM + envelope multi-membre)**: 820-870.
- **Sabiduria (govern + rols)**: 830-880.
- **AI adapter**: 1630-1770.
- **Comando Molekulon (cromo + roster + director)**: 1580-1720.
- **Onboarding + Cerca**: 1440-1560.

Grep sempre abans de moure res.
