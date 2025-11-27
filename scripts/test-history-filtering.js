const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

/**
 * Script para probar el filtrado de historial de notificaciones
 * Verifica que cada usuario solo vea notificaciones relevantes a su horario
 */

async function testHistoryFiltering() {
  console.log("🧪 ==========================================");
  console.log("   Prueba de Filtrado de Historial");
  console.log("============================================\n");

  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const today = days[new Date().getDay()];
  
  // 1. Crear y autenticar estudiante con horario
  console.log("🎓 Paso 1: Creando estudiante con horario...");
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Crear horario que termina en 30 minutos (dentro de ventana)
  // Calcular correctamente para evitar minutos > 59
  let endHour = currentHour;
  let endMinute = currentMinute + 30;
  if (endMinute >= 60) {
    endHour += 1;
    endMinute -= 60;
  }
  
  const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
  const startTime = `${String(Math.max(0, currentHour - 2)).padStart(2, '0')}:00`;
  
  const studentEmail = `student.history.${Date.now()}@test.com`;
  const studentPass = "password123";
  let studentToken = "";

  try {
    await axios.post(`${BASE_URL}/users`, {
      first_name: "María",
      last_name: "Estudiante",
      email: studentEmail,
      password: studentPass,
      user_type: "estudiante",
      schedule: [
        { day: today, start_time: startTime, end_time: endTime }
      ]
    });
    console.log(`✅ Estudiante creado con horario: ${startTime}-${endTime} (${today})`);
    
    // Login
    const loginRes = await axios.post(`${BASE_URL}/login`, { 
      email: studentEmail, 
      password: studentPass 
    });
    studentToken = loginRes.data.data.token;
    console.log("✅ Estudiante autenticado\n");
  } catch (error) {
    console.error("❌ Error:", error.response?.data?.message || error.message);
    return;
  }

  // 2. Autenticar celador y enviar notificación
  console.log("👮 Paso 2: Enviando notificación como celador...");
  
  const celadorEmail = "celador.test@parkampus.edu.co";
  const celadorPass = "123456";
  let celadorToken = "";

  try {
    const loginRes = await axios.post(`${BASE_URL}/login`, { 
      email: celadorEmail, 
      password: celadorPass 
    });
    celadorToken = loginRes.data.data.token;
    
    // Enviar notificación
    const notifyRes = await axios.post(`${BASE_URL}/notifications/mass-email`, {
      type: "CIERRE_NOCTURNO"
    }, {
      headers: { "Authorization": `Bearer ${celadorToken}` }
    });
    
    console.log(`✅ Notificación enviada (${notifyRes.data.details.sent} correos)\n`);
  } catch (error) {
    console.error("❌ Error:", error.response?.data?.message || error.message);
    return;
  }

  // 3. Verificar historial del estudiante
  console.log("📋 Paso 3: Consultando historial del estudiante...");
  
  try {
    const historyRes = await axios.get(`${BASE_URL}/notifications/history`, {
      headers: { "Authorization": `Bearer ${studentToken}` }
    });
    
    console.log(`\n📊 Resultados:`);
    console.log(`   Total de notificaciones en el historial: ${historyRes.data.total || historyRes.data.data.length}`);
    
    if (historyRes.data.data.length > 0) {
      console.log(`\n   Notificaciones visibles para el estudiante:`);
      historyRes.data.data.forEach((notif, index) => {
        const date = new Date(notif.created_at);
        console.log(`   ${index + 1}. ${notif.subject}`);
        console.log(`      Enviada: ${date.toLocaleString('es-CO')}`);
        console.log(`      Destinatarios: ${notif.recipients_count}`);
      });
    } else {
      console.log(`   ℹ️  No hay notificaciones visibles para este usuario`);
      console.log(`      (Esto es correcto si la notificación fue enviada fuera de su ventana de tiempo)`);
    }
    
    console.log(`\n💡 Interpretación:`);
    console.log(`   El estudiante tiene clase de ${startTime} a ${endTime}`);
    console.log(`   Solo debería ver notificaciones enviadas entre:`);
    const lastHourStart = new Date(now);
    lastHourStart.setHours(parseInt(endTime.split(':')[0]));
    lastHourStart.setMinutes(parseInt(endTime.split(':')[1]) - 60);
    const oneHourAfter = new Date(now);
    oneHourAfter.setHours(parseInt(endTime.split(':')[0]));
    oneHourAfter.setMinutes(parseInt(endTime.split(':')[1]) + 60);
    console.log(`   - Desde: ${lastHourStart.toLocaleTimeString('es-CO', {hour: '2-digit', minute: '2-digit'})}`);
    console.log(`   - Hasta: ${oneHourAfter.toLocaleTimeString('es-CO', {hour: '2-digit', minute: '2-digit'})}`);
    
  } catch (error) {
    console.error("❌ Error:", error.response?.data?.message || error.message);
  }

  console.log("\n============================================");
}

testHistoryFiltering().catch(console.error);
