import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as crypto from "crypto";
import {ValidateWebhook} from "./common/dynamic-content/validate-webhook";

const PORT: number = parseInt(process.env.PORT) || 3000;
const DC_CLIENT_ID: string = process.env.DC_CLIENT_ID;
const DC_CLIENT_SECRET: string = process.env.DC_CLIENT_SECRET;

const app = express();

// middleware to ensure the content-type is application/json
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.is('json')) {
    return res.status(406).send();
  }
  next();
});

// middleware to get the json from the request body
app.use(bodyParser.json({
  verify: (req: express.Request, res: express.Response, buf: Buffer, encoding: crypto.Utf8AsciiLatin1Encoding) => {
    req.rawBody = buf;
    req.bodyEncoding = encoding;
  }
}));

// middleware error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err) {
    return res.status(400).send();
  }
  next();
});

app.post('/webhook', ValidateWebhook.verifySignature, (req: express.Request, res: express.Response) => {
  const requestBody = req.rawBody;

  // get the root content item from dc



  res.status(200).send(requestBody);
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
