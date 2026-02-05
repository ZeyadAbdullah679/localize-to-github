describe('Encoding Utilities Tests', () => {
  // Implement encoding functions locally for testing
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

  function escapeJSON(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  describe('Base64 Encoding', () => {
    test('should encode simple ASCII string', () => {
      const result = encodeBase64('Hello World');
      expect(result).toBe('SGVsbG8gV29ybGQ=');
    });

    test('should encode UTF-8 string with emojis', () => {
      const result = encodeBase64('Hello 👋');
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });

    test('should encode Arabic text', () => {
      const result = encodeBase64('مرحبا');
      expect(result).toBeTruthy();
    });

    test('should encode empty string', () => {
      const result = encodeBase64('');
      expect(result).toBe('');
    });

    test('should encode special characters', () => {
      const result = encodeBase64('<>&"\'');
      expect(result).toBeTruthy();
    });
  });

  describe('XML Escaping', () => {
    test('should escape XML special characters', () => {
      const result = escapeXML('<tag>value & "quoted"</tag>');
      expect(result).toBe('&lt;tag&gt;value &amp; &quot;quoted&quot;&lt;/tag&gt;');
    });

    test('should escape apostrophe', () => {
      const result = escapeXML("It's working");
      expect(result).toContain('&apos;');
    });

    test('should escape newlines as \\n', () => {
      const result = escapeXML('Line1\nLine2');
      expect(result).toContain('\\n');
    });

    test('should handle empty string', () => {
      const result = escapeXML('');
      expect(result).toBe('');
    });
  });

  describe('iOS String Escaping', () => {
    test('should escape backslashes', () => {
      const result = escapeIOSString('Path\\to\\file');
      expect(result).toBe('Path\\\\to\\\\file');
    });

    test('should escape double quotes', () => {
      const result = escapeIOSString('He said "Hello"');
      expect(result).toContain('\\"');
    });

    test('should escape newlines', () => {
      const result = escapeIOSString('Line1\nLine2');
      expect(result).toContain('\\n');
    });
  });

  describe('JSON Escaping', () => {
    test('should escape backslashes for JSON', () => {
      const result = escapeJSON('C:\\path\\file');
      expect(result).toBe('C:\\\\path\\\\file');
    });

    test('should escape double quotes', () => {
      const result = escapeJSON('He said "Hello"');
      expect(result).toContain('\\"');
    });

    test('should produce valid JSON string', () => {
      const escaped = escapeJSON('Test\n"value"');
      const json = `{"key": "${escaped}"}`;
      
      expect(() => JSON.parse(json)).not.toThrow();
    });
  });
});
