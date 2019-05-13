import { HttpError } from './http-error.interface';

export class NoMatchingContentTypePropertyError extends Error implements HttpError {
  public readonly statusCode = 202;
  public constructor(property: string, propertyWhitelist: string[]) {
    super(`The property '${property}' does not match any in the whitelist: [${propertyWhitelist.join(', ')}]`);
  }
}
