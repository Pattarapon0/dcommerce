"use client";

import { Search, RotateCcw, Phone } from 'lucide-react';
import { OrderStatsDto } from '@/lib/mock-data/orders';
import { useFormatUserPrice } from '@/hooks/useUserCurrency';

interface OrdersSidebarProps {
  stats: OrderStatsDto;
  onQuickAction: (action: 'search' | 'recent' | 'support') => void;
}

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  iconBgColor: string;
}

const QuickActionButton = ({ 
  icon, 
  label, 
  description, 
  onClick, 
  iconBgColor 
}: QuickActionButtonProps) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 rounded-lg transition-colors group"
  >
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBgColor} group-hover:scale-105 transition-transform`}>
      {icon}
    </div>
    <div className="flex-1">
      <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
        {label}
      </h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </button>
);

export default function OrdersSidebar({ stats, onQuickAction }: OrdersSidebarProps) {
  const formatPrice = useFormatUserPrice();
  
  return (
    <div className="space-y-6">
      {/* Quick Stats Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Orders</span>
            <span className="font-semibold text-gray-900">{stats.totalOrders}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Spent</span>
            <span className="font-semibold text-gray-900">{formatPrice(stats.totalSpent)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Active Orders</span>
            <span className="font-semibold text-gray-900">{stats.activeOrders}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="space-y-2">
          <QuickActionButton
            icon={<Search className="h-6 w-6 text-blue-600" />}
            label="Search Orders"
            description="Find specific orders quickly"
            onClick={() => onQuickAction('search')}
            iconBgColor="bg-blue-100"
          />
          
          <QuickActionButton
            icon={<RotateCcw className="h-6 w-6 text-green-600" />}
            label="Recent Orders"
            description="View last 30 days"
            onClick={() => onQuickAction('recent')}
            iconBgColor="bg-green-100"
          />
          
          <QuickActionButton
            icon={<Phone className="h-6 w-6 text-purple-600" />}
            label="Contact Support"
            description="Get help with your orders"
            onClick={() => onQuickAction('support')}
            iconBgColor="bg-purple-100"
          />
        </div>
      </div>

      {/* Optional: Shopping Tips Card */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
        <div className="text-center">
          <div className="text-3xl mb-3">💡</div>
          <h4 className="font-semibold text-blue-900 mb-2">Shopping Tip</h4>
          <p className="text-sm text-blue-800">
            Add items to your cart and checkout together to save on shipping costs!
          </p>
        </div>
      </div>

      {/* Mobile: Hide sidebar on small screens - handled by parent grid */}
    </div>
  );
}