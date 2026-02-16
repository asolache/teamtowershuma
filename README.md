# 🏗️ TeamTower Humà: La Pinya Digital (v1.1)

> **"Del valor humà al valor tokenitzat"** > Una infraestructura descentralitzada per capturar, comptabilitzar i transferir el valor intangible de les organitzacions.

---

## 🌟 Vision General
TeamTower Humà és un ecosistema de **Govern d'Alt Rendiment** que utilitza la saviesa dels *Castellers* per resoldre el problema de la valoració del talent en l'era Web3. Transformem l'esforç col·lectiu en actius digitals transparents, traçables i líquids.

## 🛠️ L'Ecosistema (Arquitectura 1.1)

Aquest repositori és un "Monorepo" que conté les quatre capes de la nostra operativa:

1.  **[VNA App (Anàlisi de Xarxes)](./app/)**: Eina de diagnòstic per mapejar rols i fluxos de valor.
2.  **[Value Accounting](./app_comptabilitat/)**: Registre d'Unitats de Valor (UV) basat en entregables reals.
3.  **[Tokenomics Configurator](./tokenomics/)**: Motor matemàtic per definir rondes **Fibonacci** (5%, 8%, 13%, 21%) i polítiques de **Vesting/Cliff**.
4.  **[Web3 Deploy Tool](./deploy/)**: Interfície de desplegament de Smart Contracts en xarxes de test (Sepolia/Holesky) connectada amb MetaMask.

---

## 📊 Mecanismes Econòmics de Valor

| Concepte | Implementació Tècnica |
| :--- | :--- |
| **Confiança** | Smart Contracts auditables en EVM (Ethereum Virtual Machine). |
| **Equitat** | Dilució seguint la seqüència de Fibonacci per garantir la sostenibilitat. |
| **Compromís** | Vesting lineal de 4 anys amb 1 any de "Cliff" (bloqueig inicial). |
| **Trazabilitat** | De l'entregable (CSV/JSON) al token ERC20. |

---

## 🚀 Guia ràpida de desplegament

### 1. Per a Consultors i Usuaris
Pots accedir a la **Pinya Digital** (Landing Page) obrint el fitxer `index.html` en qualsevol navegador modern o via GitHub Pages.

### 2. Per a Desenvolupadors
L'ecosistema està construït amb tecnologia **Vanilla Web Stack** (HTML5, CSS3, JS) per garantir zero dependències i màxima compatibilitat.
* **Backend:** Python 3.x (per a l'automatització de continguts).
* **Blockchain:** Ethers.js i Solidity (OpenZeppelin standards).

```bash
# Actualitzar les notícies del sistema automàticament
python update_news.py
