const express = require("express");
const cors = require("cors");
require("dotenv").config();

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

// Ruta principal
app.get("/", (req, res) => {
  res.json({
    message: "¡Bienvenido a Parkampus Backend API!",
    version: "1.0.0",
    endpoints: {
      health: "/health",
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(
    `🚀 Servidor Parkampus Backend corriendo en http://localhost:${PORT}`
  );
  console.log(`📊 Health check disponible en http://localhost:${PORT}/health`);
});

module.exports = app;
