'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

export default function AdminSidebar() {
  const pathname = usePathname()

  const menuItems = [
    { name: 'Dashboard', href: '/admin/home', icon: '📊' },
    { name: 'Usuários', href: '/admin/users', icon: '👥' },
    { name: 'Posts', href: '/admin/posts', icon: '📝' },
    { name: 'Configurações', href: '/admin/settings', icon: '⚙️' },
  ]

  return (
    <div className="w-64 bg-black border-r border-gold h-screen">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gold mb-8">Admin Panel</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gold text-black'
                    : 'text-gold hover:bg-gold hover:bg-opacity-10'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="absolute bottom-0 w-64 p-6 border-t border-gold">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gold hover:bg-gold hover:bg-opacity-10 transition-all duration-200"
        >
          <span>🚪</span>
          <span>Sair</span>
        </button>
      </div>
    </div>
  )
} 