const express = require("express");
const cors = require("cors");
const os = require("os");
require("dotenv").config();

const { connectDB } = require("./config/database");
const usersRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

// Función para obtener la IP local
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Ignorar interfaces internas y no IPv4
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "🚀 Parkampus Backend está funcionando correctamente",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Rutas
app.use("/api/users", usersRoutes);
app.use("/api/login", authRoutes);

// Ruta principal
app.get("/", (req, res) => {
  res.json({
    message: "¡Bienvenido a Parkampus Backend API!",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      users: "/api/users",
      login: "/api/login",
    },
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    path: req.path,
  });
});

// Inicializar base de datos y servidor
const startServer = async () => {
  try {
    // Conectar a MongoDB
    await connectDB();

    const localIP = getLocalIP();

    // Iniciar servidor
    app.listen(PORT, HOST, () => {
      console.log("\n🚀 ==========================================");
      console.log("   Servidor Parkampus Backend INICIADO");
      console.log("============================================");
      console.log(`📍 Host: ${HOST}`);
      console.log(`🔌 Puerto: ${PORT}`);
      console.log(`\n🌐 Acceso Local:`);
      console.log(`   http://localhost:${PORT}`);
      console.log(`\n📱 Acceso desde Red (Dispositivos externos):`);
      console.log(`   http://${localIP}:${PORT}`);
      console.log(`\n� Endpoints disponibles:`);
      console.log(`   • Health Check: http://${localIP}:${PORT}/health`);
      console.log(`   • Usuarios:     http://${localIP}:${PORT}/api/users`);
      console.log(`   • Login:        http://${localIP}:${PORT}/api/login`);
      console.log("============================================\n");
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
