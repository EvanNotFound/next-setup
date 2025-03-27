# Project Information

This project was set up with next-setup CLI and includes:

- Next.js with TypeScript and Tailwind CSS
- shadcn/ui component library
- Framer Motion for animations
- Pre-built animation components
- Prettier for code formatting
- Logger utility for development

## Development Commands

- `pnpm dev`: Start the development server with Turbopack
- `pnpm build`: Build the application for production
- `pnpm start`: Start the production server
- `pnpm lint`: Run ESLint

## Project Structure

```
src/
  ├── app/             # App Router
  ├── components/      # React components
  │   └── animations/  # Animation components
  ├── lib/             # Utility functions
  │   ├── utils.ts     # Utility functions
  │   └── logger.ts    # Console logger with colors
  └── styles/          # CSS styles
```

## Animation Components

The project includes pre-built animation components:

- `BlurFade` - Fade in with blur effect
- `BlurFadeStagger` - Staggered fade in with blur effect

Example usage:

```tsx
import { BlurFade } from "@/components/animations/blur-fade";

export default function Page() {
  return (
    <BlurFade>
      <h1>Animated Content</h1>
    </BlurFade>
  );
}
```

## shadcn/ui Components

### Installing Additional Components

```bash
pnpm dlx shadcn-ui@latest add [component-name]
```

### Available Components

Visit [shadcn/ui documentation](https://ui.shadcn.com/docs/components) for a complete list of available components.

## Working with the Logger

The project includes a custom logger utility:

```typescript
import { logger } from "@/lib/logger";

// Available log levels
logger.info("Information message");
logger.success("Success message");
logger.warn("Warning message");
logger.error("Error message");
logger.debug("Debug message"); // Only shown when DEBUG=true
```

## Customizing

### Theme

The shadcn/ui theme can be customized in `src/components/ui/theme.ts`.

### Tailwind Configuration

Modify the Tailwind configuration in `tailwind.config.js`. 