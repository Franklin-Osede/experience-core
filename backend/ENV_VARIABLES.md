# Environment Variables

Crea un archivo `.env` en la raíz del proyecto `backend/` basándote en `.env.example`.

## Configuración Rápida

```bash
# Copiar template
cp .env.example .env

# Editar con tus valores
nano .env  # o tu editor preferido
```

## Variables Requeridas

### Siempre Requeridas
- `JWT_SECRET`: Clave secreta para JWT (mínimo 32 caracteres)
- `NODE_ENV`: Entorno (development, production, test)

### Condicionales (solo si USE_TYPEORM=true)
- `DB_HOST`: Host de PostgreSQL
- `DB_USERNAME`: Usuario de la base de datos
- `DB_PASSWORD`: Contraseña de la base de datos
- `DB_DATABASE`: Nombre de la base de datos

## Descripción Detallada

### Application Configuration
| Variable | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `NODE_ENV` | string | `development` | Entorno de ejecución |
| `PORT` | number | `5555` | Puerto del servidor |
| `CORS_ORIGIN` | string | `*` | Orígenes permitidos para CORS |

### TypeORM Configuration
| Variable | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `USE_TYPEORM` | string | `true` | `true` para BD, `false` para in-memory (testing) |

**Nota:** Cuando `USE_TYPEORM=false`, las variables `DB_*` son **opcionales** y no se validan.

### Database Configuration (Opcional si USE_TYPEORM=false)
| Variable | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `DB_HOST` | string | `localhost` | Host de PostgreSQL |
| `DB_PORT` | number | `5432` | Puerto de PostgreSQL |
| `DB_USERNAME` | string | - | Usuario de la base de datos |
| `DB_PASSWORD` | string | - | Contraseña de la base de datos |
| `DB_DATABASE` | string | - | Nombre de la base de datos |
| `DB_SYNCHRONIZE` | string | `false` | Auto-sincronizar esquema (⚠️ false en producción) |
| `DB_LOGGING` | string | `false` | Loggear queries SQL |
| `DB_MIGRATIONS_RUN` | string | `false` | Ejecutar migraciones al iniciar |

### JWT Configuration
| Variable | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `JWT_SECRET` | string | - | **REQUERIDA** - Clave secreta (mínimo 32 caracteres) |
| `JWT_EXPIRES_IN` | string | `7d` | Tiempo de expiración del token (ej: `7d`, `24h`) |

## Ejemplos de Configuración

### Desarrollo con Base de Datos
```env
NODE_ENV=development
PORT=5555
USE_TYPEORM=true
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=experience_core
JWT_SECRET=dev-secret-key-min-32-characters-long
```

### Testing sin Base de Datos
```env
NODE_ENV=test
PORT=5555
USE_TYPEORM=false
JWT_SECRET=test-secret-key-min-32-characters-long
# DB_* variables no son necesarias
```

### Producción
```env
NODE_ENV=production
PORT=5555
USE_TYPEORM=true
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-secure-password
DB_DATABASE=experience_core
DB_SYNCHRONIZE=false
DB_LOGGING=false
JWT_SECRET=your-production-secret-min-32-chars-very-secure
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://yourdomain.com
```

## Seguridad

⚠️ **IMPORTANTE:**
- Nunca commitees el archivo `.env` al repositorio
- Usa `.env.example` como template
- En producción, usa secretos seguros y variables de entorno del sistema
- `JWT_SECRET` debe ser una cadena aleatoria segura de al menos 32 caracteres





