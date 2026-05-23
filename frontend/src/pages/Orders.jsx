import { useEffect, useState } from 'react'
import { ordersAPI } from '../services/api'
import { ClipboardList, Play, CheckCircle, Clock } from 'lucide-react'

const priorityColors = {
  low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  high: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const priorityLabels = {
  low: 'Baixa', medium: 'Média', high: 'Alta', critical: 'Crítica'
}

const statusLabels = {
  pending: 'Pendente', in_progress: 'Em progresso',
  completed: 'Concluída', cancelled: 'Cancelada'
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  const loadOrders = () => {
    setLoading(true)
    ordersAPI.list({ status: filter })
      .then(res => setOrders(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadOrders() }, [filter])

  const handleStart = async (id) => {
    await ordersAPI.start(id)
    loadOrders()
  }

  const handleComplete = async (id) => {
    await ordersAPI.complete(id)
    loadOrders()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-400 animate-pulse">A carregar ordens...</p>
    </div>
  )

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Ordens de Manutenção</h2>
          <p className="text-gray-400 mt-1">{orders.length} ordens encontradas</p>
        </div>
        <div className="flex gap-2">
          {['pending', 'in_progress', 'completed'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                filter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {statusLabels[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {orders.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <ClipboardList size={48} className="mx-auto mb-4 opacity-30" />
            <p>Nenhuma ordem encontrada</p>
          </div>
        )}
        {orders.map(order => (
          <div key={order.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <ClipboardList size={18} className="text-purple-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{order.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColors[order.priority]}`}>
                      {priorityLabels[order.priority]}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{order.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-gray-600 text-xs flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(order.created_at).toLocaleString('pt-PT')}
                    </span>
                    {order.machines && (
                      <span className="text-gray-600 text-xs">
                        {order.machines.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {order.status === 'pending' && (
                  <button
                    onClick={() => handleStart(order.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm hover:bg-blue-600/30 transition-all"
                  >
                    <Play size={14} />
                    Iniciar
                  </button>
                )}
                {order.status === 'in_progress' && (
                  <button
                    onClick={() => handleComplete(order.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600/20 text-green-400 border border-green-500/30 rounded-lg text-sm hover:bg-green-600/30 transition-all"
                  >
                    <CheckCircle size={14} />
                    Concluir
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}