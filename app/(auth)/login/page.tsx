'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    })

    if (result?.error) {
      setError(result.error)
    } else {
      // Se o login for bem-sucedido, redirecionar para a página inicial
      // que fará a verificação de role e redirecionamento apropriado
      router.push('/')
      router.refresh() // Força a atualização da sessão
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="px-8 py-6 mt-4 text-left bg-black border border-gold shadow-lg rounded-lg">
        <h3 className="text-2xl font-bold text-center text-gold">Login</h3>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <div>
              <label className="block text-gold" htmlFor="email">Email</label>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 mt-2 border border-gold rounded-md focus:outline-none focus:ring-1 focus:ring-gold bg-black text-white placeholder-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mt-4">
              <label className="block text-gold" htmlFor="password">Senha</label>
              <input
                type="password"
                placeholder="Senha"
                className="w-full px-4 py-2 mt-2 border border-gold rounded-md focus:outline-none focus:ring-1 focus:ring-gold bg-black text-white placeholder-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <div className="flex items-baseline justify-between">
              <button 
                type="submit" 
                className="px-6 py-2 mt-4 text-black bg-gold rounded-lg hover:bg-opacity-90 transition-all duration-200 font-semibold"
              >
                Entrar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 