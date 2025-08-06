"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrencySelect } from '@/components/ui/currency-select';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Mail, Phone, User, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useAtomValue } from 'jotai';
import { userBasicAtom } from '@/lib/stores/auth';
import { useProfileDraft } from '@/lib/hooks/useProfileDraft';
import { Currency } from '@/lib/types';

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
  
  const userBasic = useAtomValue(userBasicAtom);

  // ✅ Local form state for current edits
  const [formData, setFormData] = useState(profileData || {});

  // Update local form when profileData changes
  if (profileData && JSON.stringify(formData) !== JSON.stringify(profileData)) {
    setFormData(profileData);
  }

  // ✅ Form handlers - auto-save to draft
  const handleFieldChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    saveDraft(newData);
  };

  // ✅ Reset to saved data
  const handleReset = () => {
    clearDraft();
    setFormData(profileData || {});
    toast.success('Reset to saved data');
  };

  // ✅ Submit profile changes
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await saveToServer(formData);
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input 
              id="firstName" 
              placeholder="Enter your first name"
              value={formData.FirstName || ''}
              onChange={(e) => handleFieldChange('FirstName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input 
              id="lastName" 
              placeholder="Enter your last name"
              value={formData.LastName || ''}
              onChange={(e) => handleFieldChange('LastName', e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Input 
              id="email" 
              type="email"
              value={userBasic?.email || ''}
              disabled
              className="bg-gray-50"
            />
            <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          <p className="text-xs text-muted-foreground">
            Your registered email address
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <div className="relative">
            <Input 
              id="phoneNumber" 
              type="tel"
              placeholder="Enter your phone number"
              value={formData.PhoneNumber || ''}
              onChange={(e) => handleFieldChange('PhoneNumber', e.target.value)}
            />
            <Phone className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <Separator />

      {/* Preferences Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <div className="relative">
              <Input 
                id="dateOfBirth" 
                type="date"
                value={formData.DateOfBirth ? new Date(formData.DateOfBirth).toISOString().split('T')[0] : ''}
                onChange={(e) => handleFieldChange('DateOfBirth', e.target.value)}
              />
              <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferredCurrency">Preferred Currency</Label>
            <CurrencySelect
              value={formData.PreferredCurrency as Currency}
              onValueChange={(value) => handleFieldChange('PreferredCurrency', value)}
              placeholder="Select currency"
              disabled={isSaving}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button 
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={!hasDraft}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Saved
        </Button>
        <Button 
          type="submit"
          disabled={isSaving}
          className="min-w-[120px]"
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
  );
}