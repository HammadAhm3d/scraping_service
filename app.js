const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const cron = require("node-cron");
const productRoutes = require("./routes/product");
const connectDB = require("./config/db");
const { Client } = require("@elastic/elasticsearch");
const { scrapingScript } = require("./controllers/scrapeController");

// Load config
dotenv.config({ path: "./.env" });

const PORT = process.env.PORT || 5001;

const app = express();

// Database connection
connectDB();

const client = new Client({
  node: process.env.ELASTIC_CLIENT,
  auth: {
    apiKey: process.env.ELASTIC_API_KEY,
  },
});
// Init Middleware
app.use(cors()); // add cors headers
app.use(morgan("tiny")); // log the request for debugging
app.use(express.json({ extended: false }));
app.locals.elasticClient = client; // Make the client accessible throughout the app

// scheduler to scrape products at 1 am every night
cron.schedule(
  "0 1 * * *",
  async () => {
    try {
      console.log(
        `starting the scheduled job at ${new Date().toLocaleTimeString()}`
      );
      const products = await scrapingScript();
      console.log(`${products?.length} products extracted.`);
      console.log(
        `ending the scheduled job at ${new Date().toLocaleTimeString()}`
      );
    } catch (error) {
      console.error("Error scraping data:", error);
    }
  },
  {
    timezone: "Europe/Helsinki",
  }
);

// Define Routes
app.get("/", function (req, res) {
  return res.send("Hello World");
});
app.use("/api/products", productRoutes);
app.listen(PORT, () => console.log(`Server Listening on port ${PORT}`));
