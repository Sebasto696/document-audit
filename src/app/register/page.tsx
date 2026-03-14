'use client'

import { useActionState } from 'react'
import { register } from '@/app/actions/authActions'
import Link from 'next/link'
import { ArrowRight, Building2 } from 'lucide-react'

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    return await register(formData)
  }, { error: '' })

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0f172a] to-[#0f172a]">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20 border border-white/10">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Registro de Empresa</h1>
          <p className="text-gray-400">Únete a HashAudit Pro para asegurar tus documentos</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
          <form action={formAction} className="space-y-6">
            
            {state?.error && (
               <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center animate-in zoom-in-95">
                {state.error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre de la Empresa</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  placeholder="Ej: Corp Inc S.A."
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Correo Corporativo</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="contacto@corp.inc"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
                <input 
                  type="password" 
                  name="password"
                  required
                  placeholder="Crea una contraseña segura"
                  minLength={6}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Crear Cuenta
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            
          </form>

          <div className="mt-8 text-center text-sm text-gray-400">
            ¿Ya tienes una cuenta registrada?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Inicia sesión
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
