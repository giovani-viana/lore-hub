import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminSidebar() {
  const pathname = usePathname()

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/users', label: 'Usuários', icon: '👥' },
    { href: '/admin/campaigns', label: 'Campanhas', icon: '🎲' },
    { href: '/admin/characters', label: 'Personagens', icon: '👤' },
    { href: '/admin/settings', label: 'Configurações', icon: '⚙️' },
  ]

  return (
    <aside className="w-64 bg-gray-800 text-white p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Lore Hub Admin</h1>
      </div>
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-700 ${
                  pathname === item.href ? 'bg-gray-700' : ''
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
} 