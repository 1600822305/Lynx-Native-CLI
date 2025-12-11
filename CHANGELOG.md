# Changelog

All notable changes to this project will be documented in this file.

## [1.4.2] - 2025-12-12

### Added
- 🖥️ Edge-to-edge fullscreen mode support with toggle switch in MainActivity
  - `enableEdgeToEdge = true` to enable immersive mode
  - Compatible with Android 10+ (API 29+)
  - Transparent status bar and navigation bar

### Fixed
- 🐛 Fixed edge-to-edge crash: `setupEdgeToEdge()` must be called after `setContentView()`

## [1.4.1] - 2025-12-12

### Fixed
- 🔧 Fixed Android template LynxEnvBuilder compilation error
  - Replaced deprecated `LynxEnvBuilder` with official `LynxEnv.inst().init()` API
  - Added proper Lynx Service initialization (Fresco, LynxImageService, LynxLogService, LynxHttpService)
  - Removed unused `LocalMediaFetcher` class

## [1.4.0] - 2025-12-12

### Added
- 🎉 HarmonyOS (鸿蒙) platform support (#4)
  - Added official Lynx HarmonyOS template from lynx-family/lynx repository
  - `lynx add harmony` command to generate HarmonyOS project
  - `lynx sync` now supports syncing bundle to HarmonyOS rawfile directory

### Fixed
- 🖼️ Fixed issue where images/logo not showing in official rspeedy examples (#5)
  - Improved `sync` command to copy all resource files from dist directory (not just static folder)

## [1.0.0] - 2025-11-30

### Added
- 🎉 Initial release of Lynx Native CLI
- ✨ `init` command to initialize Lynx Native configuration
- 📱 `add` command to generate Android, iOS, and Web projects
- 🔄 `sync` command to synchronize bundles to native projects
- 🔨 `build` command to build native applications
- 🚀 `run` command to run apps on devices/emulators
- 💻 `open` command to open projects in IDEs
- 🏥 `doctor` command to check development environment
- 📦 Complete Android project template with Kotlin
- 🍎 Complete iOS project template with Swift
- 🌐 Complete Web project template with React
- 📚 Comprehensive documentation and README

### Features
- One-command project generation (like Capacitor)
- Multi-platform support (Android/iOS/Web)
- Automatic bundle synchronization
- IDE integration (Android Studio/Xcode/VS Code)
- Environment health checks
- Production-ready templates
- TypeScript support
- Modern tooling integration
