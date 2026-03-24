'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      include: {
        categories: { include: { category: true } },
        variants: true,
        images: true
      },
      orderBy: { created_at: 'desc' },
    })
    return { success: true, data: products }
  } catch (error) {
    return { success: false, error: 'Failed to fetch products' }
  }
}

export async function createProduct(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const base_price = parseFloat(formData.get('base_price') as string)
    // Extra fields like category IDs and variants would be handled as JSON realistically,
    // but here we demonstrate the base creation
    
    if (!name || isNaN(base_price)) return { success: false, error: 'Valid Name and Base Price are required' }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        base_price,
      },
    })

    revalidatePath('/admin/products')
    revalidatePath('/shop')
    return { success: true, data: product }
  } catch (error) {
    return { success: false, error: 'Failed to create product' }
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    })
    revalidatePath('/admin/products')
    revalidatePath('/shop')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete product' }
  }
}
