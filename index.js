#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');
const ora = require('ora');

// Get package version from package.json
const packageJson = require('./package.json');

// Setup Commander
program
  .name('next-setup')
  .version(packageJson.version)
  .description('CLI tool to create Next.js projects with shadcn/ui, custom animations, and logger')
  .argument('<project-name>', 'Name of the project to create')
  .option('--no-turbo', 'Do not use Turbopack for development server')
  .option('--pnpm', 'Use pnpm as package manager (default)')
  .option('--npm', 'Use npm as package manager')
  .option('--yarn', 'Use yarn as package manager')
  .action(async (projectName, options) => {
    try {
      await createProject(projectName, options);
    } catch (error) {
      console.error(chalk.red('Error: ') + error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);

async function createProject(projectName, options) {
  // Determine package manager
  let packageManager = 'pnpm';
  if (options.npm) packageManager = 'npm';
  if (options.yarn) packageManager = 'yarn';

  const spinner = ora(`Creating new Next.js project: ${chalk.green(projectName)}`).start();

  try {
    // Get current directory and template directory
    const currentDir = process.cwd();
    const templateDir = path.join(__dirname);
    const projectDir = path.join(currentDir, projectName);

    // Display the directory we're working in
    spinner.info(`Working in directory: ${chalk.blue(currentDir)}`);
    spinner.info(`Creating project in: ${chalk.blue(projectDir)}`);
    spinner.text = 'Creating Next.js project...';
    
    // Create Next.js app with chosen package manager
    try {
      if (packageManager === 'pnpm') {
        execSync(`pnpm create next-app ${projectName} --ts --tailwind --app --import-alias="@/*" --use-pnpm`, { stdio: 'inherit' });
      } else if (packageManager === 'yarn') {
        execSync(`yarn create next-app ${projectName} --ts --tailwind --app --import-alias="@/*" --use-yarn`, { stdio: 'inherit' });
      } else {
        execSync(`npx create-next-app ${projectName} --ts --tailwind --app --import-alias="@/*"`, { stdio: 'inherit' });
      }
    } catch (error) {
      spinner.fail(`Failed to create Next.js project: ${chalk.red(error.message)}`);
      throw new Error(`Failed to create Next.js project: ${error.message}`);
    }

    // Check if the project directory was created
    if (!fs.existsSync(projectDir)) {
      spinner.fail(`Project directory was not created at: ${chalk.red(projectDir)}`);
      throw new Error(`Project directory ${projectDir} was not created. Please check error output above.`);
    }

    // Change to project directory
    try {
      process.chdir(projectDir);
      spinner.succeed(`Changed to project directory: ${chalk.green(projectDir)}`);
    } catch (error) {
      spinner.fail(`Failed to change to project directory: ${chalk.red(projectDir)}`);
      throw error;
    }

    // Install shadcn
    spinner.text = 'Installing shadcn components...';
    if (packageManager === 'pnpm') {
      execSync('pnpm add -D @shadcn/ui', { stdio: 'inherit' });
      execSync('pnpm dlx shadcn@latest init --yes', { stdio: 'inherit' });
    } else if (packageManager === 'yarn') {
      execSync('yarn add -D @shadcn/ui', { stdio: 'inherit' });
      execSync('npx shadcn@latest init --yes', { stdio: 'inherit' });
    } else {
      execSync('npm install -D @shadcn/ui', { stdio: 'inherit' });
      execSync('npx shadcn@latest init --yes', { stdio: 'inherit' });
    }

    // Install animation dependencies
    spinner.text = 'Installing dependencies...';
    const dependencies = [
      'framer-motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      'lucide-react',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      '@icons-pack/react-simple-icons',
      'geist',
      'tw-animate-css'
    ];

    const devDependencies = [
      'prettier',
      'prettier-plugin-tailwindcss'
    ];

    if (packageManager === 'pnpm') {
      execSync(`pnpm add ${dependencies.join(' ')}`, { stdio: 'ignore' });
      execSync(`pnpm add -D ${devDependencies.join(' ')}`, { stdio: 'ignore' });
    } else if (packageManager === 'yarn') {
      execSync(`yarn add ${dependencies.join(' ')}`, { stdio: 'ignore' });
      execSync(`yarn add -D ${devDependencies.join(' ')}`, { stdio: 'ignore' });
    } else {
      execSync(`npm install ${dependencies.join(' ')}`, { stdio: 'ignore' });
      execSync(`npm install -D ${devDependencies.join(' ')}`, { stdio: 'ignore' });
    }

    // Create directory structure
    spinner.text = 'Creating directory structure...';
    fs.mkdirpSync(path.join(projectDir, 'src/components/animations'));
    fs.mkdirpSync(path.join(projectDir, 'src/lib'));

    // Copy template files
    spinner.text = 'Copying template files...';
    const animationsDir = path.join(templateDir, 'animations');
    const libDir = path.join(templateDir, 'lib');

    // Check if template directories exist before copying
    if (fs.existsSync(animationsDir) && fs.readdirSync(animationsDir).length > 0) {
      fs.copySync(animationsDir, path.join(projectDir, 'src/components/animations'));
      spinner.succeed('Copied animation components');
    } else {
      spinner.warn('Animation templates not found or empty. Creating basic structure only.');
      // Create basic animation files if templates are missing
      fs.writeFileSync(path.join(projectDir, 'src/components/animations/blur-fade.tsx'), `"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function BlurFade({
  children,
  className,
  delay = 0,
  duration = 0.5,
}: BlurFadeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ delay, duration }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
`);
    }

    if (fs.existsSync(libDir)) {
      fs.copySync(libDir, path.join(projectDir, 'src/lib'));
      spinner.succeed('Copied utility files');
    } else {
      spinner.warn('Utility templates not found. Creating basic files only.');
    }

    // Create .prettierrc
    fs.writeFileSync(path.join(projectDir, '.prettierrc'), `{
  "tabWidth": 2,
  "semi": true,
  "singleQuote": false,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss"]
}
`);

    // Create utils.ts if not already copied
    if (!fs.existsSync(path.join(projectDir, 'src/lib/utils.ts'))) {
      fs.writeFileSync(path.join(projectDir, 'src/lib/utils.ts'), `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`);
    }

    // Install shadcn components
    spinner.text = 'Installing common shadcn components...';
    const shadcnComponents = [
      'button',
      'card',
      'input',
      'form',
      'select',
      'dialog',
      'dropdown-menu',
      'sonner'
    ];
    
    // List of all available shadcn components for reference
    const allShadcnComponents = [
      'accordion', 'alert', 'alert-dialog', 'aspect-ratio', 'avatar',
      'badge', 'breadcrumb', 'button', 'calendar', 'card', 'carousel',
      'checkbox', 'collapsible', 'command', 'context-menu', 'data-table',
      'date-picker', 'dialog', 'dropdown-menu', 'form', 'hover-card',
      'input', 'label', 'menubar', 'navigation-menu', 'pagination',
      'popover', 'progress', 'radio-group', 'scroll-area', 'select',
      'separator', 'sheet', 'skeleton', 'slider', 'sonner', 'switch',
      'table', 'tabs', 'textarea', 'toast', 'toggle', 'tooltip'
    ];
    
    const installedComponents = [];
    const failedComponents = [];
    
    for (const component of shadcnComponents) {
      try {
        spinner.text = `Installing shadcn component: ${component}...`;
        if (packageManager === 'pnpm') {
          execSync(`pnpm dlx shadcn@latest add ${component} --yes`, { stdio: 'inherit' });
        } else if (packageManager === 'yarn') {
          execSync(`npx shadcn@latest add ${component} --yes`, { stdio: 'inherit' });
        } else {
          execSync(`npx shadcn@latest add ${component} --yes`, { stdio: 'inherit' });
        }
        installedComponents.push(component);
      } catch (error) {
        spinner.warn(`Failed to install component: ${component}`);
        failedComponents.push(component);
      }
    }

    // Update Next.js config to use Turbopack (if enabled)
    if (options.turbo) {
      spinner.text = 'Updating Next.js config to use Turbopack...';
      
      // Read package.json
      const pkgJsonPath = path.join(projectDir, 'package.json');
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      
      // Update dev script
      if (pkgJson.scripts && pkgJson.scripts.dev) {
        pkgJson.scripts.dev = 'next dev --turbopack';
        // Write updated package.json
        fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
      }
    }

    // Copy project-info.md
    const projectInfoPath = path.join(templateDir, 'project-info.md');
    
    // Check if project-info.md exists in the template directory
    if (fs.existsSync(projectInfoPath)) {
      // Read project-info.md
      let projectInfo = fs.readFileSync(projectInfoPath, 'utf8');
      
      // Replace placeholders with actual values
      projectInfo = projectInfo.replace(/pnpm dev/g, `${packageManager}${packageManager === 'npm' ? ' run' : ''} dev`);
      projectInfo = projectInfo.replace(/with Turbopack/g, options.turbo ? ' with Turbopack' : '');
      projectInfo = projectInfo.replace(/pnpm build/g, `${packageManager}${packageManager === 'npm' ? ' run' : ''} build`);
      projectInfo = projectInfo.replace(/pnpm start/g, `${packageManager}${packageManager === 'npm' ? ' run' : ''} start`);
      projectInfo = projectInfo.replace(/pnpm lint/g, `${packageManager}${packageManager === 'npm' ? ' run' : ''} lint`);
      projectInfo = projectInfo.replace(/pnpm dlx/g, packageManager === 'pnpm' ? 'pnpm dlx' : 'npx');
      
      // Write project-info.md
      fs.writeFileSync(path.join(projectDir, 'project-info.md'), projectInfo);
    } else {
      // If project-info.md doesn't exist, create a basic one
      fs.writeFileSync(path.join(projectDir, 'project-info.md'), `# Project Information

This project was set up with next-setup and includes:

## Development Commands

- \`${packageManager}${packageManager === 'npm' ? ' run' : ''} dev\`: Start the development server${options.turbo ? ' with Turbopack' : ''}
- \`${packageManager}${packageManager === 'npm' ? ' run' : ''} build\`: Build the application for production
- \`${packageManager}${packageManager === 'npm' ? ' run' : ''} start\`: Start the production server
- \`${packageManager}${packageManager === 'npm' ? ' run' : ''} lint\`: Run ESLint

## Installed shadcn/ui Components

The following shadcn/ui components have been pre-installed:
${installedComponents.map(comp => `- ${comp}`).join('\n')}

${failedComponents.length > 0 ? `\n> Note: The following components failed to install and may need to be installed manually: ${failedComponents.join(', ')}\n` : ''}

## Installing Additional shadcn/ui Components

\`\`\`bash
${packageManager === 'pnpm' ? 'pnpm dlx' : 'npx'} shadcn@latest add [component-name]
\`\`\`

## Available shadcn/ui Components

You can install any of these additional components:
${allShadcnComponents.filter(comp => !installedComponents.includes(comp)).map(comp => `- ${comp}`).join('\n')}

Visit [shadcn/ui documentation](https://ui.shadcn.com/docs/components) for more details.
`);
    }

    spinner.succeed(chalk.green('Setup complete!'));
    console.log(`Your Next.js project has been created at ${chalk.blue(projectDir)}`);
    console.log('\nTo get started:');
    console.log(chalk.yellow(`  cd ${projectName}`));
    console.log(chalk.yellow(`  ${packageManager}${packageManager === 'npm' ? ' run' : ''} dev`));
    
    // Display information about shadcn/ui components
    console.log(`\n${chalk.magenta('Installed shadcn/ui components:')}`);
    console.log(installedComponents.map(comp => `  - ${comp}`).join('\n'));
    
    if (failedComponents.length > 0) {
      console.log(`\n${chalk.yellow('Failed to install these components:')}`);
      console.log(failedComponents.map(comp => `  - ${comp}`).join('\n'));
    }
    
    console.log(`\nRefer to ${chalk.blue('project-info.md')} for more information about your project`);
    console.log(`\nTo install more shadcn/ui components, run:`);
    console.log(chalk.yellow(`  ${packageManager === 'pnpm' ? 'pnpm dlx' : 'npx'} shadcn@latest add [component-name]`));
  } catch (error) {
    spinner.fail('Setup failed');
    throw error;
  }
} 