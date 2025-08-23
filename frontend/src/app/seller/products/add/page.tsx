"use client"

import * as React from "react"
import { ProductForm } from "@/components/forms/ProductForm"
import { useForm } from "react-hook-form"
import { valibotResolver } from "@hookform/resolvers/valibot"
import { type productFormData, productFormSchema } from "@/lib/validation/productForm"
import { ProductCategory } from "@/components/forms/fields/category-select"
import { getBatchPreSignUrl,createProduct,type CreateProductRequest } from "@/lib/api/products" 
import { toast } from "sonner"
import { uploadToPresignedUrl } from "@/lib/utils/uploadUtils"

export default function AddProductPage() {
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

  const handleSubmit = async (data: productFormData) => {
    // Combine form data for submission
    const fileNamePromises = data.images.map(async (image, index) => {
      const blob = await fetch(image).then(res => res.blob());
      const extension = blob.type.split('/').pop() || 'jpg';
      return `image-${index + 1}.${extension}`;
    });
    const fileNames = await Promise.all(fileNamePromises);
    const preSignUrlsResult = await getBatchPreSignUrl({ FileNames: fileNames });
    console.log("Pre-sign URLs:", preSignUrlsResult);
    const validImage = async (blobUrl: string,index:number) => {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      if (preSignUrlsResult?.MaxFileSize && blob.size > preSignUrlsResult?.MaxFileSize) {
            toast.error(`File #${index + 1} is too large`);
            throw new Error(`File #${index + 1} is too large`);
          }

          if (preSignUrlsResult?.AllowedTypes && !preSignUrlsResult?.AllowedTypes.includes(blob.type)) {
            toast.error(`#${index + 1} File type not supported`);
            throw new Error(`File type not supported for File #${index + 1}`);
          }

          // Check expiration
          if (preSignUrlsResult?.ExpiresAt && new Date() >= new Date(preSignUrlsResult?.ExpiresAt)) {
            toast.error('Upload session expired. Please try again');
            throw new Error(`Upload session expired. Please try again`);
          }
          return blob;
    };
    const uploadToR2 = async (blob: Blob, index: number) => {
      if(!preSignUrlsResult?.Results?.[index]?.UploadUrl)
        throw new Error(`some thing went wrong`);
      const response = await uploadToPresignedUrl(preSignUrlsResult?.Results?.[index]?.UploadUrl, blob);
      if (!response.success) {
        toast.error(`Failed to upload File #${index + 1}`);
        throw new Error(`Failed to upload File #${index + 1}`);
      }
      return preSignUrlsResult?.Results?.[index]?.UploadUrl;  
    };
    await Promise.all(data.images.map((image, index) => validImage(image, index))).then((blob) => {
      return Promise.all(blob.map((blob, index) => uploadToR2(blob, index)));
    }).then(async (uploadUrls) => {
      const productData: CreateProductRequest = {
        Name: data.name,
        Description: data.description,
        Price: data.price,
        Category: ProductCategory[data.category] as "Electronics" | "Clothing" | "Books" | "Home" | "Sports" | "Other" | undefined,
        Stock: data.stock,
        IsActive: data.isActive,
        Images: uploadUrls
      }
      console.log("Final product data to submit:", productData);
      await createProduct(productData);
    }).then(() => {
      window.location.href = "/seller/products";
    }).catch((error) => {});
    console.log("Product data:", data);
  }

  return (
    <ProductForm
      mode="add"
      form={form}
      onSubmit={handleSubmit}
    />
  )
}