# Checkout Page UI Design

## API Data

### Order Creation
**Endpoint**: `POST /api/v1/orders/from-cart` (simple)
**Endpoint**: `POST /api/v1/orders` (manual)

**Manual Order Payload**:
```json
{
  "Items": [{"ProductId": "guid", "Quantity": 1}],
  "ShippingAddress": "JSON string", 
  "Notes": "optional"
}
```

### Address Fields (from backend)
- `Address` (required, max 200)
- `AddressLine2` (optional, max 200)  
- `City` (required, max 100)
- `State` (required, max 100)
- `Country` (required, max 100)
- `PostalCode` (required, max 20)

### Cart Data (existing)
- `cart.Items[]` - for order summary
- `cart.TotalAmount` - for calculations
- `cart.TotalItems` - for item count

## Layout & Responsive Rules

### Mobile-First (< 1024px)
- Single column form
- Order summary collapsible above fixed bottom CTA
- **Default**: Summary collapsed
- Bottom CTA: 48-56px high, finger-friendly

### Desktop (1024px+)
- Two columns: Form (60%) | Order Summary (40%) 
- Summary: `sticky top-8` (comfortable offset)
- Summary height: `max-h-[60vh] overflow-y-auto` (internally scrollable)

## Visual System & Spacing

### Spacing Scale (8px baseline)
- `space-2` = 8px
- `space-4` = 16px  
- `space-6` = 24px
- `space-8` = 32px
- `space-10` = 40px

### Border Radius
- Inputs & small cards: `rounded-[10px]`
- Large panels: `rounded-[14px]`

### Typography
- H2 (section headings): `text-xl font-semibold` (20px/600)
- Body: `text-base font-normal` (16px/400)  
- Small/helper: `text-sm font-normal` (14px/400)

### Colors
- Primary CTA: `bg-blue-600` (saturated blue)
- Success: `text-green-600` (soft green for checks)
- Error: `text-red-600` (warm red for errors)
- Neutrals: `bg-gray-50`, `border-gray-200`, `text-gray-600`

## Visual Hierarchy

### Primary Total
- **Desktop**: Top-right of summary, `text-2xl font-bold`
- **Mobile**: Inside bottom CTA bar

### Section Headings  
- `text-xl font-semibold text-left`
- Subtle divider: `border-b border-gray-100 pb-4 mb-6`
- Use weight & contrast, not color, for importance

## Form Design

### Form Cards (compact grouping)
**Container**: `bg-white rounded-[14px] border border-gray-200 p-6 space-y-6`

**Card Structure**:
```jsx
<section className="bg-white rounded-[14px] border border-gray-200 p-6 space-y-6">
  <div className="border-b border-gray-100 pb-4">
    <h2 className="text-xl font-semibold">Shipping Address</h2>
    <p className="text-sm text-gray-600 mt-1">Where should we send your order?</p>
  </div>
  
  {/* Form fields */}
</section>
```

### Input Fields
**Classes**: `w-full px-4 py-3 border border-gray-300 rounded-[10px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500`

**Width Rules**: 
- Don't stretch long inputs on desktop
- Two-column for City/State: `grid grid-cols-2 gap-4`
- Two-column for Country/Postal: `grid grid-cols-2 gap-4`

**Required vs Optional**:
- Mark optional fields: `(optional)` in label
- Assume everything else required
- No asterisks overload

### Inline Validation
- Show microcopy under field only when error exists
- Error: `text-sm text-red-600 mt-1`
- Success: Small green check `text-green-600`
- No celebratory animations

## Order Summary (Trust-Building)

### Desktop Sticky Summary
```jsx
<aside className="lg:sticky lg:top-8 lg:max-h-[60vh] lg:overflow-y-auto">
  <div className="bg-white rounded-[14px] border border-gray-200 p-6 space-y-6">
    {/* Content */}
  </div>
</aside>
```

### Item Display (compact)
```jsx
<div className="flex items-center space-x-3">
  <img className="w-12 h-12 object-cover rounded-lg" />
  <div className="flex-1 min-w-0">
    <p className="font-medium truncate">{item.name}</p>
    <p className="text-sm text-gray-600">Qty: {item.qty}</p>
  </div>
  <p className="font-semibold">{item.total}</p>
</div>
```

### Totals Block
```jsx
<div className="space-y-2 text-sm">
  <div className="flex justify-between">
    <span>Subtotal</span>
    <span className="tabular-nums">{subtotal}</span>
  </div>
  <div className="flex justify-between">
    <span>Shipping</span>
    <span className="tabular-nums text-green-600">FREE</span>
  </div>
  <div className="flex justify-between">
    <span>Tax (estimated)</span>
    <span className="tabular-nums">{tax}</span>
  </div>
  <div className="border-t border-gray-200 pt-4">
    <div className="flex justify-between text-2xl font-bold">
      <span>Total</span>
      <span className="tabular-nums">{total}</span>
    </div>
  </div>
</div>
```

### Recalculation States
- Show subtle spinner next to updating line
- Don't block whole page
- Classes: `animate-spin w-4 h-4 text-gray-400`

## CTAs & Buttons

### Primary CTA (Place Order)
**Desktop**: `w-full bg-blue-600 text-white py-4 px-6 rounded-[10px] font-semibold text-lg`
**Mobile Bottom Bar**: `fixed bottom-0 left-0 right-0 p-4 bg-white border-t`

```jsx
{/* Mobile Bottom Bar */}
<div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
  <div className="flex items-center justify-between mb-3">
    <span className="text-2xl font-bold">{total}</span>
    <button className="text-blue-600 text-sm">Review order</button>
  </div>
  <button className="w-full bg-blue-600 text-white py-4 rounded-[10px] font-semibold">
    Place Order
  </button>
</div>
```

### Secondary Actions
- Edit cart, Back: `ghost buttons` under/above summary
- Classes: `text-blue-600 hover:text-blue-700 underline`

### Button States
```jsx
{/* Loading State */}
<button disabled className="opacity-50 cursor-not-allowed">
  <Spinner className="w-4 h-4 mr-2 animate-spin" />
  Placing Order...
</button>
```

## Micro-interactions & Motion

### Animation Timing
- State changes: `transition-all duration-200` (160-220ms)
- Larger transitions: `duration-300` (320ms max)

### Specific Animations
- Expand summary: `transition-all duration-200 ease-in-out`
- Field success: `transition-opacity duration-200`
- Error banner: `slide-enter-from-top + optional shake`

### Motion Classes
```jsx
{/* Expand/Collapse */}
className="transition-all duration-200 ease-in-out"

{/* Field Success Check */}
className="opacity-0 transition-opacity duration-200 data-[success]:opacity-100"

{/* Error Banner */}
className="transform transition-transform duration-200 -translate-y-full data-[error]:translate-y-0"
```

## Microcopy

### CTA Text
- Primary: `"Place Order — {total}"`

### Error Messages  
- Banner: `"We couldn't place your order. [reason]. Try again or contact support."`

### Field Hints (short & helpful)
- Address: `"Street address, P.O. box, c/o"`
- City: `"City as shown on bill"` (when needed)

### Tooltips
- Tax: `"Estimated — final amount calculated at fulfillment"`

## Accessibility 

### Focus & Touch
- Visible focus outline: `focus:outline-2 focus:outline-blue-500`
- Touch targets: minimum `h-11 w-11` (44px)
- Text contrast: WCAG AA compliance

### Announcements
- Error banners: `aria-live="assertive"`
- Status updates: `aria-live="polite"`

## Edge Cases

### Cart Changes During Checkout
- Unobtrusive banner: `"Your cart was updated — review changes"`
- Single CTA: `"Review"` (scrolls to changed area)

### Price Changes
- Visually highlight changed lines
- Short explainer near the change
- Keep final total close to Place Order CTA

### Payment Failure  
- Keep payment card open with inline error
- Focus on payment area
- Error next to card tile, not as separate banner