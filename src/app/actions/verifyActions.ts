'use server'

import prisma from '@/lib/prisma'

export type VerificationResult = 
  | { success: true; document: { title: string; uploaderName: string; createdAt: Date; hash: string } }
  | { success: false; error: string }

/**
 * Searches the database for a document matching the exact exact given hash.
 * 
 * @param hash The calculated SHA-256 hash of the file to verify
 */
export async function verifyDocumentHash(hash: string): Promise<VerificationResult> {
  try {
    const document = await prisma.document.findUnique({
      where: { currentHash: hash },
      include: {
        uploader: {
          select: { name: true } // Only fetch the company's name for privacy
        }
      }
    })

    if (!document) {
      return { 
        success: false, 
        error: 'El hash no coincide con ningún documento registrado. El archivo puede haber sido alterado o nunca fue subido a la plataforma.'
      }
    }

    // Return only necessary data to the client
    return {
      success: true,
      document: {
        title: document.title,
        uploaderName: document.uploader.name,
        createdAt: document.createdAt,
        hash: document.currentHash
      }
    }

  } catch (error) {
    console.error('Error verifying document:', error)
    return { success: false, error: 'Ocurrió un error al intentar verificar el documento. Intenta nuevamente.' }
  }
}
