import { ServiceBooking, BookingStatus } from './service-booking.entity';
import { Money } from '../../../shared/domain/money.vo';

// Mock uuid to avoid Jest ESM issues
jest.mock('uuid', () => ({
  v4: () => 'test-booking-uuid-1234',
}));

describe('ServiceBooking Entity', () => {
  const pricePerDay = new Money(5000, 'EUR'); // 50 EUR per day
  const startDate = new Date('2025-06-20T10:00:00Z');
  const endDate = new Date('2025-06-22T18:00:00Z'); // 2.33 days, should round to 3 days

  it('should create a valid booking with PENDING status', () => {
    const booking = ServiceBooking.create(
      'listing-123',
      'provider-123',
      'event-123',
      startDate,
      endDate,
      pricePerDay,
    );

    expect(booking.id).toBe('test-booking-uuid-1234');
    expect(booking.serviceListingId).toBe('listing-123');
    expect(booking.providerId).toBe('provider-123');
    expect(booking.eventId).toBe('event-123');
    expect(booking.status).toBe(BookingStatus.PENDING);
  });

  it('should calculate total cost correctly for multiple days', () => {
    const booking = ServiceBooking.create(
      'listing-123',
      'provider-123',
      'event-123',
      startDate,
      endDate,
      pricePerDay,
    );

    // 3 days (rounded up from 2.33)
    expect(booking.totalCost.amount).toBe(15000); // 50 EUR * 3 days = 150 EUR
    expect(booking.totalCost.currency).toBe('EUR');
  });

  it('should calculate minimum 1 day cost', () => {
    const sameDayStart = new Date('2025-06-20T10:00:00Z');
    const sameDayEnd = new Date('2025-06-20T18:00:00Z');

    const booking = ServiceBooking.create(
      'listing-123',
      'provider-123',
      'event-123',
      sameDayStart,
      sameDayEnd,
      pricePerDay,
    );

    // Should charge at least 1 day
    expect(booking.totalCost.amount).toBe(5000); // 50 EUR * 1 day
  });

  it('should confirm a pending booking', () => {
    const booking = ServiceBooking.create(
      'listing-123',
      'provider-123',
      'event-123',
      startDate,
      endDate,
      pricePerDay,
    );

    const oldUpdatedAt = booking.updatedAt;

    jest.useFakeTimers();
    jest.advanceTimersByTime(1000);

    booking.confirm();

    expect(booking.status).toBe(BookingStatus.CONFIRMED);
    expect(booking.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());

    jest.useRealTimers();
  });

  it('should reject a pending booking', () => {
    const booking = ServiceBooking.create(
      'listing-123',
      'provider-123',
      'event-123',
      startDate,
      endDate,
      pricePerDay,
    );

    const oldUpdatedAt = booking.updatedAt;

    jest.useFakeTimers();
    jest.advanceTimersByTime(1000);

    booking.reject();

    expect(booking.status).toBe(BookingStatus.REJECTED);
    expect(booking.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());

    jest.useRealTimers();
  });

  it('should complete a confirmed booking', () => {
    const booking = ServiceBooking.create(
      'listing-123',
      'provider-123',
      'event-123',
      startDate,
      endDate,
      pricePerDay,
    );

    booking.confirm();
    const oldUpdatedAt = booking.updatedAt;

    jest.useFakeTimers();
    jest.advanceTimersByTime(1000);

    booking.complete();

    expect(booking.status).toBe(BookingStatus.COMPLETED);
    expect(booking.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());

    jest.useRealTimers();
  });

  it('should throw error when confirming non-pending booking', () => {
    const booking = ServiceBooking.create(
      'listing-123',
      'provider-123',
      'event-123',
      startDate,
      endDate,
      pricePerDay,
    );

    booking.confirm();

    expect(() => booking.confirm()).toThrow('Can only confirm pending bookings');
  });

  it('should throw error when rejecting non-pending booking', () => {
    const booking = ServiceBooking.create(
      'listing-123',
      'provider-123',
      'event-123',
      startDate,
      endDate,
      pricePerDay,
    );

    booking.reject();

    expect(() => booking.reject()).toThrow('Can only reject pending bookings');
  });

  it('should throw error when completing non-confirmed booking', () => {
    const booking = ServiceBooking.create(
      'listing-123',
      'provider-123',
      'event-123',
      startDate,
      endDate,
      pricePerDay,
    );

    expect(() => booking.complete()).toThrow('Can only complete confirmed bookings');
  });

  it('should handle end date before start date (absolute difference)', () => {
    const reversedStart = new Date('2025-06-22T18:00:00Z');
    const reversedEnd = new Date('2025-06-20T10:00:00Z');

    const booking = ServiceBooking.create(
      'listing-123',
      'provider-123',
      'event-123',
      reversedStart,
      reversedEnd,
      pricePerDay,
    );

    // Should still calculate correctly using absolute difference
    expect(booking.totalCost.amount).toBeGreaterThan(0);
  });
});

