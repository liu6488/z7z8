import { NextResponse } from 'next/server'
import { prisma, dbReady } from '@/lib/db'

const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false'

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms,
    )
    p.then(
      (v) => {
        clearTimeout(timer)
        resolve(v)
      },
      (e) => {
        clearTimeout(timer)
        reject(e)
      },
    )
  })
}

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
    // 建表（postgres）与 DB 探活都加超时，避免健康检查请求无限挂起
    await withTimeout(dbReady, 5000, 'db bootstrap')
    await withTimeout(prisma.$queryRaw`SELECT 1`, 3000, 'db ping')
    checks.database = true
  } catch (e) {
    console.error(
      'Database health check failed:',
      e instanceof Error ? e.message : e,
    )
  }

  if (REDIS_ENABLED) {
    checks.redis = await checkRedis()
  } else {
    checks.redis = 'disabled'
  }

  const ok = checks.database === true && (!REDIS_ENABLED || checks.redis === true)

  return NextResponse.json(checks, { status: ok ? 200 : 503 })
}
