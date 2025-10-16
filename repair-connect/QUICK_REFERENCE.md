# Quick Reference Guide - New Pages

## URLs

```
/about           - About Repair Connect page
/contact         - Contact Us page with form
/how-it-works    - Process explanation page
```

## Files Created

```
✅ src/app/about/page.tsx (468 lines)
✅ src/app/contact/page.tsx (412 lines) [Client Component]
✅ src/app/contact/layout.tsx (21 lines) [Metadata wrapper]
✅ src/app/how-it-works/page.tsx (551 lines)
```

## Key Features

### About Page (/about)
- Organization Schema for SEO
- Mission & Vision cards
- 6 benefits with icons
- Timeline with 4 milestones
- Team section (3 members)
- FAQ accordion (6 questions)
- Dual CTAs

### Contact Page (/contact)
- ContactPage Schema
- 3 contact info cards (phone, email, hours)
- Full contact form with validation
  - react-hook-form + zod
  - Toast notifications
  - Loading states
- Map placeholder
- Clickable contact cards

### How It Works (/how-it-works)
- HowTo Schema with steps
- 3 detailed process steps
- 6 service categories grid
- Visual 5-step flow
- Workshop benefits (4 cards)
- FAQ accordion (5 questions)
- Dual CTA for customers & workshops

## Common Patterns Used

### Animation Pattern
```tsx
<AnimatedSection direction="up" delay={0}>
  <SectionHeader
    badge="Badge Text"
    title="Section Title"
    subtitle="Optional subtitle"
  />
</AnimatedSection>

<StaggerContainer staggerDelay={0.1}>
  {items.map((item, i) => (
    <StaggerItem key={i} variants={staggerItemVariants}>
      <HoverScale>
        <Card>
          {/* Content */}
        </Card>
      </HoverScale>
    </StaggerItem>
  ))}
</StaggerContainer>
```

### Card with Icon Pattern
```tsx
<Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all">
  <CardHeader>
    <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
      <Icon className="h-7 w-7 text-primary" />
    </div>
    <CardTitle>{title}</CardTitle>
  </CardHeader>
  <CardContent>
    <CardDescription>{description}</CardDescription>
  </CardContent>
</Card>
```

### Hero Section Pattern
```tsx
<section className="relative bg-gradient-to-b from-background via-muted/20 to-background py-20 lg:py-32 border-b overflow-hidden">
  <div className="absolute inset-0 bg-grid-primary/[0.02] pointer-events-none" />
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
    <AnimatedSection>
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <Badge>Badge Text</Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
          Title with <span className="text-primary">Highlight</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground">
          Description
        </p>
      </div>
    </AnimatedSection>
  </div>
</section>
```

### CTA Banner Pattern
```tsx
<section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground relative overflow-hidden">
  <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
    <AnimatedSection>
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
          CTA Title
        </h2>
        <p className="text-lg sm:text-xl text-primary-foreground/90">
          CTA Description
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="xl" variant="secondary" asChild>
            <Link href="/path">Primary CTA</Link>
          </Button>
          <Button size="xl" variant="outline" asChild>
            <Link href="/path">Secondary CTA</Link>
          </Button>
        </div>
      </div>
    </AnimatedSection>
  </div>
</section>
```

## Responsive Classes

```css
/* Container */
container mx-auto px-4 sm:px-6 lg:px-8

/* Grid */
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6

/* Text Sizes */
text-4xl sm:text-5xl lg:text-6xl        /* Hero h1 */
text-3xl sm:text-4xl lg:text-5xl        /* Section h2 */
text-lg sm:text-xl                       /* Descriptions */

/* Spacing */
py-20                                     /* Section padding */
py-20 lg:py-32                           /* Hero padding */
space-y-6                                /* Vertical spacing */
gap-4 sm:gap-6 lg:gap-8                 /* Gap spacing */
```

## Icon Usage

```tsx
import {
  // Process
  Search, Calculator, Calendar,
  // Features
  Shield, Clock, Award, Users, TrendingUp, Sparkles,
  // Communication
  Phone, Mail, MapPin, Send,
  // UI
  CheckCircle, Star, ArrowRight, Loader2,
  // Services
  Wrench, Car, Paintbrush, Zap, Disc, Settings
} from 'lucide-react';
```

## Color Classes

```css
/* Backgrounds */
bg-background                /* Base background */
bg-muted/30                  /* Light section background */
bg-primary                   /* Primary color */
bg-primary/10                /* Light primary */
bg-gradient-to-br from-primary to-primary/80  /* CTA gradient */

/* Text */
text-foreground              /* Primary text */
text-muted-foreground        /* Secondary text */
text-primary                 /* Primary colored text */
text-primary-foreground      /* Text on primary bg */

/* Borders */
border-2                     /* Strong border */
border-primary/50            /* Primary border */
hover:border-primary/50      /* Hover state */
```

## Form Validation (Contact Page)

```tsx
const formSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(5).max(200),
  message: z.string().min(10).max(1000),
});

// Usage
<FormField
  control={form.control}
  name="fieldName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Label *</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

## SEO Implementation

### Server Component (About, How It Works)
```tsx
export const metadata = generatePageMetadata({
  title: 'Page Title',
  description: 'Page description',
  keywords: ['keyword1', 'keyword2'],
  path: '/path',
});
```

### Client Component (Contact)
Create separate `layout.tsx`:
```tsx
export const metadata = generatePageMetadata({...});
export default function Layout({ children }) {
  return children;
}
```

### Schema Markup
```tsx
const schema = generateSchemaFunction();

return (
  <>
    <StructuredData data={schema} />
    {/* Page content */}
  </>
);
```

## Available Schema Functions

```tsx
generatePageMetadata()          // Basic metadata
generateOrganizationSchema()    // About page
generateContactPageSchema()     // Contact page
generateHowToSchema()           // How it works
generateWebPageSchema()         // Generic page
generateFAQSchema()             // FAQ sections
```

## Testing Commands

```bash
# Build test
npm run build

# Dev server
npm run dev

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

## To-Do Before Production

1. Replace placeholder data:
   - [ ] Phone: +971-4-XXX-XXXX
   - [ ] Team member info
   - [ ] Social media links

2. Wire up functionality:
   - [ ] Contact form API endpoint
   - [ ] Email notifications
   - [ ] Spam protection

3. Add assets:
   - [ ] OG images for each page
   - [ ] Team member photos
   - [ ] Service icons

4. Set up tracking:
   - [ ] Google Analytics events
   - [ ] CTA click tracking
   - [ ] Form submission tracking

## Common Customizations

### Change Section Background
```tsx
// Light background
<section className="py-20 bg-background">

// Muted background
<section className="py-20 bg-muted/30">

// Gradient background
<section className="py-20 bg-gradient-to-br from-primary/10 to-primary/5">
```

### Adjust Animation Delay
```tsx
<AnimatedSection delay={0}>     // Immediate
<AnimatedSection delay={0.2}>   // Short delay
<AnimatedSection delay={0.4}>   // Longer delay
```

### Change Grid Columns
```tsx
// 2 columns on desktop
grid-cols-1 md:grid-cols-2

// 3 columns on desktop
grid-cols-1 md:grid-cols-2 lg:grid-cols-3

// 4 columns on desktop
grid-cols-1 md:grid-cols-2 lg:grid-cols-4
```

### Add New FAQ
```tsx
const faqs = [
  ...existingFaqs,
  {
    question: 'Your question?',
    answer: 'Your answer...',
  },
];
```

## Performance Tips

1. Icons are tree-shaken automatically
2. Animations are triggered only on scroll into view
3. Forms use client-side validation (no network calls)
4. Images should be optimized before adding
5. Use `next/image` for team photos and OG images

## Support

For questions or issues:
- Check `NEW_PAGES_SUMMARY.md` for detailed info
- Check `PAGES_STRUCTURE.md` for visual layout
- Review existing homepage patterns in `/src/app/page.tsx`

---

**Last Updated:** October 11, 2024
**Version:** 1.0.0
