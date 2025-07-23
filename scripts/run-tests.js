#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Test configuration
const testConfig = {
  client: {
    name: 'Frontend Tests',
    command: 'npm',
    args: ['run', 'test:client'],
    cwd: path.join(__dirname, '../client'),
  },
  server: {
    name: 'Backend Tests',
    command: 'npm',
    args: ['run', 'test:server'],
    cwd: path.join(__dirname, '../server'),
  },
  e2e: {
    name: 'End-to-End Tests',
    command: 'npm',
    args: ['run', 'test:e2e'],
    cwd: path.join(__dirname, '../'),
  },
  coverage: {
    name: 'Coverage Report',
    command: 'npm',
    args: ['run', 'test:coverage'],
    cwd: path.join(__dirname, '../'),
  },
};

// Utility functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(`  ${message}`, colors.bright + colors.cyan);
  log(`${'='.repeat(60)}`, colors.cyan);
}

function logSection(message) {
  log(`\n${'-'.repeat(40)}`, colors.blue);
  log(`  ${message}`, colors.bright + colors.blue);
  log(`${'-'.repeat(40)}`, colors.blue);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

// Run a single test suite
function runTestSuite(config) {
  return new Promise((resolve, reject) => {
    logSection(`Running ${config.name}`);
    logInfo(`Command: ${config.command} ${config.args.join(' ')}`);
    logInfo(`Directory: ${config.cwd}`);

    const child = spawn(config.command, config.args, {
      cwd: config.cwd,
      stdio: 'pipe',
      shell: true,
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      const message = data.toString();
      output += message;
      process.stdout.write(message);
    });

    child.stderr.on('data', (data) => {
      const message = data.toString();
      errorOutput += message;
      process.stderr.write(message);
    });

    child.on('close', (code) => {
      if (code === 0) {
        logSuccess(`${config.name} completed successfully`);
        resolve({ success: true, output, errorOutput });
      } else {
        logError(`${config.name} failed with exit code ${code}`);
        reject({ success: false, code, output, errorOutput });
      }
    });

    child.on('error', (error) => {
      logError(`${config.name} failed to start: ${error.message}`);
      reject({ success: false, error: error.message });
    });
  });
}

// Run all tests sequentially
async function runAllTests() {
  const results = {
    client: null,
    server: null,
    e2e: null,
    coverage: null,
  };

  try {
    // Run client tests
    logHeader('Starting Frontend Tests');
    results.client = await runTestSuite(testConfig.client);

    // Run server tests
    logHeader('Starting Backend Tests');
    results.server = await runTestSuite(testConfig.server);

    // Run E2E tests (if configured)
    if (process.argv.includes('--e2e')) {
      logHeader('Starting End-to-End Tests');
      results.e2e = await runTestSuite(testConfig.e2e);
    }

    // Run coverage report
    if (process.argv.includes('--coverage')) {
      logHeader('Generating Coverage Report');
      results.coverage = await runTestSuite(testConfig.coverage);
    }

    return results;
  } catch (error) {
    logError('Test execution failed');
    throw error;
  }
}

// Run tests in parallel
async function runTestsParallel() {
  logHeader('Running Tests in Parallel');
  
  const promises = [
    runTestSuite(testConfig.client).catch(error => ({ success: false, error })),
    runTestSuite(testConfig.server).catch(error => ({ success: false, error })),
  ];

  if (process.argv.includes('--e2e')) {
    promises.push(runTestSuite(testConfig.e2e).catch(error => ({ success: false, error })));
  }

  const results = await Promise.allSettled(promises);
  
  return {
    client: results[0].value || results[0].reason,
    server: results[1].value || results[1].reason,
    e2e: results[2]?.value || results[2]?.reason,
  };
}

// Generate test report
function generateReport(results) {
  logHeader('Test Execution Report');

  const summary = {
    total: 0,
    passed: 0,
    failed: 0,
    suites: [],
  };

  Object.entries(results).forEach(([suite, result]) => {
    if (result) {
      summary.total++;
      if (result.success) {
        summary.passed++;
        logSuccess(`${suite}: PASSED`);
      } else {
        summary.failed++;
        logError(`${suite}: FAILED`);
        if (result.error) {
          logError(`  Error: ${result.error}`);
        }
        if (result.code) {
          logError(`  Exit Code: ${result.code}`);
        }
      }
      summary.suites.push({ name: suite, ...result });
    }
  });

  logSection('Summary');
  logInfo(`Total Test Suites: ${summary.total}`);
  logInfo(`Passed: ${summary.passed}`);
  logInfo(`Failed: ${summary.failed}`);
  logInfo(`Success Rate: ${summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0}%`);

  if (summary.failed > 0) {
    logWarning('Some tests failed. Check the output above for details.');
    process.exit(1);
  } else {
    logSuccess('All tests passed! 🎉');
  }

  return summary;
}

// Watch mode
function runWatchMode() {
  logHeader('Starting Test Watch Mode');
  logInfo('Press Ctrl+C to stop watching');
  
  const clientWatch = spawn('npm', ['run', 'test:watch'], {
    cwd: path.join(__dirname, '../client'),
    stdio: 'inherit',
  });

  const serverWatch = spawn('npm', ['run', 'test:watch'], {
    cwd: path.join(__dirname, '../server'),
    stdio: 'inherit',
  });

  process.on('SIGINT', () => {
    logInfo('\nStopping watch mode...');
    clientWatch.kill('SIGINT');
    serverWatch.kill('SIGINT');
    process.exit(0);
  });
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  logHeader('FinT Test Runner');
  logInfo(`Node.js version: ${process.version}`);
  logInfo(`Platform: ${process.platform}`);
  logInfo(`Architecture: ${process.arch}`);

  // Check if we're in watch mode
  if (args.includes('--watch')) {
    runWatchMode();
    return;
  }

  try {
    let results;
    
    if (args.includes('--parallel')) {
      results = await runTestsParallel();
    } else {
      results = await runAllTests();
    }

    generateReport(results);
  } catch (error) {
    logError('Test runner failed');
    console.error(error);
    process.exit(1);
  }
}

// Command line argument parsing
function showHelp() {
  logHeader('FinT Test Runner Help');
  logInfo('Usage: node scripts/run-tests.js [options]');
  logInfo('');
  logInfo('Options:');
  logInfo('  --parallel    Run tests in parallel');
  logInfo('  --watch       Run tests in watch mode');
  logInfo('  --e2e         Include end-to-end tests');
  logInfo('  --coverage    Generate coverage report');
  logInfo('  --help        Show this help message');
  logInfo('');
  logInfo('Examples:');
  logInfo('  node scripts/run-tests.js                    # Run all tests sequentially');
  logInfo('  node scripts/run-tests.js --parallel         # Run tests in parallel');
  logInfo('  node scripts/run-tests.js --watch            # Run tests in watch mode');
  logInfo('  node scripts/run-tests.js --e2e --coverage   # Run E2E tests with coverage');
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Run the main function
main().catch((error) => {
  logError('Unexpected error occurred');
  console.error(error);
  process.exit(1);
}); 