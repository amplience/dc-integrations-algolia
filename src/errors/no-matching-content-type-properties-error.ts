import { HttpError } from './http-error.interface';

export class NoMatchingContentTypePropertiesError extends Error implements HttpError {
  public readonly statusCode = 202;
  public constructor(properties: string[], propertyWhitelist: string[]) {
    super(
      `None of the content type properties [${properties.join(
        ';'
      )}] are listed in the whitelist: [${propertyWhitelist.join(';')}]`
    );
  }
}
