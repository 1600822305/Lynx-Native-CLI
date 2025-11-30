const chalk = require('chalk');
const ora = require('ora');
const { spawn, execSync } = require('child_process');

async function devicesCommand(options) {
  console.log(chalk.cyan('Checking connected devices...\n'));

  const devices = [];

  // 检查 Android 设备
  if (!options.ios) {
    const androidDevices = await getAndroidDevices();
    devices.push(...androidDevices);
  }

  // 检查 iOS 设备 (仅在 macOS 上)
  if (!options.android && process.platform === 'darwin') {
    const iosDevices = await getIOSDevices();
    devices.push(...iosDevices);
  }

  // 显示结果
  if (devices.length === 0) {
    console.log(chalk.yellow('⚠ No devices found'));
    console.log(chalk.gray('  Make sure devices are connected and debugging is enabled'));
    return;
  }

  console.log(chalk.green(`Found ${devices.length} device(s):\n`));
  
  devices.forEach((device, index) => {
    const icon = device.platform === 'android' ? '🤖' : '🍎';
    const status = device.status === 'device' ? chalk.green('online') : chalk.yellow(device.status);
    
    console.log(`${icon} ${chalk.white(device.name)}`);
    console.log(chalk.gray(`   ID: ${device.id}`));
    console.log(chalk.gray(`   Platform: ${device.platform}`));
    console.log(chalk.gray(`   Status: ${status}`));
    if (device.model) {
      console.log(chalk.gray(`   Model: ${device.model}`));
    }
    console.log('');
  });

  console.log(chalk.cyan('Usage:'));
  console.log(chalk.white('  lynx run android --device <device-id>'));
  console.log(chalk.white('  lynx logs android --device <device-id>'));
}

async function getAndroidDevices() {
  try {
    const output = execSync('adb devices -l', { encoding: 'utf8', timeout: 5000 });
    const lines = output.split('\n').filter(line => line.trim() && !line.startsWith('List of devices'));
    
    return lines.map(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 2) return null;
      
      const id = parts[0];
      const status = parts[1];
      
      // 提取模型信息
      const modelMatch = line.match(/model:([^\s]+)/);
      const model = modelMatch ? modelMatch[1] : '';
      
      // 生成友好的设备名称
      let name = model || id;
      if (status === 'device') {
        try {
          const modelName = execSync(`adb -s ${id} shell getprop ro.product.model`, { encoding: 'utf8', timeout: 3000 }).trim();
          if (modelName) name = modelName;
        } catch (e) {
          // 忽略错误，使用默认名称
        }
      }

      return {
        id,
        name,
        platform: 'android',
        status,
        model
      };
    }).filter(Boolean);
  } catch (error) {
    console.log(chalk.yellow('⚠ ADB not found or no Android devices connected'));
    return [];
  }
}

async function getIOSDevices() {
  try {
    const output = execSync('xcrun simctl list devices --json', { encoding: 'utf8', timeout: 5000 });
    const data = JSON.parse(output);
    const devices = [];
    
    Object.keys(data.devices).forEach(runtime => {
      if (runtime.includes('iOS')) {
        data.devices[runtime].forEach(device => {
          if (device.state === 'Booted' || device.state === 'Shutdown') {
            devices.push({
              id: device.udid,
              name: device.name,
              platform: 'ios',
              status: device.state.toLowerCase(),
              model: runtime
            });
          }
        });
      }
    });
    
    return devices;
  } catch (error) {
    // iOS 模拟器不可用（非 macOS 或未安装 Xcode）
    return [];
  }
}

module.exports = devicesCommand;
