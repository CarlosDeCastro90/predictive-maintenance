import { useEffect, useState } from 'react'
import { machinesAPI } from '../services/api'
import { Cpu, MapPin, Activity } from 'lucide-react'

const statusColors = {
  operational: 'bg-green-500/20 text-green-400 border-green-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  offline: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  maintenance: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}

const statusLabels = {
  operational: 'Operacional',
  warning: 'Atenção',
  critical: 'Crítico',
  offline: 'Offline',
  maintenance: 'Manutenção',
}

export default function Machines() {
  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    machinesAPI.list()
      .then(res => setMachines(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-400 animate-pulse">A carregar máquinas...</p>
    </div>
  )

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Máquinas</h2>
          <p className="text-gray-400 mt-1">{machines.length} equipamentos monitorizados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {machines.map(machine => (
          <div key={machine.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Cpu size={20} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{machine.name}</h3>
                  <p className="text-gray-500 text-xs">{machine.machine_type}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[machine.status]}`}>
                {statusLabels[machine.status]}
              </span>
            </div>

            {machine.location && (
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                <MapPin size={14} />
                <span>{machine.location}</span>
              </div>
            )}

            <div className="flex items-center gap-2 mb-3">
              <Activity size={14} className="text-gray-500" />
              <span className="text-gray-500 text-sm">Health Score</span>
              <span className="ml-auto font-semibold text-white">{machine.health_score}%</span>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  machine.health_score >= 80 ? 'bg-green-500' :
                  machine.health_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${machine.health_score}%` }}
              />
            </div>

            {machine.sectors && (
              <p className="text-gray-600 text-xs mt-3">
                Sector: {machine.sectors.name}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}