# 🎨 Plan de Pantallas - Frontend Experience Core

**Fecha:** $(date)  
**Estado:** Planificación completa de todas las pantallas

---

## 📋 Resumen Ejecutivo

Este documento lista **todas las pantallas** que se crearán en el frontend, organizadas por:
1. **Orden de implementación** (de más básico a más complejo)
2. **Módulo funcional** (Auth, Events, Finance, etc.)
3. **Rol de usuario** (FAN, DJ, VENUE, PROVIDER, ADMIN)

**Total de pantallas:** ~35 pantallas

---

## 🎯 FASE 1: Fundación y Autenticación (Prioridad CRÍTICA)

### 1.1 **Layout Base**
**Pantalla:** Layout Principal (`app.component.html`)
- **Por qué:** Base para todas las demás pantallas
- **Contiene:** Header, Sidebar (opcional), Footer, Router Outlet
- **Funcionalidad:** Navegación global, logout, perfil rápido
- **Roles:** Todos

---

### 1.2 **Autenticación**

#### **Pantalla 1: Login** (`/auth/login`)
- **Por qué:** Primera pantalla que ven los usuarios
- **Funcionalidad:** 
  - Formulario email/password
  - Link a signup
  - Manejo de errores
  - Redirección post-login según rol
- **Roles:** Todos (público)
- **Endpoint:** `POST /api/v1/auth/login`

#### **Pantalla 2: Signup** (`/auth/signup`)
- **Por qué:** Registro de nuevos usuarios
- **Funcionalidad:**
  - Formulario: email, password, confirm password
  - Selección de rol (si aplica)
  - Validaciones
  - Auto-login después de registro
- **Roles:** Todos (público)
- **Endpoint:** `POST /api/v1/auth/signup`

#### **Pantalla 3: Home/Landing** (`/`)
- **Por qué:** Página principal pública
- **Funcionalidad:**
  - Hero section
  - Lista de eventos próximos (públicos)
  - Call-to-action para login/signup
  - Información sobre la plataforma
- **Roles:** Público (sin auth requerida)
- **Endpoint:** `GET /api/v1/events` (filtrado por próximos)

---

## 🎯 FASE 2: Módulo de Eventos (Core de la Plataforma)

### 2.1 **Visualización de Eventos**

#### **Pantalla 4: Lista de Eventos** (`/events`)
- **Por qué:** Pantalla principal para descubrir eventos
- **Funcionalidad:**
  - Grid/Lista de eventos con cards
  - Filtros: tipo (HOUSE_DAY, CLUB_NIGHT, AFRO_SESSION), género, fecha
  - Búsqueda por nombre
  - Paginación
  - Estados: DRAFT, PUBLISHED, CONFIRMED, COMPLETED
- **Roles:** Todos (público para eventos PUBLISHED)
- **Endpoint:** `GET /api/v1/events`

#### **Pantalla 5: Detalle de Evento** (`/events/:id`)
- **Por qué:** Ver información completa de un evento
- **Funcionalidad:**
  - Información completa: título, descripción, fecha, hora, venue
  - Organizador (DJ/VENUE)
  - Estado del evento
  - Botón RSVP (si es FAN y está PUBLISHED)
  - Lista de RSVPs (si es organizador)
  - Acciones según rol:
    - **FAN:** RSVP, Cancelar RSVP
    - **DJ/VENUE (organizador):** Publicar, Financiar, Completar, Cancelar
    - **ADMIN:** Todas las acciones
- **Roles:** Todos
- **Endpoints:** 
  - `GET /api/v1/events/:id`
  - `POST /api/v1/events/:id/rsvp`
  - `DELETE /api/v1/events/:id/rsvp`
  - `PATCH /api/v1/events/:id/publish`
  - `POST /api/v1/events/:id/fund`
  - `POST /api/v1/events/:id/complete`
  - `POST /api/v1/events/:id/cancel`

#### **Pantalla 6: Mis Eventos** (`/events/my-events`)
- **Por qué:** Ver eventos del usuario (organizados o RSVP)
- **Funcionalidad:**
  - Tabs: "Organizando" y "Asistiendo"
  - Lista de eventos con estado
  - Filtros por estado
  - Acciones rápidas
- **Roles:** Todos (contenido según rol)
- **Endpoint:** `GET /api/v1/events` (filtrado por userId)

---

### 2.2 **Creación y Gestión de Eventos (DJ/VENUE)**

#### **Pantalla 7: Crear Evento** (`/events/create`)
- **Por qué:** DJs y VENUEs necesitan crear eventos
- **Funcionalidad:**
  - Formulario completo:
    - Título, descripción
    - Tipo (HOUSE_DAY, CLUB_NIGHT, AFRO_SESSION, PRIVATE_LAB)
    - Género
    - Fecha y hora (start/end)
    - Venue (si es DJ, debe seleccionar)
    - Precio (opcional)
  - Validaciones
  - Guardar como DRAFT
  - Publicar directamente (opcional)
- **Roles:** DJ, VENUE
- **Endpoint:** `POST /api/v1/events`

#### **Pantalla 8: Editar Evento** (`/events/:id/edit`)
- **Por qué:** Modificar eventos en estado DRAFT
- **Funcionalidad:**
  - Mismo formulario que crear
  - Pre-cargado con datos existentes
  - Solo editable si es DRAFT
  - Verificación de ownership
- **Roles:** DJ, VENUE (solo organizador), ADMIN
- **Endpoint:** `PATCH /api/v1/events/:id` (si existe)

#### **Pantalla 9: Gestión de RSVPs** (`/events/:id/rsvps`)
- **Por qué:** Organizadores necesitan ver y gestionar asistentes
- **Funcionalidad:**
  - Lista de RSVPs con información del usuario
  - Check-in en el evento
  - Ver estado: PENDING, CONFIRMED, CANCELLED, ATTENDED
  - Exportar lista (opcional)
- **Roles:** DJ, VENUE (organizador), ADMIN
- **Endpoint:** `GET /api/v1/events/:id/rsvps`

---

## 🎯 FASE 3: Módulo de Finanzas

### 3.1 **Wallet y Transacciones**

#### **Pantalla 10: Mi Wallet** (`/finance/wallet`)
- **Por qué:** Ver balance y transacciones
- **Funcionalidad:**
  - Balance disponible
  - Balance bloqueado (Escrow)
  - Lista de transacciones recientes
  - Filtros por tipo, fecha
  - Historial completo
- **Roles:** Todos
- **Endpoint:** `GET /api/v1/wallets/me`

#### **Pantalla 11: Depositar Fondos** (`/finance/deposit`)
- **Por qué:** Agregar dinero al wallet
- **Funcionalidad:**
  - Formulario: monto, método de pago (simulado para MVP)
  - Confirmación
  - Historial de depósitos
- **Roles:** Todos
- **Endpoint:** `POST /api/v1/wallets/deposit`

#### **Pantalla 12: Split Payments** (`/finance/splits`)
- **Por qué:** Ver y gestionar pagos divididos
- **Funcionalidad:**
  - Lista de split payments activos
  - Ver detalles: participantes, monto total, cuota individual
  - Pagar mi cuota
  - Ver historial de splits completados
- **Roles:** Todos
- **Endpoints:**
  - `POST /api/v1/split-payments`
  - `POST /api/v1/split-payments/:id/pay`

---

## 🎯 FASE 4: Módulo de Identidad y Perfil

### 4.1 **Perfil de Usuario**

#### **Pantalla 13: Mi Perfil** (`/profile`)
- **Por qué:** Ver y editar información personal
- **Funcionalidad:**
  - Información básica: email, rol
  - Foto de perfil (upload)
  - Reputación
  - Estadísticas: eventos asistidos, eventos organizados
  - Deuda pendiente (si aplica)
  - Verificación de foto (isPhotoVerified)
- **Roles:** Todos
- **Endpoint:** `GET /api/v1/users/me`

#### **Pantalla 14: Editar Perfil** (`/profile/edit`)
- **Por qué:** Modificar información personal
- **Funcionalidad:**
  - Editar email (con verificación)
  - Cambiar contraseña
  - Subir/actualizar foto de perfil
  - Validaciones
- **Roles:** Todos
- **Endpoint:** `PATCH /api/v1/users/me` (si existe)

#### **Pantalla 15: Invitaciones** (`/profile/invites`)
- **Por qué:** Gestionar créditos de invitación
- **Funcionalidad:**
  - Ver créditos disponibles
  - Invitar usuario (email, rol opcional)
  - Historial de invitaciones
  - Información sobre cómo obtener más invites
- **Roles:** Todos (contenido según rol)
- **Endpoints:**
  - `GET /api/v1/users/me/invites`
  - `POST /api/v1/users/invite`

---

## 🎯 FASE 5: Gig Market (DJs y VENUEs)

### 5.1 **Disponibilidades de VENUEs**

#### **Pantalla 16: Disponibilidades** (`/gigs/availability`)
- **Por qué:** DJs buscan venues disponibles
- **Funcionalidad:**
  - Lista de disponibilidades publicadas
  - Filtros: fecha, tipo de evento, venue
  - Ver detalles: venue, fecha, hora, tipo
  - Botón "Aplicar" (solo DJs)
- **Roles:** Público (aplicar solo DJs)
- **Endpoint:** `GET /api/v1/venues/availability`

#### **Pantalla 17: Publicar Disponibilidad** (`/gigs/availability/create`)
- **Por qué:** VENUEs publican sus slots disponibles
- **Funcionalidad:**
  - Formulario: fecha, hora, tipo de evento aceptado
  - Descripción opcional
  - Publicar disponibilidad
- **Roles:** VENUE
- **Endpoint:** `POST /api/v1/venues/availability`

---

### 5.2 **Aplicaciones de DJs**

#### **Pantalla 18: Mis Aplicaciones** (`/gigs/my-applications`)
- **Por qué:** DJs ven el estado de sus aplicaciones
- **Funcionalidad:**
  - Lista de aplicaciones: PENDING, ACCEPTED, REJECTED
  - Ver detalles de cada aplicación
  - Cancelar aplicación (si está PENDING)
- **Roles:** DJ
- **Endpoint:** `GET /api/v1/gigs/applications`

#### **Pantalla 19: Aplicar a Gig** (`/gigs/availability/:id/apply`)
- **Por qué:** DJs aplican a una disponibilidad específica
- **Funcionalidad:**
  - Ver detalles de la disponibilidad
  - Formulario de aplicación (mensaje opcional)
  - Confirmar aplicación
  - Redirección a mis aplicaciones
- **Roles:** DJ
- **Endpoint:** `POST /api/v1/gigs/apply`

---

### 5.3 **Gestión de Aplicaciones (VENUEs)**

#### **Pantalla 20: Aplicaciones Recibidas** (`/gigs/applications`)
- **Por qué:** VENUEs gestionan aplicaciones de DJs
- **Funcionalidad:**
  - Lista de aplicaciones por disponibilidad
  - Ver perfil del DJ aplicante
  - Aceptar/Rechazar aplicación
  - Al aceptar: crear evento automáticamente
- **Roles:** VENUE
- **Endpoint:** 
  - `GET /api/v1/gigs/applications` (filtrado por venue)
  - `POST /api/v1/gigs/applications/:id/accept`
  - `POST /api/v1/gigs/applications/:id/reject`

---

## 🎯 FASE 6: Provider Marketplace

### 6.1 **Listings de Servicios**

#### **Pantalla 21: Marketplace de Servicios** (`/providers/listings`)
- **Por qué:** Buscar servicios (sound, lights, visuals)
- **Funcionalidad:**
  - Lista de servicios disponibles
  - Filtros: categoría, proveedor, disponibilidad
  - Ver detalles: precio, especificaciones, proveedor
  - Botón "Reservar" (solo DJs/VENUEs/FOUNDERs)
- **Roles:** Público (reservar solo organizadores)
- **Endpoint:** `GET /api/v1/providers/listings`

#### **Pantalla 22: Detalle de Servicio** (`/providers/listings/:id`)
- **Por qué:** Ver información completa de un servicio
- **Funcionalidad:**
  - Información completa del servicio
  - Especificaciones técnicas
  - Precio por día
  - Información del proveedor
  - Botón "Reservar"
- **Roles:** Todos
- **Endpoint:** `GET /api/v1/providers/listings/:id`

---

### 6.2 **Gestión de Listings (PROVIDERs)**

#### **Pantalla 23: Mis Servicios** (`/providers/my-listings`)
- **Por qué:** PROVIDERs gestionan sus servicios
- **Funcionalidad:**
  - Lista de servicios creados
  - Estado: disponible/no disponible
  - Editar servicio
  - Crear nuevo servicio
- **Roles:** PROVIDER
- **Endpoint:** `GET /api/v1/providers/listings` (filtrado por providerId)

#### **Pantalla 24: Crear Servicio** (`/providers/listings/create`)
- **Por qué:** PROVIDERs publican nuevos servicios
- **Funcionalidad:**
  - Formulario: título, descripción, categoría
  - Precio por día (monto y moneda)
  - Especificaciones técnicas (JSON/objeto)
  - Publicar servicio
- **Roles:** PROVIDER
- **Endpoint:** `POST /api/v1/providers/listings`

#### **Pantalla 25: Editar Servicio** (`/providers/listings/:id/edit`)
- **Por qué:** Modificar servicios existentes
- **Funcionalidad:**
  - Mismo formulario que crear
  - Pre-cargado con datos
  - Actualizar precio
  - Marcar disponible/no disponible
- **Roles:** PROVIDER (solo owner)
- **Endpoint:** `PATCH /api/v1/providers/listings/:id`

---

### 6.3 **Bookings de Servicios**

#### **Pantalla 26: Mis Reservas** (`/providers/bookings`)
- **Por qué:** Ver reservas de servicios (como organizador o proveedor)
- **Funcionalidad:**
  - Tabs: "Como Organizador" y "Como Proveedor"
  - Lista de bookings con estado
  - Filtros por estado: PENDING, CONFIRMED, REJECTED, COMPLETED
  - Acciones según rol:
    - **Organizador:** Ver detalles, cancelar
    - **Proveedor:** Aceptar, Rechazar, Completar
- **Roles:** DJ, VENUE, FOUNDER (organizadores), PROVIDER
- **Endpoint:** `GET /api/v1/providers/bookings`

#### **Pantalla 27: Reservar Servicio** (`/providers/listings/:id/book`)
- **Por qué:** Organizadores reservan servicios para eventos
- **Funcionalidad:**
  - Seleccionar evento (de mis eventos)
  - Fechas de reserva
  - Confirmar reserva
  - Ver precio total
- **Roles:** DJ, VENUE, FOUNDER
- **Endpoint:** `POST /api/v1/providers/bookings`

---

## 🎯 FASE 7: Administración (ADMIN)

#### **Pantalla 28: Dashboard Admin** (`/admin/dashboard`)
- **Por qué:** Vista general para administradores
- **Funcionalidad:**
  - Estadísticas: usuarios, eventos, transacciones
  - Gráficos (opcional)
  - Accesos rápidos
- **Roles:** ADMIN
- **Endpoints:** Varios (agregados según necesidad)

#### **Pantalla 29: Gestión de Usuarios** (`/admin/users`)
- **Por qué:** ADMIN crea y gestiona usuarios
- **Funcionalidad:**
  - Lista de usuarios
  - Crear usuario (con rol)
  - Ver detalles
  - Editar roles (opcional)
- **Roles:** ADMIN
- **Endpoint:** `POST /api/v1/users`

---

## 🎯 FASE 8: Componentes Compartidos y Utilidades

### 8.1 **Componentes Reutilizables**

#### **Componentes UI Base:**
- **Button:** Botones primarios, secundarios, outline
- **Input:** Campos de texto, email, password, number
- **Card:** Tarjetas para eventos, servicios, etc.
- **Modal:** Diálogos para confirmaciones, formularios
- **Loading:** Spinners, skeletons
- **Toast/Notification:** Mensajes de éxito/error
- **Badge:** Etiquetas de estado, roles
- **Avatar:** Foto de perfil circular
- **DatePicker:** Selector de fechas
- **Select:** Dropdowns

### 8.2 **Guards y Protección de Rutas**

- **AuthGuard:** Protege rutas que requieren autenticación
- **RoleGuard:** Protege rutas según rol
- **Redirects:** Redirección según estado de auth

---

## 📊 Resumen por Módulo

| Módulo | Pantallas | Prioridad |
|--------|-----------|-----------|
| **Layout/Auth** | 3 | 🔴 CRÍTICA |
| **Events** | 6 | 🔴 CRÍTICA |
| **Finance** | 3 | 🟡 ALTA |
| **Identity/Profile** | 3 | 🟡 ALTA |
| **Gig Market** | 5 | 🟡 ALTA |
| **Provider** | 7 | 🟢 MEDIA |
| **Admin** | 2 | 🟢 BAJA |
| **Componentes** | ~6 | 🔴 CRÍTICA |
| **TOTAL** | **~35** | |

---

## 🎯 Orden de Implementación Recomendado

### **Sprint 1: Fundación (Semana 1)**
1. Layout Base
2. Login
3. Signup
4. Home/Landing
5. Componentes base (Button, Input, Card)

### **Sprint 2: Eventos Core (Semana 2)**
6. Lista de Eventos
7. Detalle de Evento
8. Crear Evento
9. Mis Eventos

### **Sprint 3: Eventos Avanzado (Semana 3)**
10. Editar Evento
11. Gestión de RSVPs
12. Componentes avanzados (Modal, Toast)

### **Sprint 4: Finanzas y Perfil (Semana 4)**
13. Mi Wallet
14. Depositar Fondos
15. Mi Perfil
16. Invitaciones

### **Sprint 5: Gig Market (Semana 5)**
17. Disponibilidades
18. Publicar Disponibilidad
19. Mis Aplicaciones
20. Aplicar a Gig
21. Aplicaciones Recibidas

### **Sprint 6: Provider Marketplace (Semana 6)**
22. Marketplace de Servicios
23. Mis Servicios
24. Crear Servicio
25. Mis Reservas
26. Reservar Servicio

### **Sprint 7: Admin y Pulido (Semana 7)**
27. Dashboard Admin
28. Gestión de Usuarios
29. Split Payments
30. Editar Perfil
31. Editar Servicio

---

## 📝 Notas Importantes

1. **Responsive:** Todas las pantallas deben ser responsive (mobile-first)
2. **Loading States:** Todas las pantallas con datos deben mostrar loading
3. **Error Handling:** Manejo de errores consistente en todas las pantallas
4. **Validaciones:** Formularios con validaciones en frontend y backend
5. **Navegación:** Breadcrumbs en pantallas profundas
6. **Accesibilidad:** ARIA labels, navegación por teclado

---

**Última actualización:** $(date)


