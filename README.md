# 🎨 Design System Sync

A powerful Figma plugin that automatically exports design tokens (strings, colors & typography) to GitHub repositories with support for Android, iOS, Flutter, and Kotlin Multiplatform projects.

![Version](https://img.shields.io/badge/version-3.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platforms](https://img.shields.io/badge/platforms-Android%20%7C%20iOS%20%7C%20Flutter-orange)

## ✨ Features

### 🌐 Localization (Strings)
- 📱 **Multi-Platform Support**: Export to Android XML, iOS Localizable.strings, and Flutter ARB
- 🌍 **30+ Languages**: Built-in support for major world languages
- 🔄 **Multi-Mode Variables**: Export all language modes in one click

### 🎨 Design Tokens (Colors)
- 🤖 **Android**: XML `colors.xml` + Jetpack Compose `Color.kt`
- 🍎 **iOS**: UIKit/SwiftUI color extensions with hex initializers
- 🦋 **Flutter**: Dart color constants with `Color.fromARGB()`
- 🎯 **Full RGBA Support**: Alpha channel with hex conversion

### ✍️ Typography (Font Styles) - NEW in v3.0!
- 🤖 **Android Compose**: `Typography.kt` with TextStyle definitions
- 🍎 **iOS**: UIFont/SwiftUI Font extensions
- 🦋 **Flutter**: `TextStyle` constants with font weights and sizes
- 📐 **Comprehensive**: Includes fontSize, fontWeight, letterSpacing, lineHeight

### 🚀 Automation
- 🔄 **Automated PR Creation**: Creates pull requests automatically
- 💾 **Settings Persistence**: Save your configuration for quick exports
- ⚙️ **Highly Configurable**: Customize paths, branches, PR templates
- 🔐 **Secure**: Uses GitHub Personal Access Tokens

## 📦 Installation

### Option 1: Install from Figma Community
Search for "Design System Sync" in the Figma Community plugins.

**Direct Link:** [Design System Sync on Figma Community](https://www.figma.com/community/plugin/1595034045326188787/design-system-sync)

### Option 2: Manual Installation (Development)

1. Clone this repository:
```bash
git clone https://github.com/ZeyadAbdullah679/design-system-sync.git
cd design-system-sync
```

2. Install dependencies:
```bash
npm install
```

3. Build the plugin:
```bash
npm run build
```

4. Import to Figma:
   - Open Figma Desktop
   - Go to `Plugins` → `Development` → `Import plugin from manifest`
   - Select the `manifest.json` file from this project

## 🚀 Quick Start

### 1. Set Up Your Figma Variables & Styles

#### String Variables (Localization)

Create string variables in Figma with different modes for each language:

```
Collection: "App Strings"
├── Mode: English (default)
├── Mode: Arabic
└── Mode: Spanish

Variables:
├── app_title = "My App" / "تطبيقي" / "Mi App"
├── welcome_message = "Welcome!" / "مرحبا!" / "¡Bienvenido!"
└── button_continue = "Continue" / "متابعة" / "Continuar"
```

#### Color Variables (Design Tokens)

Create color variables in Figma:

```
Collection: "Brand Colors"
├── Mode: Default

Variables:
├── primary = #6200EE
├── primary_dark = #3700B3
├── secondary = #03DAC6
├── background = #FFFFFF
├── error = #B00020
└── surface = #F5F5F5
```

#### Text Styles (Typography) - NEW! ✨

Create text styles in Figma with your typography system:

```
Text Styles:
├── Headline Large (32pt, Bold)
├── Headline Medium (24pt, SemiBold)
├── Body Large (16pt, Regular)
├── Body Medium (14pt, Regular)
├── Label Small (12pt, Medium)
└── Caption (10pt, Regular)
```

### 2. Configure GitHub Settings

1. Get a GitHub Personal Access Token:
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Click "Generate new token (classic)"
   - Select scope: `repo` (Full control of private repositories)
   - Copy the token (starts with `ghp_`)

2. In the plugin, enter:
   - GitHub Username
   - Repository Name
   - Base Branch (main/development)
   - Personal Access Token

3. Click **"Test"** to verify connection
4. Click **"Save"** to persist settings

### 3. Choose Export Types

Select what you want to export:

- ✅ **Strings**: Localization strings for multi-language support
- ✅ **Colors**: Design tokens for consistent theming
- ✅ **Fonts**: Typography styles for text consistency

### 4. Configure Platforms & Export

1. Select platforms: Android, iOS, and/or Flutter
2. Customize file paths (defaults work for most projects)
3. Click **"Load Variables from Figma"**
4. Review the stats
5. Click **"Export to GitHub"**
6. Review the automated pull request! 🎉

## 📱 Platform Examples

### 🤖 Android / Kotlin Multiplatform

**Strings XML:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_title">My App</string>
    <string name="welcome_message">Welcome!</string>
</resources>
```

**Colors XML:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary">#FF6200EE</color>
    <color name="secondary">#FF03DAC6</color>
</resources>
```

**Compose Colors:**
```kotlin
package com.example.theme

import androidx.compose.ui.graphics.Color

val Primary = Color(0xFF6200EE)
val Secondary = Color(0xFF03DAC6)
```

**Compose Typography:**
```kotlin
package com.example.theme

import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

val HeadlineLarge = TextStyle(
    fontSize = 32.sp,
    fontWeight = FontWeight(700),
    lineHeight = 40.sp
)
```

### 🍎 iOS / Swift

**Localizable.strings:**
```swift
/* Localization strings generated from Figma */

"app_title" = "My App";
"welcome_message" = "Welcome!";
```

**SwiftUI Colors:**
```swift
import SwiftUI

extension Color {
    static let primary = Color(hex: "#6200EE")
    static let secondary = Color(hex: "#03DAC6")
}
```

**SwiftUI Typography:**
```swift
import SwiftUI

extension Font {
    static let headlineLarge = Font.system(size: 32, weight: .bold)
    static let bodyMedium = Font.system(size: 14, weight: .regular)
}
```

### 🦋 Flutter / Dart

**ARB Strings:**
```json
{
  "@@locale": "en",
  "app_title": "My App",
  "welcome_message": "Welcome!"
}
```

**Dart Colors:**
```dart
import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color.fromARGB(255, 98, 0, 238);
  static const Color secondary = Color.fromARGB(255, 3, 218, 198);
}
```

**Dart Typography:**
```dart
import 'package:flutter/material.dart';

class AppTextStyles {
  static const TextStyle headlineLarge = TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.w700,
    height: 1.25,
  );
}
```

## 📁 Default File Paths

### Android / KMP
- Strings: `shared/src/commonMain/composeResources/{lang}/strings.xml`
- Colors XML: `shared/src/commonMain/composeResources/values/colors.xml`
- Compose Colors: `shared/src/commonMain/kotlin/theme/Color.kt`
- Typography: `shared/src/commonMain/kotlin/theme/Typography.kt`

### iOS
- Strings: `{lang}.lproj/Localizable.strings`
- Colors: `Shared/Theme/Colors.swift`
- Typography: `Shared/Theme/Typography.swift`

### Flutter
- Strings: `lib/l10n/app_{lang}.arb`
- Colors: `lib/theme/app_colors.dart`
- Typography: `lib/theme/app_text_styles.dart`

**Note:** All paths are fully customizable!

## 🌍 Supported Languages

Built-in mappings for 30+ languages including:

English, Arabic, Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean, Dutch, Polish, Turkish, Swedish, Norwegian, Danish, Finnish, Greek, Hebrew, Hindi, Thai, Vietnamese, Indonesian, Malay, Czech, Hungarian, Romanian, Ukrainian, and more.

## 🔧 Troubleshooting

### GitHub Connection
- **"Failed to get base branch"**: Verify branch name and token permissions
- **"Connection failed"**: Check token validity and internet connection

### File Paths
- **"Path does not exist"**: Create folder structure first or adjust paths
- Strings paths must include `{lang}` placeholder

### Variables
- **"No variables found"**: Create variables/text styles in Figma first
- Typography requires Text Styles (not just text layers)

## 🛠️ Development

### Build Commands
```bash
npm install          # Install dependencies
npm run build        # Build for production
npm run watch        # Build with watch mode
npm run clean        # Clean build artifacts
```

### Debug Mode
Set `DEBUG_MODE = true` in both `code.ts` and `ui.html` to enable console logging.

## 📝 Changelog

### v3.0.0 (2026-02-05) - Major Update! 🎉
- ✨ NEW: Flutter platform support (ARB, Dart colors, TextStyle)
- ✨ NEW: Typography/Font Styles export for all platforms
- ✨ NEW: Extract text styles from Figma
- 🎨 Enhanced UI with 3 export types
- 🦋 Complete Flutter integration

### v2.0.0 (2026-01-24)
- ✨ NEW: Color variables support
- ✨ NEW: Android Compose & iOS color extensions
- 🎨 Renamed to "Design System Sync"

### v1.0.0 (2026-01-15)
- 🚀 Initial release with string export

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/ZeyadAbdullah679/design-system-sync/issues)
- **Plugin:** [Figma Community](https://www.figma.com/community/plugin/1595034045326188787/design-system-sync)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with ❤️ for the multi-platform development community.

---

**Made with ❤️ for multi-platform design systems**
