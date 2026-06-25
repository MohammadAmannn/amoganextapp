import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-open-sans',
})

export const metadata: Metadata = {
  title: 'Shadcn Admin',
  description: 'A modern admin dashboard built with shadcn/ui',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' suppressHydrationWarning className={openSans.variable}>
      <body className={openSans.className} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
