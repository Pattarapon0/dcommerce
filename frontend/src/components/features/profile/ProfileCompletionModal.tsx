"use client";

import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { toast } from "sonner";
import { Phone, User, MapPin, Calendar } from "lucide-react";

import { profileCompletionSchema, type ProfileCompletionFormData } from "@/lib/validation/profileCompletion";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProfileCompletionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Common countries for the select dropdown
const COUNTRIES = [
  "thailand",
  "united states",
  "united kingdom", 
  "canada",
  "australia",
  "germany",
  "france",
  "japan",
  "singapore",
  "malaysia",
  "other"
];

export default function ProfileCompletionModal({
  open,
  onClose,
  onSuccess
}: ProfileCompletionModalProps) {
  const { completeProfile, isCompleting } = useProfileCompletion();

  // Form setup with validation
  const form = useForm<ProfileCompletionFormData>({
    resolver: valibotResolver(profileCompletionSchema),
    defaultValues: {
      phoneNumber: "",
      dateOfBirth: undefined,
      country: "thailand"
    }
  });

  const onSubmit = async (data: ProfileCompletionFormData) => {
    try {
      await completeProfile(data);
      toast.success("Profile completed successfully!");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Failed to complete profile. Please try again.");
      console.error("Profile completion error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="profile-completion-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Complete Your Profile
          </DialogTitle>
          <DialogDescription id="profile-completion-description">
            We need a few more details to complete your profile. This information helps us provide better service.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Phone Number Field */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-900">
                    Phone Number *
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type="tel"
                        placeholder="+1234567890"
                        disabled={isCompleting}
                        className="pr-10"
                        maxLength={20}
                      />
                      <Phone className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </FormControl>
                  
                  {/* Help Text */}
                  <div className="text-xs text-gray-500">
                    Include country code (e.g., +1 for US, +66 for Thailand)
                  </div>
                  
                  {/* Error Display */}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date of Birth Field */}
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-900">
                    Date of Birth *
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="date"
                        disabled={isCompleting}
                        className="pr-10"
                        max={new Date().toISOString().split('T')[0]} // Today's date
                        min="1900-01-01"
                        value={field.value ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value + 'T00:00:00') : undefined;
                          field.onChange(date);
                        }}
                      />
                      <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </FormControl>
                  
                  {/* Help Text */}
                  <div className="text-xs text-gray-500">
                    You must be at least 13 years old
                  </div>
                  
                  {/* Error Display */}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Country Field */}
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-900">
                    Country
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isCompleting}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <SelectValue placeholder="Select your country" />
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country.charAt(0).toUpperCase() + country.slice(1).replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Help Text */}
                  <div className="text-xs text-gray-500">
                    This helps us show relevant content and shipping options
                  </div>
                  
                  {/* Error Display */}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isCompleting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCompleting}
                className="min-w-[100px]"
              >
                {isCompleting ? "Completing..." : "Complete Profile"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}