const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');

const CONFIG_FILE = 'lynx.config.json';

async function syncCommand(options) {
  // Load config
  const configPath = path.join(process.cwd(), CONFIG_FILE);
  if (!fs.existsSync(configPath)) {
    console.log(chalk.red(`✗ ${CONFIG_FILE} not found.`));
    console.log(chalk.gray('  Run "lynx init" first.'));
    return;
  }

  const config = await fs.readJson(configPath);
  const distDir = path.join(process.cwd(), config.distDir);

  // Check if dist exists
  if (!fs.existsSync(distDir)) {
    console.log(chalk.red(`✗ Build directory not found: ${config.distDir}`));
    console.log(chalk.gray('  Run "npm run build" first to generate the bundle.'));
    return;
  }

  const bundlePath = path.join(distDir, config.bundleName);
  if (!fs.existsSync(bundlePath)) {
    console.log(chalk.red(`✗ Bundle not found: ${bundlePath}`));
    console.log(chalk.gray('  Make sure your build generates the correct bundle file.'));
    return;
  }

  const platforms = options.platform 
    ? [options.platform] 
    : Object.keys(config.platforms);

  if (platforms.length === 0) {
    console.log(chalk.yellow('⚠ No platforms added yet.'));
    console.log(chalk.gray('  Run "lynx add android" or "lynx add ios" first.'));
    return;
  }

  for (const platform of platforms) {
    if (!config.platforms[platform]) {
      console.log(chalk.yellow(`⚠ Platform ${platform} not added. Skipping...`));
      continue;
    }

    const spinner = ora(`Syncing to ${platform}...`).start();

    try {
      let assetsDir;
      
      if (platform === 'android') {
        assetsDir = path.join(process.cwd(), 'android', 'app', 'src', 'main', 'assets');
      } else if (platform === 'ios') {
        assetsDir = path.join(process.cwd(), 'ios', 'App', 'Assets');
      } else if (platform === 'web') {
        assetsDir = path.join(process.cwd(), 'web', 'public', 'assets');
      }

      // Ensure assets directory exists
      await fs.ensureDir(assetsDir);

      // Copy bundle
      await fs.copy(bundlePath, path.join(assetsDir, config.bundleName));

      // Copy all files and directories from dist (except bundle itself and hidden files)
      const distItems = await fs.readdir(distDir);
      let copiedAssets = [];
      
      for (const item of distItems) {
        // Skip bundle file, hidden files/dirs
        if (item === config.bundleName || item.startsWith('.')) {
          continue;
        }
        
        const itemPath = path.join(distDir, item);
        const destPath = path.join(assetsDir, item);
        
        try {
          await fs.copy(itemPath, destPath);
          copiedAssets.push(item);
        } catch (e) {
          // Ignore copy errors for individual items
        }
      }

      spinner.succeed(chalk.green(`Synced to ${platform}`));
      console.log(chalk.gray(`  → ${assetsDir}`));
      
      if (copiedAssets.length > 0) {
        console.log(chalk.gray(`  Assets copied: ${copiedAssets.join(', ')}`));
      }

    } catch (error) {
      spinner.fail(chalk.red(`Failed to sync to ${platform}`));
      console.error(error);
    }
  }

  console.log('\n' + chalk.green('✓ Sync complete!'));
  console.log(chalk.gray('  You can now build your native app.'));
}

module.exports = syncCommand;
