const { Expo } = require("expo-server-sdk");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Crear una nueva instancia de Expo
const expo = new Expo();

class NotificationService {
  /**
   * Enviar notificación push a tokens específicos
   * @param {Array} pushTokens - Array de tokens de Expo
   * @param {String} title - Título de la notificación
   * @param {String} message - Mensaje de la notificación
   * @param {Object} data - Datos adicionales opcionales
   * @returns {Object} Resultado del envío
   */
  static async sendPushNotification(pushTokens, title, message, data = {}) {
    // Filtrar tokens válidos
    const validTokens = pushTokens.filter((token) =>
      Expo.isExpoPushToken(token)
    );

    if (validTokens.length === 0) {
      throw new Error("No hay tokens válidos para enviar notificaciones");
    }

    // Crear mensajes para enviar
    const messages = validTokens.map((pushToken) => ({
      to: pushToken,
      sound: "default",
      title: title,
      body: message,
      data: data,
      priority: "high",
    }));

    // Dividir mensajes en chunks (Expo recomienda max 100 por request)
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    try {
      // Enviar cada chunk
      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error("❌ Error al enviar chunk de notificaciones:", error);
        }
      }

      // Analizar resultados
      const results = {
        total: validTokens.length,
        sent: 0,
        failed: 0,
        errors: [],
      };

      tickets.forEach((ticket, index) => {
        if (ticket.status === "ok") {
          results.sent++;
        } else if (ticket.status === "error") {
          results.failed++;
          results.errors.push({
            token: validTokens[index],
            message: ticket.message,
            details: ticket.details,
          });
          console.error(
            `❌ Error al enviar a ${validTokens[index]}:`,
            ticket.message
          );
        }
      });

      return results;
    } catch (error) {
      console.error("❌ Error general al enviar notificaciones:", error);
      throw new Error(`Error al enviar notificaciones push: ${error.message}`);
    }
  }

  /**
   * Enviar notificación a todos los usuarios
   * @param {String} title - Título de la notificación
   * @param {String} message - Mensaje de la notificación
   * @param {Object} data - Datos adicionales opcionales
   * @param {String} userType - Tipo de usuario (opcional: 'estudiante', 'celador', 'empleado')
   * @returns {Object} Notificación creada y resultado del envío
   */
  static async sendToAll(title, message, data = {}, userType = null) {
    try {
      console.log(`📢 Enviando notificación broadcast: ${title}`);

      // Obtener todos los tokens push activos
      const pushTokens = await User.getAllPushTokens(userType);

      if (pushTokens.length === 0) {
        throw new Error("No hay usuarios con tokens de notificación activos");
      }

      console.log(`📱 Tokens encontrados: ${pushTokens.length}`);

      // Crear registro de notificación en la BD
      const notificationData = {
        title,
        message,
        data,
        user_ids: [], // Array vacío indica broadcast a todos
        push_tokens: pushTokens,
        status: "sending",
      };

      const notification = await Notification.create(notificationData);

      // Enviar notificaciones push
      const result = await this.sendPushNotification(
        pushTokens,
        title,
        message,
        data
      );

      // Actualizar status de la notificación
      const finalStatus = result.failed === 0 ? "sent" : "partial";
      await Notification.updateStatus(
        notification._id.toString(),
        finalStatus,
        pushTokens
      );

      console.log(`✅ Notificación enviada: ${result.sent}/${result.total}`);

      return {
        notification,
        result,
      };
    } catch (error) {
      console.error("❌ Error en sendToAll:", error.message);
      throw error;
    }
  }

  /**
   * Enviar notificación a usuarios específicos
   * @param {Array} userIds - Array de IDs de usuarios
   * @param {String} title - Título de la notificación
   * @param {String} message - Mensaje de la notificación
   * @param {Object} data - Datos adicionales opcionales
   * @returns {Object} Notificación creada y resultado del envío
   */
  static async sendToUsers(userIds, title, message, data = {}) {
    try {
      console.log(`📤 Enviando notificación a ${userIds.length} usuario(s)`);

      // Obtener tokens de los usuarios específicos
      const pushTokens = [];
      for (const userId of userIds) {
        const user = await User.findById(userId);
        if (user && user.expo_push_token) {
          pushTokens.push(user.expo_push_token);
        }
      }

      if (pushTokens.length === 0) {
        throw new Error(
          "Ninguno de los usuarios tiene token de notificación activo"
        );
      }

      console.log(`📱 Tokens encontrados: ${pushTokens.length}`);

      // Crear registro de notificación en la BD
      const notificationData = {
        title,
        message,
        data,
        user_ids: userIds,
        push_tokens: pushTokens,
        status: "sending",
      };

      const notification = await Notification.create(notificationData);

      // Enviar notificaciones push
      const result = await this.sendPushNotification(
        pushTokens,
        title,
        message,
        data
      );

      // Actualizar status de la notificación
      const finalStatus = result.failed === 0 ? "sent" : "partial";
      await Notification.updateStatus(
        notification._id.toString(),
        finalStatus,
        pushTokens
      );

      console.log(`✅ Notificación enviada: ${result.sent}/${result.total}`);

      return {
        notification,
        result,
      };
    } catch (error) {
      console.error("❌ Error en sendToUsers:", error.message);
      throw error;
    }
  }

  /**
   * Validar si un token de Expo es válido
   * @param {String} token - Token de Expo Push
   * @returns {Boolean}
   */
  static isValidExpoPushToken(token) {
    return Expo.isExpoPushToken(token);
  }
}

module.exports = NotificationService;
