const nodemailer = require("nodemailer");

// Configuración del transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "isai.velez47@gmail.com",
    pass: process.env.SMTP_PASS || "wavj tzpf bzuw bpdi",
  },
});

// Estilos base para el correo (CSS inlined)
const BASE_STYLE = `
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background-color: #f4f6f8;
  padding: 20px;
  color: #333;
`;

const CONTAINER_STYLE = `
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
`;

const HEADER_STYLE = `
  background-color: #003366; /* Azul Parkampus */
  color: #ffffff;
  padding: 30px 20px;
  text-align: center;
`;

const BODY_STYLE = `
  padding: 30px 20px;
  line-height: 1.6;
`;

const FOOTER_STYLE = `
  background-color: #f4f6f8;
  padding: 20px;
  text-align: center;
  font-size: 12px;
  color: #888;
`;

const BUTTON_STYLE = `
  display: inline-block;
  background-color: #003366;
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: bold;
  margin-top: 20px;
`;

/**
 * Obtiene el asunto del correo según el tipo
 */
function getSubject(type) {
  switch (type) {
    case "CIERRE_NOCTURNO": return "🌙 Aviso de Cierre Nocturno - Parkampus";
    case "LIBERACION_HORA_PICO": return "🚗 Solicitud de Liberación de Espacios - Hora Pico";
    case "CIERRE_SEGURIDAD": return "⚠️ ALERTA DE SEGURIDAD - Evacuación Preventiva";
    case "EVENTO_INSTITUCIONAL": return "🎉 Aviso de Evento Institucional - Restricciones";
    case "MANTENIMIENTO_EMERGENCIA": return "🛠️ Mantenimiento de Emergencia en Parqueaderos";
    default: return "📢 Notificación Importante de Parkampus";
  }
}

/**
 * Genera el contenido HTML del correo según el tipo de notificación
 */
function getEmailContent(type) {
  const title = getSubject(type);
  let message = "";
  let icon = ""; // Emoji o icono simple

  switch (type) {
    case "CIERRE_NOCTURNO":
      message = `
        <p>Estimado usuario,</p>
        <p>Le informamos que el campus cerrará sus puertas pronto. Por favor, asegúrese de retirar su vehículo antes de las <strong>10:00 PM</strong> para evitar inconvenientes.</p>
        <p>Agradecemos su colaboración para mantener la seguridad de las instalaciones.</p>
      `;
      icon = "🌙";
      break;

    case "LIBERACION_HORA_PICO":
      message = `
        <p>Hola,</p>
        <p>Estamos experimentando una alta demanda de estacionamiento en este momento. Si ya ha terminado sus actividades en el campus, le agradecemos liberar su espacio de parqueo para permitir el ingreso de otros compañeros.</p>
        <p>Su solidaridad mejora la movilidad de todos en Parkampus.</p>
      `;
      icon = "🚗";
      break;

    case "CIERRE_SEGURIDAD":
      message = `
        <p><strong>Atención:</strong></p>
        <p>Por motivos de seguridad, se requiere la evacuación preventiva de las zonas de parqueo. Por favor, diríjase a su vehículo y siga las instrucciones del personal de seguridad para una salida ordenada.</p>
        <p>Mantenga la calma y siga las rutas de evacuación señalizadas.</p>
      `;
      icon = "⚠️";
      break;

    case "EVENTO_INSTITUCIONAL":
      message = `
        <p>Estimada comunidad,</p>
        <p>Debido a un evento institucional masivo programado para hoy, algunas zonas de parqueo estarán reservadas o tendrán acceso restringido a partir de las <strong>2:00 PM</strong>.</p>
        <p>Recomendamos usar transporte alternativo o llegar con anticipación.</p>
      `;
      icon = "🎉";
      break;

    case "MANTENIMIENTO_EMERGENCIA":
      message = `
        <p>Aviso de Mantenimiento:</p>
        <p>Se están realizando reparaciones de emergencia en el Bloque B de parqueaderos. El acceso a esta zona está temporalmente suspendido.</p>
        <p>Por favor, utilice las zonas habilitadas en el Bloque A y C. Lamentamos los inconvenientes.</p>
      `;
      icon = "🛠️";
      break;

    default:
      message = `<p>Tiene un nuevo mensaje importante de la administración de parqueaderos.</p>`;
      icon = "📢";
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; ${BASE_STYLE}">
      <div style="${CONTAINER_STYLE}">
        <div style="${HEADER_STYLE}">
          <div style="font-size: 48px; margin-bottom: 10px;">${icon}</div>
          <h1 style="margin: 0; font-size: 24px;">${title}</h1>
        </div>
        <div style="${BODY_STYLE}">
          ${message}
          <div style="text-align: center;">
            <a href="#" style="${BUTTON_STYLE}">Abrir App Parkampus</a>
          </div>
        </div>
        <div style="${FOOTER_STYLE}">
          <p>© ${new Date().getFullYear()} Parkampus. Todos los derechos reservados.</p>
          <p>Este es un mensaje automático, por favor no responda a este correo.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Envía correos masivos a una lista de destinatarios
 * @param {Array} recipients - Array de objetos usuario ({ email, first_name })
 * @param {string} type - Tipo de notificación
 */
async function sendMassEmail(recipients, type) {
  if (!recipients || recipients.length === 0) {
    return { success: false, error: "No hay destinatarios" };
  }

  const htmlContent = getEmailContent(type);
  const subject = getSubject(type);
  const fromEmail = process.env.SMTP_USER || "isai.velez984@pascualbravo.edu.co";

  console.log(`📧 Iniciando envío masivo de correos. Tipo: ${type}, Destinatarios: ${recipients.length}`);

  let sentCount = 0;
  let failedCount = 0;
  const errors = [];

  const emailPromises = recipients.map(async (user) => {
    try {
      await transporter.sendMail({
        from: `"Parkampus Alertas" <${fromEmail}>`, // Usar el email autenticado
        to: user.email,
        subject: subject,
        html: htmlContent,
      });
      sentCount++;
    } catch (error) {
      console.error(`❌ Error enviando a ${user.email}:`, error.message);
      failedCount++;
      errors.push({ email: user.email, error: error.message });
    }
  });

  await Promise.all(emailPromises);

  console.log(`✅ Envío finalizado. Enviados: ${sentCount}, Fallidos: ${failedCount}`);

  return {
    success: true,
    sent: sentCount,
    failed: failedCount,
    total: recipients.length,
    errors: errors // Retornar errores para depuración
  };
}

module.exports = {
  sendMassEmail,
  getSubject,
};
