const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const router = express.Router();

// POST /api/login - Iniciar sesión
router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔐 Intento de login:", email);

    // Intentar autenticar usuario
    const user = await User.login(email, password);

    // Generar JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        user_type: user.user_type,
      },
      process.env.JWT_SECRET || "secreto_super_seguro_por_defecto", // Fallback solo para dev
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      message: "Login exitoso",
      data: {
        token,
        user: {
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          user_type: user.user_type,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error en login:", error.message);

    // Si el error es de credenciales inválidas, retornar 401 Unauthorized
    if (
      error.message === "Credenciales inválidas" ||
      error.message === "Email y contraseña son requeridos" ||
      error.message === "Formato de email inválido"
    ) {
      return res.status(401).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    // Otros errores retornar 500
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      data: null,
    });
  }
});

module.exports = router;
