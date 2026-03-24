'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    })
    return { success: true, data: categories }
  } catch (error) {
    return { success: false, error: 'Failed to fetch categories' }
  }
}

export async function createCategory(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string

    if (!name || !slug) return { success: false, error: 'Name and slug are required' }

    const category = await prisma.category.create({
      data: { name, slug },
    })

    revalidatePath('/admin/categories')
    return { success: true, data: category }
  } catch (error) {
    return { success: false, error: 'Failed to create category' }
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({
      where: { id },
    })
    revalidatePath('/admin/categories')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete category' }
  }
}
