module.exports = {
  transform: {
    '.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts$', 
  testPathIgnorePatterns: ['/node_modules/', '\\.e2e\\.test\\.ts$',  '\\.e2e\\.spec\\.ts$'], // ignore e2e tests
  setupFilesAfterEnv: ['./jest.setup.ts']
}

