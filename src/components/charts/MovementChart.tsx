'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useEffect, useState } from 'react'

interface MovementData {
  day: string
  inbound: number
  outbound: number
}

export default function MovementChart() {
  const [data, setData] = useState<MovementData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMovementData()
  }, [])

  const fetchMovementData = async () => {
    try {
      const response = await fetch('/api/charts/stock-movements')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setData(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching movement data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-accent-white rounded-xl shadow-sm p-4 sm:p-6 border border-secondary-sage/10">
        <h3 className="text-base sm:text-lg font-semibold text-primary-forest mb-3 sm:mb-4">Stock Movements (This Week)</h3>
        <div className="h-48 sm:h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-forest"></div>
        </div>
      </div>
    )
  }
  return (
    <div className="bg-accent-white rounded-xl shadow-sm p-4 sm:p-6 border border-secondary-sage/10">
      <h3 className="text-base sm:text-lg font-semibold text-primary-forest mb-3 sm:mb-4">Stock Movements (This Week)</h3>
      <div className="h-48 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B6B6B', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B6B6B', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar 
              dataKey="inbound" 
              fill="#87A96B" 
              name="Items In"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="outbound" 
              fill="#F4C430" 
              name="Items Out"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}