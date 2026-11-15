# L'aigua solar · la xarxa de professionals certificats per disciplina

> **Demanat per l'Àlvar el 14/11/2026:** posar a la matriu el projecte
> d'Espanya d'un fabricant de plantes solars de depuració i dessalinització
> d'aigua «creant la xarxa de professionals certificats per disciplina». Per a
> ell és la joia de la corona del holding.
>
> **Això és un esborrany per validar, no una sessió.** El mapa el dibuixa qui
> hi és. El nom del fabricant, l'acord i qualsevol xifra (comissions, preus,
> marges) viuen al repositori privat d'estratègia (`holding/negocio/`) i no
> surten d'allà fins que el fabricant confirmi l'aliança i l'Àlvar ho digui.

## Què és

Una xarxa de professionals de Catalunya i Espanya que **venen, instal·len i
mantenen plantes d'aigua amb energia solar**: dessalinització per osmosi
inversa i depuració, sense bateries ni xarxa elèctrica, amb monitoratge a
distància. Clients: municipis, hotels i càmpings, finques amb pou salobre,
comunitats sense aigua bona.

**El que la fa diferent d'un distribuïdor:** ningú no ho fa tot. Cada obra la
fan professionals de diverses disciplines, **cadascun certificat en la seva**
per l'evidència del que ha fet, i la xarxa —no una empresa— és qui respon.

## Què ja existeix i no es torna a fer (DRY)

| Peça | On viu |
|---|---|
| Els nivells N0 a N3 i la certificació per evidència al ledger | `SOS/formacio.html` («Els 4 nivells») · `negoci/formacio-mentoria.md` §4c |
| L'escala N1, N2, N3 per contractar per hores | `negoci/cost-mapa-valor.md` |
| L'itinerari adaptat a partir del ledger | El launcher del SOS, «Prepara la meva mentoria» |
| Un cervell per professional, exportable a LMS (SCORM 1.2) | `SOS/cervell.html` · `cervell/` |
| La fitxa de proveïdor i l'espai de partner | Events Penedès · `netlify/functions/espai-partner.mjs` |
| L'embut comú: valor, quota, web pròpia | `vision/embut-comu.md` |
| Comunitat energètica i autoconsum compartit | `SOS/energia.html` |
| Finançadors i aliats de la regió | `vision/mapa-estrategic-regio.md` |
| Oficis i professions | `professions.md` (el genera `build-molekulandia.js`) |
| El mapa de valor i les seves regles | `SOS/vna-suport.html` · `tools/build-vna-suport.js` |

**El que aquesta obra afegeix:** les disciplines d'un ofici nou (l'aigua
solar) i l'evidència que tanca cada nivell en cadascuna. Ni codi nou ni un
altre sistema de certificats: el mateix ledger i els mateixos nivells.

## Les disciplines

| Disciplina | Què fa a l'obra | Evidència N1 | Evidència N2 |
|---|---|---|---|
| **Diagnosi del lloc** | La fitxa del lloc: font d'aigua, salinitat, altura, distàncies, consum, sol | Una fitxa completa validada per un N2 | Cinc fitxes que han acabat en oferta |
| **Fotovoltaica** | El camp solar i el cablejat en continu | Un muntatge tutelat | Una planta en marxa signada pel client |
| **Hidràulica** | Captació, bombament, canonades i dipòsits | Un muntatge tutelat | Una xarxa de distribució en marxa |
| **Tractament d'aigua** | Osmosi, prefiltres, UV, analítiques | L'analítica abans i després d'una planta | El protocol de qualitat d'una planta signat |
| **Electricitat i control** | Quadre, sensors i telemetria | Una posada en marxa tutelada | Una planta monitorada a distància un any |
| **Operació i manteniment** | Visites, recanvis, avisos abans de l'avaria | Un pla de manteniment fet | Un any de manteniment sense parada no avisada |
| **Tràmits i finançament** | Autorització de captació, control sanitari, subvencions | Un expedient presentat | Un expedient aprovat i justificat |
| **Comunitat de l'aigua** | Qui en fa ús, com es paga, el quiosc d'aigua i la governança | Una assemblea o sessió feta | Un model de pagament funcionant |

**N3, a totes les disciplines:** forma i certifica altres. L'evidència és la
mateixa que a la resta del SOS: dos casos tutelats amb el seu recorregut al
ledger. **N0** és el perfil i la formació oberta.

Els llindars d'aquesta taula són una proposta: els ha de validar el fabricant
(la seva formació tècnica en pot ser l'N1) i un primer grup d'instal·ladors.

## El mapa de valor de la xarxa

**Abast.** Del moment en què un lloc sense aigua bona busca solució fins que la
planta dona aigua cada dia i es manté, fet per una xarxa de professionals
certificats.

| De | A | Tangible | Intangible de tornada |
|---|---|---|---|
| Qui fabrica la planta | La xarxa | La planta, la formació tècnica, el monitoratge | El que demana el mercat mediterrani |
| La xarxa | Qui necessita aigua | La diagnosi, l'oferta i la planta en marxa | La confiança per tornar a trucar |
| Professional certificat | La xarxa | L'obra feta en la seva disciplina | La reputació del segell |
| La xarxa | Professional certificat | Encàrrecs i formació | Pertinença i un ofici amb futur |
| Qui autoritza | Qui necessita aigua | L'autorització i el control sanitari | Casos d'aigua neta sense xarxa elèctrica |
| Qui finança | Qui necessita aigua | La subvenció o el préstec | L'impacte justificat |
| La gent que beu i rega | Qui recomana | La història de l'aigua recuperada | Veu i visibilitat per al poble |
| Qui recomana | La xarxa | La presentació a qui té el problema | Una solució que pot recomanar sense risc |

Les troballes que ja es veuen:

1. **El node que avui no és de ningú és la xarxa mateixa.** Hi ha fabricant i
   hi ha clients possibles; no hi ha qui ajunti els professionals.
2. **L'avís abans de l'avaria es regala.** Empaquetat amb el monitoratge és un
   contracte de manteniment, l'únic ingrés recurrent de la línia.
3. **La història de l'aigua recuperada no la recull ningú.** És la porta a qui
   recomana: municipis, entitats i la xarxa de la casa.

El mapa complet, amb les seqüències, és al repositori privat i passa les regles
dures de `revisa-mapa.js`.

## Com encaixa a l'embut comú

| Pas | Per al lloc que necessita aigua | Per al professional |
|---|---|---|
| **1 · Primer, valor** | La diagnosi del lloc i una lectura del que li cal, sense compromís | La formació N0 oberta i el seu cervell gratis |
| **2 · Una pàgina al nostre entorn, amb quota** | El seguiment de la seva planta a la web de la xarxa | La seva fitxa de professional certificat, amb disciplines i nivell, que es manté sola |
| **3 · La seva pròpia web** | — | La seva web i el seu cervell, amb el segell de la xarxa |

## Com ingressa (sense xifres)

- Per obra: marge o comissió sobre la planta, i l'obra i el muntatge.
- Recurrent: el manteniment amb monitoratge i la quota de la fitxa del
  professional.
- Formació i certificació: els nivells N2 i N3, com a la resta del SOS.

Els imports viuen al pla de negoci únic, al repositori privat.

## El que falta decidir

- Que el fabricant confirmi l'aliança per a Espanya, i amb quina forma
  (decisió d15 del holding).
- Quin primer grup d'instal·ladors valida les disciplines i els llindars.
- Si la xarxa és una cooperativa de professionals, una marca del holding o
  totes dues coses.

## Següent pas

1. L'Àlvar parla amb el fabricant (repositori privat, `boreal-light.md`).
2. Obrir el projecte de Claude Code de la línia, que hereta aquest cervell amb
   `cervell.js --actualitza`.
3. Amb el primer instal·lador, la primera fitxa del lloc i la primera evidència
   N1 al ledger.
