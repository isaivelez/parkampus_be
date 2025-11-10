# Parkampus Backend - Ejemplos de API

## Endpoints de Usuarios

### Base URL

```
http://localhost:3000/api/users
```

## 1. Crear Usuario (POST /api/users)

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
