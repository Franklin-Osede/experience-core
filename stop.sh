#!/bin/bash

# Script para detener los servicios de Experience Core

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🛑 Deteniendo servicios...${NC}"

# Matar procesos de nest
pkill -f "nest start.*experience-core" 2>/dev/null && echo -e "${GREEN}✅ Backend detenido${NC}" || echo -e "${RED}⚠️  Backend no estaba corriendo${NC}"

# Matar procesos de ng serve
pkill -f "ng serve.*4202" 2>/dev/null && echo -e "${GREEN}✅ Frontend detenido${NC}" || echo -e "${RED}⚠️  Frontend no estaba corriendo${NC}"

# Matar procesos en los puertos
for port in 4202 5555; do
    pids=$(lsof -ti :$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        kill -9 $pids 2>/dev/null
        echo -e "${GREEN}✅ Puerto $port liberado${NC}"
    fi
done

sleep 1
echo -e "${GREEN}✅ Todos los servicios detenidos${NC}"

