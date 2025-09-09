# Order Detail Page — UI Specification
**Developer-friendly design spec focusing on layout, behavior, and user experience**

## 1. Overview
- **Purpose**: Present a single order in a clear, scannable layout that lets users check items, status, shipping, totals, and perform actions (Cancel, Reorder)
- **Tone**: Straightforward, confident, with helpful explanatory text for status clarity
- **Grid base**: 8px grid system for consistent spacing

---

## 2. Breakpoints & Layout Rules

### Responsive Behavior
```
Desktop (≥1024px): 
- Two-column layout: Left (Order Items) 60% / Right (Summary + Shipping) 40%
- Max content width: 1200px centered
- Major section gaps: 24px

Tablet (≥768px, <1024px): 
- Single column, visually grouped cards
- Summary card above items for better flow
- Maintains two-column visual feel through card grouping

Mobile (<768px): 
- Single column, full-width components
- 16px side padding consistently
- Vertical rhythm: multiples of 8px
```

### Grid & Spacing
- **Base grid**: 8px
- **Card internal padding**: 16px
- **Major section gaps**: 24px
- **Component spacing**: 8px, 16px, 24px

---

## 3. Components to Design

### Component Hierarchy
1. **Page Header** — Order number + primary status chip
2. **Order Summary Card** — Date, buyer info, status badges, highlighted total
3. **Shipping Info Card** — Address snapshot, tracking, delivery ETA
4. **Order Items Section** — Items grouped by seller (multi-seller support)
5. **Order Item Card** — Product image, title, attributes, pricing, item status
6. **Totals & Actions Card** — Breakdown and primary CTAs (Cancel/Reorder)
7. **Modals & States** — Cancel confirmation, loading skeletons, error handling

---

## 4. Component Specifications

### Page Header
```
Layout: Horizontal row, ~64px height
Left: "Order #ORDxxxx · Placed March 15, 2024"
Right: Status chip (icon + text) with hover tooltip

Visual:
- Order number: 18px semibold
- Date: 16px regular, muted color
- Status chip: Rounded pill, colored background
- Bottom border: 1px neutral divider

Behavior:
- Status chip color updates based on overall order status
- Tooltip shows explanatory text on hover
```

### Order Summary Card
```
Layout: Horizontal card layout
Left: Order metadata (date, buyer name if seller view)
Center: Payment/shipping status badges  
Right: Total (visually prominent)

Typography Scale:
- Card title: 16-18px semibold
- Total amount: 20-22px bold (emphasized)
- Badges: 12px medium with icons

Visual Priority:
- Total stands out as the most prominent element
- Status badges use icon + text for accessibility
```

### Shipping Info Card
```
Content:
- Recipient name and full address block
- Phone number if provided
- Tracking link (when available)
- Delivery ETA with calendar icon (if known)

Fallback States:
- "Tracking unavailable — we'll update you" for missing tracking
- Clean address formatting with proper line breaks

Visual Treatment:
- Address in readable block format
- Subtle calendar icon for ETA
- Tracking link styled as secondary button
```

### Order Items Section
```
Seller Grouping (Multi-seller):
- Seller name header with small avatar/icon
- Optional seller-level status: "Ready to ship"
- Items visually grouped under each seller

Individual Item Layout:
- Horizontal card: Image (72×72 square) + Details + Status
- Product title: Max 2 lines with ellipsis
- Attributes: Size/color in smaller text
- Pricing: "₿X × qty = ₿line total"
- Item-level status badge

Actions:
- Minimal item actions (view details only)
- No destructive actions at item level
```

### Totals & Actions Card
```
Totals Stack (Vertical):
- Subtotal → Shipping → Tax → **Total**
- Total emphasized with larger font and bold weight
- Currency symbols consistent throughout

Primary Actions:
- Main CTA: "Reorder" or "Track" (context-dependent)
- Primary color, full-width on mobile, compact on desktop
- Secondary: "Cancel Order" (only when allowed)
- Cancel button: Ghost/danger style

Button Behavior:
- Cancel only appears in cancellable states
- Clear visual hierarchy between primary/secondary actions
```

---

## 5. States & Variations

### Order Status States
```
Normal States: Pending, Processing, Shipped, Delivered
Special States: Cancelled, Partially Cancelled

Status Indicators:
- Icon + descriptive text (accessibility)
- Explanatory subtitle: "Processing — seller confirming your order"
- Consistent color coding across all components
```

### Loading & Error States
```
Loading (Skeletons):
- Header skeleton + 2-3 item row skeletons + totals skeleton
- Maintains layout structure during loading
- Subtle pulse animation

Empty State (Order Not Found):
- Clear messaging: "We can't find that order"
- CTA: "Back to orders" + support contact
- Optional playful copy: "Looks like this order took a coffee break"

Error State (Network):
- Prominent retry button
- Clear explanation of what to do
- Maintain user confidence with helpful messaging
```

---

## 6. Modals & Interactions

### Cancel Order Modal
```
Structure:
- Title: "Cancel order?"
- Body: "If you cancel, items that already shipped cannot be returned"
- Reason field: Optional free-text input
- Actions: "Confirm" (danger) + "Cancel"

Copy Tone:
- Direct but helpful
- Explain consequences clearly
- Minimal but explicit
```

### Success States
```
Toast Notification:
- Small top-right toast with check icon
- Success message
- Auto-dismiss after 3-4 seconds
- Non-intrusive but noticeable
```

---

## 7. Visual Design Tokens

### Typography Scale
```
H1 (Page Title): 20-22px semibold
H2 (Card Titles): 16px semibold  
Body: 14-16px regular
Base: 16px
Small: 12-14px
```

### Spacing Scale
```
4px / 8px / 12px / 16px / 24px / 32px / 40px
Vertical rhythm: multiples of 8px
```

### Image Specifications
```
Product Images: 72×72px (1:1 ratio, object-fit: cover)
Seller Avatars: 24×24px
High-res variants: 2x for detail views
Placeholder images provided in design assets
```

### Color Tokens
```
Primary: Brand blue (#2563eb)
Neutral-800: Dark text (#111827)
Neutral-600: Secondary text (#4b5563)  
Success: Green (#059669)
Warning: Yellow (#d97706)
Danger: Red (#dc2626)

Background: Light gray (#f8fafc)
Cards: White (#ffffff)
```

---

## 8. Accessibility Requirements

### Touch Targets
```
Minimum interactive area: 44×44px
Adequate spacing between targets: 8px minimum
Mobile-optimized tap zones
```

### Color & Contrast
```
Text contrast: ≥4.5:1 for normal text
Large text: ≥3:1 for ≥18pt text
Status information: Icon + text (not color alone)
```

### Screen Readers
```
Status badges: Include readable text labels
Interactive elements: Clear ARIA labels
Loading states: Announced to screen readers
```

---

## 9. Backend Integration

### Required API Data
```
From GET /api/v1/orders/{orderId}:

Order Level:
- Id, OrderNumber, CreatedAt
- SubTotal, Tax, Total, Currency  
- ShippingAddressSnapshot, BuyerName

Order Items:
- ProductName, ProductImageUrl
- PriceAtOrderTime, Quantity, LineTotal
- Status, SellerId (for grouping)

Additional APIs:
- GET /orders/{id}/can-cancel
- POST /orders/{id}/cancel
```

### Status Logic
```
Overall Order Status (derived from items):
- All Delivered → "Delivered"
- Any Processing/Shipped → "In Progress"  
- All Pending → "Pending"
- Mixed states → Show item-level statuses prominently
```

---

## 10. Microcopy Guidelines

### Status Messages
```
Clear, helpful explanations:
- "Processing — seller confirming your order"
- "Shipped — on its way to you"
- "Delivered — enjoy your purchase!"

Error Messages:
- "We can't find that order. Try searching by order number or contact support."
- "Something went wrong. Please try again."

Empty States:
- Optional playful touch: "Looks like this order took a coffee break"
- Always provide clear next steps
```

---

## 11. Implementation Notes

### Component Structure
```
pages/orders/[id]/page.tsx
├── OrderDetailHeader
├── Desktop Layout (≥1024px)
│   ├── Left Column (60%)
│   │   └── OrderItemsSection
│   └── Right Column (40%)
│       ├── OrderSummaryCard  
│       ├── ShippingInfoCard
│       └── TotalsActionsCard
└── Mobile Layout (<1024px)
    ├── OrderSummaryCard
    ├── ShippingInfoCard  
    ├── OrderItemsSection
    └── TotalsActionsCard
```

### State Management
```
- React Query for API calls and caching
- Local state for UI interactions
- Error boundaries for graceful degradation
```

---

## 12. Quality Acceptance Criteria

### Layout Requirements
- Respects 8px grid spacing at all breakpoints
- Two-column desktop layout works properly
- Mobile single-column stacking functions correctly

### Functionality
- Totals are visually prominent and currency-labeled
- Cancel button appears only in allowed states
- Cancel modal flow works end-to-end
- Touch targets meet 44px minimum

### Accessibility
- All states work with screen readers
- Keyboard navigation functions properly  
- Color contrast meets WCAG standards

---

## 13. Developer Handoff Assets

### Design Files Required
```
1. Figma components for each breakpoint
2. All state variations (Pending, Processing, Shipped, Delivered, Cancelled)
3. Loading skeletons and error states
4. Cancel modal flow
5. Asset exports: icons (SVG), placeholder images (1x, 2x)
```

### Documentation
```
- Spacing token reference
- Typography scale guide
- Component behavior specifications
- When Cancel button should appear (business logic)
```

This specification focuses on practical implementation while maintaining design quality and user experience standards. The layout prioritizes scannable information hierarchy and clear user actions.

This specification focuses on practical implementation while maintaining design quality and user experience standards. The layout prioritizes scannable information hierarchy and clear user actions.

---

## Quick Reference for Developers

### Key Layout Changes from Original
- **Desktop**: Two-column (60/40) instead of single column
- **Grid**: 8px base system for consistent spacing  
- **Max width**: 1200px instead of 1152px
- **Components**: Separate Totals & Actions card
- **Images**: 72×72px product images (down from 80×80px)
- **Typography**: More restrained scale focusing on hierarchy

### Business Logic Integration
- Cancel button visibility tied to `GET /orders/{id}/can-cancel` API
- Multi-seller grouping based on `SellerId` field
- Overall status derived from individual item statuses
- Tracking info conditional on backend data availability

### Mobile Optimization (~300px support)
- Single column with 16px padding maintained
- Touch targets ≥44px consistently  
- Readable typography at smaller sizes
- Full-width CTAs for primary actions