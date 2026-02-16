# Estructura base: /categoria/entidad/accion?parametros

## Portal Principal
/teamtowers-huma/                 → Página de inicio con filosofía
/teamtowers-huma/la-colla/        → Portal colaborativo "La Colla"
/teamtowers-huma/recursos/        → Biblioteca de recursos

## Aplicaciones
/apps/vna/                        → App Value Network Analysis
/apps/vna/importar                → Importar datos a VNA
/apps/vna/exportar                → Exportar datos de VNA

/apps/comptabilitat/              → App Contabilidad de Valor
/apps/comptabilitat/entregables   → Lista de entregables
/apps/comptabilitat/usuarios      → Gestión de usuarios

/apps/ia/                         → Asistente Inteligente
/apps/ia/knowledge-portal         → Portal de conocimiento
/apps/ia/recomendaciones          → Recomendaciones personalizadas

## Proyectos de La Colla
/colla/proyectos/[id]/            → Dashboard del proyecto
/colla/proyectos/[id]/entregables → Entregables del proyecto
/colla/proyectos/[id]/tokenomics  → Configuración tokenomics

## Comunidades de Práctica
/colla/comunidades/[id]/          → Portal de comunidad
/colla/comunidades/[id]/conocimiento → Base de conocimiento

## Recursos
/recursos/plantillas/             → Plantillas reutilizables
/recursos/casos-estudio/          → Casos de estudio documentados
/recursos/documentacion/          → Documentación técnica

// En cualquier texto del sistema:
"Gracias a @anna por el entregable #documentacion del proyecto @proyecto-masia"

// Se convierte automáticamente en:
<a href="/colla/usuarios/anna" class="user-ref">@anna</a> 
por el entregable 
<a href="/colla/conceptos/documentacion" class="concept-ref">#documentacion</a> 
del proyecto 
<a href="/colla/proyectos/proyecto-masia" class="project-ref">@proyecto-masia</a>

graph LR
    A[Interfaz de Usuario] --> B(Capa de Contexto)
    B --> C{Motor de IA}
    C --> D[Base de Conocimiento]
    C --> E[Análisis de Datos]
    C --> F[Generación de Contenido]
    D --> G[Entidades @]
    D --> H[Conceptos #]
    D --> I[Patrones Validados]
    E --> J[Análisis VNA]
    E --> K[Análisis Tokenomics]
    F --> L[Prompts Contextuales]
    F --> M[Recomendaciones]
    F --> N[Documentación]

   
    Componentes Clave del Motor de IA
    
    // knowledge-graph.js - Grafo semántico
class KnowledgeGraph {
  constructor() {
    this.entities = new Map();      // @usuarios, @roles, @proyectos
    this.concepts = new Map();      // #conceptos, #metodologias
    this.relationships = new Map(); // Relaciones entre entidades
    
    // Cargar conocimiento desde core/knowledge-base/
    this.loadKnowledgeBase();
  }
  
  // Buscar entidades relacionadas
  findRelatedEntities(entityId, maxDepth = 2) {
    // Implementación de búsqueda en grafo
  }
  
  // Generar contexto para un proyecto específico
  generateProjectContext(projectId) {
    // Analiza entregables, roles, tokenomics del proyecto
    // Devuelve contexto estructurado para IA
  }
}

// prompt-generator.js - Generador de prompts contextuales
class PromptGenerator {
  constructor(knowledgeGraph) {
    this.kg = knowledgeGraph;
  }
  
  // Generar prompt para desarrollo de página web
  generateWebDevPrompt(projectContext, deliverable) {
    return `
      Basándote en el proyecto "${projectContext.name}" con estos entregables:
      ${projectContext.deliverables.map(d => `- ${d.name}: ${d.value} UV`).join('\n')}
      
      Y considerando estos roles clave:
      ${projectContext.roles.map(r => `- ${r.name}`).join('\n')}
      
      Genera un prompt detallado para desarrollar la página web de:
      "${deliverable.name}" (${deliverable.type})
      
      Requisitos específicos:
      - Tecnologías: ${projectContext.techStack.join(', ')}
      - Estándares: WCAG 2.1, W3C HTML5, CSS3
      - Integración con otras apps del ecosistema
      - Soporte para @referencias y #conceptos
    `;
  }
  
  // Generar prompt para smart contract
  generateSmartContractPrompt(tokenomicsConfig) {
    // Implementación específica para contratos inteligentes
  }
}

🌐 ESTÁNDARES W3C IMPLEMENTADOS (Experto W3C)
Checklist de Implementación

## Accesibilidad (WCAG 2.1 AA)
- [x] Contraste mínimo 4.5:1 para texto
- [x] Navegación por teclado completa
- [x] ARIA labels para elementos interactivos
- [x] Alt text para imágenes
- [x] Reducción de movimiento opcional

## Semántica HTML5
- [x] Estructura con section, article, nav, footer
- [x] Encabezados jerárquicos (h1-h6)
- [x] Atributos lang correctos
- [x] Microdatos Schema.org para SEO

## PWA (Progressive Web App)
- [x] Web App Manifest
- [x] Service Worker para caché offline
- [x] Icons en múltiples tamaños
- [x] Splash screen personalizado

## Seguridad
- [x] Content Security Policy (CSP)
- [x] HTTPS obligatorio
- [x] Sanitización de inputs
- [x] security.txt en .well-known/

      📦 SISTEMA DE SOPORTE PARA PROYECTOS (Experto en Gestión de Proyectos)
Plantilla de Proyecto Estandarizada

// colla/projects/[project-id]/project-config.json
{
  "projectId": "proyecto-masia-2026",
  "name": "Proyecto MASIA 2026",
  "description": "Transformación organizacional con tokenización de valor",
  "createdAt": "2026-02-15T10:30:00Z",
  "status": "active",
  
  "team": [
    { "userId": "@anna", "role": "CEO", "responsibilities": ["Estrategia", "Relaciones con inversores"] },
    { "userId": "@marc", "role": "Dev Lead", "responsibilities": ["Desarrollo técnico", "Arquitectura"] }
  ],
  
  "deliverables": [
    {
      "id": "del-001",
      "name": "Mapa de Valor VNA",
      "type": "intangible",
      "value": 350,
      "status": "completed",
      "assignedTo": "@anna",
      "dueDate": "2026-03-01",
      "references": ["#vna", "#value-network-analysis"]
    }
  ],
  
  "tokenomics": {
    "totalSupply": 1000000,
    "distribution": {
      "investors": 21,
      "founders": 13,
      "treasury": 8,
      "community": 58
    },
    "vesting": {
      "cliffDays": 365,
      "totalDays": 1460
    }
  },
  
  "techStack": ["HTML5", "CSS3", "JavaScript ES6+", "Chart.js", "vis-network"],
  "standards": ["WCAG 2.1 AA", "W3C HTML5", "Schema.org"],
  
  "knowledgeBase": {
    "entitiesPath": "/core/knowledge-base/entities/",
    "conceptsPath": "/core/knowledge-base/concepts/",
    "patternsPath": "/core/knowledge-base/patterns/"
  }
}

🚀 PROMPT PARA INICIAR EL DESARROLLO

# PROMPT: TeamTowers Humà v1.1 - Desarrollo de Arquitectura Digital Avanzada

## 🎯 OBJETIVO PRINCIPAL
Desarrollar la versión 1.1 de TeamTowers Humà con una arquitectura digital robusta que funcione como una biblioteca inteligente para "La Colla", implementando estándares W3C, un sistema de IA contextual avanzado, y una estructura de información intuitiva que permita a los proyectos y clientes operar con soberanía de datos.

## 📋 REQUISITOS ESENCIALES

### 1. ESTRUCTURA DE ARCHIVOS (Digital Librarian Expert)
- Crear estructura de directorios como se especifica en la arquitectura
- Implementar sistema de nombres de archivos consistentes y descriptivos
- Organizar recursos compartidos en `/apps/shared/` con versionado semántico
- Crear sistema de documentación en `/docs/` con plantillas reutilizables

### 2. SISTEMA DE ENLACES INTUITIVOS (UX Expert)
- Implementar convenciones de URLs limpias y memorables
- Desarrollar sistema de referencias semánticas (@usuarios, #conceptos)
- Crear sistema de navegación consistente entre todas las apps
- Implementar breadcrumbs contextuales en todas las páginas

### 3. ARQUITECTURA DE IA AVANZADA (AI Expert)
- Desarrollar `core/ai-engine/` con los componentes especificados
- Implementar `KnowledgeGraph` para gestión de entidades y conceptos
- Crear `PromptGenerator` para generación contextual de prompts de desarrollo
- Integrar motor de IA en todas las apps mediante `ai-bridge.js`

### 4. ESTÁNDARES W3C (W3C Expert)
- Implementar WCAG 2.1 AA en todas las interfaces
- Añadir microdatos Schema.org para SEO avanzado
- Configurar PWA con manifest y service worker
- Implementar Content Security Policy (CSP) para seguridad

### 5. SISTEMA DE SOPORTE PARA PROYECTOS (Project Management Expert)
- Crear plantilla estandarizada de proyecto (`project-config.json`)
- Desarrollar dashboard de proyecto con métricas clave
- Implementar sistema de seguimiento de entregables con estado
- Crear portal de conocimiento por proyecto/comunidad

## 🛠️ ENTREGABLES ESPERADOS

### Fase 1: Fundamentos (Semana 1-2)
- [ ] Estructura de directorios completa
- [ ] Sistema de navegación principal (`index.html`, `lacolla.html`)
- [ ] Componentes UI compartidos en `/apps/shared/`
- [ ] Documentación inicial en `/docs/`

### Fase 2: Motor de IA (Semana 3-4)
- [ ] Implementación de `KnowledgeGraph`
- [ ] Desarrollo de `PromptGenerator`
- [ ] Integración en app de IA (`/apps/ia/`)
- [ ] Portal de conocimiento funcional

### Fase 3: Aplicaciones Principales (Semana 5-8)
- [ ] App VNA con importación/exportación mejorada
- [ ] App Contabilidad con gestión de entregables avanzada
- [ ] App Tokenomics con configuración intuitiva
- [ ] Dashboard de proyecto en `/colla/proyectos/[id]/`

### Fase 4: Polishing y Estándares (Semana 9-10)
- [ ] Implementación completa de WCAG 2.1 AA
- [ ] Configuración PWA funcional
- [ ] Microdatos Schema.org en todas las páginas
- [ ] Pruebas de accesibilidad y rendimiento
- [ ] Documentación completa para usuarios y desarrolladores

## 📏 CRITERIOS DE ACEPTACIÓN
- Todas las URLs siguen convenciones intuitivas documentadas
- Sistema de referencias @ y # funciona en todas las apps
- Motor de IA genera prompts contextuales útiles para desarrollo
- Cumple WCAG 2.1 AA (verificado con herramientas automáticas)
- Estructura de archivos permite fácil mantenimiento y escalabilidad
- Documentación permite a nuevos desarrolladores contribuir rápidamente

## 💡 NOTAS ADICIONALES
- Priorizar soberanía de datos: todos los datos permanecen en localStorage del usuario
- Diseñar para offline-first: funcionalidad básica sin conexión
- Implementar sistema de versionado semántico para APIs internas
- Crear sistema de plugins para extensibilidad futura
- Documentar decisiones de arquitectura en `/docs/DECISIONS.md`

## 🌐 RECURSOS DE REFERENCIA
- WCAG 2.1: https://www.w3.org/TR/WCAG21/
- Schema.org: https://schema.org/
- W3C Web App Manifest: https://www.w3.org/TR/appmanifest/
- Content Security Policy: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP

¡Comienza el desarrollo de TeamTowers Humà v1.1 con esta arquitectura robusta y escalable!

✨ VALOR DIFERENCIAL DE ESTA ARQUITECTURA

    Soberanía de Datos Garantizada: Cada proyecto mantiene sus datos en localStorage, con exportación/importación estandarizada
    Conocimiento Preservado: Sistema de entidades y conceptos que evoluciona con cada proyecto
    IA Contextual Útil: No solo responde preguntas, sino que genera prompts de desarrollo específicos para cada necesidad
    Accesibilidad Nativa: Diseñado desde el principio para ser usable por todos
    Escalabilidad Modular: Nuevas apps se integran fácilmente mediante componentes compartidos
    Documentación Viva: Sistema auto-documentado con ejemplos reales de proyectos

Esta arquitectura transforma TeamTowers Humà de un conjunto de apps en un ecosistema digital inteligente que aprende, preserva y potencia el conocimiento colectivo de "La Colla". 🏰✨


