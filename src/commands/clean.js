const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const { spawn } = require('child_process');

const CONFIG_FILE = 'lynx.config.json';

async function cleanCommand(options) {
  console.log(chalk.cyan('Cleaning project...\n'));

  // Load config
  const configPath = path.join(process.cwd(), CONFIG_FILE);
  if (!fs.existsSync(configPath)) {
    console.log(chalk.red(`✗ ${CONFIG_FILE} not found.`));
    console.log(chalk.gray('  Run "lynx init" first.'));
    return;
  }

  const config = await fs.readJson(configPath);
  let cleaned = [];
  let errors = [];

  // 清理 Lynx build 输出
  if (!options.native) {
    await cleanLynxOutput(config, cleaned, errors);
  }

  // 清理 Android
  if (config.platforms.android && !options.ios) {
    await cleanAndroid(cleaned, errors);
  }

  // 清理 iOS
  if (config.platforms.ios && !options.android) {
    await cleanIOS(cleaned, errors);
  }

  // 清理 Web
  if (config.platforms.web && !options.native) {
    await cleanWeb(cleaned, errors);
  }

  // 清理 node_modules (如果指定)
  if (options.all) {
    await cleanNodeModules(cleaned, errors);
  }

  // 显示结果
  console.log(chalk.green('\n✓ Clean completed!'));
  
  if (cleaned.length > 0) {
    console.log(chalk.cyan('\nCleaned:'));
    cleaned.forEach(item => {
      console.log(chalk.white(`  ✓ ${item}`));
    });
  }

  if (errors.length > 0) {
    console.log(chalk.yellow('\nWarnings:'));
    errors.forEach(error => {
      console.log(chalk.yellow(`  ⚠ ${error}`));
    });
  }

  const totalSize = cleaned.length > 0 ? 'Unknown size' : '0 MB';
  console.log(chalk.gray(`\nFreed up space: ${totalSize}`));
}

async function cleanLynxOutput(config, cleaned, errors) {
  const distDir = path.join(process.cwd(), config.distDir || 'dist');
  
  if (fs.existsSync(distDir)) {
    try {
      await fs.remove(distDir);
      cleaned.push(`Lynx build output (${config.distDir || 'dist'})`);
    } catch (error) {
      errors.push(`Failed to clean ${distDir}: ${error.message}`);
    }
  }
}

async function cleanAndroid(cleaned, errors) {
  const androidDir = path.join(process.cwd(), 'android');
  
  if (!fs.existsSync(androidDir)) {
    return;
  }

  // 清理 Gradle 缓存
  const buildDir = path.join(androidDir, 'build');
  const appBuildDir = path.join(androidDir, 'app', 'build');
  
  const dirsToClean = [buildDir, appBuildDir];
  
  for (const dir of dirsToClean) {
    if (fs.existsSync(dir)) {
      try {
        await fs.remove(dir);
        cleaned.push(`Android build cache (${path.relative(process.cwd(), dir)})`);
      } catch (error) {
        errors.push(`Failed to clean ${dir}: ${error.message}`);
      }
    }
  }

  // 执行 Gradle clean
  try {
    const isWindows = process.platform === 'win32';
    const gradlew = isWindows ? 'gradlew.bat' : './gradlew';
    
    await new Promise((resolve, reject) => {
      const child = spawn(gradlew, ['clean'], {
        cwd: androidDir,
        stdio: 'pipe',
        shell: true
      });

      child.on('close', (code) => {
        if (code === 0) {
          cleaned.push('Gradle clean');
          resolve();
        } else {
          errors.push('Gradle clean failed');
          resolve(); // 继续清理其他内容
        }
      });

      child.on('error', () => {
        errors.push('Gradle not available');
        resolve();
      });
    });
  } catch (error) {
    errors.push(`Gradle clean error: ${error.message}`);
  }
}

async function cleanIOS(cleaned, errors) {
  const iosDir = path.join(process.cwd(), 'ios');
  
  if (!fs.existsSync(iosDir)) {
    return;
  }

  // 清理 Xcode build 产物
  const buildDirs = [
    path.join(iosDir, 'build'),
    path.join(iosDir, 'DerivedData')
  ];

  for (const dir of buildDirs) {
    if (fs.existsSync(dir)) {
      try {
        await fs.remove(dir);
        cleaned.push(`iOS build cache (${path.relative(process.cwd(), dir)})`);
      } catch (error) {
        errors.push(`Failed to clean ${dir}: ${error.message}`);
      }
    }
  }

  // 清理 CocoaPods 缓存
  const podsCacheDir = path.join(iosDir, 'Pods');
  if (fs.existsSync(podsCacheDir)) {
    try {
      await fs.remove(podsCacheDir);
      cleaned.push('CocoaPods cache');
    } catch (error) {
      errors.push(`Failed to clean CocoaPods cache: ${error.message}`);
    }
  }
}

async function cleanWeb(cleaned, errors) {
  const webDir = path.join(process.cwd(), 'web');
  
  if (!fs.existsSync(webDir)) {
    return;
  }

  const dirsToClean = [
    path.join(webDir, 'dist'),
    path.join(webDir, 'build'),
    path.join(webDir, '.next'),
    path.join(webDir, 'node_modules/.cache')
  ];

  for (const dir of dirsToClean) {
    if (fs.existsSync(dir)) {
      try {
        await fs.remove(dir);
        cleaned.push(`Web build cache (${path.relative(process.cwd(), dir)})`);
      } catch (error) {
        errors.push(`Failed to clean ${dir}: ${error.message}`);
      }
    }
  }
}

async function cleanNodeModules(cleaned, errors) {
  const nodeModulesDirs = [
    path.join(process.cwd(), 'node_modules'),
    path.join(process.cwd(), 'android', 'node_modules'),
    path.join(process.cwd(), 'ios', 'node_modules'),
    path.join(process.cwd(), 'web', 'node_modules')
  ];

  for (const dir of nodeModulesDirs) {
    if (fs.existsSync(dir)) {
      try {
        await fs.remove(dir);
        cleaned.push(`Dependencies (${path.relative(process.cwd(), dir)})`);
      } catch (error) {
        errors.push(`Failed to clean ${dir}: ${error.message}`);
      }
    }
  }
}

module.exports = cleanCommand;
