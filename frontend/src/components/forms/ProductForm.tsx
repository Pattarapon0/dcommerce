"use client"

import * as React from "react"
import { ArrowLeft, Save, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { 
  ProductFormLayout, 
  ProductFormMain, 
  ProductFormSection 
} from "@/components/forms/product-form-layout"
import { CategorySelect } from "@/components/forms/fields/category-select"
import { ImageUpload } from "@/components/forms/fields/image-upload"
import { useRouter } from "next/navigation"
import { UseFormReturn } from "react-hook-form"
import { type productFormData } from "@/lib/validation/productForm"

interface ProductFormProps {
  mode: 'add' | 'edit'
  productId?: string
  form: UseFormReturn<productFormData>
  onSubmit: (data: productFormData) => void
  onDelete?: () => void
  isLoading?: boolean
}

export function ProductForm({
  mode,
  productId,
  form,
  onSubmit,
  onDelete,
  isLoading = false
}: ProductFormProps) {
  const router = useRouter()

  const formSubmit = (data: productFormData) => {
    onSubmit(data)
  }

  const isEditMode = mode === 'edit'
  const headerTitle = isEditMode ? "Edit Product" : "Add New Product"
  const headerDescription = isEditMode 
    ? `Update your product listing${productId ? ` • Product ID: ${productId}` : ""}`
    : "Create a new product listing for your store"
  const submitButtonText = isEditMode ? "Save Changes" : "Save Product"

  if (isLoading) {
    return (
      <ProductFormLayout>
        <div className="lg:col-span-12 flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Loading product...</p>
          </div>
        </div>
      </ProductFormLayout>
    )
  }

  return (
    <ProductFormLayout>
      <Form {...form}>
        {/* Header */}
        <div className="lg:col-span-12 mb-3 lg:mb-4">
          <div className="flex items-center gap-4 ">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{headerTitle}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {headerDescription}
              </p>
            </div>
          </div>
        </div>

        <form id="product-form" onSubmit={form.handleSubmit(formSubmit)} className="lg:col-span-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8">
          <ProductFormMain>
            {/* Basic Information */}
            <ProductFormSection 
              title="Basic Information" 
              description="Essential product details that customers will see"
            >
              <div className="space-y-4">
                {/* Product Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" className="h-10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <FormControl>
                        <CategorySelect
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price in THB */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (THB) *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                            ฿
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="h-10 pl-8"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ProductFormSection>

            {/* Inventory & Status */}
            <ProductFormSection 
              title="Inventory & Status" 
              description="Stock management and product availability"
            >
              <div className="space-y-4">
                {/* Stock */}
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          className="h-10"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Active Status */}
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Product Status</FormLabel>
                        <p className="text-sm text-gray-500">
                          {field.value ? "Active - visible to customers" : "Inactive - hidden from customers"}
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </ProductFormSection>

            {/* Description */}
            <ProductFormSection 
              title="Product Description" 
              description="Detailed information about your product"
            >
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your product features, benefits, and specifications..."
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between items-center">
                      <FormMessage />
                      <p className="text-xs text-gray-500">
                        {field.value?.length || 0}/2000 characters
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </ProductFormSection>

            {/* Images */}
            <ProductFormSection 
              title="Product Images" 
              description="Upload high-quality images of your product"
            >
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ImageUpload
                          value={field.value || []}
                          onChange={field.onChange}
                          maxImages={10}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </ProductFormSection>
          </ProductFormMain>

          {/* Sidebar with relative positioning container */}
          <div className="lg:col-span-5 pb-6 lg:pb-0 relative">
            <div className="lg:sticky lg:top-24 space-y-3 lg:space-y-4">
              {/* Desktop Actions - Hide on mobile to prevent duplication */}
              <div className="hidden lg:block">
                <ProductFormSection title="Actions">
                  <div className="space-y-3">
                    <Button type="submit" className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      {submitButtonText}
                    </Button>
                    <Button type="button" variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    {isEditMode && onDelete && (
                      <Button 
                        type="button" 
                        variant="destructive" 
                        className="w-full"
                        onClick={onDelete}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Product
                      </Button>
                    )}
                  </div>
                </ProductFormSection>
              </div>

              {/* Product Stats - Only show in edit mode */}
              {isEditMode && (
                <ProductFormSection title="Product Statistics">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">Jan 15, 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last updated:</span>
                      <span className="font-medium">2 days ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total sales:</span>
                      <span className="font-medium">127 units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Views:</span>
                      <span className="font-medium">1,234</span>
                    </div>
                  </div>
                </ProductFormSection>
              )}

            {/* Tips */}
            <ProductFormSection title={isEditMode ? "Tips for Better Performance" : "Tips for Better Listings"}>
              <div className="text-sm text-gray-600 space-y-3">
                {isEditMode ? (
                  <>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">📈 Boost Visibility</h4>
                      <p>Update your product regularly to stay relevant in search results.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">💰 Optimize Pricing</h4>
                      <p>Monitor competitor prices and adjust accordingly.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">📊 Track Performance</h4>
                      <p>Check your analytics to understand customer behavior.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">📸 High-Quality Images</h4>
                      <p>Use clear, well-lit photos from multiple angles. The first image will be your main product photo.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">📝 Detailed Descriptions</h4>
                      <p>Include key features, dimensions, materials, and care instructions.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">🏷️ Competitive Pricing</h4>
                      <p>Research similar products to set competitive prices.</p>
                    </div>
                  </>
                )}
              </div>
            </ProductFormSection>
          </div>
        </div>
        </div>
      </form>

      {/* Mobile Action Bar - Hybrid Custom Positioning */}
      <div className="action-bar-hybrid">
        <div className="action-bar-hybrid-content">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-12 text-base">
              <Eye className="h-5 w-5 mr-2" />
              Preview
            </Button>
            <Button type="submit" form="product-form" className="flex-1 h-12 text-base">
              <Save className="h-5 w-5 mr-2" />
              {submitButtonText}
            </Button>
          </div>
        </div>
      </div>
      </Form>
    </ProductFormLayout>
  )
}