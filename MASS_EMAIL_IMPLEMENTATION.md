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

### Tipos de Notificación Configuradas
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
