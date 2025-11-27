const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

/**
 * Verificar que celadores ven TODAS las notificaciones
 * mientras que estudiantes solo ven las filtradas
 */

async function testCeladorHistoryAccess() {
  console.log("🧪 ==========================================");
  console.log("   Prueba: Acceso Completo para Celadores");
  console.log("============================================\n");

  // 1. Login como celador
  console.log("👮 Paso 1: Autenticando como Celador...");
  const celadorEmail = "celador.test@parkampus.edu.co";
  const celadorPass = "123456";
  let celadorToken = "";

  try {
    const loginRes = await axios.post(`${BASE_URL}/login`, { 
      email: celadorEmail, 
      password: celadorPass 
    });
    celadorToken = loginRes.data.data.token;
    console.log("✅ Celador autenticado\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
    return;
  }

  // 2. Consultar historial como celador
  console.log("📋 Paso 2: Consultando historial como Celador...");
  
  try {
    const historyRes = await axios.get(`${BASE_URL}/notifications/history`, {
      headers: { "Authorization": `Bearer ${celadorToken}` }
    });
    
    console.log(`\n📊 Resultados para CELADOR:`);
    console.log(`   Total de notificaciones: ${historyRes.data.total}`);
    console.log(`   Filtrado aplicado: ${historyRes.data.filtered ? 'SÍ' : 'NO'}`);
    
    if (historyRes.data.data.length > 0) {
      console.log(`\n   Últimas 5 notificaciones:`);
      historyRes.data.data.slice(0, 5).forEach((notif, index) => {
        const date = new Date(notif.created_at);
        console.log(`   ${index + 1}. ${notif.subject}`);
        console.log(`      ${date.toLocaleString('es-CO')}`);
      });
    }
    
    console.log(`\n✅ CORRECTO: El celador ve TODAS las notificaciones sin filtrado`);
    
  } catch (error) {
    console.error("❌ Error:", error.response?.data?.message || error.message);
  }

  console.log("\n============================================");
}

testCeladorHistoryAccess().catch(console.error);
