import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { ApiResponse } from '@/types'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const { query } = await request.json()

    // Get current inventory data to provide context
    const [items, categories] = await Promise.all([
      prisma.inventoryItem.findMany({
        where: { isActive: true },
        include: { category: true },
        orderBy: { name: 'asc' }
      }),
      prisma.category.findMany()
    ])

    // Prepare inventory summary for AI
    const inventorySummary = {
      totalItems: items.length,
      totalValue: items.reduce((sum, item) => sum + (Number(item.unitPrice) * item.quantity), 0),
      categories: categories.map(cat => ({
        name: cat.name,
        itemCount: items.filter(item => item.categoryId === cat.id).length
      })),
      lowStockItems: items.filter(item => item.quantity <= item.minStock),
      topItems: items.slice(0, 10).map(item => ({
        name: item.name,
        category: item.category.name,
        quantity: item.quantity,
        minStock: item.minStock,
        unitPrice: Number(item.unitPrice)
      }))
    }

    // Use OpenAI to generate intelligent response
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an intelligent inventory assistant for MNSTS (Medellin National Science and Technology School) Inventory Management System.

Current Inventory Data:
- Total Items: ${inventorySummary.totalItems}
- Total Value: ₱${inventorySummary.totalValue.toLocaleString()}
- Categories: ${inventorySummary.categories.map(c => `${c.name} (${c.itemCount} items)`).join(', ')}
- Low Stock Items: ${inventorySummary.lowStockItems.length} items
- Low Stock Details: ${inventorySummary.lowStockItems.map(item => `${item.name}: ${item.quantity} left (min: ${item.minStock})`).join(', ')}

Sample Items: ${inventorySummary.topItems.map(item => `${item.name} (${item.category}): ${item.quantity} units at ₱${item.unitPrice.toLocaleString()}`).join(', ')}

Answer user questions about inventory using this data. Be helpful, concise, and use the actual numbers from the data. Format currency as ₱X,XXX. If asked about specific items not in the sample, say you can search for more details.`
        },
        {
          role: "user",
          content: query
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    })

    const answer = completion.choices[0]?.message?.content || "I couldn't process your request right now."

    return NextResponse.json({
      success: true,
      answer
    })

  } catch (error) {
    console.error('Chatbot API error:', error)
    return NextResponse.json({
      success: false,
      error: `API Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 })
  }
}