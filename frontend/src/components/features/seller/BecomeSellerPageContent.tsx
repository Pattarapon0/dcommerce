import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import BusinessInfoForm from './BusinessInfoForm'
import { UseFormReturn } from 'react-hook-form'
import { sellerProfileFormData } from '@/lib/validation/sellerProfile'

interface BecomeSellerPageContentProps {
  form: UseFormReturn<sellerProfileFormData>
  avatar: string | null
  isSubmitting: boolean
  isProcessingImage: boolean
  onAvatarUpload: (file: File) => void
  onAvatarRemove: () => void
  onSubmit: () => void
}

export default function BecomeSellerPageContent({
  form,
  avatar,
  isSubmitting,
  isProcessingImage,
  onAvatarUpload,
  onAvatarRemove,
  onSubmit
}: BecomeSellerPageContentProps) {
  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Become a Seller</h1>
          <p className="text-gray-600 mt-2">Start your selling journey today and reach thousands of customers</p>
        </div>

        {/* Main Card */}
        <Card className="shadow-sm gap-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Seller Profile</CardTitle>
                <div className="text-sm text-muted-foreground mt-1">
                  Tell us about your business to get started
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <BusinessInfoForm
              form={form}
              avatar={avatar}
              isSubmitting={isSubmitting}
              isProcessingImage={isProcessingImage}
              onAvatarUpload={onAvatarUpload}
              onAvatarRemove={onAvatarRemove}
              onSubmit={onSubmit}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}