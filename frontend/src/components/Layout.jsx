import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Cpu, Bell, ClipboardList, Bot } from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/machines', icon: Cpu, label: 'Máquinas' },
  { to: '/alerts', icon: Bell, label: 'Alertas' },
  { to: '/orders', icon: ClipboardList, label: 'Ordens' },
  { to: '/assistant', icon: Bot, label: 'Assistente IA' },
]

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-blue-400">⚙️ PredictAI</h1>
          <p className="text-xs text-gray-500 mt-1">Manutenção Preditiva</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-600 text-center">v1.0.0 — 2025</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}