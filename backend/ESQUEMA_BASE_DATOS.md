# 🗄️ Esquema de Base de Datos - Experience Core

## ✅ Esquema Completo Implementado

### Tablas Principales

#### 1. **users** (Identity Module)
- **Primary Key**: `id` (UUID)
- **Unique Constraints**: `email`
- **Foreign Keys**: Ninguna (tabla raíz)
- **Check Constraints**:
  - `reputationScore >= 0`
  - `inviteCredits >= 0 OR inviteCredits = -1` (donde -1 representa Infinity)
  - `eventsAttended >= 0`
  - `outstandingDebtAmount >= 0`
- **Índices**: `email` (unique), `role`
- **Campos**: email, password, role (enum), isVerified, reputationScore, inviteCredits, eventsAttended, hasUnlockedInvites, outstandingDebt (amount + currency), profilePhotoUrl, isPhotoVerified

#### 2. **wallets** (Finance Module)
- **Primary Key**: `id` (UUID)
- **Unique Constraints**: `userId` (un wallet por usuario)
- **Foreign Keys**: `userId` → `users.id` (CASCADE)
- **Check Constraints**:
  - `balanceAmount >= 0`
  - `lockedBalanceAmount >= 0`
- **Índices**: `userId` (unique)
- **Campos**: userId, balance (amount + currency), lockedBalance (amount + currency)

#### 3. **transactions** (Finance Module)
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `walletId` → `wallets.id` (CASCADE)
- **Check Constraints**: `amount > 0`
- **Índices**: `walletId`, `createdAt`, `type`, `referenceId`
- **Campos**: walletId, type (enum), amount, currency, description, referenceId

#### 4. **events** (Event Module)
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `organizerId` → `users.id` (RESTRICT)
- **Check Constraints**:
  - `endTime > startTime`
  - `maxCapacity IS NULL OR maxCapacity > 0`
- **Índices**: `organizerId`, `status`, `startTime`, `genre`, `venueId`
- **Campos**: organizerId, title, description, type (enum), genre (enum), status (enum), startTime, endTime, location, venueId, maxCapacity, isEscrowFunded

#### 5. **event_attendees** (Event Module)
- **Primary Key**: `id` (UUID)
- **Unique Constraints**: `(eventId, userId)` (un RSVP por usuario por evento)
- **Foreign Keys**:
  - `eventId` → `events.id` (CASCADE)
  - `userId` → `users.id` (CASCADE)
- **Índices**: `eventId`, `userId`, `status`, `(eventId, userId)` (unique)
- **Campos**: eventId, userId, status (enum), rsvpDate, checkInDate, cancelledDate

#### 6. **venue_availabilities** (Event Module)
- **Primary Key**: `id` (UUID)
- **Unique Constraints**: `(venueId, date)` (una disponibilidad por venue por fecha)
- **Foreign Keys**: `venueId` → `users.id` (CASCADE) - donde user.role = 'VENUE'
- **Check Constraints**: `minGuaranteeAmount >= 0`
- **Índices**: `venueId`, `date`, `status`, `(venueId, date)` (unique)
- **Campos**: venueId, date, minGuarantee (amount + currency), terms, status (enum)

#### 7. **gig_applications** (Event Module)
- **Primary Key**: `id` (UUID)
- **Unique Constraints**: `(availabilityId, djId)` (una aplicación por DJ por disponibilidad)
- **Foreign Keys**:
  - `availabilityId` → `venue_availabilities.id` (CASCADE)
  - `djId` → `users.id` (CASCADE) - donde user.role = 'DJ'
- **Índices**: `availabilityId`, `djId`, `status`, `(availabilityId, djId)` (unique)
- **Campos**: availabilityId, djId, proposal, status (enum)

#### 8. **split_payments** (Finance Module)
- **Primary Key**: `id` (UUID)
- **Check Constraints**: `totalAmount > 0`
- **Índices**: `status`, `createdAt`
- **Campos**: totalAmount, currency, reason, status (enum)

#### 9. **split_payment_payers** (Finance Module)
- **Primary Key**: `id` (UUID)
- **Unique Constraints**: `(splitPaymentId, userId)` (un registro por usuario por split)
- **Foreign Keys**:
  - `splitPaymentId` → `split_payments.id` (CASCADE)
  - `userId` → `users.id` (CASCADE)
- **Check Constraints**: `amount > 0`
- **Índices**: `splitPaymentId`, `userId`, `(splitPaymentId, userId)` (unique)
- **Campos**: splitPaymentId, userId, amount, isPaid, paidAt

---

## 🔗 Relaciones (Foreign Keys)

### CASCADE DELETE
- `wallets.userId` → `users.id` (si se elimina usuario, se elimina wallet)
- `transactions.walletId` → `wallets.id` (si se elimina wallet, se eliminan transacciones)
- `event_attendees.eventId` → `events.id` (si se elimina evento, se eliminan RSVPs)
- `event_attendees.userId` → `users.id` (si se elimina usuario, se eliminan sus RSVPs)
- `venue_availabilities.venueId` → `users.id` (si se elimina venue, se eliminan disponibilidades)
- `gig_applications.availabilityId` → `venue_availabilities.id` (si se elimina disponibilidad, se eliminan aplicaciones)
- `gig_applications.djId` → `users.id` (si se elimina DJ, se eliminan sus aplicaciones)
- `split_payment_payers.splitPaymentId` → `split_payments.id` (si se elimina split, se eliminan payers)
- `split_payment_payers.userId` → `users.id` (si se elimina usuario, se eliminan sus participaciones en splits)

### RESTRICT DELETE
- `events.organizerId` → `users.id` (no se puede eliminar usuario si tiene eventos organizados)

---

## 📊 ENUM Types

1. **user_role_enum**: `FAN`, `DJ`, `FOUNDER`, `VENUE`, `ADMIN`
2. **event_type_enum**: `HOUSE_DAY`, `CLUB_NIGHT`, `AFRO_SESSION`, `PRIVATE_LAB`
3. **event_genre_enum**: `HOUSE`, `TECHNO`, `SALSA`, `BACHATA`, `KIZOMBA`, `REGGAETON`, `HIP_HOP`, `RNB`, `OPEN_FORMAT`, `LIVE_MUSIC`
4. **event_status_enum**: `DRAFT`, `PUBLISHED`, `CONFIRMED`, `CANCELLED`, `COMPLETED`
5. **attendee_status_enum**: `PENDING`, `CONFIRMED`, `ATTENDED`, `NO_SHOW`, `CANCELLED`, `EXCUSED`
6. **availability_status_enum**: `OPEN`, `NEGOTIATING`, `BOOKED`
7. **gig_application_status_enum**: `PENDING`, `ACCEPTED`, `REJECTED`
8. **transaction_type_enum**: `DEPOSIT`, `WITHDRAWAL`, `LOCK`, `RELEASE`, `SPLIT_PAYMENT`
9. **split_payment_status_enum**: `PENDING`, `COMPLETED`, `FAILED`

---

## 🔍 Índices Estratégicos

### Performance
- Índices en foreign keys para joins rápidos
- Índices en campos de búsqueda frecuente (status, dates, genres)
- Índices compuestos para queries comunes (eventId + userId, venueId + date)

### Unicidad
- Email único en users
- Un wallet por usuario
- Un RSVP por usuario por evento
- Una disponibilidad por venue por fecha
- Una aplicación por DJ por disponibilidad
- Un payer por usuario por split payment

---

## ✅ Validaciones de Negocio (Check Constraints)

1. **Valores no negativos**: reputationScore, eventsAttended, outstandingDebtAmount, balanceAmount, lockedBalanceAmount, minGuaranteeAmount
2. **Valores positivos**: transaction.amount, split_payment.totalAmount, split_payment_payer.amount
3. **Lógica de fechas**: event.endTime > event.startTime
4. **Capacidad válida**: event.maxCapacity > 0 o NULL
5. **Invite credits**: >= 0 o -1 (Infinity)

---

## 🚀 Migración

La migración inicial está en: `src/migrations/1700000000000-InitialSchema.ts`

### Para ejecutar:
```bash
npm run migration:run
```

### Para revertir:
```bash
npm run migration:revert
```

---

## 📝 Notas de Diseño

1. **UUIDs**: Todas las primary keys usan UUID para evitar problemas de escalabilidad y seguridad
2. **Money como Value Object**: Se almacena como `amount` (bigint, cents) + `currency` (varchar(3))
3. **Timestamps**: Todos usan `timestamptz` para timezone-aware dates
4. **Text fields**: Descripciones y términos usan `text` para contenido largo
5. **Cascade vs Restrict**: 
   - CASCADE para datos dependientes (wallets, transactions, attendees)
   - RESTRICT para datos críticos (events no se pueden eliminar si tienen organizer activo)

