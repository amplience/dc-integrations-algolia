import "reflect-metadata";
import * as debug from "debug";
import * as express from "express";
import { ValidateWebhookSignature } from "./middleware/validate-webhook-signature";
import { expressHandler } from "./webhooks/dc-snapshot-published-webhook";
import * as dotenv from 'dotenv';
import { DefaultErrorHandler } from "./middleware/default-error-handler";
import {EnvConfigValidator} from "./common/config-validation/env-config-validator";

dotenv.config();

EnvConfigValidator.validateEnvironment(process.env);

const PORT: number = Number(process.env.PORT) || 3000;
const DC_CLIENT_ID: string = process.env.DC_CLIENT_ID;
const DC_CLIENT_SECRET: string = process.env.DC_CLIENT_SECRET;

const log = debug("dc-integrations-algolia:app");
const app = express();
const router = express.Router();

router.post(
  "/webhook",
  ValidateWebhookSignature.middleware(process.env.WEBHOOK_SECRET),
  expressHandler
);

app.use("/", router);
app.use(DefaultErrorHandler.handleError);
app.listen(PORT, () => log(`Listening on port ${PORT}!`));
