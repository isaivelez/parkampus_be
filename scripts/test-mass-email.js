const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

async function testMassEmail() {
  console.log("📧 ==========================================");
  console.log("   Prueba de Notificaciones Masivas por Correo");
  console.log("============================================\n");

  // 1. Crear/Login Celador
  console.log("👮 Paso 1: Autenticando Celador...");
  const celadorEmail = "celador.test@parkampus.edu.co";
  const celadorPass = "123456";
  let celadorToken = "";

  // Intentar login primero
  try {
    let loginRes = await axios.post(`${BASE_URL}/login`, { email: celadorEmail, password: celadorPass });
    let loginData = loginRes.data;

    if (loginData.success) {
        celadorToken = loginData.data.token;
        console.log("✅ Celador autenticado");
    }
  } catch (error) {
      // Si falla login, intentar crear
      console.log("   Celador no existe o credenciales mal, creando...");
      try {
          const createRes = await axios.post(`${BASE_URL}/users`, {
              first_name: "Juan",
              last_name: "Celador",
              email: celadorEmail,
              password: celadorPass,
              user_type: "celador",
          });
          if (createRes.data.success) {
                let loginRes = await axios.post(`${BASE_URL}/login`, { email: celadorEmail, password: celadorPass });
                celadorToken = loginRes.data.data.token;
                console.log("✅ Celador creado y autenticado");
          }
      } catch (createError) {
            console.error("❌ Error creando celador:", createError.response ? createError.response.data : createError.message);
            return;
      }
  }

  // 2. Crear Estudiante con horario HOY
  console.log("\n🎓 Paso 2: Creando Estudiante con horario para HOY...");
  
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const today = days[new Date().getDay()];
  console.log(`   Día actual: ${today}`);

  const studentEmail = `student.${Date.now()}@test.com`;
  try {
      const studentRes = await axios.post(`${BASE_URL}/users`, {
        first_name: "Test",
        last_name: "Student",
        email: studentEmail,
        password: "password123",
        user_type: "estudiante",
        schedule: [
            {
            day: today,
            start_time: "08:00",
            end_time: "18:00"
            }
        ]
      });
      if (studentRes.data.success) {
        console.log(`✅ Estudiante creado: ${studentEmail}`);
      }
  } catch (error) {
      console.error("❌ Error creando estudiante:", error.response ? error.response.data : error.message);
  }

  // 3. Enviar Notificación Masiva
  console.log("\n📢 Paso 3: Enviando Notificación Masiva (CIERRE_NOCTURNO)...");
  
  try {
      const notifyRes = await axios.post(`${BASE_URL}/notifications/mass-email`, {
        type: "CIERRE_NOCTURNO"
      }, {
        headers: { 
            "Authorization": `Bearer ${celadorToken}`
        }
      });

      if (notifyRes.data.success) {
        console.log("✅ Notificación enviada exitosamente!");
        console.log("   Detalles:", notifyRes.data.details);
      }
  } catch (error) {
    console.error("❌ Error enviando notificación:", error.response ? error.response.data : error.message);
  }

  console.log("\n============================================");
}

testMassEmail().catch(console.error);
