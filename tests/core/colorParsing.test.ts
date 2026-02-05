describe('Color Parsing Tests', () => {
    // Helper functions
    function figmaColorToComposeHex(color: { r: number; g: number; b: number; a: number }): string {
        const r = Math.round(color.r * 255);
        const g = Math.round(color.g * 255);
        const b = Math.round(color.b * 255);
        const a = Math.round(color.a * 255);
        const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
        return `0x${toHex(a)}${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    function figmaColorToAndroidHex(color: { r: number; g: number; b: number; a: number }): string {
        const r = Math.round(color.r * 255);
        const g = Math.round(color.g * 255);
        const b = Math.round(color.b * 255);
        const a = Math.round(color.a * 255);
        const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
        return `#${toHex(a)}${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    function figmaColorToHexString(color: { r: number; g: number; b: number; a: number }): string {
        const r = Math.round(color.r * 255);
        const g = Math.round(color.g * 255);
        const b = Math.round(color.b * 255);
        const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    function generateAndroidColorsXML(colorCollections: any[]): string {
        const colorMap: { [name: string]: string } = {};

        colorCollections.forEach(collection => {
            const baseModeId = collection.modes[0]?.modeId;

            collection.variables.forEach((variable: any) => {
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

    function generateComposeColorsKotlin(colorCollections: any[], packageName: string | null = null): string {
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

            collection.variables.forEach((variable: any) => {
                const colorVal = baseModeId ? variable.values[baseModeId] : undefined;
                if (!colorVal) return;

                const composeHex = figmaColorToComposeHex(colorVal);
                const safeName = variable.name
                    .split(/[^a-zA-Z0-9]+/)
                    .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
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

    function generateIOSColorsSwift(colorCollections: any[], useSwiftUI: boolean): string {
        const lines: string[] = [];

        lines.push('// Generated from Figma color variables');
        lines.push(useSwiftUI ? 'import SwiftUI' : 'import UIKit');
        lines.push('');

        if (useSwiftUI) {
            lines.push('// MARK: - Color Hex Initializer');
            lines.push('extension Color {');
            lines.push('    init(hex: String) {');
            lines.push('        // Hex initialization logic');
            lines.push('    }');
            lines.push('}');
        } else {
            lines.push('// MARK: - UIColor Hex Initializer');
            lines.push('extension UIColor {');
            lines.push('    convenience init(hex: String) {');
            lines.push('        // Hex initialization logic');
            lines.push('    }');
            lines.push('}');
        }

        lines.push('');
        lines.push('// MARK: - Design System Colors');
        lines.push(useSwiftUI ? 'extension Color {' : 'extension UIColor {');

        const baseIndent = '    ';

        colorCollections.forEach(collection => {
            const baseModeId = collection.modes[0]?.modeId;

            collection.variables.forEach((variable: any) => {
                const colorVal = baseModeId ? variable.values[baseModeId] : undefined;
                if (!colorVal) return;

                const hex = figmaColorToHexString(colorVal);
                const parts = variable.name.split(/[^a-zA-Z0-9]+/);
                const safeName = parts[0].toLowerCase() + parts.slice(1).map((p: string) =>
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

    function generateFlutterColors(colorCollections: any[]): string {
        const lines: string[] = [];

        lines.push('// Generated from Figma color variables');
        lines.push('import \'package:flutter/material.dart\';');
        lines.push('');
        lines.push('class AppColors {');

        colorCollections.forEach(collection => {
            const baseModeId = collection.modes[0]?.modeId;

            collection.variables.forEach((variable: any) => {
                const colorVal = baseModeId ? variable.values[baseModeId] : undefined;
                if (!colorVal) return;

                const r = Math.round(colorVal.r * 255);
                const g = Math.round(colorVal.g * 255);
                const b = Math.round(colorVal.b * 255);
                const a = Math.round(colorVal.a * 255);

                const parts = variable.name.split(/[^a-zA-Z0-9]+/);
                const safeName = parts[0].toLowerCase() + parts.slice(1).map((p: string) =>
                    p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
                ).join('');

                lines.push(`  static const Color ${safeName} = Color.fromARGB(${a}, ${r}, ${g}, ${b});`);
            });
        });

        lines.push('}');
        lines.push('');
        return lines.join('\n');
    }

    const createMockColorVariable = (
        name: string,
        r: number,
        g: number,
        b: number,
        a: number = 1
    ) => ({
        id: `var_${Math.random().toString(36).substr(2, 9)}`,
        name,
        description: '',
        type: 'COLOR',
        values: {
            'mode_default': { r: r / 255, g: g / 255, b: b / 255, a }
        }
    });


    describe('Color Conversion Functions', () => {
        test('should convert Figma color to Android hex correctly', () => {
            const color = { r: 0.38, g: 0, b: 0.93, a: 1 };
            const result = figmaColorToAndroidHex(color);

            // 0.38 * 255 = 96.9 ≈ 97 (0x61)
            // 0.93 * 255 = 237.15 ≈ 237 (0xED)
            expect(result).toBe('#FF6100ED');
        });

        test('should handle alpha channel in Android hex', () => {
            const color = { r: 1, g: 0, b: 0, a: 0.5 };
            const result = figmaColorToAndroidHex(color);

            expect(result).toMatch(/^#80FF0000$/);
        });

        test('should convert Figma color to Compose hex correctly', () => {
            const color = { r: 0.38, g: 0, b: 0.93, a: 1 };
            const result = figmaColorToComposeHex(color);

            expect(result).toBe('0xFF6100ED');
        });

        test('should convert Figma color to hex string (no alpha)', () => {
            const color = { r: 0.38, g: 0, b: 0.93, a: 1 };
            const result = figmaColorToHexString(color);

            expect(result).toBe('#6100ED');
        });

        test('should handle pure black color', () => {
            const black = { r: 0, g: 0, b: 0, a: 1 };
            expect(figmaColorToHexString(black)).toBe('#000000');
        });

        test('should handle pure white color', () => {
            const white = { r: 1, g: 1, b: 1, a: 1 };
            expect(figmaColorToHexString(white)).toBe('#FFFFFF');
        });

        test('should handle exact RGB values', () => {
            // Using exact values that won't have rounding issues
            const purple = { r: 98 / 255, g: 0, b: 238 / 255, a: 1 };
            const result = figmaColorToHexString(purple);

            expect(result).toBe('#6200EE');
        });

        test('should handle edge case values (0.001, 0.999)', () => {
            const edgeColor = { r: 0.001, g: 0.999, b: 0.5, a: 1 };
            const result = figmaColorToHexString(edgeColor);

            // 0.001 * 255 = 0.255 ≈ 0
            // 0.999 * 255 = 254.745 ≈ 255
            // 0.5 * 255 = 127.5 ≈ 128
            expect(result).toMatch(/^#00FF(7F|80)$/); // Allow for rounding
        });
    });


    describe('Android Colors XML Generation', () => {
        test('should generate valid colors.xml', () => {
            const colorVars = [
                createMockColorVariable('primary', 98, 0, 238),
                createMockColorVariable('secondary', 3, 218, 198)
            ];

            const collection = {
                id: 'col_test',
                name: 'Brand Colors',
                modes: [{ name: 'Default', modeId: 'mode_default' }],
                variables: colorVars
            };

            const result = generateAndroidColorsXML([collection]);

            expect(result).toContain('<?xml version="1.0" encoding="utf-8"?>');
            expect(result).toContain('<!-- Generated from Figma color variables -->');
            expect(result).toContain('<resources>');
            expect(result).toContain('<color name="primary">');
            expect(result).toContain('<color name="secondary">');
            expect(result).toContain('</resources>');
        });

        test('should sanitize color names for XML', () => {
            const colorVar = createMockColorVariable('primary-dark/hover', 55, 0, 179);

            const collection = {
                id: 'col_test',
                name: 'Test',
                modes: [{ name: 'Default', modeId: 'mode_default' }],
                variables: [colorVar]
            };

            const result = generateAndroidColorsXML([collection]);

            expect(result).toContain('primary_dark_hover');
            expect(result).not.toContain('primary-dark/hover');
        });
    });

    describe('Compose Colors Generation', () => {
        test('should generate valid Kotlin Color definitions', () => {
            const colorVars = [
                createMockColorVariable('primary', 98, 0, 238),
                createMockColorVariable('background', 255, 255, 255)
            ];

            const collection = {
                id: 'col_test',
                name: 'Colors',
                modes: [{ name: 'Default', modeId: 'mode_default' }],
                variables: colorVars
            };

            const result = generateComposeColorsKotlin([collection], 'com.example.theme');

            expect(result).toContain('package com.example.theme');
            expect(result).toContain('import androidx.compose.ui.graphics.Color');
            expect(result).toContain('val Primary = Color(0xFF6200EE)');
            expect(result).toContain('val Background = Color(0xFFFFFFFF)');
        });
    });

    describe('iOS Colors Generation', () => {
        test('should generate SwiftUI Color extensions with hex initializer', () => {
            const colorVars = [
                createMockColorVariable('primary', 98, 0, 238)
            ];

            const collection = {
                id: 'col_test',
                name: 'Colors',
                modes: [{ name: 'Default', modeId: 'mode_default' }],
                variables: colorVars
            };

            const result = generateIOSColorsSwift([collection], true);

            expect(result).toContain('import SwiftUI');
            expect(result).toContain('extension Color {');
            expect(result).toContain('init(hex: String)');
            expect(result).toContain('static let primary = Color(hex: "#6200EE")');
        });
    });

    describe('Flutter Colors Generation', () => {
        test('should generate valid Dart Color class', () => {
            const colorVars = [
                createMockColorVariable('primary', 98, 0, 238),
                createMockColorVariable('secondary', 3, 218, 198)
            ];

            const collection = {
                id: 'col_test',
                name: 'Colors',
                modes: [{ name: 'Default', modeId: 'mode_default' }],
                variables: colorVars
            };

            const result = generateFlutterColors([collection]);

            expect(result).toContain('import \'package:flutter/material.dart\';');
            expect(result).toContain('class AppColors {');
            expect(result).toContain('static const Color primary = Color.fromARGB(255, 98, 0, 238);');
            expect(result).toContain('static const Color secondary = Color.fromARGB(255, 3, 218, 198);');
        });
    });
});
