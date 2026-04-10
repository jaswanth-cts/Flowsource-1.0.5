import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { BusinessException } from '../exception/BusinessException';
import * as Mollitia from 'mollitia';

jest.mock('mollitia', () => ({
  Circuit: jest.fn().mockImplementation(() => ({
    fn: jest.fn().mockImplementation((fn) => ({
      execute: fn,
    })),
  })),
  Ratelimit: jest.fn().mockImplementation(() => ({})),
  Retry: jest.fn().mockImplementation(() => ({})),
  Bulkhead: jest.fn().mockImplementation(() => ({})),
  SlidingCountBreaker: jest.fn().mockImplementation(() => ({})),
  RatelimitError: class {},
  BulkheadOverloadError: class {},
  BulkheadQueueWaitError: class {},
  BreakerError: class {},
}));

describe('AppService', () => {
  let service: AppService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return Hello World message', async () => {
    const result = await service.getHello();
    expect(result).toEqual({ message: 'Hello World!' });
  });

  it('should handle HttpException in failure method', async () => {
    const error = new HttpException('This is a remote exception', HttpStatus.INTERNAL_SERVER_ERROR);
    const result = await service.failure().catch((e) => e);
    expect(result).toEqual({ status: error.getStatus(), message: error.message });
  });

  it('should handle BusinessException in ignoreException method', async () => {
    const error = new BusinessException('This exception is ignored by the CircuitBreaker of helloservice');
    const result = await service.ignoreException().catch((e) => e);
    expect(result).toEqual({ message: error.message });
  });

  // Add more tests to handle Mollitia errors
});
