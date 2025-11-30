# 🚀 Lynx Native CLI

> 一键生成 Android、iOS、Web 原生项目的 Lynx CLI 工具
> 
> Generate native Android/iOS/Web projects for Lynx apps with one command

像 Capacitor 一样简单的 Lynx 跨平台开发工具！

## 📦 安装

```bash
npm install -g lynx-cli
```

或者直接使用 npx：
```bash
npx lynx-cli init
```

## ✨ 特性

- 🎯 **一键生成**：`lynx add android` 生成完整的 Android 项目
- 📱 **多平台支持**：Android、iOS、Web
- 🔄 **自动同步**：Bundle 文件自动同步到原生项目
- 🛠 **IDE 集成**：一键打开 Android Studio / Xcode
- 🏥 **环境检测**：`doctor` 命令检查开发环境
- 📦 **生产就绪**：完整的构建和发布流程

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
lynx build android          # 构建 Debug APK
lynx build android --release # 构建 Release APK
lynx build ios              # 构建 iOS
lynx build web              # 构建 Web

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

### 1. 热更新开发

```bash
# 终端 1：启动 Lynx 开发服务器
npm run dev

# 终端 2：Web 预览
lynx-native run web

# 修改代码后自动同步
lynx-native sync
```

### 2. 多平台构建

```bash
# 一次性构建所有平台
npm run build
lynx-native sync
lynx-native build android --release
lynx-native build ios --release
```

### 3. 调试

```bash
# 检查环境
lynx-native doctor

# 查看详细日志
lynx-native build android --verbose
```

## 🤝 贡献

欢迎提交 Issue 和 PR！

## 📄 协议

MIT License

---

**让 Lynx 开发像 Capacitor 一样简单！**
