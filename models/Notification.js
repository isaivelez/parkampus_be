const { getDB } = require("../config/database");
const { ObjectId } = require("mongodb");

class Notification {
  constructor(notificationData) {
    this.title = notificationData.title;
    this.message = notificationData.message;
    this.data = notificationData.data || {}; // Datos adicionales opcionales
    this.user_ids = notificationData.user_ids || []; // Array de user IDs o vacío para broadcast
    this.push_tokens = notificationData.push_tokens || []; // Tokens que recibieron la notificación
    this.status = notificationData.status || "pending"; // pending, sent, failed
    this.sent_at = null;
    this.created_at = new Date();
  }

  // Validaciones
  static validateRequiredFields(notificationData) {
    const requiredFields = ["title", "message"];
    const missingFields = [];

    requiredFields.forEach((field) => {
      if (
        !notificationData[field] ||
        notificationData[field].toString().trim() === ""
      ) {
        missingFields.push(field);
      }
    });

    return missingFields;
  }

  // Crear notificación
  static async create(notificationData) {
    const db = getDB();
    const notificationsCollection = db.collection("notifications");

    // Validar campos requeridos
    const missingFields = this.validateRequiredFields(notificationData);
    if (missingFields.length > 0) {
      throw new Error(
        `Campos requeridos faltantes: ${missingFields.join(", ")}`
      );
    }

    // Crear nueva instancia de notificación
    const newNotification = new Notification(notificationData);

    try {
      const result = await notificationsCollection.insertOne(newNotification);

      const createdNotification = await notificationsCollection.findOne({
        _id: result.insertedId,
      });

      return createdNotification;
    } catch (error) {
      throw new Error(`Error al crear notificación: ${error.message}`);
    }
  }

  // Obtener todas las notificaciones
  static async findAll(filters = {}) {
    const db = getDB();
    const notificationsCollection = db.collection("notifications");

    try {
      const query = {};

      // Filtrar por user_id si se proporciona
      if (filters.user_id) {
        query.$or = [
          { user_ids: { $in: [filters.user_id] } },
          { user_ids: { $size: 0 } }, // Notificaciones broadcast
        ];
      }

      // Filtrar por status si se proporciona
      if (filters.status) {
        query.status = filters.status;
      }

      const notifications = await notificationsCollection
        .find(query)
        .sort({ created_at: -1 })
        .toArray();

      return notifications;
    } catch (error) {
      throw new Error(`Error al obtener notificaciones: ${error.message}`);
    }
  }

  // Obtener notificación por ID
  static async findById(id) {
    const db = getDB();
    const notificationsCollection = db.collection("notifications");

    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("ID de notificación inválido");
      }

      const notification = await notificationsCollection.findOne({
        _id: new ObjectId(id),
      });

      return notification;
    } catch (error) {
      throw new Error(`Error al obtener notificación: ${error.message}`);
    }
  }

  // Actualizar notificación
  static async update(id, notificationData) {
    const db = getDB();
    const notificationsCollection = db.collection("notifications");

    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("ID de notificación inválido");
      }

      // Preparar datos de actualización
      const updateData = {
        ...notificationData,
      };

      // Eliminar campos que no deben actualizarse
      delete updateData._id;
      delete updateData.created_at;

      const result = await notificationsCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after" }
      );

      if (!result) {
        throw new Error("Notificación no encontrada");
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar status de notificación
  static async updateStatus(id, status, pushTokens = []) {
    const db = getDB();
    const notificationsCollection = db.collection("notifications");

    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("ID de notificación inválido");
      }

      const updateData = {
        status,
        sent_at: new Date(),
      };

      if (pushTokens.length > 0) {
        updateData.push_tokens = pushTokens;
      }

      const result = await notificationsCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after" }
      );

      if (!result) {
        throw new Error("Notificación no encontrada");
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar notificación
  static async delete(id) {
    const db = getDB();
    const notificationsCollection = db.collection("notifications");

    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("ID de notificación inválido");
      }

      const result = await notificationsCollection.findOneAndDelete({
        _id: new ObjectId(id),
      });

      if (!result) {
        throw new Error("Notificación no encontrada");
      }

      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Notification;
