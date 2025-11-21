const express = require("express");
const User = require("../models/User");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// GET /users/profile - Obtener perfil del usuario autenticado (Ruta protegida)
router.get("/profile", verifyToken, async (req, res) => {
  try {
    // req.user viene del middleware verifyToken
    const userId = req.user.id;
    console.log(`👤 Obteniendo perfil para usuario ID: ${userId}`);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Perfil obtenido exitosamente",
      data: user,
    });
  } catch (error) {
    console.error("❌ Error al obtener perfil:", error.message);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      data: null,
    });
  }
});

// POST /users - Crear nuevo usuario
router.post("/", async (req, res) => {
  try {
    console.log("📝 Creando nuevo usuario:", req.body);

    const newUser = await User.create(req.body);

    res.status(201).json({
      success: true,
      message: "Usuario creado exitosamente",
      data: newUser,
    });
  } catch (error) {
    console.error("❌ Error al crear usuario:", error.message);

    res.status(400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
});

// GET /users - Obtener todos los usuarios
router.get("/", async (req, res) => {
  try {
    console.log("📋 Obteniendo todos los usuarios");

    const users = await User.findAll();

    res.status(200).json({
      success: true,
      message: "Usuarios obtenidos exitosamente",
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("❌ Error al obtener usuarios:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
});

// GET /users/:id - Obtener usuario por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Obteniendo usuario con ID: ${id}`);

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Usuario obtenido exitosamente",
      data: user,
    });
  } catch (error) {
    console.error("❌ Error al obtener usuario:", error.message);

    res.status(400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
});

module.exports = router;
