# Buyer Orders Page - UX Design Specification
*Based on Current API Capabilities*

## Overview
Clean, modern orders page for buyers to view and manage their order history. Designed to work with existing endpoints and data structure.

## Page Layout

### Container
- **Max width**: 1152px (6xl container)
- **Padding**: 16px mobile, 32px desktop
- **Background**: Light gray (#f8fafc)

### Grid Structure
- **Desktop**: 2 columns (66% main + 33% sidebar)
- **Tablet**: 2 columns (60% main + 40% sidebar)  
- **Mobile**: Single column stack

## Page Header

### Title Section
- **Heading**: "My Orders" - Large, bold (32px)
- **Subtitle**: "Track and manage your order history" - Gray text (16px)
- **Spacing**: 24px margin bottom

## Filter & Search Section

### Container Style
- **Background**: White
- **Border**: Light gray (#e5e7eb)
- **Radius**: 12px rounded corners
- **Padding**: 16px
- **Shadow**: Subtle hover shadow

### Search Input
- **Width**: 50% desktop, full mobile
- **Placeholder**: "Search by order number..."
- **Height**: 44px
- **Border**: Light gray with blue focus
- **API**: Uses `GET /orders/search?orderNumber=`

### Filter Dropdowns
- **Status Filter**: All Status, Pending, Processing, Shipped, Delivered, Cancelled
- **Date Filter**: Last 30 days, Last 6 months, Last year, All time, Custom Range
- **Custom Range**: Date picker for FromDate/ToDate parameters
- **Size**: 140px wide each
- **Gap**: 12px between filters
- **API**: Uses `OrderFilterRequest` with Status, FromDate, ToDate

## Order Card Design

### Card Container
- **Background**: White
- **Border**: Light gray (#e5e7eb)
- **Radius**: 16px rounded
- **Padding**: 24px
- **Shadow**: Subtle with hover lift effect
- **Spacing**: 16px between cards

### Card Header (Top Row)
**Left Side:**
- Order number: "#ORD240903001" - Bold, 18px
- Order date: "Mar 15, 2024" - Gray, 14px

**Right Side:**
- Total amount: "฿2,350" - Bold, 18px
- Status badge: Colored pill with icon

### Items Preview Section
- **Max items shown**: 2 items clearly displayed
- **Item layout**: Horizontal flex
- **Image**: 48x48px rounded (8px) - from `ProductImageUrl`
- **Product name**: Medium weight, truncated - from `ProductName`
- **Details**: "Qty: 2 • ฿450" - Small gray text
- **Status badge**: Small colored pill per item with icon
- **More items indicator**: "+3 more items" clickable text (if applicable)
- **Click behavior**: "Show more" text opens full order details

### Shipping Address Box
- **Background**: Light gray (#f9fafb)
- **Padding**: 12px
- **Radius**: 8px
- **Text**: "Shipping to: [address]" - From `ShippingAddressSnapshot`

### Action Buttons
**Primary Button:**
- **Text**: "View Details" - Always consistent
- **Style**: Blue primary button
- **Action**: Navigate to order details page

**Secondary Buttons:**
- **Cancel**: Red outline (if `CanCancelOrder` returns true)
- **Reorder**: Gray outline (always available for convenience)
- **Gap**: 12px between buttons
- **Height**: 40px
- **Mobile**: Stack vertically, full width

## Status Badge Colors

### Order Status (With Icons for Accessibility)
*Note: Overall order status derived from order items*
- **Pending**: 🕒 Yellow background (#fef3c7), dark yellow text (#92400e)
- **Processing**: ⚙️ Blue background (#dbeafe), dark blue text (#1e40af)
- **Shipped**: 🚚 Purple background (#e9d5ff), dark purple text (#7c2d12)
- **Delivered**: ✅ Green background (#d1fae5), dark green text (#065f46)
- **Cancelled**: ❌ Red background (#fee2e2), dark red text (#991b1b)

### Item Status (Smaller, with Icons)
*Uses `OrderItemStatus` enum from API*
- Same colors and icons as above but with borders
- **Size**: Small text (12px), 6px padding
- **Icon Size**: 12px (smaller than order status icons)

## Sidebar Design

### Quick Stats Card
- **Background**: White
- **Padding**: 24px
- **Title**: "Order Summary" - Bold, 16px
- **Stats Layout**: Label on left, value on right
- **Stats** (from `GET /orders/stats`):
  - Total Orders: `totalOrders`
  - Total Spent: `totalSpent` in ฿
  - Active Orders: Count of non-delivered orders

### Quick Actions Card
- **Background**: White
- **Padding**: 24px
- **Title**: "Quick Actions" - Bold, 16px
- **Button Style**: Full width, left-aligned with icons
- **Icon**: 32x32px colored background circles
- **Actions**:
  - 📋 Search Orders (focuses search input)
  - 🔄 View Recent Orders (filter to last 30 days)
  - 📞 Contact Support (external link)

## Mobile Adaptations

### Filter Section
- **Mobile**: Single "Filters & Sort" button that opens slide-up sheet
- **Sheet**: Bottom slide with all filter options

### Order Cards
- **Padding**: Reduced to 16px
- **Items**: Show max 2 items clearly
- **More items**: "+X more" indicator for additional items
- **Buttons**: Stack vertically, full width
- **Status badges**: Smaller text (11px), smaller icons (10px)

### Sidebar
- **Mobile**: Hidden, stats move to horizontal cards above orders list

## Loading States

### Skeleton Cards
- **Shape**: Same as real cards
- **Elements**: Gray animated rectangles matching card structure
- **Animation**: Pulse effect
- **Count**: 3-4 skeleton cards

### Shimmer Effect
- **Color**: Light gray (#e5e7eb)
- **Animation**: Left-to-right shimmer
- **Duration**: 1.5 seconds loop

## Empty State

### Center Layout
- **Icon**: 📦 - 96x96px gray circle
- **Title**: "No Orders Yet" - Bold, 20px
- **Description**: "When you place your first order, it will appear here."
- **Button**: "Start Shopping" - Primary blue, links to products

## API Integration Summary

### Endpoints Used
- `GET /orders` - Main orders list with pagination and filters
- `GET /orders/search?orderNumber=` - Order number search
- `GET /orders/stats` - Buyer statistics
- `GET /orders/{id}/can-cancel` - Check if order can be cancelled
- `POST /orders/{id}/cancel` - Cancel order functionality

### Filter Parameters
- `Page`, `PageSize` - Pagination
- `Status` - Filter by OrderItemStatus enum
- `FromDate`, `ToDate` - Custom date ranges

### Data Fields Used
- Order: `OrderNumber`, `Total`, `CreatedAt`, `ShippingAddressSnapshot`
- OrderItems: `ProductName`, `ProductImageUrl`, `Quantity`, `PriceAtOrderTime`, `Status`
- Stats: `totalOrders`, `totalSpent` from buyer role

## Typography

### Headings
- **H1**: 32px bold (page title)
- **H2**: 20px bold (card titles)  
- **H3**: 16px semi-bold (section titles)

### Body Text
- **Primary**: 16px regular (#111827)
- **Secondary**: 14px regular (#6b7280)
- **Small**: 12px regular (#9ca3af)

## Color System

### Primary
- **Blue**: #2563eb (buttons, links)
- **Blue Light**: #dbeafe (backgrounds)

### Neutrals
- **White**: #ffffff
- **Gray 50**: #f9fafb
- **Gray 100**: #f3f4f6
- **Gray 200**: #e5e7eb
- **Gray 600**: #4b5563
- **Gray 900**: #111827

### Status Colors
- As defined in status badge section above

## Spacing Scale
- **XS**: 4px
- **SM**: 8px
- **MD**: 12px
- **LG**: 16px
- **XL**: 24px
- **2XL**: 32px

## Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

This design works entirely with your existing API endpoints and provides a great user experience within current technical constraints.