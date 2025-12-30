# Environment Variables

Crea un archivo `.env` en la raíz del proyecto `backend/` con las siguientes variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=experience_core
DB_SYNCHRONIZE=false
DB_LOGGING=false

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Application Configuration
NODE_ENV=development
PORT=5555
CORS_ORIGIN=*

# TypeORM Configuration
USE_TYPEORM=true
```

## Descripción de Variables

### Database
- `DB_HOST`: Host de PostgreSQL (default: localhost)
- `DB_PORT`: Puerto de PostgreSQL (default: 5432)
- `DB_USERNAME`: Usuario de la base de datos
- `DB_PASSWORD`: Contraseña de la base de datos
- `DB_DATABASE`: Nombre de la base de datos
- `DB_SYNCHRONIZE`: Si TypeORM debe sincronizar el esquema automáticamente (false en producción)
- `DB_LOGGING`: Si TypeORM debe loggear queries (false en producción)

### JWT
- `JWT_SECRET`: Clave secreta para firmar tokens JWT (¡cambiar en producción!)
- `JWT_EXPIRES_IN`: Tiempo de expiración del token (default: 7d)

### Application
- `NODE_ENV`: Entorno de ejecución (development, production, test)
- `PORT`: Puerto donde corre la aplicación (default: 5555)
- `CORS_ORIGIN`: Orígenes permitidos para CORS (* para todos)

### TypeORM
- `USE_TYPEORM`: Si usar repositorios TypeORM o in-memory (true en producción)

