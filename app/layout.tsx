import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nia AI Assistant',
  description: 'Alpha Nia Assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body 
        style={{
          backgroundColor: 'rgba(27, 1, 15, 0.8)',
        }}
      >
        <AppRouterCacheProvider>
          {children}
        </AppRouterCacheProvider>
        <footer className='absolute bottom-0 right-[50%] p-2'
          style={{
            margin: 'auto',
            transform: 'translateX(50%)',
            whiteSpace: 'nowrap',
          }}
        >
          <p className='text-white text-xs opacity-50'>
            © 2024 Breaking Hits, Inc. All Rights Reserved.
          </p>
        </footer>
      </body>
    </html>
  )
}
