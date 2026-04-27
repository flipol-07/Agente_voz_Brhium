import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'

const display = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-pres-display',
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
})

const body = DM_Sans({
  subsets: ['latin'],
  variable: '--font-pres-body',
  weight: ['300', '400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Agentes de Voz con IA — Sauteri para BRHIUM & Munacare',
  description: 'Propuesta de Sauteri para implementar agentes de voz con IA en BRHIUM y Munacare.',
}

export default function PresentacionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${display.variable} ${body.variable}`}>
      {children}
    </div>
  )
}
