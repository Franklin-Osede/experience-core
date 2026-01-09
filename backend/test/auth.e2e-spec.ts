import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Use in-memory repositories for E2E tests
    process.env.USE_TYPEORM = 'false';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/signup', () => {
    it('should create a new user with FAN role', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'fan@test.com',
          password: 'password123',
          role: 'FAN',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe('fan@test.com');
          expect(res.body.user.role).toBe('FAN');
        });
    });

    it('should create a DJ with unlimited invite credits', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'dj@test.com',
          password: 'password123',
          role: 'DJ',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.user.role).toBe('DJ');
          // DJs should have unlimited invites (Infinity mapped to -1 in DB)
        });
    });

    it('should reject duplicate email', async () => {
      // First signup
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'duplicate@test.com',
          password: 'password123',
          role: 'FAN',
        })
        .expect(201);

      // Second signup with same email should fail
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'duplicate@test.com',
          password: 'password123',
          role: 'FAN',
        })
        .expect(400);
    });

    it('should validate email format', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'password123',
          role: 'FAN',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    let testUser: { email: string; password: string };

    beforeAll(async () => {
      testUser = {
        email: 'login@test.com',
        password: 'password123',
      };

      // Create user first
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          ...testUser,
          role: 'FAN',
        })
        .expect(201);
    });

    it('should login with correct credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe(testUser.email);
        });
    });

    it('should reject incorrect password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should reject non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('JWT Token Usage', () => {
    let accessToken: string;
    let userId: string;

    beforeAll(async () => {
      // Signup and get token
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'jwt@test.com',
          password: 'password123',
          role: 'FAN',
        })
        .expect(201);

      accessToken = response.body.access_token;
      userId = response.body.user.id;
    });

    it('should access protected endpoint with valid token', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe('jwt@test.com');
        });
    });

    it('should reject request without token', () => {
      return request(app.getHttpServer()).get(`/users/${userId}`).expect(401);
    });

    it('should reject request with invalid token', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
