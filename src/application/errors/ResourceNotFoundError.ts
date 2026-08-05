import { ApplicationError } from './ApplicationError';

export class ResourceNotFoundError extends ApplicationError {
  constructor(
    resource: string,
    id?: string
  ) {
    super(
      `${resource}${id ? ` with id ${id}` : ''} not found`,
      'RESOURCE_NOT_FOUND',
      404,
      { resource, id }
    );
  }
}