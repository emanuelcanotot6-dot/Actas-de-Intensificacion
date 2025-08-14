import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema EDTE - Generador de Documentos para Estudiantes con Materias Pendientes",
  description:
    "Sistema EDTE para generar documentos de estudiantes con materias pendientes - E.E.S.T. N° 6 Ing. Juan V. Passalacqua",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
