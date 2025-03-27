# next-setup

A CLI tool to quickly create Next.js projects with shadcn/ui components, custom animations, logger, and other useful utilities.

## Features

- Sets up a new Next.js project with App Router and TypeScript
- Configures Tailwind CSS 
- Installs and configures shadcn/ui with Zinc color theme
- Includes custom animation components (BlurFade, BlurFadeStagger)
- Includes a custom logger utility
- Installs common UI libraries and dependencies
- Configures Turbopack for faster development
- Sets up prettier with tailwind plugin

## Installation

### Global Installation

```bash
# Using npm
npm install -g next-setup

# Using yarn
yarn global add next-setup

# Using pnpm
pnpm add -g next-setup
```

### Or use with npx without installing

```bash
npx next-setup my-project
```

## Usage

Once installed, you can create a new project with:

```bash
next-setup my-project
```

By default, it uses pnpm as the package manager. You can specify a different package manager:

```bash
# Use npm
next-setup my-project --npm

# Use yarn
next-setup my-project --yarn
```

You can also disable Turbopack if you prefer:

```bash
next-setup my-project --no-turbo
```

### After Creation

Navigate to your new project and start the development server:

```bash
cd my-project
pnpm dev  # or npm run dev, or yarn dev
```

## Included Components and Utilities

### Animation Components

The CLI includes these animation components:

- `BlurFade`: A component for smooth fade-in animations with blur effects
- `BlurFadeStagger`: A component for creating staggered animations with multiple children

### Utility Functions

- `logger`: A custom logging utility with support for different log levels and colorized output
- `cn`: A utility function for merging Tailwind classes with clsx and tailwind-merge

### Installed shadcn Components

The CLI automatically installs these shadcn/ui components:

- Button
- Card
- Dialog
- Separator

## Adding More shadcn Components

To add more shadcn components to your project, run:

```bash
# Using pnpm (default)
pnpm dlx shadcn-ui@latest add [component-name]

# Using npm
npx shadcn-ui@latest add [component-name]

# Using yarn
npx shadcn-ui@latest add [component-name]
```

## Project Structure

The CLI creates the following structure for your project:

```
my-project/
├── src/
│   ├── app/
│   ├── components/
│   │   └── animations/
│   │       ├── blur-fade.tsx
│   │       └── blur-fade-stagger.tsx
│   └── lib/
│       ├── logger.ts
│       └── utils.ts
├── package.json
├── .prettierrc
└── project-info.md
```

After setup, refer to `project-info.md` for more details about your project.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT 