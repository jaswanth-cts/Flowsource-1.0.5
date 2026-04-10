const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",

  // For Code Coverage
  // Collect coverage information
  collectCoverage: true,

  // Specify the directories to collect coverage from
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}', // Adjust the path according to your project structure
    'pages/**/*.{js,jsx,ts,tsx}', // Adjust the path according to your project structure    
    '!**/*.d.ts', // Exclude type declaration files
  ],

  // Specify the output directory for coverage reports
  coverageDirectory: 'coverage',

  // Specify the coverage reporters
  coverageReporters: ['json', 'lcov', 'text', 'clover'],

  moduleNameMapper: {
    // ...
    '^@/components/(.*)$': '<rootDir>/components/$1',
  }  
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
