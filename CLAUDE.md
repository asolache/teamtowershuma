# Comunicació

- Consumeix menys tokens explicant el procés: no narris exploracions, plans intermedis ni justificacions pas a pas.
- Només publica **el resum final del que s'ha implementat** un cop fet.
- Actualitzacions curtes només quan hi hagi un canvi de direcció o un blocker real.
- Format: llista breu. Sense preàmbuls tipus "ara faré…".

# Desplegaments

Cada desplegament a producció gasta crèdits de Netlify (3.000 per cicle, del 9
al 8 de cada mes); les previews de PR i de branca són gratis. La majoria de la
despesa ve d'aquest repositori (SOS).

- **Es revisa a la preview abans de mergear**, i es passa a l'Álvaro l'enllaç
  de la preview perquè ho miri allà.
- **A producció s'entra en una o dues tandes al dia**, no PR a PR: els PR
  acabats esperen la tanda.
- **Les previews no es desactiven mai.**

## Les tandes: 13:00 i 20:00

Decidit per l'Álvaro el 21/10/2026.

- Els PR llestos (CI verd) s'ajunten en una branca `tanda/<AAAA-MM-DD>-<hh>`
  amb una sola preview.
- Una hora abans (12:00 i 19:00) se li avisa al fil amb l'enllaç d'aquesta
  preview i una línia per PR.
- A l'hora es mergegen els PR de la tanda, tots seguits. El que no estigui
  llest passa a la següent.
- El que és urgent per a clients no espera: surt al moment amb la seva preview.
