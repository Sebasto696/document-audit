'use client'

import { useState } from 'react'
import { uploadDocument } from '@/app/actions/documentActions'
import { UploadCloud, File as FileIcon, Loader2, CheckCircle2 } from 'lucide-react'

export default function UploadDocumentForm() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title) return

    setIsUploading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title)
    formData.append('description', description)

    try {
      const result = await uploadDocument(formData)
      if (result.success) {
        setSuccess('Documento y Hash registrados en la blockchain (BD) exitosamente.')
        setFile(null)
        setTitle('')
        setDescription('')
      } else {
        setError(result.error || 'Error al subir documento')
      }
    } catch (err) {
      setError('Error inesperado')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl w-full max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
        <UploadCloud className="w-6 h-6 text-blue-400" />
        Registrar Documento
      </h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-200 p-4 rounded-lg mb-6 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 mt-0.5 text-green-400" />
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Título del Documento</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-500"
            placeholder="Ej. Contrato de Arrendamiento 2024"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Descripción (Opcional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-500 min-h-[100px]"
            placeholder="Detalles sobre el documento..."
          />
        </div>

        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-white/20 hover:border-white/40'} ${file ? 'bg-white/5' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
            {file ? (
              <>
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <FileIcon className="w-8 h-8 text-blue-400" />
                </div>
                <div className="text-gray-300">
                  <span className="font-semibold text-white">{file.name}</span>
                  <p className="text-sm text-gray-400 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                  <UploadCloud className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-300 font-medium">Haz clic para subir o arrastra el archivo aquí</p>
                  <p className="text-sm text-gray-500 mt-1">Soporta cualquier tipo de archivo</p>
                </div>
              </>
            )}
          </label>
        </div>

        <button
          type="submit"
          disabled={!file || !title || isUploading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Procesando y Generando Hash...
            </>
          ) : (
            'Subir y Registrar Documento'
          )}
        </button>
      </form>
    </div>
  )
}
