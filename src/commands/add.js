const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const ora = require('ora');

const CONFIG_FILE = 'lynx.config.json';

async function addCommand(platform, options) {
  platform = platform.toLowerCase();
  
  if (!['android', 'ios', 'web'].includes(platform)) {
    console.log(chalk.red(`✗ Invalid platform: ${platform}`));
    console.log(chalk.gray('  Supported platforms: android, ios, web'));
    return;
  }

  // Load config
  const configPath = path.join(process.cwd(), CONFIG_FILE);
  if (!fs.existsSync(configPath)) {
    console.log(chalk.red(`✗ ${CONFIG_FILE} not found.`));
    console.log(chalk.gray('  Run "lynx init" first.'));
    return;
  }

  const config = await fs.readJson(configPath);
  
  // Check if platform already exists
  const platformDir = path.join(process.cwd(), platform);
  if (fs.existsSync(platformDir)) {
    console.log(chalk.yellow(`⚠ ${platform} directory already exists.`));
    const { overwrite } = await inquirer.prompt([{
      type: 'confirm',
      name: 'overwrite',
      message: 'Do you want to remove and recreate it?',
      default: false
    }]);
    if (!overwrite) {
      console.log(chalk.gray('Aborted.'));
      return;
    }
    await fs.remove(platformDir);
  }

  const spinner = ora(`Adding ${platform} platform...`).start();

  try {
    const templateDir = path.join(__dirname, '..', '..', 'templates', platform);
    
    if (!fs.existsSync(templateDir)) {
      spinner.fail(chalk.red(`Template for ${platform} not found`));
      return;
    }

    // Copy template
    await fs.copy(templateDir, platformDir);
    
    // Replace placeholders in files
    await replacePlaceholders(platformDir, {
      APP_NAME: config.appName,
      APP_ID: config.appId,
      PACKAGE_NAME: config.appId,
      PACKAGE_PATH: config.appId.replace(/\./g, '/')
    });

    // Update config
    config.platforms[platform] = {
      path: platform,
      added: new Date().toISOString()
    };
    await fs.writeJson(configPath, config, { spaces: 2 });

    spinner.succeed(chalk.green(`${platform} platform added!`));
    
    console.log('\n' + chalk.cyan('Project created at: ') + chalk.white(platformDir));
    
    if (platform === 'android') {
      console.log('\n' + chalk.cyan('Next steps:'));
      console.log(chalk.white('  1. Build your Lynx app:  ') + chalk.yellow('npm run build'));
      console.log(chalk.white('  2. Sync bundle:          ') + chalk.yellow('lynx sync'));
      console.log(chalk.white('  3. Open in Android Studio or run:'));
      console.log(chalk.yellow(`     lynx open android`));
      console.log(chalk.yellow(`     lynx build android`));
    } else if (platform === 'ios') {
      console.log('\n' + chalk.cyan('Next steps:'));
      console.log(chalk.white('  1. Build your Lynx app:  ') + chalk.yellow('npm run build'));
      console.log(chalk.white('  2. Install CocoaPods:    ') + chalk.yellow(`cd ios && pod install`));
      console.log(chalk.white('  3. Sync bundle:          ') + chalk.yellow('lynx sync'));
      console.log(chalk.white('  4. Open in Xcode:        ') + chalk.yellow('lynx open ios'));
    } else if (platform === 'web') {
      console.log('\n' + chalk.cyan('Next steps:'));
      console.log(chalk.white('  1. Install dependencies: ') + chalk.yellow(`cd web && npm install`));
      console.log(chalk.white('  2. Build your Lynx app:  ') + chalk.yellow('npm run build'));
      console.log(chalk.white('  3. Sync bundle:          ') + chalk.yellow('lynx sync'));
      console.log(chalk.white('  4. Run dev server:       ') + chalk.yellow('lynx run web'));
    }

  } catch (error) {
    spinner.fail(chalk.red(`Failed to add ${platform} platform`));
    console.error(error);
  }
}

async function replacePlaceholders(dir, replacements) {
  const files = await fs.readdir(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);
    
    if (stat.isDirectory()) {
      // Check if directory name needs renaming
      let newDirPath = filePath;
      for (const [key, value] of Object.entries(replacements)) {
        if (file.includes(`__${key}__`)) {
          // For PACKAGE_PATH, we need to create nested directories
          const newDirName = file.replace(`__${key}__`, value);
          newDirPath = path.join(dir, newDirName);
          
          // Create the new directory structure
          await fs.ensureDir(newDirPath);
          
          // Move all files from old directory to new one
          const oldFiles = await fs.readdir(filePath);
          for (const oldFile of oldFiles) {
            await fs.move(
              path.join(filePath, oldFile),
              path.join(newDirPath, oldFile),
              { overwrite: true }
            );
          }
          
          // Remove old directory
          await fs.remove(filePath);
          break;
        }
      }
      await replacePlaceholders(newDirPath, replacements);
    } else {
      // Replace content in files
      const ext = path.extname(file).toLowerCase();
      const textExtensions = ['.java', '.kt', '.xml', '.gradle', '.kts', '.properties', '.swift', '.m', '.h', '.plist', '.json', '.js', '.ts'];
      
      if (textExtensions.includes(ext) || file === 'gradlew' || file === 'Podfile') {
        let content = await fs.readFile(filePath, 'utf8');
        let modified = false;
        
        for (const [key, value] of Object.entries(replacements)) {
          const placeholder = `__${key}__`;
          if (content.includes(placeholder)) {
            content = content.split(placeholder).join(value);
            modified = true;
          }
        }
        
        if (modified) {
          await fs.writeFile(filePath, content, 'utf8');
        }
      }

      // Rename file if needed
      let newFileName = file;
      for (const [key, value] of Object.entries(replacements)) {
        if (file.includes(`__${key}__`)) {
          newFileName = file.replace(`__${key}__`, value);
        }
      }
      if (newFileName !== file) {
        await fs.rename(filePath, path.join(dir, newFileName));
      }
    }
  }
}

module.exports = addCommand;
