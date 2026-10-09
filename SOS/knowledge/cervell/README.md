# El cervell d'un projecte · reutilitzable

**Demanat per l'Àlvar el 09/10/2026:** «que el model de cervell del projecte sigui
reutilitzable», «aplica les bones pràctiques ja aplicades a SOS i que sigui el
valor afegit d'aquests serveis», i «que el que aprenguem ara ho reutilitzem i
passi a les vedes, al blog i al servei, que s'ha de continuar desenvolupant i
millorant en disseny, UX, seguiment i desenvolupament de l'estratègia».

## Què és el cervell

El cervell és **el que una IA ha de llegir abans d'escriure en un projecte**: on
va cada cosa, què és llei, com es treballa i què queda per fer. Una persona
pregunta; una IA no. Llegeix, se'n fa una idea i escriu. Si el cervell diu una
cosa que ja no és certa, la IA s'equivoca amb tota la confiança del món, i
aquest és l'error més car que hem vist a SOS: **un mapa fals és pitjor que cap
mapa**.

Per això el cervell no és una carpeta de documents. Són sis peces, i cadascuna
ve d'un error que ja vam cometre a SOS:

| Peça | Fitxer a la plantilla | D'on ve a SOS | L'error que evita |
|---|---|---|---|
| **La comunicació** | `CLAUDE.md` | `CLAUDE.md` | Sessions que narren en comptes de lliurar |
| **La taxonomia** | `saber/taxonomia.md` | `SOS/knowledge/taxonomia.md` | Una IA que escriu al lloc equivocat perquè el nom de la carpeta enganya |
| **El mapa, generat** | `saber/MAPA.md` | `SOS/knowledge/MAPA.md` | Un índex escrit a mà que caduca el segon dia |
| **El codex de vedes** | `saber/codex.md` | `SOS/knowledge/codex.md` | Tornar a cometre un error que ja es va pagar |
| **El contracte de la IA** | `saber/para-la-ia.md` | `SOS/knowledge/for-ai/README.md` | Regles que no arriben a qui les ha de complir |
| **El backlog** | `saber/backlog.md` | `SOS/knowledge/dev/backlog.md` | Una petició que es queda en una conversa i la sessió següent no sap que existeix (veda 160) |

I una setena que les fa aguantar: **la guarda** (`SOS/tools/cervell.js`). Sense
ella, les sis peces són documentació, i la documentació es podreix. Amb ella, el
CI peta si:

- hi ha una carpeta sense cara declarada, o una cara sense carpeta;
- el mapa no és el que sortiria de l'arbre ara;
- falta una peça del cervell;
- un fitxer de lectura cita un fitxer o una funció que no existeix;
- el contracte diu que una cosa **no** hi és (`package.json`, `misc/`) i hi és.

El que git ignora (la carpeta de contactes d'un client, per exemple) es pot
citar sense que peti: existeix a la màquina de qui treballa i no al CI.

L'última comprovació és la que la versió anterior del contracte de SOS no tenia:
deia «els 18 vedes» quan n'hi havia 116. La guarda llegeix el contracte i el
creua amb l'arbre de debò. En aquest repositori va trobar, el primer dia, la
cita del mateix fitxer que esteu llegint abans que existís.

## Un sol cervell, no dues còpies

**L'eina és una i la mateixa** per a TeamTowers i per a qualsevol client. El que
canvia d'un projecte a l'altre és `cervell.json` a l'arrel: on són la taxonomia,
el mapa, els fitxers de lectura, el backlog i el `CLAUDE.md`, quines carpetes es
baixen un nivell, què diu el contracte que no hi és, i l'idioma del mapa (`ca` o
`es`). SOS el fa servir des de `cervell.json` a l'arrel d'aquest repositori;
`SOS/tools/build-mapa.js` és ara un àlies de l'eina perquè el citen el codex i
altres generadors.

Si una millora surt d'un projecte client, entra **aquí**, a l'eina o a la
plantilla, i tots els cervells la reben la propera vegada que s'actualitzen. Dues
còpies del mateix model divergeixen en silenci (veda 71).

## Com s'instal·la en un projecte

```bash
node SOS/tools/cervell.js --nou ../el-projecte --nom "El projecte"
cd ../el-projecte
node guardas/cervell.js            # escriu el primer MAPA.md
node guardas/cervell.js --check    # i al CI, a cada PR
```

`--nou` copia la plantilla (`plantilla/`) i l'eina, i no trepitja mai un
cervell que ja hi és.

**La pàgina per al client.** Si `cervell.json` declara `pagina`, l'eina escriu
també una pàgina HTML sola (a la plantilla, `saber/cervell.html`) amb les peces
i si hi són, l'ordre de lectura, les cares, les vedes i el que queda al
backlog. S'obre amb doble clic, sense GitHub, i el CI peta si ha quedat vella.
És el que el client veu el dia que se li lliura el projecte. TeamTowers no la
publica de la seva: el nostre backlog és de feina interna i no ha de sortir a
la web. Després, el primer que es fa és declarar les carpetes del
projecte a `saber/taxonomia.md`: la guarda no deixarà passar ni una sense cara.

Un projecte que ja té cervell propi (un `CLAUDE.md`, un backlog, guardes) no
s'instal·la de zero: s'escriu el seu `cervell.json` apuntant als fitxers que ja
té, i se li copia l'eina. És el cas d'Events Penedès, que ja té comunicació,
backlog i guardes, i li falten la taxonomia, el mapa i el codex.

## El valor afegit dels serveis

Cada servei de TeamTowers que deixa un repositori al client (el mapa i la web en
una hora, el negoci operatiu) **el deixa amb cervell**. El que el client
s'emporta no és només una web o un mapa: és un projecte que qualsevol IA que
faci servir després pot llegir sense equivocar-se, i que avisa sol quan el que
diu deixa de ser cert.

Això és el que el diferencia d'una web feta amb una IA en una tarda: aquella
funciona el primer dia; aquesta **segueix sabent què és** el dia que algú la toca
sis mesos després.

## El bucle: el que aprenem passa a vedes, blog i servei

El cervell no s'acaba quan s'instal·la. El flux és el de la veda 160, aplicat a
tots els projectes alhora:

1. **Un error real** en un projecte (de TeamTowers o d'un client) entra al seu
   contracte, a «Els antipatrons que hem comès de debò», amb data i guarda.
2. **Si val per a tots**, puja aquí: una veda al codex de SOS i, si es pot
   comprovar, una comprovació nova a `cervell.js`, provada trencant-la a posta
   a `SOS/tests/test-cervell.mjs`.
3. **El blog ho explica** per a qui no llegeix codex (`SOS/blog.html`).
4. **El servei ho incorpora**: la plantilla i l'eina milloren, i el seguiment
   d'un client inclou portar-li la versió nova del cervell.

El que queda per fer —disseny i UX del servei, el seguiment com a servei
recurrent, l'estratègia— és al backlog (`SOS/knowledge/dev/backlog.md`, «El
cervell reutilitzable»).
