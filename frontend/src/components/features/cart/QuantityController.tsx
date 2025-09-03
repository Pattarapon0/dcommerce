"use client";

interface QuantityControllerProps {
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export default function QuantityController({ 
  value, 
  onChange, 
  min = 1, 
  max = 99, 
  disabled = false 
}: QuantityControllerProps) {
  const handleDecrease = () => {
    if (value > min && !disabled) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value < max && !disabled) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || min;
    if (newValue >= min && newValue <= max && !disabled) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleDecrease}
        disabled={disabled || value <= min}
        className="border rounded-md w-8 h-8 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        aria-label="Decrease quantity"
      >
        −
      </button>
      
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        disabled={disabled}
        className="w-12 text-center border rounded-md py-1 text-sm tabular-nums disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
      />
      
      <button
        onClick={handleIncrease}
        disabled={disabled || value >= max}
        className="border rounded-md w-8 h-8 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}