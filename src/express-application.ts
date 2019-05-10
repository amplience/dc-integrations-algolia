import * as express from 'express';
import ValidateWebhookRequest from './middleware/validate-webhook-request';
import { snapshotPublishedWebhookRouteHandler } from './webhooks/snapshot-published-webhook-route-handler';
import { DefaultErrorHandler } from './middleware/default-error-handler';

export default (): express.Application => {
  const app = express();
  const router = express.Router();

  router.post(
    '/webhook',
    ValidateWebhookRequest.middleware(process.env.WEBHOOK_SECRET),
    snapshotPublishedWebhookRouteHandler
  );

  app.use('/', router);
  app.use(DefaultErrorHandler.handleError);
  return app;
};
