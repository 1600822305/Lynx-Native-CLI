const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { spawn } = require('child_process');

const CONFIG_FILE = 'lynx.config.json';

async function logsCommand(platform, options) {
  platform = platform.toLowerCase();

  if (!['android', 'ios'].includes(platform)) {
    console.log(chalk.red(`✗ Invalid platform: ${platform}`));
    console.log(chalk.gray('  Supported platforms: android, ios'));
    return;
  }

  // Load config to get app ID
  const configPath = path.join(process.cwd(), CONFIG_FILE);
  if (!fs.existsSync(configPath)) {
    console.log(chalk.red(`✗ ${CONFIG_FILE} not found.`));
    console.log(chalk.gray('  Run "lynx init" first.'));
    return;
  }

  const config = await fs.readJson(configPath);

  if (platform === 'android') {
    await showAndroidLogs(config, options);
  } else if (platform === 'ios') {
    await showIOSLogs(config, options);
  }
}

async function showAndroidLogs(config, options) {
  console.log(chalk.cyan(`Starting Android logs for ${config.appName}...`));
  console.log(chalk.gray('Press Ctrl+C to stop\n'));

  const args = ['logcat'];
  
  // 指定设备
  if (options.device) {
    args.unshift('-s', options.device);
  }

  // 过滤应用日志
  if (!options.all) {
    const packageName = config.appId;
    args.push('--pid=`pidof -s ${packageName}`');
  }

  // 设置日志级别
  const level = options.level || 'V';
  args.push(`*:${level}`);

  // 清除历史日志（如果需要）
  if (options.clear) {
    args.unshift('-c');
  }

  const child = spawn('adb', args, {
    stdio: 'inherit',
    shell: true
  });

  child.on('error', (error) => {
    if (error.code === 'ENOENT') {
      console.log(chalk.red('✗ ADB not found'));
      console.log(chalk.gray('  Make sure Android SDK is installed and ADB is in PATH'));
    } else {
      console.log(chalk.red('✗ Failed to start logs'));
      console.error(error);
    }
  });

  child.on('close', (code) => {
    console.log(chalk.gray('\nLogs stopped'));
  });

  // 处理 Ctrl+C
  process.on('SIGINT', () => {
    child.kill('SIGINT');
  });
}

async function showIOSLogs(config, options) {
  if (process.platform !== 'darwin') {
    console.log(chalk.yellow('⚠ iOS logs are only available on macOS'));
    return;
  }

  console.log(chalk.cyan(`Starting iOS logs for ${config.appName}...`));
  console.log(chalk.gray('Press Ctrl+C to stop\n'));

  const args = ['simctl', 'spawn'];
  
  // 指定设备或使用默认模拟器
  const deviceId = options.device || 'booted';
  args.push(deviceId, 'log', 'stream');

  // 过滤应用日志
  if (!options.all) {
    args.push('--predicate', `processImagePath contains "${config.appId}"`);
  }

  const child = spawn('xcrun', args, {
    stdio: 'inherit'
  });

  child.on('error', (error) => {
    if (error.code === 'ENOENT') {
      console.log(chalk.red('✗ Xcode command line tools not found'));
      console.log(chalk.gray('  Run: xcode-select --install'));
    } else {
      console.log(chalk.red('✗ Failed to start logs'));
      console.error(error);
    }
  });

  child.on('close', (code) => {
    console.log(chalk.gray('\nLogs stopped'));
  });

  // 处理 Ctrl+C
  process.on('SIGINT', () => {
    child.kill('SIGINT');
  });
}

module.exports = logsCommand;
