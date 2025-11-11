const { getDB } = require("../config/database");
const { ObjectId } = require("mongodb");

class ParkingLot {
  constructor(parkingLotData) {
    this.name = parkingLotData.name;
    this.moto_available = parkingLotData.moto_available || 0;
    this.car_available = parkingLotData.car_available || 0;
    this.created_at = new Date();
    this.updated_at = new Date();
  }

  // Validaciones
  static validateRequiredFields(parkingLotData) {
    const requiredFields = ["name"];
    const missingFields = [];

    requiredFields.forEach((field) => {
      if (
        !parkingLotData[field] ||
        parkingLotData[field].toString().trim() === ""
      ) {
        missingFields.push(field);
      }
    });

    return missingFields;
  }

  static validateNumericFields(parkingLotData) {
    const errors = [];

    if (
      parkingLotData.moto_available !== undefined &&
      (isNaN(parkingLotData.moto_available) ||
        parkingLotData.moto_available < 0)
    ) {
      errors.push("moto_available debe ser un número mayor o igual a 0");
    }

    if (
      parkingLotData.car_available !== undefined &&
      (isNaN(parkingLotData.car_available) || parkingLotData.car_available < 0)
    ) {
      errors.push("car_available debe ser un número mayor o igual a 0");
    }

    return errors;
  }

  // Crear parking lot
  static async create(parkingLotData) {
    const db = getDB();
    const parkingLotsCollection = db.collection("parking_lots");

    // Validar campos requeridos
    const missingFields = this.validateRequiredFields(parkingLotData);
    if (missingFields.length > 0) {
      throw new Error(
        `Campos requeridos faltantes: ${missingFields.join(", ")}`
      );
    }

    // Validar campos numéricos
    const numericErrors = this.validateNumericFields(parkingLotData);
    if (numericErrors.length > 0) {
      throw new Error(numericErrors.join(", "));
    }

    // Verificar si ya existe un parking lot con el mismo nombre
    const existingParkingLot = await parkingLotsCollection.findOne({
      name: parkingLotData.name,
    });
    if (existingParkingLot) {
      throw new Error("Ya existe un parking lot con este nombre");
    }

    // Crear nueva instancia de parking lot
    const newParkingLot = new ParkingLot(parkingLotData);

    try {
      const result = await parkingLotsCollection.insertOne(newParkingLot);

      const createdParkingLot = await parkingLotsCollection.findOne({
        _id: result.insertedId,
      });

      return createdParkingLot;
    } catch (error) {
      throw new Error(`Error al crear parking lot: ${error.message}`);
    }
  }

  // Obtener todos los parking lots
  static async findAll() {
    const db = getDB();
    const parkingLotsCollection = db.collection("parking_lots");

    try {
      const parkingLots = await parkingLotsCollection.find({}).toArray();
      return parkingLots;
    } catch (error) {
      throw new Error(`Error al obtener parking lots: ${error.message}`);
    }
  }

  // Obtener parking lot por ID
  static async findById(id) {
    const db = getDB();
    const parkingLotsCollection = db.collection("parking_lots");

    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("ID de parking lot inválido");
      }

      const parkingLot = await parkingLotsCollection.findOne({
        _id: new ObjectId(id),
      });

      return parkingLot;
    } catch (error) {
      throw new Error(`Error al obtener parking lot: ${error.message}`);
    }
  }

  // Actualizar parking lot
  static async update(id, parkingLotData) {
    const db = getDB();
    const parkingLotsCollection = db.collection("parking_lots");

    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("ID de parking lot inválido");
      }

      // Validar campos numéricos si están presentes
      const numericErrors = this.validateNumericFields(parkingLotData);
      if (numericErrors.length > 0) {
        throw new Error(numericErrors.join(", "));
      }

      // Si se está actualizando el nombre, verificar que no exista otro con el mismo
      if (parkingLotData.name) {
        const existingParkingLot = await parkingLotsCollection.findOne({
          name: parkingLotData.name,
          _id: { $ne: new ObjectId(id) },
        });
        if (existingParkingLot) {
          throw new Error("Ya existe otro parking lot con este nombre");
        }
      }

      // Preparar datos de actualización
      const updateData = {
        ...parkingLotData,
        updated_at: new Date(),
      };

      // Eliminar campos que no deben actualizarse
      delete updateData._id;
      delete updateData.created_at;

      const result = await parkingLotsCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after" }
      );

      if (!result) {
        throw new Error("Parking lot no encontrado");
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar parking lot
  static async delete(id) {
    const db = getDB();
    const parkingLotsCollection = db.collection("parking_lots");

    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("ID de parking lot inválido");
      }

      const result = await parkingLotsCollection.findOneAndDelete({
        _id: new ObjectId(id),
      });

      if (!result) {
        throw new Error("Parking lot no encontrado");
      }

      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ParkingLot;
