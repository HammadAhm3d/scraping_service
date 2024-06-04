const cheerio = require("cheerio");
const Product = require("../models/product");
const puppeteer = require("puppeteer");

async function scrapeData(req, res) {
  const url = "https://www.k-ruoka.fi/kauppa/tuotehaku/hedelmat-ja-vihannekset";

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );
    await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

    // Scroll to the bottom of the page to load all products
    await autoScroll(page);

    const content = await page.content();
    const $ = cheerio.load(content);

    // Extract category from the specified element
    const category = $(
      ".SearchResultsHeader__SearchTitleContainer-sc-1xli5ex-4 h1"
    )
      .text()
      .trim();

    const products = [];

    $(
      'ul[data-testid="product-search-results"] > li[data-testid="product-card"]'
    ).each((index, element) => {
      const name = $(element)
        .find('div[data-testid="product-name"]')
        .text()
        .trim();
      const priceString = $(element)
        .find('span[data-testid="product-price"]')
        .text()
        .trim();
      const cleanedPriceString = priceString.match(/\d+(,\d+)?/g); // Remove non-numeric characters except decimal points and commas
      const price = parseFloat(cleanedPriceString[0].replace(",", ".")); // Convert price to number

      let pricePerUnit = price; // Default to price when unit price is not present
      let unitType = "kpl"; // Default unit type to 'piece'

      const unitPriceString = $(element)
        .find('div[data-testid="product-unit-price"]')
        .text()
        .trim();
      if (unitPriceString) {
        const unitPriceParts = unitPriceString.match(/\d+(,\d+)?/g); // Extract numeric parts
        pricePerUnit = parseFloat(unitPriceParts[0].replace(",", "."));
        unitType = unitPriceString.includes("kg")
          ? "kg"
          : unitPriceString.includes("l")
          ? "l"
          : "kpl";
      }
      const image = $(element)
        .find('img[data-testid="product-image"]')
        .attr("src");

      const product = new Product({
        name,
        price,
        pricePerUnit,
        unitType,
        category,
        subCategory: category, // Assigning category to subCategory as per your earlier requirement
        image,
      });
      products.push(product);
    });

    // Save products to MongoDB
    await Product.insertMany(products);
    await browser.close();

    if (products.length === 0) {
      console.log("No products found");
    }

    res.json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to scrape the page" });
  }
}

// Function to scroll the page to the bottom
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
module.exports = {
  scrapeData,
};
