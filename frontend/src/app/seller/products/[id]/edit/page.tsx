"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"
import dynamic from "next/dynamic"
import { useForm } from "react-hook-form"
import { valibotResolver } from "@hookform/resolvers/valibot"
import { type productFormData, productFormSchema } from "@/lib/validation/productForm"
import { ProductCategory } from "@/components/forms/fields/category-select"
import { useUpdateProduct, useDeleteProduct } from "@/hooks/useProductMutations"
import { useRouteGuard } from "@/hooks/useRouteGuard"
import { useGetProductById } from "@/hooks/useProduct"
import { ProductDto } from "@/lib/api/products"

// Dynamically import ProductForm with better loading
const ProductForm = dynamic(() => import("@/components/forms/ProductForm").then(mod => ({ default: mod.ProductForm })), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96">Loading form...</div>
})

export default function EditProductPage() {
  const params = useParams();
  let id = "";
  if (params.id) {
    if (Array.isArray(params.id)) {
      id = params.id[0];
    } else {
      id = params.id as string;
    }
  }
  const { isChecking } = useRouteGuard({
    allowedRoles: ['Seller'],
    unauthorizedRedirect: '/',
    customRedirects: {
      'Buyer': '/become-seller'
    }
  });

  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const serverProduct = useGetProductById(id);
  const localProduct = JSON.parse(localStorage.getItem('editProduct') || '{}') as ProductDto;
  const originalProduct = useMemo(() => serverProduct.data || localProduct, [serverProduct.data, localProduct]);
  // Helper function to map backend category string to enum
  const mapStringToCategory = (categoryString: string | undefined): ProductCategory => {
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
    values: {
      name: originalProduct.Name || "",
      description: originalProduct.Description || "",
      price: originalProduct.Price || 0.0,
      category: mapStringToCategory(originalProduct.Category) || ProductCategory.Other,
      stock: originalProduct.Stock || 0,
      isActive: originalProduct.IsActive ?? true,
      images: originalProduct.Images || []
    }
  })
  const handleSubmit = (data: productFormData) => {
    const keys: (keyof productFormData)[] = ['name', 'description', 'price', 'category', 'stock', 'isActive', 'images'];
    const keyMap: Record<keyof productFormData, keyof typeof originalProduct> = {
      name: "Name",
      description: "Description",
      price: "Price",
      category: "Category",
      stock: "Stock",
      isActive: "IsActive",
      images: "Images"
    };
    const changedFields = keys.filter(key => data[key] !== originalProduct[keyMap[key]]);
    if (changedFields) {
      const changedData: Record<string, string | number | boolean | string[]> = {};
      for (const key of changedFields) {
        changedData[key] = data[key as keyof typeof data];
      }
      updateProduct.mutate({ productId: id, data: changedData });
    }
  }

  const handleDelete = () => {
    deleteProduct.mutate(id);
    localStorage.removeItem('editProduct');
  }

  if (isChecking) {
    return <div>Loading...</div>
  }

  return (
    <ProductForm
      mode="edit"
      form={form}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      isLoading={!form || updateProduct.isPending}
      productData={(() => {
        const storedProduct = localStorage.getItem('editProduct');
        if (storedProduct) {
          const data = JSON.parse(storedProduct);
          return {
            createdAt: data.CreatedAt as string,
            updatedAt: data.UpdatedAt as string,
            salesCount: data.SalesCount as number,
            name: data.Name as string
          };
        }
        return undefined;
      })()}
    />
  )
}