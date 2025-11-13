const { MongoClient, ServerApiVersion } = require("mongodb");

let db = null;
let client = null;

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error(
        "MONGODB_URI no está definida en las variables de entorno"
      );
    }

    console.log("🔄 Conectando a MongoDB Atlas...");

    client = new MongoClient(mongoURI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      serverSelectionTimeoutMS: 10000, // 10 segundos
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });

    await client.connect();

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });

    // Usar la base de datos especificada en las variables de entorno
    const dbName = process.env.MONGO_INITDB_DATABASE || "parkampus";
    db = client.db(dbName);

    console.log(
      `✅ Conectado exitosamente a MongoDB Atlas - Base de datos: ${dbName}`
    );

    return db;
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error.message);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error(
      "Base de datos no inicializada. Llama a connectDB() primero."
    );
  }
  return db;
};

const closeDB = async () => {
  if (client) {
    await client.close();
    console.log("🔐 Conexión a MongoDB cerrada");
  }
};

module.exports = {
  connectDB,
  getDB,
  closeDB,
};
