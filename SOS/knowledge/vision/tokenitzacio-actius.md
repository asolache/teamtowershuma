# Tokenitzar els actius de l'Àlvar al SOS · obra de xarxa de valor

> **Demanat per l'Àlvar el 16/11/2026:** «Quiero iniciar proyecto de
> tokenización de mis activos en entorno SOS descentralizado con
> criptoseguridad cuántica por random de eventos paralelos.»
>
> I, el mateix dia: «Como la web 3 incluye web semántica, IA, contabilidad de
> triple entrada, sistemas como Ethereum, con lo que suponen de disruptivo,
> quiero ser el nuevo notario del pueblo, el primero, y certificado por La
> Caixa.»
>
> **Això és un esborrany per validar (regla 10), no una sessió ni codi.** Cap
> import, cap participació i cap condició del holding no viuen aquí: van al
> repositori d'estratègia (pla de negoci únic, decidit el 10/10/2026). Res del
> que diu aquesta obra sobre la llei és consell jurídic: són les preguntes que
> cal portar a qui en sap abans de fer servir cap paraula de cara enfora.

## Què vol dir aquí «tokenitzar»

Un token és **un apunt signat que diu qui té quin dret sobre quin actiu**, i
que es pot verificar sense preguntar a ningú. No és una moneda ni una promesa
de rendiment. El SOS ja en fa la meitat: cada persona té el seu did:key, signa
amb la seva clau i encadena els seus apunts (vedes 64 i 180). El que falta és
**el registre d'actius**: quins actius hi ha, de qui són, quins drets se'n
poden cedir i com es demostra.

## Què ja existeix i no es torna a fer (DRY)

| Peça | On viu |
|---|---|
| Identitat pròpia de cada persona (did:key, signatura Ed25519) | `SOS/index.html` · vedes 180 i 181 |
| Una cadena per autor i el rebut com a tercera entrada | veda 64 · ledger del SOS |
| Llesques per projecte, sense renegociar | Slicing Pie a la MATRIU (`matriu/guia-funcionament.md`) |
| El fons com a destinació del flux | `fons-ment-xarxa.md` · ruta `#/fons` |
| Segell de temps qualificat (eIDAS) per al registre | veda 180 (guarda pendent) |
| Com inventariar els actius únics | `matriu/curriculum/sops/sop-inventariar-actius-equip.md` |
| Primer valor, després quota, després web pròpia | `embut-comu.md` |

**Precedent de Molekulon:** el repositori `Molekulon3/molekulonClub` és la
referència que ja s'havien fet contractes intel·ligents i dApps, però avui
**és buit a GitHub** (comprovat el 16/11/2026: «Git Repository is empty»).
No se'n pot reaprofitar codi; si l'Àlvar en té una còpia, val la pena pujar-la
abans de dissenyar res, perquè ensenya què va funcionar i què no.

## Els actius, un per un

Cada actiu té una naturalesa jurídica diferent, i això decideix quin token pot
tenir i quina llei li toca. La columna «encaix» és una primera lectura, a
validar.

| Actiu | Què es tokenitza de debò | Encaix provable | Risc |
|---|---|---|---|
| **Marques** (TeamTowers, Fent Pinya, Events Penedès, Molekulon) | No la marca registrada (el títol el porta l'OEPM/EUIPO), sinó **llicències d'ús**: qui pot fer servir la marca, on i fins quan | Contracte de llicència + token de prova (no transferible) | Baix si el token només prova; alt si es ven com a inversió |
| **El codex i el cervell** | Ja és obert i forkejable. Es tokenitza **l'autoria**: qui ha aportat cada veda, per repartir reconeixement i llesques | Llesques signades del Slicing Pie | Baix |
| **Cursos i formació** (MATRIU, Fent Pinya, LMS) | **L'accés**: un token que obre un curs o una plaça, i el certificat d'haver-lo fet | Token d'utilitat sobre un servei que ja existeix; certificat com a credencial verificable | Baix-mitjà (veure MiCA) |
| **Esdeveniments** (Events Penedès, sessions de DJ) | **L'entrada** i el bo prepagat del partner | Entrada nominativa o bo; si és única, pot ser un token no fungible | Baix-mitjà |
| **Participacions del holding Solache** | Drets econòmics o polítics sobre societats | Instrument financer: **no és MiCA**, és la llei del mercat de valors | Alt: no es fa sense assessor |

## El mapa

Vuit rols i divuit transaccions, onze de les quals intangibles. Els
rols es diuen pel que fan.

| Rol | Qui ho fa avui |
|---|---|
| **Qui té l'actiu** | l'Àlvar i les seves societats |
| **El registre** | el SOS: did, ledger i segell (vedes 64 i 180) |
| **Qui fa servir l'actiu** | alumnes, clients dels tallers, assistents |
| **Qui aporta a l'actiu** | sòcies de la ment xarxa, autors de vedes, monitors i músics |
| **Els partners** | llocs especials i agències d'Events Penedès |
| **Qui sap de la llei** | assessor jurídic i fiscal (avui **no és ningú**, regla 5) |
| **El supervisor** | CNMV (i Banc d'Espanya si hi ha diners electrònics) |
| **La banca aliada** | CaixaBank, si s'hi arriba: avui **no hi ha cap acord** |

| De → a | Mena | Què | Retorn | Mena |
|---|---|---|---|---|
| Qui té l'actiu → registre | T | l'actiu declarat i signat | prova amb data i signatura | I |
| Qui fa servir → qui té l'actiu | T | pagament del curs, l'entrada o la llicència | token d'accés nominatiu | T |
| Registre → qui fa servir | I | poder comprovar que el seu accés és bo, sense preguntar | — el seu ús queda al registre | I |
| Qui aporta → registre | T | hores i vedes signades | llesques segellades | T |
| Qui té l'actiu → qui aporta | I | reconeixement visible de l'autoria | més aportacions | I |
| Partners → qui té l'actiu | T | espai i servei | bons i entrades que porten gent | T |
| Qui sap de la llei → qui té l'actiu | I | quin actiu pot ser token i com | encàrrec pagat | T |
| Supervisor → qui sap de la llei | I | criteris i registres públics | consultes i expedients ben fets | I |
| Banca aliada → qui té l'actiu | T | cobrament dels accessos i, si mai cal, custòdia regulada | casos reals de registre al territori rural | I |
| Banca aliada → qui fa servir | I | la confiança d'una marca que el poble ja coneix | ús del servei a pobles on la banca té oficina i poc més | I |

## El que ensenya

1. **Tokenitzar no crea valor: el fa llegible.** Un token d'un curs que no es
   ven segueix sense vendre's. L'ordre de l'embut comú no canvia: primer valor,
   i el token arriba quan hi ha algú que el fa servir.
2. **El node que no és de ningú torna a ser la llei.** Igual que a
   `fons-ment-xarxa.md`, el rol que decideix si es pot fer no surt al mapa amb
   nom. **Abans de cap token transferible, hi ha d'haver un assessor** amb nom.
3. **Només els tokens que no es poden vendre són fàcils.** Un apunt signat que
   prova autoria, accés o una llesca, i que no es pot transferir a un tercer,
   queda lluny de la regulació de criptoactius. Tot el que es pot comprar i
   vendre lliurement entra al terreny regulat.
4. **El holding és un altre món.** Les participacions són instruments
   financers. Es poden representar amb registre distribuït, però per la via
   del mercat de valors i amb entitat autoritzada, no com un projecte del SOS.

## El «notari del poble»: el posicionament, dit de manera que es pugui sostenir

La idea de fons és bona i encaixa amb la veda 180: **algú del poble que dona
fe digital de les coses del poble** (un acord de la colla, la data d'una obra,
l'autoria d'una veda, la llesca d'una sòcia), amb web semàntica, IA, triple
entrada i, si cal, un ancoratge a Ethereum. Tres coses perquè no es giri en
contra:

1. **«Notari» no es pot fer servir.** A Espanya el notari és un funcionari
   públic amb oposició (Llei del Notariat), i el que dona fe pública és ell.
   La veda 180 ja ho diu: es diu «prova amb data i signatura», no «validesa
   notarial». Noms que sí es poden fer servir: **registre d'evidències**,
   **segell de temps**, **custodi de proves del poble**. Proposta de lema:
   *«El registre del poble: proves amb data i signatura»*.
2. **El camí realista és fer servir un prestador qualificat, no ser-ne un.**
   Ser prestador de serveis de confiança qualificat (eIDAS i Llei 6/2020)
   demana auditoria de conformitat, assegurança i supervisió del Ministeri; és
   un projecte d'anys i capital. El SOS pot ser **la capa de la gent** (did,
   triple entrada, IA, semàntica) i segellar amb un prestador qualificat que ja
   existeix. Fer el pas a prestador propi és una decisió per més endavant.
3. **«El primer» és posicionament, no fet.** Hi ha empreses que ja segellen
   proves en cadena pública. El que pot ser nou és *el registre de valor d'una
   comunitat local, signat per cada persona amb el seu cervell*. No es publica
   «el primer» sense una font que ho sostingui (com a `fons-ment-xarxa.md`).

### On encaixaria CaixaBank

Avui **no hi ha cap aval ni acord**: és una aliança per buscar. Al mapa és el
rol **«la banca aliada»**, i el que pot aportar no és la certificació (aquesta
la dona un prestador qualificat eIDAS, no un banc) sinó:

- **Confiança i porta d'entrada** als pobles on és l'entitat de referència.
- **Els carrils de cobrament** dels accessos i entrades (fase 2), i, si mai
  arribés la fase 4, la custòdia regulada.
- **Un cas d'innovació rural** que li interessa explicar.

Un matís: «la Caixa» pot voler dir **CaixaBank** (el banc) o la **Fundació
«la Caixa»** (l'obra social). Per a cobrament i custòdia és el banc; per a un
programa social o de cultura al territori seria la fundació. Són dues portes
diferents, i convé saber a quina es truca.

## L'encaix legal a Espanya (a validar)

- **MiCA**, Reglament (UE) 2023/1114, aplicable del tot des del 30/12/2024.
  Regula els criptoactius que **no** són instruments financers: tokens
  referenciats a actius (ART), tokens de diner electrònic (EMT) i la resta,
  entre els quals els **tokens d'utilitat**. A Espanya, la CNMV és l'autoritat
  competent per als proveïdors de serveis de criptoactius.
- **Exempcions que poden tocar-nos** (art. 4 de MiCA, segons el nostre llegit):
  l'oferta adreçada a menys de 150 persones per Estat membre, l'oferta de
  menys d'1 milió d'euros en 12 mesos, i el token d'utilitat que dona accés a
  un bé o servei **que ja existeix**. Exempt del llibre blanc no vol dir exempt
  de tot: s'ha de confirmar amb l'assessor.
- **El que és únic i no fungible** (una entrada concreta, una obra concreta)
  queda en principi fora de MiCA, però una col·lecció fraccionada o en sèrie
  pot no comptar com a única.
- **Participacions i accions:** no són MiCA. Les regeix la Llei 6/2023 dels
  Mercats de Valors i dels Serveis d'Inversió, que admet representar valors
  amb tecnologia de registre distribuït, i el règim pilot europeu (Reglament
  (UE) 2022/858). Les participacions d'una SL, a més, es transmeten amb
  escriptura pública (Llei de Societats de Capital). Hi ha l'**espai controlat
  de proves** de la Llei 7/2020 per provar-ho amb el supervisor.
- **Dades personals:** un registre que no s'esborra i dades personals no
  casen. Al registre hi van hashes i dids, mai noms ni correus (RGPD,
  `legal/`).
- **Fiscalitat:** cada token que es ven és una venda amb IVA (veda 172) i,
  si és criptoactiu, té obligacions d'informació pròpies. Pregunta per a
  l'assessor fiscal.

**Paraules que no es fan servir de cara enfora** fins que l'assessor ho digui:
«inversió», «rendiment», «fons», «revaloració», «ICO».

## La seguretat, amb el que es pot sostenir

La petició barreja dues coses que convé separar, perquè una és útil i l'altra
no existeix tal com sona.

**1. L'aleatorietat d'esdeveniments paral·lels és una font d'entropia, no una
seguretat quàntica.** Combinar molts esdeveniments independents (el que
aporta cada node, l'hora, el soroll del dispositiu) dona bons números
aleatoris, i és el que fan els navegadors amb `crypto.getRandomValues`, que el
SOS ja fa servir per fer les claus. Fer-ho «de més fonts» no fa les claus més
fortes que això. On sí té sentit és com a **balisa d'aleatorietat pública**:
un número que ningú no podia preveure i que tothom pot comprovar, fet per
compromís i revelació entre molts nodes (el model de drand i la League of
Entropy). Serveix per sortejar places, triar revisors o fer rotacions justes al
SOS. No serveix per protegir-se d'un ordinador quàntic.

**2. La seguretat davant d'ordinadors quàntics la donen algorismes
postquàntics estandarditzats.** L'any 2024 el NIST en va publicar tres:
**ML-KEM** (FIPS 203) per pactar claus i xifrar, **ML-DSA** (FIPS 204) i
**SLH-DSA** (FIPS 205) per signar. La signatura Ed25519 que fa servir avui el
SOS és segura contra els ordinadors d'ara, però un ordinador quàntic prou gran
la trencaria. Els hashes (SHA-256) aguanten.

**El que es proposa:**

- **Signatura híbrida** per als apunts que han de durar anys (llesques,
  llicències, títols): Ed25519 **i** ML-DSA a la vegada, perquè si un dels dos
  falla, l'altre sosté la prova. Cal confirmar si el navegador ja ho ofereix de
  sèrie; si no, amb una llibreria auditada i allotjada aquí (veda 162).
- **ML-KEM per al canal xifrat** (`SOS/canal/`), perquè el que es xifra avui es
  pot guardar i desxifrar d'aquí a anys («guarda ara, desxifra després»).
- **La balisa** per al que és sorteig o selecció, no per a les claus.
- **El segell eIDAS** de la veda 180 continua sent el que dona data i
  integritat amb valor de prova davant de tercers.

**El que no es diu enlloc:** «seguretat quàntica», «inviolable», «a prova de
hackers». Es diu: «signat amb algorismes postquàntics estàndard del NIST».

## Descentralitzat, però sense amo ni cadena pública per defecte

La veda 64 ja va decidir que un ordre global vol dir un amo. Per això:

- **El registre d'actius és el ledger del SOS**: cada autor encadena els seus
  apunts, el rebut signat és la tercera entrada i la unió no destrueix.
- **Una cadena pública, només per ancorar**: si cal, es publica el hash del
  tancament (el del dia o del mes) en una cadena pública, mai les dades. Així
  qualsevol pot comprovar que el registre no s'ha tocat, sense pagar gas per
  cada apunt ni exposar res.
- **Els contractes intel·ligents automatitzen, no decideixen** (veda 180):
  reparteixen llesques o obren un curs quan arriba el pagament, però el diner
  i el que és intangible són sempre d'una persona.

## Les fases

| Fase | Què | Toca la llei? |
|---|---|---|
| **0 · Inventari** | Llista dels actius de l'Àlvar amb el SOP d'inventari: quins són, de qui, quins drets en surten | No |
| **1 · Proves no transferibles** | Autoria del codex, llesques, certificats de curs i llicències de marca com a apunts signats al SOS | Poc (RGPD) |
| **2 · Accés i entrades** | Token d'accés a cursos i entrades d'esdeveniments, nominatius | Sí: confirmar l'exempció d'utilitat |
| **3 · Seguretat postquàntica** | Signatura híbrida i ML-KEM al canal; balisa per a sortejos | No |
| **4 · Participacions** | Només si l'assessor ho veu i per la via regulada | Sí, del tot |

## La passa següent

**Fer la fase 0 amb l'Àlvar:** omplir l'inventari dels seus actius amb el
`sop-inventariar-actius-equip`, al repositori d'estratègia (és privat i hi
viuen les xifres), i triar **un sol actiu** per a la fase 1. La proposta és el
certificat d'un curs de Fent Pinya: és el que dona de menjar, no es pot vendre
a tercers i ensenya tota la cadena (did, signatura, rebut i segell) sense cap
risc legal.

## Preguntes que només pot respondre l'Àlvar

- Què vol aconseguir amb la tokenització: finançar-se, fidelitzar, provar
  l'autoria o repartir valor amb qui aporta? Cada resposta porta a una fase
  diferent.
- Té una còpia del codi de Molekulon3/molekulonClub?
- Hi ha cap assessor jurídic o fiscal de confiança que ja conegui MiCA?
- Amb «La Caixa», penses en el banc (CaixaBank) o en la Fundació? Hi tens ja
  algun contacte?
- T'agrada «el registre del poble» com a nom, en lloc de «notari»?
- Quan diu «random d'esdeveniments paral·lels», pensava en una balisa pública
  (sortejos justos) o en protegir les claus? Si és el segon, la resposta són
  ML-KEM i ML-DSA.
