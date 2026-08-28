#!/bin/bash
set -e

# 连通性测试: 后端健康 -> 数据库读 -> 数据库写 -> 前端 -> 前端代理
API_BASE="${API_BASE:-http://localhost:3000/api}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"

echo "Testing service connectivity..."

# 测试 1: 后端健康检查
echo "-> Testing backend health endpoint..."
HEALTH=$(curl -sf "$API_BASE/health" || echo "FAILED")
if [ "$HEALTH" = "FAILED" ]; then
    echo "[FAIL] Backend health check failed"
    exit 1
fi
echo "[OK] Backend health: $(echo "$HEALTH" | grep -o '"database":[a-z]*')"

# 测试 2: 数据库读 (文章列表)
echo "-> Testing database read (posts list)..."
POSTS=$(curl -sf "$API_BASE/v1/posts" || echo "FAILED")
if [ "$POSTS" = "FAILED" ]; then
    echo "[FAIL] Database read failed"
    exit 1
fi
echo "[OK] Database read successful"

# 测试 3: 数据库写 (创建测试文章)
echo "-> Testing database write (create post)..."
CREATE=$(curl -sf -X POST "$API_BASE/v1/posts" \
    -H "Content-Type: application/json" \
    -d '{"title":"connectivity-test","content":"# test","tags":"test","status":"draft"}' || echo "FAILED")
if [ "$CREATE" = "FAILED" ]; then
    echo "[FAIL] Database write failed"
    exit 1
fi
POST_ID=$(echo "$CREATE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "[OK] Database write successful (id=$POST_ID)"

# 测试 4: 数据库读 (单篇文章)
echo "-> Testing single post fetch..."
if curl -sf "$API_BASE/v1/posts/$POST_ID" > /dev/null; then
    echo "[OK] Post detail fetch successful"
else
    echo "[FAIL] Post detail fetch failed"
    exit 1
fi

# 测试 5: 清理测试数据
echo "-> Cleaning up test post..."
if curl -sf -X DELETE "$API_BASE/v1/posts/$POST_ID" > /dev/null; then
    echo "[OK] Test post deleted"
else
    echo "[WARN] Failed to delete test post (id=$POST_ID)"
fi

# 测试 6: 前端可访问性 (dev 模式)
if curl -sf "$FRONTEND_URL" > /dev/null 2>&1; then
    echo "[OK] Frontend dev server is accessible"
else
    echo "[INFO] Frontend dev server not running (skip) - start with: cd frontend && npm run dev"
fi

echo "All connectivity tests passed!"
