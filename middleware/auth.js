const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(403).json({
      success: false,
      message: "Acceso denegado. No se proporcionó token.",
    });
  }

  // El formato debe ser "Bearer [token]"
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({
      success: false,
      message: "Acceso denegado. Formato de token inválido.",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secreto_super_seguro_por_defecto"
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado.",
    });
  }
};

module.exports = verifyToken;
