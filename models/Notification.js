const { getDB } = require("../config/database");
const { ObjectId } = require("mongodb");

class Notification {
  constructor(data) {
    this.sender_id = new ObjectId(data.sender_id);
    this.type = data.type; // e.g., "CIERRE_NOCTURNO", "SEGURIDAD"
    this.subject = data.subject;
    this.recipients_count = data.recipients_count || 0;
    this.created_at = new Date();
  }

  static async create(notificationData) {
    try {
      const db = getDB();
      const notification = new Notification(notificationData);
      const result = await db.collection("notifications").insertOne(notification);
      return { ...notification, _id: result.insertedId };
    } catch (error) {
      throw new Error(`Error al crear registro de notificación: ${error.message}`);
    }
  }

  static async findAll() {
    try {
      const db = getDB();
      return await db.collection("notifications").find().sort({ created_at: -1 }).toArray();
    } catch (error) {
      throw new Error(`Error al obtener notificaciones: ${error.message}`);
    }
  }
}

module.exports = Notification;
