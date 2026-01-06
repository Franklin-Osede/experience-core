# 🎛️ Plan de Implementación: Marketplace de Proveedores (Equipos DJ/Luces)

## 📊 Estado Actual

### ✅ Lo que YA está implementado:

1. **Rol PROVIDER** en el sistema
   - ✅ Definido en `UserRole` enum
   - ✅ Soportado en la base de datos

2. **Entidades de Dominio** (solo stubs)
   - ✅ `ServiceListing` - Anuncio de servicio/equipo
   - ✅ `ServiceBooking` - Reserva de servicio
   - ✅ `ServiceCategory` enum con categorías:
     - `AUDIO_PA` - Altavoces, subs
     - `DJ_GEAR` - CDJs, mezcladoras, tocadiscos
     - `LIGHTING` - Moving heads, strobes, láseres
     - `VISUALS` - Proyectores, pantallas LED
     - `ATMOSPHERE` - Máquinas de humo, CO2
     - `STAFF` - Técnicos, seguridad

3. **Interfaces de Repositorio**
   - ✅ `ServiceListingRepository` (interface)
   - ✅ `ServiceBookingRepository` (interface)

### ❌ Lo que FALTA implementar:

- ❌ **Entidades TypeORM** (0/2)
- ❌ **Migración de base de datos** (0/1)
- ❌ **Repositorios TypeORM** (0/2)
- ❌ **Repositorios In-Memory** (0/2)
- ❌ **Use Cases** (0/6)
- ❌ **Controller** (0/1)
- ❌ **DTOs** (0/5)
- ❌ **Módulo Provider** (no está en AppModule)
- ❌ **Tests** (0/n)

---

## 🎯 Funcionalidades a Implementar

### 1. **Publicar Servicio/Equipo** (PROVIDER)
- Un PROVIDER puede crear un listing de su equipo
- Campos: título, descripción, categoría, precio por día, especificaciones técnicas
- Estado: disponible/no disponible

### 2. **Buscar/Listar Servicios**
- Búsqueda por categoría (DJ_GEAR, LIGHTING, etc.)
- Filtros: precio, disponibilidad, fecha
- Paginación

### 3. **Reservar Servicio** (Organizador de Evento)
- Un organizador puede solicitar un servicio para su evento
- Calcula costo total basado en días
- Estado: PENDING → CONFIRMED/REJECTED

### 4. **Aceptar/Rechazar Reserva** (PROVIDER)
- El PROVIDER puede aceptar o rechazar solicitudes
- Validar disponibilidad (no overlaps)

### 5. **Gestionar Listings** (PROVIDER)
- Actualizar precio
- Marcar como disponible/no disponible
- Ver sus propios listings

### 6. **Ver Reservas** (PROVIDER y Organizador)
- PROVIDER ve todas las reservas de sus servicios
- Organizador ve reservas de sus eventos

---

## 📋 Checklist de Implementación

### Fase 1: Infraestructura de Datos (2-3 días)

#### 1.1 Entidades TypeORM

**Archivo:** `backend/src/modules/provider/infrastructure/typeorm/service-listing.entity.ts`

```typescript
@Entity('service_listings')
@Index(['providerId'])
@Index(['category'])
@Index(['isAvailable'])
export class ServiceListingEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  providerId: string;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: ServiceCategory,
  })
  category: ServiceCategory;

  @Column({ type: 'bigint' })
  pricePerDayAmount: number; // in cents

  @Column({ length: 3 })
  pricePerDayCurrency: string;

  @Column('jsonb', { nullable: true })
  specs: Record<string, any> | null;

  @Column({ default: true })
  isAvailable: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
```

**Archivo:** `backend/src/modules/provider/infrastructure/typeorm/service-booking.entity.ts`

```typescript
@Entity('service_bookings')
@Index(['serviceListingId'])
@Index(['providerId'])
@Index(['eventId'])
@Index(['status'])
export class ServiceBookingEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  serviceListingId: string;

  @Column('uuid')
  providerId: string;

  @Column('uuid')
  eventId: string;

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz' })
  endDate: Date;

  @Column({ type: 'bigint' })
  totalCostAmount: number; // in cents

  @Column({ length: 3 })
  totalCostCurrency: string;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
```

#### 1.2 Migración de Base de Datos

**Archivo:** `backend/src/migrations/XXXXX-AddProviderTables.ts`

```typescript
// Crear ENUM para ServiceCategory
CREATE TYPE "service_category_enum" AS ENUM(
  'AUDIO_PA', 'DJ_GEAR', 'LIGHTING', 
  'VISUALS', 'ATMOSPHERE', 'STAFF'
);

// Crear ENUM para BookingStatus
CREATE TYPE "booking_status_enum" AS ENUM(
  'PENDING', 'CONFIRMED', 'REJECTED', 
  'CANCELLED', 'COMPLETED'
);

// Crear tabla service_listings
CREATE TABLE "service_listings" (
  "id" uuid PRIMARY KEY,
  "providerId" uuid NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" text NOT NULL,
  "category" service_category_enum NOT NULL,
  "pricePerDayAmount" bigint NOT NULL,
  "pricePerDayCurrency" varchar(3) NOT NULL,
  "specs" jsonb,
  "isAvailable" boolean DEFAULT true,
  "createdAt" timestamptz NOT NULL,
  "updatedAt" timestamptz NOT NULL
);

// Crear tabla service_bookings
CREATE TABLE "service_bookings" (
  "id" uuid PRIMARY KEY,
  "serviceListingId" uuid NOT NULL,
  "providerId" uuid NOT NULL,
  "eventId" uuid NOT NULL,
  "startDate" timestamptz NOT NULL,
  "endDate" timestamptz NOT NULL,
  "totalCostAmount" bigint NOT NULL,
  "totalCostCurrency" varchar(3) NOT NULL,
  "status" booking_status_enum DEFAULT 'PENDING',
  "createdAt" timestamptz NOT NULL,
  "updatedAt" timestamptz NOT NULL
);

// Foreign keys
ALTER TABLE "service_listings" 
  ADD CONSTRAINT "FK_service_listings_provider" 
  FOREIGN KEY ("providerId") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "service_bookings" 
  ADD CONSTRAINT "FK_service_bookings_listing" 
  FOREIGN KEY ("serviceListingId") REFERENCES "service_listings"("id") ON DELETE CASCADE;

ALTER TABLE "service_bookings" 
  ADD CONSTRAINT "FK_service_bookings_provider" 
  FOREIGN KEY ("providerId") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "service_bookings" 
  ADD CONSTRAINT "FK_service_bookings_event" 
  FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE;

// Índices
CREATE INDEX "IDX_service_listings_provider" ON "service_listings"("providerId");
CREATE INDEX "IDX_service_listings_category" ON "service_listings"("category");
CREATE INDEX "IDX_service_listings_available" ON "service_listings"("isAvailable");
CREATE INDEX "IDX_service_bookings_listing" ON "service_bookings"("serviceListingId");
CREATE INDEX "IDX_service_bookings_provider" ON "service_bookings"("providerId");
CREATE INDEX "IDX_service_bookings_event" ON "service_bookings"("eventId");
CREATE INDEX "IDX_service_bookings_status" ON "service_bookings"("status");
```

#### 1.3 Actualizar UserRole enum en migración

Si la migración inicial no incluye PROVIDER, agregarlo:

```sql
ALTER TYPE "user_role_enum" ADD VALUE 'PROVIDER';
```

---

### Fase 2: Repositorios (1-2 días)

#### 2.1 Repositorio TypeORM - ServiceListing

**Archivo:** `backend/src/modules/provider/infrastructure/typeorm/service-listing.repository.ts`

```typescript
@Injectable()
export class TypeOrmServiceListingRepository implements ServiceListingRepository {
  constructor(
    @InjectRepository(ServiceListingEntity)
    private readonly typeOrmRepository: Repository<ServiceListingEntity>,
  ) {}

  async save(listing: ServiceListing): Promise<void> {
    const entity = this.toEntity(listing);
    await this.typeOrmRepository.save(entity);
  }

  async findById(id: string): Promise<ServiceListing | null> {
    const entity = await this.typeOrmRepository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async search(category?: string): Promise<ServiceListing[]> {
    const where: FindOptionsWhere<ServiceListingEntity> = { isAvailable: true };
    if (category) {
      where.category = category as ServiceCategory;
    }
    const entities = await this.typeOrmRepository.find({ where });
    return entities.map(e => this.toDomain(e));
  }

  // Métodos toEntity y toDomain
  private toEntity(listing: ServiceListing): ServiceListingEntity { ... }
  private toDomain(entity: ServiceListingEntity): ServiceListing { ... }
}
```

#### 2.2 Repositorio TypeORM - ServiceBooking

**Archivo:** `backend/src/modules/provider/infrastructure/typeorm/service-booking.repository.ts`

Similar estructura, con método especial:

```typescript
async findOverlapping(
  serviceListingId: string,
  start: Date,
  end: Date,
): Promise<ServiceBooking[]> {
  // Query para encontrar reservas que se solapan
  const entities = await this.typeOrmRepository
    .createQueryBuilder('booking')
    .where('booking.serviceListingId = :listingId', { listingId: serviceListingId })
    .andWhere('booking.status IN (:...statuses)', { 
      statuses: [BookingStatus.PENDING, BookingStatus.CONFIRMED] 
    })
    .andWhere(
      '(booking.startDate <= :end AND booking.endDate >= :start)',
      { start, end }
    )
    .getMany();
    
  return entities.map(e => this.toDomain(e));
}
```

#### 2.3 Repositorios In-Memory (para testing)

- `backend/src/modules/provider/infrastructure/in-memory-service-listing.repository.ts`
- `backend/src/modules/provider/infrastructure/in-memory-service-booking.repository.ts`

---

### Fase 3: Use Cases (2-3 días)

#### 3.1 CreateServiceListingUseCase

**Archivo:** `backend/src/modules/provider/application/create-service-listing.use-case.ts`

```typescript
@Injectable()
export class CreateServiceListingUseCase {
  constructor(
    @Inject('ServiceListingRepository')
    private readonly listingRepository: ServiceListingRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    providerId: string,
    dto: CreateServiceListingDto,
  ): Promise<ServiceListing> {
    // 1. Verificar que el usuario es PROVIDER
    const user = await this.userRepository.findById(providerId);
    if (!user || user.role !== UserRole.PROVIDER) {
      throw new ForbiddenException('Only PROVIDERs can create service listings');
    }

    // 2. Crear listing
    const listing = ServiceListing.create({
      providerId,
      title: dto.title,
      description: dto.description,
      category: dto.category,
      pricePerDay: new Money(dto.pricePerDayAmount, dto.pricePerDayCurrency),
      specs: dto.specs,
    });

    // 3. Guardar
    await this.listingRepository.save(listing);
    return listing;
  }
}
```

#### 3.2 ListServiceListingsUseCase

**Archivo:** `backend/src/modules/provider/application/list-service-listings.use-case.ts`

- Búsqueda con filtros (categoría, precio, disponibilidad)
- Paginación

#### 3.3 BookServiceUseCase

**Archivo:** `backend/src/modules/provider/application/book-service.use-case.ts`

```typescript
async execute(
  eventId: string,
  organizerId: string,
  dto: BookServiceDto,
): Promise<ServiceBooking> {
  // 1. Verificar que el evento existe y pertenece al organizador
  // 2. Obtener el listing
  // 3. Verificar disponibilidad (no overlaps)
  // 4. Calcular costo total
  // 5. Crear booking con estado PENDING
  // 6. Guardar
}
```

#### 3.4 AcceptBookingUseCase

**Archivo:** `backend/src/modules/provider/application/accept-booking.use-case.ts`

```typescript
async execute(
  providerId: string,
  bookingId: string,
): Promise<ServiceBooking> {
  // 1. Verificar que el booking existe
  // 2. Verificar que pertenece al provider
  // 3. Verificar disponibilidad (no overlaps)
  // 4. Confirmar booking
  // 5. Guardar
}
```

#### 3.5 RejectBookingUseCase

Similar a AcceptBookingUseCase pero rechaza.

#### 3.6 UpdateServiceListingUseCase

Para actualizar precio y disponibilidad.

---

### Fase 4: DTOs (1 día)

#### 4.1 Request DTOs

- `CreateServiceListingDto`
- `BookServiceDto`
- `ListServiceListingsDto` (con paginación y filtros)
- `UpdateServiceListingDto`

#### 4.2 Response DTOs

- `ServiceListingResponseDto`
- `ServiceBookingResponseDto`
- `PaginatedServiceListingsResponseDto`

---

### Fase 5: Controller (1 día)

**Archivo:** `backend/src/modules/provider/infrastructure/provider.controller.ts`

```typescript
@ApiTags('Provider Marketplace')
@Controller('providers')
export class ProviderController {
  // POST /providers/listings - Crear listing (PROVIDER)
  // GET /providers/listings - Listar/buscar listings
  // GET /providers/listings/:id - Ver detalle
  // PATCH /providers/listings/:id - Actualizar (PROVIDER owner)
  // POST /providers/bookings - Reservar servicio
  // POST /providers/bookings/:id/accept - Aceptar (PROVIDER)
  // POST /providers/bookings/:id/reject - Rechazar (PROVIDER)
  // GET /providers/bookings - Listar reservas
}
```

**Protección con RolesGuard:**
- Crear listing: `@Roles(UserRole.PROVIDER)`
- Aceptar/Rechazar: `@Roles(UserRole.PROVIDER)`
- Reservar: `@Roles(UserRole.DJ, UserRole.VENUE, UserRole.FOUNDER)` (organizadores)

---

### Fase 6: Módulo y Configuración (1 día)

**Archivo:** `backend/src/modules/provider/provider.module.ts`

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceListingEntity,
      ServiceBookingEntity,
    ]),
    IdentityModule, // Para acceder a UserRepository
    EventModule,    // Para validar eventos
  ],
  controllers: [ProviderController],
  providers: [
    CreateServiceListingUseCase,
    ListServiceListingsUseCase,
    BookServiceUseCase,
    AcceptBookingUseCase,
    RejectBookingUseCase,
    UpdateServiceListingUseCase,
    {
      provide: 'ServiceListingRepository',
      useClass: useTypeORM 
        ? TypeOrmServiceListingRepository 
        : InMemoryServiceListingRepository,
    },
    {
      provide: 'ServiceBookingRepository',
      useClass: useTypeORM 
        ? TypeOrmServiceBookingRepository 
        : InMemoryServiceBookingRepository,
    },
  ],
  exports: [],
})
export class ProviderModule {}
```

**Agregar a `app.module.ts`:**
```typescript
imports: [
  // ... otros módulos
  ProviderModule,
]
```

---

### Fase 7: Tests (2-3 días)

#### 7.1 Tests Unitarios de Dominio
- `service-listing.entity.spec.ts`
- `service-booking.entity.spec.ts`

#### 7.2 Tests de Use Cases
- Tests de cada use case
- Validaciones de roles
- Validaciones de negocio

#### 7.3 Tests E2E
- Flujo completo: Crear listing → Reservar → Aceptar
- Tests de autorización (roles)

---

## 📊 Resumen de Archivos a Crear

### Infraestructura (7 archivos)
1. `infrastructure/typeorm/service-listing.entity.ts`
2. `infrastructure/typeorm/service-booking.entity.ts`
3. `infrastructure/typeorm/service-listing.repository.ts`
4. `infrastructure/typeorm/service-booking.repository.ts`
5. `infrastructure/in-memory-service-listing.repository.ts`
6. `infrastructure/in-memory-service-booking.repository.ts`
7. `infrastructure/provider.controller.ts`

### Aplicación (6 archivos)
8. `application/create-service-listing.use-case.ts`
9. `application/list-service-listings.use-case.ts`
10. `application/book-service.use-case.ts`
11. `application/accept-booking.use-case.ts`
12. `application/reject-booking.use-case.ts`
13. `application/update-service-listing.use-case.ts`

### DTOs (7 archivos)
14. `application/dto/create-service-listing.dto.ts`
15. `application/dto/book-service.dto.ts`
16. `application/dto/list-service-listings.dto.ts`
17. `application/dto/update-service-listing.dto.ts`
18. `infrastructure/dto/service-listing-response.dto.ts`
19. `infrastructure/dto/service-booking-response.dto.ts`
20. `infrastructure/dto/paginated-service-listings-response.dto.ts`

### Módulo y Migración (2 archivos)
21. `provider.module.ts`
22. `migrations/XXXXX-AddProviderTables.ts`

### Tests (5+ archivos)
23. `domain/service-listing.entity.spec.ts`
24. `domain/service-booking.entity.spec.ts`
25. `application/*.spec.ts` (para cada use case)
26. `provider.e2e-spec.ts`

**Total: ~25-30 archivos nuevos**

---

## ⏱️ Estimación de Tiempo

- **Fase 1 (Infraestructura):** 2-3 días
- **Fase 2 (Repositorios):** 1-2 días
- **Fase 3 (Use Cases):** 2-3 días
- **Fase 4 (DTOs):** 1 día
- **Fase 5 (Controller):** 1 día
- **Fase 6 (Módulo):** 1 día
- **Fase 7 (Tests):** 2-3 días

**Total: 10-15 días** (2-3 semanas)

---

## 🎯 Priorización

### Si quieres MVP rápido (1 semana):
1. ✅ Fase 1 (Entidades + Migración)
2. ✅ Fase 2 (Repositorios básicos)
3. ✅ Fase 3 (Use cases críticos: crear, listar, reservar, aceptar)
4. ✅ Fase 5 (Controller básico)
5. ✅ Fase 6 (Módulo)

### Para producción completa:
- Todas las fases + tests completos

---

## 🔗 Integración con Otros Módulos

### Con Identity Module:
- Validar rol PROVIDER
- Obtener información del usuario

### Con Event Module:
- Validar que el evento existe al reservar
- Vincular booking con evento

### Con Finance Module (futuro):
- Pagos de reservas
- Escrow para garantizar pago a providers

---

**Última actualización:** $(date)

