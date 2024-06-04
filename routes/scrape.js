const express = require("express");
const { scrapeData } = require("../controllers/scrapeController");
const authMiddleware = require("../middlewares/auth");
const router = express.Router();

router.get("/scrape", scrapeData);

module.exports = router;
