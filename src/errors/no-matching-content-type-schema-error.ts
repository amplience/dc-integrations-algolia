import { HttpError } from './http-error.interface';

export class NoMatchingContentTypeSchemaError extends Error implements HttpError {
  public readonly statusCode = 202;
  public constructor(schema: string, schemaWhitelist: string[]) {
    super(`The content type schema '${schema}' does not match any in the whitelist: [${schemaWhitelist.join('; ')}]`);
  }
}
