# Parkampus Backend - Ejemplos de API

## Endpoints de Usuarios

### Base URL

```
http://localhost:3000/api/users
```

## 1. Roles y Permisos

El sistema maneja los siguientes roles de usuario:

- **Estudiante (`estudiante`)**: Acceso básico. Puede ver parking lots y notificaciones.
- **Celador (`celador`)**: Acceso administrativo. Puede gestionar (crear, editar, eliminar) parking lots y enviar notificaciones.
- **Empleado (`empleado`)**: Acceso similar al estudiante (por definir permisos específicos).

## 2. Crear Usuario (POST /api/users)

> [!NOTE]
> Las contraseñas se hashean automáticamente antes de guardarse en la base de datos.

### Ejemplo 1: Estudiante

```json
{
  "first_name": "Juan",
  "last_name": "Pérez García",
  "email": "juan.perez@estudiante.edu.co",
  "password": "miPassword123",
  "user_type": "estudiante"
}
```

### Ejemplo 2: Celador

```json
{
  "first_name": "Carlos",
  "last_name": "Rodríguez",
  "email": "carlos.rodriguez@parkampus.com",
  "password": "celador2024",
  "user_type": "celador"
}
```

### Ejemplo 3: Empleado

```json
{
  "first_name": "María",
  "last_name": "González López",
  "email": "maria.gonzalez@universidad.edu.co",
  "password": "empleado456",
  "user_type": "empleado"
}
```

### Respuesta exitosa (201 Created):

```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "first_name": "Juan",
    "last_name": "Pérez García",
    "email": "juan.perez@estudiante.edu.co",
    "user_type": "estudiante",
    "created_at": "2024-11-10T15:30:00.000Z",
    "updated_at": "2024-11-10T15:30:00.000Z"
  }
}
```

### Respuesta de error (400 Bad Request):

```json
{
  "success": false,
  "message": "Tipo de usuario inválido. Debe ser: estudiante, celador o empleado",
  "data": null
}
```

## 2. Obtener Todos los Usuarios (GET /api/users)

### Respuesta exitosa (200 OK):

```json
{
  "success": true,
  "message": "Usuarios obtenidos exitosamente",
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "first_name": "Juan",
      "last_name": "Pérez García",
      "email": "juan.perez@estudiante.edu.co",
      "user_type": "estudiante",
      "created_at": "2024-11-10T15:30:00.000Z",
      "updated_at": "2024-11-10T15:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "first_name": "Carlos",
      "last_name": "Rodríguez",
      "email": "carlos.rodriguez@parkampus.com",
      "user_type": "celador",
      "created_at": "2024-11-10T15:31:00.000Z",
      "updated_at": "2024-11-10T15:31:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "first_name": "María",
      "last_name": "González López",
      "email": "maria.gonzalez@universidad.edu.co",
      "user_type": "empleado",
      "created_at": "2024-11-10T15:32:00.000Z",
      "updated_at": "2024-11-10T15:32:00.000Z"
    }
  ]
}
```

## 3. Obtener Usuario por ID (GET /api/users/:id)

### URL de ejemplo:

```
GET http://localhost:3000/api/users/507f1f77bcf86cd799439011
```

### Respuesta exitosa (200 OK):

```json
{
  "success": true,
  "message": "Usuario obtenido exitosamente",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "first_name": "Juan",
    "last_name": "Pérez García",
    "email": "juan.perez@estudiante.edu.co",
    "user_type": "estudiante",
    "created_at": "2024-11-10T15:30:00.000Z",
    "updated_at": "2024-11-10T15:30:00.000Z"
  }
}
```

## Comandos cURL para pruebas

### Crear usuario:

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Ana",
    "last_name": "Martínez",
    "email": "ana.martinez@estudiante.edu.co",
    "password": "password123",
    "user_type": "estudiante"
  }'
```

### Obtener todos los usuarios:

```bash
curl -X GET http://localhost:3000/api/users
```

### Obtener usuario por ID:

```bash
curl -X GET http://localhost:3000/api/users/507f1f77bcf86cd799439011
```

## Validaciones Implementadas

1. **Campos requeridos**: first_name, last_name, email, password, user_type
2. **Tipos de usuario válidos**: "estudiante", "celador", "empleado"
3. **Formato de email**: Validación con regex
4. **Email único**: No se permiten emails duplicados
5. **Seguridad**: Las contraseñas no se devuelven en las respuestas

## Cómo probar

1. Inicia el servidor: `npm run dev`
2. Usa Postman, Insomnia o cURL para hacer las peticiones
3. El servidor estará disponible en `http://localhost:3000`

---

## 4. Login de Usuario (POST /api/login)

### Endpoint:

```
POST http://localhost:3000/api/login
```

### Body del Request:

```json
{
  "email": "juan.perez@estudiante.edu.co",
  "password": "miPassword123"
}
```

### Respuesta exitosa (200 OK):

```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "first_name": "Juan",
      "last_name": "Pérez García",
      "email": "juan.perez@estudiante.edu.co",
      "user_type": "estudiante",
      "created_at": "2024-11-10T15:30:00.000Z",
      "updated_at": "2024-11-10T15:30:00.000Z"
    }
  }
}
```

> [!IMPORTANT]
> El token JWT devuelto debe enviarse en el header `Authorization` para acceder a rutas protegidas.

### Respuesta de error - Credenciales inválidas (401 Unauthorized):

```json
{
  "success": false,
  "message": "Credenciales inválidas",
  "data": null
}
```

### Respuesta de error - Campos faltantes (401 Unauthorized):

```json
{
  "success": false,
  "message": "Email y contraseña son requeridos",
  "data": null
}
```

### Comando cURL para Login:

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan.perez@estudiante.edu.co",
    "password": "miPassword123"
  }'
```

### Ejemplos de Login para diferentes tipos de usuarios:

**Login como Estudiante:**

```json
{
  "email": "juan.perez@estudiante.edu.co",
  "password": "miPassword123"
}
```

**Login como Celador:**

```json
{
  "email": "carlos.rodriguez@parkampus.com",
  "password": "celador2024"
}
```

**Login como Empleado:**

```json
{
  "email": "maria.gonzalez@universidad.edu.co",
  "password": "empleado456"
}
```

---

## 5. Rutas Protegidas

Para acceder a rutas protegidas, debes incluir el token en el header `Authorization`.

### Header:

```
Authorization: Bearer <tu_token_jwt>
```

### Ejemplo: Obtener Perfil (GET /api/users/profile)

```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Resumen de Endpoints

| Método | Endpoint         | Descripción                | Auth Requerida |
| ------ | ---------------- | -------------------------- | -------------- |
| POST   | `/api/users`     | Crear nuevo usuario        | No             |
| GET    | `/api/users`     | Obtener todos los usuarios | No             |
| GET    | `/api/users/:id` | Obtener usuario por ID     | No             |
| POST   | `/api/login`     | Autenticar usuario         | No             |
| GET    | `/api/users/profile` | Obtener perfil propio  | **Sí**         |
| GET    | `/health`        | Health check del servidor  | No             |

