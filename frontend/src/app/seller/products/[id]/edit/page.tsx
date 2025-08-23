"use client"

import * as React from "react"
import { ProductForm } from "@/components/forms/ProductForm"
import { useForm } from "react-hook-form"
import { valibotResolver } from "@hookform/resolvers/valibot"
import { type productFormData, productFormSchema } from "@/lib/validation/productForm"
import { ProductCategory } from "@/components/forms/fields/category-select"

interface EditProductPageProps {
  params: {
    id: string
  }
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const [isLoading, setIsLoading] = React.useState(true)

  const form = useForm<productFormData>({
    resolver: valibotResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0.0,
      category: ProductCategory.Other,
      stock: 0,
      isActive: true,
      images: []
    }
  })

  // Mock loading product data - in real app this would fetch from API
  React.useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true)
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock product data - populate both form and images
        const mockProductData = {
          name: "Sample Product",
          description: "This is a sample product description that would come from the API...",
          price: 299.99,
          category: ProductCategory.Electronics,
          stock: 25,
          isActive: true,
          images: [
            "https://via.placeholder.com/400x300/0ea5e9/ffffff?text=Product+1",
            "https://via.placeholder.com/400x300/8b5cf6/ffffff?text=Product+2"
          ]
        }

        // Reset form with loaded data
        form.reset(mockProductData)
      } catch (error) {
        console.error("Failed to load product:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [params.id, form])

  const handleSubmit = (data: productFormData) => {
    console.log("Updated product data:", data)
  }

  const handleDelete = () => {
    // Handle product deletion - would show confirmation dialog first
    console.log("Delete product:", params.id)
  }

  return (
    <ProductForm
      mode="edit"
      productId={params.id}
      form={form}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      isLoading={isLoading}
    />
  )
}