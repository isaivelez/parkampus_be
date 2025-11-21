require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const testConnection = async () => {
  const uri = process.env.MONGODB_URI;

  console.log("🔍 Testing MongoDB connection...");
  console.log("URI (hidden password):", uri.replace(/:[^:@]+@/, ":****@"));

  // Create a MongoClient with a MongoClientOptions object to set the Stable API version
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  try {
    console.log("⏳ Attempting connection...");
    // Connect the client to the server
    await client.connect();
    console.log("✅ Connected successfully!");

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Pinged deployment. Successfully connected to MongoDB!");

    const db = client.db(process.env.MONGO_INITDB_DATABASE || "parkampus");
    console.log(`✅ Database: ${db.databaseName}`);

    // Test a simple operation
    const collections = await db.listCollections().toArray();
    console.log(`✅ Collections found: ${collections.length}`);

    console.log("✅ Connection test passed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Connection failed!");
    console.error("Error:", error.message);
    console.error("Code:", error.code);
    console.error("Full error:", error);
    process.exit(1);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
};

testConnection();
