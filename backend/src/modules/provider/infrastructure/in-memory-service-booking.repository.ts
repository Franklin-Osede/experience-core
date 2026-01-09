import { Injectable } from '@nestjs/common';
import {
  ServiceBooking,
  BookingStatus,
} from '../domain/service-booking.entity';
import { ServiceBookingRepository } from '../domain/provider.repository';

/**
 * In-memory implementation of ServiceBookingRepository for testing
 */
@Injectable()
export class InMemoryServiceBookingRepository implements ServiceBookingRepository {
  private readonly bookings: Map<string, ServiceBooking> = new Map();

  async save(booking: ServiceBooking): Promise<void> {
    await Promise.resolve(); // Simulate async I/O
    this.bookings.set(booking.id, booking);
  }

  async findById(id: string): Promise<ServiceBooking | null> {
    await Promise.resolve(); // Simulate async I/O
    return this.bookings.get(id) || null;
  }

  async findOverlapping(
    serviceListingId: string,
    start: Date,
    end: Date,
  ): Promise<ServiceBooking[]> {
    await Promise.resolve(); // Simulate async I/O

    return Array.from(this.bookings.values()).filter((booking) => {
      return (
        booking.serviceListingId === serviceListingId &&
        (booking.status === BookingStatus.PENDING ||
          booking.status === BookingStatus.CONFIRMED) &&
        booking.startDate <= end &&
        booking.endDate >= start
      );
    });
  }

  async findByEventId(eventId: string): Promise<ServiceBooking[]> {
    await Promise.resolve(); // Simulate async I/O

    return Array.from(this.bookings.values())
      .filter((booking) => booking.eventId === eventId)
      .sort((a, b) => {
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
  }
}
