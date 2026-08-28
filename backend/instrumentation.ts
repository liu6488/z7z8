// Next.js 启动钩子：服务进程一起就执行自愈式建表，
// 避免依赖首个 /api/health 请求才触发 bootstrap（那样日志难定位）。
export async function register() {
  try {
    await import('./lib/db')
  } catch (e) {
    console.error(
      '[instrumentation] failed to load db module:',
      e instanceof Error ? e.message : e,
    )
  }
}
