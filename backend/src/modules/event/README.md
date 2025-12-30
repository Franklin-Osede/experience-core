# Event Module

## 📖 Overview

The **Event Module** is the core of "Experience Core". It manages the lifecycle of nightlife experiences, from initial drafting to final completion.

This module is designed following **DDD** principles, ensuring that business rules (like validation, funding checks, and state transitions) are enforced at the domain level.

## 🏗️ Domain Models

### Event Entity

The `Event` entity (aggregate root) encapsulates all logic for a single experience.

- **State Machine**:
  - `DRAFT`: Initial creation. Invisible to public users.
  - `PUBLISHED`: Visible, but not yet fully confirmed financially. Requires a Venue.
  - `CONFIRMED`: **Escrow Funded**. The event is "Green-lit". This is a key trust signal.
  - `CANCELLED`: If something goes wrong.
  - `COMPLETED`: Finished event.

### Event Types

We distinguish experiences to curate the vibe:

- **HOUSE_DAY**: Sunset, rooftop, chill, community-focused.
- **CLUB_NIGHT**: Late night, intense, dance-focused.
- **AFRO_SESSION**: Organic, percussive, energetic.

## 🔗 Key Integrations

- **Finance Module**: An event automatically transitions to `CONFIRMED` only when `markAsFunded()` is called (intended to be triggered by a Payment Event).
- **Identity Module**: Linked via `organizerId`.

## ✅ Testing

Run unit tests for this module:

```bash
npm test src/modules/event/domain/event.entity.spec.ts
```
