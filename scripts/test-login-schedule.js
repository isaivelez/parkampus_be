const BASE_URL = "http://localhost:3000/api/users";
const LOGIN_URL = "http://localhost:3000/api/login";

async function testLoginScheduleResponse() {
  console.log("🧪 ==========================================");
  console.log("   Test: Login debe retornar schedule");
  console.log("============================================\n");

  const testPassword = "testPassword123";
  const testEmail = `login.test.${Date.now()}@test.com`;

  // Crear usuario con schedule
  console.log("📝 Paso 1: Creando usuario con schedule...");
  try {
    const newUser = {
      first_name: "Test",
      last_name: "Login Schedule",
      email: testEmail,
      password: testPassword,
      user_type: "estudiante",
      schedule: [
        {
          day: "Lunes",
          start_time: "08:00",
          end_time: "12:00",
        },
        {
          day: "Viernes",
          start_time: "14:00",
          end_time: "17:00",
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
      console.log("✅ Usuario creado exitosamente");
      console.log("   ID:", result.data._id);
    } else {
      console.log("❌ Error:", result.message);
      return;
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
    return;
  }
  console.log("");

  // Hacer login
  console.log("📝 Paso 2: Haciendo login...");
  try {
    const loginResponse = await fetch(LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });

    const loginResult = await loginResponse.json();
    if (loginResult.success) {
      console.log("✅ Login exitoso");
      console.log("   Token recibido:", loginResult.data.token ? "Sí" : "No");
      console.log("   Usuario recibido:", loginResult.data.user ? "Sí" : "No");

      if (loginResult.data.user.schedule) {
        console.log("✅ Schedule recibido en login:");
        console.log(JSON.stringify(loginResult.data.user.schedule, null, 2));
      } else {
        console.log("❌ Schedule NO recibido en login");
        console.log("   Datos del usuario:", JSON.stringify(loginResult.data.user, null, 2));
      }
    } else {
      console.log("❌ Error en login:", loginResult.message);
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
testLoginScheduleResponse().catch(console.error);
