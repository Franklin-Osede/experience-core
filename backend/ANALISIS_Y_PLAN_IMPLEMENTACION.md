# 📊 Análisis de Infraestructura y Plan de Implementación

## ✅ Lo que está BIEN

### 1. **Arquitectura DDD Sólida**
- ✅ Separación clara de capas (Domain/Application/Infrastructure)
- ✅ Entidades de dominio con lógica de negocio encapsulada
- ✅ Value Objects bien diseñados (Money con validación de moneda)
- ✅ Eventos de dominio para comunicación entre módulos
- ✅ Repositorios como interfaces (fácil cambiar implementación)

### 2. **Módulos Implementados**

#### **Identity Module**
- ✅ Entidad `User` con roles (DJ, FAN, FOUNDER)
- ✅ Sistema de invitaciones híbrido:
  - DJs: invitaciones ilimitadas
  - FOUNDER: 10 invitaciones
  - FAN: 0 inicialmente, desbloquean 3 después del primer evento
- ✅ Sistema de reputación y deuda
- ✅ Verificación de foto de perfil
- ✅ Event listener para desbloquear invitaciones tras asistir a eventos

#### **Finance Module**
- ✅ Entidad `Wallet` con balance y lockedBalance (Escrow)
- ✅ Value Object `Money` con validación de moneda y aritmética segura
- ✅ Split payments implementados
- ✅ Auto-creación de wallet al crear usuario

#### **Event Module**
- ✅ Máquina de estados robusta (DRAFT → PUBLISHED → CONFIRMED → COMPLETED/CANCELLED)
- ✅ Validaciones de negocio (venue requerido para publicar, fechas válidas)
- ✅ RSVP y check-in implementados
- ✅ Sistema de no-shows con deuda
- ✅ Gig market (venues postean disponibilidad, DJs aplican)
- ✅ Géneros de eventos (HOUSE, SALSA, BACHATA, etc.)

### 3. **API REST**
- ✅ Swagger/OpenAPI configurado
- ✅ Versionado `/api/v1/`
- ✅ Validación global con class-validator
- ✅ Endpoints básicos de eventos (create, list, publish, RSVP, check-in)
- ✅ Autenticación JWT scaffolded

### 4. **Testing**
- ✅ Tests unitarios para entidades de dominio
- ✅ Cobertura de reglas de negocio

---

## ⚠️ Problemas Identificados

### 1. **Tests Failing** 🔴
- ❌ `event.entity.spec.ts` falla porque falta `genre` en los fixtures
- **Impacto**: No se puede ejecutar `npm test` exitosamente
- **Prioridad**: ALTA (bloquea CI/CD)

### 2. **Falta de Persistencia** 🔴
- ❌ Solo repositorios en memoria (todo se pierde al reiniciar)
- ❌ TypeORM instalado pero no configurado
- ❌ No hay migraciones ni esquemas de base de datos
- **Impacto**: No es usable en producción
- **Prioridad**: CRÍTICA

### 3. **APIs Faltantes** 🟡
Muchos casos de uso implementados pero sin endpoints:

#### **Finance Module**
- ❌ `GET /api/v1/wallets/:userId` - Consultar balance
- ❌ `POST /api/v1/wallets/:userId/deposit` - Depositar fondos
- ❌ `POST /api/v1/split-payments` - Crear split payment
- ❌ `POST /api/v1/split-payments/:id/pay` - Pagar cuota

#### **Event Module**
- ❌ `POST /api/v1/events/:id/fund` - Marcar evento como financiado (Escrow)
- ❌ `POST /api/v1/events/:id/complete` - Marcar evento como completado
- ❌ `POST /api/v1/events/:id/cancel` - Cancelar evento
- ❌ `GET /api/v1/events/:id/rsvps` - Listar RSVPs de un evento
- ❌ `GET /api/v1/venues/availability` - Listar disponibilidades
- ❌ `POST /api/v1/venues/availability` - Publicar disponibilidad
- ❌ `POST /api/v1/gigs/apply` - Aplicar a un gig
- ❌ `POST /api/v1/gigs/:id/accept` - Aceptar aplicación de gig
- ❌ `GET /api/v1/gigs/applications` - Listar aplicaciones

#### **Identity Module**
- ❌ `POST /api/v1/auth/signup` - Registro (solo existe login)
- ❌ `GET /api/v1/users/me` - Perfil del usuario autenticado
- ❌ `GET /api/v1/users/:id/invites` - Consultar créditos de invitación
- ❌ `POST /api/v1/users/invite` - Invitar usuario

### 4. **DTOs y Respuestas** 🟡
- ❌ Los endpoints devuelven entidades de dominio directamente
- ❌ Falta paginación en listados
- ❌ No hay DTOs de respuesta consistentes
- **Impacto**: Acoplamiento con el frontend, difícil evolucionar

### 5. **Configuración y Seguridad** 🟡
- ⚠️ JWT secret probablemente hardcodeado o default
- ❌ No hay rate limiting
- ❌ No hay logging estructurado
- ❌ No hay manejo centralizado de errores
- ❌ Variables de entorno no documentadas

### 6. **Jobs/Background Tasks** 🟡
- ❌ `ProcessNoShowDebtUseCase` existe pero no hay scheduler
- **Impacto**: La deuda de no-shows no se procesa automáticamente

### 7. **Validaciones de Negocio** 🟡
- ⚠️ `Money.subtract()` permite balances negativos (sin guard)
- **Impacto**: Posible inconsistencia financiera

### 8. **AppModule Scaffold** 🟡
- ⚠️ `AppController` y `AppService` no se usan pero existen
- **Impacto**: Confusión, código muerto

---

## 🎯 Plan de Implementación (Antes de Frontend)

### **FASE 1: Correcciones Críticas** (1-2 días)

#### 1.1 Arreglar Tests
- [ ] Agregar `genre` a fixtures en `event.entity.spec.ts`
- [ ] Ejecutar `npm test` y verificar que todos pasen
- [ ] Agregar tests para validar que `genre` es requerido

#### 1.2 Configurar Base de Datos
- [ ] Crear archivo `.env.example` con variables de entorno
- [ ] Configurar TypeORM en `app.module.ts`
- [ ] Crear entidades TypeORM para:
  - `User` (identity)
  - `Wallet`, `Transaction` (finance)
  - `Event`, `EventAttendee` (event)
  - `VenueAvailability`, `GigApplication` (event)
  - `SplitPayment` (finance)
- [ ] Crear migración inicial
- [ ] Reemplazar repositorios en memoria por TypeORM
- [ ] Agregar seeds para datos iniciales (DJs de Valencia)

#### 1.3 Seguridad Básica
- [ ] Mover JWT secret a variables de entorno
- [ ] Agregar validación de variables de entorno requeridas
- [ ] Configurar rate limiting básico

---

### **FASE 2: APIs Faltantes** (3-4 días)

#### 2.1 Finance APIs
- [ ] Crear `FinanceController`
- [ ] `GET /api/v1/wallets/me` - Balance del usuario autenticado
- [ ] `POST /api/v1/wallets/deposit` - Depositar (simulado para MVP)
- [ ] `POST /api/v1/split-payments` - Crear split
- [ ] `POST /api/v1/split-payments/:id/pay` - Pagar cuota
- [ ] Agregar DTOs de request/response

#### 2.2 Event APIs Extendidas
- [ ] `POST /api/v1/events/:id/fund` - Marcar como financiado
- [ ] `POST /api/v1/events/:id/complete` - Completar evento
- [ ] `POST /api/v1/events/:id/cancel` - Cancelar evento
- [ ] `GET /api/v1/events/:id/rsvps` - Listar RSVPs (con paginación)
- [ ] Agregar filtros avanzados a `GET /api/v1/events` (por género, fecha, etc.)

#### 2.3 Gig Market APIs
- [ ] Crear `GigController` o extender `EventController`
- [ ] `GET /api/v1/venues/availability` - Listar disponibilidades
- [ ] `POST /api/v1/venues/availability` - Publicar disponibilidad
- [ ] `POST /api/v1/gigs/apply` - Aplicar a gig
- [ ] `POST /api/v1/gigs/:id/accept` - Aceptar aplicación
- [ ] `GET /api/v1/gigs/applications` - Listar aplicaciones (para venues)

#### 2.4 Identity APIs Extendidas
- [ ] `POST /api/v1/auth/signup` - Registro con validación
- [ ] `GET /api/v1/users/me` - Perfil autenticado
- [ ] `GET /api/v1/users/me/invites` - Créditos de invitación
- [ ] `POST /api/v1/users/invite` - Invitar usuario (con validación de créditos)

---

### **FASE 3: Mejoras de Calidad** (2-3 días)

#### 3.1 DTOs y Respuestas
- [ ] Crear DTOs de respuesta para todos los endpoints
- [ ] Agregar paginación estándar (page, limit, total)
- [ ] Agregar metadata de respuesta (timestamps, version, etc.)

#### 3.2 Validaciones y Errores
- [ ] Agregar guard para `Money.subtract()` (no permitir negativos)
- [ ] Crear excepciones de dominio personalizadas
- [ ] Filtro global de excepciones con formato consistente
- [ ] Agregar validación de phone number (ya tienes libphonenumber-js)

#### 3.3 Logging y Monitoreo
- [ ] Configurar logger estructurado (Winston o Pino)
- [ ] Agregar logs en casos de uso críticos
- [ ] Logging de requests/responses (opcional, para debug)

#### 3.4 Background Jobs
- [ ] Configurar `@nestjs/bull` o `@nestjs/schedule`
- [ ] Crear job para `ProcessNoShowDebtUseCase` (ejecutar diariamente)
- [ ] Agregar endpoint para ejecutar manualmente (admin)

---

### **FASE 4: Documentación y Seeds** (1 día)

#### 4.1 Documentación
- [ ] Actualizar `README.md` con instrucciones de setup
- [ ] Documentar variables de entorno en `.env.example`
- [ ] Agregar diagrama de arquitectura
- [ ] Documentar flujos principales (invitación, RSVP, check-in, no-show)

#### 4.2 Seeds
- [ ] Crear script de seeds para:
  - Usuarios iniciales (DJs de Valencia)
  - Venues de prueba
  - Eventos de ejemplo
- [ ] Documentar cómo ejecutar seeds

#### 4.3 Limpieza
- [ ] Eliminar `AppController` y `AppService` si no se usan
- [ ] Revisar imports no usados
- [ ] Ejecutar linter y corregir warnings

---

## 📋 Checklist Pre-Frontend

Antes de empezar con el frontend, verificar:

- [ ] ✅ Todos los tests pasan
- [ ] ✅ Base de datos configurada y funcionando
- [ ] ✅ Migraciones ejecutadas
- [ ] ✅ Seeds ejecutados (datos de prueba)
- [ ] ✅ Todas las APIs críticas expuestas y documentadas en Swagger
- [ ] ✅ Autenticación funcionando (signup + login)
- [ ] ✅ Variables de entorno documentadas
- [ ] ✅ Logging básico funcionando
- [ ] ✅ Swagger actualizado con todos los endpoints
- [ ] ✅ CORS configurado para el frontend
- [ ] ✅ Rate limiting básico activo

---

## 🚀 Priorización para MVP Valencia

Si el tiempo es limitado, enfocarse en:

1. **Crítico para MVP:**
   - Arreglar tests
   - Base de datos (TypeORM)
   - APIs de eventos (fund, complete, cancel, list RSVPs)
   - Autenticación completa (signup + login)
   - APIs de invitación

2. **Importante pero puede esperar:**
   - Gig market APIs (puede ser manual inicialmente)
   - Split payments (puede ser v2)
   - Background jobs (puede ejecutarse manualmente)

3. **Nice to have:**
   - Rate limiting avanzado
   - Logging detallado
   - Métricas y monitoreo

---

## 📝 Notas sobre el Modelo de Invitaciones

Tu modelo híbrido es sólido:
- ✅ DJs con invitaciones ilimitadas (correcto para crecimiento)
- ✅ FOUNDER con 10 (early adopters)
- ✅ FANs desbloquean después del primer evento (incentiva participación)

**Recomendación para verificación sin DNI:**
- Usar phone number + SMS como verificación primaria
- Opcional: linkear Instagram (trust signal, no verificación)
- Device fingerprinting para detectar múltiples cuentas
- Sistema de "vouching": si un DJ invita a alguien que causa problemas, el DJ pierde privilegios

---

## 🎯 Siguiente Paso Inmediato

**Empezar con FASE 1.1**: Arreglar los tests fallando.

¿Quieres que empiece con eso ahora?

