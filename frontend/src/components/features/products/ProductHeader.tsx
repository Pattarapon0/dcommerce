"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Share } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProductHeaderProps {
  onShare: () => void;
}

export default function ProductHeader({ 
  onShare 
}: ProductHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4">
      {/* Left side - Back button */}
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => router.back()}
        className="h-10 w-10"
        aria-label="Go back"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Center - Breadcrumb (hidden for now, can be added later) */}
      <div className="flex-1 text-center">
        <span className="text-sm text-gray-600 font-medium">Product Details</span>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onShare}
          className="h-10 w-10"
          aria-label="Share product"
        >
          <Share className="h-5 w-5 text-gray-600" />
        </Button>
      </div>
    </header>
  );
}