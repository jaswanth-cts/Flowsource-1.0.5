import { HttpException, HttpStatus } from '@nestjs/common';

export class ResourceNotFoundException extends HttpException {
  constructor(message: string, cause?: any);
  constructor(invalidId: number);
  constructor(messageOrId: string | number, cause?: any) {
    if (typeof messageOrId === 'number') {
      super(`Resource with id ${messageOrId} not found`, HttpStatus.NOT_FOUND);
    } else {
      super(messageOrId, HttpStatus.NOT_FOUND);
    }
  }
}
