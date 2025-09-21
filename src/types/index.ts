import { User, InventoryItem, Category, StockMovement, Report, ConsumptionPattern } from '@prisma/client'

// User types
export interface UserWithoutPassword extends Omit<User, 'password'> {}

export interface UserSession {
  id: string
  email: string
  firstName: string
  lastName: string
  isVerified: boolean
}

// Inventory types
export interface InventoryItemWithCategory extends InventoryItem {
  category: Category
}

export interface InventoryItemWithDetails extends InventoryItem {
  category: Category
  user: UserWithoutPassword
  stockMovements: StockMovement[]
}

// Stock Movement types
export interface StockMovementWithDetails extends StockMovement {
  item: InventoryItem
  user: UserWithoutPassword
}

// Report types
export interface ReportWithUser extends Report {
  user: UserWithoutPassword
}

// Dashboard analytics types
export interface DashboardStats {
  totalItems: number
  lowStockItems: number
  totalValue: number
  recentMovements: number
}

export interface StockAlert {
  id: string
  itemName: string
  currentStock: number
  minStock: number
  category: string
  urgency: 'critical' | 'warning' | 'normal'
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
}

export interface ItemForm {
  name: string
  description?: string
  sku: string
  barcode?: string
  quantity: number
  minStock: number
  maxStock: number
  unitPrice: number
  location?: string
  categoryId: string
  imageUrls: string[]
}

// Search and filter types
export interface ItemFilters {
  category?: string
  minStock?: number
  maxStock?: number
  searchTerm?: string
  sortBy?: 'name' | 'quantity' | 'createdAt' | 'unitPrice'
  sortOrder?: 'asc' | 'desc'
}

// AI Prediction types
export interface ConsumptionPrediction {
  itemId: string
  itemName: string
  currentStock: number
  predictedConsumption: number
  recommendedStock: number
  confidence: number
  reasoning: string[]
}