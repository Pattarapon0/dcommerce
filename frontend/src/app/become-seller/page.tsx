'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { toast } from 'sonner'
import { sellerProfileSchema, type sellerProfileFormData } from '@/lib/validation/sellerProfile'
import BecomeSellerPageContent from '@/components/features/seller/BecomeSellerPageContent'
import imageCompression from 'browser-image-compression'
import { validateSellerProfileFile } from '@/lib/utils/imageValidation'
import { createSellerProfile, getPresignedUrl } from '@/lib/api/seller'
import { uploadToPresignedUrl } from '@/lib/utils/uploadUtils'
import { useRouteGuard } from '@/hooks/useRouteGuard'
//import { useRouter } from 'next/router'

export default function BecomeSellerPage() {
  //const router = useRouter();
  const { isChecking } = useRouteGuard({
    allowedRoles: ['Buyer'],
    unauthorizedRedirect: '/login',
    customRedirects: {
      'Seller': '/seller/dashboard'
    }
  });

  // React Hook Form setup
  const form = useForm<sellerProfileFormData>({
    resolver: valibotResolver(sellerProfileSchema),
    defaultValues: {
      BusinessName: '',
      BusinessDescription: ''
    }
  })

  // Avatar state (separate from form)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [isProcessingImage, setIsProcessingImage] = useState(false)

  // Image compression function (512x512px)
  const compressImage = async (file: File): Promise<string> => {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 5,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
      fileType: 'image/webp',
      initialQuality: 0.85
    })
    return URL.createObjectURL(compressedFile)
  }

  // Avatar upload handler
  const handleAvatarUpload = async (file: File) => {
    // Validate file using ImageValidator
    const validation = await validateSellerProfileFile(file)
    if (!validation.isValid) {
      const errorMessage = validation.errors[0]
      toast.error(errorMessage)
      return
    }

    // Compress image
    setIsProcessingImage(true)
    try {
      const compressedUrl = await compressImage(file)
      setAvatar(compressedUrl)
      toast.success('Image uploaded successfully')
    } catch {
      const errorMessage = 'Failed to process image'
      toast.error(errorMessage)
    } finally {
      setIsProcessingImage(false)
    }
  }

  // Avatar remove handler
  const handleAvatarRemove = () => {
    if (avatar) {
      URL.revokeObjectURL(avatar) // Clean up blob URL
    }
    setAvatar(null)
  }

  // Form submit handler
  const onSubmit = async (data: sellerProfileFormData) => {
    setIsSubmitting(true)
    toast.loading('Creating profile...', { id: 'create-profile' })

    try {
      let url = null
      if (avatar) {
        const blobRes = await fetch(avatar);
        const blob = await blobRes.blob();
        const response = await getPresignedUrl(blob);
        if (response) {
          if (response && response.MaxFileSize && blob.size > response.MaxFileSize) {
            toast.error('Image file is too large', { id: 'create-profile' });
            setIsSubmitting(false);
            return;
          }

          if (response && response.AllowedTypes && !response.AllowedTypes.includes(blob.type)) {
            toast.error('Image format not supported', { id: 'create-profile' });
            setIsSubmitting(false);
            return;
          }

          // Check expiration
          if (response && response.ExpiresAt && new Date() >= new Date(response.ExpiresAt)) {
            toast.error('Upload session expired. Please try again', { id: 'create-profile' });
            setIsSubmitting(false);
            return;
          }
          
          if (response.Url) {
            const uploadResult = await uploadToPresignedUrl(response.Url, blob);

            if (!uploadResult.success) {
              toast.error('Image upload failed', { id: 'create-profile' });
              setIsSubmitting(false);
              return;
            }
            
            url = response.Url;
          } else {
            toast.error('Upload preparation failed', { id: 'create-profile' });
            setIsSubmitting(false);
            return;
          }
        }
      }
        const createData = {
          ...data,
          AvatarUrl: url
        };
        await createSellerProfile(createData);
        console.log('Form submitted:', { data, avatar })
        toast.success('Profile created successfully!', { id: 'create-profile' });

        // TODO: Redirect to seller dashboard
        //router.push('/seller/dashboard');

    } catch {
      toast.error('Profile creation failed', { id: 'create-profile' });
    } finally {
      setIsSubmitting(false);
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Field change handler

  if (isChecking) {
    return <div>Loading...</div>;
  }

  return (
    <BecomeSellerPageContent
        form={form}
        avatar={avatar}
        isSubmitting={isSubmitting}
        isProcessingImage={isProcessingImage}
        onAvatarUpload={handleAvatarUpload}
        onAvatarRemove={handleAvatarRemove}
      onSubmit={form.handleSubmit(onSubmit)}
    />
  )
}