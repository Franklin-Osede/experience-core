import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Events (e2e)', () => {
  let app: INestApplication;
  let organizerToken: string;
  let organizerId: string;
  let fanToken: string;
  let fanId: string;

  beforeAll(async () => {
    process.env.USE_TYPEORM = 'false';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

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

    // Create fan for RSVP
    const fanRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'fan@test.com',
        password: 'password123',
        role: 'FAN',
      })
      .expect(201);
    fanToken = fanRes.body.access_token;
    fanId = fanRes.body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /events - Create Event', () => {
    it('should create a draft event', () => {
      return request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'Test House Day',
          description: 'A test event',
          type: 'HOUSE_DAY',
          genre: 'HOUSE',
          startTime: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 7 days from now
          endTime: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000,
          ).toISOString(), // +4 hours
          maxCapacity: 100,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('Test House Day');
          expect(res.body.status).toBe('DRAFT');
        });
    });

    it('should reject event creation without auth', () => {
      return request(app.getHttpServer())
        .post('/events')
        .send({
          title: 'Unauthorized Event',
          description: 'Should fail',
          type: 'HOUSE_DAY',
          genre: 'HOUSE',
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        })
        .expect(401);
    });
  });

  describe('GET /events - List Events', () => {
    let eventId: string;

    beforeAll(async () => {
      // Create an event first
      const res = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'Listable Event',
          description: 'For listing test',
          type: 'CLUB_NIGHT',
          genre: 'TECHNO',
          startTime: new Date(
            Date.now() + 14 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          endTime: new Date(
            Date.now() + 14 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000,
          ).toISOString(),
        })
        .expect(201);
      eventId = res.body.id;
    });

    it('should list events without auth (public)', () => {
      return request(app.getHttpServer())
        .get('/events')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('should filter events by type', () => {
      return request(app.getHttpServer())
        .get('/events?type=CLUB_NIGHT')
        .expect(200)
        .expect((res) => {
          res.body.data.forEach((event: any) => {
            expect(event.type).toBe('CLUB_NIGHT');
          });
        });
    });
  });

  describe('PATCH /events/:id/publish - Publish Event', () => {
    let draftEventId: string;

    beforeAll(async () => {
      // Create a draft event
      const res = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'Event to Publish',
          description: 'Will be published',
          type: 'HOUSE_DAY',
          genre: 'HOUSE',
          startTime: new Date(
            Date.now() + 10 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          endTime: new Date(
            Date.now() + 10 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000,
          ).toISOString(),
        })
        .expect(201);
      draftEventId = res.body.id;
    });

    it('should publish a draft event', () => {
      return request(app.getHttpServer())
        .patch(`/events/${draftEventId}/publish`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('PUBLISHED');
        });
    });

    it('should reject publishing non-existent event', () => {
      return request(app.getHttpServer())
        .patch('/events/non-existent-id/publish')
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(404);
    });
  });

  describe('POST /events/:id/rsvp - RSVP to Event', () => {
    let publishedEventId: string;

    beforeAll(async () => {
      // Create and publish an event
      const createRes = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'RSVP Test Event',
          description: 'For RSVP testing',
          type: 'HOUSE_DAY',
          genre: 'HOUSE',
          startTime: new Date(
            Date.now() + 20 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          endTime: new Date(
            Date.now() + 20 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000,
          ).toISOString(),
          maxCapacity: 50,
        })
        .expect(201);

      publishedEventId = createRes.body.id;

      await request(app.getHttpServer())
        .patch(`/events/${publishedEventId}/publish`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(200);
    });

    it('should allow fan to RSVP to published event', () => {
      return request(app.getHttpServer())
        .post(`/events/${publishedEventId}/rsvp`)
        .set('Authorization', `Bearer ${fanToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body.status).toBe('PENDING');
          expect(res.body.userId).toBe(fanId);
          expect(res.body.eventId).toBe(publishedEventId);
        });
    });

    it('should reject RSVP to non-existent event', () => {
      return request(app.getHttpServer())
        .post('/events/non-existent-id/rsvp')
        .set('Authorization', `Bearer ${fanToken}`)
        .expect(404);
    });

    it('should reject duplicate RSVP', async () => {
      // First RSVP
      await request(app.getHttpServer())
        .post(`/events/${publishedEventId}/rsvp`)
        .set('Authorization', `Bearer ${fanToken}`)
        .expect(201);

      // Second RSVP should fail
      return request(app.getHttpServer())
        .post(`/events/${publishedEventId}/rsvp`)
        .set('Authorization', `Bearer ${fanToken}`)
        .expect(400);
    });
  });

  describe('POST /events/:id/check-in - Check In', () => {
    let eventId: string;
    let attendeeId: string;

    beforeAll(async () => {
      // Create, publish event and RSVP
      const createRes = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'Check-in Test Event',
          description: 'For check-in testing',
          type: 'HOUSE_DAY',
          genre: 'HOUSE',
          startTime: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          endTime: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000,
          ).toISOString(),
        })
        .expect(201);
      eventId = createRes.body.id;

      await request(app.getHttpServer())
        .patch(`/events/${eventId}/publish`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(200);

      const rsvpRes = await request(app.getHttpServer())
        .post(`/events/${eventId}/rsvp`)
        .set('Authorization', `Bearer ${fanToken}`)
        .expect(201);
      attendeeId = rsvpRes.body.id;
    });

    it('should allow organizer to check in attendee', () => {
      return request(app.getHttpServer())
        .post(`/events/${eventId}/check-in`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({ attendeeId })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ATTENDED');
        });
    });

    it('should reject check-in by non-organizer', () => {
      return request(app.getHttpServer())
        .post(`/events/${eventId}/check-in`)
        .set('Authorization', `Bearer ${fanToken}`)
        .send({ attendeeId })
        .expect(403);
    });
  });
});
