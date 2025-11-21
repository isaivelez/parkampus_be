const API_URL = "http://localhost:3000/api";
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
    console.log("🚀 Iniciando prueba de Validaciones de ParkingLot...\n");

    // 1. Login como Celador
    console.log("1️⃣  Login como Celador...");
    const token = await login(GUARD_EMAIL, PASSWORD);
    if (!token) throw new Error("Falló el login del celador");
    console.log("   Token Celador: OK");

    // 2. Prueba: Crear con available > max_available (Debe fallar)
    console.log("\n2️⃣  Crear Parking Lot inválido (available > max) (Esperado: 400 Bad Request)...");
    const invalidCreateRes = await fetch(`${API_URL}/parking-lots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: "Parking Invalid",
        moto_available: 20,
        moto_max_available: 10, // Error aquí
        car_available: 5,
        car_max_available: 5,
      }),
    });
    const invalidCreateData = await invalidCreateRes.json();
    console.log("   Status:", invalidCreateRes.status);
    console.log("   Mensaje:", invalidCreateData.message);
    console.log("   Resultado:", invalidCreateRes.status === 400 ? "✅ ÉXITO (Rechazado)" : "❌ FALLO");

    // 3. Prueba: Crear válido
    console.log("\n3️⃣  Crear Parking Lot válido (Esperado: 201 Created)...");
    const validCreateRes = await fetch(`${API_URL}/parking-lots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: "Parking Valid Test",
        moto_available: 10,
        moto_max_available: 20,
        car_available: 5,
        car_max_available: 10,
      }),
    });
    const validCreateData = await validCreateRes.json();
    console.log("   Status:", validCreateRes.status);
    console.log("   Resultado:", validCreateRes.status === 201 ? "✅ ÉXITO (Creado)" : "❌ FALLO");
    
    const parkingId = validCreateData.data?._id;

    if (parkingId) {
        // 4. Prueba: Actualizar con available > max_available (Debe fallar)
        console.log("\n4️⃣  Actualizar Parking Lot inválido (Esperado: 400 Bad Request)...");
        const invalidUpdateRes = await fetch(`${API_URL}/parking-lots/${parkingId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                moto_available: 25, // Mayor que max (20)
            }),
        });
        const invalidUpdateData = await invalidUpdateRes.json();
        console.log("   Status:", invalidUpdateRes.status);
        console.log("   Mensaje:", invalidUpdateData.message);
        console.log("   Resultado:", invalidUpdateRes.status === 400 ? "✅ ÉXITO (Rechazado)" : "❌ FALLO");

        // 5. Prueba: Actualizar max_available menor que available actual (Debe fallar)
        console.log("\n5️⃣  Actualizar max_available < available actual (Esperado: 400 Bad Request)...");
        // Current: moto_available: 10
        const invalidMaxUpdateRes = await fetch(`${API_URL}/parking-lots/${parkingId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                moto_max_available: 5, // Menor que available actual (10)
            }),
        });
        const invalidMaxUpdateData = await invalidMaxUpdateRes.json();
        console.log("   Status:", invalidMaxUpdateRes.status);
        console.log("   Mensaje:", invalidMaxUpdateData.message);
        console.log("   Resultado:", invalidMaxUpdateRes.status === 400 ? "✅ ÉXITO (Rechazado)" : "❌ FALLO");

        // 6. Limpieza
        console.log(`\n6️⃣  Limpieza: Eliminando parking lot (${parkingId})...`);
        await fetch(`${API_URL}/parking-lots/${parkingId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    console.log("\n✨ Prueba de Validaciones completada ✨");

  } catch (error) {
    console.error("\n❌ Error en la prueba:", error.message);
  }
};

runTest();
