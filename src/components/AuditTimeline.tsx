'use client'

import { useState, useTransition, useRef } from 'react'
import { uploadNewVersion } from '@/app/actions/documentActions'
import { format } from 'date-fns'
import { FileText, ShieldCheck, Activity, User as UserIcon, UploadCloud, Loader2 } from 'lucide-react'

type DocumentProps = {
  document: {
    id: string
    title: string
    description: string | null
    currentHash: string
    status: string
    createdAt: Date
    updatedAt: Date
    uploader: { name: string, role: string }
  }
}

type TimelineProps = {
  history: {
    id: string
    action: string
    hashValue: string
    timestamp: Date
    details: string | null
    user: { name: string, role: string }
  }[]
}

export function DocumentCard({ 
  document, 
  isSelected, 
  onClick,
  showUpdateForm = false 
}: DocumentProps & { isSelected: boolean, onClick: () => void, showUpdateForm?: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleUploadNewVersion = async (formData: FormData) => {
    setError(null)
    setSuccessMsg(null)
    
    startTransition(async () => {
      const response = await uploadNewVersion(document.id, formData)
      if (response.success) {
        setSuccessMsg("¡Nueva versión subida con éxito!")
        if (formRef.current) formRef.current.reset()
      } else {
        setError(response.error || "Error desconocido al actualizar la versión.")
      }
    })
  }

  return (
    <div 
      className={`p-5 rounded-2xl transition-all border ${isSelected ? 'bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/10' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
    >
      <div 
        onClick={onClick}
        className="flex items-start justify-between cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-400'}`}>
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{document.title}</h3>
            <p className="text-sm text-gray-400">{format(new Date(document.createdAt), 'dd MMM yyyy, HH:mm')}</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          Verificado
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <UserIcon className="w-4 h-4 text-gray-500" />
          <span className="text-gray-400">Firmado por:</span> {document.uploader.name}
        </div>
        <div className="mt-2 text-xs font-mono bg-black/40 p-2 rounded text-gray-400 truncate break-all">
          <span className="text-blue-400 font-semibold">Hash Actual (v{document.status === 'VERSION_UPDATED' ? '2+' : '1'}):</span> {document.currentHash}
        </div>

        {/* Update Form - Only visible when selected and authorized */}
        {isSelected && showUpdateForm && (
          <div className="mt-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
             <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
               <UploadCloud className="w-4 h-4 text-indigo-400" />
               Subir Nueva Versión
             </h4>
             
             {error && <div className="text-xs text-red-400 mb-2 p-2 bg-red-500/10 rounded">{error}</div>}
             {successMsg && <div className="text-xs text-green-400 mb-2 p-2 bg-green-500/10 rounded">{successMsg}</div>}

             <form ref={formRef} action={handleUploadNewVersion} className="flex gap-2 items-center">
                <input 
                  type="file" 
                  name="file" 
                  required 
                  className="text-xs text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-white/10 file:text-white hover:file:bg-white/20 w-full"
                />
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Actualizar'}
                </button>
             </form>
          </div>
        )}
      </div>
    </div>
  )
}

export function AuditTimeline({ history }: TimelineProps) {
  if (!history || history.length === 0) return <div className="text-gray-400 p-8 text-center bg-white/5 rounded-2xl border border-white/10">No hay historial para este documento.</div>

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative">
      <h2 className="text-xl font-semibold mb-8 text-white flex items-center gap-2">
        <Activity className="w-5 h-5 text-indigo-400" />
        Línea de Tiempo de Auditoría (Inmutable)
      </h2>
      
      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent">
        {history.map((log, index) => (
          <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0f172a] bg-indigo-500 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg z-10">
              <ShieldCheck className="w-5 h-5" />
            </div>
            
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shadow-lg">
              <div className="flex items-center justify-between space-x-2 mb-1">
                <div className="font-bold text-white flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-xs uppercase tracking-wider">{log.action}</span>
                </div>
                <time className="text-sm font-medium text-gray-400">{format(new Date(log.timestamp), 'dd MMM yyyy, HH:mm')}</time>
              </div>
              <div className="text-sm text-gray-300 mt-3 mb-2 flex items-center gap-2">
                 <UserIcon className="w-4 h-4 text-gray-400" />
                 {log.user.name} <span className="text-gray-500">({log.user.role})</span>
              </div>
              {log.details && <div className="text-sm text-gray-400 mb-3">{log.details}</div>}
              
              <div className="bg-black/50 p-3 rounded-lg border border-white/5 mt-3">
                <p className="text-xs text-indigo-400 font-semibold mb-1">Estado del Hash (SHA-256):</p>
                <p className="text-xs font-mono text-gray-300 break-all">{log.hashValue}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
