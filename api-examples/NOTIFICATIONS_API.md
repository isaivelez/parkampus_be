# Parkampus - Documentación API Notificaciones Push

## Base URL

```
http://192.168.40.67:3000/api/notifications
```

o

```
http://localhost:3000/api/notifications
```

---

## 📱 Sistema de Notificaciones Push con Expo

Este sistema permite enviar notificaciones push a aplicaciones móviles usando **Expo Push Notifications**. Las notificaciones se envían de forma síncrona e instantánea a todos los usuarios o a usuarios específicos.

### Características:

- ✅ Notificaciones push instantáneas a dispositivos móviles
- ✅ Envío broadcast a todos los usuarios
- ✅ Envío a usuarios específicos
- ✅ Filtrado por tipo de usuario (estudiante, celador, empleado)
- ✅ Historial de notificaciones enviadas
- ✅ Validación de tokens de Expo

---

## 🔐 Autenticación y RBAC

Todas las rutas requieren autenticación mediante JWT.
El token debe enviarse en el header `Authorization`: `Bearer <token>`.

| Método | Endpoint                            | Descripción                                | Permisos Requeridos                    |
| ------ | ----------------------------------- | ------------------------------------------ | -------------------------------------- |
| POST   | `/api/notifications/register-token` | Registrar token push de un dispositivo     | Todos los usuarios autenticados        |
| POST   | `/api/notifications/send-to-all`    | Enviar notificación a todos los usuarios   | **Celador** (Admin)                    |
| POST   | `/api/notifications/send-to-users`  | Enviar notificación a usuarios específicos | **Celador** (Admin)                    |
| GET    | `/api/notifications`                | Obtener historial de notificaciones        | Todos los usuarios autenticados        |
| GET    | `/api/notifications/:id`            | Obtener una notificación por ID            | Todos los usuarios autenticados        |
| DELETE | `/api/notifications/:id`            | Eliminar una notificación                  | **Celador** (Admin)                    |

---

## 🔐 1. Registrar Token Push (Frontend)

El frontend debe registrar el token de notificaciones push cuando el usuario inicia sesión o concede permisos.

### POST `/api/notifications/register-token`

#### Body (JSON):

```json
{
  "user_id": "673f1a2b3c4d5e6f7a8b9c0d",
  "expo_push_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

#### Respuesta Exitosa (200 OK):

```json
{
  "success": true,
  "message": "Token de notificaciones registrado exitosamente",
  "data": {
    "_id": "673f1a2b3c4d5e6f7a8b9c0d",
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan@universidad.edu",
    "user_type": "estudiante",
    "expo_push_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    "created_at": "2025-11-10T20:30:00.000Z",
    "updated_at": "2025-11-11T10:15:00.000Z"
  }
}
```

#### Respuesta de Error (400 Bad Request):

```json
{
  "success": false,
  "message": "Token de Expo Push inválido",
  "data": null
}
```

---

## 📢 2. Enviar Notificación a Todos

Envía una notificación push instantánea a todos los usuarios que tienen token registrado.

### POST `/api/notifications/send-to-all`

#### Body (JSON):

**Ejemplo 1: Notificación simple a todos**

```json
{
  "title": "Nuevo Estacionamiento Disponible",
  "message": "Se ha habilitado el estacionamiento del Bloque 27 con 50 espacios para carros."
}
```

**Ejemplo 2: Notificación con datos adicionales**

```json
{
  "title": "Alerta de Espacios",
  "message": "Solo quedan 5 espacios disponibles en el estacionamiento principal",
  "data": {
    "parking_lot_id": "673f1a2b3c4d5e6f7a8b9c0d",
    "available_spaces": 5,
    "type": "alert"
  }
}
```

**Ejemplo 3: Notificación solo para estudiantes**

```json
{
  "title": "Mantenimiento Programado",
  "message": "El estacionamiento de estudiantes estará cerrado mañana de 8am a 12pm",
  "user_type": "estudiante"
}
```

**Ejemplo 4: Notificación solo para celadores**

```json
{
  "title": "Cambio de Turno",
  "message": "Recordatorio: Cambio de turno a las 6:00 PM",
  "user_type": "celador",
  "data": {
    "shift_time": "18:00",
    "location": "Estacionamiento Principal"
  }
}
```

#### Respuesta Exitosa (200 OK):

```json
{
  "success": true,
  "message": "Notificación enviada exitosamente",
  "data": {
    "notification": {
      "_id": "673f2a3b4c5d6e7f8a9b0c1d",
      "title": "Nuevo Estacionamiento Disponible",
      "message": "Se ha habilitado el estacionamiento del Bloque 27",
      "data": {},
      "user_ids": [],
      "push_tokens": [
        "ExponentPushToken[xxx1]",
        "ExponentPushToken[xxx2]",
        "ExponentPushToken[xxx3]"
      ],
      "status": "sent",
      "sent_at": "2025-11-11T10:30:00.000Z",
      "created_at": "2025-11-11T10:30:00.000Z"
    },
    "sent_count": 3,
    "failed_count": 0,
    "total_count": 3
  }
}
```

#### Respuesta de Error (500 Internal Server Error):

```json
{
  "success": false,
  "message": "No hay usuarios con tokens de notificación activos",
  "data": null
}
```

---

## 📤 3. Enviar Notificación a Usuarios Específicos

Envía una notificación push solo a usuarios específicos.

### POST `/api/notifications/send-to-users`

#### Body (JSON):

**Ejemplo 1: Notificación a usuarios específicos**

```json
{
  "user_ids": [
    "673f1a2b3c4d5e6f7a8b9c0d",
    "673f1a2b3c4d5e6f7a8b9c0e",
    "673f1a2b3c4d5e6f7a8b9c0f"
  ],
  "title": "Reserva Confirmada",
  "message": "Tu espacio de estacionamiento ha sido reservado exitosamente"
}
```

**Ejemplo 2: Con datos adicionales**

```json
{
  "user_ids": ["673f1a2b3c4d5e6f7a8b9c0d"],
  "title": "Vehículo Bloqueado",
  "message": "Tu vehículo está bloqueando la salida. Por favor muévelo.",
  "data": {
    "parking_lot": "Estacionamiento Principal",
    "vehicle_plate": "ABC123",
    "priority": "high"
  }
}
```

#### Respuesta Exitosa (200 OK):

```json
{
  "success": true,
  "message": "Notificación enviada exitosamente",
  "data": {
    "notification": {
      "_id": "673f2a3b4c5d6e7f8a9b0c1e",
      "title": "Reserva Confirmada",
      "message": "Tu espacio de estacionamiento ha sido reservado",
      "data": {},
      "user_ids": ["673f1a2b3c4d5e6f7a8b9c0d", "673f1a2b3c4d5e6f7a8b9c0e"],
      "push_tokens": ["ExponentPushToken[xxx1]", "ExponentPushToken[xxx2]"],
      "status": "sent",
      "sent_at": "2025-11-11T10:35:00.000Z",
      "created_at": "2025-11-11T10:35:00.000Z"
    },
    "sent_count": 2,
    "failed_count": 0,
    "total_count": 2
  }
}
```

---

## 📋 4. Obtener Historial de Notificaciones

### GET `/api/notifications`

#### Query Parameters (opcionales):

- `user_id` - Filtrar notificaciones de un usuario específico
- `status` - Filtrar por status (pending, sending, sent, partial, failed)

#### Ejemplos de URLs:

```
GET http://192.168.40.67:3000/api/notifications
GET http://192.168.40.67:3000/api/notifications?status=sent
GET http://192.168.40.67:3000/api/notifications?user_id=673f1a2b3c4d5e6f7a8b9c0d
```

#### Respuesta Exitosa (200 OK):

```json
{
  "success": true,
  "message": "Notificaciones obtenidas exitosamente",
  "count": 2,
  "data": [
    {
      "_id": "673f2a3b4c5d6e7f8a9b0c1d",
      "title": "Nuevo Estacionamiento Disponible",
      "message": "Se ha habilitado el estacionamiento del Bloque 27",
      "data": {},
      "user_ids": [],
      "push_tokens": ["ExponentPushToken[xxx1]", "ExponentPushToken[xxx2]"],
      "status": "sent",
      "sent_at": "2025-11-11T10:30:00.000Z",
      "created_at": "2025-11-11T10:30:00.000Z"
    },
    {
      "_id": "673f2a3b4c5d6e7f8a9b0c1e",
      "title": "Alerta de Espacios",
      "message": "Solo quedan 5 espacios disponibles",
      "data": { "available_spaces": 5 },
      "user_ids": [],
      "push_tokens": ["ExponentPushToken[xxx1]"],
      "status": "sent",
      "sent_at": "2025-11-11T10:25:00.000Z",
      "created_at": "2025-11-11T10:25:00.000Z"
    }
  ]
}
```

---

## 🔍 5. Obtener Notificación por ID

### GET `/api/notifications/:id`

#### URL de ejemplo:

```
GET http://192.168.40.67:3000/api/notifications/673f2a3b4c5d6e7f8a9b0c1d
```

#### Respuesta Exitosa (200 OK):

```json
{
  "success": true,
  "message": "Notificación obtenida exitosamente",
  "data": {
    "_id": "673f2a3b4c5d6e7f8a9b0c1d",
    "title": "Nuevo Estacionamiento Disponible",
    "message": "Se ha habilitado el estacionamiento del Bloque 27",
    "data": {},
    "user_ids": [],
    "push_tokens": ["ExponentPushToken[xxx1]", "ExponentPushToken[xxx2]"],
    "status": "sent",
    "sent_at": "2025-11-11T10:30:00.000Z",
    "created_at": "2025-11-11T10:30:00.000Z"
  }
}
```

---

## 🗑️ 6. Eliminar Notificación

### DELETE `/api/notifications/:id`

#### URL de ejemplo:

```
DELETE http://192.168.40.67:3000/api/notifications/673f2a3b4c5d6e7f8a9b0c1d
```

#### Respuesta Exitosa (200 OK):

```json
{
  "success": true,
  "message": "Notificación eliminada exitosamente",
  "data": {
    "_id": "673f2a3b4c5d6e7f8a9b0c1d",
    "title": "Nuevo Estacionamiento Disponible",
    "message": "Se ha habilitado el estacionamiento del Bloque 27",
    "status": "sent"
  }
}
```

---

## 🧪 Comandos cURL para pruebas

### Registrar token push:

```bash
curl -X POST http://192.168.40.67:3000/api/notifications/register-token \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "673f1a2b3c4d5e6f7a8b9c0d",
    "expo_push_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
  }'
```

### Enviar notificación a todos:

```bash
curl -X POST http://192.168.40.67:3000/api/notifications/send-to-all \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Nuevo Estacionamiento",
    "message": "Se ha habilitado el estacionamiento del Bloque 27"
  }'
```

### Enviar notificación solo a estudiantes:

```bash
curl -X POST http://192.168.40.67:3000/api/notifications/send-to-all \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mantenimiento",
    "message": "El estacionamiento estará cerrado mañana",
    "user_type": "estudiante"
  }'
```

### Enviar notificación a usuarios específicos:

```bash
curl -X POST http://192.168.40.67:3000/api/notifications/send-to-users \
  -H "Content-Type: application/json" \
  -d '{
    "user_ids": ["673f1a2b3c4d5e6f7a8b9c0d", "673f1a2b3c4d5e6f7a8b9c0e"],
    "title": "Reserva Confirmada",
    "message": "Tu espacio ha sido reservado"
  }'
```

### Obtener historial:

```bash
curl -X GET http://192.168.40.67:3000/api/notifications
```

### Obtener notificación por ID:

```bash
curl -X GET http://192.168.40.67:3000/api/notifications/673f2a3b4c5d6e7f8a9b0c1d
```

---

## 📱 Integración en el Frontend (React Native/Expo)

### 1. Instalar dependencias en el frontend:

```bash
npx expo install expo-notifications expo-device expo-constants
```

### 2. Solicitar permisos y obtener token:

```javascript
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }

    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig.extra.eas.projectId,
      })
    ).data;

    console.log("Push Token:", token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token;
}
```

### 3. Registrar el token en el backend:

```javascript
async function registerPushToken(userId, token) {
  try {
    const response = await fetch(
      "http://192.168.40.67:3000/api/notifications/register-token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          expo_push_token: token,
        }),
      }
    );

    const data = await response.json();
    console.log("Token registered:", data);
  } catch (error) {
    console.error("Error registering token:", error);
  }
}
```

### 4. Configurar el listener de notificaciones:

```javascript
import { useEffect, useRef } from 'react';

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Listener cuando llega una notificación
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listener cuando el usuario toca la notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      const data = response.notification.request.content.data;
      // Navegar o realizar acción según los datos
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    // Tu app aquí
  );
}
```

---

## 📊 Estados de Notificaciones

| Status    | Descripción                                       |
| --------- | ------------------------------------------------- |
| `pending` | Notificación creada pero aún no enviada           |
| `sending` | Notificación en proceso de envío                  |
| `sent`    | Notificación enviada exitosamente a todos         |
| `partial` | Notificación enviada pero algunos tokens fallaron |
| `failed`  | Notificación falló completamente                  |

---

## ⚠️ Notas Importantes

1. **Tokens de Expo**: Los tokens tienen el formato `ExponentPushToken[xxxxxx]` o `ExpoPushToken[xxxxxx]`

2. **Límites de Expo**:

   - Máximo 100 notificaciones por request
   - El servicio las envía en chunks automáticamente

3. **Validación**:

   - Siempre valida que el token sea válido antes de registrarlo
   - Los tokens pueden expirar, el frontend debe actualizarlos

4. **Broadcast vs Específicos**:

   - `send-to-all`: Array `user_ids` vacío indica broadcast
   - `send-to-users`: Array `user_ids` con IDs específicos

5. **Filtro por tipo**:
   - Puedes enviar a todos los `estudiante`, `celador` o `empleado`
   - Usa el parámetro `user_type` en `send-to-all`

---

## 🔄 Flujo Completo

### En el Frontend:

1. Usuario inicia sesión
2. App solicita permisos de notificaciones
3. Obtiene el Expo Push Token
4. Registra el token con el `user_id` en el backend

### En el Backend:

1. Recibe el token y lo guarda en el usuario
2. Cuando necesitas enviar una notificación:
   - Llamas a `/api/notifications/send-to-all` o `send-to-users`
   - El backend obtiene todos los tokens activos
   - Envía las notificaciones push usando Expo
   - Guarda el registro en la BD

### En el Dispositivo:

1. Expo recibe la notificación
2. La muestra al usuario instantáneamente
3. Usuario puede tocarla para abrir la app

---

## 🚀 Casos de Uso

### 1. Notificar nuevos espacios disponibles:

```json
POST /api/notifications/send-to-all
{
  "title": "🅿️ Espacios Disponibles",
  "message": "15 nuevos espacios en Estacionamiento Principal"
}
```

### 2. Alertar sobre vehículo mal estacionado:

```json
POST /api/notifications/send-to-users
{
  "user_ids": ["user_id_del_propietario"],
  "title": "⚠️ Alerta de Estacionamiento",
  "message": "Tu vehículo está mal estacionado. Por favor muévelo."
}
```

### 3. Mantenimiento programado:

```json
POST /api/notifications/send-to-all
{
  "title": "🔧 Mantenimiento",
  "message": "El estacionamiento estará cerrado mañana de 8am a 12pm",
  "user_type": "estudiante"
}
```
