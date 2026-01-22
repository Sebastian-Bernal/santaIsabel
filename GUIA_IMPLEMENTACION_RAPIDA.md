# Guía Rápida de Implementación

**Comandos y scripts listos para ejecutar**

---

## 🚀 Creación de Estructura de Carpetas

### Script de Creación Automática

**Para Windows PowerShell:**

```powershell
# Cambiar a la carpeta del proyecto
cd C:\Users\CAMILO\Desktop\thesalus\santaIsabel

# Crear estructura base
$folders = @(
    "src/core/entities",
    "src/core/services",
    "src/core/repositories",
    "src/core/validators",
    "src/core/dtos",
    "src/core/errors",
    "src/core/interfaces",
    "src/infrastructure/repositories",
    "src/infrastructure/http",
    "src/infrastructure/database",
    "src/infrastructure/cache",
    "src/infrastructure/config",
    "src/infrastructure/providers",
    "src/application/composables",
    "src/application/stores/modules",
    "src/application/middleware",
    "src/presentation/components/atoms/Buttons",
    "src/presentation/components/atoms/Inputs",
    "src/presentation/components/molecules",
    "src/presentation/components/organisms/Pacientes",
    "src/presentation/components/organisms/Historias",
    "src/presentation/components/organisms/Citas",
    "src/presentation/components/templates",
    "src/presentation/pages/Pacientes",
    "src/presentation/pages/Historias",
    "src/presentation/pages/Citas",
    "src/presentation/builders",
    "src/presentation/directives",
    "src/presentation/layouts",
    "src/utils/formatters",
    "src/utils/helpers",
    "src/utils/parsers",
    "src/utils/constants",
    "src/utils/types",
    "src/styles",
    "src/plugins",
    "src/router",
    "tests/unit/services",
    "tests/unit/validators",
    "tests/unit/utils",
    "tests/integration",
    "tests/e2e",
    "docs"
)

foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Force -Path $folder | Out-Null
        Write-Host "✓ Creada carpeta: $folder"
    }
}

Write-Host "`nEstructura de carpetas creada exitosamente ✓"
```

**Para macOS/Linux (Bash):**

```bash
#!/bin/bash

cd /path/to/santaIsabel

folders=(
    "src/core/entities"
    "src/core/services"
    "src/core/repositories"
    "src/core/validators"
    "src/core/dtos"
    "src/core/errors"
    "src/infrastructure/repositories"
    "src/infrastructure/http"
    "src/infrastructure/database"
    "src/infrastructure/cache"
    "src/application/composables"
    "src/application/stores/modules"
    "src/presentation/components/atoms/Buttons"
    "src/presentation/components/molecules"
    "src/presentation/components/organisms"
    "src/presentation/pages"
    "src/utils/formatters"
    "src/utils/helpers"
    "tests/unit"
    "tests/e2e"
)

for folder in "${folders[@]}"; do
    mkdir -p "$folder"
    echo "✓ Creada carpeta: $folder"
done

echo ""
echo "Estructura de carpetas creada exitosamente ✓"
```

---

## 📝 Crear Archivos Base

### 1. Crear PacienteService.ts

```bash
cat > src/core/services/PacienteService.ts << 'EOF'
// Copiar contenido del archivo EJEMPLOS_CODIGO_PRACTICO.md
// Sección: PacienteService
EOF
```

### 2. Crear PacienteRepository.ts

```bash
cat > src/core/repositories/PacienteRepository.ts << 'EOF'
// Copiar contenido de la interfaz
EOF
```

### 3. Crear HttpClient.ts

```bash
cat > src/infrastructure/http/HttpClient.ts << 'EOF'
// Copiar de EJEMPLOS_CODIGO_PRACTICO.md
EOF
```

---

## 🔧 Instalación de Dependencias

### Paquetes Recomendados

```bash
# Dependencias principales
npm install pinia @pinia/testing

# Testing
npm install -D vitest @vitest/ui
npm install -D @testing-library/vue

# Type Safety
npm install -D typescript @types/node

# Linting
npm install -D eslint prettier eslint-config-prettier

# Desarrollo
npm install -D @vite-pwa/vite-plugin

# Utilities
npm install axios date-fns lodash

# Validación
npm install joi zod
```

---

## 🧪 Configuración de Testing

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
    plugins: [vue()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./tests/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'tests/setup.ts',
                '**/*.spec.ts',
                '**/*.test.ts'
            ]
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
})
```

### tests/setup.ts

```typescript
import { vi } from 'vitest'

// Mock de localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
}
global.localStorage = localStorageMock as any

// Mock de indexedDB
global.indexedDB = {
    open: vi.fn()
} as any
```

---

## 📋 Checklist de Implementación Rápida

### Día 1: Setup Inicial
- [ ] Crear estructura de carpetas
- [ ] Instalar dependencias
- [ ] Configurar testing
- [ ] Crear .env files

```bash
# Crear .env
echo "VITE_API_URL=http://localhost:3000" > .env.development
echo "VITE_API_URL=https://api.production.com" > .env.production
```

### Día 2-3: Infraestructura Base
- [ ] Crear HttpClient.ts
- [ ] Crear CacheManager.ts
- [ ] Tests unitarios

```bash
# Ejecutar tests
npm run test
```

### Día 4-5: Servicios
- [ ] Crear PacienteService.ts
- [ ] Crear PacienteValidator.ts
- [ ] Crear repositorios
- [ ] Tests de servicios

### Día 6-7: Stores y Composables
- [ ] Refactorizar usePacientesStore
- [ ] Crear usePacientes() composable
- [ ] Tests de integración

### Día 8-10: Migración de Componentes
- [ ] Actualizar PacientesList.vue
- [ ] Actualizar PacienteForm.vue
- [ ] Actualizar PacienteDetail.vue
- [ ] QA testing

---

## 🔍 Validar Implementación

### Script de Validación

```typescript
// validate-architecture.ts
import * as fs from 'fs'
import * as path from 'path'

interface ArchitectureCheck {
    name: string
    path: string
    required: boolean
}

const checks: ArchitectureCheck[] = [
    // Core
    { name: 'PacienteService', path: 'src/core/services/PacienteService.ts', required: true },
    { name: 'HistoriaService', path: 'src/core/services/HistoriaService.ts', required: false },
    
    // Infrastructure
    { name: 'HttpClient', path: 'src/infrastructure/http/HttpClient.ts', required: true },
    { name: 'CacheManager', path: 'src/infrastructure/cache/CacheManager.ts', required: true },
    { name: 'SyncManager', path: 'src/infrastructure/database/SyncManager.ts', required: false },
    
    // Application
    { name: 'useCRUD', path: 'src/application/composables/useCRUD.ts', required: true },
    { name: 'usePacientes', path: 'src/application/composables/usePacientes.ts', required: true },
    { name: 'pacientesStore', path: 'src/application/stores/modules/pacientes.ts', required: true }
]

function validateArchitecture() {
    console.log('\n🔍 Validando Arquitectura...\n')
    
    let passed = 0
    let failed = 0
    
    checks.forEach(check => {
        const fullPath = path.join(process.cwd(), check.path)
        const exists = fs.existsSync(fullPath)
        
        if (exists) {
            console.log(`✅ ${check.name}`)
            passed++
        } else {
            const required = check.required ? '❌ REQUERIDO' : '⚠️  Opcional'
            console.log(`${required}: ${check.name}`)
            if (check.required) failed++
        }
    })
    
    console.log(`\n✅ Pasadas: ${passed}`)
    console.log(`❌ Faltantes: ${failed}`)
    
    if (failed === 0) {
        console.log('\n🎉 ¡Arquitectura validada exitosamente!')
        return true
    } else {
        console.log('\n⚠️  Hay archivos faltantes requeridos')
        return false
    }
}

validateArchitecture()
```

**Ejecutar:**
```bash
npx ts-node validate-architecture.ts
```

---

## 📊 Monitoreo de Performance

### Script de Análisis

```typescript
// monitor-performance.ts
import { performance } from 'perf_hooks'

export class PerformanceMonitor {
    private metrics: Map<string, number> = new Map()
    
    startMeasure(label: string) {
        performance.mark(`${label}-start`)
    }
    
    endMeasure(label: string) {
        performance.mark(`${label}-end`)
        try {
            performance.measure(label, `${label}-start`, `${label}-end`)
            const measure = performance.getEntriesByName(label)[0]
            this.metrics.set(label, measure.duration)
            return measure.duration
        } catch (e) {
            console.error(`Error measuring ${label}:`, e)
            return 0
        }
    }
    
    report() {
        console.log('\n📊 Performance Report\n')
        
        const sorted = Array.from(this.metrics.entries())
            .sort((a, b) => b[1] - a[1])
        
        sorted.forEach(([label, time]) => {
            const status = time > 1000 ? '⚠️ ' : '✅'
            console.log(`${status} ${label}: ${time.toFixed(2)}ms`)
        })
    }
}

// Uso
const monitor = new PerformanceMonitor()

monitor.startMeasure('app-init')
// ... código
monitor.endMeasure('app-init')

monitor.startMeasure('api-call')
// ... llamada API
monitor.endMeasure('api-call')

monitor.report()
```

---

## 🔑 Configuración de Environments

### .env.development

```
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=10000
VITE_CACHE_TTL=600000
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

### .env.production

```
VITE_API_URL=https://api.santaisabel.com
VITE_API_TIMEOUT=30000
VITE_CACHE_TTL=3600000
VITE_DEBUG=false
VITE_LOG_LEVEL=error
```

### Cargar en main.ts

```typescript
export const config = {
    apiUrl: import.meta.env.VITE_API_URL,
    apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
    cacheTtl: parseInt(import.meta.env.VITE_CACHE_TTL || '600000'),
    debug: import.meta.env.VITE_DEBUG === 'true',
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'info'
}
```

---

## 📚 Documentación de Referencia

### Estructura mínima en README.md

```markdown
# Santa Isabel - Sistema de Gestión Clínica

## Arquitectura

### Capas
- **Presentación**: Componentes Vue
- **Aplicación**: Stores y Composables
- **Dominio**: Servicios de negocio
- **Infraestructura**: HTTP, BD, Caché

### Estructura de carpetas

\`\`\`
src/
├── core/              # Lógica de dominio
├── infrastructure/    # Detalles técnicos
├── application/       # Stores y composables
├── presentation/      # Componentes Vue
└── utils/            # Utilidades
\`\`\`

## Guía de Desarrollo

### Crear una nueva entidad

1. Crear servicio: `src/core/services/XxxService.ts`
2. Crear repositorio: `src/infrastructure/repositories/HttpXxxRepository.ts`
3. Crear store: `src/application/stores/modules/xxx.ts`
4. Crear composable: `src/application/composables/useXxx.ts`
5. Crear componentes en `src/presentation/components/organisms/Xxx/`

### Flujo de datos

Usuario → Componente → Composable → Store → Servicio → Repositorio → API/BD

## Ejecutar

\`\`\`bash
npm run dev       # Desarrollo
npm run build     # Producción
npm run test      # Tests
npm run lint      # Linting
\`\`\`
```

---

## 🚨 Troubleshooting

### Problema: "Cannot find module '@/core/services/PacienteService'"

**Solución:**
```typescript
// Verificar tsconfig.json
{
    "compilerOptions": {
        "baseUrl": ".",
        "paths": {
            "@/*": ["src/*"]
        }
    }
}
```

### Problema: "IndexedDB not defined"

**Solución:**
```typescript
// En composables, verificar que estés en cliente
import { useSSRContext } from 'vue'

export function useDatabase() {
    if (process.server) return // Skip en SSR
    // Usar IndexedDB
}
```

### Problema: "Store not initialized"

**Solución:**
```typescript
// En main.ts, asegurar orden correcto
app.use(pinia) // ANTES de router y componentes
app.use(router)
app.mount('#app')
```

### Problema: "API returns 401 unauthorized"

**Solución:**
```typescript
// Verificar token en localStorage
if (!localStorage.getItem('token')) {
    router.push('/login')
}

// O usar interceptor
httpClient.setHeader('Authorization', `Bearer ${token}`)
```

---

## 📞 Soporte

### Recursos
- 📖 Documentación: `/docs/GUIA_DESARROLLO.md`
- 🧪 Tests de ejemplo: `/tests/unit/services/PacienteService.spec.ts`
- 💡 Ejemplos de código: `EJEMPLOS_CODIGO_PRACTICO.md`

### Contacto
- Equipo técnico: tech@santaisabel.com
- Issues: GitHub issues
- Chat: #development en Slack

---

*Guía Rápida de Implementación*
*Última actualización: 22 de enero de 2026*
