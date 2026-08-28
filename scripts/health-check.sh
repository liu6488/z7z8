#!/bin/bash
set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# 本地开发模式 (前后端直跑) 的健康检查
API_BASE="${API_BASE:-http://localhost:3000/api}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"

echo "Running health checks..."

# 检查后端 API
if curl -sf "$API_BASE/health" > /dev/null 2>&1; then
    echo -e "${GREEN}[OK] Backend API is healthy${NC}"
else
    echo -e "${RED}[FAIL] Backend API is not responding at $API_BASE/health${NC}"
    exit 1
fi

# 检查数据库连通 (health 端点内部包含 DB 检查)
HEALTH=$(curl -sf "$API_BASE/health")
if echo "$HEALTH" | grep -q '"database":true'; then
    echo -e "${GREEN}[OK] Database is healthy${NC}"
else
    echo -e "${RED}[FAIL] Database check failed: $HEALTH${NC}"
    exit 1
fi

# 检查前端
if curl -sf "$FRONTEND_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}[OK] Frontend is accessible${NC}"
else
    echo -e "${RED}[FAIL] Frontend is not responding at $FRONTEND_URL${NC}"
    exit 1
fi

echo -e "${GREEN}All services are healthy!${NC}"
