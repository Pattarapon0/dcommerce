"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { valibotResolver } from "@hookform/resolvers/valibot"
import { type productFormData, productFormSchema } from "@/lib/validation/productForm"
import { ProductCategory } from "@/components/forms/fields/category-select"
import { useCreateProduct } from "@/hooks/useProductMutations"
import { useRouteGuard } from "@/hooks/useRouteGuard"
import { ProductForm } from "@/components/forms/ProductForm"



export default function AddProductPage() {
  const { isChecking } = useRouteGuard({
    allowedRoles: ['Seller'],
    unauthorizedRedirect: '/',
    customRedirects: {
      'Buyer': '/become-seller'
    }
  });

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

  const createProduct = useCreateProduct();

  const handleSubmit = (data: productFormData) => {
    createProduct.mutate(data);
  }

  if (isChecking) {
    return <div>Loading...</div>
  }

  return (
    <ProductForm
      mode="add"
      form={form}
      onSubmit={handleSubmit}
      isLoading={createProduct.isPending}
    />
  )
}