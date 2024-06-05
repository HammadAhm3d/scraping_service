const express = require("express");
const { scrapeData } = require("../controllers/scrapeController");
const router = express.Router();

router.get("/scrape", scrapeData);

module.exports = router;
