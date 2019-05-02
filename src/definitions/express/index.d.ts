import { Request } from 'express';

declare module 'express' {
  interface Request {
    rawBody: Buffer;
    bodyEncoding: string;
  }
}
