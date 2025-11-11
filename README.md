# Parkampus Backend

Backend API para el sistema de gestión de estacionamiento Parkampus.

## 🚀 Tecnologías

- Node.js v20.19.4
- Express v5.1.0
- CORS
- dotenv

## 📦 Instalación

```bash
npm install
```

## 🏃‍♂️ Ejecución

### Modo desarrollo (con hot-reload)

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

## 🔍 Endpoints

### Health Check

```
GET /health
```

Respuesta:

```json
{
  "status": "OK",
  "message": "🚀 Parkampus Backend está funcionando correctamente",
  "timestamp": "2025-11-10T...",
  "uptime": 123.456
}
```

### Información de la API

```
GET /
```

Respuesta:

```json
{
  "message": "¡Bienvenido a Parkampus Backend API!",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health"
  }
}
```

## 🌐 Puerto

Por defecto, el servidor corre en el puerto `3000`. Puedes modificarlo en el archivo `.env`:

```
PORT=3000
```

## 📝 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
PORT=3000
NODE_ENV=development
```
