const API_URL = "http://localhost:3000/api";

// Credenciales para pruebas (basadas en los datos del usuario)
const STUDENT_EMAIL = "isai.velez984@pascualbravo.edu.co";
const GUARD_EMAIL = "celador@pascualbravo.edu.co";
const PASSWORD = "1Password.";

const login = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  return data.data?.token;
};

const runTest = async () => {
  try {
    console.log("🚀 Iniciando prueba de RBAC (Control de Acceso)...\n");

    // 1. Login como Estudiante
    console.log("1️⃣  Login como Estudiante...");
    const studentToken = await login(STUDENT_EMAIL, PASSWORD);
    console.log("   Token Estudiante:", studentToken ? "OK" : "FAIL");

    // 2. Login como Celador
    console.log("2️⃣  Login como Celador...");
    const guardToken = await login(GUARD_EMAIL, PASSWORD);
    console.log("   Token Celador:", guardToken ? "OK" : "FAIL");

    if (!studentToken || !guardToken) {
      throw new Error("Falló el login de alguno de los usuarios");
    }

    // 3. Prueba: Estudiante intenta crear Parking Lot (Debe fallar 403)
    console.log("\n3️⃣  Estudiante intenta crear Parking Lot (Esperado: 403 Forbidden)...");
    const studentCreateRes = await fetch(`${API_URL}/parking-lots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        name: "Parking Test Student",
        location: "Bloque Z",
        capacity: 10,
        available_spots: 10,
        type: "motos",
      }),
    });
    console.log("   Status:", studentCreateRes.status);
    console.log("   Resultado:", studentCreateRes.status === 403 ? "✅ ÉXITO (Bloqueado)" : "❌ FALLO (Permitido)");

    // 4. Prueba: Celador intenta crear Parking Lot (Debe funcionar 201)
    console.log("\n4️⃣  Celador intenta crear Parking Lot (Esperado: 201 Created)...");
    const guardCreateRes = await fetch(`${API_URL}/parking-lots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guardToken}`,
      },
      body: JSON.stringify({
        name: "Parking Test Guard",
        location: "Bloque X",
        capacity: 5,
        available_spots: 5,
        type: "carros",
      }),
    });
    console.log("   Status:", guardCreateRes.status);
    console.log("   Resultado:", guardCreateRes.status === 201 ? "✅ ÉXITO (Creado)" : "❌ FALLO");
    
    const createdParkingLot = await guardCreateRes.json();
    const parkingLotId = createdParkingLot.data?._id;

    // 5. Prueba: Estudiante intenta leer Parking Lots (Debe funcionar 200)
    console.log("\n5️⃣  Estudiante intenta leer Parking Lots (Esperado: 200 OK)...");
    const studentReadRes = await fetch(`${API_URL}/parking-lots`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    console.log("   Status:", studentReadRes.status);
    console.log("   Resultado:", studentReadRes.status === 200 ? "✅ ÉXITO (Leído)" : "❌ FALLO");

    // 6. Limpieza (Celador elimina el parking lot creado)
    if (parkingLotId) {
        console.log(`\n6️⃣  Limpieza: Celador elimina el parking lot creado (${parkingLotId})...`);
        const deleteRes = await fetch(`${API_URL}/parking-lots/${parkingLotId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${guardToken}` },
        });
        console.log("   Status:", deleteRes.status);
    }

    console.log("\n✨ Prueba de RBAC completada ✨");

  } catch (error) {
    console.error("\n❌ Error en la prueba:", error.message);
  }
};

runTest();
