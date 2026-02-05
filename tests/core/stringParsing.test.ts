describe('String Parsing Tests', () => {
  // Mock functions - these need to be extracted from your code.ts
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

  function escapeIOSString(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  const DEFAULT_LANGUAGE_MAP: { [key: string]: string } = {
    'English': 'en',
    'Arabic': 'ar',
    'Spanish': 'es',
    'French': 'fr',
    'German': 'de'
  };

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

  const mockModes = [
    { name: 'English', modeId: 'mode_en' },
    { name: 'Arabic', modeId: 'mode_ar' },
    { name: 'Spanish', modeId: 'mode_es' }
  ];

  const createMockStringVariable = (name: string, values: { [modeId: string]: string }) => ({
    id: `var_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description: '',
    type: 'STRING',
    values
  });

  const createMockCollection = (name: string, modes: any[], variables: any[]) => ({
    id: `col_${Math.random().toString(36).substr(2, 9)}`,
    name,
    modes,
    variables
  });

  const mockVariables = [
    createMockStringVariable('app_title', {
      'mode_en': 'My App',
      'mode_ar': 'تطبيقي',
      'mode_es': 'Mi App'
    }),
    createMockStringVariable('welcome_message', {
      'mode_en': 'Welcome!',
      'mode_ar': 'مرحبا!',
      'mode_es': '¡Bienvenido!'
    })
  ];

  const mockCollection = createMockCollection('App Strings', mockModes, mockVariables);

  describe('Android XML Generation', () => {
    test('should generate valid Android XML for multiple languages', () => {
      const result = parseVariablesToAndroidXML([mockCollection]);
      
      expect(result).toHaveProperty('en');
      expect(result).toHaveProperty('ar');
      expect(result).toHaveProperty('es');
      
      expect(result.en).toContain('<?xml version="1.0" encoding="utf-8"?>');
      expect(result.en).toContain('<resources>');
      expect(result.en).toContain('<string name="app_title">My App</string>');
      expect(result.en).toContain('</resources>');
    });

    test('should properly escape XML special characters', () => {
      const specialCharsVar = createMockStringVariable('special_chars', {
        'mode_en': 'Test <>&"\' chars'
      });
      
      const collection = createMockCollection('Test', mockModes, [specialCharsVar]);
      const result = parseVariablesToAndroidXML([collection]);
      
      expect(result.en).toContain('&lt;');
      expect(result.en).toContain('&gt;');
      expect(result.en).toContain('&amp;');
      expect(result.en).toContain('&quot;');
      expect(result.en).toContain('&apos;');
    });

    test('should handle empty collections gracefully', () => {
      const emptyCollection = createMockCollection('Empty', mockModes, []);
      const result = parseVariablesToAndroidXML([emptyCollection]);
      
      expect(Object.keys(result).length).toBe(0);
    });

    test('should handle newlines and tabs', () => {
      const multilineVar = createMockStringVariable('multiline', {
        'mode_en': 'Line 1\nLine 2\tTabbed'
      });
      
      const collection = createMockCollection('Test', mockModes, [multilineVar]);
      const result = parseVariablesToAndroidXML([collection]);
      
      expect(result.en).toContain('\\n');
      expect(result.en).toContain('\\t');
    });
  });

  describe('iOS Strings Generation', () => {
    test('should generate valid iOS Localizable.strings format', () => {
      const result = parseVariablesToIOSStrings([mockCollection]);
      
      expect(result).toHaveProperty('en');
      expect(result).toHaveProperty('ar');
      
      expect(result.en).toContain('/* Localization strings generated from Figma */');
      expect(result.en).toContain('"app_title" = "My App";');
      expect(result.en).toContain('"welcome_message" = "Welcome!";');
    });

    test('should properly escape iOS string special characters', () => {
      const specialCharsVar = createMockStringVariable('special', {
        'mode_en': 'Test "quotes" and \\backslash'
      });
      
      const collection = createMockCollection('Test', mockModes, [specialCharsVar]);
      const result = parseVariablesToIOSStrings([collection]);
      
      expect(result.en).toContain('\\"');
      expect(result.en).toContain('\\\\');
    });

    test('should handle Unicode characters (Arabic, Emojis)', () => {
      const unicodeVar = createMockStringVariable('unicode_test', {
        'mode_ar': 'مرحبا 👋'
      });
      
      const collection = createMockCollection('Test', mockModes, [unicodeVar]);
      const result = parseVariablesToIOSStrings([collection]);
      
      expect(result.ar).toContain('مرحبا 👋');
    });
  });

  describe('Flutter ARB Generation', () => {
    test('should generate valid ARB JSON format', () => {
      const result = parseVariablesToFlutterARB([mockCollection]);
      
      expect(result).toHaveProperty('en');
      expect(result).toHaveProperty('ar');
      
      const enData = JSON.parse(result.en);
      expect(enData['@@locale']).toBe('en');
      expect(enData['app_title']).toBe('My App');
      expect(enData['welcome_message']).toBe('Welcome!');
    });

    test('should produce valid JSON without syntax errors', () => {
      const result = parseVariablesToFlutterARB([mockCollection]);
      
      expect(() => JSON.parse(result.en)).not.toThrow();
      expect(() => JSON.parse(result.ar)).not.toThrow();
      expect(() => JSON.parse(result.es)).not.toThrow();
    });

    test('should handle special JSON characters', () => {
      const specialVar = createMockStringVariable('json_special', {
        'mode_en': 'Test "quotes" and \\ backslash'
      });
      
      const collection = createMockCollection('Test', mockModes, [specialVar]);
      const result = parseVariablesToFlutterARB([collection]);
      
      const parsed = JSON.parse(result.en);
      expect(parsed.json_special).toBe('Test "quotes" and \\ backslash');
    });
  });

  describe('Edge Cases', () => {
    test('should handle variables with only some language modes', () => {
      const partialVar = createMockStringVariable('partial', {
        'mode_en': 'English only'
      });
      
      const collection = createMockCollection('Test', mockModes, [partialVar]);
      const result = parseVariablesToAndroidXML([collection]);
      
      expect(result.en).toContain('partial');
      expect(result.ar).toBeUndefined();
    });

    test('should handle very long strings (1000+ chars)', () => {
      const longString = 'A'.repeat(1000);
      const longVar = createMockStringVariable('long_string', {
        'mode_en': longString
      });
      
      const collection = createMockCollection('Test', mockModes, [longVar]);
      const result = parseVariablesToAndroidXML([collection]);
      
      expect(result.en).toContain(longString);
    });

    test('should handle variable names with special characters', () => {
      const specialNameVar = createMockStringVariable('my-special_var.name', {
        'mode_en': 'Test'
      });
      
      const collection = createMockCollection('Test', mockModes, [specialNameVar]);
      const result = parseVariablesToAndroidXML([collection]);
      
      expect(result.en).toContain('my-special_var.name');
    });
  });
});
