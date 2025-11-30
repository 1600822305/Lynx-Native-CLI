const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const { spawn, execSync } = require('child_process');

const CONFIG_FILE = 'lynx.config.json';

async function installCommand(platform, options) {
  platform = platform.toLowerCase();

  if (!['android'].includes(platform)) {
    console.log(chalk.red(`✗ Install currently only supports Android platform`));
    console.log(chalk.gray('  Supported platforms: android'));
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

  if (platform === 'android') {
    await installAndroid(config, options);
  }
}

async function installAndroid(config, options) {
  console.log(chalk.cyan(`\nInstalling ${config.appName} to Android device...`));

  // 检查设备
  const devices = await getConnectedDevices();
  if (devices.length === 0) {
    console.log(chalk.red('✗ No Android devices connected'));
    console.log(chalk.gray('  Connect a device and enable USB debugging'));
    return;
  }

  let targetDevice = null;
  if (options.device) {
    targetDevice = devices.find(d => d.id === options.device || d.id.includes(options.device));
    if (!targetDevice) {
      console.log(chalk.red(`✗ Device ${options.device} not found`));
      console.log(chalk.gray('Available devices:'));
      devices.forEach(d => console.log(chalk.gray(`  ${d.id} - ${d.name}`)));
      return;
    }
  } else {
    targetDevice = devices[0]; // 使用第一个设备
    if (devices.length > 1) {
      console.log(chalk.yellow(`ℹ Multiple devices found, using: ${targetDevice.name}`));
      console.log(chalk.gray('  Use --device <id> to specify device'));
    }
  }

  console.log(chalk.gray(`Target device: ${targetDevice.name} (${targetDevice.id})`));

  // 查找 APK 文件
  const apkDir = path.join(process.cwd(), 'android', 'app', 'build', 'outputs', 'apk');
  const buildType = options.release ? 'release' : 'debug';
  const apkPath = await findBestApk(apkDir, buildType, options.arch);

  if (!apkPath) {
    console.log(chalk.red('✗ No APK found'));
    console.log(chalk.gray(`  Run "lynx build android${options.release ? ' --release' : ''}" first`));
    return;
  }

  const apkName = path.basename(apkPath);
  const apkSize = (fs.statSync(apkPath).size / 1024 / 1024).toFixed(1);
  console.log(chalk.gray(`Installing: ${apkName} (${apkSize}MB)`));

  // 安装 APK
  const spinner = ora('Installing APK...').start();
  
  try {
    await installApk(apkPath, targetDevice.id, options);
    spinner.succeed(chalk.green('✓ Installation successful!'));
    
    // 尝试启动应用
    if (options.launch !== false) {
      console.log(chalk.gray('\nAttempting to launch app...'));
      await launchApp(config.appId, targetDevice.id);
    }
  } catch (error) {
    spinner.fail(chalk.red('✗ Installation failed'));
    console.error(chalk.red(error.message));
  }
}

async function getConnectedDevices() {
  try {
    const output = execSync('adb devices -l', { encoding: 'utf8', timeout: 5000 });
    const lines = output.split('\n').filter(line => line.trim() && !line.startsWith('List of devices'));
    
    return lines.map(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 2) return null;
      
      const id = parts[0];
      const status = parts[1];
      
      if (status !== 'device') return null;
      
      // 提取模型信息
      const modelMatch = line.match(/model:([^\s]+)/);
      let name = modelMatch ? modelMatch[1] : id;
      
      try {
        const modelName = execSync(`adb -s ${id} shell getprop ro.product.model`, { 
          encoding: 'utf8', 
          timeout: 3000 
        }).trim();
        if (modelName) name = modelName;
      } catch (e) {
        // 使用默认名称
      }

      return { id, name, status };
    }).filter(Boolean);
  } catch (error) {
    return [];
  }
}

async function findBestApk(apkDir, buildType, preferredArch) {
  const buildDir = path.join(apkDir, buildType);
  
  if (!fs.existsSync(buildDir)) {
    return null;
  }

  const apkFiles = fs.readdirSync(buildDir)
    .filter(file => file.endsWith('.apk'))
    .map(file => ({
      name: file,
      path: path.join(buildDir, file),
      size: fs.statSync(path.join(buildDir, file)).size
    }));

  if (apkFiles.length === 0) {
    return null;
  }

  // 如果指定了架构，优先选择对应的 APK
  if (preferredArch) {
    const archMap = {
      'arm64': 'arm64-v8a',
      'arm32': 'armeabi-v7a',
      'x86': 'x86',
      'x86_64': 'x86_64'
    };
    
    const archString = archMap[preferredArch.toLowerCase()];
    if (archString) {
      const archApk = apkFiles.find(apk => apk.name.includes(archString));
      if (archApk) {
        return archApk.path;
      }
    }
  }

  // 优先选择 ARM64，然后是 universal，最后是最小的文件
  const priorities = ['arm64-v8a', 'universal', 'armeabi-v7a'];
  
  for (const priority of priorities) {
    const matchedApk = apkFiles.find(apk => apk.name.includes(priority));
    if (matchedApk) {
      return matchedApk.path;
    }
  }

  // 返回最小的 APK
  apkFiles.sort((a, b) => a.size - b.size);
  return apkFiles[0].path;
}

async function installApk(apkPath, deviceId, options) {
  return new Promise((resolve, reject) => {
    const args = ['-s', deviceId, 'install'];
    
    if (options.force) {
      args.push('-r'); // 强制替换
    }
    
    args.push(apkPath);

    const child = spawn('adb', args, {
      stdio: 'pipe'
    });

    let output = '';
    let error = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      error += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0 && output.includes('Success')) {
        resolve();
      } else {
        reject(new Error(error || output || 'Installation failed'));
      }
    });

    child.on('error', (err) => {
      reject(new Error(`ADB not found: ${err.message}`));
    });
  });
}

async function launchApp(packageName, deviceId) {
  try {
    execSync(`adb -s ${deviceId} shell monkey -p ${packageName} 1`, {
      stdio: 'pipe',
      timeout: 5000
    });
    console.log(chalk.green('✓ App launched successfully'));
  } catch (error) {
    console.log(chalk.yellow('⚠ Could not launch app automatically'));
    console.log(chalk.gray(`  Launch manually or check if app is already running`));
  }
}

module.exports = installCommand;
