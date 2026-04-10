import { getVoidLogger } from '@backstage/backend-common';
import express from 'express';
import request from 'supertest';
import { ConfigReader } from '@backstage/config';
import { createRouter } from './router';

const config = ConfigReader.fromConfigs([
  {
    context: '',
    data: {
      azureDevOps: {
          host: 'http://localhost:1234',
          token: 'abcd@12345',
          organization: 'xyz@123'
      },
    },
  },
]);

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    const router = await createRouter({
      logger: getVoidLogger(),
      config,
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
});
