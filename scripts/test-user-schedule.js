const BASE_URL = "http://localhost:3000/api/users";
const LOGIN_URL = "http://localhost:3000/api/login";

async function testUserSchedule() {
  console.log("🧪 ==========================================");
  console.log("   Pruebas de Schedule de Usuario (con Auth)");
  console.log("============================================\n");

  let testUserId = null;
  let authToken = null;
  const testPassword = "password123";
  const testEmail = `test.schedule.${Date.now()}@test.com`;

  // Test 1: Crear usuario con schedule válido
  console.log("📝 Test 1: Crear usuario con schedule válido");
  try {
    const newUser = {
      first_name: "María",
      last_name: "González Schedule",
      email: testEmail,
      password: testPassword,
      user_type: "estudiante",
      schedule: [
        {
          day: "Lunes",
          start_time: "07:00",
          end_time: "13:00",
        },
        {
          day: "Miércoles",
          start_time: "14:00",
          end_time: "18:00",
        },
        {
          day: "Viernes",
          start_time: "08:00",
          end_time: "11:00",
        },
      ],
    };

    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    const result = await response.json();
    if (result.success) {
      testUserId = result.data._id;
      console.log("✅ Usuario creado exitosamente con schedule");
      console.log("   ID:", result.data._id);
      console.log("   Schedule:", JSON.stringify(result.data.schedule, null, 2));

      // Login para obtener token
      console.log("   🔐 Autenticando usuario...");
      const loginResponse = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail, password: testPassword }),
      });

      const loginResult = await loginResponse.json();
      if (loginResult.success) {
        authToken = loginResult.token;
        console.log("   ✅ Token obtenido exitosamente");
      } else {
        console.log("   ❌ Error al obtener token:", loginResult.message);
      }
    } else {
      console.log("❌ Error:", result.message);
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
  console.log("");

  // Test 2: Intentar crear con día inválido
  console.log("📝 Test 2: Intentar crear usuario con día inválido");
  try {
    const invalidUser = {
      first_name: "Test",
      last_name: "Invalid Day",
      email: `test.invalid.${Date.now()}@test.com`,
      password: "password123",
      user_type: "estudiante",
      schedule: [
        {
          day: "Monday", // Día en inglés - debería fallar
          start_time: "07:00",
          end_time: "13:00",
        },
      ],
    };

    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidUser),
    });

    const result = await response.json();
    if (!result.success) {
      console.log("✅ Validación funcionó correctamente");
      console.log("   Error esperado:", result.message);
    } else {
      console.log("❌ Debería haber fallado la validación");
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
  console.log("");

  // Test 3: Intentar crear con start_time >= end_time
  console.log("📝 Test 3: Intentar crear con start_time >= end_time");
  try {
    const invalidTimeUser = {
      first_name: "Test",
      last_name: "Invalid Time",
      email: `test.invalidtime.${Date.now()}@test.com`,
      password: "password123",
      user_type: "estudiante",
      schedule: [
        {
          day: "Lunes",
          start_time: "18:00",
          end_time: "13:00", // end_time antes de start_time
        },
      ],
    };

    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidTimeUser),
    });

    const result = await response.json();
    if (!result.success) {
      console.log("✅ Validación funcionó correctamente");
      console.log("   Error esperado:", result.message);
    } else {
      console.log("❌ Debería haber fallado la validación");
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
  console.log("");

  // Test 4: Intentar crear con formato de hora inválido
  console.log("📝 Test 4: Intentar crear con formato de hora inválido");
  try {
    const invalidFormatUser = {
      first_name: "Test",
      last_name: "Invalid Format",
      email: `test.invalidformat.${Date.now()}@test.com`,
      password: "password123",
      user_type: "estudiante",
      schedule: [
        {
          day: "Lunes",
          start_time: "7:00 AM", // Formato incorrecto
          end_time: "1:00 PM",
        },
      ],
    };

    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidFormatUser),
    });

    const result = await response.json();
    if (!result.success) {
      console.log("✅ Validación funcionó correctamente");
      console.log("   Error esperado:", result.message);
    } else {
      console.log("❌ Debería haber fallado la validación");
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
  console.log("");

  // Test 5: Actualizar schedule CON autenticación (debe funcionar)
  if (testUserId && authToken) {
    console.log("📝 Test 5: Actualizar schedule con autenticación válida");
    try {
      const updatedSchedule = {
        schedule: [
          {
            day: "Martes",
            start_time: "09:00",
            end_time: "12:00",
          },
          {
            day: "Jueves",
            start_time: "15:00",
            end_time: "17:30",
          },
        ],
      };

      const response = await fetch(`${BASE_URL}/${testUserId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updatedSchedule),
      });

      const result = await response.json();
      if (result.success) {
        console.log("✅ Schedule actualizado exitosamente");
        console.log(
          "   Nuevo schedule:",
          JSON.stringify(result.data.schedule, null, 2)
        );
      } else {
        console.log("❌ Error:", result.message);
      }
    } catch (error) {
      console.log("❌ Error:", error.message);
    }
    console.log("");
  }

  // Test 6: Intentar actualizar SIN autenticación (debe fallar)
  if (testUserId) {
    console.log("📝 Test 6: Intentar actualizar SIN autenticación");
    try {
      const updatedSchedule = {
        schedule: [
          {
            day: "Miércoles",
            start_time: "10:00",
            end_time: "14:00",
          },
        ],
      };

      const response = await fetch(`${BASE_URL}/${testUserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // NO incluye Authorization header
        body: JSON.stringify(updatedSchedule),
      });

      const result = await response.json();
      if (!result.success && response.status === 403) {
        console.log("✅ Autenticación requerida funcionó correctamente");
        console.log("   Error esperado:", result.message);
      } else {
        console.log("❌ Debería haber rechazado la petición sin token");
      }
    } catch (error) {
      console.log("❌ Error:", error.message);
    }
    console.log("");
  }

  // Test 7: Actualizar schedule con datos inválidos
  if (testUserId && authToken) {
    console.log("📝 Test 7: Actualizar schedule con datos inválidos");
    try {
      const invalidSchedule = {
        schedule: [
          {
            day: "Martes",
            start_time: "25:00", // Hora inválida
            end_time: "12:00",
          },
        ],
      };

      const response = await fetch(`${BASE_URL}/${testUserId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(invalidSchedule),
      });

      const result = await response.json();
      if (!result.success) {
        console.log("✅ Validación funcionó correctamente");
        console.log("   Error esperado:", result.message);
      } else {
        console.log("❌ Debería haber fallado la validación");
      }
    } catch (error) {
      console.log("❌ Error:", error.message);
    }
    console.log("");
  }

  console.log("============================================");
  console.log("   Pruebas completadas");
  console.log("============================================");
}

// Ejecutar pruebas
testUserSchedule().catch(console.error);
