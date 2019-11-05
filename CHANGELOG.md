# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.1.0](https://github.com/amplience/dc-integrations-algolia/compare/v1.0.0...v1.1.0) (2019-11-05)


### Bug Fixes

* **heroku button:** added the repo to the button link ([aa83731](https://github.com/amplience/dc-integrations-algolia/commit/aa83731))
* **pre-commit hooks:** fixing broken script command ([006e982](https://github.com/amplience/dc-integrations-algolia/commit/006e982))
* **pre-commit script:** changing method signature ([0dc73ef](https://github.com/amplience/dc-integrations-algolia/commit/0dc73ef))
* **webhook signature validation:** removed leak of sensitive data ([ab140a3](https://github.com/amplience/dc-integrations-algolia/commit/ab140a3))


### Build System

* **deps:** bump axios from 0.18.0 to 0.18.1 ([49d3809](https://github.com/amplience/dc-integrations-algolia/commit/49d3809))
* **deps:** bump eslint-utils from 1.3.1 to 1.4.2 ([8bfc654](https://github.com/amplience/dc-integrations-algolia/commit/8bfc654))
* **deps:** bump lodash.template from 4.4.0 to 4.5.0 ([c0e82b6](https://github.com/amplience/dc-integrations-algolia/commit/c0e82b6))
* **lodash:** resolved lodash security alert CVE-2019-10744 ([506e093](https://github.com/amplience/dc-integrations-algolia/commit/506e093))


### Features

* **content-items:** added a publishedDate to content items when indexed ([e452d92](https://github.com/amplience/dc-integrations-algolia/commit/e452d92))
* **date support:** the inserted algolia record now includes the various date fields ([01be7c0](https://github.com/amplience/dc-integrations-algolia/commit/01be7c0))
* **env vars improvements:** changed the readme and aligned the code ([a7d9a89](https://github.com/amplience/dc-integrations-algolia/commit/a7d9a89))
* **env vars improvements:** changed the readme and aligned the code ([a275c51](https://github.com/amplience/dc-integrations-algolia/commit/a275c51))
* **heroku button:** adding app.json ([7aebf07](https://github.com/amplience/dc-integrations-algolia/commit/7aebf07))
* **heroku deploy button:** added the deployment button to the readme ([546e77f](https://github.com/amplience/dc-integrations-algolia/commit/546e77f))
* **readme:** added a running on heroku section ([7963f7b](https://github.com/amplience/dc-integrations-algolia/commit/7963f7b))
* **readme:** added heroku and local webhook URL descriptions ([01ef5fe](https://github.com/amplience/dc-integrations-algolia/commit/01ef5fe))
* **readme:** added heroku and local webhook URL descriptions ([d6a6171](https://github.com/amplience/dc-integrations-algolia/commit/d6a6171))
* **readme:** alphebetising the env vars ([57d3171](https://github.com/amplience/dc-integrations-algolia/commit/57d3171))
* **readme:** updated example values ([5533c18](https://github.com/amplience/dc-integrations-algolia/commit/5533c18))
* **readme:** updated link to support ([4018236](https://github.com/amplience/dc-integrations-algolia/commit/4018236))
* **successful webhook status code:** updated the successful status code to 200 instead of 202 ([2133148](https://github.com/amplience/dc-integrations-algolia/commit/2133148))


### Tests

* **content-items:** adding publishedDate and breaking existing tests ([66a5a60](https://github.com/amplience/dc-integrations-algolia/commit/66a5a60))



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
