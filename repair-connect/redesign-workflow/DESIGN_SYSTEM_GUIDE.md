# Repair Connect Design System Quick Reference

**Version:** 1.0.0
**Theme:** Twitter (tweakcn)
**Last Updated:** 2025-10-06

---

## 📖 Table of Contents

1. [Getting Started](#getting-started)
2. [Core Principles](#core-principles)
3. [Component Library](#component-library)
4. [Layout Patterns](#layout-patterns)
5. [Accessibility Guidelines](#accessibility-guidelines)
6. [Dark Mode](#dark-mode)
7. [Common Patterns](#common-patterns)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

### Quick Start

```tsx
// 1. Import components
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

// 2. Use semantic tokens
<Button className="bg-primary text-primary-foreground">
  Click Me
</Button>

// 3. Follow spacing scale (4px grid)
<div className="p-6 space-y-4">
  <Card className="rounded-lg border border-border">
    <CardHeader>
      <CardTitle className="text-lg font-bold">Card Title</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">Content here</p>
    </CardContent>
  </Card>
</div>
```

### File Structure

```
components/
├── ui/              # shadcn/ui base components
│   ├── button.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   └── input.tsx
├── layout/          # Layout components
│   ├── header.tsx
│   └── footer.tsx
└── features/        # Feature-specific components
    ├── quotations/
    ├── appointments/
    └── workshops/

redesign-workflow/
├── TWITTER_THEME_TOKENS.md    # Token reference
├── DESIGN_SYSTEM_GUIDE.md      # This file
└── REDESIGN_PROGRESS.md         # Progress tracking
```

---

## 🎯 Core Principles

### 1. Flat & Minimal
- Use borders instead of shadows
- Clean, uncluttered interfaces
- Generous whitespace

### 2. Semantic Tokens
- Always use design tokens (never hardcoded colors)
- `bg-primary`, `text-foreground`, `border-border`
- Tokens automatically adapt to light/dark mode

### 3. Consistent Spacing
- 4px base unit (`--spacing: 0.25rem`)
- Use multiples of 4: `p-2` (8px), `p-4` (16px), `p-6` (24px)
- Avoid magic numbers

### 4. Accessible by Default
- WCAG 2.1 AA contrast ratios
- Keyboard navigation support
- Screen reader friendly
- Proper ARIA attributes

### 5. Responsive & Mobile-First
- Design for mobile first
- Breakpoints: 375px, 768px, 1024px, 1440px
- Touch targets minimum 44x44px

---

## 🧩 Component Library

### Button

**Import:**
```tsx
import { Button } from "@/components/ui/button"
```

**Variants:**
```tsx
// Primary (default)
<Button>Submit</Button>

// Destructive
<Button variant="destructive">Delete</Button>

// Outline
<Button variant="outline">Cancel</Button>

// Ghost
<Button variant="ghost">Skip</Button>

// Link
<Button variant="link">Learn More</Button>
```

**Sizes:**
```tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
<Button size="icon"><X /></Button>
```

**States:**
```tsx
// Disabled
<Button disabled>Disabled</Button>

// Loading (add yourself)
<Button disabled>
  <Loader2 className="w-4 h-4 animate-spin mr-2" />
  Loading...
</Button>

// With icon
<Button>
  <Plus className="w-4 h-4 mr-2" />
  Add Item
</Button>
```

**Best Practices:**
- Use `variant="default"` for primary actions
- Use `variant="destructive"` for delete/remove actions
- Use `variant="outline"` for secondary actions
- Use `variant="ghost"` for tertiary/cancel actions
- Always provide meaningful text (not just icons)

---

### Card

**Import:**
```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card"
```

**Basic Usage:**
```tsx
<Card className="rounded-lg">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Interactive Cards:**
```tsx
// Clickable card (add hover/active states)
<Card className="rounded-lg cursor-pointer hover:border-primary/20 hover:shadow-sm active:scale-[0.99] transition-all">
  <CardHeader>
    <CardTitle>Clickable Card</CardTitle>
  </CardHeader>
  <CardContent>
    Click me!
  </CardContent>
</Card>
```

**Best Practices:**
- Use `CardHeader` for titles and descriptions
- Use `CardContent` for main content (no top padding)
- Use `CardFooter` for actions (align items-center)
- Add `hover:border-primary/20` for interactive cards
- Keep card padding consistent (`p-6`)

---

### Badge

**Import:**
```tsx
import { Badge } from "@/components/ui/badge"
```

**Variants:**
```tsx
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
```

**Best Practices:**
- Badges are **non-interactive** status indicators
- Use for: status tags, labels, counts
- Don't use for: buttons, links, filters (use Button instead)
- Keep text short (1-2 words)

---

### Input

**Import:**
```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
```

**Basic Usage:**
```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="Enter your email"
    className="rounded-lg"
  />
</div>
```

**With Error:**
```tsx
<div className="space-y-2">
  <Label htmlFor="email" className="text-destructive">
    Email (Required)
  </Label>
  <Input
    id="email"
    type="email"
    className="rounded-lg border-destructive focus-visible:ring-destructive"
    aria-invalid="true"
    aria-describedby="email-error"
  />
  <p id="email-error" className="text-sm text-destructive">
    Please enter a valid email
  </p>
</div>
```

**Best Practices:**
- Always pair with `<Label>` for accessibility
- Use `id` and `htmlFor` to connect label and input
- Add `aria-invalid` and `aria-describedby` for errors
- Use `placeholder` sparingly (not a replacement for labels)

---

## 📐 Layout Patterns

### Container Widths

```tsx
// Full width
<div className="w-full">...</div>

// Constrained width (recommended for content)
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  <div className="max-w-7xl">
    Content
  </div>
</div>

// Narrow content (reading)
<div className="max-w-3xl mx-auto">
  <article>...</article>
</div>
```

### Grid Layouts

```tsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>

// Auto-fit grid (dynamic columns)
<div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
  <Card>...</Card>
</div>
```

### Stack Layouts

```tsx
// Vertical stack with spacing
<div className="space-y-4">
  <Card>...</Card>
  <Card>...</Card>
</div>

// Horizontal stack with spacing
<div className="flex items-center space-x-3">
  <Button>Cancel</Button>
  <Button>Submit</Button>
</div>
```

### Dashboard Layout

```tsx
<div className="min-h-screen bg-background">
  {/* Header */}
  <Header />

  {/* Main content */}
  <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Page title */}
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Welcome back!</p>
    </div>

    {/* Stats grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>...</Card>
      <Card>...</Card>
      <Card>...</Card>
      <Card>...</Card>
    </div>

    {/* Main content area */}
    <Card>...</Card>
  </main>

  {/* Footer */}
  <Footer />
</div>
```

---

## ♿ Accessibility Guidelines

### Focus States

**Always visible:**
```tsx
// Button focus (built-in)
<Button>Click Me</Button>
// Has: focus-visible:ring-2 focus-visible:ring-ring

// Custom focus
<div
  tabIndex={0}
  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
>
  Focusable content
</div>
```

### ARIA Labels

```tsx
// Icon-only buttons
<Button size="icon" aria-label="Close dialog">
  <X className="w-4 h-4" />
</Button>

// Notification badges
<button aria-label="Notifications">
  <Bell className="w-5 h-5" />
  <span
    className="..."
    aria-label="3 unread notifications"
  >
    <span aria-hidden="true">3</span>
  </span>
</button>

// Status indicators
<Badge aria-label="Status: Active">
  Active
</Badge>
```

### Keyboard Navigation

```tsx
// Ensure all interactive elements are keyboard accessible
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }}
>
  Click Me
</button>

// Skip navigation link
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
>
  Skip to main content
</a>
```

### Screen Reader Support

```tsx
// Loading state
<Button disabled aria-busy="true">
  <Loader2 className="w-4 h-4 animate-spin mr-2" />
  <span>Loading...</span>
  <span className="sr-only">Please wait</span>
</Button>

// Error state
<Input
  aria-invalid="true"
  aria-describedby="error-message"
/>
<p id="error-message" className="text-sm text-destructive">
  This field is required
</p>

// Success state
<div role="status" aria-live="polite">
  <CheckCircle className="w-4 h-4 text-green-500" />
  <span>Success! Your changes have been saved.</span>
</div>
```

---

## 🌓 Dark Mode

### Theme Toggle

```tsx
import { useTheme } from "next-themes"

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </Button>
  )
}
```

### Dark Mode Best Practices

```tsx
// ✅ Use semantic tokens (automatically adapt)
<div className="bg-background text-foreground">
  Content
</div>

// ❌ Avoid hardcoded colors
<div className="bg-white text-black">
  Content
</div>

// ✅ Dark-specific overrides (rare)
<div className="bg-card dark:ring-1 dark:ring-border">
  Content with subtle border in dark mode
</div>

// ✅ Images with borders in dark mode
<img
  src="..."
  className="rounded-lg dark:ring-1 dark:ring-border"
/>
```

---

## 🎨 Common Patterns

### Empty States

```tsx
<Card className="rounded-lg text-center py-12">
  <div className="flex flex-col items-center">
    <Inbox className="w-12 h-12 text-muted-foreground mb-4" />
    <h3 className="text-lg font-semibold mb-2">No items yet</h3>
    <p className="text-muted-foreground mb-6">
      Get started by creating your first item
    </p>
    <Button>
      <Plus className="w-4 h-4 mr-2" />
      Create Item
    </Button>
  </div>
</Card>
```

### Loading States

```tsx
// Skeleton loader
<Card className="rounded-lg">
  <CardHeader>
    <div className="h-6 w-32 bg-muted animate-pulse rounded" />
  </CardHeader>
  <CardContent className="space-y-3">
    <div className="h-4 bg-muted animate-pulse rounded" />
    <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
  </CardContent>
</Card>

// Spinner
<div className="flex items-center justify-center p-12">
  <Loader2 className="w-8 h-8 animate-spin text-primary" />
</div>
```

### Error States

```tsx
<Card className="rounded-lg border-destructive">
  <CardHeader>
    <div className="flex items-center space-x-2">
      <AlertCircle className="w-5 h-5 text-destructive" />
      <CardTitle className="text-destructive">Error</CardTitle>
    </div>
  </CardHeader>
  <CardContent>
    <p className="text-muted-foreground mb-4">
      Something went wrong. Please try again.
    </p>
    <Button variant="destructive">Retry</Button>
  </CardContent>
</Card>
```

### Confirmation Dialogs

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
    </DialogHeader>
    <p className="text-muted-foreground">
      This action cannot be undone. This will permanently delete your item.
    </p>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleDelete}>
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Form Layouts

```tsx
<form className="space-y-6">
  {/* Section */}
  <div>
    <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" />
      </div>
    </div>
  </div>

  {/* Section */}
  <div>
    <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
    <div className="space-y-4">
      {/* More fields */}
    </div>
  </div>

  {/* Actions */}
  <div className="flex justify-end space-x-3 pt-6 border-t border-border">
    <Button variant="outline">Cancel</Button>
    <Button type="submit">Save Changes</Button>
  </div>
</form>
```

---

## 🔧 Troubleshooting

### Colors Not Updating

**Problem:** Changed colors in globals.css but UI didn't update

**Solution:**
1. Restart dev server: `npm run dev`
2. Clear browser cache: Hard refresh (Ctrl+Shift+R)
3. Check that you're using semantic tokens, not hardcoded colors

### Dark Mode Not Working

**Problem:** Components don't adapt to dark mode

**Solution:**
1. Ensure you're using `bg-background`, `text-foreground`, etc.
2. Check `next-themes` is properly configured in layout
3. Add `<html lang="en">` with no `class="dark"` (let next-themes manage it)

### Focus States Not Visible

**Problem:** Can't see keyboard focus indicators

**Solution:**
```tsx
// Add ring-offset for better contrast
className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
```

### Border Radius Inconsistent

**Problem:** Some components use `rounded-full`, others use `rounded-lg`

**Solution:**
- Use `rounded-lg` (20.8px) for **all** components
- Only use `rounded-full` for **avatars** and **icon containers**
- Check [TWITTER_THEME_TOKENS.md](./TWITTER_THEME_TOKENS.md) for reference

### Spacing Looks Off

**Problem:** Inconsistent spacing between elements

**Solution:**
1. Use `space-y-4` for vertical stacks
2. Use `space-x-3` for horizontal stacks
3. Use `gap-6` for grids
4. Stick to multiples of 4: `2` (8px), `4` (16px), `6` (24px)

---

## 📚 Additional Resources

- [Twitter Theme Tokens](./TWITTER_THEME_TOKENS.md)
- [Redesign Progress](./REDESIGN_PROGRESS.md)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS v4](https://tailwindcss.com)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Next.js App Router](https://nextjs.org/docs/app)

---

## 🤝 Contributing

When adding new components:

1. Use semantic tokens (check TWITTER_THEME_TOKENS.md)
2. Follow the 4px spacing scale
3. Use `rounded-lg` for border radius
4. Add proper focus states
5. Include ARIA attributes
6. Test in light and dark mode
7. Test keyboard navigation
8. Document usage in this guide

---

**Last Updated:** 2025-10-06
**Maintained By:** Repair Connect Design Team
