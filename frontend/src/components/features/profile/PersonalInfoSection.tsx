"use client";

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrencySelect } from '@/components/forms/fields/currency-select';
import { Mail, Phone, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useAtomValue } from 'jotai';
import { userBasicAtom } from '@/stores/auth';
import { userDraftProfileAvatarAtom, userProfileAvatarAtom, isDraftNoAvatarAtom } from '@/stores/avatar';
import { useProfileDraft } from '@/hooks/useProfileDraft';
import { Currency } from '@/lib/types';
import { AvatarUpload, AvatarUploadRef } from '@/components/forms/fields/avatar-upload';
import { getPresignedUrl, confirmAvatarUpload } from '@/lib/api/avatar';
import { useForm, Controller } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { profileSchema, type ProfileFormData } from '@/lib/validation/profile';
import { uploadToPresignedUrl } from '@/lib/utils/uploadUtils';


export default function PersonalInfoSection() {
  // ✅ Profile management with draft support
  const {
    data: profileData,
    hasDraft,
    saveDraft,
    clearDraft,
    saveToServer,
    isSaving,
    isLoading
  } = useProfileDraft();
  const userServerAvatarState = useAtomValue(userProfileAvatarAtom);
  const userAvatarState = useAtomValue(userDraftProfileAvatarAtom);
  const userBasic = useAtomValue(userBasicAtom);
  const avatarRef = useRef<AvatarUploadRef>(null);
  const isDraftNoAvatar = useAtomValue(isDraftNoAvatarAtom);

  // ✅ Local form state for current edits
  const {
    register,
    control,
    handleSubmit,
  } = useForm<ProfileFormData>({
    resolver: valibotResolver(profileSchema),
    values: profileData ? {
      FirstName: profileData.FirstName || '',
      LastName: profileData.LastName || '',
      PhoneNumber: profileData.PhoneNumber || '',
      DateOfBirth: profileData.DateOfBirth ? new Date(profileData.DateOfBirth) : undefined,
      PreferredCurrency: profileData.PreferredCurrency as Currency || undefined
    } : {
      FirstName: '',
      LastName: '',
      PhoneNumber: '',
      DateOfBirth: undefined,
      PreferredCurrency: undefined
    }
  });

  const displayAvatar = userAvatarState.state === 'hasData' ? userAvatarState.data ? userAvatarState.data : userServerAvatarState.state === 'hasData' ? userServerAvatarState.data : null : null;

  // ✅ Reset to saved data - hybrid approach
  const handleReset = async () => {
    console.log('Reset clicked - before:', {
      hasDraft,
      displayAvatar
    });
    clearDraft();
    avatarRef.current?.reset(); // Reset avatar component and trigger atom invalidation
    console.log('Reset completed - after:', {
      hasDraft: false, // clearDraft will make this false
      displayAvatar: 'will be from atom'
    });

    toast.success('Reset to saved data');
  };

  // ✅ Submit profile changes
  const handleSubmits = async (data: ProfileFormData) => {
    try {
      if (displayAvatar) {
        // Step 1: Get presigned URL from your backend
        const res = await fetch(displayAvatar);
        const blob = await res.blob();
        const response = await getPresignedUrl(blob);
        if (response) {
          if (response.MaxFileSize && blob.size > response.MaxFileSize) {
            toast.error('File is too large');
            return; // Cancel everything
          }

          if (response.AllowedTypes && !response.AllowedTypes.includes(blob.type)) {
            toast.error('File type not supported');
            return; // Cancel everything
          }

          // Check expiration
          if (response.ExpiresAt && new Date() >= new Date(response.ExpiresAt)) {
            toast.error('Upload session expired. Please try again');
            return; // Cancel everything
          }

          // Step 4: Upload to UploadThing using the presigned URL
          if (response.Url) {
            const uploadResult = await uploadToPresignedUrl(response.Url, blob);
             if (!uploadResult.success) {
              toast.error('Image upload failed');
              return;
            }

            console.log('Avatar uploaded successfully');

            // Step 5: Confirm the upload with your backend
            const originalFileName = `avatar.${blob.type.split('/')[1]}`;
            const confirmResponse = await confirmAvatarUpload(response.Url, originalFileName);
            console.log('Avatar upload confirmed - Full response:', confirmResponse);
          }
        }
      }

      // Only save profile if avatar upload succeeded (or no avatar)
      if (hasDraft) {
        const dataToSave = {
          ...data,
          DateOfBirth: data.DateOfBirth ? data.DateOfBirth.toISOString().split('T')[0] : undefined
        };
        await saveToServer(dataToSave);
      }
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Something went wrong');
      // Everything is cancelled automatically due to try-catch
    }
  };

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }
  return (
    <div className="space-y-5">
      {/* MAIN FORM - Visual Priority */}
      <form onSubmit={handleSubmit(handleSubmits)} className="space-y-5">

        {/* Personal Information Section - HERO */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>

          {/* Avatar - Treated like a form field */}
          <AvatarUpload
            ref={avatarRef}
            currentAvatar={displayAvatar}
            onError={(error) => toast.error(error)}
            disabled={isSaving}
            hasGlobalChanges={userAvatarState.state === 'hasData' ? userAvatarState.data ? true : false : false}
          />

          {/* Show avatar loading/error state */}
          {userAvatarState.state === 'loading' && (
            <div className="text-sm text-blue-600 flex items-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent"></div>
              Loading profile picture...
            </div>
          )}

          {userAvatarState.state === 'hasError' && (
            <div className="text-sm text-red-600 flex items-center gap-2">
              <span>Failed to load profile picture</span>
              <button
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Main Form Fields - Large and Prominent */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-semibold text-gray-900">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="Enter your first name"
                  {...register('FirstName', { onChange: (e) => saveDraft({ FirstName: e.target.value }) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-semibold text-gray-900">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Enter your last name"
                  {...register('LastName', { onChange: (e) => saveDraft({ LastName: e.target.value }) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-900">Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={userBasic?.email || ''}
                  disabled
                  className="bg-gray-50 pr-10"
                />
                <Mail className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">Your registered email address</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-semibold text-gray-900">Phone Number</Label>
              <div className="relative">
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Enter your phone number"
                  {...register('PhoneNumber', { onChange: (e) => saveDraft({ PhoneNumber: e.target.value }) })}
                  className="pr-10"
                />
                <Phone className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Section - Clear Separation */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-gray-900">Date of Birth</Label>
              <Controller
                name="DateOfBirth"
                control={control}
                render={({ field }) => (
                  <Input
                    id="DateOfBirth"
                    type="date"
                    value={field.value ? field.value.toISOString().split('T')[0] : ""}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : undefined;
                      field.onChange(date);
                      saveDraft({ DateOfBirth: e.target.value });
                    }}
                    className="w-40 cursor-pointer"
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredCurrency" className="text-sm font-semibold text-gray-900">Preferred Currency</Label>
              <div className="w-48">
                <Controller
                  name="PreferredCurrency"
                  control={control}
                  render={({ field }) => (
                    <CurrencySelect
                      value={field.value}
                      onValueChange={(value) => {
                        if (value) {
                          field.onChange(value);
                          saveDraft({ PreferredCurrency: value });
                        }
                      }}
                      placeholder="Select currency"
                      disabled={isSaving}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Action Buttons - Connected to Form */}
        <div className="flex justify-end gap-3 pt-5 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!hasDraft && (userAvatarState.state === 'hasData' ? userAvatarState.data ? false : true : true) && !isDraftNoAvatar}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="min-w-[140px]"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}