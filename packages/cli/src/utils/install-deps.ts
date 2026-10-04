import { execSync } from 'child_process'
import prompts from 'prompts'
import chalk from 'chalk'

export async function installDependencies(missingDeps: string[]): Promise<void> {
  if (missingDeps.length === 0) return

  console.log(
    chalk.yellow('⚠') + ` Missing dependencies: ${chalk.cyan(missingDeps.join(', '))}`
  )

  const { confirm } = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: 'Would you like to install them automatically?',
    initial: true,
  })

  if (confirm) {
    console.log(chalk.dim('Installing dependencies...'))
    try {
      execSync(`npm install ${missingDeps.join(' ')}`, { stdio: 'inherit' })
      console.log(chalk.green('✓') + ' Dependencies installed successfully.')
    } catch {
      console.error(
        chalk.red('✗') + ' Failed to install dependencies. Please install them manually.'
      )
      process.exit(1)
    }
  } else {
    console.log(
      chalk.dim('Skipping dependency installation. You may need to install them manually.')
    )
  }
}
