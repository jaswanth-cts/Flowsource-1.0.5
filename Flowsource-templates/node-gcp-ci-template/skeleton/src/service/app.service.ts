import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BusinessException } from '../exception/BusinessException';
import * as Mollitia from 'mollitia';

@Injectable()
export class AppService {
  private resilience: Mollitia.Circuit;
  private helloResilience: Mollitia.Circuit;

  constructor(private configService: ConfigService) {
    this.resilience = this.createResilienceCircuit(
      this.configService.get<number>('RATELIMIT_LIMIT_PERIOD'),
      this.configService.get<number>('RATELIMIT_LIMIT_FOR_PERIOD'),
      this.configService.get<number>('BULKHEAD_CONCURRENT_SIZE'),
      this.configService.get<number>('BULKHEAD_QUEUE_SIZE'),
      this.configService.get<number>('BULKHEAD_MAX_QUEUE_WAIT'),
      this.configService.get<number>('CIRCUITBREAKER_SLIDING_WINDOW_SIZE'), 
      this.configService.get<number>('CIRCUITBREAKER_MINIMUM_NUMBER_OF_CALLS'),
      this.configService.get<number>('CIRCUITBREAKER_FAILURE_RATE_THRESHOLD'),
      this.configService.get<number>('CIRCUITBREAKER_PERMITTED_NUMBER_OF_CALLS_IN_HALF_OPEN_STATE'),
      this.configService.get<number>('CIRCUITBREAKER_OPEN_STATE_DELAY'),
      Number(this.configService.get('RETRY_ATTEMPTS')),
      Number(this.configService.get('RETRY_INTERVAL')),
      (rejection) => !(rejection instanceof BusinessException),
      (error) => !(error instanceof BusinessException)
    );
    this.helloResilience = this.createResilienceCircuit(
      this.configService.get<number>('HELLO_RATELIMIT_LIMIT_PERIOD'),
      this.configService.get<number>('HELLO_RATELIMIT_LIMIT_FOR_PERIOD'),
      this.configService.get<number>('HELLO_BULKHEAD_CONCURRENT_SIZE'),
      this.configService.get<number>('HELLO_BULKHEAD_QUEUE_SIZE'),
      this.configService.get<number>('HELLO_BULKHEAD_MAX_QUEUE_WAIT'),
      this.configService.get<number>('HELLO_CIRCUITBREAKER_SLIDING_WINDOW_SIZE'),
      this.configService.get<number>('HELLO_CIRCUITBREAKER_MINIMUM_NUMBER_OF_CALLS'),
      this.configService.get<number>('HELLO_CIRCUITBREAKER_FAILURE_RATE_THRESHOLD'),
      this.configService.get<number>('HELLO_CIRCUITBREAKER_PERMITTED_NUMBER_OF_CALLS_IN_HALF_OPEN_STATE'),
      this.configService.get<number>('HELLO_CIRCUITBREAKER_OPEN_STATE_DELAY'),
      Number(this.configService.get('HELLO_RETRY_ATTEMPTS')),
      Number(this.configService.get('HELLO_RETRY_INTERVAL')),
      (rejection) => !(rejection instanceof BusinessException),
      (error) => !(error instanceof BusinessException)

    );
  }

  private createResilienceCircuit(
    limitPeriod: number, 
    limitForPeriod: number, 
    concurrentSize: number, 
    queueSize: number, 
    maxQueueWait: number, 
    slidingWindowSize: number,
    minimumNumberOfCalls: number, 
    failureRateThreshold: number, 
    permittedNumberOfCallsInHalfOpenState: number,
    openStateDelay: number,
    attempts: number, 
    interval: number,
    onRejection: (rejection: any) => boolean,
    onError: (error: any) => boolean
  ): Mollitia.Circuit {
    return new Mollitia.Circuit({
      options: {
        modules: [
          new Mollitia.Ratelimit({
            limitPeriod,
            limitForPeriod
          }),
          new Mollitia.Retry({
            attempts,
            interval,
            onRejection
          }),
          new Mollitia.Bulkhead({
            concurrentSize,
            queueSize,
            maxQueueWait
          }),
          new Mollitia.SlidingCountBreaker({
            slidingWindowSize,
            minimumNumberOfCalls,
            failureRateThreshold,
            permittedNumberOfCallsInHalfOpenState,
            openStateDelay,
            onError
          })
        ]
      }
    });
  }

    async getHello() {
    return this.helloResilience.fn(async () => {
      return { message: 'Hello World!' };
    }).execute().catch((err) => {
      if (err instanceof Mollitia.RatelimitError) {
             return 'FallBack Message: Rate Limit Exceeded';
         } else if (err instanceof Mollitia.BulkheadOverloadError) {
             return 'FallBack Message: Bulk Head Overload';
         } else if (err instanceof Mollitia.BulkheadQueueWaitError) {
             return 'FallBack Message: Bulk Head Queue Wait';
         } else if (err instanceof Mollitia.BreakerError) {
             return 'FallBack Message: Circuit Breaker is Open';
         }
    });
  }

  async failure() {
    return this.resilience.fn(async () => {
      throw new HttpException('This is a remote exception', HttpStatus.INTERNAL_SERVER_ERROR);
    }).execute().catch((err) => {
       if (err instanceof HttpException) {
              return { status: err.getStatus(), message: err.message };
          } else if (err instanceof Mollitia.RatelimitError) {
              return 'FallBack Message: Rate Limit Exceeded';
          } else if (err instanceof Mollitia.BulkheadOverloadError) {
              return 'FallBack Message: Bulk Head Overload';
          } else if (err instanceof Mollitia.BulkheadQueueWaitError) {
              return 'FallBack Message: Bulk Head Queue Wait';
          } else if (err instanceof Mollitia.BreakerError) {
              return 'FallBack Message: Circuit Breaker is Open';
          }
    });
  }

  async ignoreException() {
    return this.resilience.fn(async () => {
      throw new BusinessException("This exception is ignored by the CircuitBreaker of helloservice");
    }).execute().catch((err) => {
      if (err instanceof BusinessException) {
              return { message: err.message };
          } else if (err instanceof Mollitia.RatelimitError) {
              return 'FallBack Message: Rate Limit Exceeded';
          } else if (err instanceof Mollitia.BulkheadOverloadError) {
              return 'FallBack Message: Bulk Head Overload';
          } else if (err instanceof Mollitia.BulkheadQueueWaitError) {
              return 'FallBack Message: Bulk Head Queue Wait';
          } else if (err instanceof Mollitia.BreakerError) {
              return 'FallBack Message: Circuit Breaker is Open';
          }
    });
  }

  async slow() {
  return this.resilience.fn(async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ message: 'Hello World!' });
      }, 20000);
    });
  }).execute().catch((err) => {
    if (err instanceof Mollitia.BulkheadOverloadError) {
      return ('FallBack Message: Too many request - No further calls are accepted');
    } 
  });
 }
}
