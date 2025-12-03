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
  if (!fs.existsSync(platformDir)) {
    console.log(chalk.red(`✗ Platform directory not found: ${platformDir}`));
    return;
  }

  console.log(chalk.cyan(`\nBuilding ${platform}...`));
  console.log(chalk.gray(`Mode: ${options.release ? 'Release' : 'Debug'}`));
  if (options.arch) {
    console.log(chalk.gray(`Architecture: ${options.arch}`));
  }
  if (options.signed) {
    console.log(chalk.gray(`Signed: Yes`));
  }

  if (platform === 'android') {
    await buildAndroid(platformDir, options);
  } else if (platform === 'ios') {
    await buildIOS(platformDir, options);
  }
}

async function buildAndroid(platformDir, options) {
  const isWindows = process.platform === 'win32';
  const gradlew = isWindows ? 'gradlew.bat' : './gradlew';
  
  // 选择构建任务
  let task;
  if (options.signed) {
    if (!options.release) {
      console.log(chalk.yellow('ℹ Signed builds are typically Release builds, switching to Release mode'));
    }
    task = 'assembleRelease';
  } else {
    task = options.release ? 'assembleRelease' : 'assembleDebug';
  }
  
  if (options.arch && options.arch !== 'universal') {
    console.log(chalk.yellow(`ℹ Building all architectures, then you can find ${options.arch} specific APK in output`));
  }
  
  // 检查签名配置
  if (options.signed) {
    const hasKeystore = await checkKeystoreConfig(platformDir, options);
    if (!hasKeystore) {
      console.log(chalk.red('✗ Keystore configuration required for signed builds'));
      console.log(chalk.gray('  Configure signing in android/app/build.gradle.kts'));
      console.log(chalk.gray('  Or use: lynx keystore generate'));
      return;
    }
  }

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
        
        // 显示不同架构的 APK 信息
        if (fs.existsSync(path.join(apkDir, variant))) {
          try {
            const files = fs.readdirSync(path.join(apkDir, variant))
              .filter(file => file.endsWith('.apk'));
            
            if (files.length > 1) {
              console.log(chalk.cyan('\nAvailable APKs:'));
              files.forEach(file => {
                const filePath = path.join(apkDir, variant, file);
                const stats = fs.statSync(filePath);
                const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
                
                if (options.arch && file.includes(getArchInFileName(options.arch))) {
                  console.log(chalk.green(`  ✓ ${file} (${sizeMB}MB) ← ${options.arch}`));
                } else {
                  console.log(chalk.white(`    ${file} (${sizeMB}MB)`));
                }
              });
            }
          } catch (e) {
            // Ignore file reading errors
          }
        }
        
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

async function checkKeystoreConfig(platformDir, options) {
  try {
    const buildGradlePath = path.join(platformDir, 'app', 'build.gradle.kts');
    
    if (!fs.existsSync(buildGradlePath)) {
      return false;
    }

    const buildGradleContent = await fs.readFile(buildGradlePath, 'utf8');
    
    // 检查是否有签名配置
    const hasSigningConfigs = buildGradleContent.includes('signingConfigs');
    const hasKeystore = buildGradleContent.includes('keystore') || 
                       buildGradleContent.includes('storeFile');
    
    return hasSigningConfigs && hasKeystore;
  } catch (error) {
    return false;
  }
}

function getArchInFileName(arch) {
  const archMap = {
    'arm64': 'arm64-v8a',
    'arm32': 'armeabi-v7a',
    'x86': 'x86',
    'x86_64': 'x86_64',
    'universal': 'universal'
  };
  return archMap[arch.toLowerCase()] || arch;
}

module.exports = buildCommand;
