# Identity Module - Hybrid Launch Strategy

## 🎯 Overview

The Identity Module manages users and implements a **Hybrid Launch Strategy** to solve the cold-start problem while maintaining quality control.

---

## 🚀 Launch Strategy (Phased Approach)

### **Phase 1: Seeding (Weeks 1-4)**

**Goal**: Build core community of 20-50 trusted users

**How it works:**

- You manually invite first users
- Assign them `FOUNDER` role
- They get **10 invite credits** each
- Organize 2-3 small events

**User Types:**

- `DJ`: Unlimited invites (they build community)
- `FOUNDER`: 10 invites (early adopters)

---

### **Phase 2: Growth (Weeks 5-12)**

**Goal**: Grow to 200-500 users organically

**How it works:**

- FOUNDERs invite their friends
- New users join as `FAN` with **0 invites**
- After attending **1 event** → unlock **3 invites**
- Community grows through participation

**Business Rule:**

```
FAN attends event → eventsAttended++
if (eventsAttended >= 1 && !hasUnlockedInvites) {
  inviteCredits = 3
  hasUnlockedInvites = true
}
```

---

### **Phase 3: Invite-Only (Month 4+)**

**Goal**: Maintain quality through scarcity

**How it works:**

- No more FOUNDER role assignments
- All new users are FANs
- Must attend 1 event to invite others
- Self-regulating community

---

## 🏗️ Domain Model

### User Entity

```typescript
interface UserProps {
  email: string;
  role: UserRole; // DJ | FOUNDER | FAN
  inviteCredits: number;
  eventsAttended: number;
  hasUnlockedInvites: boolean;
  reputationScore: number;
  isVerified: boolean;
}
```

### Invite Credit Rules

| Role      | Initial Invites | Unlock Condition    |
| --------- | --------------- | ------------------- |
| `DJ`      | ∞ (Infinity)    | Immediate           |
| `FOUNDER` | 10              | Immediate           |
| `FAN`     | 0               | After 1st event → 3 |

---

## 🔑 Key Methods

### `markEventAttended()`

Called when a user attends an event. Automatically unlocks invites for FANs after first event.

```typescript
user.markEventAttended();
// eventsAttended: 0 → 1
// inviteCredits: 0 → 3 (if FAN)
// hasUnlockedInvites: false → true
```

### `useInvite()`

Decrements invite credits when user invites someone.

```typescript
user.useInvite();
// inviteCredits: 3 → 2
// Throws error if credits = 0
```

---

## ✅ Testing

Run unit tests:

```bash
npm test src/modules/identity/domain/user.entity.spec.ts
```

**Test Coverage:**

- ✅ Invite allocation by role
- ✅ Invite unlocking after first event
- ✅ Invite usage and limits
- ✅ Error handling (no credits)

---

## 🎯 Why This Works

### Solves Cold Start

- FOUNDERs (10 invites) × 30 people = 300 potential users
- No "chicken and egg" problem

### Maintains Quality

- FANs must participate before inviting
- Filters out low-engagement users
- Creates skin in the game

### Scales Organically

- Good users naturally invite similar people
- Reputation system prevents abuse
- Community self-regulates

---

## 🔄 Migration Path

**Current State → Future State:**

```
Week 1-4:   FOUNDER-driven growth
Week 5-12:  Hybrid (FOUNDER + unlocked FANs)
Month 4+:   Pure invite-only (no more FOUNDERs)
```

**Configuration Flag (Future):**

```typescript
// In environment config
PLATFORM_MODE: 'LAUNCH' | 'GROWTH' | 'INVITE_ONLY';
```

---

## 📊 Expected Growth

| Phase   | Users | Events | Invites Used |
| ------- | ----- | ------ | ------------ |
| Seeding | 30    | 3      | ~100         |
| Growth  | 300   | 12     | ~500         |
| Mature  | 1000+ | 20+    | Organic      |

---

**This strategy is battle-tested by successful platforms like:**

- Clubhouse (invite-only audio)
- Gmail (early invite system)
- Soho House (membership model)
