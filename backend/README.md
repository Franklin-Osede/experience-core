# Experience Core - Backend

## 🎯 Vision

**Experience Core** is the technical foundation for a private members platform that orchestrates **House & Afro-beats experiences** with professionalism, safety, and community at its core.

This is not a "party app". This is infrastructure for **curated nightlife** where:

- DJs are **paid upfront** (via Escrow)
- Events have **clear protocols** (Day → Night sequences)
- Community is **invite-only** with reputation systems
- Safety is **designed in**, not bolted on

---

## 🏗️ Architecture

### DDD (Domain-Driven Design)

The codebase is organized by **Bounded Contexts** (modules), each with:

- **Domain**: Pure business logic (Entities, Value Objects, Domain Events)
- **Application**: Use Cases / Command Handlers
- **Infrastructure**: Controllers, Repositories, External Services

### Current Modules

#### 1. **Identity Module** (`src/modules/identity`)

Manages users and community membership.

**Key Entities:**

- `User`: Has `role` (DJ vs Fan), `reputationScore`, and `inviteCredits`
  - **DJs get unlimited invites** (to build community)
  - **Fans get 3 invites** (scarcity model)

**Domain Events:**

- `UserCreatedEvent`: Triggers wallet creation in Finance module

#### 2. **Finance Module** (`src/modules/finance`)

Handles money with **Escrow** logic to guarantee DJ payments.

**Key Entities:**

- `Wallet`: Has `balance` (available) and `lockedBalance` (in Escrow)
- `Transaction`: Immutable record of money movement

**Value Objects:**

- `Money`: Prevents currency mixing, uses integer cents (no float errors)

#### 3. **Event Module** (`src/modules/event`)

The heart of the platform. Manages the lifecycle of experiences.

**Key Entities:**

- `Event`: Aggregate root with strict state machine
  - `DRAFT` → `PUBLISHED` → `CONFIRMED` (only when Escrow funded)

**Event Types:**

- `HOUSE_DAY`: Sunset/rooftop, chill vibes
- `CLUB_NIGHT`: Intense, late-night sessions
- `AFRO_SESSION`: Organic, percussive, dance-focused

**Business Rules (enforced in code):**

- Cannot publish without a Venue
- Auto-confirms when `markAsFunded()` is called
- End time must be after start time

---

## 🧪 Testing Strategy (TDD)

### Unit Tests

Each domain entity has tests verifying business rules:

```bash
npm test src/modules/event/domain/event.entity.spec.ts
npm test src/shared/domain/money.vo.spec.ts
```

**Current Coverage:**

- ✅ Money VO: 100% (arithmetic, currency validation)
- ✅ Event Entity: 100% (state transitions, validation)

---

## 🚀 API (OpenAPI / Swagger)

### Available Endpoints

- `POST /api/v1/events` - Create a draft event
- Swagger Docs: `http://localhost:5555/api/docs`

### BFF Strategy

The API is versioned (`/api/v1/`) to support future mobile/web clients without breaking changes.

---

## 📦 Installation & Running

```bash
# Install dependencies
npm install

# Run in development
npm run start:dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

---

## 🔐 Key Design Decisions

### 1. **Escrow-First Finance**

DJs are paid **before** the event via locked funds. This builds trust and differentiates the platform.

### 2. **Invite-Only with Roles**

- DJs: Unlimited invites (they bring community)
- Fans: Limited invites (maintains quality)
- Reputation system prevents abuse

### 3. **Event State Machine**

Events cannot be "confirmed" without funding. This prevents last-minute cancellations and protects all parties.

### 4. **No "Any" Types**

Strict TypeScript configuration ensures type safety across the entire codebase.

---

## 📚 Module Documentation

Each module has its own README:

- [Event Module](./src/modules/event/README.md)

---

## 🛠️ Tech Stack

- **Framework**: NestJS (Hexagonal Architecture)
- **Language**: TypeScript (strict mode)
- **Testing**: Jest
- **API Docs**: Swagger/OpenAPI
- **Validation**: class-validator
- **Events**: @nestjs/event-emitter (Domain Events)

---

## 🎯 Next Steps

1. ✅ Core domain models (Identity, Finance, Event)
2. ✅ Unit tests for business logic
3. ✅ API endpoints (Create Event)
4. 🔄 Event listing/filtering (House Day vs Club Night)
5. 🔄 Reputation system implementation
6. 🔄 Integration with real payment gateway (Stripe/Escrow)
7. 🔄 Real database (PostgreSQL + TypeORM)

---

**Built with discipline, not hype.**
