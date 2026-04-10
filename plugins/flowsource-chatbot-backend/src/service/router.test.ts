// import { getVoidLogger } from '@backstage/backend-common';
import express from 'express';
import request from 'supertest';
// import { ConfigReader } from '@backstage/config';
// import { createRouter } from './router';

// const config = ConfigReader.fromConfigs([
//   {
//     context: '',
//     data: {
//       chatbot: {
//           url: 'http://localhost:1234',
//           api_key: '1234567890abcdefghijklmnopqrstuvwxyz',
//       },
//     },
//   },
// ]);

describe('createRouter', () => {
  let app: express.Express;

  // beforeAll(async () => {
  //   const router = await createRouter({
  //     logger: getVoidLogger(),
  //     config
  //   });
  //   app = express().use(router);
  // });

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
