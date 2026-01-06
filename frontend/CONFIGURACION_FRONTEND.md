# 🚀 Configuración del Frontend - Completada

**Fecha:** $(date)  
**Estado:** ✅ **Configurado y listo**

---

## ✅ Cambios Realizados

### 1. Puerto Configurado ✅

**Puerto:** `4202` (4200 y 4201 estaban en uso)

**Archivos modificados:**
- `angular.json` - Configurado puerto 4201 en serve options
- `package.json` - Script start actualizado con `--port 4201`
- `README.md` - Documentación actualizada

**URL del frontend:** `http://localhost:4202`

---

### 2. Environment Configuration ✅

**Archivos creados:**
- `src/environments/environment.ts` - Desarrollo
- `src/environments/environment.prod.ts` - Producción

**Configuración:**
```typescript
// Development
apiUrl: 'http://localhost:5555/api/v1'

// Production
apiUrl: 'https://api.experience-core.com/api/v1'
```

---

### 3. Servicio API Básico ✅

**Archivo creado:** `src/app/services/api.service.ts`

**Endpoints implementados:**
- ✅ `signup()` - Registro de usuario
- ✅ `login()` - Inicio de sesión
- ✅ `getProfile()` - Obtener perfil del usuario
- ✅ `updateProfile()` - Actualizar perfil (onboarding)
- ✅ `getEvents()` - Listar eventos
- ✅ `getEventById()` - Obtener evento por ID
- ✅ `createEvent()` - Crear evento

**Características:**
- Manejo automático de JWT token desde localStorage
- Headers configurados automáticamente
- Base URL configurable desde environment

---

### 4. HTTP Client Configurado ✅

**Archivo modificado:** `src/app/app.config.ts`

- ✅ `provideHttpClient()` agregado
- ✅ Listo para hacer peticiones HTTP

---

## 🎯 Uso del Servicio API

### Ejemplo: Actualizar Perfil (Onboarding)

```typescript
import { ApiService } from './services/api.service';

constructor(private apiService: ApiService) {}

// En el componente de onboarding
onSubmit() {
  const data = {
    phoneNumber: '+15551234567',
    preferredGenres: ['AFRO_HOUSE', 'HOUSE']
  };

  this.apiService.updateProfile(data).subscribe({
    next: (response) => {
      console.log('Perfil actualizado:', response);
      // Navegar a siguiente pantalla
    },
    error: (error) => {
      console.error('Error:', error);
    }
  });
}
```

### Ejemplo: Login

```typescript
login(email: string, password: string) {
  this.apiService.login({ email, password }).subscribe({
    next: (response) => {
      // Guardar token
      localStorage.setItem('access_token', response.access_token);
      // Navegar a dashboard
    },
    error: (error) => {
      console.error('Error de login:', error);
    }
  });
}
```

---

## 📋 Próximos Pasos

### Para conectar el onboarding:

1. **Crear componente de onboarding:**
   ```bash
   ng generate component onboarding
   ```

2. **Usar el servicio API:**
   ```typescript
   import { ApiService } from '../services/api.service';
   ```

3. **Llamar al endpoint:**
   ```typescript
   this.apiService.updateProfile({
     phoneNumber: this.phoneNumber,
     preferredGenres: this.selectedGenres
   })
   ```

---

## 🔧 Comandos Útiles

### Iniciar frontend:
```bash
cd frontend
npm start
# O
ng serve
```

### Verificar que está corriendo:
```bash
curl http://localhost:4202
# O abrir en navegador: http://localhost:4202
```

### Verificar backend:
```bash
curl http://localhost:5555/api/v1/health
```

---

## 📝 Notas

- El token JWT se guarda en `localStorage` con la clave `access_token`
- El servicio API maneja automáticamente el header `Authorization: Bearer <token>`
- La URL del backend está configurada en `environment.ts`
- Para producción, actualizar `environment.prod.ts` con la URL real

---

## ✅ Checklist

- [x] Puerto configurado (4201)
- [x] Environment files creados
- [x] Servicio API creado
- [x] HTTP Client configurado
- [x] Endpoints básicos implementados
- [x] Manejo de JWT token
- [x] Documentación actualizada

---

**Última actualización:** $(date)

