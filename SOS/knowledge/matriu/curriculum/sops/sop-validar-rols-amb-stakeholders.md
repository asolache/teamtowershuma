---
id: sop-validar-rols-amb-stakeholders
type: sop
version: v0.1
status: draft
author: "@alvaro"

name: "Validar la llista de rols VNA amb stakeholders"
purpose: >
  Procediment per validar la llista de rols VNA extreta del s-vna-role-extractor
  amb 2-3 stakeholders addicionals (no els entrevistats inicials), abans
  de procedir amb el mapeig persona-rol.

cop_ref: cop-mapejador-vna
applies_to:
  - competency: c-02.1-identify-vna-roles

effort_minutes: 60
steps_count: 6
---

# SOP · Validar la llista de rols VNA amb stakeholders

## Objectiu

Confirmar amb persones diferents de les inicialment entrevistades que la
llista de rols VNA candidats captura correctament la realitat operativa.

## Pre-requisits

- Llista de rols VNA candidats (output de s-vna-role-extractor)
- 2-3 stakeholders addicionals identificats, **diferents** dels entrevistats inicials
- 30 minuts per cada validació (15 minuts via async OK)

## Passos

1. **Preparar la llista** en format visual senzill (no JSON tècnic):
   - Nom del rol VNA en català
   - 1 frase de descripció en verbs (què fa, no què és)

2. **Compartir amb cada validador per separat** (mai en grup; evita
   anchoring): enviar la llista i 3 preguntes obertes:
   - *Reconeixes aquests rols a l'organització?*
   - *Hi ha algun rol important que no hi sigui?*
   - *Hi ha algun rol que et sembla redundant o mal formulat?*

3. **Recollir respostes** en format estructurat:
   - Rol validat: tots tres diuen sí, o ≥2 amb evidència concreta
   - Rol controvertit: 1 sí, 1 dubte, 1 no
   - Rol manca: ≥2 validadors el mencionen

4. **Sintetitzar** en un document curt (1 pàgina) amb:
   - Llista de rols validats
   - Llista de rols controvertits amb la discrepància
   - Llista de rols nous proposats

5. **Conversa amb la CoP Mapejador VNA** per resoldre els controvertits.
   Si la CoP no pot tancar-ho, queden en pending review fins que es
   pugui re-validar.

6. **Publicar llista validada** com a versió 1.0 del `role_list.json`
   del projecte, amb metadata: validators (ids anonymitzats), data,
   rols pending review (si n'hi ha).

## Criteris d'èxit

- Llista de rols validada per ≥2 stakeholders independents
- Cap rol controvertit a la versió publicada (els controvertits queden
  com a *pending* fora del JSON principal)
- Documentat el procés de validació per a auditoria

## Errades a evitar

- **No vagis amb prejudicis**: si esperes que validin tot, no validaràs
  res. Demana feedback genuí.
- **No comparteixis la llista en grup**: provoca anchoring, perdràs
  diversitat de perspectives.
- **No descartis "rols manca" per pereses**: si 2 validadors el
  mencionen, és real, encara que t'obligui a re-entrevistar.

---

*SOP v0.1 · status: draft · pendent ratificació CoP Mapejador VNA*
