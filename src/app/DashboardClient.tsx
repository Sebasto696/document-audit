'use client'

import { useState, useEffect } from 'react'
import UploadDocumentForm from '@/components/UploadDocumentForm'
import { DocumentCard, AuditTimeline } from '@/components/AuditTimeline'
import { getDocumentHistory } from '@/app/actions/documentActions'
import { Archive, Upload, ChevronRight } from 'lucide-react'

export default function DashboardClient({ 
  initialDocuments, 
  userRole 
}: { 
  initialDocuments: any[],
  userRole: string 
}) {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  // Auto-select first doc for auditor
  useEffect(() => {
    if (userRole === 'AUDITOR' && initialDocuments.length > 0 && !selectedDoc) {
      handleSelectDocument(initialDocuments[0].id)
    }
  }, [userRole, initialDocuments, selectedDoc])

  const handleSelectDocument = async (id: string) => {
    setSelectedDoc(id)
    setIsLoadingHistory(true)
    const logs = await getDocumentHistory(id)
    setHistory(logs)
    setIsLoadingHistory(false)
  }

  return (
    <div className="space-y-8">
      {/* Role-based Header (Optional visibility) */}
      <div className="flex justify-center mb-8">
         <div className="bg-white/5 px-6 py-2 rounded-2xl border border-white/10 text-sm font-medium text-gray-300">
           {userRole === 'COMPANY' 
             ? 'Panel de Empresa - Subida y Gestión de Documentos' 
             : 'Panel de Auditor - Verificación de Integridad'}
         </div>
      </div>

      <div className="transition-all duration-500 ease-in-out">
        {userRole === 'COMPANY' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Left Column: Upload Form & Document List */}
            <div className="lg:col-span-4 space-y-8">
              <UploadDocumentForm />
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Archive className="w-5 h-5 text-blue-400" />
                  Mis Documentos ({initialDocuments.length})
                </h3>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {initialDocuments.length === 0 ? (
                    <div className="text-gray-500 text-center p-8 bg-white/5 rounded-xl border border-white/5">
                      No has subido ningún documento aún.
                    </div>
                  ) : (
                    initialDocuments.map((doc) => (
                      <DocumentCard
                        key={doc.id}
                        document={doc}
                        isSelected={selectedDoc === doc.id}
                        onClick={() => handleSelectDocument(doc.id)}
                        showUpdateForm={true} // Enable update form for companies
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Timeline */}
            <div className="lg:col-span-8">
              {selectedDoc ? (
                isLoadingHistory ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <AuditTimeline history={history} />
                )
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-500 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                  <Archive className="w-12 h-12 mb-4 opacity-50" />
                  <p>Selecciona un documento de tu lista para ver e interactuar con su trazabilidad inmutable</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Lista de Documentos Auditor */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Archive className="w-5 h-5 text-blue-400" />
                Registro Global
              </h3>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {initialDocuments.length === 0 ? (
                  <div className="text-gray-500 text-center p-8 bg-white/5 rounded-xl border border-white/5">
                    No hay documentos registrados en la plataforma.
                  </div>
                ) : (
                  initialDocuments.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      isSelected={selectedDoc === doc.id}
                      onClick={() => handleSelectDocument(doc.id)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Línea de tiempo Auditor */}
            <div className="lg:col-span-8">
              {selectedDoc ? (
                isLoadingHistory ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <AuditTimeline history={history} />
                )
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-500 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                  <Archive className="w-12 h-12 mb-4 opacity-50" />
                  <p>Selecciona un documento para ver su trazabilidad inmutable</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
