'use client';

import { successToasts, toast, testToastSystem, showToast, clearAllToasts } from '@/lib/toast';
import { useState, useEffect } from 'react';

export default function TestToastPage() {
  const [testResults, setTestResults] = useState<string>('');

  // Make functions available in browser console
  useEffect(() => {
    (window as typeof window & {
      testToastSystem: typeof testToastSystem;
      successToasts: typeof successToasts;
      toast: typeof toast;
      showToast: typeof showToast;
      clearAllToasts: typeof clearAllToasts;
    }).testToastSystem = testToastSystem;
    (window as typeof window & { successToasts: typeof successToasts }).successToasts = successToasts;
    (window as typeof window & { toast: typeof toast }).toast = toast;
    (window as typeof window & { showToast: typeof showToast }).showToast = showToast;
    (window as typeof window & { clearAllToasts: typeof clearAllToasts }).clearAllToasts = clearAllToasts;
    console.log('🧪 Toast test functions available in console');
    console.log('Available commands: testToastSystem(), successToasts.login(), toast(), clearAllToasts()');
  }, []);

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-8">Toast System Test Page</h1>
      <p className="text-gray-600 mb-8">
        Test the Sonner-based toast system with various scenarios. 
        All functions are also available in the browser console.
      </p>
      
      {/* Success Toast Tests */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Success Toasts</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => successToasts.login()}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Login Success
          </button>
          <button 
            onClick={() => successToasts.register()}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Register Success
          </button>
          <button 
            onClick={() => successToasts.addedToCart('iPhone 15')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Added to Cart
          </button>
          <button 
            onClick={() => successToasts.orderPlaced('ORD123')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Order Placed
          </button>
        </div>
      </section>

      {/* Error Toast Tests */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Error Toasts</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button 
            onClick={() => toast.error('Invalid email or password', { 
              description: 'Authentication Error' 
            })}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Auth Error
          </button>
          <button 
            onClick={() => toast.warning('Sorry, this item is out of stock', { 
              description: 'Product Error' 
            })}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Stock Error
          </button>
          <button 
            onClick={() => toast.error('Something went wrong on our end', { 
              description: 'Server Error' 
            })}
            className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
          >
            Server Error
          </button>
        </div>
      </section>

      {/* Custom Toasts */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Custom Toasts</h2>
        <div className="flex gap-4 flex-wrap">
          <button 
            onClick={() => toast.info('This is an info message', { 
              description: 'Information' 
            })}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Info Toast
          </button>
          <button 
            onClick={() => toast.warning('This is a warning', { 
              description: 'Warning' 
            })}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Warning Toast
          </button>
          <button 
            onClick={() => toast.success('Custom success message', { 
              description: 'Success' 
            })}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Custom Success
          </button>
          <button 
            onClick={() => toast('Basic toast message')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Basic Toast
          </button>
        </div>
      </section>

      {/* Advanced Toasts */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Advanced Toasts</h2>
        <div className="flex gap-4 flex-wrap">
          <button 
            onClick={() => toast.success('Action completed!', {
              description: 'This toast has an action button',
              action: {
                label: 'Undo',
                onClick: () => toast.info('Undo clicked!')
              }
            })}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Toast with Action
          </button>
          <button 
            onClick={() => toast.loading('Processing...', { duration: 3000 })}
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
          >
            Loading Toast
          </button>
          <button 
            onClick={() => {
              const toastId = toast.loading('Processing...');
              setTimeout(() => {
                toast.success('Completed!', { id: toastId });
              }, 2000);
            }}
            className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
          >
            Loading → Success
          </button>
        </div>
      </section>

      {/* Automated Tests */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Automated Tests</h2>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              console.clear();
              testToastSystem();
              setTestResults('Test completed! Check console for details.');
            }}
            className="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600"
          >
            Run Full Test Suite
          </button>
          <button 
            onClick={() => {
              toast.dismiss();
              setTestResults('All toasts cleared!');
            }}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Clear All Toasts
          </button>
        </div>
        {testResults && (
          <div className="mt-4 p-4 bg-blue-100 rounded">
            <p>{testResults}</p>
          </div>
        )}
      </section>

      {/* Instructions */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Console Commands</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p className="mb-2">Available in browser console:</p>
          <ul className="text-sm space-y-1 font-mono">
            <li><code>testToastSystem()</code> - Run full test suite</li>
            <li><code>successToasts.login()</code> - Test success toasts</li>
            <li><code>toast.success(&apos;Message&apos;)</code> - Show success toast</li>
            <li><code>toast.error(&apos;Message&apos;)</code> - Show error toast</li>
            <li><code>toast.dismiss()</code> - Clear all toasts</li>
            <li><code>clearAllToasts()</code> - Clear all toasts (alias)</li>
          </ul>
          <p className="mt-4 text-sm text-gray-600">
            💡 Try different toast types and see how they appear with Sonner&apos;s beautiful animations!
          </p>
        </div>
      </section>
    </div>
  );
}