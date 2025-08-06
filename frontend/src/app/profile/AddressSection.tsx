"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CountrySelect } from '@/components/ui/country-select';
import { Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useUserAddressDraft } from '@/lib/hooks/useUserAddressDraft';

export default function AddressSection() {
  // ✅ Address management with draft support
  const {
    data: addressData,
    hasDraft,
    saveDraft,
    clearDraft,
    saveToServer,
    isSaving,
    isLoading
  } = useUserAddressDraft();

  // ✅ Local form state for current edits
  const [formData, setFormData] = useState(addressData || {});

  // Update local form when addressData changes
  if (addressData && JSON.stringify(formData) !== JSON.stringify(addressData)) {
    setFormData(addressData);
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
    setFormData(addressData || {});
    toast.success('Reset to saved data');
  };

  // ✅ Submit address changes
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await saveToServer(formData);
      // Check if this is first time creating address vs updating
      const isCreating = !addressData || Object.keys(addressData).length === 0;
      toast.success(isCreating ? 'Address created successfully!' : 'Address updated successfully!');
    } catch {
      toast.error('Failed to save address');
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
      {/* Shipping Address Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Shipping Address</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address Line 1</Label>
            <Input 
              id="addressLine1" 
              placeholder="Street address"
              value={formData.Address || ''}
              onChange={(e) => handleFieldChange('Address', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input 
              id="addressLine2" 
              placeholder="Apartment, suite, etc."
              value={formData.AddressLine2 || ''}
              onChange={(e) => handleFieldChange('AddressLine2', e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input 
              id="city" 
              placeholder="City"
              value={formData.City || ''}
              onChange={(e) => handleFieldChange('City', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State/Province</Label>
            <Input 
              id="state" 
              placeholder="State"
              value={formData.State || ''}
              onChange={(e) => handleFieldChange('State', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input 
              id="postalCode" 
              placeholder="Postal code"
              value={formData.PostalCode || ''}
              onChange={(e) => handleFieldChange('PostalCode', e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <CountrySelect
            value={formData.Country || ''}
            onValueChange={(value) => handleFieldChange('Country', value)}
            placeholder="Select country..."
          />
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