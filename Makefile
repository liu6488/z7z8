.PHONY: dev up down logs clean setup migrate seed studio test health help

DOCKER_COMPOSE = docker compose -f docker/docker-compose.yml --env-file docker/.env
DOCKER_COMPOSE_DEV = docker compose -f docker/docker-compose.dev.yml --env-file docker/.env

# ==========================================
# 开发命令
# ==========================================

## 首次环境初始化
setup:
	@echo "Initializing project environment..."
	@if [ ! -f docker/.env ]; then \
		cp docker/.env.example docker/.env; \
		echo "Created docker/.env from example"; \
	fi
	@cd backend && npm install && npx prisma generate
	@cd frontend && npm install
	@echo "Setup complete."

## 启动开发环境 (仅中间件, 前后端本地直跑)
dev:
	@echo "Starting development middleware..."
	$(DOCKER_COMPOSE_DEV) up -d --wait
	@echo "Middleware ready. Run 'cd backend && npm run dev' and 'cd frontend && npm run dev'"

## 本地快速启动 (无 Docker 场景: SQLite + 前后端 dev server)
run-local:
	@cd backend && npm install && npx prisma migrate dev && npm run db:seed
	@cd frontend && npm install

## 启动完整生产环境
up:
	@echo "Starting full production environment..."
	$(DOCKER_COMPOSE) up -d --build --wait
	@echo "All services started. Access: http://localhost"

## 停止所有服务
down:
	@echo "Stopping all services..."
	$(DOCKER_COMPOSE) down
	$(DOCKER_COMPOSE_DEV) down

## 查看日志
logs:
	$(DOCKER_COMPOSE) logs -f

## 清理所有数据 (危险!)
clean:
	@echo "Cleaning all containers and volumes..."
	$(DOCKER_COMPOSE) down -v
	$(DOCKER_COMPOSE_DEV) down -v
	@rm -rf docker/data

# ==========================================
# 数据库命令
# ==========================================

migrate:
	cd backend && npx prisma migrate dev

migrate-deploy:
	cd backend && npx prisma migrate deploy

generate:
	cd backend && npx prisma generate

seed:
	cd backend && npx prisma db seed

studio:
	cd backend && npx prisma studio

# ==========================================
# 测试与验证
# ==========================================

test:
	@echo "Running connectivity tests..."
	@bash scripts/test-connectivity.sh

health:
	@bash scripts/health-check.sh

# ==========================================
# 帮助
# ==========================================

help:
	@echo "Available commands:"
	@echo "  make setup         - 首次环境初始化"
	@echo "  make dev           - 启动开发中间件 (Docker)"
	@echo "  make run-local     - 本地无 Docker 快速启动 (SQLite)"
	@echo "  make up            - 启动完整生产环境 (Docker)"
	@echo "  make down          - 停止所有服务"
	@echo "  make logs          - 查看服务日志"
	@echo "  make clean         - 清理所有容器和数据"
	@echo "  make migrate       - 运行数据库迁移"
	@echo "  make seed          - 注入种子数据"
	@echo "  make studio        - 打开 Prisma Studio"
	@echo "  make test          - 运行连通性测试"
	@echo "  make health        - 运行健康检查"
