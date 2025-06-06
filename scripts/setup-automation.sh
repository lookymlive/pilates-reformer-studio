#!/bin/bash

# =============================================================================
# SCRIPT DE CONFIGURACIÓN AUTOMÁTICA PARA PILATES STUDIO APP
# =============================================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar dependencias requeridas
check_dependencies() {
    log_info "Verificando dependencias..."
    
    local deps=("node" "pnpm" "git")
    local missing_deps=()
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing_deps+=("$dep")
        fi
    done
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Dependencias faltantes: ${missing_deps[*]}"
        echo "Por favor instala:"
        for dep in "${missing_deps[@]}"; do
            case $dep in
                node)
                    echo "  - Node.js: https://nodejs.org/"
                    ;;
                pnpm)
                    echo "  - pnpm: npm install -g pnpm"
                    ;;
                git)
                    echo "  - Git: https://git-scm.com/"
                    ;;
            esac
        done
        exit 1
    fi
    
    log_success "Todas las dependencias están instaladas"
}

# Verificar versiones mínimas
check_versions() {
    log_info "Verificando versiones mínimas..."
    
    # Verificar Node.js >= 18
    node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        log_error "Node.js debe ser versión 18 o superior (actual: $(node --version))"
        exit 1
    fi
    
    # Verificar pnpm >= 8
    pnpm_version=$(pnpm --version | cut -d'.' -f1)
    if [ "$pnpm_version" -lt 8 ]; then
        log_error "pnpm debe ser versión 8 o superior (actual: $(pnpm --version))"
        exit 1
    fi
    
    log_success "Versiones verificadas correctamente"
}

# Configurar estructura del proyecto
setup_project_structure() {
    log_info "Configurando estructura del proyecto..."
    
    # Crear directorios principales
    mkdir -p {apps/{web,mobile},packages/{shared,ui,config},docs,scripts}
    mkdir -p {docs,charts,imgs,data,search_results,browser/{downloads,screenshots,extracted_content,sessions}}
    
    log_success "Estructura de directorios creada"
}

# Instalar Supabase CLI si no está disponible
install_supabase_cli() {
    if ! command -v supabase &> /dev/null; then
        log_info "Instalando Supabase CLI..."
        npm install -g supabase
        log_success "Supabase CLI instalado"
    else
        log_success "Supabase CLI ya está instalado"
    fi
}

# Configurar variables de entorno
setup_environment() {
    log_info "Configurando variables de entorno..."
    
    if [ ! -f .env.local ]; then
        cat > .env.local << EOF
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=pilates_uploads

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Features
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_OFFLINE=false
MAX_FILE_UPLOAD_SIZE=5242880

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Push Notifications (Expo)
EXPO_PUSH_TOKEN=your-expo-push-token

# Analytics (opcional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
EOF
        log_warning "Archivo .env.local creado. ¡IMPORTANTE: Actualiza las variables con tus credenciales!"
    else
        log_info "Archivo .env.local ya existe"
    fi
}

# Crear package.json raíz
create_root_package() {
    if [ ! -f package.json ]; then
        log_info "Creando package.json raíz..."
        
        cat > package.json << 'EOF'
{
  "name": "pilates-studio-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "test": "turbo run test",
    "test:e2e": "turbo run test:e2e",
    "clean": "turbo run clean",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "db:generate": "supabase gen types typescript --local > packages/shared/src/types/database.ts",
    "db:push": "supabase db push",
    "db:reset": "supabase db reset",
    "db:migrate": "supabase migration new",
    "setup": "pnpm install && pnpm db:push && pnpm db:generate"
  },
  "devDependencies": {
    "@turbo/gen": "^1.10.0",
    "turbo": "^1.10.0",
    "supabase": "^1.100.0",
    "typescript": "^5.2.0",
    "prettier": "^3.0.0",
    "eslint": "^8.50.0",
    "@types/node": "^20.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.10.0"
}
EOF
        log_success "package.json raíz creado"
    else
        log_info "package.json ya existe"
    fi
}

# Crear configuración de workspaces
create_workspace_config() {
    if [ ! -f pnpm-workspace.yaml ]; then
        log_info "Creando configuración de workspaces..."
        
        cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
EOF
        log_success "pnpm-workspace.yaml creado"
    fi
}

# Crear configuración de Turborepo
create_turbo_config() {
    if [ ! -f turbo.json ]; then
        log_info "Creando configuración de Turborepo..."
        
        cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "type-check": {
      "dependsOn": ["^type-check"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "test:e2e": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "clean": {
      "cache": false
    }
  }
}
EOF
        log_success "turbo.json creado"
    fi
}

# Instalar dependencias raíz
install_root_dependencies() {
    log_info "Instalando dependencias raíz..."
    pnpm install
    log_success "Dependencias raíz instaladas"
}

# Inicializar Supabase
init_supabase() {
    log_info "Inicializando Supabase..."
    
    if [ ! -d supabase ]; then
        supabase init
        log_success "Supabase inicializado"
    else
        log_info "Supabase ya está inicializado"
    fi
    
    # Copiar esquema de base de datos si existe
    if [ -f "../code/supabase-setup.sql" ]; then
        cp "../code/supabase-setup.sql" "supabase/migrations/$(date +%Y%m%d%H%M%S)_initial_schema.sql"
        log_success "Esquema inicial copiado"
    fi
}

# Crear .gitignore
create_gitignore() {
    if [ ! -f .gitignore ]; then
        log_info "Creando .gitignore..."
        
        cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output

# Next.js
.next/
out/

# Expo
.expo/
dist/
web-build/

# Production builds
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional stylelint cache
.stylelintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Supabase
.branches
.temp
.vscode/settings.json

# Turborepo
.turbo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Logs
logs
*.log

# Local env files
.env*.local

# Vercel
.vercel

# Temporary folders
tmp/
temp/
EOF
        log_success ".gitignore creado"
    fi
}

# Crear README.md
create_readme() {
    if [ ! -f README.md ]; then
        log_info "Creando README.md..."
        
        cat > README.md << 'EOF'
# Silvia Fernandez Pilates Studio

Aplicación completa de gestión de turnos para estudio de Pilates Reformer.

## 🚀 Tecnologías

- **Frontend Web**: Next.js 15
- **Frontend Mobile**: Expo 51
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Media**: Cloudinary
- **Monorepo**: pnpm + Turborepo
- **UI**: Tailwind CSS + HeadlessUI
- **State**: Zustand + React Query
- **Validation**: Zod
- **Testing**: Playwright + Jest

## 📁 Estructura del Proyecto

```
pilates-studio/
├── apps/
│   ├── web/          # Aplicación Next.js
│   └── mobile/       # Aplicación Expo
├── packages/
│   ├── shared/       # Lógica compartida
│   ├── ui/           # Componentes UI
│   └── config/       # Configuraciones
├── docs/             # Documentación
└── scripts/          # Scripts de automatización
```

## 🛠️ Setup de Desarrollo

### Prerrequisitos

- Node.js 18+
- pnpm 8+
- Git

### Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd pilates-studio
```

2. Ejecutar setup automático:
```bash
./scripts/setup.sh
```

3. Configurar variables de entorno:
```bash
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

4. Iniciar desarrollo:
```bash
pnpm dev
```

## 📱 Aplicaciones

### Web (Next.js)
- **URL**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Comando**: `pnpm dev` en `/apps/web`

### Mobile (Expo)
- **Comando**: `pnpm dev` en `/apps/mobile`
- **Web**: http://localhost:8081
- **QR Code**: Escanear con Expo Go

## 🧪 Testing

```bash
# Tests unitarios
pnpm test

# Tests E2E
pnpm test:e2e

# Linting
pnpm lint

# Type checking
pnpm type-check
```

## 🚀 Despliegue

### Web (Vercel)
```bash
pnpm build
vercel --prod
```

### Mobile (EAS)
```bash
cd apps/mobile
eas build --platform all --profile production
eas submit --platform all
```

## 📖 Documentación

- [Guía Técnica Completa](./docs/guia_tecnica_pilates_app.md)
- [API Documentation](./docs/api-documentation.md)
- [Contributing Guide](./docs/contributing.md)

## 👥 Roles de Usuario

- **Admin (Silvia)**: Gestión completa del estudio
- **Instructores**: Gestión de sus clases y alumnos
- **Clientes**: Reserva de clases y gestión de perfil

## 📞 Soporte

Para soporte técnico, contactar al equipo de desarrollo.
EOF
        log_success "README.md creado"
    fi
}

# Función principal
main() {
    echo "🏃‍♀️ Configurando Pilates Studio App..."
    echo "========================================"
    
    check_dependencies
    check_versions
    setup_project_structure
    install_supabase_cli
    setup_environment
    create_root_package
    create_workspace_config
    create_turbo_config
    create_gitignore
    create_readme
    install_root_dependencies
    init_supabase
    
    echo ""
    echo "========================================"
    log_success "¡Configuración completada exitosamente!"
    echo ""
    echo "📝 Próximos pasos:"
    echo "1. Edita .env.local con tus credenciales de Supabase y Cloudinary"
    echo "2. Ejecuta 'pnpm dev' para iniciar el desarrollo"
    echo "3. Lee la documentación en docs/guia_tecnica_pilates_app.md"
    echo ""
    log_warning "⚠️  Recuerda configurar las variables de entorno antes de continuar"
}

# Verificar si el script se ejecuta directamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
