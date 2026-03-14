'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { verifyDocumentHash, VerificationResult } from '@/app/actions/verifyActions'
import { calculateFileHash } from '@/lib/hashFile'
import { CheckCircle2, XCircle, UploadCloud, FileText, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function VerifyPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      await processFile(files[0])
    }
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await processFile(files[0])
    }
  }

  const processFile = async (file: File) => {
    setIsVerifying(true)
    setResult(null)

    try {
      // 1. Calculate Hash locally (Client-Side)
      const calculatedHash = await calculateFileHash(file)
      
      // 2. Query Database via Server Action
      const verificationResponse = await verifyDocumentHash(calculatedHash)
      setResult(verificationResponse)
    } catch (error) {
      console.error("Hashing failed", error)
      setResult({ success: false, error: 'Hubo un error al procesar el archivo localmente.' })
    } finally {
      setIsVerifying(false)
    }
  }

  const resetVerifier = () => {
    setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0f172a] to-[#0f172a]">
      
      <div className="max-w-4xl mx-auto w-full pt-8">
        <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Volver al Inicio
        </Link>

        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4">
          <h1 className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            Verificador Público de Documentos
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Comprueba la integridad de cualquier documento. Sube el archivo aquí; calcularemos su Hash localmente para garantizar tu privacidad y lo compararemos con la blockchain de la base de datos.
          </p>
        </div>

        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 delay-150">
          
          {/* Main Verifier Box */}
          {!result && !isVerifying && (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer p-12 text-center
                ${isDragging 
                  ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' 
                  : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center mb-2">
                  <UploadCloud className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-semibold">Arrastra un archivo aquí</h3>
                <p className="text-gray-400">o haz clic para explorar en tu computadora</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isVerifying && (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-16 text-center shadow-2xl animate-pulse">
              <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mx-auto mb-6" />
              <h3 className="text-xl font-medium">Calculando Hash Criptográfico...</h3>
              <p className="text-gray-400 mt-2">Comparando con los registros de auditoría</p>
            </div>
          )}

          {/* Result State */}
          {result && (
            <div className={`rounded-3xl p-8 border backdrop-blur-xl shadow-2xl animate-in zoom-in-95 duration-500 ${
              result.success 
                ? 'bg-emerald-500/10 border-emerald-500/30 shadow-emerald-500/10' 
                : 'bg-red-500/10 border-red-500/30 shadow-red-500/10'
            }`}>
              
              <div className="text-center mb-8">
                {result.success ? (
                  <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                ) : (
                  <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                )}
                <h2 className={`text-3xl font-bold ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                  {result.success ? '¡Documento Auténtico!' : 'Alerta de Modificación'}
                </h2>
              </div>

              {result.success ? (
                <div className="space-y-6">
                  <div className="grid gap-4">
                    <div className="bg-black/30 rounded-xl p-4 border border-emerald-500/20">
                      <p className="text-sm text-emerald-500/80 uppercase tracking-wider font-semibold mb-1">Empresa Certificadora</p>
                      <p className="text-xl font-medium">{result.document.uploaderName}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/30 rounded-xl p-4 border border-emerald-500/20">
                         <p className="text-sm text-emerald-500/80 uppercase tracking-wider font-semibold mb-1">Nombre Registrado</p>
                         <p className="truncate font-medium">{result.document.title}</p>
                      </div>
                      <div className="bg-black/30 rounded-xl p-4 border border-emerald-500/20">
                         <p className="text-sm text-emerald-500/80 uppercase tracking-wider font-semibold mb-1">Fecha de Subida</p>
                         <p className="font-medium text-sm">
                           {new Date(result.document.createdAt).toLocaleString('es-ES')}
                         </p>
                      </div>
                    </div>

                    <div className="bg-black/30 rounded-xl p-4 border border-emerald-500/20">
                      <p className="text-sm text-emerald-500/80 uppercase tracking-wider font-semibold mb-1">Firma Criptográfica (SHA-256)</p>
                      <p className="text-xs font-mono text-gray-300 break-all">{result.document.hash}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-black/30 rounded-xl p-6 border border-red-500/20 text-center">
                  <p className="text-gray-300 text-lg leading-relaxed">{result.error}</p>
                </div>
              )}

              <button 
                onClick={resetVerifier}
                className={`mt-10 w-full font-medium py-3.5 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                  result.success 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                Verificar otro documento
              </button>
            </div>
          )}
        </div>
        
      </div>
    </div>
  )
}
