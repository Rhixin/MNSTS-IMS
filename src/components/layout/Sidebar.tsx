'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ChartBarIcon, 
  CubeIcon, 
  ArrowUpCircleIcon, 
  ArrowDownCircleIcon, 
  DocumentChartBarIcon,
  TagIcon,
  ClockIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface SidebarProps {
  isOpen: boolean
  toggleSidebar: () => void
}

const navigationItems = [
  {
    name: 'Overview',
    href: '/overview',
    icon: ChartBarIcon,
    description: 'Analytics & Dashboard'
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: CubeIcon,
    description: 'Manage Items'
  },
  {
    name: 'Categories',
    href: '/categories',
    icon: TagIcon,
    description: 'Manage Categories'
  },
  {
    name: 'Stock In',
    href: '/stock-in',
    icon: ArrowUpCircleIcon,
    description: 'Add Stock'
  },
  {
    name: 'Stock Out',
    href: '/stock-out',
    icon: ArrowDownCircleIcon,
    description: 'Remove Stock'
  },
  {
    name: 'Stock History',
    href: '/stock-history',
    icon: ClockIcon,
    description: 'Movement History'
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: DocumentChartBarIcon,
    description: 'Analytics & Reports'
  }
]

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
          style={{margin: 0, padding: 0}}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary-forest transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 bg-primary-forest border-b border-secondary-teal/20">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-accent-white">MNSTS IMS</h1>
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-accent-white hover:text-primary-golden transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || (item.href === '/overview' && pathname === '/dashboard')
              const Icon = item.icon
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors group ${
                      isActive
                        ? 'bg-primary-golden text-primary-forest font-medium'
                        : 'text-accent-white hover:bg-secondary-teal hover:text-accent-white'
                    }`}
                    onClick={() => {
                      // Close sidebar on mobile after navigation
                      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                        toggleSidebar()
                      }
                    }}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${
                      isActive ? 'text-primary-forest' : 'text-accent-white group-hover:text-accent-white'
                    }`} />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className={`text-xs ${
                        isActive ? 'text-primary-forest/70' : 'text-accent-white/70'
                      }`}>{item.description}</span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="bg-secondary-teal/20 rounded-lg p-3">
            <p className="text-xs text-accent-white/80 text-center">
              Medellin National Science<br />& Technology School
            </p>
          </div>
        </div>
      </div>
    </>
  )
}