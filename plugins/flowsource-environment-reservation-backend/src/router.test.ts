import {
  mockErrorHandler,
  mockServices,
} from '@backstage/backend-test-utils';
import express from 'express';
import { createRouter } from './router';



// TEMPLATE NOTE:
// Testing the router directly allows you to write a unit test that mocks the provided options.
describe('createRouter', () => {
  let app: express.Express;

  beforeEach(async () => {
    
    const router = await createRouter({
      logger: mockServices.logger.mock(),
      database: mockServices.database.mock(),
    });
    app = express();
    app.use(router);
    app.use(mockErrorHandler());
  });
});
