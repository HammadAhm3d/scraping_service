async function searchProducts(req, res) {
  const elasticsearchClient = req.app.locals.elasticClient;
  const { query, category, subCategory, page = 1, size = 12, sort } = req.query; // Extract query parameters

  try {
    const searchBody = {
      query: {
        bool: {
          must: [], // Build the query based on provided parameters
        },
      },
      from: (page - 1) * size, // Calculate starting document for pagination
      size, // Define the number of results per page
    };

    // if (query) {
    //   searchBody.query.bool.must.push({
    //     multi_match: {
    //       query,
    //       fields: ["name", "category", "subCategory"], // Search in these fields
    //       fuzziness: "auto", // Allow for some typos
    //     },
    //   });
    // }

    if (query) {
      searchBody.query.bool.must.push({
        match_bool_prefix: { name: { query, fuzziness: "AUTO" } },
      });
    }

    if (category) {
      searchBody.query.bool.must.push({ match: { category } });
    }

    if (subCategory) {
      searchBody.query.bool.must.push({ match: { subCategory } });
    }
    // Handle sorting based on sort parameter
    if (sort && sort !== "default") {
      const [sortField, sortOrder] = sort.split(":"); // Split sort parameter (e.g., name:asc)
      searchBody.sort = [{ [sortField]: { order: sortOrder || "asc" } }]; // Default to ascending order
    }
    const response = await elasticsearchClient.search({
      index: "mongo-products",
      body: searchBody,
    });

    const products = response.hits.hits.map((hit) => hit._source); // Extract product data from response
    const total = response.hits.total.value; // Get the total number of matching products
    // Calculate total pages based on total and size
    const totalPages = Math.ceil(total / size);
    res.json({ products, pagination: { total, page, totalPages } });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ message: "Error searching products" });
  }
}

module.exports = searchProducts;
