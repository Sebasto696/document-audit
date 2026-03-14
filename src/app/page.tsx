import UploadDocumentForm from '@/components/UploadDocumentForm'
import { getDocuments } from '@/app/actions/documentActions'
import DashboardClient from './DashboardClient'
import { verifySession } from '@/lib/session'
import { logout } from '@/app/actions/authActions'
import { LogOut } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const documents = await getDocuments()
  const session = await verifySession()

  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      {/* Navbar Minimalista */}
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-lg">
              H
            </div>
            <span className="font-semibold text-xl tracking-tight">HashAudit Pro</span>
          </div>
            <div className="flex items-center gap-6">
              <div className="text-sm text-gray-400 flex items-center gap-2 border border-white/10 py-1.5 px-3 rounded-full bg-white/5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                {session?.name ? `Conectado: ${session.name}` : 'Sistema Seguro'}
              </div>
              <a href="/verify" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Verificar Documento
              </a>
              <form action={logout}>
                 <button type="submit" className="text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                   <LogOut className="w-4 h-4" />
                   Salir
                 </button>
              </form>
            </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            Plataforma de Auditoría Inmutable
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Garantiza la integridad de tus documentos corporativos usando tecnología de Hashing criptográfico (SHA-256). Ideal para auditorías y compliance legal.
          </p>
        </div>

        {/* Dashboard Client Component handles the interactivity */}
        <DashboardClient initialDocuments={documents} userRole={session?.role || 'COMPANY'} />
      </div>
    </main>
  )
}
