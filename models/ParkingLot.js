const { getDB } = require("../config/database");
const { ObjectId } = require("mongodb");

class ParkingLot {
  constructor(parkingLotData) {
    this.name = parkingLotData.name;
    this.moto_available = parkingLotData.moto_available || 0;
    this.moto_max_available = parkingLotData.moto_max_available || 0;
    this.car_available = parkingLotData.car_available || 0;
    this.car_max_available = parkingLotData.car_max_available || 0;
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

    const numericFields = [
      "moto_available",
      "car_available",
      "moto_max_available",
      "car_max_available",
    ];

    numericFields.forEach((field) => {
      if (
        parkingLotData[field] !== undefined &&
        (isNaN(parkingLotData[field]) || parkingLotData[field] < 0)
      ) {
        errors.push(`${field} debe ser un número mayor o igual a 0`);
      }
    });

    return errors;
  }

  static validateCapacity(parkingLotData) {
    const errors = [];

    // Validar motos
    if (
      parkingLotData.moto_available !== undefined &&
      parkingLotData.moto_max_available !== undefined
    ) {
      if (parkingLotData.moto_available > parkingLotData.moto_max_available) {
        errors.push(
          "moto_available no puede ser mayor que moto_max_available"
        );
      }
    }

    // Validar carros
    if (
      parkingLotData.car_available !== undefined &&
      parkingLotData.car_max_available !== undefined
    ) {
      if (parkingLotData.car_available > parkingLotData.car_max_available) {
        errors.push("car_available no puede ser mayor que car_max_available");
      }
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

    // Validar capacidades (available <= max_available)
    // Asegurar que si no vienen, se usen los valores por defecto (0) para la validación
    const dataToValidate = {
      moto_available: parkingLotData.moto_available || 0,
      moto_max_available: parkingLotData.moto_max_available || 0,
      car_available: parkingLotData.car_available || 0,
      car_max_available: parkingLotData.car_max_available || 0,
    };

    const capacityErrors = this.validateCapacity(dataToValidate);
    if (capacityErrors.length > 0) {
      throw new Error(capacityErrors.join(", "));
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

      // Obtener el documento actual para validar capacidades con los nuevos valores
      const currentParkingLot = await parkingLotsCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!currentParkingLot) {
        throw new Error("Parking lot no encontrado");
      }

      // Combinar datos actuales con los nuevos para validar
      const mergedData = {
        moto_available:
          parkingLotData.moto_available !== undefined
            ? parkingLotData.moto_available
            : currentParkingLot.moto_available,
        moto_max_available:
          parkingLotData.moto_max_available !== undefined
            ? parkingLotData.moto_max_available
            : currentParkingLot.moto_max_available,
        car_available:
          parkingLotData.car_available !== undefined
            ? parkingLotData.car_available
            : currentParkingLot.car_available,
        car_max_available:
          parkingLotData.car_max_available !== undefined
            ? parkingLotData.car_max_available
            : currentParkingLot.car_max_available,
      };

      const capacityErrors = this.validateCapacity(mergedData);
      if (capacityErrors.length > 0) {
        throw new Error(capacityErrors.join(", "));
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
