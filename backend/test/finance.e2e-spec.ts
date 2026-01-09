import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Finance (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let userId: string;
  let walletId: string;

  beforeAll(async () => {
    process.env.USE_TYPEORM = 'false';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create user
    const userRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'finance@test.com',
        password: 'password123',
        role: 'FAN',
      })
      .expect(201);
    userToken = userRes.body.access_token;
    userId = userRes.body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /finance/wallet - Get Wallet', () => {
    it('should get user wallet', () => {
      return request(app.getHttpServer())
        .get('/finance/wallet')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('balance');
          expect(res.body.balance.amount).toBe(0);
          walletId = res.body.id;
        });
    });

    it('should reject without auth', () => {
      return request(app.getHttpServer()).get('/finance/wallet').expect(401);
    });
  });

  describe('POST /finance/wallet/deposit - Deposit', () => {
    it('should deposit money to wallet', () => {
      return request(app.getHttpServer())
        .post('/finance/wallet/deposit')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          amount: 10000, // 100.00 EUR in cents
          currency: 'EUR',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.type).toBe('DEPOSIT');
          expect(res.body.amount).toBe(10000);
        });
    });

    it('should update wallet balance after deposit', async () => {
      // Make deposit
      await request(app.getHttpServer())
        .post('/finance/wallet/deposit')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          amount: 5000,
          currency: 'EUR',
        })
        .expect(201);

      // Check wallet balance
      const walletRes = await request(app.getHttpServer())
        .get('/finance/wallet')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Balance should be at least 5000 (may be more from previous test)
      expect(walletRes.body.balance.amount).toBeGreaterThanOrEqual(5000);
    });

    it('should reject negative amount', () => {
      return request(app.getHttpServer())
        .post('/finance/wallet/deposit')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          amount: -1000,
          currency: 'EUR',
        })
        .expect(400);
    });
  });

  describe('POST /finance/wallet/withdraw - Withdraw', () => {
    beforeAll(async () => {
      // Ensure wallet has balance
      await request(app.getHttpServer())
        .post('/finance/wallet/deposit')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          amount: 20000,
          currency: 'EUR',
        })
        .expect(201);
    });

    it('should withdraw money from wallet', () => {
      return request(app.getHttpServer())
        .post('/finance/wallet/withdraw')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          amount: 5000,
          currency: 'EUR',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.type).toBe('WITHDRAWAL');
          expect(res.body.amount).toBe(5000);
        });
    });

    it('should reject withdrawal exceeding balance', async () => {
      // Get current balance
      const walletRes = await request(app.getHttpServer())
        .get('/finance/wallet')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const currentBalance = walletRes.body.balance.amount;

      // Try to withdraw more than balance
      return request(app.getHttpServer())
        .post('/finance/wallet/withdraw')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          amount: currentBalance + 1000,
          currency: 'EUR',
        })
        .expect(400);
    });
  });

  describe('POST /finance/split-payments - Create Split Payment', () => {
    let user2Token: string;
    let user2Id: string;

    beforeAll(async () => {
      // Create second user for split payment
      const user2Res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'finance2@test.com',
          password: 'password123',
          role: 'FAN',
        })
        .expect(201);
      user2Token = user2Res.body.access_token;
      user2Id = user2Res.body.user.id;

      // Ensure both users have balance
      await request(app.getHttpServer())
        .post('/finance/wallet/deposit')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ amount: 10000, currency: 'EUR' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/finance/wallet/deposit')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ amount: 10000, currency: 'EUR' })
        .expect(201);
    });

    it('should create split payment', () => {
      return request(app.getHttpServer())
        .post('/finance/split-payments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          totalAmount: 10000,
          currency: 'EUR',
          payers: [
            { userId, amount: 6000 },
            { userId: user2Id, amount: 4000 },
          ],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.totalAmount).toBe(10000);
          expect(res.body.status).toBe('PENDING');
          expect(res.body.payers).toHaveLength(2);
        });
    });

    it('should reject split payment with mismatched total', () => {
      return request(app.getHttpServer())
        .post('/finance/split-payments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          totalAmount: 10000,
          currency: 'EUR',
          payers: [
            { userId, amount: 5000 },
            { userId: user2Id, amount: 3000 }, // Total is 8000, not 10000
          ],
        })
        .expect(400);
    });
  });
});
