// =============================================================================
// TEAMTOWERS SOS V10.1 — TEST SUITE
// Ruta: /ia/dev/tests/sos_v10_1.test.js
// Runner: TestsView.js (via import)   CLI: node --experimental-vm-modules
//
// Convención:
//   describe(grupo)  → agrupa tests relacionados
//   it(nombre, fn)   → test individual, fn lanza Error si falla
//   assert(cond, msg)→ falla con msg si cond es falsy
//
// Orden de ejecución = orden de flujo de valor V10.1:
//   1. VnaSequencer    → asigna sequence_order a exchanges
//   2. WoGenerator     → respeta el orden de dependencias
//   3. ArtifactEngine  → persiste + recupera artefactos
//   4. QueenAudit      → ciclo de mejora post-consolidación
//   5. PrimerEngine    → memoria de sesión entre arranques
//   6. GateEngine      → bloquea violaciones del Codex
//   7. ValueMapView    → renderiza mapa con números de secuencia
// =============================================================================

export const SUITE_VERSION = 'V10.1';
export const SUITE_NAME    = 'SOS V10.1 — Value Flow Sequence + Quality Loop';

import { VnaSequencerTests }  from './vna_sequencer.test.js';
import { WoGeneratorTests }   from './wo_generator.test.js';
import { ArtifactEngineTests } from './artifact_engine.test.js';
import { QueenAuditTests }    from './queen_audit.test.js';
import { PrimerEngineTests }  from './primer_engine.test.js';
import { GateEngineTests }    from './gate_engine.test.js';
import { ValueMapViewTests }  from './value_map_view.test.js';

export const ALL_SUITES = [
    VnaSequencerTests,
    WoGeneratorTests,
    ArtifactEngineTests,
    QueenAuditTests,
    PrimerEngineTests,
    GateEngineTests,
    ValueMapViewTests,
];
