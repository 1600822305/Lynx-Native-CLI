const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

const CONFIG_FILE = 'lynx.config.json';

async function doctorCommand() {
  console.log(chalk.cyan('Checking environment...\n'));

  const checks = [];
  
  // Node.js
  checks.push(checkCommand('Node.js', 'node --version', '>=16.0.0'));
  
  // npm
  checks.push(checkCommand('npm', 'npm --version'));
  
  // Java
  checks.push(checkCommand('Java', 'java -version', '>=11'));
  
  // Android SDK
  checks.push(checkEnvVar('ANDROID_HOME', 'Android SDK'));
  
  // ADB
  checks.push(checkCommand('ADB', 'adb --version'));
  
  // Gradle (optional)
  checks.push(checkCommand('Gradle', 'gradle --version', null, true));
  
  // Xcode (macOS only)
  if (process.platform === 'darwin') {
    checks.push(checkCommand('Xcode', 'xcodebuild -version'));
    checks.push(checkCommand('CocoaPods', 'pod --version'));
  }

  // Git
  checks.push(checkCommand('Git', 'git --version'));

  // Check Lynx project
  const configPath = path.join(process.cwd(), CONFIG_FILE);
  if (fs.existsSync(configPath)) {
    const config = await fs.readJson(configPath);
    
    console.log(chalk.cyan('\nProject Configuration:'));
    console.log(`  App Name: ${chalk.white(config.appName)}`);
    console.log(`  App ID: ${chalk.white(config.appId)}`);
    console.log(`  Platforms: ${chalk.white(Object.keys(config.platforms).join(', ') || 'None')}`);
    
    // Check bundle
    const bundlePath = path.join(process.cwd(), config.distDir, config.bundleName);
    if (fs.existsSync(bundlePath)) {
      const stats = fs.statSync(bundlePath);
      console.log(`  Bundle: ${chalk.green('✓')} ${config.bundleName} (${formatBytes(stats.size)})`);
    } else {
      console.log(`  Bundle: ${chalk.red('✗')} Not found - run "npm run build"`);
    }
  } else {
    console.log(chalk.yellow('\n⚠ No Lynx Native project found in current directory'));
    console.log(chalk.gray('  Run "lynx init" to initialize a project'));
  }

  // Summary
  const passed = checks.filter(c => c.status === 'pass').length;
  const failed = checks.filter(c => c.status === 'fail').length;
  const warnings = checks.filter(c => c.status === 'warn').length;

  console.log(chalk.cyan('\n─────────────────────────────'));
  console.log(`  ${chalk.green('✓')} ${passed} passed`);
  if (warnings > 0) console.log(`  ${chalk.yellow('⚠')} ${warnings} warnings`);
  if (failed > 0) console.log(`  ${chalk.red('✗')} ${failed} failed`);

  if (failed > 0) {
    console.log(chalk.red('\nSome checks failed. Please install missing dependencies.'));
  } else if (warnings > 0) {
    console.log(chalk.yellow('\nSome optional tools are missing.'));
  } else {
    console.log(chalk.green('\nAll checks passed! You\'re ready to build.'));
  }
}

function checkCommand(name, command, versionReq = null, optional = false) {
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    const version = output.match(/(\d+\.\d+(\.\d+)?)/)?.[1] || 'unknown';
    
    if (optional) {
      console.log(`  ${chalk.green('✓')} ${name}: ${chalk.white(version)}`);
    } else {
      console.log(`  ${chalk.green('✓')} ${name}: ${chalk.white(version)}`);
    }
    
    return { name, status: 'pass', version };
  } catch (error) {
    if (optional) {
      console.log(`  ${chalk.yellow('⚠')} ${name}: ${chalk.gray('not found (optional)')}`);
      return { name, status: 'warn' };
    } else {
      console.log(`  ${chalk.red('✗')} ${name}: ${chalk.gray('not found')}`);
      return { name, status: 'fail' };
    }
  }
}

function checkEnvVar(varName, displayName) {
  const value = process.env[varName];
  if (value && fs.existsSync(value)) {
    console.log(`  ${chalk.green('✓')} ${displayName}: ${chalk.white(value)}`);
    return { name: displayName, status: 'pass' };
  } else if (value) {
    console.log(`  ${chalk.yellow('⚠')} ${displayName}: ${chalk.gray('path does not exist')}`);
    return { name: displayName, status: 'warn' };
  } else {
    console.log(`  ${chalk.red('✗')} ${displayName}: ${chalk.gray('$' + varName + ' not set')}`);
    return { name: displayName, status: 'fail' };
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

module.exports = doctorCommand;
