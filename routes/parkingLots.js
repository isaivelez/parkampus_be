const express = require("express");
const ParkingLot = require("../models/ParkingLot");
const { verifyToken, verifyRole } = require("../middleware/auth");

const router = express.Router();

// Aplicar verificación de token a todas las rutas
router.use(verifyToken);

// POST /api/parking-lots - Crear nuevo parking lot (Solo Celador)
router.post("/", verifyRole(["celador"]), async (req, res) => {
  try {
    console.log("🅿️  Creando nuevo parking lot:", req.body);

    const newParkingLot = await ParkingLot.create(req.body);

    res.status(201).json({
      success: true,
      message: "Parking lot creado exitosamente",
      data: newParkingLot,
    });
  } catch (error) {
    console.error("❌ Error al crear parking lot:", error.message);

    res.status(400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
});

// GET /api/parking-lots - Obtener todos los parking lots (Todos los usuarios autenticados)
router.get("/", async (req, res) => {
  try {
    console.log("📋 Obteniendo todos los parking lots");

    const parkingLots = await ParkingLot.findAll();

    res.status(200).json({
      success: true,
      message: "Parking lots obtenidos exitosamente",
      count: parkingLots.length,
      data: parkingLots,
    });
  } catch (error) {
    console.error("❌ Error al obtener parking lots:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
});

// GET /api/parking-lots/:id - Obtener parking lot por ID (Todos los usuarios autenticados)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Obteniendo parking lot con ID: ${id}`);

    const parkingLot = await ParkingLot.findById(id);

    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        message: "Parking lot no encontrado",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Parking lot obtenido exitosamente",
      data: parkingLot,
    });
  } catch (error) {
    console.error("❌ Error al obtener parking lot:", error.message);

    res.status(400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
});

// PUT /api/parking-lots/:id - Actualizar parking lot (Solo Celador)
router.put("/:id", verifyRole(["celador"]), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`✏️  Actualizando parking lot con ID: ${id}`, req.body);

    const updatedParkingLot = await ParkingLot.update(id, req.body);

    res.status(200).json({
      success: true,
      message: "Parking lot actualizado exitosamente",
      data: updatedParkingLot,
    });
  } catch (error) {
    console.error("❌ Error al actualizar parking lot:", error.message);

    const statusCode =
      error.message === "Parking lot no encontrado" ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
});

// PATCH /api/parking-lots/:id - Actualización parcial de parking lot (Solo Celador)
router.patch("/:id", verifyRole(["celador"]), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(
      `✏️  Actualizando parcialmente parking lot con ID: ${id}`,
      req.body
    );

    const updatedParkingLot = await ParkingLot.update(id, req.body);

    res.status(200).json({
      success: true,
      message: "Parking lot actualizado exitosamente",
      data: updatedParkingLot,
    });
  } catch (error) {
    console.error("❌ Error al actualizar parking lot:", error.message);

    const statusCode =
      error.message === "Parking lot no encontrado" ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
});

// DELETE /api/parking-lots/:id - Eliminar parking lot (Solo Celador)
router.delete("/:id", verifyRole(["celador"]), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️  Eliminando parking lot con ID: ${id}`);

    const deletedParkingLot = await ParkingLot.delete(id);

    res.status(200).json({
      success: true,
      message: "Parking lot eliminado exitosamente",
      data: deletedParkingLot,
    });
  } catch (error) {
    console.error("❌ Error al eliminar parking lot:", error.message);

    const statusCode =
      error.message === "Parking lot no encontrado" ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
});

module.exports = router;
