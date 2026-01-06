import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Event Ownership (e2e)', () => {
  let app: INestApplication;
  let organizerToken: string;
  let organizerId: string;
  let otherDjToken: string;
  let otherDjId: string;
  let adminToken: string;
  let eventId: string;

  beforeAll(async () => {
    process.env.USE_TYPEORM = 'false';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create organizer (DJ who will create event)
    const organizerRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'organizer@test.com',
        password: 'password123',
        role: 'DJ',
      })
      .expect(201);
    organizerToken = organizerRes.body.access_token;
    organizerId = organizerRes.body.user.id;

    // Create another DJ (should not be able to modify organizer's event)
    const otherDjRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'otherdj@test.com',
        password: 'password123',
        role: 'DJ',
      })
      .expect(201);
    otherDjToken = otherDjRes.body.access_token;
    otherDjId = otherDjRes.body.user.id;

    // Create admin (should be able to modify any event)
    const adminRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'admin@test.com',
        password: 'password123',
        role: 'ADMIN',
      })
      .expect(201);
    adminToken = adminRes.body.access_token;

    // Create an event as organizer
    const eventRes = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        title: 'Ownership Test Event',
        description: 'Testing ownership verification',
        type: 'HOUSE_DAY',
        genre: 'HOUSE',
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
        venueId: 'test-venue-id',
      })
      .expect(201);
    eventId = eventRes.body.id;

    // Publish the event
    await request(app.getHttpServer())
      .patch(`/events/${eventId}/publish`)
      .set('Authorization', `Bearer ${organizerToken}`)
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Publish Event - Ownership', () => {
    it('should allow organizer to publish their own event', () => {
      // Create new event
      return request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'My Event',
          description: 'My own event',
          type: 'HOUSE_DAY',
          genre: 'HOUSE',
          startTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
          venueId: 'test-venue-id',
        })
        .expect(201)
        .then((res) => {
          return request(app.getHttpServer())
            .patch(`/events/${res.body.id}/publish`)
            .set('Authorization', `Bearer ${organizerToken}`)
            .expect(200);
        });
    });

    it('should reject other DJ from publishing organizer event', () => {
      return request(app.getHttpServer())
        .patch(`/events/${eventId}/publish`)
        .set('Authorization', `Bearer ${otherDjToken}`)
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toContain('Only the event organizer');
        });
    });

    it('should allow ADMIN to publish any event', () => {
      // Create new event
      return request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'Admin Test Event',
          description: 'Admin can publish',
          type: 'HOUSE_DAY',
          genre: 'HOUSE',
          startTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
          venueId: 'test-venue-id',
        })
        .expect(201)
        .then((res) => {
          return request(app.getHttpServer())
            .patch(`/events/${res.body.id}/publish`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);
        });
    });
  });

  describe('Fund Event - Ownership', () => {
    it('should allow organizer to fund their own event', () => {
      // Create and publish new event
      return request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'Fund Test Event',
          description: 'Testing fund ownership',
          type: 'HOUSE_DAY',
          genre: 'HOUSE',
          startTime: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
          venueId: 'test-venue-id',
        })
        .expect(201)
        .then((res) => {
          const newEventId = res.body.id;
          return request(app.getHttpServer())
            .patch(`/events/${newEventId}/publish`)
            .set('Authorization', `Bearer ${organizerToken}`)
            .expect(200)
            .then(() => {
              return request(app.getHttpServer())
                .post(`/events/${newEventId}/fund`)
                .set('Authorization', `Bearer ${organizerToken}`)
                .expect(200);
            });
        });
    });

    it('should reject other DJ from funding organizer event', () => {
      return request(app.getHttpServer())
        .post(`/events/${eventId}/fund`)
        .set('Authorization', `Bearer ${otherDjToken}`)
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toContain('Only the event organizer');
        });
    });

    it('should allow ADMIN to fund any event', () => {
      // Create and publish new event
      return request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'Admin Fund Test',
          description: 'Admin can fund',
          type: 'HOUSE_DAY',
          genre: 'HOUSE',
          startTime: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
          venueId: 'test-venue-id',
        })
        .expect(201)
        .then((res) => {
          const newEventId = res.body.id;
          return request(app.getHttpServer())
            .patch(`/events/${newEventId}/publish`)
            .set('Authorization', `Bearer ${organizerToken}`)
            .expect(200)
            .then(() => {
              return request(app.getHttpServer())
                .post(`/events/${newEventId}/fund`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
            });
        });
    });
  });

  describe('Cancel Event - Ownership', () => {
    it('should allow organizer to cancel their own event', () => {
      // Create new event
      return request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'Cancel Test Event',
          description: 'Testing cancel ownership',
          type: 'HOUSE_DAY',
          genre: 'HOUSE',
          startTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
        })
        .expect(201)
        .then((res) => {
          return request(app.getHttpServer())
            .post(`/events/${res.body.id}/cancel`)
            .set('Authorization', `Bearer ${organizerToken}`)
            .expect(200);
        });
    });

    it('should reject other DJ from canceling organizer event', () => {
      // Create new event for this test
      return request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'Protected Cancel Event',
          description: 'Should not be cancelable by other DJ',
          type: 'HOUSE_DAY',
          genre: 'HOUSE',
          startTime: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
        })
        .expect(201)
        .then((res) => {
          return request(app.getHttpServer())
            .post(`/events/${res.body.id}/cancel`)
            .set('Authorization', `Bearer ${otherDjToken}`)
            .expect(403)
            .expect((res) => {
              expect(res.body.message).toContain('Only the event organizer');
            });
        });
    });

    it('should allow ADMIN to cancel any event', () => {
      // Create new event
      return request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'Admin Cancel Test',
          description: 'Admin can cancel',
          type: 'HOUSE_DAY',
          genre: 'HOUSE',
          startTime: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
        })
        .expect(201)
        .then((res) => {
          return request(app.getHttpServer())
            .post(`/events/${res.body.id}/cancel`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);
        });
    });
  });

  describe('Complete Event - Ownership', () => {
    it('should allow organizer to complete their own event', () => {
      // Create, publish and fund event
      return request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'Complete Test Event',
          description: 'Testing complete ownership',
          type: 'HOUSE_DAY',
          genre: 'HOUSE',
          startTime: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
          venueId: 'test-venue-id',
        })
        .expect(201)
        .then((res) => {
          const newEventId = res.body.id;
          return request(app.getHttpServer())
            .patch(`/events/${newEventId}/publish`)
            .set('Authorization', `Bearer ${organizerToken}`)
            .expect(200)
            .then(() => {
              return request(app.getHttpServer())
                .post(`/events/${newEventId}/fund`)
                .set('Authorization', `Bearer ${organizerToken}`)
                .expect(200)
                .then(() => {
                  return request(app.getHttpServer())
                    .post(`/events/${newEventId}/complete`)
                    .set('Authorization', `Bearer ${organizerToken}`)
                    .expect(200);
                });
            });
        });
    });

    it('should reject other DJ from completing organizer event', () => {
      // Create, publish and fund event
      return request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'Protected Complete Event',
          description: 'Should not be completable by other DJ',
          type: 'HOUSE_DAY',
          genre: 'HOUSE',
          startTime: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
          venueId: 'test-venue-id',
        })
        .expect(201)
        .then((res) => {
          const newEventId = res.body.id;
          return request(app.getHttpServer())
            .patch(`/events/${newEventId}/publish`)
            .set('Authorization', `Bearer ${organizerToken}`)
            .expect(200)
            .then(() => {
              return request(app.getHttpServer())
                .post(`/events/${newEventId}/fund`)
                .set('Authorization', `Bearer ${organizerToken}`)
                .expect(200)
                .then(() => {
                  return request(app.getHttpServer())
                    .post(`/events/${newEventId}/complete`)
                    .set('Authorization', `Bearer ${otherDjToken}`)
                    .expect(403)
                    .expect((res) => {
                      expect(res.body.message).toContain('Only the event organizer');
                    });
                });
            });
        });
    });
  });
});

