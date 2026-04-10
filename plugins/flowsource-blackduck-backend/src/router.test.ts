import express from 'express';
import request from 'supertest';

describe('createRouter', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.resetAllMocks();

    app = express();
    app.get('/health', (_, res) => {
      res.status(200).json({ status: 'ok' });
    });
  });

  describe('GET /health', () => {
    it('returns ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});
