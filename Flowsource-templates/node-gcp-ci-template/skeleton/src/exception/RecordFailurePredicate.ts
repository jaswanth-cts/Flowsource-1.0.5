import { HttpException } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor() {
    super('BusinessException', 400);
  }
}

export class RecordFailurePredicate {
  // A custom Predicate which evaluates if an exception should be recorded as a failure.
  // This predicate returns true for all exceptions other than Business Exception
  test(error: Error): boolean {
    return !(error instanceof BusinessException);
  }
}
