const BASE_URL = "http://localhost:3000/api/users";
const LOGIN_URL = "http://localhost:3000/api/login";

async function testScheduleUpdateAuth() {
  console.log("🧪 ==========================================");
  console.log("   Test: Actualizar schedule con auth");
  console.log("============================================\n");

  const testPassword = "testPassword123";
  const testEmail = `auth.update.${Date.now()}@test.com`;
  let userId = null;
  let authToken = null;

  // Paso 1: Crear usuario
  console.log("📝 Paso 1: Creando usuario...");
  try {
    const newUser = {
      first_name: "Test",
      last_name: "Auth Update",
      email: testEmail,
      password: testPassword,
      user_type: "estudiante",
      schedule: [
        {
          day: "Lunes",
          start_time: "08:00",
          end_time: "12:00",
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
      userId = result.data._id;
      console.log("✅ Usuario creado exitosamente");
      console.log("   ID:", userId);
    } else {
      console.log("❌ Error:", result.message);
      return;
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
    return;
  }
  console.log("");

  // Paso 2: Login
  console.log("📝 Paso 2: Haciendo login...");
  try {
    const loginResponse = await fetch(LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });

    const loginResult = await loginResponse.json();
    if (loginResult.success) {
      authToken = loginResult.data.token;
      console.log("✅ Login exitoso");
      console.log("   Token recibido:", authToken ? "Sí" : "No");
      console.log("   User ID en token:", loginResult.data.user._id);
      console.log("   User ID original:", userId);
      console.log("   ¿IDs coinciden?:", loginResult.data.user._id === userId ? "✅ Sí" : "❌ No");
    } else {
      console.log("❌ Error en login:", loginResult.message);
      return;
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
    return;
  }
  console.log("");

  // Paso 3: Actualizar schedule
  console.log("📝 Paso 3: Actualizando schedule con token...");
  try {
    const updatedSchedule = {
      schedule: [
        {
          day: "Martes",
          start_time: "10:00",
          end_time: "14:00",
        },
        {
          day: "Jueves",
          start_time: "15:00",
          end_time: "18:00",
        },
      ],
    };

    const response = await fetch(`${BASE_URL}/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(updatedSchedule),
    });

    const result = await response.json();
    console.log("   Status code:", response.status);
    
    if (result.success) {
      console.log("✅ Schedule actualizado exitosamente");
      console.log("   Nuevo schedule:");
      console.log(JSON.stringify(result.data.schedule, null, 2));
    } else {
      console.log("❌ Error al actualizar:", result.message);
      console.log("   Response completo:", JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
  console.log("");

  console.log("============================================");
  console.log("   Test completado");
  console.log("============================================");
}

// Ejecutar test
testScheduleUpdateAuth().catch(console.error);
