# 🌐 Figma Localization Exporter

A powerful Figma plugin that automatically exports string variables to GitHub repositories with support for Android and iOS platforms.

![Version](https://img.shields.io/badge/version-1.0.0-blue)

## ✨ Features

- 🚀 **Multi-Platform Support**: Export to both Android XML and iOS Strings formats
- 🔄 **Automated PR Creation**: Automatically creates pull requests with your changes
- 📱 **Kotlin Multiplatform Ready**: Default paths configured for KMP projects
- 🎨 **Modern UI**: Beautiful, intuitive interface with dark mode support
- ⚙️ **Highly Configurable**: Customize file paths, branch names, PR templates, and more
- 🌍 **30+ Languages**: Built-in support for major world languages
- 💾 **Settings Persistence**: Save your configuration for quick exports
- 🔐 **Secure**: Uses GitHub Personal Access Tokens

## 📦 Installation

### Option 1: Install from Figma Community (Coming Soon)
Search for "Localization Exporter" in the Figma Community plugins.

### Option 2: Manual Installation (Development)

1. **Clone this repository:**
   ```bash
   git clone https://github.com/ZeyadAbdullah679/localize-to-github.git
   cd figma-localization-exporter
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

Create string variables in Figma with different modes for each language:

```
Collection: "App Strings"
├── Mode: English (default)
├── Mode: Arabic
└── Mode: Spanish

Variables:
├── app_title = "My App" / "تطبيقي" / "Mi App"
├── welcome_message = "Welcome!" / "مرحبا!" / "¡Bienvenido!"
└── ...
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

### 3. Configure Platforms

#### Android / KMP (Kotlin Multiplatform)
- **Default Path:** `shared/src/commonMain/composeResources/{lang}/strings.xml`
- **Output Format:** Android XML resources
- **Language Folders:** `values`, `values-ar`, `values-es`, etc.

**Example Output:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_title">My App</string>
    <string name="welcome_message">Welcome!</string>
</resources>
```

#### iOS / Swift
- **Default Path:** `{lang}.lproj/Localizable.strings`
- **Output Format:** iOS Strings format
- **Language Folders:** `Base.lproj`, `ar.lproj`, `es.lproj`, etc.

**Example Output:**
```swift
/* Localization strings generated from Figma */

"app_title" = "My App";
"welcome_message" = "Welcome!";
```

### 4. Export

1. Click **"Load Variables from Figma"**
2. Review the stats (collections, strings, languages)
3. Customize commit message (optional)
4. Click **"Export to GitHub"**
5. Wait for the PR to be created! 🎉

## ⚙️ Advanced Configuration

Click **"Show Advanced Options"** in the Export Configuration section to access:

### Branch Name
- **Default:** `localization`
- **Custom:** Use any branch name (e.g., `l10n`, `translations`, `feature/update-strings`)

### Pull Request Title
- **Default:** `🌐 Update Localization Strings from Figma`
- **Custom:** Personalize your PR title

### PR Description Template
- **Detailed (recommended):** Includes file list, platform info, and full formatting
- **Simple:** Minimal description with just languages and platforms

## 📁 File Path Examples

The `{lang}` placeholder is automatically replaced with the appropriate language code.

### Android Examples:
```
✅ shared/src/commonMain/composeResources/{lang}/strings.xml  (KMP default)
✅ app/src/main/res/{lang}/strings.xml  (Standard Android)
✅ android/app/src/main/res/{lang}/strings.xml
✅ modules/core/src/main/res/{lang}/strings.xml
```

### iOS Examples:
```
✅ {lang}.lproj/Localizable.strings  (Standard iOS)
✅ Resources/{lang}.lproj/Localizable.strings
✅ MyApp/{lang}.lproj/Localizable.strings
✅ Sources/Resources/{lang}.lproj/Localizable.strings
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

### Adding Custom Languages

To add custom language mappings, edit `code.ts`:

```typescript
const DEFAULT_LANGUAGE_MAP: { [key: string]: string } = {
  'English': 'en',
  'Arabic': 'ar',
  // Add your custom mappings:
  'Swahili': 'sw',
  'Bengali': 'bn',
  // ...
};
```

If the mode name is not in the map, the plugin uses the first 2 characters lowercased.

## 🔧 Troubleshooting

### "Failed to get base branch"
- Verify the base branch name is correct (e.g., `main`, `master`, `development`)
- Check that your token has access to the repository

### "Path does not exist"
- Make sure the folder structure exists in your repository
- Create the folders manually first, or adjust the path to match existing folders

### "Connection failed"
- Verify your GitHub token is valid and has `repo` scope
- Check your internet connection
- Ensure the repository exists and you have write access

### "No STRING variables found"
- Make sure you have variables with type "Text" in Figma
- Check that your variables are in a collection with at least one mode

### Files showing old values after update
- Clear Figma cache: `Plugins` → `Development` → `Clear saved plugin data`
- Rebuild: `rm code.js && npm run build`
- Reimport the plugin

## 🛠️ Development

### Project Structure
```
figma-localization-exporter/
├── manifest.json       # Plugin manifest
├── code.ts            # Backend logic (TypeScript)
├── ui.html            # Frontend UI
├── package.json       # Dependencies
├── tsconfig.json      # TypeScript config
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
rm code.js
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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/ZeyadAbdullah679/localize-to-github/issues)

## 🙏 Acknowledgments

- Built with ❤️ for the multi-platform development community
- Inspired by the need for better localization workflows
- Thanks to all contributors and users!

---

**Made with ❤️ for multi-platform development**
