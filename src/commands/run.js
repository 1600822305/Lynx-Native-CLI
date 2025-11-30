const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const { spawn } = require('child_process');

const CONFIG_FILE = 'lynx.config.json';

async function runCommand(platform, options) {
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

  console.log(chalk.cyan(`\nRunning ${platform}...`));
  console.log(chalk.gray(`Mode: ${options.release ? 'Release' : 'Debug'}\n`));

  if (platform === 'android') {
    await runAndroid(platformDir, options);
  } else if (platform === 'ios') {
    await runIOS(platformDir, options);
  } else if (platform === 'web') {
    await runWeb(platformDir);
  }
}

async function runAndroid(platformDir, options) {
  console.log(chalk.cyan('Running Android app...'));
  
  // 导入 install 命令的逻辑
  const installCommand = require('./install');
  
  try {
    // 使用 install 命令安装并启动应用
    await installCommand('android', {
      ...options,
      launch: true // 确保启动应用
    });
    
    console.log(chalk.green('\n✓ App successfully installed and launched!'));
  } catch (error) {
    console.log(chalk.red('\n✗ Failed to run app'));
    throw error;
  }
}

async function runIOS(platformDir, options) {
  if (process.platform !== 'darwin') {
    console.log(chalk.yellow('⚠ iOS runs are only supported on macOS'));
    return;
  }

  return new Promise((resolve, reject) => {
    const args = [
      '-workspace', 'App.xcworkspace',
      '-scheme', 'App',
      '-configuration', options.release ? 'Release' : 'Debug',
      '-destination', 'platform=iOS Simulator,name=iPhone 15',
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
        // Launch in simulator
        spawn('xcrun', ['simctl', 'launch', 'booted', 'com.lynx.app'], { stdio: 'inherit' });
        resolve();
      } else {
        reject(new Error(`Build failed with code ${code}`));
      }
    });
  });
}

async function runWeb(platformDir) {
  return new Promise((resolve, reject) => {
    console.log(chalk.cyan('Starting development server...\n'));

    const child = spawn('npm', ['run', 'dev'], {
      cwd: platformDir,
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Server exited with code ${code}`));
      }
    });
  });
}

function getAndroidPackageName(platformDir) {
  try {
    const buildGradle = fs.readFileSync(path.join(platformDir, 'app', 'build.gradle.kts'), 'utf8');
    const match = buildGradle.match(/applicationId\s*=\s*"([^"]+)"/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

module.exports = runCommand;
