"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MapPin, User } from 'lucide-react';
import PersonalInfoSection from './PersonalInfoSection';
import AddressSection from './AddressSection';

export default function ProfilePageContent() {
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal information and shipping details</p>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">My Profile</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Update your personal details and shipping address
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Profile Complete
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="personal" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Personal Information
                </TabsTrigger>
                <TabsTrigger value="address" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Shipping Address
                </TabsTrigger>
              </TabsList>

              {/* Personal Information Tab */}
              <TabsContent value="personal" className="space-y-4 mt-0">
                <PersonalInfoSection />
              </TabsContent>

              {/* Shipping Address Tab */}
              <TabsContent value="address" className="space-y-4 mt-0">
                <AddressSection />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}