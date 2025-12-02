# 🚀 Lynx Native CLI

**🌐 Language / 语言**: [中文](#) | [English](./README.en.md)

> 一键生成 Android、iOS、Web 原生项目的 Lynx CLI 工具
> 
> Generate native Android/iOS/Web projects for Lynx apps with one command

像 Capacitor 一样简单的 Lynx 跨平台开发工具！

## 📦 安装

```bash
npm install -g lynx-native-cli
```

或者直接使用 npx：
```bash
npx lynx-native-cli init
```

> ⚠️ **注意**: 请确保安装的是 `lynx-native-cli` 而不是 `lynx-cli`（这是另一个不同的包）

## ✨ 特性

- 🎯 **一键生成**：`lynx add android` 生成完整的 Android 项目
- 📱 **多平台支持**：Android、iOS、Web
- 🔄 **自动同步**：Bundle 文件自动同步到原生项目
- 🛠 **IDE 集成**：一键打开 Android Studio / Xcode
- 🏥 **环境检测**：`doctor` 命令检查开发环境
- 📦 **生产就绪**：完整的构建和发布流程
- 📱 **设备管理**：`devices` 命令列出连接设备
- 📋 **实时日志**：`logs` 命令查看应用日志
- 🧹 **智能清理**：`clean` 命令清理构建缓存
- 🔐 **签名构建**：支持 APK 签名发布
- 🎯 **架构选择**：支持 ARM64/ARM32/x86 单独构建

## 🚀 快速开始

### 1. 在 Lynx 项目中初始化

```bash
cd your-lynx-project
lynx init
```

### 2. 添加原生平台

```bash
# Android
lynx add android

# iOS (需要 macOS)
lynx add ios

# Web
lynx add web
```

### 3. 构建 Lynx 应用

```bash
npm run build
```

### 4. 同步到原生项目

```bash
lynx sync
```

### 5. 构建原生应用

```bash
# Android APK
lynx build android

# iOS (需要 macOS)
lynx build ios

# Web 开发服务器
lynx run web
```

## 📋 命令参考

### 初始化

```bash
lynx init                    # 创建配置文件
```

### 平台管理

```bash
lynx add android             # 添加 Android 项目
lynx add ios                 # 添加 iOS 项目  
lynx add web                 # 添加 Web 项目
```

### 开发工作流

```bash
lynx sync                    # 同步 bundle 到所有平台
lynx sync --platform android # 同步到指定平台
```

### 构建和运行

```bash
# 基本构建
lynx build android          # 构建 Debug APK
lynx build android --release # 构建 Release APK
lynx build ios              # 构建 iOS
lynx build web              # 构建 Web

# 架构特定构建
lynx build android --arch arm64    # 只构建 ARM64 架构
lynx build android --arch arm32    # 只构建 ARM32 架构
lynx build android --arch x86      # 只构建 x86 架构
lynx build android --arch universal # 通用 APK

# 签名构建
lynx build android --signed --release # 构建签名 APK

# 运行应用
lynx run android            # 安装并运行到设备
lynx run ios                # 运行到 iOS 模拟器
lynx run web                # 启动 Web 开发服务器
```

### IDE 集成

```bash
lynx open android           # 在 Android Studio 中打开
lynx open ios               # 在 Xcode 中打开
lynx open web               # 在 VS Code 中打开
```

### 环境检查

```bash
lynx doctor                 # 检查开发环境
```

### 设备管理

```bash
lynx devices                # 列出所有连接的设备
lynx devices --android      # 只显示 Android 设备
lynx devices --ios          # 只显示 iOS 设备
```

### 日志查看

```bash
lynx logs android           # 查看 Android 应用日志
lynx logs android --device <id>  # 指定设备
lynx logs android --level W # 设置日志级别 (V/D/I/W/E)
lynx logs android --clear   # 清空历史日志
lynx logs android --all     # 显示所有日志（不过滤应用）
```

### 项目清理

```bash
lynx clean                  # 清理所有构建缓存
lynx clean --all            # 包括 node_modules
lynx clean --android        # 只清理 Android 缓存
lynx clean --ios            # 只清理 iOS 缓存
lynx clean --native         # 只清理原生平台缓存
```

## 📁 项目结构

运行 `lynx add` 后，你的项目会变成：

```
my-lynx-project/
├── src/                          # 你的 Lynx 源码
├── dist/                         # 构建输出
│   └── main.lynx.bundle
├── android/                      # Android 项目
│   ├── app/
│   │   └── src/main/assets/
│   │       └── main.lynx.bundle
│   └── build.gradle.kts
├── ios/                          # iOS 项目
│   ├── App/
│   │   ├── Sources/
│   │   └── Assets/
│   │       └── main.lynx.bundle
│   └── Podfile
├── web/                          # Web 项目
│   ├── src/
│   ├── public/assets/
│   │   └── main.lynx.bundle
│   └── package.json
└── lynx.config.json              # CLI 配置
```

## ⚙️ 环境要求

### Android
- **Node.js** >= 16
- **JDK** 11+
- **Android SDK**
- **Android Studio** (推荐)

### iOS (仅 macOS)
- **Xcode** 14+
- **CocoaPods**

### Web
- **Node.js** >= 16

运行 `lynx doctor` 检查你的环境。

## 🔧 配置

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

## 📱 Android 开发

### 构建 APK

```bash
# Debug APK
lynx-native build android

# Release APK  
lynx-native build android --release
```

APK 输出位置：`android/app/build/outputs/apk/`

### 在设备上运行

```bash
lynx-native run android
```

## 🍎 iOS 开发

### 安装依赖

```bash
cd ios
pod install
```

### 构建和运行

```bash
lynx-native build ios
lynx-native run ios    # 在模拟器中运行
```

## 🌐 Web 开发

### 安装依赖

```bash
cd web
npm install
```

### 开发服务器

```bash
lynx-native run web
```

访问：http://localhost:3000

## 🆚 对比

| 功能 | Lynx 官方 | Lynx Native CLI |
|------|----------|----------------|
| 生成原生项目 | ❌ 手动集成 | ✅ 一键生成 |
| 多平台支持 | ✅ | ✅ |
| 构建流程 | 🔧 复杂 | 🚀 简单 |
| IDE 集成 | ❌ | ✅ |
| 环境检测 | ❌ | ✅ |

## 💡 开发技巧

### 1. 完整开发工作流

```bash
# 1. 项目初始化
lynx init

# 2. 添加平台
lynx add android
lynx add ios

# 3. 开发调试
npm run dev                    # 启动 Lynx 开发服务器
lynx devices                   # 查看连接的设备
lynx sync                      # 同步 bundle
lynx run android               # 运行到设备
lynx logs android              # 查看实时日志

# 4. 构建发布
npm run build                  # 构建 Lynx 应用
lynx sync                      # 同步到原生项目
lynx build android --arch arm64 --signed  # 构建签名 APK
```

### 2. 调试技巧

```bash
# 环境检查
lynx doctor

# 设备管理
lynx devices --android         # 只看 Android 设备
lynx logs android --level E    # 只看错误日志
lynx logs android --device xxx # 指定设备日志

# 项目维护
lynx clean                     # 清理构建缓存
lynx clean --all              # 完全清理（包括依赖）
```

### 3. 构建优化

```bash
# 小体积 APK（推荐）
lynx build android --arch arm64

# 兼容性 APK
lynx build android --arch universal

# 发布版本
lynx build android --signed --release --arch arm64
```

## 🤝 贡献

欢迎提交 Issue 和 PR！

## 📄 协议

MIT License

---

**让 Lynx 开发像 Capacitor 一样简单！**
