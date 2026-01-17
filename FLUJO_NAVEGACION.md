# 🧭 Flujo de Navegación - Experience Core

**Fecha:** 2026-01-15  
**Estado:** Todas las pantallas conectadas

---

## 📋 Rutas Disponibles

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | Login | Pantalla de inicio (login/signup) |
| `/login` | Login | Login/Signup |
| `/role-selection` | RoleSelection | Selección de rol |
| `/onboarding` | OnboardingFan | Onboarding para Fans |
| `/onboarding/dj` | OnboardingDj | Onboarding para DJs |
| `/onboarding/venue` | OnboardingVenue | Onboarding para Venues |
| `/onboarding/provider` | OnboardingProvider | Onboarding para Providers |
| `/home` | HomeComponent | Home/Discovery (pantalla principal) |
| `/profile` | UserProfileComponent | Perfil de usuario |
| `/settings/security` | SecuritySettingsComponent | Configuración de seguridad |
| `/events` | → Redirige a `/home` | (Pendiente: Lista de eventos) |
| `/explore` | → Redirige a `/home` | (Pendiente: Explorar) |
| `/saved` | → Redirige a `/home` | (Pendiente: Eventos guardados) |
| `/tickets` | → Redirige a `/home` | (Pendiente: Tickets) |

---

## 🔄 Flujo Principal de Navegación

### 1. **Flujo de Autenticación y Onboarding**

```
Login (/login)
    ↓
Role Selection (/role-selection)
    ↓
Onboarding según rol:
    ├─ Fan → /onboarding
    ├─ DJ → /onboarding/dj
    ├─ Venue → /onboarding/venue
    └─ Provider → /onboarding/provider
    ↓
Home (/home) ← Pantalla principal después del onboarding
```

### 2. **Navegación desde Home**

```
Home (/home)
    ├─ Header:
    │   ├─ Logo → /home
    │   ├─ Search → (TODO: Pantalla de búsqueda)
    │   └─ Notifications → (TODO: Notificaciones)
    │
    ├─ Featured Event → /events/:id (TODO)
    ├─ Weekend Events → /events/:id (TODO)
    ├─ Upcoming Highlights → /events/:id (TODO)
    │
    └─ Bottom Navigation:
        ├─ Home → /home ✅
        ├─ Explore → /events (redirige a /home por ahora)
        ├─ Tickets → /tickets (redirige a /home por ahora)
        ├─ Saved → /saved (redirige a /home por ahora)
        └─ Profile → /profile ✅
```

### 3. **Navegación desde Profile**

```
Profile (/profile)
    ├─ Logout → /login ✅
    └─ (TODO: Links a otras secciones)
```

### 4. **Navegación desde Settings**

```
Settings/Security (/settings/security)
    └─ (TODO: Navegación de regreso)
```

---

## 🎯 Puntos de Entrada

### **Primera Vez (Usuario Nuevo)**
1. `/` o `/login` → Login/Signup
2. `/role-selection` → Seleccionar rol
3. `/onboarding/*` → Completar onboarding
4. `/home` → Pantalla principal

### **Usuario Existente (con sesión)**
- Si tiene `selectedRole` en localStorage → `/home`
- Si no tiene `selectedRole` → `/role-selection`

### **Desde cualquier pantalla**
- Bottom Navigation en Home permite navegar a:
  - Home
  - Explore (redirige a home por ahora)
  - Tickets (redirige a home por ahora)
  - Saved (redirige a home por ahora)
  - Profile

---

## 🔗 Conexiones entre Pantallas

### **Login → Role Selection**
- ✅ Implementado: `router.navigate(['/role-selection'])`
- Se ejecuta después de login/signup exitoso

### **Role Selection → Onboarding**
- ✅ Implementado según rol:
  - FAN → `/onboarding`
  - DJ → `/onboarding/dj`
  - VENUE → `/onboarding/venue`
  - PROVIDER → `/onboarding/provider`

### **Onboarding → Home**
- ✅ Implementado: Todos los onboarding navegan a `/home` después de completar

### **Home → Profile**
- ✅ Implementado: Bottom nav "Profile" → `/profile`

### **Home → Events (Detalle)**
- ✅ Implementado: Click en evento → `/events/:id` (ruta pendiente de crear)

### **Profile → Login**
- ✅ Implementado: Logout → `/login`

### **Home → Otras secciones**
- ⏳ Pendiente: Explore, Saved, Tickets (redirigen a home por ahora)

---

## 📱 Navegación Bottom Bar (Home)

El componente Home tiene una barra de navegación inferior con 5 items:

1. **Home** (activo) → `/home` ✅
2. **Explore** → `/events` (redirige a `/home` por ahora)
3. **Tickets** (botón central flotante) → `/tickets` (redirige a `/home` por ahora)
4. **Saved** → `/saved` (redirige a `/home` por ahora)
5. **Profile** → `/profile` ✅

---

## 🚧 Rutas Pendientes de Implementar

Estas rutas están referenciadas pero aún no tienen componentes:

1. `/events` - Lista de eventos
2. `/events/:id` - Detalle de evento
3. `/explore` - Explorar eventos
4. `/saved` - Eventos guardados
5. `/tickets` - Mis tickets
6. `/events/create` - Crear evento
7. `/events/my-events` - Mis eventos
8. `/gigs/*` - Gig Market
9. `/providers/*` - Provider Marketplace
10. `/finance/*` - Finanzas

---

## 💡 Mejoras Futuras

1. **Guards de Autenticación**: Proteger rutas que requieren login
2. **Guards de Rol**: Restringir acceso según rol del usuario
3. **Redirección Inteligente**: Después de login, redirigir según estado del usuario
4. **Breadcrumbs**: Para navegación profunda
5. **Historial de Navegación**: Botón "Atrás" funcional

---

## ✅ Estado Actual

- ✅ Todas las pantallas existentes están conectadas
- ✅ Flujo de onboarding completo
- ✅ Navegación desde Home a Profile
- ✅ Logout funcional
- ✅ Bottom navigation implementada
- ⏳ Rutas pendientes redirigen temporalmente a `/home`

---

**Última actualización:** 2026-01-15
