import { NextResponse } from 'next/server'
import { prisma, dbReady } from '@/lib/db'

const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false'

async function checkRedis(): Promise<boolean> {
  if (!REDIS_ENABLED) return true
  try {
    const { default: Redis } = await import('ioredis')
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      lazyConnect: true,
      retryStrategy: () => null,
      maxRetriesPerRequest: 1,
      connectTimeout: 1000,
    })
    await redis.connect()
    await redis.ping()
    redis.disconnect()
    return true
  } catch {
    return false
  }
}

export async function GET() {
  const checks: Record<string, unknown> = {
    database: false,
    redis: false,
    redisEnabled: REDIS_ENABLED,
    timestamp: new Date().toISOString(),
  }

  try {
    await dbReady // 幂等建表（postgres）——失败则本路由返回 503
    await prisma.$queryRaw`SELECT 1`
    checks.database = true
  } catch (e) {
    console.error('Database health check failed:', e)
  }

  if (REDIS_ENABLED) {
    checks.redis = await checkRedis()
  } else {
    checks.redis = 'disabled'
  }

  const ok = checks.database === true && (!REDIS_ENABLED || checks.redis === true)

  return NextResponse.json(checks, { status: ok ? 200 : 503 })
}
