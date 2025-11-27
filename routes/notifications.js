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
// Ver historial de notificaciones filtradas por horario del usuario
// Solo muestra notificaciones enviadas en días/horas relevantes para el usuario
// EXCEPCIÓN: Los celadores ven TODAS las notificaciones sin filtrado
router.get("/history", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Obtener el usuario completo con su schedule
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Obtener todas las notificaciones
    const allNotifications = await Notification.findAll();

    // Si es celador, devolver TODAS las notificaciones sin filtrar
    if (user.user_type === "celador") {
      console.log(`📋 Celador ${user.first_name}: Mostrando todas las ${allNotifications.length} notificaciones (sin filtrado)`);
      return res.status(200).json({
        success: true,
        data: allNotifications,
        total: allNotifications.length,
        filtered: false, // Indicar que no se aplicó filtrado
      });
    }

    // Para estudiantes y empleados: aplicar filtrado por horario
    // Si el usuario no tiene schedule, devolver array vacío
    if (!user.schedule || user.schedule.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No tienes horario configurado",
        filtered: true,
      });
    }

    // Filtrar notificaciones según el horario del usuario
    const filteredNotifications = allNotifications.filter(notification => {
      const notificationDate = new Date(notification.created_at);
      const dayOfWeek = DAYS_MAP[notificationDate.getDay()];
      const notificationHour = notificationDate.getHours();
      const notificationMinute = notificationDate.getMinutes();
      const notificationTotalMinutes = notificationHour * 60 + notificationMinute;

      // Verificar si el usuario tiene clase ese día
      const daySchedule = user.schedule.filter(entry => entry.day === dayOfWeek);
      
      if (daySchedule.length === 0) {
        return false; // No tiene clase ese día
      }

      // Encontrar la última clase del día
      let lastClass = daySchedule[0];
      let lastEndMinutes = 0;

      daySchedule.forEach(entry => {
        const [endHour, endMin] = entry.end_time.split(':').map(Number);
        const endTotalMinutes = endHour * 60 + endMin;
        
        if (endTotalMinutes > lastEndMinutes) {
          lastEndMinutes = endTotalMinutes;
          lastClass = entry;
        }
      });

      // Calcular ventana de tiempo (última hora de clase + 1 hora después)
      const [endHour, endMin] = lastClass.end_time.split(':').map(Number);
      const classEndMinutes = endHour * 60 + endMin;
      const lastHourStart = classEndMinutes - 60; // 1 hora antes del fin
      const oneHourAfterEnd = classEndMinutes + 60; // 1 hora después del fin

      // Verificar si la notificación fue enviada en la ventana de tiempo relevante
      return notificationTotalMinutes >= lastHourStart && notificationTotalMinutes <= oneHourAfterEnd;
    });

    console.log(`📋 ${user.user_type} ${user.first_name}: ${allNotifications.length} notificaciones totales, ${filteredNotifications.length} relevantes`);

    res.status(200).json({
      success: true,
      data: filteredNotifications,
      total: filteredNotifications.length,
      filtered: true, // Indicar que se aplicó filtrado
    });
  } catch (error) {
    console.error("❌ Error al obtener historial:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al obtener historial",
      error: error.message,
    });
  }
});

module.exports = router;
