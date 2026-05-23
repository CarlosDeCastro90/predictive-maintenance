import { useEffect, useState } from 'react'
import { alertsAPI } from '../services/api'
import { Bell, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

const severityColors = {
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const severityIcons = {
  info: Bell,
  warning: AlertTriangle,
  critical: XCircle,
}

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('open')

  const loadAlerts = () => {
    setLoading(true)
    alertsAPI.list({ status: filter })
      .then(res => setAlerts(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadAlerts() }, [filter])

  const handleResolve = async (id) => {
    await alertsAPI.resolve(id, 'Resolvido manualmente')
    loadAlerts()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-400 animate-pulse">A carregar alertas...</p>
    </div>
  )

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Alertas</h2>
          <p className="text-gray-400 mt-1">{alerts.length} alertas encontrados</p>
        </div>
        <div className="flex gap-2">
          {['open', 'acknowledged', 'resolved'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                filter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {s === 'open' ? 'Abertos' : s === 'acknowledged' ? 'Reconhecidos' : 'Resolvidos'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {alerts.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <Bell size={48} className="mx-auto mb-4 opacity-30" />
            <p>Nenhum alerta encontrado</p>
          </div>
        )}
        {alerts.map(alert => {
          const Icon = severityIcons[alert.severity] || Bell
          return (
            <div key={alert.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg border ${severityColors[alert.severity]}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{alert.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{alert.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-gray-600 text-xs">
                        {alert.machines?.name}
                      </span>
                      <span className="text-gray-600 text-xs">
                        {new Date(alert.created_at).toLocaleString('pt-PT')}
                      </span>
                    </div>
                  </div>
                </div>
                {alert.status === 'open' && (
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600/20 text-green-400 border border-green-500/30 rounded-lg text-sm hover:bg-green-600/30 transition-all"
                  >
                    <CheckCircle size={16} />
                    Resolver
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}