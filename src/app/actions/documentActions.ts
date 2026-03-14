'use server'

import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'

export async function uploadDocument(formData: FormData) {
  try {
    const session = await verifySession()
    if (!session || !session.userId) {
      return { success: false, error: 'Usuario no autorizado' }
    }

    const file = formData.get('file') as File | null
    const title = formData.get('title') as string
    const description = (formData.get('description') as string) || null

    if (!file || !title) {
      return { success: false, error: 'El archivo y el título son obligatorios.' }
    }

    // 1. Convert file to buffer and calculate SHA-256 Hash
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const hashSum = crypto.createHash('sha256')
    hashSum.update(buffer)
    const currentHash = hashSum.digest('hex')

    // 2. Save file to public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    const uniqueFilename = `${Date.now()}-${file.name}`
    const filePath = path.join(uploadDir, uniqueFilename)
    fs.writeFileSync(filePath, buffer)
    
    // Relative URL for frontend to access optionally (if wanted)
    const fileUrl = `/uploads/${uniqueFilename}`

    // 4. Create internal Document record and Audit Log transiton
    const document = await prisma.document.create({
      data: {
        title,
        description,
        fileUrl,
        currentHash,
        companyId: session.companyId,
        uploaderId: session.userId,
        history: {
          create: {
            action: 'UPLOADED',
            hashValue: currentHash,
            userId: session.userId,
            details: 'Documento original registrado'
          }
        }
      }
    })

    revalidatePath('/')
    return { success: true, document }
  } catch (error: any) {
    console.error('Error uploading document:', error)
    if (error.code === 'P2002') {
      return { success: false, error: 'Ya existe un documento con este mismo hash.' }
    }
    return { success: false, error: error.message || 'Ocurrió un error inesperado al subir el documento.' }
  }
}

export async function getDocuments() {
  const session = await verifySession()
  
  if (!session) return []

  // If COMPANY, only show their own documents
  if (session.role === 'COMPANY') {
    return await prisma.document.findMany({
      where: { companyId: session.companyId },
      include: { uploader: true },
      orderBy: { createdAt: 'desc' }
    })
  }

  // If AUDITOR, show all documents cross-companies
  return await prisma.document.findMany({
    include: { uploader: true },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getDocumentHistory(documentId: string) {
  return await prisma.auditLog.findMany({
    where: { documentId },
    include: { user: true },
    orderBy: { timestamp: 'desc' }
  })
}

export async function uploadNewVersion(documentId: string, formData: FormData) {
  try {
    const session = await verifySession()
    if (!session || !session.userId || session.role !== 'COMPANY') {
      return { success: false, error: 'Acceso no autorizado' }
    }

    const file = formData.get('file') as File | null
    if (!file) {
      return { success: false, error: 'Debes proporcionar un archivo' }
    }

    // 1. Verify existence and ownership
    const existingDoc = await prisma.document.findUnique({
      where: { id: documentId }
    })

    if (!existingDoc || existingDoc.uploaderId !== session.userId) {
      return { success: false, error: 'Documento no encontrado o no tienes permisos' }
    }

    // 2. Calculate New Hash
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const hashSum = crypto.createHash('sha256')
    hashSum.update(buffer)
    const newHash = hashSum.digest('hex')

    if (newHash === existingDoc.currentHash) {
      return { success: false, error: 'Este archivo es idéntico a la versión actual. El Hash no ha cambiado.' }
    }

    // 3. Save new file
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    const uniqueFilename = `${Date.now()}-v2-${file.name}`
    const filePath = path.join(uploadDir, uniqueFilename)
    fs.writeFileSync(filePath, buffer)
    const fileUrl = `/uploads/${uniqueFilename}`

    // 4. Update Database within a Transaction
    const updatedDocument = await prisma.$transaction(async (tx) => {
      // Update the main document reference
      const doc = await tx.document.update({
        where: { id: documentId },
        data: {
          currentHash: newHash,
          fileUrl: fileUrl,
          status: 'VERSION_UPDATED',
          title: file.name // Opcionalmente actualizar el titulo si cambió el nombre del archivo
        }
      })

      // Insert the immutable history log
      await tx.auditLog.create({
        data: {
          documentId: doc.id,
          action: 'VERSION_UPDATED',
          hashValue: newHash,
          userId: session.userId,
          details: `Se actualizó a una nueva versión del archivo original`
        }
      })

      return doc
    })

    revalidatePath('/')
    return { success: true, document: updatedDocument }
  } catch (error: any) {
    console.error('Error uploading new version:', error)
    if (error.code === 'P2002') {
       return { success: false, error: 'Este documento o Hash ya existe en el registro' }
    }
    return { success: false, error: 'Ocurrió un error al subir la nueva versión' }
  }
}

