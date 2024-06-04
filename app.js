const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const scrapeRoutes = require("./routes/scrape");
const productRoutes = require("./routes/product");
const connectDB = require("./config/db");
const { Client } = require("@elastic/elasticsearch");

// Load config
dotenv.config({ path: "./.env" });

const PORT = process.env.PORT || 5001;

const app = express();

// Database connection
connectDB();

const client = new Client({
  node: process.env.ELASTIC_CLIENT || "http://localhost:9200",
  auth: {
    apiKey: "aHFVQnZZOEJsZ09ydzlNc25xaU06YlhIZmh5SERSWFd0WnczTkZ6NWM0QQ==",
  },
}); // Replace with your Elasticsearch instance URL
// Init Middleware
app.use(cors()); // add cors headers
app.use(morgan("tiny")); // log the request for debugging
app.use(express.json({ extended: false }));
app.locals.elasticClient = client; // Make the client accessible throughout the app

// Define Routes
app.get("/", function (req, res) {
  return res.send("Hello World");
});
app.use("/api/scrape", scrapeRoutes);
app.use("/api/products", productRoutes);
app.listen(PORT, () => console.log(`Server Listening on port ${PORT}`));
