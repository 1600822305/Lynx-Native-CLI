const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const ora = require('ora');

const CONFIG_FILE = 'lynx.config.json';

async function initCommand() {
  const configPath = path.join(process.cwd(), CONFIG_FILE);
  
  if (fs.existsSync(configPath)) {
    console.log(chalk.yellow(`⚠ ${CONFIG_FILE} already exists.`));
    const { overwrite } = await inquirer.prompt([{
      type: 'confirm',
      name: 'overwrite',
      message: 'Do you want to overwrite it?',
      default: false
    }]);
    if (!overwrite) {
      console.log(chalk.gray('Aborted.'));
      return;
    }
  }

  // Check if this is a Lynx project
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  let projectName = 'MyLynxApp';
  
  if (fs.existsSync(packageJsonPath)) {
    const pkg = require(packageJsonPath);
    projectName = pkg.name || projectName;
  }

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'appName',
      message: 'Application name:',
      default: projectName
    },
    {
      type: 'input',
      name: 'appId',
      message: 'Application ID (e.g., com.example.app):',
      default: `com.lynx.${projectName.toLowerCase().replace(/[^a-z0-9]/g, '')}`
    },
    {
      type: 'input',
      name: 'distDir',
      message: 'Build output directory:',
      default: 'dist'
    },
    {
      type: 'input',
      name: 'bundleName',
      message: 'Bundle filename:',
      default: 'main.lynx.bundle'
    }
  ]);

  const config = {
    appName: answers.appName,
    appId: answers.appId,
    distDir: answers.distDir,
    bundleName: answers.bundleName,
    platforms: {},
    created: new Date().toISOString()
  };

  const spinner = ora('Creating configuration...').start();

  try {
    await fs.writeJson(configPath, config, { spaces: 2 });
    spinner.succeed(chalk.green('Configuration created!'));
    
    console.log('\n' + chalk.cyan('Next steps:'));
    console.log(chalk.white('  1. Add Android platform:  ') + chalk.yellow('lynx add android'));
    console.log(chalk.white('  2. Add iOS platform:      ') + chalk.yellow('lynx add ios'));
    console.log(chalk.white('  3. Build your Lynx app:   ') + chalk.yellow('npm run build'));
    console.log(chalk.white('  4. Sync to native:        ') + chalk.yellow('lynx sync'));
    console.log(chalk.white('  5. Build APK/IPA:         ') + chalk.yellow('lynx build android'));
  } catch (error) {
    spinner.fail(chalk.red('Failed to create configuration'));
    console.error(error);
  }
}

module.exports = initCommand;
