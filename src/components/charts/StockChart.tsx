'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useEffect, useState } from 'react'

interface StockData {
  month: string
  inStock: number
  lowStock: number
}

export default function StockChart() {
  const [data, setData] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStockData()
  }, [])

  const fetchStockData = async () => {
    try {
      const response = await fetch('/api/charts/stock-overview')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setData(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching stock data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
        <h3 className="text-lg font-semibold text-primary-forest mb-4">Stock Overview</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-forest"></div>
        </div>
      </div>
    )
  }
  return (
    <div className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
      <h3 className="text-lg font-semibold text-primary-forest mb-4">Stock Overview</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="month" 
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
            <Area
              type="monotone"
              dataKey="inStock"
              stroke="#2D5F3F"
              fill="#87A96B"
              fillOpacity={0.3}
              name="In Stock"
            />
            <Area
              type="monotone"
              dataKey="lowStock"
              stroke="#EF4444"
              fill="#FEE2E2"
              fillOpacity={0.6}
              name="Low Stock"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}