# 🐳 Docker Guide - Experience Core Backend

## 📋 Descripción

Configuración Docker para ejecutar el backend con PostgreSQL en contenedores.

---

## 🚀 Inicio Rápido

### Producción

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Detener
docker-compose down
```

### Desarrollo

```bash
# Iniciar con hot reload
docker-compose -f docker-compose.dev.yml up

# Solo base de datos (desarrollo local)
docker-compose up postgres
```

---

## 📦 Servicios

### PostgreSQL
- **Puerto:** 5432
- **Usuario:** postgres
- **Password:** postgres
- **Base de datos:** experience_core
- **Volumen:** `postgres_data` (persistente)

### Backend
- **Puerto:** 5555
- **Health check:** `http://localhost:5555/health`
- **Swagger:** `http://localhost:5555/api/docs`

---

## 🔧 Comandos Útiles

### Migraciones

```bash
# Ejecutar migraciones
docker-compose exec backend npm run migration:run

# Ver estado de migraciones
docker-compose exec backend npm run migration:show

# Revertir última migración
docker-compose exec backend npm run migration:revert
```

### Seeds

```bash
# Ejecutar seeds
docker-compose exec backend npm run seed
```

### Logs

```bash
# Ver logs del backend
docker-compose logs -f backend

# Ver logs de PostgreSQL
docker-compose logs -f postgres

# Ver todos los logs
docker-compose logs -f
```

### Base de Datos

```bash
# Conectarse a PostgreSQL
docker-compose exec postgres psql -U postgres -d experience_core

# Backup de base de datos
docker-compose exec postgres pg_dump -U postgres experience_core > backup.sql

# Restaurar base de datos
docker-compose exec -T postgres psql -U postgres experience_core < backup.sql
```

### Rebuild

```bash
# Rebuild imagen del backend
docker-compose build backend

# Rebuild sin cache
docker-compose build --no-cache backend
```

---

## 🔐 Variables de Entorno

### Producción (docker-compose.yml)

Las variables se pueden configurar en `.env` o directamente en `docker-compose.yml`:

```yaml
environment:
  JWT_SECRET: ${JWT_SECRET:-change-this-secret-in-production}
  # ... otras variables
```

### Desarrollo (docker-compose.dev.yml)

Similar pero con valores de desarrollo por defecto.

---

## 📝 Notas

- **Volúmenes:** Los datos de PostgreSQL se persisten en `postgres_data` volume
- **Hot Reload:** Solo disponible en `docker-compose.dev.yml`
- **Migraciones:** Se ejecutan automáticamente al iniciar (si `DB_MIGRATIONS_RUN=true`)
- **Health Checks:** Ambos servicios tienen health checks configurados

---

## 🐛 Troubleshooting

### Puerto ya en uso

```bash
# Cambiar puerto en docker-compose.yml
ports:
  - '5556:5555'  # Cambiar 5555 a 5556
```

### Limpiar todo

```bash
# Detener y eliminar contenedores, volúmenes
docker-compose down -v

# Eliminar imágenes
docker-compose down --rmi all
```

### Rebuild completo

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

---

**Última actualización:** $(date)

