export enum EventStatus {
  DRAFT = 'DRAFT', // Initial setup, not visible
  PUBLISHED = 'PUBLISHED', // Visible to members, accepting RSVPs
  CONFIRMED = 'CONFIRMED', // Escrow funded, fully green-lit
  CANCELLED = 'CANCELLED', // Foreseen cancellation with protocols
  COMPLETED = 'COMPLETED', // Event finished, ready for feedback
}
