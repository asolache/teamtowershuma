# El dossier personal · el que aportes tu, no el ledger

> El ledger diu **què has fet**. El dossier diu **qui ets i què saps fer**
> encara que el SOS no ho hagi vist mai.

Fins ara el perfil d'una persona al SOS només es podia omplir amb activitat
registrada: ofertes, objectes, hores, apunts signats. Això és sòlid però té un
forat evident — **algú que arriba avui no té res**, i el sistema no en sap res
tot i que porta vint anys sent lampista, monitora de lleure o cuinera.

El dossier és aquesta segona font. No substitueix el ledger: hi conviu, amb un
ordre de prioritat explícit.

---

## 1. Què hi ha

| Peça | Què és | Per a què serveix |
|---|---|---|
| CV o trajectòria | Text lliure, enganxat o importat | Material perquè la IA escrigui el personatge |
| Superpoders propis | Skills fora de la llista dels 20 | Es publiquen com a ofertes al banc de temps |
| Recursos | Espais, vehicles, eines, equips | Es publiquen com a objectes a la biblioteca |
| Què vols aprendre | Necessitats declarades | Base de matching futur |
| Disponibilitat i idiomes | Text curt | Context per a la IA i per a qui et busca |
| Data de naixement | Opcional | Senyals simbòlics, com a desempat suau |
| Arquetips declarats | Fins a 3 dels 12 del panteó | Afinitat i lloc al Comando |
| Personatge | Àlies, origen, poders, ombra, lema, primera missió | El cromo complet |

---

## 2. La garantia de privadesa és estructural, no una promesa

El dossier es desa amb `type:'dossier'`, i aquest tipus és a `PRIVATE_DB_TYPES`.
El filtre d'arrencada exclou aquests registres de `state.nodes`, i **tot el que
surt del navegador surt de `state.nodes` i `state.entities`**: el sync P2P
(`syncBroadcast`), el pack públic (`toPublicPack`) i les còpies compartides.

Per tant el CV no pot filtrar-se ni per error: no és que es decideixi no
enviar-lo, és que no és a cap de les estructures que s'envien.

Del dossier només en surt el que tu acceptes explícitament, i quan surt ho fa
convertit en el que el sistema ja sabia manejar: **una oferta o un objecte**.

> Efecte lateral d'aquesta feina: les *narratives* (`type:'narrative'`) sí que
> entraven a `state.nodes` i, per tant, viatjaven pel sync. Ara també queden fora.

---

## 3. La IA no pot inventar

L'intent `character_dossier` rep només material real —CV, skills, recursos,
arquetips declarats i evidència comptable— i el seu prompt de sistema té quatre
regles dures:

1. **No inventar fets biogràfics.** Millor un origen curt i cert.
2. **Cada poder ha de dir d'on surt.** El camp `evidence` no és decoratiu.
3. **L'ombra no és un defecte inventat**: és l'excés del propi poder.
4. **La primera missió ha de ser possible aquesta setmana**, al territori real.

El que la IA detecta al CV entra com a **proposta**, mai directament: apareix
com a etiqueta acceptable i només s'afegeix si la persona hi clica.

I la IA no és un peatge: el lector local (`parseCVLocal`) fa una passada de
vocabulari dins la pàgina, sense cap crida a internet, i proposa skills,
recursos i idiomes. Qui no té clau d'API té el dossier igualment.

---

## 4. L'ordre de prioritat es manté

`archetypeAffinity` pondera, i ara ho fa comptant per separat:

1. **Evidència** (ledger, ofertes, rols, ventures) — pes 2 a 4 per senyal.
2. **Declaració** (arquetips triats al dossier) — 5 / 4 / 2 segons l'ordre.
3. **Símbols** (zodíac, calendari xinès) — 2, i sempre marcats com a aproximats.

El camp `evidenceBased` només és cert si el guanyador té **evidència** per sobre
del llindar. Una persona que declara molt i no ha fet res encara surt col·locada
al panteó, però el sistema no fingeix que això sigui evidència.

---

## 5. Per què això incentiva l'ús

La completesa del dossier no és una barra decorativa: **cada peça diu què
desbloqueja**.

- Superpoders → apareixes als pings d'oferta ↔ demanda.
- CV → la IA pot escriure't el personatge amb material real.
- Recursos → les ventures de la MATRIU poden mobilitzar el que tens.
- Arquetip → el teu lloc al panteó i al Comando.
- Personatge → cromo complet amb àlies, origen i primera missió.

Qui omple el dossier no obté una barra al 100%: obté que el sistema el trobi.
