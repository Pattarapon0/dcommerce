import { Button } from '@/components/ui/button'
import { Store } from 'lucide-react'

interface SellerFormActionsProps {
  isSubmitting: boolean
  disabled?: boolean
  submitText?: string
}

export default function SellerFormActions({
  isSubmitting,
  disabled = false,
  submitText = "Create Seller Profile"
}: SellerFormActionsProps) {
  return (
    <div className="flex justify-end">
      <Button
        type="submit"
        disabled={disabled || isSubmitting}
        className="min-w-[180px]"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Creating Profile...
          </>
        ) : (
          <>
            <Store className="w-4 h-4 mr-2" />
            {submitText}
          </>
        )}
      </Button>
    </div>
  )
}