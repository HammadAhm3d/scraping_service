const express = require("express");
const searchProducts = require("../controllers/productController");
const { scrapeData } = require("../controllers/scrapeController");
const router = express.Router();

router.get("/search", searchProducts);
router.get("/scrape", scrapeData);

module.exports = router;
