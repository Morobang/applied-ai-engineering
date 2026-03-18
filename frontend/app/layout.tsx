import type { Metadata } from 'next'
import { DM_Sans, JetBrains_Mono, Inter, Fira_Code, Playfair_Display } from 'next/font/google'
import { ThemeProvider } from '@/context/ThemeContext'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Applied AI Engineering',
  description: 'End-to-end AI and machine learning systems built for real-world problems.',
  openGraph: {
    title: 'Applied AI Engineering',
    description: 'End-to-end AI and machine learning systems built for real-world problems.',
    url: 'https://applied-ai-engineering.vercel.app',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="en" 
      className={`${dmSans.variable} ${jetbrainsMono.variable} ${inter.variable} ${firaCode.variable} ${playfair.variable}`}
    >
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}