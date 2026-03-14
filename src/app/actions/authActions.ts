'use server'

import prisma from '@/lib/prisma'
import { createSession, deleteSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'

export async function register(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!name || !email || !password) {
    return { error: 'Por favor, completa todos los campos.' }
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return { error: 'Ya existe un usuario con este correo electrónico.' }
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create company and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name, // Using name for company name too for now as per UI
        }
      })

      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'COMPANY',
          companyId: company.id,
        },
      })

      return { user, company }
    })

    await createSession(result.user.id, result.user.role, result.user.name, result.company.id)
    
  } catch (error) {
    console.error('Registration error:', error)
    return { error: 'Error al crear la cuenta. Intenta nuevamente.' }
  }

  redirect('/')
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Por favor, ingresa correo y contraseña.' }
  }

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user || !user.password) {
    return { error: 'Credenciales inválidas.' }
  }

  const isValidPassword = await bcrypt.compare(password, user.password)

  if (!isValidPassword) {
    return { error: 'Credenciales inválidas.' }
  }

  await createSession(user.id, user.role, user.name, user.companyId)
  redirect('/')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
