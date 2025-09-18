import { useMutation} from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getBatchPreSignUrl,
  type CreateProductRequest,
  type UpdateProductRequest,
  type BatchUploadUrlRequest
} from '@/lib/api/products';
import { uploadToPresignedUrl } from '@/lib/utils/uploadUtils';
import { ProductCategory } from '@/components/forms/fields/category-select';
import { type productFormData } from '@/lib/validation/productForm';
import { queryClient } from '@/components/providers/AuthProviders';


export type productPatch= Partial<Pick<productFormData, keyof productFormData>>;

async function getBatchImageR2Url(data: { images: string[] }) {
  const blobs = await Promise.all(data.images.map(image => fetch(image).then(res => res.blob())));
  const fileNamePromises = blobs.map((blob, index) => {
    const extension = blob.type.split('/').pop() || 'jpg';
    return `image-${index + 1}.${extension}`;
  });
      const fileNames = await Promise.all(fileNamePromises);

      // Get pre-signed URLs
      const preSignUrlsResult = await getBatchPreSignUrl({ FileNames: fileNames });

      // Validate and upload images
      const validImage = async (blob: Blob, index: number) => {
        if (preSignUrlsResult?.MaxFileSize && blob.size > preSignUrlsResult?.MaxFileSize) {
          throw new Error(`File #${index + 1} is too large`);
        }

        if (preSignUrlsResult?.AllowedTypes && !preSignUrlsResult?.AllowedTypes.includes(blob.type)) {
          throw new Error(`File type not supported for File #${index + 1}`);
        }

        if (preSignUrlsResult?.ExpiresAt && new Date() >= new Date(preSignUrlsResult?.ExpiresAt)) {
          throw new Error('Upload session expired. Please try again');
        }

        return blob;
      };

      const uploadToR2 = async (blob: Blob, index: number) => {
        if (!preSignUrlsResult?.Results?.[index]?.UploadUrl) {
          throw new Error('Something went wrong with upload URL generation');
        }

        const response = await uploadToPresignedUrl(preSignUrlsResult.Results[index].UploadUrl, blob);
        if (!response.success) {
          throw new Error(`Failed to upload File #${index + 1}`);
        }

        return preSignUrlsResult.Results[index].UploadUrl;
      };

      // Process all images
      const blobsFile = await Promise.all(blobs.map((blob, index) => validImage(blob, index)));
      const uploadUrls = await Promise.all(blobsFile.map((blob, index) => uploadToR2(blob, index)));
      return uploadUrls;
}


export function useCreateProduct() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: productFormData) => {
      const uploadUrls = await getBatchImageR2Url({ images: data.images });
      // Create product data
      const productData: CreateProductRequest = {
        Name: data.name,
        Description: data.description,
        Price: data.price,
        Category: data.category !== undefined ? ProductCategory[data.category] as "Electronics" | "Clothing" | "Books" | "Home" | "Sports" | "Other" : undefined,
        Stock: data.stock,
        IsActive: data.isActive,
        Images: uploadUrls
      };

      return await createProduct(productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProducts'] });
      toast.success('Product created successfully!');
      router.push('/seller/products');
    },
    onError: () => {
      const message = 'Failed to create product';
      toast.error(message);
    },
  });
}

export function useUpdateProduct() {
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ productId, data }: { productId: string; data: productPatch }) => {
      // For update, we might need to handle new image uploads vs existing ones
      // This is a simplified version - you may need to add image upload logic here too
      if (data.images) {
        const newImages = data.images.filter(img => img.startsWith('blob:'));
        if(newImages.length > 0){
          const uploadUrls = await getBatchImageR2Url({ images: newImages });
          // Update the image URLs in the data
          data.images = data.images.map((img, index) => img && img.startsWith('blob:') ? uploadUrls[index] : img);
        }
      }
      const updateData: UpdateProductRequest = {
        Name: data.name,
        Description: data.description,
        Price: data.price,
        Category: data.category !== undefined ? ProductCategory[data.category] as "Electronics" | "Clothing" | "Books" | "Home" | "Sports" | "Other" : undefined,
        Stock: data.stock,
        IsActive: data.isActive,
        Images: data.images
      };
      return await updateProduct(productId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProducts'] });
      toast.success('Product updated successfully!');
      router.push('/seller/products');
    },
    onError: () => {
      toast.error('Failed to update product');
    },
  });
}

export function useDeleteProduct() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (productId: string) => {
      return await deleteProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProducts'] });
      toast.success('Product deleted successfully');
      router.push('/seller/products');
    },
    onError: () => {
      toast.error('Failed to delete product. Please try again.');
    },
  });
}

export function useToggleProductStatus() {
  return useMutation({
    mutationFn: async (productId: string) => {
      return await toggleProductStatus(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProducts'] });
      toast.success('Product status updated!');
    },
    onError: () => {
      toast.error('Failed to toggle product status');
    },
  });
}

export function useBatchUploadUrls() {
  return useMutation({
    mutationFn: async (data: BatchUploadUrlRequest) => {
      return await getBatchPreSignUrl(data);
    },
    onSuccess: () => {
    },
    onError: () => {
      toast.error('Failed to generate upload URLs');
    },
  });
}