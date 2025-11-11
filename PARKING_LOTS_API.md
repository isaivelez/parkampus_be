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

## 📋 Endpoints Disponibles

| Método | Endpoint                | Descripción                            |
| ------ | ----------------------- | -------------------------------------- |
| POST   | `/api/parking-lots`     | Crear un nuevo parking lot             |
| GET    | `/api/parking-lots`     | Obtener todos los parking lots         |
| GET    | `/api/parking-lots/:id` | Obtener un parking lot por ID          |
| PUT    | `/api/parking-lots/:id` | Actualizar un parking lot completo     |
| PATCH  | `/api/parking-lots/:id` | Actualizar parcialmente un parking lot |
| DELETE | `/api/parking-lots/:id` | Eliminar un parking lot                |

---

## 1. CREATE - Crear Parking Lot

### POST `/api/parking-lots`

#### Body (JSON):

**Ejemplo 1: Parking lot básico**

```json
{
  "name": "Estacionamiento Bloque 27",
  "moto_available": 15,
  "car_available": 50
}
```

```json
{
  "name": "Estacionamiento Bloque 1",
  "moto_available": 20,
  "car_available": 0
}
```

**Ejemplo 2: Parking lot secundario**

```json
{
  "name": "Estacionamiento Bloque 2",
  "moto_available": 40,
  "car_available": 0
}
```

**Ejemplo 3: Parking lot pequeño**

```json
{
  "name": "Estacionamiento Visitantes",
  "moto_available": 10,
  "car_available": 20
}
```

**Ejemplo 4: Solo motos**

```json
{
  "name": "Zona de Motocicletas",
  "moto_available": 80,
  "car_available": 0
}
```

**Ejemplo 5: Solo carros**

```json
{
  "name": "Estacionamiento Vehiculos",
  "moto_available": 0,
  "car_available": 150
}
```

#### Respuesta Exitosa (201 Created):

```json
{
  "success": true,
  "message": "Parking lot creado exitosamente",
  "data": {
    "_id": "673f1a2b3c4d5e6f7a8b9c0d",
    "name": "Estacionamiento Principal",
    "moto_available": 50,
    "car_available": 100,
    "created_at": "2025-11-10T20:30:00.000Z",
    "updated_at": "2025-11-10T20:30:00.000Z"
  }
}
```

#### Respuesta de Error (400 Bad Request):

```json
{
  "success": false,
  "message": "Campos requeridos faltantes: name",
  "data": null
}
```

---

## 2. READ - Obtener todos los Parking Lots

### GET `/api/parking-lots`

#### Sin parámetros

#### Respuesta Exitosa (200 OK):

```json
{
  "success": true,
  "message": "Parking lots obtenidos exitosamente",
  "count": 3,
  "data": [
    {
      "_id": "673f1a2b3c4d5e6f7a8b9c0d",
      "name": "Estacionamiento Principal",
      "moto_available": 50,
      "car_available": 100,
      "created_at": "2025-11-10T20:30:00.000Z",
      "updated_at": "2025-11-10T20:30:00.000Z"
    },
    {
      "_id": "673f1a2b3c4d5e6f7a8b9c0e",
      "name": "Estacionamiento Norte",
      "moto_available": 30,
      "car_available": 75,
      "created_at": "2025-11-10T20:31:00.000Z",
      "updated_at": "2025-11-10T20:31:00.000Z"
    },
    {
      "_id": "673f1a2b3c4d5e6f7a8b9c0f",
      "name": "Estacionamiento Visitantes",
      "moto_available": 10,
      "car_available": 20,
      "created_at": "2025-11-10T20:32:00.000Z",
      "updated_at": "2025-11-10T20:32:00.000Z"
    }
  ]
}
```

---

## 3. READ - Obtener Parking Lot por ID

### GET `/api/parking-lots/:id`

#### URL de ejemplo:

```
GET http://192.168.40.67:3000/api/parking-lots/673f1a2b3c4d5e6f7a8b9c0d
```

#### Respuesta Exitosa (200 OK):

```json
{
  "success": true,
  "message": "Parking lot obtenido exitosamente",
  "data": {
    "_id": "673f1a2b3c4d5e6f7a8b9c0d",
    "name": "Estacionamiento Principal",
    "moto_available": 50,
    "car_available": 100,
    "created_at": "2025-11-10T20:30:00.000Z",
    "updated_at": "2025-11-10T20:30:00.000Z"
  }
}
```

#### Respuesta de Error (404 Not Found):

```json
{
  "success": false,
  "message": "Parking lot no encontrado",
  "data": null
}
```

---

## 4. UPDATE - Actualizar Parking Lot Completo

### PUT `/api/parking-lots/:id`

#### URL de ejemplo:

```
PUT http://192.168.40.67:3000/api/parking-lots/673f1a2b3c4d5e6f7a8b9c0d
```

#### Body (JSON):

**Actualizar todos los campos**

```json
{
  "name": "Estacionamiento Principal Renovado",
  "moto_available": 60,
  "car_available": 120
}
```

#### Respuesta Exitosa (200 OK):

```json
{
  "success": true,
  "message": "Parking lot actualizado exitosamente",
  "data": {
    "_id": "673f1a2b3c4d5e6f7a8b9c0d",
    "name": "Estacionamiento Principal Renovado",
    "moto_available": 60,
    "car_available": 120,
    "created_at": "2025-11-10T20:30:00.000Z",
    "updated_at": "2025-11-10T20:45:00.000Z"
  }
}
```

---

## 5. UPDATE - Actualizar Parking Lot Parcialmente

### PATCH `/api/parking-lots/:id`

#### URL de ejemplo:

```
PATCH http://192.168.40.67:3000/api/parking-lots/673f1a2b3c4d5e6f7a8b9c0d
```

#### Body (JSON):

**Actualizar solo espacios disponibles para motos**

```json
{
  "moto_available": 45
}
```

**Actualizar solo espacios disponibles para carros**

```json
{
  "car_available": 95
}
```

**Actualizar solo el nombre**

```json
{
  "name": "Estacionamiento Central"
}
```

**Actualizar múltiples campos**

```json
{
  "moto_available": 55,
  "car_available": 105
}
```

#### Respuesta Exitosa (200 OK):

```json
{
  "success": true,
  "message": "Parking lot actualizado exitosamente",
  "data": {
    "_id": "673f1a2b3c4d5e6f7a8b9c0d",
    "name": "Estacionamiento Central",
    "moto_available": 55,
    "car_available": 105,
    "created_at": "2025-11-10T20:30:00.000Z",
    "updated_at": "2025-11-10T20:50:00.000Z"
  }
}
```

---

## 6. DELETE - Eliminar Parking Lot

### DELETE `/api/parking-lots/:id`

#### URL de ejemplo:

```
DELETE http://192.168.40.67:3000/api/parking-lots/673f1a2b3c4d5e6f7a8b9c0d
```

#### Sin body

#### Respuesta Exitosa (200 OK):

```json
{
  "success": true,
  "message": "Parking lot eliminado exitosamente",
  "data": {
    "_id": "673f1a2b3c4d5e6f7a8b9c0d",
    "name": "Estacionamiento Principal",
    "moto_available": 50,
    "car_available": 100,
    "created_at": "2025-11-10T20:30:00.000Z",
    "updated_at": "2025-11-10T20:30:00.000Z"
  }
}
```

#### Respuesta de Error (404 Not Found):

```json
{
  "success": false,
  "message": "Parking lot no encontrado",
  "data": null
}
```

---

## 📝 Validaciones Implementadas

1. ✅ **name** es requerido y no puede estar vacío
2. ✅ **moto_available** debe ser un número >= 0 (default: 0)
3. ✅ **car_available** debe ser un número >= 0 (default: 0)
4. ✅ No se permiten nombres duplicados
5. ✅ Se agrega automáticamente `created_at` y `updated_at`

---

## 🧪 Comandos cURL para pruebas

### Crear parking lot:

```bash
curl -X POST http://192.168.40.67:3000/api/parking-lots \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Estacionamiento Principal",
    "moto_available": 50,
    "car_available": 100
  }'
```

### Obtener todos los parking lots:

```bash
curl -X GET http://192.168.40.67:3000/api/parking-lots
```

### Obtener parking lot por ID:

```bash
curl -X GET http://192.168.40.67:3000/api/parking-lots/673f1a2b3c4d5e6f7a8b9c0d
```

### Actualizar parking lot completo:

```bash
curl -X PUT http://192.168.40.67:3000/api/parking-lots/673f1a2b3c4d5e6f7a8b9c0d \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Estacionamiento Renovado",
    "moto_available": 60,
    "car_available": 120
  }'
```

### Actualizar parking lot parcialmente:

```bash
curl -X PATCH http://192.168.40.67:3000/api/parking-lots/673f1a2b3c4d5e6f7a8b9c0d \
  -H "Content-Type: application/json" \
  -d '{
    "moto_available": 45
  }'
```

### Eliminar parking lot:

```bash
curl -X DELETE http://192.168.40.67:3000/api/parking-lots/673f1a2b3c4d5e6f7a8b9c0d
```

---

## 📱 Colección de Postman

### Configuración de Variables en Postman:

1. Crea una variable de entorno `baseURL`:

   - **Local**: `http://localhost:3000`
   - **Network**: `http://192.168.40.67:3000`

2. Usa `{{baseURL}}/api/parking-lots` en tus requests

### Ejemplo de Request en Postman:

**POST** - Crear Parking Lot

- URL: `{{baseURL}}/api/parking-lots`
- Method: `POST`
- Headers:
  - `Content-Type`: `application/json`
- Body (raw, JSON):
  ```json
  {
    "name": "Estacionamiento Principal",
    "moto_available": 50,
    "car_available": 100
  }
  ```

**GET** - Listar todos

- URL: `{{baseURL}}/api/parking-lots`
- Method: `GET`

**GET** - Por ID

- URL: `{{baseURL}}/api/parking-lots/{{parking_lot_id}}`
- Method: `GET`

**PATCH** - Actualizar parcialmente

- URL: `{{baseURL}}/api/parking-lots/{{parking_lot_id}}`
- Method: `PATCH`
- Headers:
  - `Content-Type`: `application/json`
- Body (raw, JSON):
  ```json
  {
    "moto_available": 45
  }
  ```

**DELETE** - Eliminar

- URL: `{{baseURL}}/api/parking-lots/{{parking_lot_id}}`
- Method: `DELETE`

---

## 🔄 Flujo de Prueba Completo

1. **Crear** varios parking lots
2. **Listar** todos para ver los IDs generados
3. **Obtener** uno específico por ID
4. **Actualizar** los espacios disponibles
5. **Eliminar** uno cuando ya no sea necesario

---

## 🚀 Próximos Pasos

- Agregar paginación para GET all
- Implementar búsqueda por nombre
- Agregar estadísticas de ocupación
- Implementar reservas de espacios
