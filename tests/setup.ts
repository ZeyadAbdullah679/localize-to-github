// Mock global functions
global.btoa = (str: string): string => {
  return Buffer.from(str, 'binary').toString('base64');
};

global.fetch = jest.fn();

// Mock console methods in test environment
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};
