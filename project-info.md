# Project Information

This project was set up with next-setup and includes:

## Installed Libraries

- Next.js with App Router and TypeScript
- Tailwind CSS
- shadcn/ui components with Zinc color theme
- Framer Motion for animations
- Custom animation components (BlurFade, BlurFadeStagger)
- Custom logger utility
- Radix UI primitives
- Lucide React icons
- Simple Icons pack
- Geist font
- Tailwind utilities (class-variance-authority, clsx, tailwind-merge)

## Custom Components

### Animation Components

- `BlurFade`: A component for smooth fade-in animations with blur effects
- `BlurFadeStagger`: A component for creating staggered animations with multiple children

### Utility Functions

- `logger`: A custom logging utility with support for different log levels and colorized output
- `cn`: A utility function for merging Tailwind classes with clsx and tailwind-merge

## Development Commands

- `pnpm dev`: Start the development server with Turbopack
- `pnpm build`: Build the application for production
- `pnpm start`: Start the production server
- `pnpm lint`: Run ESLint

## Installing Additional shadcn Components

```bash
pnpm dlx shadcn-ui@latest add [component-name]
``` 