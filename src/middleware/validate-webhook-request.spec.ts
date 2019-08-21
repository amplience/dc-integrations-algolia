import { BadRequestError } from '../errors/bad-request-error';

const mockCalculate = jest.fn();
jest.mock(
  'dc-management-sdk-js',
  (): { WebhookSignature: { calculate: Function } } => {
    return {
      WebhookSignature: {
        calculate: mockCalculate
      }
    };
  }
);

import * as mocks from 'node-mocks-http';
import ValidateWebhookRequest from './validate-webhook-request';
import { NextHandleFunction } from 'connect';
import { InvalidWebhookSignatureError } from '../errors/invalid-webhook-signature-error';

describe('ValidateWebhookRequest', (): void => {
  beforeEach(
    (): void => {
      jest.resetAllMocks();
    }
  );

  describe('middleware', (): void => {
    function invokeMiddleware(): Promise<void> {
      return new Promise<void>(
        (resolve, reject): void => {
          const webhooksecret = 'webhook-secret';
          const webhookSignatureHeader = 'webhook-signature';
          const body = '{}';

          const req = mocks.createRequest({
            headers: {
              'X-Amplience-Webhook-Signature': webhookSignatureHeader,
              'Content-Type': 'application/json',
              'Content-Length': `${body.length}`
            }
          });

          const middleware: NextHandleFunction[] = ValidateWebhookRequest.middleware(webhooksecret);
          middleware.forEach(
            (fn): void => {
              fn(
                req,
                mocks.createResponse(),
                (args: Error): void => {
                  if (args) {
                    return reject(args);
                  }
                  return resolve();
                }
              );
            }
          );

          req.send(body);
        }
      );
    }

    let validateHeadersSpy;
    beforeEach(
      (): void => {
        validateHeadersSpy = jest.spyOn(ValidateWebhookRequest, 'validateHeaders');
      }
    );

    afterAll(
      (): void => {
        validateHeadersSpy.mockRestore();
      }
    );

    it('should run all middleware together successfully', async (): Promise<void> => {
      mockCalculate.mockReturnValue('webhook-signature');
      const error = await invokeMiddleware();
      expect(error).toBeUndefined();
      expect(validateHeadersSpy).toBeCalled();
      expect(mockCalculate).toBeCalledWith(new Buffer('{}'), 'webhook-secret');
    });
  });

  describe('expressJson', (): void => {
    function invokeExpressJsonMiddleware(
      webhooksecret = 'webhook-secret',
      webhookSignatureHeader = 'webhook-signature'
    ): Promise<void> {
      return new Promise<void>(
        (resolve, reject): void => {
          const body = '{}';

          const req = mocks.createRequest({
            headers: {
              'X-Amplience-Webhook-Signature': webhookSignatureHeader,
              'Content-Type': 'application/json',
              'Content-Length': `${body.length}`
            }
          });

          const middleware = ValidateWebhookRequest.expressJson(webhooksecret);
          middleware(
            req,
            mocks.createResponse(),
            (args: Error): void => {
              expect(mockCalculate).toBeCalledWith(new Buffer(body), webhooksecret);
              if (args) {
                return reject(args);
              }
              return resolve();
            }
          );
          req.send(body);
        }
      );
    }

    it('should not throw an error when WebhookSignature.calculate() matches the X-Amplience-Webhook-Signature header', async (): Promise<
      void
    > => {
      mockCalculate.mockReturnValue('webhook-signature');
      const error = await invokeExpressJsonMiddleware();
      expect(error).toBeUndefined();
    });

    it('should throw an error when WebhookSignature.calculate() matches the X-Amplience-Webhook-Signature header', async (): Promise<
      void
    > => {
      mockCalculate.mockReturnValue('different-signature');
      try {
        await invokeExpressJsonMiddleware();
      } catch (err) {
        expect(err).toBeInstanceOf(InvalidWebhookSignatureError);
        expect(err.message).toEqual('Bad Request');
      }
    });
  });

  describe('validateHeaders', (): void => {
    function invokeValidateHeadersMiddleware(headers: { [key: string]: string } = {}): Promise<string> {
      return new Promise<string>(
        (resolve, reject): void => {
          const webhookSignatureHeader = 'webhook-signature';
          const body = '{}';
          const req = mocks.createRequest({
            headers: {
              'X-Amplience-Webhook-Signature': webhookSignatureHeader,
              'Content-Length': `${body.length}`,
              ...headers
            }
          });

          ValidateWebhookRequest.validateHeaders(
            req,
            mocks.createResponse(),
            (args: Error): void => {
              if (args) {
                return reject(args);
              }
              return resolve();
            }
          );
          req.send(body);
        }
      );
    }

    it('should not throw any error when Content-Type header is set to application/json', async (done): Promise<
      void
    > => {
      try {
        const error = await invokeValidateHeadersMiddleware({ 'Content-Type': 'application/json' });
        expect(error).toBeUndefined();
        done();
      } catch (err) {
        done.fail('Expected a successful response');
      }
    });

    it('should throw an error when Content-Type header is not set', async (done): Promise<void> => {
      try {
        await invokeValidateHeadersMiddleware({});
        done.fail('Expected an error to be thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestError);
        expect(err.statusCode).toEqual(400);
        expect(err.message).toEqual('Bad Request');
        done();
      }
    });

    it('should throw an error when Content-Type header is not application/json', async (done): Promise<void> => {
      try {
        await invokeValidateHeadersMiddleware({ 'Content-Type': 'text/html' });
        done.fail('Expected an error to be thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestError);
        expect(err.statusCode).toEqual(400);
        expect(err.message).toEqual('Bad Request');
        done();
      }
    });
  });
});
