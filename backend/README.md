# Experience Core - Backend

**Estado:** ~95% completo | Production-ready

---

## 🎯 Descripción

Backend para Experience Core, una plataforma de experiencias de música House & Afro-beats con arquitectura DDD (Domain-Driven Design).

---

## 🏗️ Arquitectura

### DDD (Domain-Driven Design)
- **Domain Layer**: Lógica de negocio pura (Entidades, Value Objects, Repositories como interfaces)
- **Application Layer**: Use Cases / Command Handlers
- **Infrastructure Layer**: Controllers (REST API), Implementaciones de repositorios, Servicios externos

### Módulos Implementados
- ✅ **Auth**: Signup/Login con JWT
- ✅ **Identity**: Usuarios, roles, invitaciones, reputación
- ✅ **Finance**: Wallets, transacciones, split payments, Escrow
- ✅ **Events**: CRUD completo, RSVP, check-in, estados, gig market
- ✅ **Provider**: Marketplace de servicios (listings, bookings)

---

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- PostgreSQL 14+ (opcional si `USE_TYPEORM=false`)
- npm o yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones
```

### Variables de Entorno

Ver `.env.example` para todas las variables disponibles.

**Variables críticas:**
- `JWT_SECRET`: Secret para JWT tokens
- `USE_TYPEORM`: `true` para usar BD, `false` para in-memory (testing)
- `DB_*`: Solo requeridas si `USE_TYPEORM=true`

### Ejecutar

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

### Sin Base de Datos (Testing)

```bash
# En .env
USE_TYPEORM=false

# No necesitas DB_HOST, DB_USERNAME, etc.
npm run start:dev
```

---

## 📚 API Documentation

### Swagger UI
Una vez iniciado el servidor, accede a:
```
http://localhost:5555/api/docs
```

### Endpoints Principales

#### Autenticación
- `POST /api/v1/auth/signup` - Registro
- `POST /api/v1/auth/login` - Login

#### Eventos
- `GET /api/v1/events` - Listar eventos (público)
- `POST /api/v1/events` - Crear evento (DJ/VENUE)
- `PATCH /api/v1/events/:id/publish` - Publicar (organizador/ADMIN)
- `POST /api/v1/events/:id/rsvp` - RSVP a evento
- `POST /api/v1/events/:id/fund` - Financiar evento (organizador/ADMIN)

#### Finanzas
- `GET /api/v1/finance/wallet` - Ver wallet
- `POST /api/v1/finance/wallet/deposit` - Depositar fondos
- `POST /api/v1/finance/split-payments` - Crear split payment

#### Health Check
- `GET /health` - Estado del servicio

---

## 🧪 Testing

### Tests Unitarios
```bash
npm test
```

### Tests E2E
```bash
npm run test:e2e
```

**Nota:** Los tests E2E usan repositorios in-memory (`USE_TYPEORM=false`)

---

## 🗄️ Base de Datos

### Migraciones

```bash
# Generar migración
npm run migration:generate -- -n MigrationName

# Ejecutar migraciones
npm run migration:run

# Revertir última migración
npm run migration:revert

# Ver estado de migraciones
npm run migration:show
```

### Seeds

```bash
# Ejecutar seeds (crea usuarios de ejemplo)
npm run seed
```

**Usuarios creados:**
- 2 FOUNDERs (10 invites cada uno)
- 3 DJs (invites ilimitadas)
- 2 VENUEs (5 invites cada uno)
- 3 FANs (0 invites inicialmente)
- 1 ADMIN

**Password por defecto:** `password123`

**Nota:** Los seeds limpian la base de datos antes de insertar datos nuevos.

---

## 🔐 Seguridad

### Autorización por Roles
- Endpoints protegidos con `@Roles()` decorator
- Solo usuarios con roles específicos pueden acceder

### Ownership
- Los organizadores solo pueden modificar sus propios eventos
- ADMIN puede modificar cualquier recurso

### JWT
- Tokens JWT con expiración configurable
- Refresh tokens (próximamente)

---

## 📦 Estructura del Proyecto

```
src/
├── modules/
│   ├── auth/           # Autenticación
│   ├── identity/       # Usuarios e invitaciones
│   ├── finance/        # Wallets y pagos
│   ├── event/          # Eventos y gig market
│   └── provider/       # Marketplace de servicios
├── shared/             # Código compartido
│   ├── domain/         # Value Objects, Entity base
│   └── infrastructure/ # Guards, decorators, DTOs
├── config/             # Configuraciones
└── migrations/         # Migraciones de BD
```

---

## 🛠️ Scripts Disponibles

```bash
npm run build          # Compilar TypeScript
npm run start          # Iniciar en producción
npm run start:dev      # Iniciar en desarrollo (watch)
npm run start:debug    # Iniciar en modo debug
npm test               # Ejecutar tests unitarios
npm run test:e2e       # Ejecutar tests E2E
npm run lint           # Linter
npm run format         # Formatear código

# Migraciones
npm run migration:generate
npm run migration:run
npm run migration:revert
npm run migration:show
```

---

## 📊 Estado de Implementación

### Completado (98%)
- ✅ Todos los módulos core implementados
- ✅ Autorización por roles
- ✅ Verificación de ownership
- ✅ DTOs de respuesta consistentes
- ✅ Tests E2E completos
- ✅ Health check endpoint
- ✅ Scripts de migración
- ✅ Seeds de datos
- ✅ Docker configuration
- ✅ CI/CD básico (GitHub Actions)

### Pendiente (2%)
- ⏳ Métricas y observabilidad (opcional)
- ⏳ Optimizaciones avanzadas (opcional)

---

## 🐳 Docker (Próximamente)

```bash
# Build
docker build -t experience-core-backend .

# Run
docker-compose up
```

---

## 🤝 Contribuir

1. Crear branch desde `main`
2. Implementar cambios
3. Ejecutar tests
4. Crear PR

---

## 📝 Licencia

UNLICENSED

---

**Última actualización:** $(date)
