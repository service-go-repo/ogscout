# Global Redesign Instruction File

## Objective
Redesign the "Workshop Matching" web app using Next.js + TypeScript + TailwindCSS + Zustand + shadcn/ui + tweakcn to achieve a modern, minimal, SaaS-inspired aesthetic (Linear/Vercel style).

## Core Goals
- Improve visual hierarchy and consistency
- Enhance usability, responsiveness, and accessibility
- Integrate dark mode and user personalization
- Prepare for future localization (Arabic)
- Ensure performance, scalability, and maintainability

## Design Compliance Checklist
- ✅ Visual Hierarchy (spacing, contrast, typography)
- ✅ Consistency (colors, component spacing, interaction)
- ✅ Responsiveness (mobile-first, grid fluidity)
- ✅ Accessibility (ARIA roles, keyboard nav, focus states)
- ✅ Performance (lazy loading, optimized assets)
- ✅ Error Handling (inline feedback, toasts)
- ✅ Polish (micro-interactions, transitions, shadows)
- ✅ Dark Mode (consistent design tokens)
- ✅ Personalization (remember user preferences)

## Workflow Overview
1. **Claude Code CLI** generates new UI components and pages.
2. **Sub-agents** validate design principles, component states, and accessibility.
3. **Playwright** runs visual and functional regression tests.
4. **GitHub Actions** automates testing for every push/PR.
5. **Manual Review** after each iteration to approve visual polish.
