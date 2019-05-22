# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 1.0.0 (2019-05-22)


### Bug Fixes

* **content-item version:** the ContentItem that is processed is now the correct version (the Content ([12c9dde](https://github.com/amplience/dc-integrations-algolia/commit/12c9dde))
* **http status codes:** 500 status codesare Dynamic-Content & Algolia errors are now 202 ([61c9898](https://github.com/amplience/dc-integrations-algolia/commit/61c9898))
* **middleware:** fixed the header and body validation ([0a455a4](https://github.com/amplience/dc-integrations-algolia/commit/0a455a4))
* **property type whitelist:** added a test for the parsing of the enivornment variable ([a669fdd](https://github.com/amplience/dc-integrations-algolia/commit/a669fdd))
* **schema validation:** added content type unique validation ([a13e3d4](https://github.com/amplience/dc-integrations-algolia/commit/a13e3d4))
* **snapshot:** removed body prop from rootContentItem object ([dc4a884](https://github.com/amplience/dc-integrations-algolia/commit/dc4a884))
* **snapshot-published-webhook:** no propertyWhiteList no longer throws error ([8d15e31](https://github.com/amplience/dc-integrations-algolia/commit/8d15e31)), closes [#1448](https://github.com/amplience/dc-integrations-algolia/issues/1448)
* **validate-webhook-requests:** added en error for invalid-webhook-secret ([f88aad5](https://github.com/amplience/dc-integrations-algolia/commit/f88aad5))


### Build System

* **body-parser:** removed as no longer used ([b26ca06](https://github.com/amplience/dc-integrations-algolia/commit/b26ca06))
* **commitlint:** relaxed the subject-case rule ([a68f730](https://github.com/amplience/dc-integrations-algolia/commit/a68f730))
* **joi types:** added joi types for dev ([af4e0fa](https://github.com/amplience/dc-integrations-algolia/commit/af4e0fa))
* **nodemon:** Added nodemon and start script ([096571f](https://github.com/amplience/dc-integrations-algolia/commit/096571f))
* **package.json:** script to launch coverage html ([0e3db1c](https://github.com/amplience/dc-integrations-algolia/commit/0e3db1c))
* **standard-version package:** added standard-version package in prep for v1.0.0 release ([9799b85](https://github.com/amplience/dc-integrations-algolia/commit/9799b85))
* **test:** Running "npm run test" now will run "npm run lint" before it runs jest ([5f64f37](https://github.com/amplience/dc-integrations-algolia/commit/5f64f37))
* **travis:** Added travis config ([9041d29](https://github.com/amplience/dc-integrations-algolia/commit/9041d29))


### Features

* **config:** Support for the DC_API_URL & DC_AUTH_URL ([599e4f3](https://github.com/amplience/dc-integrations-algolia/commit/599e4f3))
* **configuration:** Environment configuration and simple validation ([c86b8c1](https://github.com/amplience/dc-integrations-algolia/commit/c86b8c1))
* **configuration validation:** allow wildcards in algolia indexes ([ab9203a](https://github.com/amplience/dc-integrations-algolia/commit/ab9203a))
* **configuration validation:** Validating Algolia credentials on startup ([20d6d99](https://github.com/amplience/dc-integrations-algolia/commit/20d6d99))
* **configuration validation:** Validating DC credentials on app startup ([8b8c982](https://github.com/amplience/dc-integrations-algolia/commit/8b8c982))
* **content type property whitelist:** added a whitelist for content type properties ([5103f21](https://github.com/amplience/dc-integrations-algolia/commit/5103f21))
* **content type property whitelist:** Added a whitelist for content type properties ([f6ad53b](https://github.com/amplience/dc-integrations-algolia/commit/f6ad53b))
* **content type whitelist:** added support for missing or empty content type whitelist to match on ([3684b06](https://github.com/amplience/dc-integrations-algolia/commit/3684b06))
* **dc-snapshot-published-webhook:** Gets the content item from DC and stores it into an Algolia ind ([474a076](https://github.com/amplience/dc-integrations-algolia/commit/474a076))
* **default error handler:** Added a default http request error handler ([2bc7505](https://github.com/amplience/dc-integrations-algolia/commit/2bc7505))
* **http web server:** Created an intial application ([f49c68c](https://github.com/amplience/dc-integrations-algolia/commit/f49c68c))
* **middleware:** added extra validation and tests ([5d17f1a](https://github.com/amplience/dc-integrations-algolia/commit/5d17f1a))
* **snapshot published webhooks:** Changes to presenter pattern and tests ([78679d7](https://github.com/amplience/dc-integrations-algolia/commit/78679d7))
* **verifying webhook signature:** Validates the webhook signature on request ([eea1bd3](https://github.com/amplience/dc-integrations-algolia/commit/eea1bd3))
* **webhook handler:** initial webhook handler and test ([effcd91](https://github.com/amplience/dc-integrations-algolia/commit/effcd91))
* **webhook handler:** WIP: Creating webhook handler ([8451edd](https://github.com/amplience/dc-integrations-algolia/commit/8451edd))
* **webhook response:** successfully response includes the index and the added object ([9e94230](https://github.com/amplience/dc-integrations-algolia/commit/9e94230))
* **whitelist content types:** Checking of fetched content item schema and tests ([762e32e](https://github.com/amplience/dc-integrations-algolia/commit/762e32e))


### Tests

* **coverage:** correcting coverage directory ([8e925f2](https://github.com/amplience/dc-integrations-algolia/commit/8e925f2))
* **end-to-end:** added webhook end-to-end test ([e1e3054](https://github.com/amplience/dc-integrations-algolia/commit/e1e3054))
* **error handler:** added tests to cover error handler ([b7c12a0](https://github.com/amplience/dc-integrations-algolia/commit/b7c12a0))
* **Snapshot published route handler:** Added more tests for the different presenter methods ([1fc92f0](https://github.com/amplience/dc-integrations-algolia/commit/1fc92f0))
* **Snapshot Published Webhook Route Handler:** Added a presenter success test ([26ecb83](https://github.com/amplience/dc-integrations-algolia/commit/26ecb83))
* **validate webhook signature:** initial tests ([6440e87](https://github.com/amplience/dc-integrations-algolia/commit/6440e87))
* **whitelist content types:** renamed CONTENT_TYPE_WHITE_LIST -> CONTENT_TYPE_WHITELIST added test for noMatchingContentTypeSchemaError presenter method ([ec546f5](https://github.com/amplience/dc-integrations-algolia/commit/ec546f5))
