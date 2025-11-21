# Parkampus - Documentación API Parking Lots

## Base URL

```
http://192.168.40.67:3000/api/parking-lots
```

o

```
http://localhost:3000/api/parking-lots
```

---

## 🔐 Autenticación y RBAC

Todas las rutas requieren autenticación mediante JWT.
El token debe enviarse en el header `Authorization`: `Bearer <token>`.

| Método | Endpoint                | Permisos Requeridos                    |
| ------ | ----------------------- | -------------------------------------- |
| POST   | `/api/parking-lots`     | **Celador** (Admin)                    |
| GET    | `/api/parking-lots`     | Todos los usuarios autenticados        |
| GET    | `/api/parking-lots/:id` | Todos los usuarios autenticados        |
| PUT    | `/api/parking-lots/:id` | **Celador** (Admin)                    |
| PATCH  | `/api/parking-lots/:id` | **Celador** (Admin)                    |
| DELETE | `/api/parking-lots/:id` | **Celador** (Admin)                    |

---

## 1. CREATE - Crear Parking Lot

### POST `/api/parking-lots`

#### Body (JSON):

**Ejemplo 1: Parking lot completo**

```json
{
  "name": "Estacionamiento Bloque 27",
  "moto_available": 15,
  "moto_max_available": 20,
  "car_available": 0,
  "car_max_available": 50
}
```

**Ejemplo 2: Solo motos**

```json
{
  "name": "Estacionamiento Bloque 1",
  "moto_available": 0,
  "moto_max_available": 30,
  "car_available": 0,
  "car_max_available": 0
}
```

#### Respuesta Exitosa (201 Created):

```json
{
  "success": true,
  "message": "Parking lot creado exitosamente",
  "data": {
    "_id": "6912cc038fed75578817df22",
    "name": "Estacionamiento Bloque 27",
    "moto_available": 15,
    "moto_max_available": 20,
    "car_available": 0,
    "car_max_available": 50,
    "created_at": "2025-11-11T05:39:15.246Z",
    "updated_at": "2025-11-11T05:39:15.246Z"
  }
}
```

#### Respuesta de Error (400 Bad Request):

```json
{
  "success": false,
  "message": "moto_available no puede ser mayor que moto_max_available",
  "data": null
}
```

---

## 2. READ - Obtener todos los Parking Lots

### GET `/api/parking-lots`

#### Respuesta Exitosa (200 OK):

```json
{
  "success": true,
  "message": "Parking lots obtenidos exitosamente",
  "count": 6,
  "data": [
    {
      "_id": "6912cc038fed75578817df22",
      "name": "Estacionamiento Bloque 27",
      "moto_available": 15,
      "car_available": 0,
      "created_at": "2025-11-11T05:39:15.246Z",
      "updated_at": "2025-11-21T21:56:17.196Z",
      "moto_max_available": 20,
      "car_max_available": 50
    },
    {
      "_id": "6912cc3e8fed75578817df23",
      "name": "Estacionamiento Bloque 1",
      "moto_available": 0,
      "car_available": 0,
      "created_at": "2025-11-11T05:40:14.726Z",
      "updated_at": "2025-11-20T23:02:03.172Z",
      "car_max_available": 0,
      "moto_max_available": 30
    },
    {
      "_id": "6912cc4b8fed75578817df24",
      "name": "Estacionamiento Bloque 2",
      "moto_available": 50,
      "car_available": 0,
      "created_at": "2025-11-11T05:40:27.109Z",
      "updated_at": "2025-11-11T11:41:29.964Z",
      "car_max_available": 0,
      "moto_max_available": 60
    },
    {
      "_id": "6912cca78fed75578817df25",
      "name": "Estacionamiento Piedras",
      "moto_available": 3,
      "car_available": 15,
      "created_at": "2025-11-11T05:41:59.214Z",
      "updated_at": "2025-11-21T20:11:00.554Z",
      "car_max_available": 15,
      "moto_max_available": 30
    },
    {
      "_id": "6912ccc08fed75578817df26",
      "name": "Estacionamiento Administrativos",
      "moto_available": 40,
      "car_available": 5,
      "created_at": "2025-11-11T05:42:24.347Z",
      "updated_at": "2025-11-11T05:42:24.347Z",
      "car_max_available": 30,
      "moto_max_available": 70
    },
    {
      "_id": "691357c27d3912a6109b8102",
      "name": "Porteria Pilarica",
      "moto_available": 0,
      "car_available": 0,
      "created_at": "2025-11-11T15:35:30.778Z",
      "updated_at": "2025-11-11T15:35:30.778Z",
      "car_max_available": 0,
      "moto_max_available": 80
    }
  ]
}
```

---

## 3. READ - Obtener Parking Lot por ID

### GET `/api/parking-lots/:id`

#### Respuesta Exitosa (200 OK):

```json
{
  "success": true,
  "message": "Parking lot obtenido exitosamente",
  "data": {
    "_id": "6912cc038fed75578817df22",
    "name": "Estacionamiento Bloque 27",
    "moto_available": 15,
    "car_available": 0,
    "moto_max_available": 20,
    "car_max_available": 50,
    "created_at": "2025-11-11T05:39:15.246Z",
    "updated_at": "2025-11-21T21:56:17.196Z"
  }
}
```

---

## 4. UPDATE - Actualizar Parking Lot Completo

### PUT `/api/parking-lots/:id`

#### Body (JSON):

```json
{
  "name": "Estacionamiento Bloque 27 Renovado",
  "moto_available": 18,
  "moto_max_available": 25,
  "car_available": 5,
  "car_max_available": 50
}
```

#### Respuesta Exitosa (200 OK):

```json
{
  "success": true,
  "message": "Parking lot actualizado exitosamente",
  "data": {
    "_id": "6912cc038fed75578817df22",
    "name": "Estacionamiento Bloque 27 Renovado",
    "moto_available": 18,
    "moto_max_available": 25,
    "car_available": 5,
    "car_max_available": 50,
    "created_at": "2025-11-11T05:39:15.246Z",
    "updated_at": "2025-11-21T22:00:00.000Z"
  }
}
```

---

## 5. UPDATE - Actualizar Parking Lot Parcialmente

### PATCH `/api/parking-lots/:id`

#### Body (JSON):

**Actualizar solo espacios disponibles**

```json
{
  "moto_available": 19
}
```

#### Respuesta Exitosa (200 OK):

```json
{
  "success": true,
  "message": "Parking lot actualizado exitosamente",
  "data": {
    "_id": "6912cc038fed75578817df22",
    "name": "Estacionamiento Bloque 27",
    "moto_available": 19,
    "moto_max_available": 20,
    "car_available": 0,
    "car_max_available": 50,
    "created_at": "2025-11-11T05:39:15.246Z",
    "updated_at": "2025-11-21T22:05:00.000Z"
  }
}
```

---

## 6. DELETE - Eliminar Parking Lot

### DELETE `/api/parking-lots/:id`

#### Respuesta Exitosa (200 OK):

```json
{
  "success": true,
  "message": "Parking lot eliminado exitosamente",
  "data": {
    "_id": "6912cc038fed75578817df22",
    "name": "Estacionamiento Bloque 27",
    "moto_available": 15,
    "moto_max_available": 20,
    "car_available": 0,
    "car_max_available": 50
  }
}
```

---

## 📝 Validaciones Implementadas

1. ✅ **name** es requerido y no puede estar vacío
2. ✅ **moto_available** debe ser un número >= 0 (default: 0)
3. ✅ **car_available** debe ser un número >= 0 (default: 0)
4. ✅ **moto_max_available** debe ser un número >= 0 (default: 0)
5. ✅ **car_max_available** debe ser un número >= 0 (default: 0)
6. ✅ **moto_available** no puede exceder **moto_max_available**
7. ✅ **car_available** no puede exceder **car_max_available**
8. ✅ No se permiten nombres duplicados
9. ✅ Se agrega automáticamente `created_at` y `updated_at`

---

## 🧪 Comandos cURL para pruebas

### Crear parking lot:

```bash
curl -X POST http://192.168.40.67:3000/api/parking-lots \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_CELADOR>" \
  -d '{
    "name": "Estacionamiento Principal",
    "moto_available": 50,
    "moto_max_available": 60,
    "car_available": 100,
    "car_max_available": 120
  }'
```

### Obtener todos los parking lots:

```bash
curl -X GET http://192.168.40.67:3000/api/parking-lots \
  -H "Authorization: Bearer <TOKEN_USUARIO>"
```

### Actualizar parking lot parcialmente:

```bash
curl -X PATCH http://192.168.40.67:3000/api/parking-lots/6912cc038fed75578817df22 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_CELADOR>" \
  -d '{
    "moto_available": 18
  }'
```

