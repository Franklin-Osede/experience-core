import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Provider Marketplace (e2e)', () => {
  let app: INestApplication;
  let providerToken: string;
  let providerId: string;
  let organizerToken: string;
  let organizerId: string;
  let eventId: string;
  let listingId: string;

  beforeAll(async () => {
    process.env.USE_TYPEORM = 'false';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create provider
    const providerRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'provider@test.com',
        password: 'password123',
        role: 'PROVIDER',
      })
      .expect(201);
    providerToken = providerRes.body.access_token;
    providerId = providerRes.body.user.id;

    // Create organizer (FOUNDER can create events)
    const organizerRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'organizer@test.com',
        password: 'password123',
        role: 'FOUNDER',
      })
      .expect(201);
    organizerToken = organizerRes.body.access_token;
    organizerId = organizerRes.body.user.id;

    // Create an event for booking
    const eventRes = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        title: 'Event for Provider Test',
        description: 'Testing provider bookings',
        type: 'HOUSE_DAY',
        genre: 'HOUSE',
        startTime: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
      })
      .expect(201);
    eventId = eventRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /providers/listings - Create Service Listing', () => {
    it('should allow PROVIDER to create listing', () => {
      return request(app.getHttpServer())
        .post('/providers/listings')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          title: 'Professional DJ Setup',
          description: 'CDJs, Mixer, Speakers',
          category: 'DJ_GEAR',
          pricePerDayAmount: 15000, // 150 EUR
          pricePerDayCurrency: 'EUR',
          specs: {
            equipment: ['CDJ-3000', 'DJM-900NXS2'],
            power: '220V',
          },
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('Professional DJ Setup');
          expect(res.body.category).toBe('DJ_GEAR');
          expect(res.body.isAvailable).toBe(true);
          listingId = res.body.id;
        });
    });

    it('should reject non-PROVIDER from creating listing', () => {
      return request(app.getHttpServer())
        .post('/providers/listings')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'Should Fail',
          description: 'Not a provider',
          category: 'DJ_GEAR',
          pricePerDayAmount: 10000,
          pricePerDayCurrency: 'EUR',
        })
        .expect(403);
    });
  });

  describe('GET /providers/listings - List Service Listings', () => {
    beforeAll(async () => {
      // Create a few more listings
      await request(app.getHttpServer())
        .post('/providers/listings')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          title: 'Lighting Package',
          description: 'Moving heads and strobes',
          category: 'LIGHTING',
          pricePerDayAmount: 8000,
          pricePerDayCurrency: 'EUR',
        })
        .expect(201);
    });

    it('should list all available listings (public)', () => {
      return request(app.getHttpServer())
        .get('/providers/listings')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('listings');
          expect(Array.isArray(res.body.listings)).toBe(true);
          expect(res.body.listings.length).toBeGreaterThan(0);
        });
    });

    it('should filter listings by category', () => {
      return request(app.getHttpServer())
        .get('/providers/listings?category=LIGHTING')
        .expect(200)
        .expect((res) => {
          res.body.listings.forEach((listing: any) => {
            expect(listing.category).toBe('LIGHTING');
          });
        });
    });

    it('should filter listings by provider', () => {
      return request(app.getHttpServer())
        .get(`/providers/listings?providerId=${providerId}`)
        .expect(200)
        .expect((res) => {
          res.body.listings.forEach((listing: any) => {
            expect(listing.providerId).toBe(providerId);
          });
        });
    });
  });

  describe('PATCH /providers/listings/:id - Update Listing', () => {
    it('should allow provider to update their own listing', () => {
      return request(app.getHttpServer())
        .patch(`/providers/listings/${listingId}`)
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          pricePerDayAmount: 18000, // Update price
          pricePerDayCurrency: 'EUR',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.pricePerDay.amount).toBe(18000);
        });
    });

    it('should allow provider to mark listing as unavailable', () => {
      return request(app.getHttpServer())
        .patch(`/providers/listings/${listingId}`)
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          isAvailable: false,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.isAvailable).toBe(false);
        });
    });
  });

  describe('POST /providers/bookings - Book Service', () => {
    let availableListingId: string;

    beforeAll(async () => {
      // Create a new available listing
      const res = await request(app.getHttpServer())
        .post('/providers/listings')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          title: 'Audio PA System',
          description: 'Professional sound system',
          category: 'AUDIO_PA',
          pricePerDayAmount: 20000,
          pricePerDayCurrency: 'EUR',
        })
        .expect(201);
      availableListingId = res.body.id;
    });

    it('should allow organizer to book service for their event', () => {
      const startDate = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);
      const endDate = new Date(Date.now() + 22 * 24 * 60 * 60 * 1000); // 2 days

      return request(app.getHttpServer())
        .post('/providers/bookings')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          serviceListingId: availableListingId,
          eventId: eventId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.status).toBe('PENDING');
          expect(res.body.eventId).toBe(eventId);
          expect(res.body.serviceListingId).toBe(availableListingId);
          // Total cost should be 2 days * 200 EUR = 400 EUR = 40000 cents
          expect(res.body.totalCost.amount).toBe(40000);
        });
    });

    it('should reject booking for non-existent listing', () => {
      const startDate = new Date(Date.now() + 25 * 24 * 60 * 60 * 1000);
      const endDate = new Date(Date.now() + 27 * 24 * 60 * 60 * 1000);

      return request(app.getHttpServer())
        .post('/providers/bookings')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          serviceListingId: 'non-existent-id',
          eventId: eventId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })
        .expect(404);
    });

    it('should reject overlapping bookings', async () => {
      // First booking
      const startDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date(Date.now() + 32 * 24 * 60 * 60 * 1000);

      await request(app.getHttpServer())
        .post('/providers/bookings')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          serviceListingId: availableListingId,
          eventId: eventId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })
        .expect(201);

      // Second booking with overlap should fail
      return request(app.getHttpServer())
        .post('/providers/bookings')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          serviceListingId: availableListingId,
          eventId: eventId,
          startDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .expect(400);
    });
  });

  describe('POST /providers/bookings/:id/accept - Accept Booking', () => {
    let bookingId: string;

    beforeAll(async () => {
      // Create a booking
      const listingRes = await request(app.getHttpServer())
        .post('/providers/listings')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          title: 'Test Equipment',
          description: 'For acceptance test',
          category: 'DJ_GEAR',
          pricePerDayAmount: 10000,
          pricePerDayCurrency: 'EUR',
        })
        .expect(201);

      const startDate = new Date(Date.now() + 40 * 24 * 60 * 60 * 1000);
      const endDate = new Date(Date.now() + 42 * 24 * 60 * 60 * 1000);

      const bookingRes = await request(app.getHttpServer())
        .post('/providers/bookings')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          serviceListingId: listingRes.body.id,
          eventId: eventId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })
        .expect(201);
      bookingId = bookingRes.body.id;
    });

    it('should allow provider to accept booking', () => {
      return request(app.getHttpServer())
        .post(`/providers/bookings/${bookingId}/accept`)
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('CONFIRMED');
        });
    });

    it('should reject non-provider from accepting booking', () => {
      return request(app.getHttpServer())
        .post(`/providers/bookings/${bookingId}/accept`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(403);
    });
  });

  describe('POST /providers/bookings/:id/reject - Reject Booking', () => {
    let bookingId: string;

    beforeAll(async () => {
      // Create a new booking
      const listingRes = await request(app.getHttpServer())
        .post('/providers/listings')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          title: 'Reject Test Equipment',
          description: 'For rejection test',
          category: 'LIGHTING',
          pricePerDayAmount: 5000,
          pricePerDayCurrency: 'EUR',
        })
        .expect(201);

      const startDate = new Date(Date.now() + 50 * 24 * 60 * 60 * 1000);
      const endDate = new Date(Date.now() + 52 * 24 * 60 * 60 * 1000);

      const bookingRes = await request(app.getHttpServer())
        .post('/providers/bookings')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          serviceListingId: listingRes.body.id,
          eventId: eventId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })
        .expect(201);
      bookingId = bookingRes.body.id;
    });

    it('should allow provider to reject booking', () => {
      return request(app.getHttpServer())
        .post(`/providers/bookings/${bookingId}/reject`)
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('REJECTED');
        });
    });
  });
});




