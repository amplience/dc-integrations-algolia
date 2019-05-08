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
import ValidateWebhookSignature from './validate-webhook-signature';

beforeEach(
  (): void => {
    jest.resetAllMocks();
  }
);

describe('ValidateWebhookSignature', (): void => {
  function invokeMiddleware(
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
        const middleware = ValidateWebhookSignature.middleware(webhooksecret);
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

  test('should not throw an error when WebhookSignature.calculate() matches the X-Amplience-Webhook-Signature header', async (): Promise<
    void
  > => {
    mockCalculate.mockReturnValue('webhook-signature');
    const error = await invokeMiddleware();
    expect(error).toBeUndefined();
  });

  test('should throw an error when WebhookSignature.calculate() matches the X-Amplience-Webhook-Signature header', async (): Promise<
    void
  > => {
    mockCalculate.mockReturnValue('different-signature');
    try {
      await invokeMiddleware();
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toEqual('Webhook verification failed.');
    }
  });
});
