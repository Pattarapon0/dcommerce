import { Input } from '@/components/ui/input'
import { Store } from 'lucide-react'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Control } from 'react-hook-form'
import { sellerProfileFormData } from '@/lib/validation/sellerProfile'

interface BusinessNameFieldProps {
  control: Control<sellerProfileFormData>
  disabled?: boolean
  placeholder?: string
}

export default function BusinessNameField({
  control,
  disabled = false,
  placeholder = "Enter your business name"
}: BusinessNameFieldProps) {
  return (
    <FormField
      control={control}
      name="businessName"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-semibold text-gray-900">
            Business Name *
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                type="text"
                placeholder={placeholder}
                disabled={disabled}
                className="pr-10"
                maxLength={200}
              />
              <Store className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </FormControl>
          
          {/* Character Count */}
          <div className="flex justify-between text-xs text-gray-500">
            <span>Min 2 characters, max 200 characters</span>
            <span>{field.value.length}/200</span>
          </div>
          
          {/* Error Display */}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}