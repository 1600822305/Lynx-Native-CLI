const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { spawn } = require('child_process');

const CONFIG_FILE = 'lynx.config.json';

async function openCommand(platform) {
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

  if (!config.platforms[platform]) {
    console.log(chalk.red(`✗ Platform ${platform} not added.`));
    console.log(chalk.gray(`  Run "lynx add ${platform}" first.`));
    return;
  }

  const platformDir = path.join(process.cwd(), platform);
  const isWindows = process.platform === 'win32';
  const isMac = process.platform === 'darwin';

  console.log(chalk.cyan(`Opening ${platform} project...\n`));

  try {
    if (platform === 'android') {
      // Try to open with Android Studio
      if (isWindows) {
        // Common Android Studio paths on Windows
        const studioPath = findAndroidStudio();
        if (studioPath) {
          spawn(studioPath, [platformDir], { detached: true, stdio: 'ignore' }).unref();
          console.log(chalk.green('✓ Opening in Android Studio...'));
        } else {
          // Fallback: open folder
          spawn('explorer', [platformDir], { detached: true, stdio: 'ignore' }).unref();
          console.log(chalk.yellow('⚠ Android Studio not found. Opening folder...'));
          console.log(chalk.gray('  Please open the project manually in Android Studio.'));
        }
      } else if (isMac) {
        spawn('open', ['-a', 'Android Studio', platformDir], { detached: true, stdio: 'ignore' }).unref();
        console.log(chalk.green('✓ Opening in Android Studio...'));
      } else {
        spawn('studio', [platformDir], { detached: true, stdio: 'ignore' }).unref();
        console.log(chalk.green('✓ Opening in Android Studio...'));
      }
    } else if (platform === 'ios') {
      if (!isMac) {
        console.log(chalk.yellow('⚠ iOS development requires macOS'));
        console.log(chalk.gray('  Please transfer the project to a Mac.'));
        return;
      }
      
      const xcworkspace = path.join(platformDir, 'App.xcworkspace');
      const xcodeproj = path.join(platformDir, 'App.xcodeproj');
      
      if (fs.existsSync(xcworkspace)) {
        spawn('open', [xcworkspace], { detached: true, stdio: 'ignore' }).unref();
      } else if (fs.existsSync(xcodeproj)) {
        spawn('open', [xcodeproj], { detached: true, stdio: 'ignore' }).unref();
      } else {
        spawn('open', [platformDir], { detached: true, stdio: 'ignore' }).unref();
      }
      console.log(chalk.green('✓ Opening in Xcode...'));
    } else if (platform === 'web') {
      // Open in VS Code
      if (isWindows) {
        spawn('code', [platformDir], { shell: true, detached: true, stdio: 'ignore' }).unref();
      } else {
        spawn('code', [platformDir], { detached: true, stdio: 'ignore' }).unref();
      }
      console.log(chalk.green('✓ Opening in VS Code...'));
    }
  } catch (error) {
    console.log(chalk.red(`✗ Failed to open ${platform} project`));
    console.error(error);
  }
}

function findAndroidStudio() {
  const possiblePaths = [
    process.env.ANDROID_STUDIO_PATH,
    'C:\\Program Files\\Android\\Android Studio\\bin\\studio64.exe',
    'C:\\Program Files (x86)\\Android\\Android Studio\\bin\\studio.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Programs\\Android Studio\\bin\\studio64.exe'),
  ].filter(Boolean);

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

module.exports = openCommand;
