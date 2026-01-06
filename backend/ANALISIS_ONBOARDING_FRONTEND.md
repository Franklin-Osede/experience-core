# 📱 Análisis: Pantalla de Onboarding - Requisitos del Backend

**Fecha:** $(date)  
**Pantalla analizada:** Fan Onboarding (selección de géneros + verificación de teléfono)

---

## 🎯 Funcionalidades de la Pantalla

La pantalla de onboarding muestra:

1. **Selección de Géneros Musicales**
   - Usuario puede seleccionar múltiples géneros (ej: "Afro House", "House")
   - Estado visual: seleccionado/no seleccionado
   - Texto: "Select the sounds that move you to tailor your event recommendations"

2. **Verificación de Teléfono**
   - Campo de teléfono con selector de país
   - Placeholder: "(555) 000-0000"
   - Mensaje de privacidad: "Your privacy is our priority. No spam, just access."
   - Botón: "Verify & Enter"

---

## ❌ Lo que FALTA en el Backend

### 1. Campo de Teléfono en Usuario

**Problema:** El modelo `User` no tiene campo para número de teléfono.

**Ubicación actual:**
- `backend/src/modules/identity/domain/user.entity.ts` - No tiene `phoneNumber`
- `backend/src/modules/identity/infrastructure/typeorm/user.entity.ts` - No tiene columna `phoneNumber`

**Necesita:**
- Agregar `phoneNumber?: string` a `UserProps`
- Agregar columna `phoneNumber` en `UserEntity` (nullable)
- Migración para agregar la columna

---

### 2. Preferencias de Géneros Musicales

**Problema:** No hay forma de guardar los géneros preferidos del usuario.

**Estado actual:**
- `EventGenre` enum existe con: HOUSE, TECHNO, SALSA, BACHATA, KIZOMBA, REGGAETON, HIP_HOP, RNB, OPEN_FORMAT, LIVE_MUSIC
- **Nota:** "Afro House" no está en el enum (solo "HOUSE")

**Opciones de implementación:**

#### Opción A: Campo simple (array de géneros)
- Agregar `preferredGenres: EventGenre[]` al usuario
- Tipo: `jsonb` en PostgreSQL o `simple-array` en TypeORM

#### Opción B: Tabla separada (más flexible)
- Crear tabla `user_preferences` o `user_genre_preferences`
- Relación many-to-many entre User y EventGenre

**Recomendación:** Opción A (más simple para MVP)

---

### 3. Endpoint para Actualizar Perfil/Onboarding

**Problema:** No existe endpoint `PATCH /api/v1/users/me` para actualizar perfil.

**Endpoints actuales:**
- ✅ `GET /api/v1/users/me` - Obtener perfil
- ✅ `POST /api/v1/users` - Crear usuario (solo ADMIN)
- ❌ **FALTA:** `PATCH /api/v1/users/me` - Actualizar perfil propio

**Necesita:**
- `UpdateUserProfileUseCase`
- `UpdateUserProfileDto` con campos opcionales:
  - `phoneNumber?: string`
  - `preferredGenres?: EventGenre[]`
- Endpoint en `UserController`

---

### 4. Verificación de Teléfono (Opcional - Futuro)

**Nota:** La pantalla menciona "Verify your mobile" pero no hay lógica de verificación implementada.

**Para MVP:** Solo guardar el número de teléfono.

**Para producción futura:**
- Endpoint `POST /api/v1/users/me/verify-phone` - Enviar código SMS
- Endpoint `POST /api/v1/users/me/confirm-phone` - Confirmar código
- Campo `isPhoneVerified: boolean` en usuario

---

## 📋 Plan de Implementación

### Fase 1: Campos en Base de Datos (30 min)

1. **Agregar `phoneNumber` a User:**
   ```typescript
   // user.entity.ts (domain)
   phoneNumber?: string;
   
   // user.entity.ts (TypeORM)
   @Column({ nullable: true, length: 20 })
   phoneNumber: string | null;
   ```

2. **Agregar `preferredGenres` a User:**
   ```typescript
   // user.entity.ts (domain)
   preferredGenres: EventGenre[];
   
   // user.entity.ts (TypeORM)
   @Column({ type: 'simple-array', nullable: true })
   preferredGenres: string[] | null;
   ```

3. **Crear migración:**
   ```bash
   npm run migration:generate -- AddPhoneAndGenresToUser
   ```

### Fase 2: Use Case y DTO (20 min)

1. **Crear `UpdateUserProfileUseCase`:**
   ```typescript
   // update-user-profile.use-case.ts
   async execute(userId: string, dto: UpdateUserProfileDto): Promise<User>
   ```

2. **Crear `UpdateUserProfileDto`:**
   ```typescript
   class UpdateUserProfileDto {
     @IsOptional()
     @IsString()
     phoneNumber?: string;
     
     @IsOptional()
     @IsArray()
     @IsEnum(EventGenre, { each: true })
     preferredGenres?: EventGenre[];
   }
   ```

### Fase 3: Endpoint (15 min)

1. **Agregar endpoint en `UserController`:**
   ```typescript
   @Patch('me')
   @UseGuards(AuthGuard('jwt'))
   async updateProfile(
     @Request() req: AuthenticatedRequest,
     @Body() dto: UpdateUserProfileDto
   )
   ```

2. **Actualizar `UserResponseDto`** para incluir nuevos campos

### Fase 4: Actualizar Swagger (5 min)

- Documentar nuevo endpoint
- Agregar ejemplos

---

## 🎨 Consideraciones de Diseño

### Género "Afro House"

**Problema:** La pantalla muestra "Afro House" pero el enum solo tiene "HOUSE".

**Opciones:**
1. **Agregar `AFRO_HOUSE` al enum** (recomendado)
2. **Mapear "Afro House" → "HOUSE"** en el frontend
3. **Usar "HOUSE" directamente** en el frontend

**Recomendación:** Opción 1 - Agregar `AFRO_HOUSE` al enum si es un género importante para la plataforma.

---

## ✅ Checklist de Implementación

- [ ] Agregar campo `phoneNumber` a User (domain + TypeORM)
- [ ] Agregar campo `preferredGenres` a User (domain + TypeORM)
- [ ] Crear migración para nuevos campos
- [ ] Crear `UpdateUserProfileUseCase`
- [ ] Crear `UpdateUserProfileDto`
- [ ] Agregar endpoint `PATCH /api/v1/users/me`
- [ ] Actualizar `UserResponseDto` con nuevos campos
- [ ] Actualizar Swagger documentation
- [ ] (Opcional) Agregar `AFRO_HOUSE` al enum `EventGenre`
- [ ] Tests para el nuevo endpoint

---

## 🚀 Tiempo Estimado

**Total:** ~1.5 horas

- Fase 1 (DB): 30 min
- Fase 2 (Use Case): 20 min
- Fase 3 (Endpoint): 15 min
- Fase 4 (Swagger): 5 min
- Testing: 20 min

---

## 📝 Notas Adicionales

1. **Validación de teléfono:** Considerar usar una librería como `libphonenumber-js` para validar formatos internacionales.

2. **Preferencias múltiples:** El frontend permite seleccionar múltiples géneros, así que `preferredGenres` debe ser un array.

3. **Onboarding completo:** Considerar agregar un campo `onboardingCompleted: boolean` para trackear si el usuario completó el onboarding.

---

**Última actualización:** $(date)

