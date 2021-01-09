const router = require("express").Router();
const investmentTrackerController = require("../../controllers/investmentTrackerController");

router
  .route("/send-email")
  .post(investmentTrackerController.sendEmail);

router
  .route("/fetch-all-iex-cloud-symbols")
  .post(investmentTrackerController.fetchAllIexCloudSymbols);

router
  .route("/fetch-all-quotes")
  .post(investmentTrackerController.fetchAllQuotes);

router
  .route("/fetch-all-price-targets")
  .post(investmentTrackerController.fetchAllPriceTargets);

router
  .route("/compile-value-search-data")
  .post(investmentTrackerController.compileValueSearchData);

router
  .route("/scrape-advanced-stats")
  .post(investmentTrackerController.scrapeAdvancedStats);

module.exports = router;
