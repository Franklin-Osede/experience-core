#!/bin/bash

# Script para levantar el proyecto Experience Core
# Frontend en puerto 4202, Backend en puerto 5555

set -e

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Puertos
FRONTEND_PORT=4202
BACKEND_PORT=5555

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Experience Core - Startup Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Puerto ocupado
    else
        return 1  # Puerto libre
    fi
}

# Función para matar procesos en un puerto
kill_port() {
    local port=$1
    local pids=$(lsof -ti :$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}⚠️  Matando procesos en puerto $port...${NC}"
        kill -9 $pids 2>/dev/null || true
        sleep 2
    fi
}

# Verificar y limpiar puertos
echo -e "${YELLOW}🔍 Verificando puertos...${NC}"
if check_port $FRONTEND_PORT; then
    echo -e "${YELLOW}⚠️  Puerto $FRONTEND_PORT está ocupado${NC}"
    kill_port $FRONTEND_PORT
fi

if check_port $BACKEND_PORT; then
    echo -e "${YELLOW}⚠️  Puerto $BACKEND_PORT está ocupado${NC}"
    kill_port $BACKEND_PORT
fi

# Matar procesos existentes de nest y ng
echo -e "${YELLOW}🧹 Limpiando procesos existentes...${NC}"
pkill -f "nest start.*experience-core" 2>/dev/null || true
pkill -f "ng serve.*4202" 2>/dev/null || true
sleep 2

# Verificar que estamos en el directorio correcto
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Error: Este script debe ejecutarse desde la raíz del proyecto${NC}"
    exit 1
fi

# Configurar .env del backend si no existe
echo -e "${YELLOW}⚙️  Configurando backend...${NC}"
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}📝 Creando backend/.env...${NC}"
    cat > backend/.env << EOF
# Backend Configuration
PORT=$BACKEND_PORT
NODE_ENV=development

# JWT Configuration
JWT_SECRET=test-secret-key-minimum-32-characters-long-for-development

# Database Configuration (TypeORM deshabilitado por defecto para desarrollo rápido)
USE_TYPEORM=false

# Si quieres usar TypeORM, descomenta y configura:
# USE_TYPEORM=true
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=postgres
# DB_DATABASE=experience_core

# CORS
CORS_ORIGIN=http://localhost:$FRONTEND_PORT
EOF
    echo -e "${GREEN}✅ backend/.env creado${NC}"
else
    echo -e "${GREEN}✅ backend/.env ya existe${NC}"
fi

# Verificar dependencias del backend
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependencias del backend...${NC}"
    cd backend
    npm install
    cd ..
else
    echo -e "${GREEN}✅ Dependencias del backend instaladas${NC}"
fi

# Verificar dependencias del frontend
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependencias del frontend...${NC}"
    cd frontend
    npm install
    cd ..
else
    echo -e "${GREEN}✅ Dependencias del frontend instaladas${NC}"
fi

# Crear directorio para logs si no existe
mkdir -p logs

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Deteniendo servicios...${NC}"
    pkill -f "nest start.*experience-core" 2>/dev/null || true
    pkill -f "ng serve.*4202" 2>/dev/null || true
    kill_port $FRONTEND_PORT
    kill_port $BACKEND_PORT
    echo -e "${GREEN}✅ Servicios detenidos${NC}"
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT SIGTERM

# Iniciar backend
echo ""
echo -e "${BLUE}🚀 Iniciando Backend (puerto $BACKEND_PORT)...${NC}"
cd backend
npm run start:dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Iniciar frontend
echo -e "${BLUE}🚀 Iniciando Frontend (puerto $FRONTEND_PORT)...${NC}"
cd frontend
npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Esperar a que los servicios inicien
echo ""
echo -e "${YELLOW}⏳ Esperando a que los servicios inicien...${NC}"

# Verificar backend
BACKEND_READY=false
for i in {1..30}; do
    sleep 2
    if check_port $BACKEND_PORT; then
        if curl -s http://localhost:$BACKEND_PORT/api/v1/health >/dev/null 2>&1 || curl -s http://localhost:$BACKEND_PORT >/dev/null 2>&1; then
            BACKEND_READY=true
            break
        fi
    fi
    echo -n "."
done

# Verificar frontend
FRONTEND_READY=false
for i in {1..30}; do
    sleep 2
    if check_port $FRONTEND_PORT; then
        if curl -s http://localhost:$FRONTEND_PORT >/dev/null 2>&1; then
            FRONTEND_READY=true
            break
        fi
    fi
    echo -n "."
done

echo ""
echo ""

# Mostrar estado
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Estado de los Servicios${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

if [ "$BACKEND_READY" = true ]; then
    echo -e "${GREEN}✅ Backend:${NC}  http://localhost:$BACKEND_PORT"
    echo -e "   ${GREEN}Swagger:${NC}  http://localhost:$BACKEND_PORT/api/docs"
else
    echo -e "${RED}❌ Backend:${NC}  No responde (revisa logs/backend.log)"
fi

if [ "$FRONTEND_READY" = true ]; then
    echo -e "${GREEN}✅ Frontend:${NC} http://localhost:$FRONTEND_PORT"
else
    echo -e "${RED}❌ Frontend:${NC} No responde (revisa logs/frontend.log)"
fi

echo ""
echo -e "${YELLOW}📋 Logs:${NC}"
echo "   Backend:  tail -f logs/backend.log"
echo "   Frontend: tail -f logs/frontend.log"
echo ""
echo -e "${YELLOW}💡 Presiona Ctrl+C para detener los servicios${NC}"
echo ""

# Mantener el script corriendo
wait

