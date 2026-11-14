# Migració de la Matriu a GitHub · Guia pas a pas

> **Objectiu**: Pujar el currículum (3 dominis pilot + 8 stubs) al repo
> `asolache/teamtowers-matriu` a GitHub.
>
> **Temps estimat**: 10-20 minuts (depèn de si has de crear token GitHub)
>
> **Risc**: Baix. Els scripts tenen verificacions abans de cada pas
> destructiu i mai toquen res sense preguntar.

---

## Què tens al teu Mac després de descomprimir el ZIP

```
matriu-curriculum-v2/
├── diagnostic.sh         ← Script 1: verifica què tens preparat
├── push-matriu.sh        ← Script 2: fa la pujada quan tot està OK
├── GUIA-MIGRACIO.md      ← Aquest document
│
├── _schema.md            ← Currículum (com sempre)
├── _index.md
├── README.md
├── ...
```

---

## Pas 0 · Descomprimir el ZIP al teu Mac

A la terminal del teu iMac:

```bash
cd ~/Downloads          # O on hagis baixat el ZIP
unzip matriu-curriculum-v2.zip
cd matriu-curriculum-v2

# Donar permisos d'execució als scripts
chmod +x diagnostic.sh push-matriu.sh
```

---

## Pas 1 · Diagnòstic local (no toca res)

Aquest script només **llegeix** la teva configuració. Cap modificació.
Pots executar-lo tantes vegades com vulguis.

```bash
./diagnostic.sh .
```

Si tot surt verd, passa al Pas 2.

Si surt algun ✗ vermell, segueix les instruccions que t'indica el
mateix script. Els problemes més habituals i la seva solució:

| Problema | Solució |
|---|---|
| `git no instal·lat` | `xcode-select --install` |
| `user.name no configurat` | `git config --global user.name "Alvaro Solache"` |
| `user.email no configurat` | `git config --global user.email "el-teu-email@gmail.com"` |
| `init.defaultBranch no és main` | `git config --global init.defaultBranch main` |
| `credential.helper no configurat` | `git config --global credential.helper osxkeychain` |

Re-executa `./diagnostic.sh .` fins que **tot surti verd o només groc**.

---

## Pas 2 · Crear el repo a GitHub (web, 5 clics)

1. Obre [https://github.com/new](https://github.com/new) al navegador.

2. Omple:
   - **Owner**: asolache
   - **Repository name**: `teamtowers-matriu`
   - **Description**: `Currículum operatiu de la Matriu · TeamTowers SOS V11`
   - **Public** ✓
   - **NO marquis** "Add a README file"
   - **NO marquis** "Add .gitignore"
   - **NO escullis** llicència

   > **Important**: Cap d'aquestes 3 opcions. Els pugem nosaltres
   > des del ZIP. Si les marques, el repo no estarà buit i el push
   > fallarà.

3. Clic a **Create repository**.

4. Veuràs una pàgina amb instruccions de git. **No facis cap d'aquestes
   instruccions** — el nostre script ja les conté. Només deixa la
   pestanya oberta (la necessitarem si la cosa va malament).

---

## Pas 3 · Si fas servir HTTPS (sense claus SSH): crear Personal Access Token

> Salta aquest pas si el diagnòstic et va dir "Autenticació: SSH" amb
> ✓ verd.

Quan facis push amb HTTPS, GitHub et demanarà:
- **Usuari**: el teu nom d'usuari (asolache)
- **Contrasenya**: NO la teva contrasenya de GitHub. Un **Personal
  Access Token** (PAT).

Si no en tens cap:

1. Visita [https://github.com/settings/tokens/new](https://github.com/settings/tokens/new)
2. **Note**: `teamtowers-matriu-push`
3. **Expiration**: `90 days` (o el que prefereixis)
4. **Scopes**: marca només `repo` (tot el grup)
5. Clic a **Generate token**
6. **Copia el token immediatament** — només es veu una vegada.
   Apunta-te'l a un lloc segur (Keychain, 1Password, etc.).

---

## Pas 4 · Executar el push

```bash
./push-matriu.sh .
```

El script et farà preguntes a cada pas destructiu:

1. **"Continuem?"** → `s` per confirmar
2. **"Vols esborrar [directori temporal] i començar de nou?"** →
   `s` si vols partir net (normalment és `s` la primera vegada)
3. **"Continuem amb el push?"** → `s` per fer la pujada de veritat

A la pujada, **si has triat HTTPS**:
- Usuari: `asolache`
- Password: **enganxa el Personal Access Token** (no es veu res
  al teclejar, és normal)

Si tens `credential.helper osxkeychain`, el token queda guardat al
Keychain i no l'hauràs de tornar a posar mai més.

---

## Pas 5 · Verificar

Visita [https://github.com/asolache/teamtowers-matriu](https://github.com/asolache/teamtowers-matriu)

Hauries de veure:
- 11 dominis a `domains/`
- 15 competències a `competencies/`
- 30 skill-seeds a `skill-seeds/`
- 30 SOPs a `sops/`
- README amb la taula d'estat
- LICENSE (CC BY-SA 4.0)

---

## Què fer si alguna cosa va malament

### "Permission denied (publickey)"
Vol dir que git intenta SSH però no tens claus SSH configurades amb
GitHub. Solucions:

```bash
# Forçar HTTPS per a aquest repo
cd ~/teamtowers-matriu-git
git remote set-url origin https://github.com/asolache/teamtowers-matriu.git
git push -u origin main
```

### "Repository not found"
El repo no està creat o té un altre nom. Revisa el Pas 2.

### "Authentication failed"
- Has fet servir la contrasenya en lloc del token? Repassa el Pas 3.
- El token ha expirat? Genera'n un de nou.

### "Updates were rejected because the remote contains work"
Has creat el repo amb README, .gitignore o llicència. Solucions:

```bash
# Opció A: forçar push (perds el que hi ha al remot, només si estàs
# segur que el remot està buit excepte aquests fitxers auto-generats)
cd ~/teamtowers-matriu-git
git push -u origin main --force

# Opció B: esborrar el repo a GitHub i tornar a crear-lo seguint el
# Pas 2 EXACTAMENT (sense README, sense .gitignore, sense license)
```

---

## Pas 6 · (Opcional) Afegir-lo com a submodule a SOS V11

Un cop el repo està a GitHub, el pots integrar a SOS V11:

```bash
cd /path/a/teamtowers-huma-sos
git submodule add https://github.com/asolache/teamtowers-matriu knowledge/matriu
git commit -m "Add matriu curriculum as submodule"
git push
```

A partir d'aquí, el `KnowledgeLoader` de SOS V11 pot carregar
fragments del currículum amb la sintaxi:

```javascript
const ctx = await KnowledgeLoader.buildContext({
    matriu_domain: 'd02-value-mapping'
});
```

---

## Què fer si tot va bé

Em dius i continuem amb:
- D-03 + D-04 + D-09 a la pròxima sessió
- Refactor del `KnowledgeLoader` amb separació reservori/biografia

---

*Guia v1 · TeamTowers · Migració Matriu → GitHub*
