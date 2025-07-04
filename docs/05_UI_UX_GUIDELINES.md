# UI/UX Guidelines

## 1. Introduction

This document establishes UI/UX guidelines for the Full-Stack E-Commerce Marketplace MVP, designed specifically for portfolio demonstration purposes. The focus is on creating a clean, professional interface that showcases technical skills and modern web development practices rather than optimizing for real e-commerce conversion.

## 2. Design Philosophy & Portfolio Goals

### 2.1 Primary Objectives
- **Technical Demonstration:** Showcase React/Next.js component architecture and state management
- **Professional Presentation:** Clean, modern interface suitable for portfolio screenshots
- **Code Quality:** Organized styling and consistent component usage
- **Interview Readiness:** Easy to explain design decisions and technical implementation

### 2.2 MVP Design Principles
- **Simplicity Over Complexity:** Clean layouts that highlight functionality
- **Consistency Over Customization:** Standardized components and patterns
- **Functionality Over Aesthetics:** Focus on working features with professional appearance
- **Demonstrability Over Optimization:** Designs that are easy to showcase in demos

## 3. Design System Foundation

### 3.1 Technology Stack Integration
**Base Framework:**
- Tailwind CSS 4 for utility-first styling
- Shadcn/UI component library for consistent base components
- Next.js 15 static export optimization
- Responsive design with mobile-first approach

**Component Architecture:**
```
src/components/
├── ui/           # Shadcn/UI base components
├── layout/       # Navbar, Footer, page layouts
├── features/     # Feature-specific components
└── pages/        # Page-level components
```

### 3.2 Color Palette

**Primary Palette (Professional Blue/Gray):**
```css
/* Primary Colors */
--primary: 220 14% 10%;      /* Dark blue-gray */
--primary-foreground: 210 40% 98%;

/* Secondary Colors */
--secondary: 220 14% 96%;    /* Light gray */
--secondary-foreground: 220 9% 46%;

/* Accent Colors */
--accent: 220 14% 96%;
--accent-foreground: 220 9% 15%;

/* E-commerce Specific */
--success: 142 76% 36%;      /* Green for success states */
--warning: 38 92% 50%;       /* Orange for warnings */
--destructive: 0 84% 60%;    /* Red for errors/delete */
```

**Usage Guidelines:**
- **Primary:** Main CTAs (Add to Cart, Login, Submit)
- **Secondary:** Secondary actions (View Details, Cancel)
- **Success:** Order confirmation, successful operations
- **Warning:** Stock warnings, form validation
- **Destructive:** Delete actions, error states

### 3.3 Typography

**Font System:**
```css
/* Base font stack */
font-family: Inter, system-ui, -apple-system, sans-serif;

/* Typography Scale */
--text-xs: 0.75rem;     /* 12px - Small labels */
--text-sm: 0.875rem;    /* 14px - Body text */
--text-base: 1rem;      /* 16px - Default */
--text-lg: 1.125rem;    /* 18px - Subheadings */
--text-xl: 1.25rem;     /* 20px - Headings */
--text-2xl: 1.5rem;     /* 24px - Page titles */
--text-3xl: 1.875rem;   /* 30px - Hero text */
```

**Usage Hierarchy:**
- **Hero Text (text-3xl):** Homepage hero, major page headers
- **Page Titles (text-2xl):** Main page headings
- **Section Headers (text-xl):** Product names, form sections
- **Subheadings (text-lg):** Category titles, card headers
- **Body Text (text-base):** Default text, descriptions
- **Small Text (text-sm):** Labels, metadata, helper text
- **Micro Text (text-xs):** Timestamps, fine print

### 3.4 Spacing & Layout

**Spacing Scale (Tailwind standard):**
```css
/* Spacing units */
space-1: 0.25rem;   /* 4px */
space-2: 0.5rem;    /* 8px */
space-4: 1rem;      /* 16px */
space-6: 1.5rem;    /* 24px */
space-8: 2rem;      /* 32px */
space-12: 3rem;     /* 48px */
space-16: 4rem;     /* 64px */
```

**Layout Standards:**
- **Container max-width:** `max-w-7xl` (1280px)
- **Page padding:** `px-4 sm:px-6 lg:px-8`
- **Section spacing:** `space-y-8` or `space-y-12`
- **Card spacing:** `p-4` or `p-6`
- **Form spacing:** `space-y-4`

## 4. Component Design Standards

### 4.1 Button System

**Primary Button (CTA):**
```jsx
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Add to Cart
</Button>
```

**Secondary Button:**
```jsx
<Button variant="outline" className="border-input bg-background hover:bg-accent">
  View Details
</Button>
```

**Destructive Button:**
```jsx
<Button variant="destructive">
  Remove Item
</Button>
```

**Button Sizing:**
- **Large:** `h-11 px-8` - Primary CTAs
- **Default:** `h-10 px-4` - Standard actions
- **Small:** `h-9 px-3` - Secondary actions
- **Icon:** `h-10 w-10` - Icon-only buttons

### 4.2 Card System

**Product Card Standard:**
```jsx
<Card className="overflow-hidden">
  <div className="aspect-square overflow-hidden">
    <img className="h-full w-full object-cover hover:scale-105 transition-transform" />
  </div>
  <CardContent className="p-4">
    <h3 className="font-semibold text-lg truncate">{name}</h3>
    <p className="text-sm text-muted-foreground">{seller}</p>
    <div className="flex items-center justify-between mt-2">
      <span className="text-xl font-bold">${price}</span>
      <Button size="sm">Add to Cart</Button>
    </div>
  </CardContent>
</Card>
```

**Card Variants:**
- **Product Card:** 1:1 aspect ratio image, name, price, CTA
- **Seller Card:** Profile image, business name, description
- **Order Card:** Order number, status, total, actions
- **Stats Card:** Number, label, optional trend indicator

### 4.3 Form Components

**Input Standards:**
```jsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email" 
    placeholder="Enter your email"
    className="h-10"
  />
  <p className="text-sm text-muted-foreground">Help text</p>
</div>
```

**Form Layout:**
- **Single column:** Default for most forms
- **Two column:** Only for related fields (first/last name)
- **Field spacing:** `space-y-4`
- **Section spacing:** `space-y-6`

### 4.4 Navigation Components

**Navbar Standard:**
```jsx
<nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div className="container flex h-14 items-center">
    <Logo />
    <NavigationMenu />
    <div className="ml-auto flex items-center space-x-4">
      <SearchBar />
      <CartButton />
      <UserMenu />
    </div>
  </div>
</nav>
```

**Breadcrumb Navigation:**
```jsx
<Breadcrumb className="mb-6">
  <BreadcrumbList>
    <BreadcrumbItem>Home</BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>Electronics</BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>Product Name</BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

## 5. Page Layout Standards

### 5.1 Homepage Layout

```jsx
<div className="min-h-screen">
  <Navbar />
  
  {/* Hero Section */}
  <section className="py-12 md:py-24">
    <div className="container">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Marketplace MVP</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Full-stack e-commerce demo showcasing modern web development
        </p>
        <Button size="lg">Browse Products</Button>
      </div>
    </div>
  </section>

  {/* Featured Products */}
  <section className="py-12">
    <div className="container">
      <h2 className="text-2xl font-bold mb-8">Featured Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(product => <ProductCard key={product.id} />)}
      </div>
    </div>
  </section>

  <Footer />
</div>
```

### 5.2 Product Listing Page

```jsx
<div className="container py-8">
  <Breadcrumb />
  
  <div className="flex flex-col lg:flex-row gap-8">
    {/* Filters Sidebar */}
    <aside className="lg:w-64">
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Filters</h3>
        <div className="space-y-4">
          <CategoryFilter />
          <PriceRangeFilter />
          <SellerFilter />
        </div>
      </Card>
    </aside>

    {/* Product Grid */}
    <main className="flex-1">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">All Products</h1>
        <Select> {/* Sort options */} </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => <ProductCard key={product.id} />)}
      </div>
      
      <Pagination className="mt-8" />
    </main>
  </div>
</div>
```

### 5.3 Shopping Cart Page

```jsx
<div className="container py-8">
  <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>
  
  <div className="grid lg:grid-cols-3 gap-8">
    {/* Cart Items */}
    <div className="lg:col-span-2 space-y-6">
      {cartGroups.map(group => (
        <Card key={group.sellerId} className="p-6">
          <h3 className="font-semibold mb-4">
            Items from {group.sellerName}
          </h3>
          <div className="space-y-4">
            {group.items.map(item => <CartItem key={item.id} />)}
          </div>
        </Card>
      ))}
    </div>

    {/* Order Summary */}
    <div>
      <Card className="p-6 sticky top-4">
        <h3 className="font-semibold mb-4">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>${tax}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${total}</span>
          </div>
        </div>
        <Button className="w-full mt-6">Proceed to Checkout</Button>
      </Card>
    </div>
  </div>
</div>
```

### 5.4 Seller Dashboard Layout

```jsx
<div className="container py-8">
  <div className="flex items-center justify-between mb-8">
    <h1 className="text-2xl font-bold">Seller Dashboard</h1>
    <Button>Add New Product</Button>
  </div>

  {/* Stats Cards */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <StatsCard title="Total Products" value="24" />
    <StatsCard title="Pending Orders" value="3" />
    <StatsCard title="Total Sales" value="$1,234" />
    <StatsCard title="Active Listings" value="22" />
  </div>

  {/* Products Table */}
  <Card>
    <CardHeader>
      <CardTitle>Your Products</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map(product => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>${product.price}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>
                <Badge variant={product.isActive ? "default" : "secondary"}>
                  {product.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="destructive" size="sm">Delete</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</div>
```

## 6. Responsive Design Guidelines

### 6.1 Breakpoint Strategy

**Tailwind Breakpoints:**
```css
/* Mobile First Approach */
/* xs: default (0px+) */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small laptops */
xl: 1280px  /* Laptops */
2xl: 1536px /* Large screens */
```

**Layout Patterns:**
- **Mobile (default):** Single column, stacked navigation
- **Tablet (md):** Two-column grids, collapsible sidebar
- **Desktop (lg+):** Three-column grids, persistent sidebar

### 6.2 Component Responsiveness

**Product Grid:**
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
```

**Navigation:**
```jsx
{/* Mobile: Hamburger menu */}
<div className="lg:hidden">
  <MobileMenu />
</div>

{/* Desktop: Full navigation */}
<div className="hidden lg:flex">
  <DesktopMenu />
</div>
```

**Sidebar Filters:**
```jsx
{/* Mobile: Collapsible drawer */}
<Sheet className="lg:hidden">
  <SheetTrigger asChild>
    <Button variant="outline">Filters</Button>
  </SheetTrigger>
  <SheetContent side="left">
    <FilterContent />
  </SheetContent>
</Sheet>

{/* Desktop: Persistent sidebar */}
<aside className="hidden lg:block lg:w-64">
  <FilterContent />
</aside>
```

## 7. State Visualization Guidelines

### 7.1 Loading States

**Skeleton Loaders:**
```jsx
<Card className="p-6">
  <Skeleton className="h-48 w-full mb-4" /> {/* Image placeholder */}
  <Skeleton className="h-4 w-3/4 mb-2" />   {/* Title */}
  <Skeleton className="h-4 w-1/2 mb-4" />   {/* Price */}
  <Skeleton className="h-10 w-full" />       {/* Button */}
</Card>
```

**Loading Indicators:**
- **Spinner:** For button actions (Add to Cart)
- **Skeleton:** For content loading (Product grids)
- **Progress:** For multi-step processes (Checkout)

### 7.2 Empty States

**Empty Product List:**
```jsx
<div className="text-center py-12">
  <div className="text-muted-foreground mb-4">
    <Package className="h-12 w-12 mx-auto mb-4" />
    <h3 className="text-lg font-semibold">No products found</h3>
    <p>Try adjusting your search or filters</p>
  </div>
  <Button variant="outline">Clear Filters</Button>
</div>
```

**Empty Cart:**
```jsx
<div className="text-center py-12">
  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
  <h3 className="text-lg font-semibold">Your cart is empty</h3>
  <p className="text-muted-foreground mb-4">Add some products to get started</p>
  <Button>Browse Products</Button>
</div>
```

### 7.3 Error States

**Form Validation:**
```jsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email"
    className={cn(
      "h-10",
      error && "border-destructive focus-visible:ring-destructive"
    )}
  />
  {error && (
    <p className="text-sm text-destructive flex items-center">
      <AlertCircle className="h-4 w-4 mr-1" />
      {error.message}
    </p>
  )}
</div>
```

**Error Boundaries:**
```jsx
<div className="text-center py-12">
  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
  <h3 className="text-lg font-semibold">Something went wrong</h3>
  <p className="text-muted-foreground mb-4">Please try again later</p>
  <Button onClick={retry}>Try Again</Button>
</div>
```

## 8. Interactive Elements & Feedback

### 8.1 Hover & Focus States

**Button Interactions:**
```css
/* Implemented via Tailwind classes */
.button-primary {
  @apply bg-primary text-primary-foreground;
  @apply hover:bg-primary/90;
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring;
  @apply transition-colors;
}
```

**Card Interactions:**
```jsx
<Card className="cursor-pointer transition-colors hover:bg-accent/50">
  {/* Card content */}
</Card>
```

### 8.2 Success & Feedback Messages

**Toast Notifications:**
```jsx
// Success
toast({
  title: "Product added to cart",
  description: "Wireless Headphones has been added to your cart",
})

// Error
toast({
  variant: "destructive",
  title: "Uh oh! Something went wrong",
  description: "Unable to add product to cart. Please try again.",
})
```

**Inline Feedback:**
```jsx
<div className="flex items-center text-sm text-green-600">
  <CheckCircle className="h-4 w-4 mr-1" />
  Order placed successfully
</div>
```

## 9. Icon System & Visual Hierarchy

### 9.1 Icon Standards

**Icon Library:** Lucide React (consistent with Shadcn/UI)

**Common Icons:**
- **Shopping:** ShoppingCart, ShoppingBag, Package
- **User:** User, Users, Settings, LogOut
- **Actions:** Plus, Edit, Trash2, Search
- **Status:** CheckCircle, AlertCircle, AlertTriangle
- **Navigation:** ChevronDown, ChevronRight, Menu

**Icon Sizing:**
```jsx
{/* Small icons */}
<Icon className="h-4 w-4" />

{/* Default icons */}
<Icon className="h-5 w-5" />

{/* Large icons */}
<Icon className="h-6 w-6" />

{/* Hero icons */}
<Icon className="h-8 w-8" />
```

### 9.2 Visual Hierarchy

**Information Hierarchy:**
1. **Page Title** - Primary heading (text-2xl)
2. **Section Headers** - Secondary headings (text-xl)
3. **Card Titles** - Tertiary headings (text-lg)
4. **Body Content** - Main text (text-base)
5. **Metadata** - Supporting text (text-sm)
6. **Fine Print** - Legal/timestamps (text-xs)

**Color Hierarchy:**
1. **Primary Text** - Main content (foreground)
2. **Secondary Text** - Supporting content (muted-foreground)
3. **Accent Text** - Interactive elements (primary)
4. **Status Text** - Success/warning/error states

## 10. Portfolio-Specific Considerations

### 10.1 Screenshot Optimization

**Key Pages for Portfolio:**
- **Homepage:** Clean hero section with featured products
- **Product Grid:** Well-organized grid showing search/filter
- **Product Detail:** Complete product page with add to cart
- **Cart Page:** Multi-seller cart grouping demonstration
- **Seller Dashboard:** Professional admin interface

**Screenshot Guidelines:**
- Use high-quality sample data
- Show interactive states (hover, focus)
- Include loading and empty states
- Demonstrate responsive design
- Show error handling

### 10.2 Demo Preparation

**Sample Data Standards:**
- **Product Images:** High-quality, consistent aspect ratios
- **Product Names:** Realistic, varied categories
- **Seller Names:** Professional business names
- **Pricing:** Realistic price ranges
- **Descriptions:** Well-written, varied lengths

**Interactive Demo Elements:**
- **Working Search:** Functional product search
- **Cart Operations:** Add/remove items with visual feedback
- **Form Validation:** Real-time validation with clear error messages
- **Role Switching:** Easy demonstration of buyer vs seller views

### 10.3 Code Quality Showcase

**Component Organization:**
```
components/
├── ui/              # Base Shadcn/UI components
├── forms/           # Form-specific components
├── products/        # Product-related components
├── cart/            # Cart-related components
├── seller/          # Seller dashboard components
└── layout/          # Layout components
```

**Styling Organization:**
- Consistent Tailwind class usage
- Custom CSS minimal and well-documented
- Responsive design patterns
- Reusable component variants

**Accessibility Standards:**
- Proper heading hierarchy (h1, h2, h3)
- ARIA labels for interactive elements
- Keyboard navigation support
- Color contrast compliance
- Screen reader friendly text

## 11. Implementation Guidelines

### 11.1 Component Development Workflow

1. **Design Component:** Start with Figma/mockup (optional for MVP)
2. **Build with Shadcn/UI:** Use base components as foundation
3. **Add Tailwind Styling:** Custom styling with utility classes
4. **Test Responsiveness:** Verify mobile/desktop layouts
5. **Add Interactions:** Hover states, loading states, error handling
6. **Document Usage:** Add to component library documentation

### 11.2 Quality Checklist

**Before Component Completion:**
- [ ] Responsive design works on mobile/desktop
- [ ] Loading states implemented
- [ ] Error states handled
- [ ] Accessibility attributes added
- [ ] TypeScript props properly typed
- [ ] Consistent with design system
- [ ] Interactive states (hover, focus) implemented

**Before Page Completion:**
- [ ] Page layout responsive
- [ ] Navigation breadcrumbs (where applicable)
- [ ] Empty states handled
- [ ] Error boundaries in place
- [ ] SEO meta tags added (for demo purposes)
- [ ] Loading states for data fetching

## 12. Future Enhancement Considerations

### 12.1 Post-MVP UI Improvements
- Dark mode theme support
- Advanced animations and micro-interactions
- Enhanced mobile UX patterns
- Advanced filtering interfaces
- Real-time updates and notifications

### 12.2 Scalability Considerations
- Design token system for easier theming
- Component library extraction
- Advanced accessibility features
- Performance optimization
- Internationalization support

---

This UI/UX guideline provides a comprehensive foundation for building a professional, portfolio-ready e-commerce marketplace MVP that showcases technical skills while maintaining clean, consistent design standards throughout the application.
