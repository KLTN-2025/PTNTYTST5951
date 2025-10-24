import { ConflictException } from '@nestjs/common';

export class ValidationConflictException extends ConflictException {
  constructor(details: { field: string; message: string }[]) {
    super({
      message: 'Validation conflict',
      details,
    });
  }
}
