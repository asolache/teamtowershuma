# Que l'eina s'expliqui sola · guia contextual i flux de valor per rol

> Una eina que s'ha d'explicar en una reunió no s'usarà quan no hi hagi reunió.

El SOS ha crescut molt i cada peça funciona, però una persona nova havia
d'endevinar **per a què serveix cada pantalla i què li tocava fer**. Endevinar és
exactament el que fa que una eina s'abandoni al tercer dia.

Aquest document defineix el model de guia. No és documentació externa: viu dins
l'app, al costat del que s'està fent.

---

## 1. Tres capes, tres preguntes diferents

Cada context del SOS (pestanya, vista, dinàmica) respon tres coses **allà
mateix**, sense sortir a cap manual:

| Capa | Pregunta que respon | Com es genera |
|---|---|---|
| **Flux de valor** | Quin valor circula aquí i en quin ordre | 3 frases fixes per context |
| **Passos** | Què em toca ara | Es comprova contra el node real |
| **Lent de rol** | Què hi faig *jo*, amb el meu rol | Una frase per cadascun dels 5 rols |

La diferència amb un tutorial és la segona capa: **els passos no són un temari,
són una comprovació**. «Primera oferta publicada» surt marcat perquè el sistema
mira si existeix, no perquè l'usuari hagi clicat «següent».

---

## 2. Els cinc rols i el seu flux de valor

Cada rol té un intercanvi explícit: **què hi poses i què en treus**. Dir només
el que has de fer és demanar feina; dir també què en treus és proposar un tracte.

| Rol | Hi posa | En treu |
|---|---|---|
| 💫 **Ciutadà/na simpatitzant** | Atenció i preguntes que ningú es fa | Entendre sense compromís i decidir quan pujar |
| 🦸 **Superheroi/na** | Talents, hores i objectes propis | Reputació verificable, accés i gent que el coneix |
| 👥 **Coordinador/a** | Acollida i que ningú es perdi | Una comunitat que no depèn d'una sola persona |
| 🌐 **Agent territorial** | Pont amb administració i finançament | Projectes reals que justificar amb dades |
| 🏛 **Guardià/ana** | Criteri, continuïtat i decisions signades | Un territori que no depèn de la seva memòria |

Cada rol té entre 5 i 6 passos ordenats, cadascun amb una acció que el
resol. El primer sempre és el mateix — crear el perfil — perquè sense identitat
la resta del sistema no pot fer res per tu.

**Es pot mirar el camí d'un altre rol.** Entendre què necessita el veí és la
meitat de la feina de coordinar-se.

---

## 3. El primer contacte

L'ordre del tour d'entrada és deliberat:

1. **El dolor que ja coneixes** — en primera persona, entre cometes. Ningú entra
   a una eina per la seva arquitectura.
2. **El bucle en quatre passos** — mapa → registre → matching → repartiment.
3. **Qui ets tu aquí dins** — es tria rol i es veu el seu flux de valor.
4. **El primer pas concret** — crear el perfil, amb el rol ja triat.
5. **Mai estaràs perdut/da** — on és la guia quan calgui.

Un tour que explica funcions abans de dir per a què serveixen és un tour que se
salta tothom.

---

## 4. Regla per a qui afegeixi contextos nous

**Un context sense entrada a `CONTEXT_GUIDES` és un context que la persona haurà
d'endevinar.** Cada pestanya o vista nova ha de portar:

- `flow`: 3 frases · qui dona què a qui i què torna.
- `steps`: 2-6 passos amb `done(node)` comprovable i, quan es pugui, `act(node)`.
- `lens`: una frase per als 5 rols. Si per a un rol no hi ha res a dir en aquell
  context, probablement el context està mal plantejat.

La guia es pot tancar i **no torna a obrir-se sola** en aquella pestanya: qui ja
ho té clar no ha de tornar a llegir-ho.

---

## 5. On va a parar tot això

La guia resol «què em toca ara». Faltava la pregunta de darrere: **cap a on**.

Registrar hores demana esforç, i durant molt de temps l'esforç no ensenyava
destinació: el fons cooperatiu era una funció dins d'una pestanya d'un node
MATRIU, i un territori amb tres bancs de temps vius en tenia zero.

Ara el flux té un final visible i enllaçable (`#/fons`), i el final té dues
xifres que no s'han de barrejar mai:

| Xifra | Què és | Com es presenta |
|---|---|---|
| **Verificat** | El que està signat i encadenat | € i **hores en hores** — dues xifres bessones, mai una de sola |
| **Mobilitzat** | L'estimació de l'oracle | Un € amb **rang** i la font escrita a cada partida |

I al costat, la que converteix la xifra en feina: **la cobertura**. El fons diu
quant s'ha mogut; la cobertura diu on encara no s'ha mogut res. Una llista de
regions buides no és un retret — és l'única llista que diu on val la pena trucar.

**Regla per a qui hi afegeixi vistes:** cap pantalla nova pot sumar una hora
signada amb una hora estimada, ni convertir hores a euros sense dir-ho al costat
del número. El dia que ho fem, la xifra deixa de ser defensable davant de qui la
financi, i és l'única cosa que aquesta eina té per oferir.
