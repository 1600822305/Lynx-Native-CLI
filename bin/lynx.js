#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const pkg = require('../package.json');

const initCommand = require('../src/commands/init');
const addCommand = require('../src/commands/add');
const syncCommand = require('../src/commands/sync');
const buildCommand = require('../src/commands/build');
const openCommand = require('../src/commands/open');
const runCommand = require('../src/commands/run');
const doctorCommand = require('../src/commands/doctor');

console.log(chalk.cyan(`
╦  ╦ ╦╔╗╔╔═╗  ╔╗╔╔═╗╔╦╗╦╦  ╦╔═╗
║  ╚╦╝║║║╠═╣  ║║║╠═╣ ║ ║╚╗╔╝║╣ 
╩═╝ ╩ ╝╚╝╩ ╩  ╝╚╝╩ ╩ ╩ ╩ ╚╝ ╚═╝
`));
console.log(chalk.gray(`v${pkg.version} - Generate native projects for Lynx apps\n`));

program
  .name('lynx-native')
  .description('CLI to generate native Android/iOS projects for Lynx applications')
  .version(pkg.version);

program
  .command('init')
  .description('Initialize Lynx Native configuration in current project')
  .action(initCommand);

program
  .command('add <platform>')
  .description('Add a native platform (android/ios)')
  .option('-n, --name <name>', 'Application name')
  .option('-p, --package <package>', 'Package/Bundle ID (e.g., com.example.app)')
  .action(addCommand);

program
  .command('sync')
  .description('Sync web assets to native projects')
  .option('--platform <platform>', 'Specific platform to sync (android/ios)')
  .action(syncCommand);

program
  .command('build <platform>')
  .description('Build native project (android/ios/web)')
  .option('--release', 'Build release version')
  .option('--arch <architecture>', 'Build for specific architecture (arm64, arm32, x86, x86_64, universal)')
  .action(buildCommand);

program
  .command('open <platform>')
  .description('Open native project in IDE (Android Studio/Xcode/VSCode)')
  .action(openCommand);

program
  .command('run <platform>')
  .description('Build and run on device/emulator')
  .option('--release', 'Run release version')
  .action(runCommand);

program
  .command('doctor')
  .description('Check environment and dependencies')
  .action(doctorCommand);

program.parse();
