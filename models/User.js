const { getDB } = require("../config/database");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");

class User {
  constructor(userData) {
    this.first_name = userData.first_name;
    this.last_name = userData.last_name;
    this.email = userData.email;
    this.password = userData.password;
    this.user_type = userData.user_type;
    this.expo_push_token = userData.expo_push_token || null; // Token para notificaciones push
    this.schedule = userData.schedule || []; // Horario de clases
    this.created_at = new Date();
    this.updated_at = new Date();
  }

  // Validaciones
  static validateUserType(userType) {
    const validTypes = ["estudiante", "celador", "empleado"];
    return validTypes.includes(userType);
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateSchedule(schedule) {
    if (!Array.isArray(schedule)) {
      throw new Error("El schedule debe ser un arreglo");
    }

    const validDays = [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
      "Domingo",
    ];
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:MM formato 24 horas

    for (let i = 0; i < schedule.length; i++) {
      const entry = schedule[i];

      // Validar que tenga las propiedades requeridas
      if (!entry.day || !entry.start_time || !entry.end_time) {
        throw new Error(
          `Entrada de horario en posición ${i} debe tener day, start_time y end_time`
        );
      }

      // Validar día
      if (!validDays.includes(entry.day)) {
        throw new Error(
          `Día inválido "${entry.day}" en posición ${i}. Debe ser uno de: ${validDays.join(", ")}`
        );
      }

      // Validar formato de tiempo
      if (!timeRegex.test(entry.start_time)) {
        throw new Error(
          `start_time "${entry.start_time}" en posición ${i} debe estar en formato HH:MM (24 horas)`
        );
      }

      if (!timeRegex.test(entry.end_time)) {
        throw new Error(
          `end_time "${entry.end_time}" en posición ${i} debe estar en formato HH:MM (24 horas)`
        );
      }

      // Validar que start_time < end_time
      const [startHour, startMin] = entry.start_time.split(":").map(Number);
      const [endHour, endMin] = entry.end_time.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (startMinutes >= endMinutes) {
        throw new Error(
          `La hora de inicio (${entry.start_time}) debe ser anterior a la hora de salida (${entry.end_time}) para el día ${entry.day}`
        );
      }
    }

    return true;
  }

  static validateRequiredFields(userData) {
    const requiredFields = [
      "first_name",
      "last_name",
      "email",
      "password",
      "user_type",
    ];
    const missingFields = [];

    requiredFields.forEach((field) => {
      if (!userData[field] || userData[field].toString().trim() === "") {
        missingFields.push(field);
      }
    });

    return missingFields;
  }

  // Crear usuario
  static async create(userData) {
    const db = getDB();
    const usersCollection = db.collection("users");

    // Validar campos requeridos
    const missingFields = this.validateRequiredFields(userData);
    if (missingFields.length > 0) {
      throw new Error(
        `Campos requeridos faltantes: ${missingFields.join(", ")}`
      );
    }

    // Validar tipo de usuario
    if (!this.validateUserType(userData.user_type)) {
      throw new Error(
        "Tipo de usuario inválido. Debe ser: estudiante, celador o empleado"
      );
    }

    // Validar email
    if (!this.validateEmail(userData.email)) {
      throw new Error("Formato de email inválido");
    }

    // Verificar si el email ya existe
    const existingUser = await usersCollection.findOne({
      email: userData.email,
    });
    if (existingUser) {
      throw new Error("Ya existe un usuario con este email");
    }

    // Validar schedule si se proporciona
    if (userData.schedule && userData.schedule.length > 0) {
      this.validateSchedule(userData.schedule);
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);

    // Crear nueva instancia de usuario
    const newUser = new User(userData);

    try {
      const result = await usersCollection.insertOne(newUser);

      // Retornar el usuario creado sin la contraseña
      const createdUser = await usersCollection.findOne(
        { _id: result.insertedId },
        { projection: { password: 0 } }
      );

      return createdUser;
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  // Obtener todos los usuarios
  static async findAll() {
    const db = getDB();
    const usersCollection = db.collection("users");

    try {
      const users = await usersCollection
        .find(
          {},
          { projection: { password: 0 } } // Excluir contraseñas
        )
        .toArray();

      return users;
    } catch (error) {
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }
  }

  // Obtener usuario por ID
  static async findById(id) {
    const db = getDB();
    const usersCollection = db.collection("users");

    try {
      // Validar que el ID sea un ObjectId válido
      if (!ObjectId.isValid(id)) {
        throw new Error("ID de usuario inválido");
      }

      const user = await usersCollection.findOne(
        { _id: new ObjectId(id) },
        { projection: { password: 0 } } // Excluir solo la contraseña
      );

      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      throw new Error(`Error al obtener usuario: ${error.message}`);
    }
  }

  // Obtener usuario por email (útil para login)
  static async findByEmail(email) {
    const db = getDB();
    const usersCollection = db.collection("users");

    try {
      const user = await usersCollection.findOne({ email });
      return user;
    } catch (error) {
      throw new Error(`Error al obtener usuario por email: ${error.message}`);
    }
  }

  // Login - Autenticar usuario
  static async login(email, password) {
    const db = getDB();
    const usersCollection = db.collection("users");

    try {
      // Validar que se proporcionen email y password
      if (!email || !password) {
        throw new Error("Email y contraseña son requeridos");
      }

      // Validar formato de email
      if (!this.validateEmail(email)) {
        throw new Error("Formato de email inválido");
      }

      // Buscar usuario por email
      const user = await usersCollection.findOne({ email });

      if (!user) {
        throw new Error("Credenciales inválidas");
      }

      // Verificar contraseña con bcrypt
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("Credenciales inválidas");
      }

      // Retornar usuario sin la contraseña
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar usuario
  static async update(id, userData) {
    const db = getDB();
    const usersCollection = db.collection("users");

    try {
      // Validar ObjectId
      if (!ObjectId.isValid(id)) {
        throw new Error("ID de usuario inválido");
      }

      // Verificar si el usuario existe
      const existingUser = await usersCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!existingUser) {
        throw new Error("Usuario no encontrado");
      }

      // Preparar datos de actualización
      const updateData = { ...userData };
      updateData.updated_at = new Date();

      // Si se está actualizando el email, validar formato y duplicados
      if (updateData.email) {
        if (!this.validateEmail(updateData.email)) {
          throw new Error("Formato de email inválido");
        }

        // Verificar que el email no esté en uso por otro usuario
        const emailExists = await usersCollection.findOne({
          email: updateData.email,
          _id: { $ne: new ObjectId(id) },
        });

        if (emailExists) {
          throw new Error("Ya existe un usuario con este email");
        }
      }

      // Si se está actualizando el tipo de usuario, validar
      if (updateData.user_type && !this.validateUserType(updateData.user_type)) {
        throw new Error(
          "Tipo de usuario inválido. Debe ser: estudiante, celador o empleado"
        );
      }

      // Si se está actualizando la contraseña, hashearla
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.password, salt);
      }

      // Validar schedule si se proporciona
      if (updateData.schedule !== undefined) {
        if (updateData.schedule.length > 0) {
          this.validateSchedule(updateData.schedule);
        }
      }

      // Actualizar usuario
      const result = await usersCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after", projection: { password: 0 } }
      );

      if (!result) {
        throw new Error("Error al actualizar usuario");
      }

      return result;
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
  }

  // Actualizar token de notificaciones push
  static async updatePushToken(userId, expoPushToken) {
    const db = getDB();
    const usersCollection = db.collection("users");

    try {
      if (!ObjectId.isValid(userId)) {
        throw new Error("ID de usuario inválido");
      }

      // Validar que el token tenga el formato correcto de Expo
      if (
        expoPushToken &&
        !expoPushToken.startsWith("ExponentPushToken[") &&
        !expoPushToken.startsWith("ExpoPushToken[")
      ) {
        throw new Error("Formato de Expo Push Token inválido");
      }

      const result = await usersCollection.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        {
          $set: {
            expo_push_token: expoPushToken,
            updated_at: new Date(),
          },
        },
        { returnDocument: "after", projection: { password: 0 } }
      );

      if (!result) {
        throw new Error("Usuario no encontrado");
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los tokens de notificaciones activos
  static async getAllPushTokens(userType = null) {
    const db = getDB();
    const usersCollection = db.collection("users");

    try {
      const query = {
        expo_push_token: { $exists: true, $ne: null },
      };

      // Filtrar por tipo de usuario si se especifica
      if (userType) {
        query.user_type = userType;
      }

      const users = await usersCollection
        .find(query, { projection: { expo_push_token: 1 } })
        .toArray();

      // Retornar solo los tokens
      return users.map((user) => user.expo_push_token).filter((token) => token);
    } catch (error) {
      throw new Error(`Error al obtener tokens push: ${error.message}`);
    }
  }

  /**
   * Busca usuarios por día de horario y tipo de usuario
   * @param {string} day - Día de la semana (ej: "Lunes")
   * @param {Array<string>} userTypes - Tipos de usuario a incluir (ej: ["estudiante", "empleado"])
   * @returns {Promise<Array>} - Lista de usuarios (solo email, nombre y tipo)
   */
  static async findUsersByDayAndType(day, userTypes = ["estudiante", "empleado"]) {
    try {
      const db = getDB();
      const usersCollection = db.collection("users");

      console.log(`🔍 Buscando usuarios para notificación masiva: Día=${day}, Tipos=${userTypes.join(",")}`);

      // Query:
      // 1. user_type está en la lista permitida
      // 2. schedule contiene un objeto donde day coincide
      const query = {
        user_type: { $in: userTypes },
        schedule: {
          $elemMatch: { day: day }
        }
      };

      // Proyección: Solo necesitamos email y nombre para el correo
      const projection = {
        email: 1,
        first_name: 1,
        last_name: 1,
        user_type: 1
      };

      const users = await usersCollection.find(query, { projection }).toArray();
      
      console.log(`   ✅ Encontrados ${users.length} usuarios potenciales`);
      return users;
    } catch (error) {
      throw new Error(`Error al buscar usuarios para notificación: ${error.message}`);
    }
  }
}

module.exports = User;
