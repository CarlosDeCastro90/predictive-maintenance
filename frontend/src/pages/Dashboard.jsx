import { useEffect, useState } from 'react'
import { dashboardAPI } from '../services/api'
import { Cpu, Bell, ClipboardList, Activity } from 'lucide-react'

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-3xl font-bold text-white">{value ?? '—'}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    dashboardAPI.stats()
      .then(res => setStats(res.data))
      .catch(() => setError('Erro ao carregar estatísticas'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-400 animate-pulse">A carregar dashboard...</p>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-red-400">{error}</p>
    </div>
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-gray-400 mt-1">Visão geral do sistema de manutenção preditiva</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total de Máquinas" value={stats?.total_machines} icon={Cpu} color="bg-blue-600/20 text-blue-400" />
        <StatCard label="Alertas Abertos" value={stats?.open_alerts} icon={Bell} color="bg-yellow-600/20 text-yellow-400" />
        <StatCard label="Alertas Críticos" value={stats?.critical_alerts} icon={Bell} color="bg-red-600/20 text-red-400" />
        <StatCard label="Ordens Pendentes" value={stats?.pending_orders} icon={ClipboardList} color="bg-purple-600/20 text-purple-400" />
      </div>

      {/* Status das máquinas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity size={20} className="text-blue-400" />
            Estado das Máquinas
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Operacional', value: stats?.operational, color: 'bg-green-500' },
              { label: 'Atenção', value: stats?.warning, color: 'bg-yellow-500' },
              { label: 'Crítico', value: stats?.critical, color: 'bg-red-500' },
              { label: 'Offline', value: stats?.offline, color: 'bg-gray-500' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <span className="text-gray-300 text-sm">{label}</span>
                </div>
                <span className="text-white font-semibold">{value ?? 0}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Saúde Média do Sistema</h3>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <p className="text-6xl font-bold text-blue-400">{stats?.avg_health_score ?? 0}%</p>
              <p className="text-gray-400 mt-2 text-sm">Health Score médio</p>
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 mt-4">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all"
              style={{ width: `${stats?.avg_health_score ?? 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}