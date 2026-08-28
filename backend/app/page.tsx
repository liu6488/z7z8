import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ fontFamily: 'system-ui', padding: '4rem', textAlign: 'center' }}>
      <h1>Blog Backend Service</h1>
      <p>本服务仅提供 API：</p>
      <ul style={{ listStyle: 'none', padding: 0, lineHeight: 2 }}>
        <li>
          <a href="/api/health">GET /api/health</a> —— 健康检查
        </li>
        <li>
          <a href="/api/v1/posts">GET /api/v1/posts</a> —— 文章列表
        </li>
        <li>POST /api/v1/posts —— 创建文章</li>
        <li>
          <a href="/api/v1/posts">GET /api/v1/posts/:id</a> —— 文章详情
        </li>
      </ul>
      <p>
        前端页面请访问 <Link href="http://localhost:5173">http://localhost:5173</Link>
      </p>
    </main>
  )
}
