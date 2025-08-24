"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { useForm } from "react-hook-form"
import { valibotResolver } from "@hookform/resolvers/valibot"
import { type productFormData, productFormSchema } from "@/lib/validation/productForm"
import { ProductCategory } from "@/components/forms/fields/category-select"

// Dynamically import ProductForm with SSR disabled
const ProductForm = dynamic(() => import("@/components/forms/ProductForm").then(mod => ({ default: mod.ProductForm })), {
  ssr: false,
  loading: () => <div>Loading...</div>
})

interface EditProductPageProps {
  params: {
    id: string
  }
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = React.use(params)
  const [isLoading, setIsLoading] = React.useState(true)

  // Helper function to map backend category string to enum
  const mapStringToCategory = (categoryString: string): ProductCategory => {
    switch (categoryString) {
      case "Electronics": return ProductCategory.Electronics;
      case "Clothing": return ProductCategory.Clothing;
      case "Books": return ProductCategory.Books;
      case "Home": return ProductCategory.Home;
      case "Sports": return ProductCategory.Sports;
      case "Other": return ProductCategory.Other;
      default: return ProductCategory.Other;
    }
  };

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

  // Load product data from localStorage or API
  React.useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true)
      try {
        // First try to get product data from localStorage
        const storedProduct = localStorage.getItem('editProduct');
        console.log("Stored product data:", JSON.parse(storedProduct?? "{}"));
        if (storedProduct) {
          const productData = JSON.parse(storedProduct);
          
          // Map ProductDto to form data
          const formData = {
            name: productData.Name || "",
            description: productData.Description || "",
            price: productData.Price || 0.0,
            category: mapStringToCategory(productData.Category) || ProductCategory.Other,
            stock: productData.Stock || 0,
            isActive: productData.IsActive ?? true,
            images: productData.MainImage ? [productData.MainImage] : []
          };
          
          form.reset(formData);
          
          // Data loaded successfully from localStorage
        } else {
          // Fallback to API call if no localStorage data
          console.warn("No localStorage data found, would fetch from API with ID:", id);
          
          // Mock API call - replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
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
          };
          
          form.reset(mockProductData);
        }
      } catch (error) {
        console.error("Failed to load product:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [id, form])

  const handleSubmit = (data: productFormData) => {
    console.log("Updated product data:", data)
  }

  const handleDelete = () => {
    // Handle product deletion - would show confirmation dialog first
    console.log("Delete product:", id)
  }

  return (
    <ProductForm
      mode="edit"
      productId={id}
      form={form}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      isLoading={isLoading}
    />
  )
}