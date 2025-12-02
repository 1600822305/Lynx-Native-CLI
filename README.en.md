# 🚀 Lynx Native CLI

> Generate native Android/iOS/Web projects for Lynx apps with one command
>
> Like Capacitor, but for Lynx!

## 📦 Installation

```bash
npm install -g lynx-native-cli
```

Or use npx directly:
```bash
npx lynx-native-cli init
```

> ⚠️ **Important**: Make sure to install `lynx-native-cli`, NOT `lynx-cli` (which is a different package)

## ✨ Features

- 🎯 **One-click Generation**: `lynx add android` generates a complete Android project
- 📱 **Multi-platform Support**: Android, iOS, Web
- 🔄 **Auto Sync**: Bundle files automatically sync to native projects
- 🛠 **IDE Integration**: One-click open Android Studio / Xcode
- 🏥 **Environment Check**: `doctor` command checks your dev environment
- 📦 **Production Ready**: Complete build and release workflow
- 📱 **Device Management**: `devices` command lists connected devices
- 📋 **Real-time Logs**: `logs` command shows application logs
- 🧹 **Smart Cleanup**: `clean` command clears build caches
- 🔐 **Signed Builds**: Support for APK signing
- 🎯 **Architecture Selection**: Support ARM64/ARM32/x86 specific builds

## 🚀 Quick Start

### 1. Initialize in your Lynx project

```bash
cd your-lynx-project
lynx init
```

### 2. Add native platforms

```bash
# Android
lynx add android

# iOS (requires macOS)
lynx add ios

# Web
lynx add web
```

### 3. Build your Lynx app

```bash
npm run build
```

### 4. Sync to native projects

```bash
lynx sync
```

### 5. Build native apps

```bash
# Android APK
lynx build android

# iOS (requires macOS)
lynx build ios

# Web dev server
lynx run web
```

## 📋 Command Reference

### Initialization

```bash
lynx init                    # Create configuration file
```

### Platform Management

```bash
lynx add android             # Add Android project
lynx add ios                 # Add iOS project  
lynx add web                 # Add Web project
```

### Development Workflow

```bash
lynx sync                    # Sync bundle to all platforms
lynx sync --platform android # Sync to specific platform
```

### Build and Run

```bash
# Basic build
lynx build android          # Build Debug APK
lynx build android --release # Build Release APK
lynx build ios              # Build iOS
lynx build web              # Build Web

# Architecture-specific builds
lynx build android --arch arm64    # ARM64 only
lynx build android --arch arm32    # ARM32 only
lynx build android --arch x86      # x86 only
lynx build android --arch universal # Universal APK

# Signed builds
lynx build android --signed --release # Build signed APK

# Run apps
lynx run android            # Install and run on device
lynx run ios                # Run on iOS simulator
lynx run web                # Start Web dev server
```

### IDE Integration

```bash
lynx open android           # Open in Android Studio
lynx open ios               # Open in Xcode
lynx open web               # Open in VS Code
```

### Environment Check

```bash
lynx doctor                 # Check development environment
```

### Device Management

```bash
lynx devices                # List all connected devices
lynx devices --android      # Show only Android devices
lynx devices --ios          # Show only iOS devices
```

### Log Viewing

```bash
lynx logs android           # View Android app logs
lynx logs android --device <id>  # Specific device
lynx logs android --level W # Set log level (V/D/I/W/E)
lynx logs android --clear   # Clear log history
lynx logs android --all     # Show all logs (unfiltered)
```

### Project Cleanup

```bash
lynx clean                  # Clean all build caches
lynx clean --all            # Including node_modules
lynx clean --android        # Clean Android cache only
lynx clean --ios            # Clean iOS cache only
lynx clean --native         # Clean native platforms only
```

## 📁 Project Structure

After running `lynx add`, your project will look like:

```
my-lynx-project/
├── src/                          # Your Lynx source code
├── dist/                         # Build output
│   └── main.lynx.bundle
├── android/                      # Android project
│   ├── app/
│   │   └── src/main/assets/
│   │       └── main.lynx.bundle
│   └── build.gradle.kts
├── ios/                          # iOS project
│   ├── App/
│   │   ├── Sources/
│   │   └── Assets/
│   │       └── main.lynx.bundle
│   └── Podfile
├── web/                          # Web project
│   ├── src/
│   ├── public/assets/
│   │   └── main.lynx.bundle
│   └── package.json
└── lynx.config.json              # CLI configuration
```

## ⚙️ Requirements

### Android
- **Node.js** >= 16
- **JDK** 11+
- **Android SDK**
- **Android Studio** (recommended)

### iOS (macOS only)
- **Xcode** 14+
- **CocoaPods**

### Web
- **Node.js** >= 16

Run `lynx doctor` to check your environment.

## 🔧 Configuration

### lynx.config.json

```json
{
  "appName": "My App",
  "appId": "com.example.app", 
  "distDir": "dist",
  "bundleName": "main.lynx.bundle",
  "platforms": {
    "android": {
      "path": "android"
    },
    "ios": {
      "path": "ios"
    },
    "web": {
      "path": "web"
    }
  }
}
```

## 📱 Android Development

### Build APK

```bash
# Debug APK
lynx build android

# Release APK  
lynx build android --release
```

APK output location: `android/app/build/outputs/apk/`

### Run on Device

```bash
lynx run android
```

## 🍎 iOS Development

### Install Dependencies

```bash
cd ios
pod install
```

### Build and Run

```bash
lynx build ios
lynx run ios    # Run in simulator
```

## 🌐 Web Development

### Install Dependencies

```bash
cd web
npm install
```

### Development Server

```bash
lynx run web
```

Visit: http://localhost:3000

## 🆚 Comparison

| Feature | Lynx Official | Lynx Native CLI |
|---------|--------------|-----------------|
| Generate native projects | ❌ Manual integration | ✅ One-click |
| Multi-platform support | ✅ | ✅ |
| Build workflow | 🔧 Complex | 🚀 Simple |
| IDE integration | ❌ | ✅ |
| Environment check | ❌ | ✅ |

## 💡 Development Tips

### 1. Complete Development Workflow

```bash
# 1. Project initialization
lynx init

# 2. Add platforms
lynx add android
lynx add ios

# 3. Development & debugging
npm run dev                    # Start Lynx dev server
lynx devices                   # View connected devices
lynx sync                      # Sync bundle
lynx run android               # Run on device
lynx logs android              # View real-time logs

# 4. Build for release
npm run build                  # Build Lynx app
lynx sync                      # Sync to native projects
lynx build android --arch arm64 --signed  # Build signed APK
```

### 2. Debugging Tips

```bash
# Environment check
lynx doctor

# Device management
lynx devices --android         # Android devices only
lynx logs android --level E    # Error logs only
lynx logs android --device xxx # Specific device logs

# Project maintenance
lynx clean                     # Clean build cache
lynx clean --all              # Full clean (including deps)
```

### 3. Build Optimization

```bash
# Small APK (recommended)
lynx build android --arch arm64

# Compatibility APK
lynx build android --arch universal

# Release version
lynx build android --signed --release --arch arm64
```

## 🤝 Contributing

Issues and PRs are welcome!

## 📄 License

MIT License

---

**Make Lynx development as simple as Capacitor!**
