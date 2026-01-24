# 🎨 Design System Sync

A powerful Figma plugin that automatically exports design tokens (strings & colors) to GitHub repositories with support for Android, iOS, and Kotlin Multiplatform projects.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🌐 Localization (Strings)
- 📱 **Multi-Platform Support**: Export to Android XML and iOS Localizable.strings
- 🌍 **30+ Languages**: Built-in support for major world languages
- 🔄 **Multi-Mode Variables**: Export all language modes in one click

### 🎨 Design Tokens (Colors)
- 🤖 **Android XML**: Generate `colors.xml` for resource values
- ⚡ **Jetpack Compose**: Generate Kotlin `Color.kt` files
- 🍎 **iOS UIKit/SwiftUI**: Generate Swift color extensions
- 🎯 **RGBA Support**: Full alpha channel support with hex conversion

### 🚀 Automation
- 🔄 **Automated PR Creation**: Creates pull requests automatically
- 💾 **Settings Persistence**: Save your configuration for quick exports
- ⚙️ **Highly Configurable**: Customize paths, branches, PR templates
- 🔐 **Secure**: Uses GitHub Personal Access Tokens

### 💻 Developer Experience
- 🎨 **Modern UI**: Beautiful, intuitive interface with dark mode support
- 📊 **Real-time Stats**: See collections, strings, colors, and languages
- 🐛 **Debug Mode**: Built-in logging for troubleshooting
- 🚀 **KMP Ready**: Default paths configured for Kotlin Multiplatform

## 📦 Installation

### Option 1: Install from Figma Community
Search for "Design System Sync" in the Figma Community plugins.

### Option 2: Manual Installation (Development)

1. **Clone this repository:**
   ```bash
   git clone https://github.com/ZeyadAbdullah679/design-system-sync.git
   cd design-system-sync
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the plugin:**
   ```bash
   npm run build
   ```

4. **Import to Figma:**
   - Open Figma Desktop
   - Go to `Plugins` → `Development` → `Import plugin from manifest`
   - Select the `manifest.json` file from this project

## 🚀 Quick Start

### 1. Set Up Your Figma Variables

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

### 2. Configure GitHub Settings

1. **Get a GitHub Personal Access Token:**
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Select scope: `repo` (Full control of private repositories)
   - Copy the token (starts with `ghp_`)

2. **In the plugin, enter:**
   - GitHub Username: `your-username`
   - Repository Name: `your-repo`
   - Base Branch: `main` or `development`
   - Personal Access Token: `ghp_...`

3. **Click "Test"** to verify connection

4. **Click "Save"** to persist settings

### 3. Choose Export Types

Select what you want to export:

- ✅ **Strings**: Localization strings for multi-language support
- ✅ **Colors**: Design tokens for consistent theming

You can export both at once or individually!

### 4. Configure Platforms

#### 🤖 Android / KMP (Kotlin Multiplatform)

**Strings:**
- **Default Path:** `shared/src/commonMain/composeResources/{lang}/strings.xml`
- **Format:** Android XML resources
- **Language Folders:** `values`, `values-ar`, `values-es`, etc.

**Colors XML:**
- **Default Path:** `shared/src/commonMain/composeResources/values/colors.xml`
- **Format:** Android XML color resources

**Compose Colors (Optional):**
- **Path:** `shared/src/commonMain/kotlin/theme/Color.kt`
- **Package:** `com.example.theme`
- **Format:** Jetpack Compose Color definitions

**Example String Output (`values/strings.xml`):**
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_title">My App</string>
    <string name="welcome_message">Welcome!</string>
</resources>
```

**Example Colors XML Output (`values/colors.xml`):**
```xml
<?xml version="1.0" encoding="utf-8"?>
<!-- Generated from Figma color variables -->
<resources>
    <color name="primary">#FF6200EE</color>
    <color name="primary_dark">#FF3700B3</color>
    <color name="secondary">#FF03DAC6</color>
    <color name="background">#FFFFFFFF</color>
    <color name="error">#FFB00020</color>
</resources>
```

**Example Compose Output (`Color.kt`):**
```kotlin
package com.example.theme

import androidx.compose.ui.graphics.Color

// Generated from Figma color variables

val Primary = Color(0xFF6200EE)
val PrimaryDark = Color(0xFF3700B3)
val Secondary = Color(0xFF03DAC6)
val Background = Color(0xFFFFFFFF)
val Error = Color(0xFFB00020)
```

#### 🍎 iOS / Swift

**Strings:**
- **Default Path:** `{lang}.lproj/Localizable.strings`
- **Format:** iOS Strings format
- **Language Folders:** `Base.lproj`, `ar.lproj`, `es.lproj`, etc.

**Colors:**
- **Default Path:** `Shared/Theme/Colors.swift`
- **Style:** UIKit (UIColor) or SwiftUI (Color)
- **Format:** Swift color extensions

**Example String Output (`Base.lproj/Localizable.strings`):**
```swift
/* Localization strings generated from Figma */

"app_title" = "My App";
"welcome_message" = "Welcome!";
```

**Example SwiftUI Colors Output (`Colors.swift`):**
```swift
// Generated from Figma color variables
import SwiftUI

// MARK: - Color Hex Initializer
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Design System Colors
extension Color {
    static let primary = Color(hex: "#6200EE")
    static let primaryDark = Color(hex: "#3700B3")
    static let secondary = Color(hex: "#03DAC6")
    static let background = Color(hex: "#FFFFFF")
    static let error = Color(hex: "#B00020")
}
```

### 5. Export

1. Click **"Load Variables from Figma"**
2. Review the stats (strings, colors, languages, collections)
3. Customize commit message (optional)
4. Click **"Export to GitHub"**
5. Wait for the PR to be created! 🎉

## ⚙️ Advanced Configuration

Click **"Show Advanced Options"** in the Export Configuration section to access:

### Branch Name
- **Default:** `design-tokens`
- **Custom:** Use any branch name (e.g., `design-system`, `tokens`, `feature/update-colors`)

### Pull Request Title
- **Default:** `🎨 Update Design Tokens from Figma`
- **Custom:** Personalize your PR title

### PR Description Template
- **Detailed (recommended):** Includes file list, export types, platform info, and full formatting
- **Simple:** Minimal description with just summary

## 📁 File Path Examples

The `{lang}` placeholder is automatically replaced with the appropriate language code.

### Android Strings:
```
✅ shared/src/commonMain/composeResources/{lang}/strings.xml  (KMP default)
✅ app/src/main/res/{lang}/strings.xml  (Standard Android)
✅ android/app/src/main/res/{lang}/strings.xml
✅ modules/core/src/main/res/{lang}/strings.xml
```

### Android Colors:
```
✅ shared/src/commonMain/composeResources/values/colors.xml  (KMP default)
✅ app/src/main/res/values/colors.xml  (Standard Android)
✅ android/app/src/main/res/values/colors.xml
```

### Compose Colors (Optional):
```
✅ shared/src/commonMain/kotlin/theme/Color.kt
✅ app/src/main/kotlin/ui/theme/Color.kt
✅ core/theme/src/main/kotlin/Color.kt
```

### iOS Strings:
```
✅ {lang}.lproj/Localizable.strings  (Standard iOS)
✅ Resources/{lang}.lproj/Localizable.strings
✅ MyApp/{lang}.lproj/Localizable.strings
✅ Sources/Resources/{lang}.lproj/Localizable.strings
```

### iOS Colors:
```
✅ Shared/Theme/Colors.swift
✅ Sources/DesignSystem/Colors.swift
✅ MyApp/Theme/Colors.swift
```

## 🌍 Supported Languages

The plugin includes built-in mappings for 30+ languages:

| Figma Mode Name | Language Code | Language |
|----------------|---------------|----------|
| English | `en` | English |
| Arabic | `ar` | العربية |
| Spanish | `es` | Español |
| French | `fr` | Français |
| German | `de` | Deutsch |
| Italian | `it` | Italiano |
| Portuguese | `pt` | Português |
| Russian | `ru` | Русский |
| Chinese | `zh` | 中文 |
| Japanese | `ja` | 日本語 |
| Korean | `ko` | 한국어 |
| Dutch | `nl` | Nederlands |
| Polish | `pl` | Polski |
| Turkish | `tr` | Türkçe |
| Swedish | `sv` | Svenska |
| And 15+ more... | | |

### Adding Custom Languages

To add custom language mappings, edit `code.ts`:

```typescript
const DEFAULT_LANGUAGE_MAP: { [key: string]: string } = {
  'English': 'en',
  'Arabic': 'ar',
  // Add your custom mappings:
  'Swahili': 'sw',
  'Bengali': 'bn',
  'Urdu': 'ur',
  // ...
};
```

If the mode name is not in the map, the plugin uses the first 2 characters lowercased.

## 🍎 iOS Colors - No Setup Required!

The generated `Colors.swift` file includes the hex initializer extension automatically. Just add the file to your Xcode project and start using the colors:

```swift
// SwiftUI
Text("Hello")
    .foregroundColor(.primary)
    .background(.background)

// UIKit
label.textColor = .primary
view.backgroundColor = .background
```

## 🔧 Troubleshooting

### GitHub Connection Issues

**"Failed to get base branch"**
- Verify the base branch name is correct (e.g., `main`, `master`, `development`)
- Check that your token has access to the repository

**"Connection failed"**
- Verify your GitHub token is valid and has `repo` scope
- Check your internet connection
- Ensure the repository exists and you have write access

### File Path Issues

**"Path does not exist"**
- Make sure the folder structure exists in your repository
- Create the folders manually first, or adjust the path to match existing folders
- For Android: Ensure `values` folder exists for colors
- For iOS: Ensure `.lproj` folders exist for strings

**"Android strings path must include {lang} placeholder"**
- The strings path must contain `{lang}` which gets replaced with `values`, `values-ar`, etc.
- Correct: `app/src/main/res/{lang}/strings.xml`
- Wrong: `app/src/main/res/values/strings.xml`

### Variables Issues

**"No STRING variables found"**
- Make sure you have variables with type "Text" in Figma
- Check that your variables are in a collection with at least one mode

**"No COLOR variables found"**
- Make sure you have variables with type "Color" in Figma
- Check that your color variables have values assigned

**Colors not exporting**
- Ensure "Colors" export type is checked
- Verify you have COLOR variables (not just styles)
- Check that at least one platform is selected

### Compose Issues

**"Please provide a package name for Compose colors"**
- If you specify a Compose colors path, you must also provide a package name
- Example package: `com.example.theme` or `com.myapp.ui.theme`

**Compose colors not generating**
- Leave the Compose path empty if you only want XML colors
- The Compose generation is optional

### iOS Color Issues

**"Cannot find 'hex' in scope"**
- The generated Swift file requires a hex initializer extension
- Add the `UIColor(hex:)` or `Color(hex:)` extension to your project (see above)

### Cache Issues

**Files showing old values after update**
- Clear Figma cache: `Plugins` → `Development` → `Clear saved plugin data`
- Rebuild: `rm code.js && npm run build`
- Reimport the plugin

## 🛠️ Development

### Project Structure
```
design-system-sync/
├── manifest.json      # Plugin manifest
├── code.ts            # Backend logic (TypeScript)
├── ui.html            # Frontend UI
├── package.json       # Dependencies
├── tsconfig.json      # TypeScript config
├── LICENSE            # MIT License
└── README.md          # Documentation
```

### Build Commands
```bash
# Install dependencies
npm install

# Build for development (with watch)
npm run watch

# Build for production
npm run build

# Clean build artifacts
npm run clean
# or manually:
rm code.js code.js.map
```

### Debug Mode
To enable detailed logging for debugging:

1. In `code.ts`, set:
   ```typescript
   const DEBUG_MODE = true;
   ```

2. In `ui.html`, set:
   ```javascript
   const DEBUG_MODE = true;
   ```

3. Rebuild and open the browser console in Figma to see logs

### Testing Locally

1. **Build the plugin:**
   ```bash
   npm run build
   ```

2. **Import to Figma:**
   - Figma Desktop → Plugins → Development → Import plugin from manifest

3. **Test with sample data:**
   - Create test string variables with 2-3 languages
   - Create test color variables
   - Configure a test repository
   - Export and verify the PR

## 🎯 Use Cases

### 1. Kotlin Multiplatform Project
Export strings and colors for shared code across Android and iOS:
- Strings → `shared/src/commonMain/composeResources/{lang}/strings.xml`
- Colors → `shared/src/commonMain/composeResources/values/colors.xml`
- Compose → `shared/src/commonMain/kotlin/theme/Color.kt`

### 2. Native Android App
Export strings and design tokens for pure Android:
- Strings → `app/src/main/res/{lang}/strings.xml`
- Colors → `app/src/main/res/values/colors.xml`
- Compose → `app/src/main/kotlin/ui/theme/Color.kt`

### 3. Native iOS App
Export localization and theme colors:
- Strings → `{lang}.lproj/Localizable.strings`
- Colors → `Sources/DesignSystem/Colors.swift` (UIKit or SwiftUI)

### 4. Design System Only
Export just colors to maintain design consistency:
- Uncheck "Strings" export type
- Check "Colors" export type
- Configure Android and/or iOS color paths

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Ideas for Future Features
- [ ] Typography tokens (font families, sizes, weights)
- [ ] Spacing tokens (margins, paddings)
- [ ] Support for design tokens JSON format
- [ ] Auto-sync on variable changes
- [ ] Multiple repository support
- [ ] Team settings sync

## 📝 Changelog

### v2.0.0 (2026-01-24)
- ✨ **NEW:** Color variables support
- ✨ **NEW:** Android XML colors generation
- ✨ **NEW:** Jetpack Compose Color.kt generation
- ✨ **NEW:** iOS UIKit/SwiftUI color extensions
- 🎨 Renamed to "Design System Sync"
- ⚡ Export strings and colors together or separately
- 🔧 Improved UI with export type selection
- 📊 Enhanced stats with color counts
- 🐛 Better error handling for variable aliases

### v1.0.0 (2026-01-15)
- 🚀 Initial release
- 🌐 String variables export
- 🤖 Android XML strings support
- 🍎 iOS Localizable.strings support
- 🔄 Automated PR creation
- ⚙️ Advanced configuration options

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/ZeyadAbdullah679/design-system-sync/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for the multi-platform development community
- Inspired by the need for better design system and localization workflows
- Thanks to all contributors and users!
- Special thanks to the Figma Plugin API team

---

**Made with ❤️ for multi-platform design systems**


