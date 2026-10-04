# La base de coneixement del mapa de valor

Aquí hi viu **el que les sessions han ensenyat**, i no el mètode: el mètode és a
`../references/vna-verna-allee.md` i les regles a `../../tools/build-vna-suport.js`.

> **Per què existeix.** Un mòdul de suport que no acumula res és una plantilla.
> La segona sessió d'un ram ha de començar sabent el que va costar descobrir a
> la primera — i les troballes d'un mapa de valor es repeteixen molt més del que
> sembla: el node que no és de ningú, el que dona i mai rep, l'intangible que
> tothom dona per fet.

```
vna/
├── README.md     això
├── patrons.md    el que s'ha vist dues vegades o més
└── casos/        un fitxer per mapa real
```

## Com s'hi escriu

**Un cas per mapa real**, a `casos/<ram>-<lloc>.md`. La plantilla:

```markdown
# <Ram> · <lloc> · <data>

**Abast.** La frase que es va escriure a la passa 1.

## El mapa

<el JSON canònic, o la taula de transaccions>

## El veredicte

Les regles que no complia en acabar, i si es van deixar obertes a posta.

## Què ha ensenyat

**Obligatori.** Què es va descobrir que no se sabia abans d'entrar a la sala,
i què es preguntaria abans la pròxima vegada.
```

**«Què ha ensenyat» és obligatori i hi ha guarda.** Un cas que només guarda el
mapa és un fitxer, no coneixement: `build-vna-suport.js --check` peta si falta.

## Les tres regles d'escriptura

- **Cap nom de persona ni d'empresa tercera.** Un cas es diu pel ram i pel lloc.
  Si el client vol sortir amb nom, ha de tenir fila a `../negoci/trajectoria.md`
  com qualsevol altra afirmació sobre un tercer.
- **Cap xifra que no es pugui refer.** Ni euros, ni percentatges. El que un mapa
  deixa és **on mirar**; els números els posa la casa amb els seus.
- **El que es va descobrir, no el que es va fer.** «Vam fer tres sessions» no
  ensenya res. «La meitat del que es cobra passa per un rol que no està
  assignat» sí.

## Quan una troballa puja a `patrons.md`

**A la segona vegada**, amb els dos casos citats. Una troballa que ha passat
dues vegades es pregunta a la tercera sessió en comptes de descobrir-se — i això
és exactament el que un consultor amb vint anys fa sense adonar-se'n, escrit
perquè ho pugui fer també qui no en porta vint.
