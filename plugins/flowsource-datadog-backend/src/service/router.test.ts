import { getVoidLogger } from '@backstage/backend-common';
import express from 'express';
import request from 'supertest';

import { createRouter } from './router';

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    const router = await createRouter({
      logger: getVoidLogger(),
      config:getConfig()
    });
    app = express().use(router);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /health', () => {
    it('returns ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /applicationevents', () => {
    it('should respond with 400 for invalid parameters', async () => {
      const res = await request(app).get('/applicationevents');
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'invalid parameters');
    });
  });
});

  // Add more tests here for different scenarios
  // that you want to cover
  


function getConfig(): import("@backstage/config").Config {
  throw new Error('Function not implemented.');
}

