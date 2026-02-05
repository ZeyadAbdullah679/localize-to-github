// Type declarations for Figma plugin environment
declare function btoa(str: string): string;

figma.showUI(__html__, {
  width: 520,
  height: 780,
  themeColors: true
});

// Debug mode - Set to false for production
const DEBUG_MODE = false;

// Helper function to send logs to UI (only in debug mode)
function sendLog(message: string, type: string = 'info') {
  if (!DEBUG_MODE) return;
  
  figma.ui.postMessage({
    type: 'log',
    message: message,
    logType: type
  });
  console.log(`[${type}]`, message);
}

// Network request helper
async function makeRequest(url: string, options: any): Promise<any> {
  sendLog(`Making ${options.method || 'GET'} request to ${url}`);

  try {
    const response = await fetch(url, options);
    sendLog(`Response status: ${response.status}`);

    const responseText = await response.text();

    if (response.ok) {
      if (responseText) {
        try {
          const data = JSON.parse(responseText);
          return { ok: true, status: response.status, data: data };
        } catch (e) {
          return { ok: true, status: response.status, data: responseText };
        }
      }
      return { ok: true, status: response.status, data: null };
    } else {
      return { ok: false, status: response.status, error: responseText };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Network request failed';
    sendLog(`Request failed: ${errorMessage}`, 'error');
    throw error;
  }
}

// Base64 encode function
function encodeBase64(str: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';

  const utf8Bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    if (charCode < 0x80) {
      utf8Bytes.push(charCode);
    } else if (charCode < 0x800) {
      utf8Bytes.push(0xc0 | (charCode >> 6));
      utf8Bytes.push(0x80 | (charCode & 0x3f));
    } else if (charCode < 0x10000) {
      utf8Bytes.push(0xe0 | (charCode >> 12));
      utf8Bytes.push(0x80 | ((charCode >> 6) & 0x3f));
      utf8Bytes.push(0x80 | (charCode & 0x3f));
    } else {
      utf8Bytes.push(0xf0 | (charCode >> 18));
      utf8Bytes.push(0x80 | ((charCode >> 12) & 0x3f));
      utf8Bytes.push(0x80 | ((charCode >> 6) & 0x3f));
      utf8Bytes.push(0x80 | (charCode & 0x3f));
    }
  }

  for (let i = 0; i < utf8Bytes.length; i += 3) {
    const b1 = utf8Bytes[i];
    const b2 = i + 1 < utf8Bytes.length ? utf8Bytes[i + 1] : 0;
    const b3 = i + 2 < utf8Bytes.length ? utf8Bytes[i + 2] : 0;

    const enc1 = b1 >> 2;
    const enc2 = ((b1 & 3) << 4) | (b2 >> 4);
    const enc3 = ((b2 & 15) << 2) | (b3 >> 6);
    const enc4 = b3 & 63;

    output += chars.charAt(enc1);
    output += chars.charAt(enc2);
    output += i + 1 < utf8Bytes.length ? chars.charAt(enc3) : '=';
    output += i + 2 < utf8Bytes.length ? chars.charAt(enc4) : '=';
  }

  return output;
}

// Escape XML special characters
function escapeXML(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t');
}

// Escape iOS strings special characters
function escapeIOSString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

// Escape JSON strings for ARB
function escapeJSON(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

// ========================================
// COLOR CONVERSION FUNCTIONS
// ========================================

// Convert Figma color (0..1 RGBA) to ARGB hex for Android Compose (0xAARRGGBB)
function figmaColorToComposeHex(color: { r: number; g: number; b: number; a: number }): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = Math.round(color.a * 255);
  const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
  return `0x${toHex(a)}${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert Figma color (0..1 RGBA) to #AARRGGBB hex for Android XML
function figmaColorToAndroidHex(color: { r: number; g: number; b: number; a: number }): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = Math.round(color.a * 255);
  const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(a)}${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Simple hex for iOS/Flutter (UIColor/SwiftUI/Flutter Color initializer via hex string)
function figmaColorToHexString(color: { r: number; g: number; b: number; a: number }): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Default language mapping
const DEFAULT_LANGUAGE_MAP: { [key: string]: string } = {
  'English': 'en',
  'Arabic': 'ar',
  'Spanish': 'es',
  'French': 'fr',
  'German': 'de',
  'Italian': 'it',
  'Portuguese': 'pt',
  'Russian': 'ru',
  'Chinese': 'zh',
  'Japanese': 'ja',
  'Korean': 'ko',
  'Dutch': 'nl',
  'Polish': 'pl',
  'Turkish': 'tr',
  'Swedish': 'sv',
  'Norwegian': 'no',
  'Danish': 'da',
  'Finnish': 'fi',
  'Greek': 'el',
  'Hebrew': 'he',
  'Hindi': 'hi',
  'Thai': 'th',
  'Vietnamese': 'vi',
  'Indonesian': 'id',
  'Malay': 'ms',
  'Czech': 'cs',
  'Hungarian': 'hu',
  'Romanian': 'ro',
  'Ukrainian': 'uk'
};

// ========================================
// STRING PARSING FUNCTIONS
// ========================================

// Parse variables to Android XML format
function parseVariablesToAndroidXML(collections: any[]): { [lang: string]: string } {
  const xmlByLanguage: { [lang: string]: string } = {};

  collections.forEach(collection => {
    const modeMap: { [modeId: string]: string } = {};
    collection.modes.forEach((mode: any) => {
      modeMap[mode.modeId] = DEFAULT_LANGUAGE_MAP[mode.name] || mode.name.toLowerCase().substring(0, 2);
    });

    const stringsByLanguage: { [lang: string]: { [key: string]: string } } = {};

    collection.variables.forEach((variable: any) => {
      if (variable.type !== 'STRING') return;

      const varName = variable.name;

      Object.entries(variable.values).forEach(([modeId, value]) => {
        const langCode = modeMap[modeId];

        if (!stringsByLanguage[langCode]) {
          stringsByLanguage[langCode] = {};
        }

        stringsByLanguage[langCode][varName] = value as string;
      });
    });

    Object.entries(stringsByLanguage).forEach(([langCode, strings]) => {
      let xml = '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n';

      Object.entries(strings).forEach(([key, value]) => {
        const escapedValue = escapeXML(value);
        xml += `    <string name="${key}">${escapedValue}</string>\n`;
      });

      xml += '</resources>';
      xmlByLanguage[langCode] = xml;
    });
  });

  return xmlByLanguage;
}

// Parse variables to iOS Strings format
function parseVariablesToIOSStrings(collections: any[]): { [lang: string]: string } {
  const stringsByLanguage: { [lang: string]: string } = {};

  collections.forEach(collection => {
    const modeMap: { [modeId: string]: string } = {};
    collection.modes.forEach((mode: any) => {
      modeMap[mode.modeId] = DEFAULT_LANGUAGE_MAP[mode.name] || mode.name.toLowerCase().substring(0, 2);
    });

    const stringsData: { [lang: string]: { [key: string]: string } } = {};

    collection.variables.forEach((variable: any) => {
      if (variable.type !== 'STRING') return;

      const varName = variable.name;

      Object.entries(variable.values).forEach(([modeId, value]) => {
        const langCode = modeMap[modeId];

        if (!stringsData[langCode]) {
          stringsData[langCode] = {};
        }

        stringsData[langCode][varName] = value as string;
      });
    });

    Object.entries(stringsData).forEach(([langCode, strings]) => {
      let content = '/* Localization strings generated from Figma */\n\n';

      Object.entries(strings).forEach(([key, value]) => {
        const escapedValue = escapeIOSString(value);
        content += `"${key}" = "${escapedValue}";\n`;
      });

      stringsByLanguage[langCode] = content;
    });
  });

  return stringsByLanguage;
}

// Parse variables to Flutter ARB format
function parseVariablesToFlutterARB(collections: any[]): { [lang: string]: string } {
  const arbByLanguage: { [lang: string]: string } = {};

  collections.forEach(collection => {
    const modeMap: { [modeId: string]: string } = {};
    collection.modes.forEach((mode: any) => {
      modeMap[mode.modeId] = DEFAULT_LANGUAGE_MAP[mode.name] || mode.name.toLowerCase().substring(0, 2);
    });

    const stringsData: { [lang: string]: { [key: string]: string } } = {};

    collection.variables.forEach((variable: any) => {
      if (variable.type !== 'STRING') return;

      const varName = variable.name;

      Object.entries(variable.values).forEach(([modeId, value]) => {
        const langCode = modeMap[modeId];

        if (!stringsData[langCode]) {
          stringsData[langCode] = {};
        }

        stringsData[langCode][varName] = value as string;
      });
    });

    Object.entries(stringsData).forEach(([langCode, strings]) => {
      const arbObj: any = {
        "@@locale": langCode
      };

      Object.entries(strings).forEach(([key, value]) => {
        arbObj[key] = value;
      });

      arbByLanguage[langCode] = JSON.stringify(arbObj, null, 2);
    });
  });

  return arbByLanguage;
}

// ========================================
// COLOR EXTRACTION AND PARSING FUNCTIONS
// ========================================

type ColorVariableExport = {
  id: string;
  name: string;
  description: string;
  values: { [modeId: string]: { r: number; g: number; b: number; a: number } };
};

type ColorCollectionExport = {
  id: string;
  name: string;
  modes: { name: string; modeId: string }[];
  variables: ColorVariableExport[];
};

// Collect COLOR variables per collection
async function extractColorCollections(): Promise<ColorCollectionExport[]> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const exportData: ColorCollectionExport[] = [];

  for (const collection of collections) {
    const colorVariables: ColorVariableExport[] = [];

    for (const variableId of collection.variableIds) {
      const variable = await figma.variables.getVariableByIdAsync(variableId);

      if (variable && variable.resolvedType === 'COLOR') {
        const variableData: ColorVariableExport = {
          id: variable.id,
          name: variable.name,
          description: variable.description || '',
          values: {}
        };

        for (const modeId in variable.valuesByMode) {
          if (Object.prototype.hasOwnProperty.call(variable.valuesByMode, modeId)) {
            const val = variable.valuesByMode[modeId] as any;
            
            // Handle both direct color values and variable aliases
            if (val && typeof val === 'object' && 'type' in val && val.type === 'VARIABLE_ALIAS') {
              const aliasedVariable = await figma.variables.getVariableByIdAsync(val.id);
              if (aliasedVariable && aliasedVariable.resolvedType === 'COLOR') {
                const aliasedValue = aliasedVariable.valuesByMode[modeId] as any;
                if (aliasedValue && typeof aliasedValue === 'object' && 'r' in aliasedValue) {
                  variableData.values[modeId] = {
                    r: aliasedValue.r,
                    g: aliasedValue.g,
                    b: aliasedValue.b,
                    a: aliasedValue.a ?? 1
                  };
                }
              }
            } else if (val && typeof val === 'object' && 'r' in val) {
              variableData.values[modeId] = {
                r: val.r,
                g: val.g,
                b: val.b,
                a: val.a ?? 1
              };
            }
          }
        }

        if (Object.keys(variableData.values).length > 0) {
          colorVariables.push(variableData);
        }
      }
    }

    if (colorVariables.length > 0) {
      exportData.push({
        id: collection.id,
        name: collection.name,
        modes: collection.modes.map((mode) => ({
          name: mode.name,
          modeId: mode.modeId
        })),
        variables: colorVariables
      });
    }
  }

  return exportData;
}

// Generate Android colors.xml content from color collections
function generateAndroidColorsXML(colorCollections: ColorCollectionExport[]): string {
  const colorMap: { [name: string]: string } = {};

  colorCollections.forEach(collection => {
    const baseModeId = collection.modes[0]?.modeId;

    collection.variables.forEach(variable => {
      const colorVal = baseModeId ? variable.values[baseModeId] : undefined;
      if (!colorVal) return;
      
      const androidHex = figmaColorToAndroidHex(colorVal);
      const safeName = variable.name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
      colorMap[safeName] = androidHex;
    });
  });

  let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
  xml += '<!-- Generated from Figma color variables -->\n';
  xml += '<resources>\n';
  
  Object.entries(colorMap).forEach(([name, hex]) => {
    xml += `    <color name="${name}">${hex}</color>\n`;
  });
  
  xml += '</resources>';
  return xml;
}

// Generate Compose Color.kt
function generateComposeColorsKotlin(colorCollections: ColorCollectionExport[], packageName: string | null = null): string {
  const lines: string[] = [];

  if (packageName) {
    lines.push(`package ${packageName}`, '');
  }

  lines.push(
    'import androidx.compose.ui.graphics.Color',
    '',
    '// Generated from Figma color variables',
    ''
  );

  const colorDefs: { [name: string]: string } = {};

  colorCollections.forEach(collection => {
    const baseModeId = collection.modes[0]?.modeId;

    collection.variables.forEach(variable => {
      const colorVal = baseModeId ? variable.values[baseModeId] : undefined;
      if (!colorVal) return;
      
      const composeHex = figmaColorToComposeHex(colorVal);
      const safeName = variable.name
        .split(/[^a-zA-Z0-9]+/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join('')
        .replace(/^[0-9]/, '_$&');

      colorDefs[safeName] = composeHex;
    });
  });

  Object.entries(colorDefs).forEach(([name, hex]) => {
    lines.push(`val ${name} = Color(${hex})`);
  });

  lines.push('');
  return lines.join('\n');
}

// Generate iOS Swift colors
function generateIOSColorsSwift(colorCollections: ColorCollectionExport[], useSwiftUI: boolean): string {
  const lines: string[] = [];

  lines.push('// Generated from Figma color variables');
  lines.push(useSwiftUI ? 'import SwiftUI' : 'import UIKit');
  lines.push('');
  
  // Add hex initializer extension first
  if (useSwiftUI) {
    lines.push('// MARK: - Color Hex Initializer');
    lines.push('extension Color {');
    lines.push('    init(hex: String) {');
    lines.push('        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)');
    lines.push('        var int: UInt64 = 0');
    lines.push('        Scanner(string: hex).scanHexInt64(&int)');
    lines.push('        let a, r, g, b: UInt64');
    lines.push('        switch hex.count {');
    lines.push('        case 3: // RGB (12-bit)');
    lines.push('            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)');
    lines.push('        case 6: // RGB (24-bit)');
    lines.push('            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)');
    lines.push('        case 8: // ARGB (32-bit)');
    lines.push('            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)');
    lines.push('        default:');
    lines.push('            (a, r, g, b) = (255, 0, 0, 0)');
    lines.push('        }');
    lines.push('        self.init(');
    lines.push('            .sRGB,');
    lines.push('            red: Double(r) / 255,');
    lines.push('            green: Double(g) / 255,');
    lines.push('            blue: Double(b) / 255,');
    lines.push('            opacity: Double(a) / 255');
    lines.push('        )');
    lines.push('    }');
    lines.push('}');
  } else {
    lines.push('// MARK: - UIColor Hex Initializer');
    lines.push('extension UIColor {');
    lines.push('    convenience init(hex: String) {');
    lines.push('        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)');
    lines.push('        var int: UInt64 = 0');
    lines.push('        Scanner(string: hex).scanHexInt64(&int)');
    lines.push('        let a, r, g, b: UInt64');
    lines.push('        switch hex.count {');
    lines.push('        case 3: // RGB (12-bit)');
    lines.push('            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)');
    lines.push('        case 6: // RGB (24-bit)');
    lines.push('            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)');
    lines.push('        case 8: // ARGB (32-bit)');
    lines.push('            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)');
    lines.push('        default:');
    lines.push('            (a, r, g, b) = (255, 0, 0, 0)');
    lines.push('        }');
    lines.push('        self.init(');
    lines.push('            red: CGFloat(r) / 255,');
    lines.push('            green: CGFloat(g) / 255,');
    lines.push('            blue: CGFloat(b) / 255,');
    lines.push('            alpha: CGFloat(a) / 255');
    lines.push('        )');
    lines.push('    }');
    lines.push('}');
  }

  lines.push('');
  lines.push('// MARK: - Design System Colors');
  lines.push(useSwiftUI ? 'extension Color {' : 'extension UIColor {');

  const baseIndent = '    ';

  colorCollections.forEach(collection => {
    const baseModeId = collection.modes[0]?.modeId;

    collection.variables.forEach(variable => {
      const colorVal = baseModeId ? variable.values[baseModeId] : undefined;
      if (!colorVal) return;
      
      const hex = figmaColorToHexString(colorVal);
      const parts = variable.name.split(/[^a-zA-Z0-9]+/);
      const safeName = parts[0].toLowerCase() + parts.slice(1).map(p => 
        p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
      ).join('');

      const colorType = useSwiftUI ? 'Color' : 'UIColor';
      lines.push(`${baseIndent}static let ${safeName} = ${colorType}(hex: "${hex}")`);
    });
  });

  lines.push('}');
  lines.push('');
  return lines.join('\n');
}

// Generate Flutter Dart colors
function generateFlutterColors(colorCollections: ColorCollectionExport[]): string {
  const lines: string[] = [];

  lines.push('// Generated from Figma color variables');
  lines.push('import \'package:flutter/material.dart\';');
  lines.push('');
  lines.push('class AppColors {');

  colorCollections.forEach(collection => {
    const baseModeId = collection.modes[0]?.modeId;

    collection.variables.forEach(variable => {
      const colorVal = baseModeId ? variable.values[baseModeId] : undefined;
      if (!colorVal) return;
      
      const r = Math.round(colorVal.r * 255);
      const g = Math.round(colorVal.g * 255);
      const b = Math.round(colorVal.b * 255);
      const a = Math.round(colorVal.a * 255);

      const parts = variable.name.split(/[^a-zA-Z0-9]+/);
      const safeName = parts[0].toLowerCase() + parts.slice(1).map(p => 
        p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
      ).join('');

      lines.push(`  static const Color ${safeName} = Color.fromARGB(${a}, ${r}, ${g}, ${b});`);
    });
  });

  lines.push('}');
  lines.push('');
  return lines.join('\n');
}

// ========================================
// FONT/TYPOGRAPHY EXTRACTION AND GENERATION
// ========================================

// Typography data structures
type TypographyStyle = {
  name: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  lineHeight: number;
};

// Extract typography/font variables from Figma (from text styles or NUMBER variables)
async function extractTypographyStyles(): Promise<TypographyStyle[]> {
  const styles: TypographyStyle[] = [];
  
  // Get all local text styles
  const textStyles = await figma.getLocalTextStylesAsync();
  
  for (const style of textStyles) {
    // TextStyle has fontName, fontSize, letterSpacing, lineHeight, fontWeight
    const fontFamily = style.fontName.family;
    const fontSize = style.fontSize as number;
    
    // Handle letterSpacing (can be number or object with value/unit)
    let letterSpacing = 0;
    if (typeof style.letterSpacing === 'number') {
      letterSpacing = style.letterSpacing;
    } else if (style.letterSpacing && typeof style.letterSpacing === 'object' && 'value' in style.letterSpacing) {
      letterSpacing = style.letterSpacing.value as number;
    }
    
    // Handle lineHeight (can be number or object with value/unit)
    let lineHeight = fontSize * 1.2; // default
    if (typeof style.lineHeight === 'number') {
      lineHeight = style.lineHeight;
    } else if (style.lineHeight && typeof style.lineHeight === 'object' && 'value' in style.lineHeight) {
      lineHeight = style.lineHeight.value as number;
    }
    
    // Map Figma font weight string to numeric value
    const fontWeightMap: { [key: string]: number } = {
      'Thin': 100,
      'ExtraLight': 200,
      'Light': 300,
      'Regular': 400,
      'Medium': 500,
      'SemiBold': 600,
      'Bold': 700,
      'ExtraBold': 800,
      'Black': 900
    };
    
    const fontWeight = fontWeightMap[style.fontName.style] || 400;

    styles.push({
      name: style.name,
      fontFamily: fontFamily,
      fontSize: fontSize,
      fontWeight: fontWeight,
      letterSpacing: letterSpacing,
      lineHeight: lineHeight
    });
  }

  return styles;
}


// Generate Android Compose Typography
function generateAndroidTypography(styles: TypographyStyle[], packageName: string | null): string {
  const lines: string[] = [];

  if (packageName) {
    lines.push(`package ${packageName}`, '');
  }

  lines.push('import androidx.compose.ui.text.TextStyle');
  lines.push('import androidx.compose.ui.text.font.FontWeight');
  lines.push('import androidx.compose.ui.unit.sp');
  lines.push('');
  lines.push('// Generated from Figma text styles');
  lines.push('');

  styles.forEach(style => {
    const safeName = style.name
      .split(/[^a-zA-Z0-9]+/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('');

    lines.push(`val ${safeName} = TextStyle(`);
    lines.push(`    fontSize = ${style.fontSize}.sp,`);
    lines.push(`    fontWeight = FontWeight(${style.fontWeight}),`);
    if (style.letterSpacing !== 0) {
      lines.push(`    letterSpacing = ${style.letterSpacing}.sp,`);
    }
    lines.push(`    lineHeight = ${style.lineHeight}.sp`);
    lines.push(')');
    lines.push('');
  });

  return lines.join('\n');
}

// Generate iOS Typography
function generateIOSTypography(styles: TypographyStyle[], useSwiftUI: boolean): string {
  const lines: string[] = [];

  lines.push('// Generated from Figma text styles');
  lines.push(useSwiftUI ? 'import SwiftUI' : 'import UIKit');
  lines.push('');
  lines.push('// MARK: - Typography Styles');
  lines.push(useSwiftUI ? 'extension Font {' : 'extension UIFont {');

  styles.forEach(style => {
    const parts = style.name.split(/[^a-zA-Z0-9]+/);
    const safeName = parts[0].toLowerCase() + parts.slice(1).map(p => 
      p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
    ).join('');

    if (useSwiftUI) {
      const swiftUIWeight = mapFontWeightToSwiftUI(style.fontWeight);
      lines.push(`    static let ${safeName} = Font.system(size: ${style.fontSize}, weight: .${swiftUIWeight})`);
    } else {
      const uiKitWeight = mapFontWeightToUIKit(style.fontWeight);
      lines.push(`    static let ${safeName} = UIFont.systemFont(ofSize: ${style.fontSize}, weight: .${uiKitWeight})`);
    }
  });

  lines.push('}');
  lines.push('');
  return lines.join('\n');
}

// Helper to map font weight to SwiftUI
function mapFontWeightToSwiftUI(weight: number): string {
  if (weight <= 100) return 'ultraLight';
  if (weight <= 200) return 'thin';
  if (weight <= 300) return 'light';
  if (weight <= 400) return 'regular';
  if (weight <= 500) return 'medium';
  if (weight <= 600) return 'semibold';
  if (weight <= 700) return 'bold';
  if (weight <= 800) return 'heavy';
  return 'black';
}

// Helper to map font weight to UIKit
function mapFontWeightToUIKit(weight: number): string {
  if (weight <= 100) return 'ultraLight';
  if (weight <= 200) return 'thin';
  if (weight <= 300) return 'light';
  if (weight <= 400) return 'regular';
  if (weight <= 500) return 'medium';
  if (weight <= 600) return 'semibold';
  if (weight <= 700) return 'bold';
  if (weight <= 800) return 'heavy';
  return 'black';
}

// Generate Flutter Typography
function generateFlutterTypography(styles: TypographyStyle[]): string {
  const lines: string[] = [];

  lines.push('// Generated from Figma text styles');
  lines.push('import \'package:flutter/material.dart\';');
  lines.push('');
  lines.push('class AppTextStyles {');

  styles.forEach(style => {
    const parts = style.name.split(/[^a-zA-Z0-9]+/);
    const safeName = parts[0].toLowerCase() + parts.slice(1).map(p => 
      p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
    ).join('');

    const flutterWeight = mapFontWeightToFlutter(style.fontWeight);

    lines.push(`  static const TextStyle ${safeName} = TextStyle(`);
    lines.push(`    fontSize: ${style.fontSize},`);
    lines.push(`    fontWeight: FontWeight.${flutterWeight},`);
    if (style.letterSpacing !== 0) {
      lines.push(`    letterSpacing: ${style.letterSpacing},`);
    }
    lines.push(`    height: ${(style.lineHeight / style.fontSize).toFixed(2)},`);
    lines.push(`  );`);
    lines.push('');
  });

  lines.push('}');
  lines.push('');
  return lines.join('\n');
}

// Helper to map font weight to Flutter
function mapFontWeightToFlutter(weight: number): string {
  if (weight <= 100) return 'w100';
  if (weight <= 200) return 'w200';
  if (weight <= 300) return 'w300';
  if (weight <= 400) return 'w400';
  if (weight <= 500) return 'w500';
  if (weight <= 600) return 'w600';
  if (weight <= 700) return 'w700';
  if (weight <= 800) return 'w800';
  return 'w900';
}

// ========================================
// MAIN MESSAGE HANDLERS
// ========================================

// Load saved settings with version
figma.clientStorage.getAsync('github-settings-v4').then((settings: any) => {
  figma.ui.postMessage({ type: 'load-settings', settings: settings || {} });
}).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Failed to load settings');
});

// Main message handler
figma.ui.onmessage = async (msg: any) => {
  if (DEBUG_MODE) {
    console.log('Received message:', msg.type);
  }

  // Save settings
  if (msg.type === 'save-settings' && msg.settings) {
    await figma.clientStorage.setAsync('github-settings-v4', msg.settings);
    figma.ui.postMessage({ type: 'settings-saved' });
  }

  // Export variables (strings, colors, fonts)
  if (msg.type === 'export-variables') {
    try {
      const collections = await figma.variables.getLocalVariableCollectionsAsync();

      if (collections.length === 0) {
        figma.ui.postMessage({ type: 'error', message: 'No variable collections found.' });
        return;
      }

      // Extract STRING variables
      const stringCollections: any[] = [];
      for (const collection of collections) {
        const stringVariables: any[] = [];

        for (const variableId of collection.variableIds) {
          const variable = await figma.variables.getVariableByIdAsync(variableId);

          if (variable && variable.resolvedType === 'STRING') {
            const variableData: any = {
              id: variable.id,
              name: variable.name,
              description: variable.description || '',
              type: variable.resolvedType,
              values: {}
            };

            for (const modeId in variable.valuesByMode) {
              if (Object.prototype.hasOwnProperty.call(variable.valuesByMode, modeId)) {
                variableData.values[modeId] = variable.valuesByMode[modeId];
              }
            }

            stringVariables.push(variableData);
          }
        }

        if (stringVariables.length > 0) {
          const collectionData: any = {
            id: collection.id,
            name: collection.name,
            modes: collection.modes.map((mode) => ({
              name: mode.name,
              modeId: mode.modeId
            })),
            variables: stringVariables
          };

          stringCollections.push(collectionData);
        }
      }

      const totalStrings = stringCollections.reduce((sum, col) => sum + col.variables.length, 0);
      const totalLanguages = stringCollections[0]?.modes.length || 0;

      // Extract COLOR variables
      const colorCollections = await extractColorCollections();
      const totalColors = colorCollections.reduce((sum, col) => sum + col.variables.length, 0);

      // Extract TYPOGRAPHY/FONT styles
      const typographyStyles = await extractTypographyStyles();
      const totalFonts = typographyStyles.length;

      // Combine collection names
      const allCollectionNames = [
        ...stringCollections.map(c => `${c.name} (strings)`),
        ...colorCollections.map(c => `${c.name} (colors)`)
      ];
      
      if (totalFonts > 0) {
        allCollectionNames.push(`Text Styles (${totalFonts} fonts)`);
      }

      figma.ui.postMessage({
        type: 'variables-data',
        data: {
          strings: stringCollections,
          colors: colorCollections,
          typography: typographyStyles
        },
        stats: {
          collections: stringCollections.length + colorCollections.length + (totalFonts > 0 ? 1 : 0),
          strings: totalStrings,
          languages: totalLanguages,
          colors: totalColors,
          fonts: totalFonts,
          collectionNames: allCollectionNames
        }
      });

      const parts = [];
      if (totalStrings > 0) parts.push(`${totalStrings} strings`);
      if (totalColors > 0) parts.push(`${totalColors} colors`);
      if (totalFonts > 0) parts.push(`${totalFonts} fonts`);
      
      figma.notify(`✅ Loaded ${parts.join(', ')}`);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      figma.ui.postMessage({ type: 'error', message: `Error: ${errorMessage}` });
    }
  }

  // Test GitHub Connection
  if (msg.type === 'test-github') {
    sendLog('Backend: Testing GitHub connection...');

    try {
      const { username, repo, token } = msg.settings;
      const url = `https://api.github.com/repos/${username}/${repo}`;

      const response = await makeRequest(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `token ${token}`,
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      if (response.ok) {
        const data = response.data;
        sendLog(`Backend: Success! Repository: ${data.full_name}`, 'success');

        figma.ui.postMessage({
          type: 'test-success',
          data: {
            fullName: data.full_name,
            private: data.private,
            defaultBranch: data.default_branch
          }
        });

        figma.notify('✅ GitHub connection successful!');
      } else {
        sendLog(`Backend: HTTP ${response.status}`, 'error');
        figma.ui.postMessage({ type: 'test-error', message: `HTTP ${response.status}: Check your token and repository access` });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendLog(`Backend: Exception: ${errorMessage}`, 'error');
      figma.ui.postMessage({ type: 'test-error', message: `Connection failed: ${errorMessage}` });
    }
  }

  // Upload to GitHub with PR
  if (msg.type === 'upload-github') {
    sendLog('Backend: Starting PR creation workflow...');
    figma.notify('🚀 Creating branch and PR...');

    try {
      const { 
        username, repo, baseBranch, token, commitMessage, 
        variablesData, exportTypes, platforms, filePaths, 
        branchName, prTitle, prTemplate 
      } = msg.data;

      if (!variablesData) {
        throw new Error('Invalid variables data received');
      }

      if (!platforms || (!platforms.android && !platforms.ios && !platforms.flutter)) {
        throw new Error('At least one platform must be selected');
      }

      if (!exportTypes || (!exportTypes.strings && !exportTypes.colors && !exportTypes.fonts)) {
        throw new Error('At least one export type must be selected');
      }

      const targetBranch = branchName || 'design-tokens';

      sendLog(`Backend: Repo: ${username}/${repo}`);
      sendLog(`Backend: Base: ${baseBranch} → Branch: ${targetBranch}`);

      // Prepare file updates array
      const fileUpdates: Array<{ path: string; content: string }> = [];

      // ========================================
      // STRINGS EXPORT
      // ========================================
      if (exportTypes.strings && variablesData.strings && variablesData.strings.length > 0) {
        sendLog('Step 1a: Parsing strings...');
        
        if (platforms.android) {
          const androidXML = parseVariablesToAndroidXML(variablesData.strings);
          Object.entries(androidXML).forEach(([langCode, xmlContent]) => {
            const valuesDir = langCode === 'en' ? 'values' : `values-${langCode}`;
            const path = filePaths.androidStrings.replace('{lang}', valuesDir);
            fileUpdates.push({ path, content: xmlContent });
          });
          sendLog(`Backend: Generated Android strings for ${Object.keys(androidXML).length} languages`);
        }

        if (platforms.ios) {
          const iosStrings = parseVariablesToIOSStrings(variablesData.strings);
          Object.entries(iosStrings).forEach(([langCode, content]) => {
            const langDir = langCode === 'en' ? 'Base' : langCode;
            const path = filePaths.iosStrings.replace('{lang}', langDir);
            fileUpdates.push({ path, content });
          });
          sendLog(`Backend: Generated iOS strings for ${Object.keys(iosStrings).length} languages`);
        }

        if (platforms.flutter) {
          const flutterARB = parseVariablesToFlutterARB(variablesData.strings);
          Object.entries(flutterARB).forEach(([langCode, content]) => {
            const path = filePaths.flutterStrings.replace('{lang}', langCode);
            fileUpdates.push({ path, content });
          });
          sendLog(`Backend: Generated Flutter ARB for ${Object.keys(flutterARB).length} languages`);
        }
      }

      // ========================================
      // COLORS EXPORT
      // ========================================
      if (exportTypes.colors && variablesData.colors && variablesData.colors.length > 0) {
        sendLog('Step 1b: Parsing colors...');
        
        if (platforms.android) {
          const androidColorsXml = generateAndroidColorsXML(variablesData.colors);
          fileUpdates.push({ 
            path: filePaths.androidColorsXml, 
            content: androidColorsXml 
          });
          sendLog('Backend: Generated Android colors.xml');

          if (filePaths.androidComposeColors && filePaths.androidComposeColors.trim()) {
            const composeColors = generateComposeColorsKotlin(
              variablesData.colors, 
              filePaths.androidComposePackage || null
            );
            fileUpdates.push({ 
              path: filePaths.androidComposeColors, 
              content: composeColors 
            });
            sendLog('Backend: Generated Compose Color.kt');
          }
        }

        if (platforms.ios) {
          const useSwiftUI = filePaths.iosColorStyle === 'swiftui';
          const iosColors = generateIOSColorsSwift(variablesData.colors, useSwiftUI);
          fileUpdates.push({ 
            path: filePaths.iosColors, 
            content: iosColors 
          });
          sendLog(`Backend: Generated iOS colors (${useSwiftUI ? 'SwiftUI' : 'UIKit'})`);
        }

        if (platforms.flutter) {
          const flutterColors = generateFlutterColors(variablesData.colors);
          fileUpdates.push({ 
            path: filePaths.flutterColors, 
            content: flutterColors 
          });
          sendLog('Backend: Generated Flutter colors');
        }
      }

      // ========================================
      // FONTS/TYPOGRAPHY EXPORT
      // ========================================
      if (exportTypes.fonts && variablesData.typography && variablesData.typography.length > 0) {
        sendLog('Step 1c: Parsing typography...');
        
        if (platforms.android && filePaths.androidTypography && filePaths.androidTypography.trim()) {
          const androidTypography = generateAndroidTypography(
            variablesData.typography,
            filePaths.androidComposePackage || null
          );
          fileUpdates.push({ 
            path: filePaths.androidTypography, 
            content: androidTypography 
          });
          sendLog('Backend: Generated Android Typography.kt');
        }

        if (platforms.ios) {
          const useSwiftUI = filePaths.iosColorStyle === 'swiftui';
          const iosTypography = generateIOSTypography(variablesData.typography, useSwiftUI);
          fileUpdates.push({ 
            path: filePaths.iosTypography, 
            content: iosTypography 
          });
          sendLog(`Backend: Generated iOS typography (${useSwiftUI ? 'SwiftUI' : 'UIKit'})`);
        }

        if (platforms.flutter) {
          const flutterTypography = generateFlutterTypography(variablesData.typography);
          fileUpdates.push({ 
            path: filePaths.flutterTypography, 
            content: flutterTypography 
          });
          sendLog('Backend: Generated Flutter typography');
        }
      }

      if (fileUpdates.length === 0) {
        throw new Error('No files to update. Please check your export settings and loaded variables.');
      }

      sendLog(`Backend: Total files to update: ${fileUpdates.length}`);

      // ========================================
      // GITHUB WORKFLOW
      // ========================================

      // Step 2: Get base branch reference
      sendLog('Step 2: Getting base branch reference...');
      const baseRefUrl = `https://api.github.com/repos/${username}/${repo}/git/ref/heads/${baseBranch}`;
      const baseRefResponse = await makeRequest(baseRefUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `token ${token}`,
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      if (!baseRefResponse.ok) {
        throw new Error(`Failed to get base branch '${baseBranch}'. Make sure the branch exists.`);
      }

      const baseSha = baseRefResponse.data.object.sha;
      sendLog(`Backend: Base SHA: ${baseSha.substring(0, 7)}`);

      // Step 3: Create or reset branch
      sendLog('Step 3: Creating/resetting branch...');
      const branchRefUrl = `https://api.github.com/repos/${username}/${repo}/git/refs/heads/${targetBranch}`;

      await makeRequest(branchRefUrl, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `token ${token}`,
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      const createRefUrl = `https://api.github.com/repos/${username}/${repo}/git/refs`;
      const createResponse = await makeRequest(createRefUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `token ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ref: `refs/heads/${targetBranch}`,
          sha: baseSha
        })
      });

      if (!createResponse.ok) {
        throw new Error(`Failed to create branch '${targetBranch}': ${createResponse.error}`);
      }

      sendLog('Backend: Branch ready!');

      // Step 4: Update all files
      sendLog(`Step 4: Updating ${fileUpdates.length} files...`);
      
      for (let i = 0; i < fileUpdates.length; i++) {
        const { path, content } = fileUpdates[i];
        
        sendLog(`Backend: [${i + 1}/${fileUpdates.length}] Updating ${path}...`);

        const fileUrl = `https://api.github.com/repos/${username}/${repo}/contents/${path}?ref=${targetBranch}`;
        const fileResponse = await makeRequest(fileUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `token ${token}`,
            'X-GitHub-Api-Version': '2022-11-28'
          }
        });

        const fileSha = fileResponse.ok ? fileResponse.data.sha : undefined;

        const updateFileUrl = `https://api.github.com/repos/${username}/${repo}/contents/${path}`;
        const base64Content = encodeBase64(content);

        const updateFileResponse = await makeRequest(updateFileUrl, {
          method: 'PUT',
          headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `token ${token}`,
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: commitMessage,
            content: base64Content,
            branch: targetBranch,
            ...(fileSha && { sha: fileSha })
          })
        });

        if (!updateFileResponse.ok) {
          const errorDetail = updateFileResponse.error ? JSON.parse(updateFileResponse.error) : {};
          if (errorDetail.message && errorDetail.message.includes('does not exist')) {
            throw new Error(`Path '${path}' does not exist. Please create the folder structure first.`);
          }
          throw new Error(`Failed to update ${path}: ${updateFileResponse.error}`);
        }

        sendLog(`Backend: ✓ Updated ${path}`);
      }

      // Step 5: Create PR
      sendLog('Step 5: Creating pull request...');
      
      const exportTypesList = [];
      if (exportTypes.strings) exportTypesList.push('Strings');
      if (exportTypes.colors) exportTypesList.push('Colors');
      if (exportTypes.fonts) exportTypesList.push('Typography');
      
      const platformsList = [];
      if (platforms.android) platformsList.push('Android');
      if (platforms.ios) platformsList.push('iOS');
      if (platforms.flutter) platformsList.push('Flutter');
      
      const finalPrTitle = prTitle || '🎨 Update Design Tokens from Figma';
      
      let prBody = '';
      if (prTemplate === 'detailed') {
        prBody = `## 🎨 Automated Design System Update

**Generated from Figma Variables**

### 📊 Summary
- **Export Types:** ${exportTypesList.join(', ')}
- **Platforms:** ${platformsList.join(', ')}
- **Files Updated:** ${fileUpdates.length}

### 📝 Updated Files
${fileUpdates.map(f => `- \`${f.path}\``).join('\n')}

### 🔄 Changes
This PR updates design tokens to match the latest Figma Variables.

---
*Automatically generated by Design System Sync v3.0*`;
      } else {
        prBody = `Updated design tokens from Figma.\n\n**Types:** ${exportTypesList.join(', ')}\n**Platforms:** ${platformsList.join(', ')}\n**Files:** ${fileUpdates.length}`;
      }
      
      const prUrl = `https://api.github.com/repos/${username}/${repo}/pulls`;
      const prPayload = {
        title: finalPrTitle,
        body: prBody,
        head: targetBranch,
        base: baseBranch
      };

      const prResponse = await makeRequest(prUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `token ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(prPayload)
      });

      if (prResponse.ok) {
        const prData = prResponse.data;
        sendLog(`Backend: PR #${prData.number} created!`, 'success');

        figma.ui.postMessage({
          type: 'upload-success',
          data: {
            prNumber: prData.number,
            prUrl: prData.html_url,
            exportTypes: exportTypesList,
            platforms: platformsList
          }
        });

        figma.notify(`🎉 PR #${prData.number} created!`, { timeout: 5000 });
      } else if (prResponse.status === 422) {
        sendLog('Backend: PR already exists', 'info');
        figma.ui.postMessage({
          type: 'upload-success',
          data: { 
            message: 'Files updated. PR already exists.', 
            exportTypes: exportTypesList, 
            platforms: platformsList 
          }
        });
        figma.notify('✅ Files updated!', { timeout: 3000 });
      } else {
        throw new Error(`PR creation failed: ${prResponse.error}`);
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendLog(`Backend: Error: ${errorMessage}`, 'error');
      figma.ui.postMessage({ type: 'upload-error', message: errorMessage });
      figma.notify(`❌ ${errorMessage}`, { error: true });
    }
  }

  if (msg.type === 'notify' && msg.message) {
    figma.notify(msg.message, { timeout: msg.timeout || 3000 });
  }
};
