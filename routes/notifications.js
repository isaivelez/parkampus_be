const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Notification = require("../models/Notification");
const { verifyToken, verifyRole } = require("../middleware/auth");
const { sendMassEmail, getSubject } = require("../services/emailService");

// Mapeo de días de JS (0-6) a nombres en BD
const DAYS_MAP = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

// POST /api/notifications/mass-email
// Enviar notificación masiva por correo a usuarios en campus
// Solo accesible por celadores
router.post(
  "/mass-email",
  verifyToken,
  verifyRole(["celador"]),
  async (req, res) => {
    try {
      const { type } = req.body;
      const senderId = req.user._id;

      if (!type) {
        return res.status(400).json({
          success: false,
          message: "El tipo de notificación es requerido",
        });
      }

      // 1. Determinar el día actual
      const now = new Date();
      const currentDay = DAYS_MAP[now.getDay()];

      console.log(`📢 Iniciando notificación masiva. Tipo: ${type}, Día: ${currentDay}`);

      // 2. Buscar usuarios destinatarios (Estudiantes y Empleados con horario hoy)
      const recipients = await User.findUsersByDayAndType(currentDay, [
        "estudiante",
        "empleado",
      ]);

      if (recipients.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No se encontraron usuarios con horario para el día de hoy",
          sent_count: 0,
        });
      }

      // 3. Enviar correos
      const emailResult = await sendMassEmail(recipients, type);

      // 4. Registrar en historial
      const subject = getSubject(type); // Usar el asunto real
      
      const notificationRecord = await Notification.create({
        sender_id: senderId,
        type: type,
        subject: subject,
        recipients_count: emailResult.sent,
      });

      res.status(200).json({
        success: true,
        message: "Notificación masiva procesada",
        details: {
          total_targets: recipients.length,
          sent: emailResult.sent,
          failed: emailResult.failed,
          notification_id: notificationRecord._id,
          errors: emailResult.errors // Incluir errores para depuración
        },
      });
    } catch (error) {
      console.error("❌ Error en notificación masiva:", error.message);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }
);

// GET /api/notifications/history
// Ver historial de notificaciones (opcional, para el celador)
router.get("/history", verifyToken, verifyRole(["celador", "admin"]), async (req, res) => {
  try {
    const history = await Notification.findAll();
    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener historial",
      error: error.message,
    });
  }
});

module.exports = router;
