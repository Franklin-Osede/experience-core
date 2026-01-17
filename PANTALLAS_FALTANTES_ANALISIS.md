# 📊 Análisis de Pantallas Faltantes - Según Backend Logic

**Fecha:** 2026-01-15  
**Estado:** Análisis completo de funcionalidades del backend vs frontend implementado

---

## ✅ Pantallas Ya Implementadas

1. **Login** (`/login`) ✅
2. **Role Selection** (`/role-selection`) ✅
3. **Onboarding** (`/onboarding/*`) ✅
   - Fan ✅
   - DJ ✅
   - Venue ✅
   - Provider ✅
4. **Profile** (`/profile`) ✅
5. **Settings/Security** (`/settings/security`) ✅

---

## ❌ Pantallas Faltantes Críticas (Según Backend)

### 🔴 FASE 1: EVENTOS (Core de la Plataforma)

#### 1. **Lista de Eventos** (`/events`)
- **Backend:** `GET /api/v1/events` ✅
- **Funcionalidad:**
  - Listar eventos con filtros (tipo, género, fecha, estado)
  - Paginación
  - Búsqueda
  - Estados: DRAFT, PUBLISHED, CONFIRMED, COMPLETED, CANCELLED
- **Prioridad:** 🔴 CRÍTICA
- **Roles:** Todos (público para PUBLISHED)

#### 2. **Detalle de Evento** (`/events/:id`)
- **Backend:** `GET /api/v1/events/:id` ✅
- **Funcionalidad:**
  - Ver información completa del evento
  - Botón RSVP (FANs)
  - Botón Cancelar RSVP
  - Acciones según rol:
    - **DJ/VENUE:** Publicar, Financiar, Completar, Cancelar
    - **FAN:** RSVP, Cancelar RSVP
- **Endpoints relacionados:**
  - `POST /api/v1/events/:id/rsvp` ✅
  - `DELETE /api/v1/events/:id/rsvp` ✅
  - `PATCH /api/v1/events/:id/publish` ✅
  - `POST /api/v1/events/:id/fund` ✅
  - `POST /api/v1/events/:id/complete` ✅
  - `POST /api/v1/events/:id/cancel` ✅
- **Prioridad:** 🔴 CRÍTICA

#### 3. **Crear Evento** (`/events/create`)
- **Backend:** `POST /api/v1/events` ✅
- **Funcionalidad:**
  - Formulario completo para crear evento
  - Tipo: HOUSE_DAY, CLUB_NIGHT, AFRO_SESSION, PRIVATE_LAB
  - Género, fecha, hora, venue
  - Guardar como DRAFT
- **Prioridad:** 🔴 CRÍTICA
- **Roles:** DJ, VENUE

#### 4. **Mis Eventos** (`/events/my-events`)
- **Backend:** `GET /api/v1/events` (con filtros) ✅
- **Funcionalidad:**
  - Tabs: "Organizando" y "Asistiendo"
  - Filtrar por userId
  - Ver estado de cada evento
- **Prioridad:** 🟡 ALTA
- **Roles:** Todos

#### 5. **Gestión de RSVPs** (`/events/:id/rsvps`)
- **Backend:** `GET /api/v1/events/:id/rsvps` ✅
- **Funcionalidad:**
  - Lista de asistentes
  - Check-in en el evento
  - Ver información de cada RSVP
- **Prioridad:** 🟡 ALTA
- **Roles:** DJ, VENUE (organizador), ADMIN

#### 6. **Check-in de Evento** (`/events/:id/check-in`)
- **Backend:** `POST /api/v1/events/:id/check-in` ✅
- **Funcionalidad:**
  - Escanear QR o buscar usuario
  - Marcar asistencia
- **Prioridad:** 🟢 MEDIA
- **Roles:** VENUE (organizador), ADMIN

---

### 🔴 FASE 2: GIG MARKET (DJs y VENUEs)

#### 7. **Lista de Disponibilidades** (`/gigs/availability`)
- **Backend:** `GET /api/v1/gigs/venues/availability` ✅
- **Funcionalidad:**
  - Listar disponibilidades de venues
  - Filtros: venueId, status, fromDate, toDate
  - Ver detalles: fecha, minGuarantee, términos
- **Prioridad:** 🟡 ALTA
- **Roles:** Público (aplicar solo DJs)

#### 8. **Publicar Disponibilidad** (`/gigs/availability/create`)
- **Backend:** `POST /api/v1/gigs/venues/availability` ✅
- **Funcionalidad:**
  - Formulario: venueId, date, minGuaranteeAmount, minGuaranteeCurrency, terms
  - Publicar disponibilidad
- **Prioridad:** 🟡 ALTA
- **Roles:** VENUE

#### 9. **Aplicar a Gig** (`/gigs/apply`)
- **Backend:** `POST /api/v1/gigs/apply` ✅
- **Funcionalidad:**
  - Seleccionar disponibilidad
  - Enviar propuesta (proposal)
  - Confirmar aplicación
- **Prioridad:** 🟡 ALTA
- **Roles:** DJ

#### 10. **Mis Aplicaciones** (`/gigs/applications`)
- **Backend:** `GET /api/v1/gigs/applications` ✅
- **Funcionalidad:**
  - Listar aplicaciones (filtros: availabilityId, djId, status)
  - Ver estado: PENDING, ACCEPTED, REJECTED
  - Ver detalles de cada aplicación
- **Prioridad:** 🟡 ALTA
- **Roles:** DJ (ver mis aplicaciones), VENUE (ver aplicaciones a mis venues)

#### 11. **Aceptar Aplicación de Gig** (`/gigs/applications/:id/accept`)
- **Backend:** `POST /api/v1/gigs/applications/:id/accept` ✅
- **Funcionalidad:**
  - Ver detalles de la aplicación
  - Formulario para crear evento al aceptar:
    - eventTitle, eventType, eventGenre, startTime, endTime
  - Aceptar y crear evento automáticamente
- **Prioridad:** 🟡 ALTA
- **Roles:** VENUE

---

### 🔴 FASE 3: PROVIDER MARKETPLACE

#### 12. **Marketplace de Servicios** (`/providers/listings`)
- **Backend:** `GET /api/v1/providers/listings` ✅
- **Funcionalidad:**
  - Listar servicios disponibles
  - Filtros: category, providerId, isAvailable
  - Ver detalles de cada servicio
- **Prioridad:** 🟡 ALTA
- **Roles:** Público

#### 13. **Detalle de Servicio** (`/providers/listings/:id`)
- **Backend:** `GET /api/v1/providers/listings/:id` ✅
- **Funcionalidad:**
  - Ver información completa del servicio
  - Especificaciones técnicas
  - Precio por día
  - Botón "Reservar"
- **Prioridad:** 🟡 ALTA
- **Roles:** Todos

#### 14. **Crear Servicio/Listing** (`/providers/listings/create`)
- **Backend:** `POST /api/v1/providers/listings` ✅
- **Funcionalidad:**
  - Formulario: title, description, category, pricePerDayAmount, pricePerDayCurrency, specs
  - Categorías: SOUND, LIGHTS, VISUALS, OTHER
  - Publicar servicio
- **Prioridad:** 🟡 ALTA
- **Roles:** PROVIDER

#### 15. **Mis Servicios** (`/providers/my-listings`)
- **Backend:** `GET /api/v1/providers/listings` (filtrado por providerId) ✅
- **Funcionalidad:**
  - Listar mis servicios
  - Editar servicio
  - Marcar disponible/no disponible
- **Prioridad:** 🟡 ALTA
- **Roles:** PROVIDER

#### 16. **Editar Servicio** (`/providers/listings/:id/edit`)
- **Backend:** `PATCH /api/v1/providers/listings/:id` ✅
- **Funcionalidad:**
  - Actualizar precio
  - Cambiar disponibilidad
  - Editar especificaciones
- **Prioridad:** 🟢 MEDIA
- **Roles:** PROVIDER (solo owner)

#### 17. **Reservar Servicio** (`/providers/bookings`)
- **Backend:** `POST /api/v1/providers/bookings` ✅
- **Funcionalidad:**
  - Seleccionar servicio
  - Seleccionar evento
  - Fechas: startDate, endDate
  - Confirmar reserva
- **Prioridad:** 🟡 ALTA
- **Roles:** DJ, VENUE, FOUNDER

#### 18. **Mis Reservas** (`/providers/bookings`)
- **Backend:** `GET /api/v1/providers/bookings` ✅
- **Funcionalidad:**
  - Tabs: "Como Organizador" y "Como Proveedor"
  - Listar bookings
  - Filtros: eventId
  - Ver estado: PENDING, CONFIRMED, REJECTED, COMPLETED
- **Prioridad:** 🟡 ALTA
- **Roles:** DJ, VENUE, FOUNDER, PROVIDER

#### 19. **Aceptar/Rechazar Reserva** (`/providers/bookings/:id/accept` o `/reject`)
- **Backend:** 
  - `POST /api/v1/providers/bookings/:id/accept` ✅
  - `POST /api/v1/providers/bookings/:id/reject` ✅
- **Funcionalidad:**
  - Ver detalles de la reserva
  - Aceptar o rechazar
- **Prioridad:** 🟡 ALTA
- **Roles:** PROVIDER

---

### 🔴 FASE 4: FINANZAS

#### 20. **Mi Wallet** (`/finance/wallet`)
- **Backend:** `GET /api/v1/finance/wallet` ✅
- **Funcionalidad:**
  - Ver balance disponible
  - Ver balance bloqueado (Escrow)
  - Historial de transacciones
- **Prioridad:** 🟡 ALTA
- **Roles:** Todos

#### 21. **Depositar Fondos** (`/finance/wallet/deposit`)
- **Backend:** `POST /api/v1/finance/wallet/deposit` ✅
- **Funcionalidad:**
  - Formulario: amount (en cents), currency
  - Simulado para MVP
  - Confirmar depósito
- **Prioridad:** 🟡 ALTA
- **Roles:** Todos

#### 22. **Split Payments** (`/finance/split-payments`)
- **Backend:** 
  - `POST /api/v1/finance/split-payments` ✅
  - `POST /api/v1/finance/split-payments/:id/pay` ✅
- **Funcionalidad:**
  - Crear split payment (totalAmount, currency, reason, payerIds)
  - Ver splits activos
  - Pagar mi cuota de un split
  - Ver historial
- **Prioridad:** 🟢 MEDIA
- **Roles:** Todos

---

### 🔴 FASE 5: IDENTIDAD Y PERFIL

#### 23. **Editar Perfil** (`/profile/edit`)
- **Backend:** `PATCH /api/v1/users/me` ✅
- **Funcionalidad:**
  - Actualizar información del perfil
  - Cambiar foto de perfil
  - Validaciones
- **Prioridad:** 🟡 ALTA
- **Roles:** Todos

#### 24. **Invitaciones** (`/profile/invites`)
- **Backend:** 
  - `GET /api/v1/users/me/invites` ✅
  - `POST /api/v1/users/invite` ✅
- **Funcionalidad:**
  - Ver créditos de invitación disponibles
  - Invitar usuario (email, role opcional)
  - Ver historial de invitaciones
  - Información sobre cómo obtener más invites
- **Prioridad:** 🟢 MEDIA
- **Roles:** Todos

---

### 🔴 FASE 6: AUTENTICACIÓN ADICIONAL

#### 25. **Signup** (`/signup`)
- **Backend:** `POST /api/v1/auth/signup` ✅
- **Funcionalidad:**
  - Formulario: email, password
  - Auto-login después de registro
- **Prioridad:** 🔴 CRÍTICA
- **Roles:** Público

#### 26. **WebAuthn (Opcional)**
- **Backend:** 
  - `POST /api/v1/auth/webauthn/register/options` ✅
  - `POST /api/v1/auth/webauthn/register/verify` ✅
  - `POST /api/v1/auth/webauthn/login/options` ✅
  - `POST /api/v1/auth/webauthn/login/verify` ✅
- **Funcionalidad:**
  - Registro con WebAuthn
  - Login con WebAuthn
- **Prioridad:** 🟢 BAJA (opcional)

---

### 🔴 FASE 7: ADMINISTRACIÓN

#### 27. **Dashboard Admin** (`/admin/dashboard`)
- **Backend:** Varios endpoints (agregar según necesidad)
- **Funcionalidad:**
  - Estadísticas generales
  - Accesos rápidos
- **Prioridad:** 🟢 BAJA
- **Roles:** ADMIN

#### 28. **Gestión de Usuarios** (`/admin/users`)
- **Backend:** `POST /api/v1/users` ✅
- **Funcionalidad:**
  - Crear usuarios (solo ADMIN)
  - Listar usuarios
  - Ver detalles
- **Prioridad:** 🟢 BAJA
- **Roles:** ADMIN

---

## 📊 Resumen por Prioridad

### 🔴 CRÍTICA (Implementar Primero)
1. Lista de Eventos
2. Detalle de Evento
3. Crear Evento
4. Signup

### 🟡 ALTA (Implementar Segundo)
5. Mis Eventos
6. Gestión de RSVPs
7. Lista de Disponibilidades (Gigs)
8. Publicar Disponibilidad
9. Aplicar a Gig
10. Mis Aplicaciones
11. Aceptar Aplicación
12. Marketplace de Servicios
13. Detalle de Servicio
14. Crear Servicio
15. Mis Servicios
16. Reservar Servicio
17. Mis Reservas
18. Aceptar/Rechazar Reserva
19. Mi Wallet
20. Depositar Fondos
21. Editar Perfil

### 🟢 MEDIA (Implementar Tercero)
22. Check-in de Evento
23. Editar Servicio
24. Split Payments
25. Invitaciones

### 🟢 BAJA (Opcional)
26. WebAuthn
27. Dashboard Admin
28. Gestión de Usuarios

---

## 🎯 Orden Recomendado de Implementación

### **Sprint 1: Eventos Core (CRÍTICO)**
1. Lista de Eventos
2. Detalle de Evento
3. Crear Evento
4. Signup

### **Sprint 2: Eventos Avanzado**
5. Mis Eventos
6. Gestión de RSVPs

### **Sprint 3: Gig Market**
7. Lista de Disponibilidades
8. Publicar Disponibilidad
9. Aplicar a Gig
10. Mis Aplicaciones
11. Aceptar Aplicación

### **Sprint 4: Provider Marketplace**
12. Marketplace de Servicios
13. Detalle de Servicio
14. Crear Servicio
15. Mis Servicios
16. Reservar Servicio
17. Mis Reservas
18. Aceptar/Rechazar Reserva

### **Sprint 5: Finanzas y Perfil**
19. Mi Wallet
20. Depositar Fondos
21. Editar Perfil

### **Sprint 6: Funcionalidades Adicionales**
22. Check-in de Evento
23. Editar Servicio
24. Split Payments
25. Invitaciones

---

## 📝 Notas Importantes

1. **Total de pantallas faltantes:** ~28 pantallas
2. **Prioridad crítica:** 4 pantallas (Eventos core + Signup)
3. **Todas las funcionalidades del backend tienen endpoints listos** ✅
4. **Falta implementar la UI para consumir estos endpoints**
5. **Componentes compartidos necesarios:**
   - Card de evento
   - Formularios reutilizables
   - Modales de confirmación
   - Toasts/notificaciones
   - Loading states
   - Filtros y búsqueda

---

**Última actualización:** 2026-01-15
