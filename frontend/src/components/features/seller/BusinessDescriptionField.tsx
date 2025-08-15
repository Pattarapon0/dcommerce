import { Textarea } from '@/components/ui/textarea'
import { FileText } from 'lucide-react'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Control } from 'react-hook-form'
import { sellerProfileFormData } from '@/lib/validation/sellerProfile'

interface BusinessDescriptionFieldProps {
  control: Control<sellerProfileFormData>
  disabled?: boolean
  placeholder?: string
  maxLength?: number
}

export default function BusinessDescriptionField({
  control,
  disabled = false,
  placeholder = "Describe your business, products, and what makes you unique...",
  maxLength = 1000
}: BusinessDescriptionFieldProps) {
  return (
    <FormField
      control={control}
      name="BusinessDescription"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-semibold text-gray-900">
            Business Description
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Textarea
                {...field}
                placeholder={placeholder}
                disabled={disabled}
                className="min-h-[120px] resize-none"
                maxLength={maxLength}
              />
              <FileText className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </FormControl>
          
          {/* Character Count */}
          <div className="flex justify-between text-xs text-gray-500">
            <span>Optional - Tell customers about your business</span>
            <span>{field.value.length}/{maxLength}</span>
          </div>
          
          {/* Error Display */}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}