const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB } = require("./config/database");
const usersRoutes = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 3000;

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

// Ruta principal
app.get("/", (req, res) => {
  res.json({
    message: "¡Bienvenido a Parkampus Backend API!",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      users: "/api/users",
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

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(
        `🚀 Servidor Parkampus Backend corriendo en http://localhost:${PORT}`
      );
      console.log(
        `📊 Health check disponible en http://localhost:${PORT}/health`
      );
      console.log(
        `👥 Endpoints de usuarios disponibles en http://localhost:${PORT}/api/users`
      );
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
