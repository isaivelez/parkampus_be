const { MongoClient, ServerApiVersion } = require("mongodb");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const migratePasswords = async () => {
  let client;

  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error("MONGODB_URI no está definida");
    }

    console.log("🔄 Conectando a MongoDB...");
    client = new MongoClient(mongoURI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    await client.connect();
    const dbName = process.env.MONGO_INITDB_DATABASE || "parkampus";
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    console.log(`✅ Conectado a la base de datos: ${dbName}`);

    // 1. Hashear la nueva contraseña por defecto
    const defaultPassword = "1Password.";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    console.log(`🔐 Contraseña hasheada generada para: '${defaultPassword}'`);

    // 2. Actualizar todos los usuarios
    const result = await usersCollection.updateMany(
      {}, // Filtro vacío para seleccionar todos los documentos
      {
        $set: {
          password: hashedPassword,
          updated_at: new Date(),
        },
      }
    );

    console.log(`\n✨ Migración completada:`);
    console.log(`   - Usuarios encontrados: ${result.matchedCount}`);
    console.log(`   - Usuarios actualizados: ${result.modifiedCount}`);

  } catch (error) {
    console.error("❌ Error en la migración:", error);
  } finally {
    if (client) {
      await client.close();
      console.log("🔐 Conexión cerrada");
    }
  }
};

migratePasswords();
