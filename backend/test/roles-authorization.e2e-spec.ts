import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Roles Authorization (e2e)', () => {
  let app: INestApplication;
  let fanToken: string;
  let djToken: string;
  let venueToken: string;
  let providerToken: string;
  let founderToken: string;

  beforeAll(async () => {
    process.env.USE_TYPEORM = 'false';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create users with different roles
    const fanRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'fan@test.com', password: 'pass123', role: 'FAN' })
      .expect(201);
    fanToken = fanRes.body.access_token;

    const djRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'dj@test.com', password: 'pass123', role: 'DJ' })
      .expect(201);
    djToken = djRes.body.access_token;

    const venueRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'venue@test.com', password: 'pass123', role: 'VENUE' })
      .expect(201);
    venueToken = venueRes.body.access_token;

    const providerRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'provider@test.com',
        password: 'pass123',
        role: 'PROVIDER',
      })
      .expect(201);
    providerToken = providerRes.body.access_token;

    const founderRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'founder@test.com', password: 'pass123', role: 'FOUNDER' })
      .expect(201);
    founderToken = founderRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Provider Marketplace - Role Restrictions', () => {
    it('should allow PROVIDER to create service listing', () => {
      return request(app.getHttpServer())
        .post('/providers/listings')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          title: 'DJ Equipment',
          description: 'Professional DJ gear',
          category: 'DJ_GEAR',
          pricePerDayAmount: 5000,
          pricePerDayCurrency: 'EUR',
        })
        .expect(201);
    });

    it('should reject FAN from creating service listing', () => {
      return request(app.getHttpServer())
        .post('/providers/listings')
        .set('Authorization', `Bearer ${fanToken}`)
        .send({
          title: 'Should Fail',
          description: 'Not a provider',
          category: 'DJ_GEAR',
          pricePerDayAmount: 5000,
          pricePerDayCurrency: 'EUR',
        })
        .expect(403);
    });
  });

  describe('Gig Market - Role Restrictions', () => {
    let availabilityId: string;

    beforeAll(async () => {
      // VENUE posts availability
      const res = await request(app.getHttpServer())
        .post('/gigs/availabilities')
        .set('Authorization', `Bearer ${venueToken}`)
        .send({
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          startTime: '20:00',
          endTime: '02:00',
          genre: 'HOUSE',
        })
        .expect(201);
      availabilityId = res.body.id;
    });

    it('should allow DJ to apply to gig', () => {
      return request(app.getHttpServer())
        .post(`/gigs/availabilities/${availabilityId}/apply`)
        .set('Authorization', `Bearer ${djToken}`)
        .send({
          message: 'I want to play!',
        })
        .expect(201);
    });

    it('should reject FAN from applying to gig', () => {
      return request(app.getHttpServer())
        .post(`/gigs/availabilities/${availabilityId}/apply`)
        .set('Authorization', `Bearer ${fanToken}`)
        .send({
          message: 'Should fail',
        })
        .expect(403);
    });

    it('should allow VENUE to accept application', async () => {
      // DJ applies first
      const applyRes = await request(app.getHttpServer())
        .post(`/gigs/availabilities/${availabilityId}/apply`)
        .set('Authorization', `Bearer ${djToken}`)
        .send({ message: 'Application' })
        .expect(201);

      const applicationId = applyRes.body.id;

      // VENUE accepts
      return request(app.getHttpServer())
        .post(`/gigs/applications/${applicationId}/accept`)
        .set('Authorization', `Bearer ${venueToken}`)
        .expect(200);
    });

    it('should reject DJ from accepting application', async () => {
      // Create new availability and application
      const availRes = await request(app.getHttpServer())
        .post('/gigs/availabilities')
        .set('Authorization', `Bearer ${venueToken}`)
        .send({
          date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
          startTime: '20:00',
          endTime: '02:00',
          genre: 'TECHNO',
        })
        .expect(201);

      const applyRes = await request(app.getHttpServer())
        .post(`/gigs/availabilities/${availRes.body.id}/apply`)
        .set('Authorization', `Bearer ${djToken}`)
        .send({ message: 'Application' })
        .expect(201);

      // DJ tries to accept (should fail)
      return request(app.getHttpServer())
        .post(`/gigs/applications/${applyRes.body.id}/accept`)
        .set('Authorization', `Bearer ${djToken}`)
        .expect(403);
    });
  });

  describe('Events - Role Restrictions', () => {
    it('should allow FOUNDER to create event', () => {
      return request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${founderToken}`)
        .send({
          title: 'Founder Event',
          description: 'Created by founder',
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
    });

    it('should allow FAN to list events (public)', () => {
      return request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${fanToken}`)
        .expect(200);
    });

    it('should allow unauthenticated users to list events', () => {
      return request(app.getHttpServer()).get('/events').expect(200);
    });
  });
});
