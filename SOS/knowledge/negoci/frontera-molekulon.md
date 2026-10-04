# La frontera amb molekulon.org

> **Per què existeix aquest fitxer.** El 04/10/2026, unificant els menús, es
> va anar a posar un 301 des de `teamtowershuma.com/molekulandia` cap a
> `molekulon.org/molekulandia`. L'altra casa **ja en té un cap aquí**. Dos
> fitxers correctes, cada un al seu repositori, i el navegador donant voltes
> fins que el límit de redireccions el talla. No ho hauria vist cap guarda
> d'aquesta casa, perquè la meitat de la regla viu a l'altra.
>
> El pla de setembre (`vision/molekulon-org-pla.md` §2.3) deia que
> `/molekulandia`, `/molekulon` i `/escola` passarien a 301 cap a l'altra casa.
> **Aquella decisió no s'ha complert i no s'ha de complir**: l'altra casa va
> decidir el contrari i ho té escrit. Aquest fitxer és el que manda.

## Qui és canònic de què

| | **molekulon.org** | **teamtowershuma.com** |
|---|---|---|
| **La ficció i els mitjans** | `/` la tesi dels 150.000 · `/historia` · `/personatges` els 14 herois · `/peli` el guió de 15 plans · `/musica` els 11 videoclips · `/comic` | — |
| **Les eines i el programa** | — | Molekulandia · l'estat líquid · La Fàbrica de Superherois · el joc · el banc de temps · la biblioteca · la formació · el blog · el SOS |

La regla, en una frase: **l'altra casa té la història; aquesta té el que es fa
servir i el que es ven.**

### Les seves pàgines, declarades

Això **ho llegeix una guarda** (`build-nav.js --check`), i per això és una
llista i no prosa: la porta de Molekulon no pot portar a una adreça que allà no
existeixi. Un destí inventat no peta — dona un **404 amb el nostre logotip a la
casa del veí**. Llegit de `asolache/molekulonorg@f3b7971`:

```
MOLEKULON-PAGINES
/
/historia
/personatges
/peli
/musica
/comic
```

## El que l'altra casa envia cap aquí

Llegit de `asolache/molekulonorg`, fitxer `_redirects`, revisió `f3b7971`:

```
/molekulandia   https://teamtowershuma.com/molekulandia   301
/estat-liquid   https://teamtowershuma.com/molekulon      301
/escola         https://teamtowershuma.com/escola         301
/formacio       https://teamtowershuma.com/formacio       301
/banc-temps     https://teamtowershuma.com/banc-temps     301
/biblioteca     https://teamtowershuma.com/biblioteca     301
/joc            https://teamtowershuma.com/joc            301
/blog           https://teamtowershuma.com/blog           301
/sos            https://teamtowershuma.com/sos            301
```

I les seves sis pàgines ens enllacen **45 vegades** (21 a `/sos`, 12 a l'arrel,
4 a `/molekulandia`, i una cada una a `/molekulon`, `/joc`, `/formacio`,
`/escola`, `/blog`, `/biblioteca`, `/banc-temps`).

> **La regla que se'n deriva, i té guarda.** Cap d'aquestes nou adreces pot
> tornar-se a enviar cap allà des d'aquí. `build-nav.js --check` les llegeix
> d'aquest fitxer i ho comprova contra `_redirects`.

## El que marxa d'aquí, i és l'únic

**`SOS/comando.html`.** La tesi dels 150.000, els sis eixos, els catorze herois
i els onze vídeos són, a l'altra casa, la portada més `/personatges` més
`/musica`. *Un lloc que diu dues coses no en diu cap*, i la que té els mitjans
és la seva. `/comando`, `/sos/comando` i `/SOS/comando.html` passen a 301 cap a
`molekulon.org/`.

És l'únic 301 d'anada que **no fa bucle**: el seu `_redirects` no porta cap
regla `/comando`.

## Com es manté això al dia

L'altra casa és un repositori a part i aquí només en tenim una còpia d'una
revisió. Això vol dir que **pot divergir sense que peti res**, que és el motiu
pel qual el pla de setembre desaconsellava el fork. Les dues coses que ho
contenen:

1. **La taula de dalt és la declaració**, i `build-nav.js` la llegeix. Afegir
   una pàgina a la porta de Molekulon sense dir de quina casa és, peta.
2. **La revisió està escrita** (`f3b7971`). El dia que l'altra casa canviï el
   seu `_redirects`, aquest fitxer queda vell i es veu que ho queda, en comptes
   de semblar al dia.

*El que no es pot fer des d'aquí és comprovar-ho en viu: la política de xarxa
d'aquest entorn no arriba a `molekulon.org`. Es llegeix del repositori, que és
la font, i no del domini.*
