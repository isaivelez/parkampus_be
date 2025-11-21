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
      if (!ObjectId.isValid(id)) {
        throw new Error("ID de usuario inválido");
      }

      const user = await usersCollection.findOne(
        { _id: new ObjectId(id) },
        { projection: { password: 0 } }
      );

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
}

module.exports = User;
