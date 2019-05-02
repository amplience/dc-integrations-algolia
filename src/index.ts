import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as crypto from "crypto";
import {DynamicContentService} from "./common/dynamic-content/dynamic-content.service";

const PORT: number = parseInt(process.env.PORT) || 3000;
const WEBHOOK_SECRET: string = process.env.WEBHOOK_SECRET;
const DC_CLIENT_ID: string = process.env.DC_CLIENT_ID;
const DC_CLIENT_SECRET: string = process.env.DC_CLIENT_SECRET;

const app = express();

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.is('json')) {
    return res.status(406).send();
  }
  next();
});

app.use(bodyParser.json({
  verify: (req: express.Request, res: express.Response, buf: Buffer, encoding: crypto.Utf8AsciiLatin1Encoding) => {
    req.rawBody = buf;
    req.bodyEncoding = encoding;
  }
}));

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err) {
    return res.status(400).send();
  }
  next();
});

app.post('/webhook', (req: express.Request, res: express.Response) => {
  const requestBody = req.rawBody;

  const dcClient: DynamicContentService = new DynamicContentService(DC_CLIENT_ID, DC_CLIENT_SECRET);

  if (!dcClient.validateWebhookSecret(WEBHOOK_SECRET)) {
    return res.status(401).send();
  }

  res.status(200).send(requestBody);
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
