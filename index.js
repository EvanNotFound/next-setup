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

    // Create Next.js project
    spinner.text = 'Creating Next.js project...';
    
    // Create Next.js app with chosen package manager
    if (packageManager === 'pnpm') {
      execSync(`pnpm create next-app ${projectName} --ts --tailwind --app --import-alias="@/*" --use-pnpm`, { stdio: 'ignore' });
    } else if (packageManager === 'yarn') {
      execSync(`yarn create next-app ${projectName} --ts --tailwind --app --import-alias="@/*" --use-yarn`, { stdio: 'ignore' });
    } else {
      execSync(`npx create-next-app ${projectName} --ts --tailwind --app --import-alias="@/*"`, { stdio: 'ignore' });
    }

    // Change to project directory
    process.chdir(projectDir);

    // Install shadcn
    spinner.text = 'Installing shadcn components...';
    if (packageManager === 'pnpm') {
      execSync('pnpm add -D @shadcn/ui', { stdio: 'ignore' });
      execSync('pnpm dlx shadcn-ui@latest init --yes --style=new-york --base-color=zinc', { stdio: 'ignore' });
    } else if (packageManager === 'yarn') {
      execSync('yarn add -D @shadcn/ui', { stdio: 'ignore' });
      execSync('npx shadcn-ui@latest init --yes --style=new-york --base-color=zinc', { stdio: 'ignore' });
    } else {
      execSync('npm install -D @shadcn/ui', { stdio: 'ignore' });
      execSync('npx shadcn-ui@latest init --yes --style=new-york --base-color=zinc', { stdio: 'ignore' });
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
    fs.copySync(path.join(templateDir, 'animations'), path.join(projectDir, 'src/components/animations'));
    fs.copySync(path.join(templateDir, 'lib'), path.join(projectDir, 'src/lib'));

    // Create .prettierrc
    fs.writeFileSync(path.join(projectDir, '.prettierrc'), `{
  "tabWidth": 2,
  "semi": true,
  "singleQuote": false,
  "trailingComma": "es5"
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
    const shadcnComponents = ['button', 'card', 'dialog', 'separator'];
    
    for (const component of shadcnComponents) {
      if (packageManager === 'pnpm') {
        execSync(`pnpm dlx shadcn-ui@latest add ${component}`, { stdio: 'ignore' });
      } else if (packageManager === 'yarn') {
        execSync(`npx shadcn-ui@latest add ${component}`, { stdio: 'ignore' });
      } else {
        execSync(`npx shadcn-ui@latest add ${component}`, { stdio: 'ignore' });
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

## Installing Additional shadcn Components

\`\`\`bash
${packageManager === 'pnpm' ? 'pnpm dlx' : 'npx'} shadcn-ui@latest add [component-name]
\`\`\`
`);
    }

    spinner.succeed(chalk.green('Setup complete!'));
    console.log(`Your Next.js project has been created at ${chalk.blue(projectDir)}`);
    console.log('\nTo get started:');
    console.log(chalk.yellow(`  cd ${projectName}`));
    console.log(chalk.yellow(`  ${packageManager}${packageManager === 'npm' ? ' run' : ''} dev`));
    console.log(`\nRefer to ${chalk.blue('project-info.md')} for more information about your project`);
  } catch (error) {
    spinner.fail('Setup failed');
    throw error;
  }
} 