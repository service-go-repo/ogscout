# Redesign Pipeline Steps

1. **Audit Existing UI**
   - Extract UI components and states from current codebase.
   - Identify layout patterns, repeated inconsistencies, and redundant components.

2. **Set Up Design Tokens**
   - Use tweakcn to generate color, spacing, typography, and radius tokens.
   - Map tokens to shadcn/ui theme.

3. **Component Refactor**
   - Refactor components to new design structure (use Claude Code CLI).
   - Follow atomic structure: atoms → molecules → organisms → pages.

4. **Accessibility Integration**
   - Add semantic HTML tags, `aria-` attributes, focus rings, and screen-reader-friendly labels.

5. **Dark Mode**
   - Use tweakcn tokens to define dark mode variants.
   - Test with both user preference and toggle switch.

6. **Responsiveness**
   - Test each layout with Playwright at common breakpoints:
     - 375px (mobile)
     - 768px (tablet)
     - 1024px (desktop)
     - 1440px (large)

7. **Testing & CI/CD**
   - Playwright: functional, visual regression, and accessibility tests.
   - GitHub Actions: run tests automatically on push/PR.
