import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from '../service/app.service';

jest.mock('../service/app.service');

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('getHello', () => {
    it('should return "Hello World!"', async () => {
      jest.spyOn(appService, 'getHello').mockImplementation(() => Promise.resolve({ message: 'Hello World!' }));
      expect(await appController.getHello()).toStrictEqual({ message: 'Hello World!' });
    });
  });

  describe('failure', () => {
    it('should handle failure', async () => {
      const error = { status: 500, message: 'This is a remote exception' };
      jest.spyOn(appService, 'failure').mockImplementation(() => Promise.reject(error));
      expect(await appController.failure().catch((e) => e)).toEqual(error);
    });
  });

  describe('ignoreException', () => {
    it('should handle BusinessException', async () => {
      const error = { message: 'This exception is ignored by the CircuitBreaker of helloservice' };
      jest.spyOn(appService, 'ignoreException').mockImplementation(() => Promise.reject(error));
      expect(await appController.ignoreException().catch((e) => e)).toEqual(error);
    });
  });
});
