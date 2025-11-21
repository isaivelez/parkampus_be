# Configuración de Red - Parkampus Backend

## Configuración actual en `.env`

```env
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
```

## ¿Qué significa HOST=0.0.0.0?

Cuando configuramos `HOST=0.0.0.0`, el servidor escucha en **todas las interfaces de red disponibles**, lo que permite:

- ✅ Acceso desde `localhost` (127.0.0.1)
- ✅ Acceso desde la IP local de tu computadora en la red (ej: 192.168.x.x)
- ✅ Acceso desde otros dispositivos en la misma red (móviles, tablets, etc.)

## Cómo cambiar la configuración

### 1. Para acceso solo local (no accesible desde otros dispositivos)

```env
HOST=localhost
# o
HOST=127.0.0.1
```

### 2. Para acceso en toda la red local (recomendado para desarrollo con móviles)

```env
HOST=0.0.0.0
```

### 3. Para cambiar el puerto

```env
PORT=8080  # o cualquier otro puerto disponible
```

## Obtener tu IP local

### En macOS/Linux:

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### En Windows:

```bash
ipconfig
```

### Desde el servidor Node.js:

El servidor automáticamente detecta y muestra tu IP local al iniciar.

## Acceso desde dispositivos móviles

1. **Asegúrate que el servidor esté corriendo**

   ```bash
   npm run dev
   ```

2. **Verifica que tu móvil esté en la misma red WiFi que tu computadora**

3. **Usa la IP mostrada en la consola**

   ```
   📱 Acceso desde Red (Dispositivos externos):
   http://192.168.1.100:3000
   ```

4. **Configura tu app móvil para usar esta URL**
   - Base URL: `http://[TU_IP_LOCAL]:3000`
   - Endpoints:
     - Login: `http://[TU_IP_LOCAL]:3000/api/login`
     - Usuarios: `http://[TU_IP_LOCAL]:3000/api/users`

## Firewall y Seguridad

### macOS:

Si tienes problemas de conexión, verifica el firewall:

1. Ve a **System Preferences** > **Security & Privacy** > **Firewall**
2. Asegúrate de permitir conexiones entrantes para Node.js

### Windows:

1. Ve a **Windows Defender Firewall**
2. Permite Node.js a través del firewall

## Solución de problemas

### El móvil no puede conectarse:

- ✅ Verifica que ambos dispositivos estén en la misma red WiFi
- ✅ Verifica que el firewall no esté bloqueando el puerto
- ✅ Usa `http://` no `https://`
- ✅ Verifica que la IP sea correcta
- ✅ Reinicia el servidor

### Cambiar la IP manualmente:

Si quieres especificar una IP específica en lugar de `0.0.0.0`:

```env
HOST=192.168.1.100
```

⚠️ Nota: Esto limitará el acceso solo a esa interfaz de red específica.

## Ejemplo de configuración para producción

Para producción, considera usar variables de entorno más específicas:

```env
# Desarrollo
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

# Producción (ejemplo)
# PORT=80
# HOST=0.0.0.0
# NODE_ENV=production
```

## URLs de ejemplo según tu red

El servidor mostrará automáticamente las URLs disponibles al iniciar:

```
🚀 ==========================================
   Servidor Parkampus Backend INICIADO
============================================
📍 Host: 0.0.0.0
🔌 Puerto: 3000

🌐 Acceso Local:
   http://localhost:3000

📱 Acceso desde Red (Dispositivos externos):
   http://192.168.1.100:3000

📋 Endpoints disponibles:
   • Health Check: http://192.168.1.100:3000/health
   • Usuarios:     http://192.168.1.100:3000/api/users
   • Login:        http://192.168.1.100:3000/api/login
============================================
```
