# Backlog de desenvolupament SOS

Font única de veritat del desenvolupament. Cada PR mergejat es tanca; cada bloc pendent es prioritza.

## PRs mergejats (línia principal, més recents primer)

- **#57 · Xifratge multi-membre ECDH-P256** — envelope per membre, no cal passphrase compartida
- **#56 · Cerca global ⌘K + Onboarding tour** — palette + tour de benvinguda de 4 pantalles
- **#55 · Pings offer/demand descentralitzat** — matching cross-node
- **#54 · Guardian request UI** — observer demana ser Guardian; owner valida
- **#53 · Origen Comando (Mazinguer/Horacio) + Launcher global + backlog al codex**
- **#52 · Comando Molekulon view · cromos + protagonistes + director filter**
- **#51 · Fix iPad multi-select + top-20 curats + wallet passkey + multivers**
- **#50 · Veda V16 Seny/Rauxa/Castells + 3 posts blog + marketing base**
- **#48 · Home per perfils + blog intern comercial + terme "cremades" → "sobrecarregades"**
- **#47 · Federació Guardians UI (Penrose-√població + Gini)**
- **#46 · Sabiduria UI · propostes, vots signats, consell IA**
- **#45 · AI valuation assistant + arquetips vèdic/celta/andí/secular**
- **#44 · Intercooperació entre ventures (Mondragón)**
- **#43 · Kit narratiu Molekulon (UI)**
- **#42 · GitHub OAuth device flow + IA revisa PRs end-to-end**
- **#41 · 5 nous intents IA (molekulon_invite, narrative_kit, valuation, governance, pr_review)**
- **#40 · AES-GCM xifratge per node + passphrase wrap**
- **#39 · Simulador Impacte Catalunya**
- **#38 · Molekulon Shakti/Shiva + reputació verificable**
- **#37 · Guardians · federació Penrose (model)**
- **#36 · Oracle FMV + Valor del fons**
- **#35 · Sabiduria + rols + main canònic (model)**
- **#34 · Signing als ledger writes + integritat UI**
- **#33 · did:key + firma + cadena hash**
- **#32 · AI adapter DRY + codex V11-V15**

## Bloc pendent (prioritzat)

### Onada actual — user acquisition + traction
1. **Landing/onboarding més agressiu** — crear vista/pantalla dedicada a captació d'usuaris amb funcionalitats crítiques de tracció (CTA directe a crear perfil, comptador de superherois viu, testimonis).
2. **Registre d'usuaris descentralitzat** — perfil accessible des de la web SOS única, integrant amb els sistemes ja disponibles (did:key + WebAuthn passkey + Nostr NIP-05).
3. **Superarmes al perfil superheroi** *(fet a l'onada actual — cromo mostra superpoders + superarmes)*.
4. **Gamification per nivells** *(fet — Aprenent/Bronze/Plata/Or/Llegenda + reptes per desbloquejar el següent)*.
5. **Transmedia enllaços** *(fet — SoundCloud, YouTube, Amazon, Instagram al modal Comando)*.
6. **Vista territorial resum + incentiu al terreny** *(fet — panell "Baixa al terreny" a país/provincia/comarca).

### Backlog crític restant (del codex V17)
3. **Sign records via WebAuthn** (no només vinculació) — refactor de signRecord per acceptar signer alternatiu
4. **Ancoratge Nostr P1** — `wss://relay.damus.io` publicació de mainHash *(bloqueja: cal relés reachable)*
5. **Snapshot Arweave / IPFS+OTS** — notarització permanent opt-in *(bloqueja: xarxa/paga)*
6. **AI review PRs deep integration** — GitHub App webhook fluid *(bloqueja: infra externa)*
10. **Wallets W2 (Nostr NIP-07) / W3 (EIP-712)** *(bloqueja: providers)*

### Qualitative tests de l'app
- Playtest guidat: 5 persones fan el fluid onboarding + creació perfil + primer intercanvi + primera aportació signada; recollir friccions.
- A/B test del text de la home (fase llavor vs directe).
- Test de comprensió del cromo (una persona sense context: entén tier, superpoders, superarmes, level bar?).
- Test d'accessibilitat WCAG 2.1 AA (contrast, keyboard nav, screen reader).
- Test de rendiment amb 500 nodes + 5.000 apunts al ledger.
- Compatibilitat: iPad Safari, Android Chrome, Firefox desktop, Edge.

### Idees a explorar (paraking lot)
- **Federated onboarding**: quan aparelles amb un altre dispositiu, importa el seu roster de superherois com a suggerència.
- **Comando digest setmanal** — email o notificació al Guardian amb la setmana del node.
- **Multi-idioma**: primer ES i EN sobre les entrades UI, després tot.
- **Export PDF del kit narratiu** per lliurar a comunitats.
- **Widget embeded** per posar la pinya del fons cooperatiu a webs municipals.
