import type { ReactNode } from 'react'

export const metadata = {
  title: 'Blog API',
  description: 'Blog backend service (Next.js API Routes)',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
