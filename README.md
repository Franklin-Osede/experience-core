# Experience Core

Plataforma de eventos de música House/Afrobeats con sistema de gestión de eventos, finanzas y marketplace de proveedores.

## 🚀 Inicio Rápido

### Opción 1: Usar el script de inicio (Recomendado)

```bash
# Levantar todos los servicios
./start.sh

# Detener todos los servicios
./stop.sh
```

El script `start.sh` automáticamente:
- ✅ Verifica y libera los puertos 4202 y 5555
- ✅ Crea el archivo `.env` del backend si no existe
- ✅ Instala dependencias si es necesario
- ✅ Inicia backend (puerto 5555) y frontend (puerto 4202)
- ✅ Muestra el estado de los servicios

### Opción 2: Inicio manual

#### Backend (Puerto 5555)

```bash
cd backend

# Crear .env si no existe
cat > .env << EOF
PORT=5555
NODE_ENV=development
JWT_SECRET=test-secret-key-minimum-32-characters-long-for-development
USE_TYPEORM=false
CORS_ORIGIN=http://localhost:4202
EOF

# Instalar dependencias (solo la primera vez)
npm install

# Iniciar servidor
npm run start:dev
```

#### Frontend (Puerto 4202)

```bash
cd frontend

# Instalar dependencias (solo la primera vez)
npm install

# Iniciar servidor
npm start
```

## 📍 URLs

Una vez iniciados los servicios:

- **Frontend**: http://localhost:4202
- **Backend API**: http://localhost:5555/api/v1
- **Swagger Docs**: http://localhost:5555/api/docs
- **Health Check**: http://localhost:5555/api/v1/health

## 📋 Requisitos

- Node.js 18+ 
- npm 9+
- (Opcional) PostgreSQL si usas `USE_TYPEORM=true`

## 🛠️ Scripts Disponibles

### `start.sh`
Levanta automáticamente backend y frontend en los puertos configurados.

### `stop.sh`
Detiene todos los servicios y libera los puertos.

## 📝 Logs

Los logs se guardan en:
- `logs/backend.log` - Logs del backend
- `logs/frontend.log` - Logs del frontend

Para ver los logs en tiempo real:
```bash
tail -f logs/backend.log
tail -f logs/frontend.log
```

## 🔧 Configuración

### Backend

El archivo `backend/.env` se crea automáticamente con valores por defecto. Para usar TypeORM con PostgreSQL, edita el archivo y configura:

```env
USE_TYPEORM=true
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=experience_core
```

### Frontend

El frontend está configurado para conectarse al backend en `http://localhost:5555/api/v1` (ver `frontend/src/environments/environment.ts`).

## 🐛 Solución de Problemas

### Los puertos están ocupados

El script `start.sh` intenta liberar los puertos automáticamente. Si persiste el problema:

```bash
# Ver qué proceso usa el puerto
lsof -i :4202
lsof -i :5555

# Matar el proceso manualmente
kill -9 <PID>
```

### El backend no inicia

1. Verifica que el archivo `backend/.env` existe y tiene `JWT_SECRET` configurado
2. Revisa los logs: `tail -f logs/backend.log`
3. Verifica que no haya errores de compilación TypeScript

### El frontend no inicia

1. Verifica que las dependencias estén instaladas: `cd frontend && npm install`
2. Revisa los logs: `tail -f logs/frontend.log`
3. Verifica que el puerto 4202 esté libre

## 📚 Documentación

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Configuración del Backend](./backend/ENV_VARIABLES.md)
- [Configuración del Frontend](./frontend/CONFIGURACION_FRONTEND.md)

## 🏗️ Estructura del Proyecto

```
experience-core/
├── backend/          # API NestJS
├── frontend/         # Aplicación Angular
├── start.sh          # Script de inicio
└── stop.sh           # Script de parada
```

