import type { Metadata } from 'next'
import './globals.css'
import SessionProvider from "./SessionProvider";

export const metadata: Metadata = {
  title: 'lightgame App',
  description: 'generate games with AI',
  generator: 'powered by lightgame',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
