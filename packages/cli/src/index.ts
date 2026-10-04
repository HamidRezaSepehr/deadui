#!/usr/bin/env node

import { Command } from 'commander'
import { addCommand } from './commands/add.js'
import { initCommand } from './commands/init.js'

const program = new Command()

program
  .name('deadui')
  .description('💀 Dead UI — Dead simple animations for React')
  .version('0.1.0')

program
  .command('add')
  .description('Add a Dead UI component to your project')
  .argument('<component>', 'Component name to add (e.g., cinematic-text)')
  .option('--pro', 'Install a Pro component (requires license)')
  .option('--token <token>', 'License token for Pro components')
  .option('--github-token <pat>', 'GitHub PAT with read access to the private Pro repo')
  .action(addCommand)

program
  .command('init')
  .description('Initialize your project with Dead UI dependencies and config')
  .action(initCommand)

program.parse()