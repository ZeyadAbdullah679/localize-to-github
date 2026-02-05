describe('Typography Parsing Tests', () => {
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

  function mapFontWeightToUIKit(weight: number): string {
    return mapFontWeightToSwiftUI(weight);
  }

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

  type TypographyStyle = {
    name: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    letterSpacing: number;
    lineHeight: number;
  };

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

  const createMockTextStyle = (
    name: string,
    fontSize: number,
    fontWeight: string = 'Regular'
  ): TypographyStyle => {
    const fontWeightMap: { [key: string]: number } = {
      'Thin': 100,
      'Light': 300,
      'Regular': 400,
      'Medium': 500,
      'SemiBold': 600,
      'Bold': 700,
      'Black': 900
    };

    return {
      name,
      fontFamily: 'Inter',
      fontSize,
      fontWeight: fontWeightMap[fontWeight] || 400,
      letterSpacing: 0,
      lineHeight: fontSize * 1.2
    };
  };

  const mockStyles = [
    createMockTextStyle('Headline Large', 32, 'Bold'),
    createMockTextStyle('Body Medium', 14, 'Regular'),
    createMockTextStyle('Caption', 10, 'Light')
  ];

  describe('Android Compose Typography', () => {
    test('should generate valid Kotlin TextStyle definitions', () => {
      const result = generateAndroidTypography(mockStyles, 'com.example.theme');
      
      expect(result).toContain('package com.example.theme');
      expect(result).toContain('import androidx.compose.ui.text.TextStyle');
      expect(result).toContain('val HeadlineLarge = TextStyle(');
      expect(result).toContain('fontSize = 32.sp');
      expect(result).toContain('fontWeight = FontWeight(700)');
    });

    test('should work without package name', () => {
      const result = generateAndroidTypography(mockStyles, null);
      
      expect(result).not.toContain('package');
      expect(result).toContain('val HeadlineLarge');
    });
  });

  describe('iOS Typography', () => {
    test('should generate SwiftUI Font extensions', () => {
      const result = generateIOSTypography(mockStyles, true);
      
      expect(result).toContain('import SwiftUI');
      expect(result).toContain('extension Font {');
      expect(result).toContain('static let headlineLarge = Font.system(size: 32, weight: .bold)');
    });

    test('should generate UIKit UIFont extensions', () => {
      const result = generateIOSTypography(mockStyles, false);
      
      expect(result).toContain('import UIKit');
      expect(result).toContain('extension UIFont {');
    });
  });

  describe('Flutter Typography', () => {
    test('should generate valid Dart TextStyle class', () => {
      const result = generateFlutterTypography(mockStyles);
      
      expect(result).toContain('import \'package:flutter/material.dart\';');
      expect(result).toContain('class AppTextStyles {');
      expect(result).toContain('static const TextStyle headlineLarge = TextStyle(');
    });
  });

  describe('Font Weight Mapping', () => {
    test('should map font weights to SwiftUI correctly', () => {
      expect(mapFontWeightToSwiftUI(100)).toBe('ultraLight');
      expect(mapFontWeightToSwiftUI(400)).toBe('regular');
      expect(mapFontWeightToSwiftUI(700)).toBe('bold');
    });

    test('should map font weights to Flutter correctly', () => {
      expect(mapFontWeightToFlutter(100)).toBe('w100');
      expect(mapFontWeightToFlutter(400)).toBe('w400');
      expect(mapFontWeightToFlutter(700)).toBe('w700');
    });
  });
});
