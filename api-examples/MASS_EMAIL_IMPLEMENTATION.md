# ✅ Sistema de Notificaciones Masivas por Correo

Se ha implementado el sistema de envío de correos masivos para notificar a estudiantes y empleados sobre eventos en el parqueadero.

## 📋 ¿Qué necesitas para que funcione en producción?

Para que los correos lleguen realmente a los usuarios, necesitas configurar un **servicio SMTP**. Actualmente está configurado para usar credenciales de entorno o fallar silenciosamente (como viste en la prueba).

Necesitas obtener los siguientes datos de tu proveedor de correo (Gmail, Outlook, AWS SES, SendGrid, etc.) y configurarlos en tu archivo `.env`:

```env
SMTP_HOST=smtp.gmail.com  # Ejemplo para Gmail
SMTP_PORT=587
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_contraseña_de_aplicacion
```

> **Nota:** Si usas Gmail, debes generar una "Contraseña de Aplicación" en la configuración de seguridad de tu cuenta de Google.

## 🚀 Endpoint Implementado

**POST** `/api/notifications/mass-email`

### Headers
- `Authorization`: `Bearer <token_celador>`
- `Content-Type`: `application/json`

### Body
```json
{
  "type": "CIERRE_NOCTURNO"
}
```

### ⏰ Lógica de Filtrado Temporal (Anti-Spam)

Para evitar enviar correos a personas que ya salieron del campus hace horas, el sistema aplica un **filtrado inteligente**:

**Solo reciben el correo los usuarios que:**
1. ✅ Tengan clase/trabajo el día actual
2. ✅ Estén en su **última hora de clase** O hasta **1 hora después** de que terminó su última clase

**Ejemplo:**
- Usuario con clase de 8:00 AM a 10:00 AM
  - ✅ Notificación a las 9:30 AM → **SÍ recibe** (está en la última hora)
  - ✅ Notificación a las 10:20 AM → **SÍ recibe** (terminó hace 20 min)
  - ❌ Notificación a las 11:30 AM → **NO recibe** (terminó hace más de 1 hora)
  - ❌ Notificación a las 8:30 AM → **NO recibe** (no es la última hora de clase)

### Historial de Envíos
Para listar los correos enviados (disponible para todos los usuarios autenticados):

**GET** `/api/notifications/history`

**Headers**
- `Authorization`: `Bearer <token_usuario>`

**Filtrado Inteligente:**
El historial se filtra automáticamente según tu horario para evitar sobrecarga de información.

**Para Estudiantes y Empleados:**
Solo verás notificaciones que:
1. ✅ Fueron enviadas en días donde tienes clase/trabajo
2. ✅ Fueron enviadas en tu última hora de clase O hasta 1 hora después

**Para Celadores:**
✅ Ven TODAS las notificaciones sin ningún filtrado (acceso completo al historial)

**Ejemplo (Estudiante/Empleado):**
Si tienes clase de 9:00 AM a 12:00 PM un Jueves:
- ✅ Verás notificaciones enviadas entre 11:00 AM y 1:00 PM ese Jueves
- ❌ NO verás notificaciones enviadas a las 3:00 PM ese Jueves
- ❌ NO verás notificaciones de otros días donde no tienes clase

**Respuesta**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "type": "CIERRE_NOCTURNO",
      "subject": "🌙 Aviso de Cierre Nocturno - Parkampus",
      "recipients_count": 148,
      "created_at": "2025-11-27T..."
    }
  ]
}
```
El backend seleccionará automáticamente el asunto y la plantilla HTML según el `type`:

1.  `CIERRE_NOCTURNO`: Recordatorio de cierre a las 10:00 PM.
2.  `LIBERACION_HORA_PICO`: Solicitud para liberar espacios.
3.  `CIERRE_SEGURIDAD`: Evacuación preventiva.
4.  `EVENTO_INSTITUCIONAL`: Restricciones por evento masivo.
5.  `MANTENIMIENTO_EMERGENCIA`: Cierre parcial por obras.

## 🎨 Plantillas de Correo
Se ha creado un diseño profesional (`services/emailService.js`) que:
-   Usa los colores institucionales (Azul Parkampus).
-   Es responsivo (se ve bien en móviles).
-   Incluye un icono relevante para cada tipo de mensaje.
-   Tiene un botón de llamada a la acción.

## 🧪 Verificación
Se creó un script de prueba `scripts/test-mass-email.js` que:
1.  Autentica a un Celador.
2.  Crea un estudiante con horario para el día actual.
3.  Envía la notificación y verifica la respuesta del servidor.

Resultado de la prueba: **Exitosa** (El endpoint procesa la solicitud y encuentra los usuarios correctos).
