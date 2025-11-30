const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const { spawn } = require('child_process');

const CONFIG_FILE = 'lynx.config.json';

async function buildCommand(platform, options) {
  platform = platform.toLowerCase();

  if (!['android', 'ios'].includes(platform)) {
    console.log(chalk.red(`✗ Invalid platform: ${platform}`));
    console.log(chalk.gray('  Supported platforms: android, ios'));
    return;
  }

  // Load config
  const configPath = path.join(process.cwd(), CONFIG_FILE);
  if (!fs.existsSync(configPath)) {
    console.log(chalk.red(`✗ ${CONFIG_FILE} not found.`));
    console.log(chalk.gray('  Run "lynx-native init" first.'));
    return;
  }

  const config = await fs.readJson(configPath);

  if (!config.platforms[platform]) {
    console.log(chalk.red(`✗ Platform ${platform} not added.`));
    console.log(chalk.gray(`  Run "lynx-native add ${platform}" first.`));
    return;
  }

  const platformDir = path.join(process.cwd(), platform);
  if (!fs.existsSync(platformDir)) {
    console.log(chalk.red(`✗ Platform directory not found: ${platformDir}`));
    return;
  }

  console.log(chalk.cyan(`\nBuilding ${platform}...`));
  console.log(chalk.gray(`Mode: ${options.release ? 'Release' : 'Debug'}\n`));

  if (platform === 'android') {
    await buildAndroid(platformDir, options);
  } else if (platform === 'ios') {
    await buildIOS(platformDir, options);
  }
}

async function buildAndroid(platformDir, options) {
  const isWindows = process.platform === 'win32';
  const gradlew = isWindows ? 'gradlew.bat' : './gradlew';
  const task = options.release ? 'assembleRelease' : 'assembleDebug';

  return new Promise((resolve, reject) => {
    const args = [task, '--no-daemon'];
    
    console.log(chalk.gray(`Running: ${gradlew} ${args.join(' ')}\n`));

    const child = spawn(gradlew, args, {
      cwd: platformDir,
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log('\n' + chalk.green('✓ Build successful!'));
        
        const apkDir = path.join(platformDir, 'app', 'build', 'outputs', 'apk');
        const variant = options.release ? 'release' : 'debug';
        console.log(chalk.cyan('\nAPK location:'));
        console.log(chalk.white(`  ${path.join(apkDir, variant)}`));
        
        resolve();
      } else {
        console.log('\n' + chalk.red(`✗ Build failed with code ${code}`));
        reject(new Error(`Build failed with code ${code}`));
      }
    });

    child.on('error', (error) => {
      console.log('\n' + chalk.red('✗ Build failed'));
      console.error(error);
      reject(error);
    });
  });
}

async function buildIOS(platformDir, options) {
  if (process.platform !== 'darwin') {
    console.log(chalk.yellow('⚠ iOS builds are only supported on macOS'));
    console.log(chalk.gray('  Please open the project in Xcode on a Mac to build.'));
    return;
  }

  const scheme = 'App';
  const configuration = options.release ? 'Release' : 'Debug';

  return new Promise((resolve, reject) => {
    const args = [
      '-workspace', 'App.xcworkspace',
      '-scheme', scheme,
      '-configuration', configuration,
      '-destination', 'generic/platform=iOS',
      'build'
    ];

    console.log(chalk.gray(`Running: xcodebuild ${args.join(' ')}\n`));

    const child = spawn('xcodebuild', args, {
      cwd: platformDir,
      stdio: 'inherit'
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log('\n' + chalk.green('✓ Build successful!'));
        resolve();
      } else {
        console.log('\n' + chalk.red(`✗ Build failed with code ${code}`));
        reject(new Error(`Build failed with code ${code}`));
      }
    });

    child.on('error', (error) => {
      console.log('\n' + chalk.red('✗ Build failed'));
      console.error(error);
      reject(error);
    });
  });
}

module.exports = buildCommand;
