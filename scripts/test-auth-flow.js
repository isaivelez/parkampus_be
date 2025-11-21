const API_URL = "http://localhost:3000/api";

// Generar email único
const uniqueEmail = `test_${Date.now()}@example.com`;
const password = "password123";

const runTest = async () => {
  try {
    console.log("🚀 Iniciando prueba de autenticación...\n");

    // 1. Registrar usuario
    console.log(`1️⃣  Registrando usuario: ${uniqueEmail}`);
    const registerResponse = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: "Test",
        last_name: "User",
        email: uniqueEmail,
        password: password,
        user_type: "estudiante",
      }),
    });
    const registerData = await registerResponse.json();
    console.log("✅ Registro exitoso:", registerData.success);

    if (!registerData.success) {
      throw new Error(`Falló registro: ${registerData.message}`);
    }

    // 2. Login
    console.log(`\n2️⃣  Iniciando sesión...`);
    const loginResponse = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: uniqueEmail,
        password: password,
      }),
    });
    const loginData = await loginResponse.json();
    console.log("✅ Login exitoso:", loginData.success);
    const token = loginData.data?.token;
    console.log("🔑 Token recibido:", token ? "Sí" : "No");

    if (!token) {
      throw new Error("No se recibió token en el login");
    }

    // 3. Acceder a ruta protegida
    console.log(`\n3️⃣  Accediendo a ruta protegida (/users/profile)...`);
    const profileResponse = await fetch(`${API_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const profileData = await profileResponse.json();
    console.log("✅ Acceso a ruta protegida exitoso:", profileData.success);
    console.log("👤 Usuario autenticado:", profileData.data?.email);

    console.log("\n✨ Prueba de autenticación completada con ÉXITO ✨");
  } catch (error) {
    console.error("\n❌ Error en la prueba:", error.message);
    process.exit(1);
  }
};

runTest();
