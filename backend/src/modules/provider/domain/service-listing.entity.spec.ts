import { ServiceListing } from './service-listing.entity';
import { ServiceCategory } from './service-category.enum';
import { Money } from '../../../shared/domain/money.vo';

// Mock uuid to avoid Jest ESM issues
jest.mock('uuid', () => ({
  v4: () => 'test-listing-uuid-1234',
}));

describe('ServiceListing Entity', () => {
  const validProps = {
    providerId: 'provider-123',
    title: 'Pioneer CDJ-3000 Nexus Set',
    description: 'Professional DJ equipment set with 2 CDJs and mixer',
    category: ServiceCategory.DJ_GEAR,
    pricePerDay: new Money(5000, 'EUR'), // 50 EUR per day
    specs: {
      wattage: '100W',
      channels: 4,
      dimensions: '45x30x10cm',
    },
  };

  it('should create a valid service listing', () => {
    const listing = ServiceListing.create(validProps);

    expect(listing.id).toBe('test-listing-uuid-1234');
    expect(listing.title).toBe('Pioneer CDJ-3000 Nexus Set');
    expect(listing.category).toBe(ServiceCategory.DJ_GEAR);
    expect(listing.isAvailable).toBe(true);
    expect(listing.pricePerDay.amount).toBe(5000);
    expect(listing.pricePerDay.currency).toBe('EUR');
  });

  it('should be available by default when created', () => {
    const listing = ServiceListing.create(validProps);
    expect(listing.isAvailable).toBe(true);
  });

  it('should update price correctly', () => {
    const listing = ServiceListing.create(validProps);
    const newPrice = new Money(6000, 'EUR');
    const oldUpdatedAt = listing.updatedAt;

    // Wait a bit to ensure updatedAt changes
    jest.useFakeTimers();
    jest.advanceTimersByTime(1000);

    listing.updatePrice(newPrice);

    expect(listing.pricePerDay.amount).toBe(6000);
    expect(listing.pricePerDay.currency).toBe('EUR');
    expect(listing.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());

    jest.useRealTimers();
  });

  it('should mark as unavailable', () => {
    const listing = ServiceListing.create(validProps);
    const oldUpdatedAt = listing.updatedAt;

    jest.useFakeTimers();
    jest.advanceTimersByTime(1000);

    listing.markUnavailable();

    expect(listing.isAvailable).toBe(false);
    expect(listing.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());

    jest.useRealTimers();
  });

  it('should mark as available again', () => {
    const listing = ServiceListing.create(validProps);
    listing.markUnavailable();
    expect(listing.isAvailable).toBe(false);

    const oldUpdatedAt = listing.updatedAt;

    jest.useFakeTimers();
    jest.advanceTimersByTime(1000);

    listing.markAvailable();

    expect(listing.isAvailable).toBe(true);
    expect(listing.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());

    jest.useRealTimers();
  });

  it('should handle listings without specs', () => {
    const listingWithoutSpecs = ServiceListing.create({
      ...validProps,
      specs: undefined,
    });

    expect(listingWithoutSpecs.specs).toBeUndefined();
  });

  it('should preserve specs when provided', () => {
    const listing = ServiceListing.create(validProps);
    expect(listing.specs).toEqual({
      wattage: '100W',
      channels: 4,
      dimensions: '45x30x10cm',
    });
  });
});
