import BusinessNameField from './BusinessNameField'
import BusinessDescriptionField from './BusinessDescriptionField'
import SellerAvatarSection from './SellerAvatarSection'
import SellerFormActions from './SellerFormActions'
import { UseFormReturn } from 'react-hook-form'
import { sellerProfileFormData } from '@/lib/validation/sellerProfile'
import { Form } from '@/components/ui/form'

interface BusinessInfoFormProps {
  form: UseFormReturn<sellerProfileFormData>
  avatar: string | null
  isSubmitting: boolean
  isProcessingImage: boolean
  onAvatarUpload: (file: File) => void
  onAvatarRemove: () => void
  onSubmit: () => void
}

export default function BusinessInfoForm({
  form,
  avatar,
  isSubmitting,
  isProcessingImage,
  onAvatarUpload,
  onAvatarRemove,
  onSubmit
}: BusinessInfoFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        
        {/* Business Information Section */}
        <div>

          {/* Avatar Section */}
          <SellerAvatarSection
            currentAvatar={avatar}
            onFileSelect={onAvatarUpload}
            onRemove={onAvatarRemove}
            disabled={isSubmitting}
            isProcessing={isProcessingImage}
          />

          {/* Business Fields */}
          <div className="space-y-4">
            <BusinessNameField
              control={form.control}
              disabled={isSubmitting}
            />
            
            <BusinessDescriptionField
              control={form.control}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-gray-100">
          <SellerFormActions
            isSubmitting={isSubmitting}
            disabled={isSubmitting || isProcessingImage}
          />
        </div>
      </form>
    </Form>
  )
}