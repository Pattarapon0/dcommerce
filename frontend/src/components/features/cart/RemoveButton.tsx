"use client";

interface RemoveButtonProps {
  onClick: () => void;
  productName: string;
  disabled?: boolean;
}

export default function RemoveButton({ onClick, productName, disabled = false }: RemoveButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="shrink-0 ml-2 opacity-70 hover:opacity-100 text-gray-500 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded"
      aria-label={`Remove ${productName} from cart`}
      title={`Remove ${productName} from cart`}
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  );
}