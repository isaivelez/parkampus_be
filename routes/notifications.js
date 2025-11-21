const express = require("express");
const User = require("../models/User");
const Notification = require("../models/Notification");
const NotificationService = require("../services/notificationService");
const { verifyToken, verifyRole } = require("../middleware/auth");

const router = express.Router();

// Aplicar verificación de token a todas las rutas
router.use(verifyToken);

// POST /api/notifications/register-token - Registrar token de notificaciones push (Cualquier usuario autenticado)
router.post("/register-token", async (req, res) => {
  try {
    const { user_id, expo_push_token } = req.body;

    console.log(
      `📱 Registrando token push para usuario: ${user_id}`,
      expo_push_token
    );

    // Validar que el usuario que hace la petición sea el mismo que el user_id (o sea admin/celador)
    // Por ahora permitimos que cualquiera registre su propio token
    if (req.user.id !== user_id && req.user.user_type !== "celador") {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para registrar el token de otro usuario",
        data: null,
      });
    }

    if (!user_id || !expo_push_token) {
      return res.status(400).json({
        success: false,
        message: "user_id y expo_push_token son requeridos",
        data: null,
      });
    }

    // Validar que el token sea válido
    if (!NotificationService.isValidExpoPushToken(expo_push_token)) {
      return res.status(400).json({
        success: false,
        message: "Token de Expo Push inválido",
        data: null,
      });
    }

    // Actualizar token del usuario
    const updatedUser = await User.updatePushToken(user_id, expo_push_token);

    res.status(200).json({
      success: true,
      message: "Token de notificaciones registrado exitosamente",
      data: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error al registrar token:", error.message);

    res.status(400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
});

// POST /api/notifications/send-to-all - Enviar notificación a todos (Solo Celador)
router.post("/send-to-all", verifyRole(["celador"]), async (req, res) => {
  try {
    const { title, message, data, user_type } = req.body;

    console.log(`📢 Enviando notificación broadcast: "${title}"`);

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "title y message son requeridos",
        data: null,
      });
    }

    // Enviar notificación a todos
    const result = await NotificationService.sendToAll(
      title,
      message,
      data || {},
      user_type || null
    );

    res.status(200).json({
      success: true,
      message: "Notificación enviada exitosamente",
      data: {
        notification: result.notification,
        sent_count: result.result.sent,
        failed_count: result.result.failed,
        total_count: result.result.total,
      },
    });
  } catch (error) {
    console.error("❌ Error al enviar notificación:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
});

// POST /api/notifications/send-to-users - Enviar notificación a usuarios específicos (Solo Celador)
router.post("/send-to-users", verifyRole(["celador"]), async (req, res) => {
  try {
    const { user_ids, title, message, data } = req.body;

    console.log(`📤 Enviando notificación a usuarios específicos`);

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "user_ids debe ser un array con al menos un ID",
        data: null,
      });
    }

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "title y message son requeridos",
        data: null,
      });
    }

    // Enviar notificación a usuarios específicos
    const result = await NotificationService.sendToUsers(
      user_ids,
      title,
      message,
      data || {}
    );

    res.status(200).json({
      success: true,
      message: "Notificación enviada exitosamente",
      data: {
        notification: result.notification,
        sent_count: result.result.sent,
        failed_count: result.result.failed,
        total_count: result.result.total,
      },
    });
  } catch (error) {
    console.error("❌ Error al enviar notificación:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
});

// GET /api/notifications - Obtener historial de notificaciones (Todos los usuarios autenticados)
router.get("/", async (req, res) => {
  try {
    const { user_id, status } = req.query;

    console.log("📋 Obteniendo historial de notificaciones");

    const filters = {};
    if (user_id) filters.user_id = user_id;
    if (status) filters.status = status;

    const notifications = await Notification.findAll(filters);

    res.status(200).json({
      success: true,
      message: "Notificaciones obtenidas exitosamente",
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error("❌ Error al obtener notificaciones:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
});

// GET /api/notifications/:id - Obtener notificación por ID (Todos los usuarios autenticados)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Obteniendo notificación con ID: ${id}`);

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notificación no encontrada",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Notificación obtenida exitosamente",
      data: notification,
    });
  } catch (error) {
    console.error("❌ Error al obtener notificación:", error.message);

    res.status(400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
});

// DELETE /api/notifications/:id - Eliminar notificación (Solo Celador)
router.delete("/:id", verifyRole(["celador"]), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️  Eliminando notificación con ID: ${id}`);

    const deletedNotification = await Notification.delete(id);

    res.status(200).json({
      success: true,
      message: "Notificación eliminada exitosamente",
      data: deletedNotification,
    });
  } catch (error) {
    console.error("❌ Error al eliminar notificación:", error.message);

    const statusCode =
      error.message === "Notificación no encontrada" ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
});

module.exports = router;
