const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

/**
 * Script de prueba para validar el filtrado temporal de notificaciones
 * 
 * Escenarios:
 * 1. Usuario con clase 8am-10am, notificación a las 9:30am -> ✅ DEBE recibir (última hora)
 * 2. Usuario con clase 8am-10am, notificación a las 10:20am -> ✅ DEBE recibir (dentro de 1h después)
 * 3. Usuario con clase 8am-10am, notificación a las 11:30am -> ❌ NO debe recibir (más de 1h después)
 * 4. Usuario con clase 8am-10am, notificación a las 8:30am -> ❌ NO debe recibir (no es última hora)
 */

async function testTimeBasedFiltering() {
  console.log("🧪 ==========================================");
  console.log("   Prueba de Filtrado Temporal de Notificaciones");
  console.log("============================================\n");

  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const today = days[new Date().getDay()];
  
  // 1. Autenticar celador
  console.log("👮 Paso 1: Autenticando Celador...");
  const celadorEmail = "celador.test@parkampus.edu.co";
  const celadorPass = "123456";
  let celadorToken = "";

  try {
    let loginRes = await axios.post(`${BASE_URL}/login`, { email: celadorEmail, password: celadorPass });
    celadorToken = loginRes.data.data.token;
    console.log("✅ Celador autenticado\n");
  } catch (error) {
    console.log("   Celador no existe, creando...");
    try {
      await axios.post(`${BASE_URL}/users`, {
        first_name: "Juan",
        last_name: "Celador",
        email: celadorEmail,
        password: celadorPass,
        user_type: "celador",
      });
      let loginRes = await axios.post(`${BASE_URL}/login`, { email: celadorEmail, password: celadorPass });
      celadorToken = loginRes.data.data.token;
      console.log("✅ Celador creado y autenticado\n");
    } catch (createError) {
      console.error("❌ Error creando celador:", createError.message);
      return;
    }
  }

  // 2. Crear usuarios de prueba con diferentes horarios
  console.log("🎓 Paso 2: Creando usuarios de prueba...");
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  console.log(`   Hora actual: ${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`);
  console.log(`   Día actual: ${today}\n`);

  // Crear usuario que DEBE recibir (última hora de clase)
  // Clase termina en 30 minutos
  const endTime1Hour = currentHour;
  const endTime1Min = currentMinute + 30;
  const endTime1 = `${String(endTime1Hour).padStart(2, '0')}:${String(endTime1Min).padStart(2, '0')}`;
  const startTime1 = `${String(endTime1Hour - 2).padStart(2, '0')}:00`;

  try {
    await axios.post(`${BASE_URL}/users`, {
      first_name: "Ana",
      last_name: "EnClase",
      email: `ana.enclase.${Date.now()}@test.com`,
      password: "password123",
      user_type: "estudiante",
      schedule: [{ day: today, start_time: startTime1, end_time: endTime1 }]
    });
    console.log(`✅ Usuario 1 creado: Clase ${startTime1}-${endTime1} (DEBE recibir - en última hora)`);
  } catch (error) {
    console.log(`   Usuario 1: ${error.response?.data?.message || error.message}`);
  }

  // Crear usuario que DEBE recibir (clase terminó hace 30 min)
  const endTime2Hour = currentHour;
  const endTime2Min = currentMinute - 30;
  const endTime2 = `${String(endTime2Hour).padStart(2, '0')}:${String(endTime2Min).padStart(2, '0')}`;
  const startTime2 = `${String(endTime2Hour - 2).padStart(2, '0')}:00`;

  try {
    await axios.post(`${BASE_URL}/users`, {
      first_name: "Carlos",
      last_name: "RecienTermino",
      email: `carlos.recien.${Date.now()}@test.com`,
      password: "password123",
      user_type: "estudiante",
      schedule: [{ day: today, start_time: startTime2, end_time: endTime2 }]
    });
    console.log(`✅ Usuario 2 creado: Clase ${startTime2}-${endTime2} (DEBE recibir - terminó hace 30min)`);
  } catch (error) {
    console.log(`   Usuario 2: ${error.response?.data?.message || error.message}`);
  }

  // Crear usuario que NO debe recibir (clase terminó hace 2 horas)
  const endTime3Hour = currentHour - 2;
  const endTime3 = `${String(endTime3Hour).padStart(2, '0')}:00`;
  const startTime3 = `${String(endTime3Hour - 2).padStart(2, '0')}:00`;

  try {
    await axios.post(`${BASE_URL}/users`, {
      first_name: "Pedro",
      last_name: "YaSeFue",
      email: `pedro.sefue.${Date.now()}@test.com`,
      password: "password123",
      user_type: "estudiante",
      schedule: [{ day: today, start_time: startTime3, end_time: endTime3 }]
    });
    console.log(`✅ Usuario 3 creado: Clase ${startTime3}-${endTime3} (NO debe recibir - terminó hace 2h)`);
  } catch (error) {
    console.log(`   Usuario 3: ${error.response?.data?.message || error.message}`);
  }

  // 3. Enviar notificación
  console.log("\n📢 Paso 3: Enviando Notificación Masiva...");
  
  try {
    const notifyRes = await axios.post(`${BASE_URL}/notifications/mass-email`, {
      type: "LIBERACION_HORA_PICO"
    }, {
      headers: { "Authorization": `Bearer ${celadorToken}` }
    });

    if (notifyRes.data.success) {
      console.log("✅ Notificación procesada!");
      console.log("\n📊 Resultados:");
      console.log(`   Total de usuarios con horario hoy: ${notifyRes.data.details.total_targets}`);
      console.log(`   Correos enviados: ${notifyRes.data.details.sent}`);
      console.log(`   Correos fallidos: ${notifyRes.data.details.failed}`);
      
      if (notifyRes.data.details.errors && notifyRes.data.details.errors.length > 0) {
        console.log("\n❌ Errores:");
        notifyRes.data.details.errors.forEach(err => {
          console.log(`   - ${err.email}: ${err.error.substring(0, 100)}...`);
        });
      }
      
      console.log("\n💡 Interpretación:");
      console.log("   - Ana y Carlos DEBERÍAN haber recibido el correo");
      console.log("   - Pedro NO debería haberlo recibido");
      console.log(`   - Total esperado: 2 usuarios elegibles`);
    }
  } catch (error) {
    console.error("❌ Error enviando notificación:", error.response ? error.response.data : error.message);
  }

  console.log("\n============================================");
}

testTimeBasedFiltering().catch(console.error);
