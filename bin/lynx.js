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
const devicesCommand = require('../src/commands/devices');
const logsCommand = require('../src/commands/logs');
const cleanCommand = require('../src/commands/clean');
const installCommand = require('../src/commands/install');

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
  .option('--signed', 'Build signed APK (Android only)')
  .action(buildCommand);

program
  .command('open <platform>')
  .description('Open native project in IDE (Android Studio/Xcode/VSCode)')
  .action(openCommand);

program
  .command('run <platform>')
  .description('Build and run on device/emulator')
  .option('--release', 'Run release version')
  .option('--device <deviceId>', 'Specific device to run on')
  .action(runCommand);

program
  .command('install <platform>')
  .description('Install APK to connected device')
  .option('--release', 'Install release version')
  .option('--device <deviceId>', 'Specific device to install to')
  .option('--arch <architecture>', 'Preferred architecture (arm64, arm32, x86, x86_64)')
  .option('--force', 'Force reinstall (replace existing app)')
  .option('--no-launch', 'Do not launch app after installation')
  .action(installCommand);

program
  .command('doctor')
  .description('Check environment and dependencies')
  .action(doctorCommand);

program
  .command('devices')
  .description('List connected devices')
  .option('--android', 'Show only Android devices')
  .option('--ios', 'Show only iOS devices')
  .action(devicesCommand);

program
  .command('logs <platform>')
  .description('Show application logs')
  .option('--device <deviceId>', 'Specific device to show logs for')
  .option('--all', 'Show all logs (not filtered by app)')
  .option('--level <level>', 'Log level (V/D/I/W/E)', 'I')
  .option('--clear', 'Clear logs before showing')
  .action(logsCommand);

program
  .command('clean')
  .description('Clean project build caches')
  .option('--all', 'Clean everything including node_modules')
  .option('--android', 'Clean only Android')
  .option('--ios', 'Clean only iOS')
  .option('--native', 'Clean only native platforms')
  .action(cleanCommand);

program.parse();
