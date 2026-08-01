# Auditoria dels mapes precarregats · abans i després

> Un mapa que neix ambre ensenya a la comunitat que ambre és normal.

El SOS sembra mapes de valor des de **quatre llocs diferents**, i fins ara cada
lloc tenia la seva pròpia qualitat. La conseqüència era la pitjor possible: **el
primer mapa que veu una persona nova era el més fluix de tot el sistema.**

---

## 1. D'on surt un mapa al SOS

| Font | Quan s'aplica | Quantitat |
|---|---|---|
| `LEVEL_KNOWLEDGE` | Crear un node territorial (país → barri) | 5 nivells + 23 reptes |
| `DYNAMICS` | Crear un projecte amb una dinàmica | 11 presets |
| `CRITICAL_ACTIVITIES` | Crear una venture a la MATRIU | 14 activitats |
| `PROTOTYPE_MAPS` | Instanciar un prototip de venture o un Comando | 6 prototips |

---

## 2. Resultat de l'auditoria

Mesurat amb `vnaAudit`: reciprocitat, densitat, rols aïllats, concentració al rol
més connectat i salut global sobre 100.

| Font | Salut abans | Salut després |
|---|---|---|
| `CRITICAL_ACTIVITIES` (14) | **13 – 50** | **90** |
| `LEVEL_KNOWLEDGE` · municipi | **29** | **86** |
| `LEVEL_KNOWLEDGE` · barri | 39 | 87 |
| `LEVEL_KNOWLEDGE` · comarca | 42 | 87 |
| `LEVEL_KNOWLEDGE` · província | 48 | 90 |
| `LEVEL_KNOWLEDGE` · país | *no existia* | 89 |
| `PROTOTYPE_MAPS` (6) | 63 – 80 | 93 – 95 |
| `DYNAMICS` (11) | 88 – 100 | 88 – 100 |

Reciprocitat mínima de tot el sistema: **100%**. Cap rol aïllat enlloc.

Tres troballes que val la pena no oblidar:

1. **Les activitats crítiques de la MATRIU eren les pitjors del sistema** (13/100
   les més baixes) tot i ser el mapa amb què neix *cada projecte incubat*. Tenien
   3 fluxos per a 5 rols, cap d'ells recíproc.
2. **El nivell `pais` no existia**: crear Catalunya donava un mapa buit.
3. **Triar reptes empitjorava el mapa.** Cada repte afegia fletxes d'anada sense
   retorn, així que com més t'implicaves en el diagnòstic, pitjor sortia la salut.
   Ara passa el contrari: municipi 86 → 87, província 90 → 92.

---

## 3. Per què passava · i per què no pot tornar a passar

La causa era estructural, no de redacció: **cada font declarava els fluxos en una
llista pròpia i cada camí de sembra els expandia amb el seu propi codi**. Quatre
implementacions ≈ quatre qualitats.

Ara hi ha **una sola forma canònica i un sol expander**:

```
pairs: [ [A, B, tipus A→B, etiqueta A→B, tipus B→A, etiqueta B→A], … ]
```

`mapFlowsOf(def)` és l'únic lloc que converteix una definició en fluxos, i el
fan servir els sis camins que sembren mapes: dinàmiques, prototips, ventures,
comandos de projecte, comandos d'entitat i el wizard territorial.

Escriure el retorn **obliga a pensar-lo**. Un mapa on l'ajuntament només dona i
mai rep no és un mapa incomplet: és un mapa fals.

`flows` es manté per a l'excepció unidireccional legítima, i el test comprova que
cap definició precarregada l'utilitzi per als vincles principals.

---

## 4. Llindars que cap mapa sembrat pot baixar

Comprovats a `test-mapes-tauler.mjs` sobre **les 36 definicions** alhora:

- Reciprocitat **100%**
- Densitat **≥ 40%**
- **Cap** rol aïllat
- Barreja de tangibles i intangibles
- Concentració al rol més connectat **≤ 40%**
- Salut **≥ 80/100**
- Triar reptes **mai** baixa la salut
