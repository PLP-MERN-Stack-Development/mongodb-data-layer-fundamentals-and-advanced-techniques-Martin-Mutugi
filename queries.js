// queries.js
// MongoDB CRUD, advanced queries, aggregation pipelines, and indexing for plp_bookstore

const { MongoClient } = require("mongodb");
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

const dbName = "plp_bookstore";
const collectionName = "books";

async function runQueries() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(dbName);
    const books = db.collection(collectionName);

    // --- Task 2: Basic CRUD Operations ---

    // 1. Find all books in a specific genre
    const thrillerBooks = await books.find({ genre: "Thriller" }).toArray();
    console.log("📚 Thriller Books:", thrillerBooks);

    // 2. Find books published after a certain year
    const recentBooks = await books.find({ published_year: { $gt: 2015 } }).toArray();
    console.log("📚 Books published after 2015:", recentBooks);

    // 3. Find books by a specific author
    const authorBooks = await books.find({ author: "James Clear" }).toArray();
    console.log("📚 Books by James Clear:", authorBooks);

    // 4. Update the price of a specific book
    const updateResult = await books.updateOne(
      { title: "Atomic Habits" },
      { $set: { price: 13.99 } }
    );
    console.log("💰 Price update result:", updateResult.modifiedCount);

    // 5. Delete a book by its title
    const deleteResult = await books.deleteOne({ title: "1984" });
    console.log("🗑️ Delete result:", deleteResult.deletedCount);

    // --- Task 3: Advanced Queries ---

    // 6. Find books that are in stock and published after 2010
    const inStockRecent = await books.find({
      in_stock: true,
      published_year: { $gt: 2010 }
    }).toArray();
    console.log("📚 In-stock books after 2010:", inStockRecent);

    // 7. Use projection to return only title, author, and price
    const projectedBooks = await books.find({}, {
      projection: { title: 1, author: 1, price: 1, _id: 0 }
    }).toArray();
    console.log("🔍 Projected fields:", projectedBooks);

    // 8. Sort books by price ascending
    const sortedAsc = await books.find().sort({ price: 1 }).toArray();
    console.log("📈 Books sorted by price (asc):", sortedAsc);

    // 9. Sort books by price descending
    const sortedDesc = await books.find().sort({ price: -1 }).toArray();
    console.log("📉 Books sorted by price (desc):", sortedDesc);

    // 10. Pagination: limit 5 books, skip first 5
    const page2 = await books.find().skip(5).limit(5).toArray();
    console.log("📄 Page 2 (books 6–10):", page2);

    // --- Task 4: Aggregation Pipelines ---

    // 11. Average price of books by genre
    const avgPriceByGenre = await books.aggregate([
      { $group: { _id: "$genre", averagePrice: { $avg: "$price" } } }
    ]).toArray();
    console.log("📊 Average price by genre:", avgPriceByGenre);

    // 12. Author with the most books
    const topAuthor = await books.aggregate([
      { $group: { _id: "$author", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]).toArray();
    console.log("🏆 Author with most books:", topAuthor);

    // 13. Group books by publication decade and count them
    const booksByDecade = await books.aggregate([
      {
        $group: {
          _id: {
            $concat: [
              { $toString: { $subtract: ["$published_year", { $mod: ["$published_year", 10] }] } },
              "s"
            ]
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();
    console.log("📚 Books grouped by decade:", booksByDecade);

    // --- Task 5: Indexing and explain() ---

    // 14. Create an index on the title field
    const titleIndex = await books.createIndex({ title: 1 });
    console.log("🔍 Index created on title:", titleIndex);

    // 15. Create a compound index on author and published_year
    const compoundIndex = await books.createIndex({ author: 1, published_year: -1 });
    console.log("🔍 Compound index on author and published_year:", compoundIndex);

    // 16. Use explain() to show performance improvement
    const explainedQuery = await books.find({ title: "Dune" }).explain("executionStats");
    console.log("📊 Explain output for title search:", explainedQuery.executionStats);

  } catch (err) {
    console.error(" Error running queries:", err);
  } finally {
    await client.close();
    console.log(" MongoDB connection closed");
  }
}

runQueries();
