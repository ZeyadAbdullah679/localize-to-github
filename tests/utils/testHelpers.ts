// Test data generators and mock helpers

export const createMockStringVariable = (name: string, values: { [modeId: string]: string }) => ({
  id: `var_${Math.random().toString(36).substr(2, 9)}`,
  name,
  description: '',
  type: 'STRING',
  resolvedType: 'STRING',
  values
});

export const createMockColorVariable = (
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
  resolvedType: 'COLOR',
  values: {
    'mode_default': { r: r / 255, g: g / 255, b: b / 255, a }
  }
});

export const createMockCollection = (name: string, modes: any[], variables: any[]) => ({
  id: `col_${Math.random().toString(36).substr(2, 9)}`,
  name,
  modes,
  variables
});

export const createMockTextStyle = (
  name: string,
  fontSize: number,
  fontWeight: string = 'Regular'
) => ({
  id: `style_${Math.random().toString(36).substr(2, 9)}`,
  name,
  fontSize,
  fontName: {
    family: 'Inter',
    style: fontWeight
  },
  letterSpacing: 0,
  lineHeight: { value: fontSize * 1.2, unit: 'PIXELS' }
});

export const mockGitHubResponse = (status: number, data: any) => ({
  ok: status >= 200 && status < 300,
  status,
  data
});
