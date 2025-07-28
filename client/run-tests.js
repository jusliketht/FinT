#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test suites to run
const testSuites = [
  { name: 'Dashboard', pattern: 'Dashboard.test.jsx' },
  { name: 'Accounts', pattern: 'Accounts.test.jsx' },
  { name: 'Reports', pattern: 'Reports.test.jsx' },
  { name: 'Login', pattern: 'Login.test.jsx' },
  { name: 'BankReconciliation', pattern: 'BankReconciliation.test.jsx' },
  { name: 'Invoices', pattern: 'Invoices.test.jsx' },
  { name: 'Transactions', pattern: 'Transactions.test.jsx' }
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runTest(testSuite) {
  log(`\n${colors.bright}Running ${testSuite.name} tests...${colors.reset}`, 'cyan');
  
  try {
    const command = `npm test -- --testPathPattern=${testSuite.pattern} --watchAll=false --verbose`;
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      timeout: 30000 // 30 second timeout
    });
    
    // Parse test results
    const passedMatch = output.match(/(\d+) passed/);
    const failedMatch = output.match(/(\d+) failed/);
    const totalMatch = output.match(/(\d+) total/);
    
    const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
    const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
    const total = totalMatch ? parseInt(totalMatch[1]) : 0;
    
    if (failed === 0) {
      log(`✅ ${testSuite.name}: ${passed}/${total} tests passed`, 'green');
      return { name: testSuite.name, status: 'passed', passed, failed, total };
    } else {
      log(`❌ ${testSuite.name}: ${failed}/${total} tests failed`, 'red');
      return { name: testSuite.name, status: 'failed', passed, failed, total };
    }
    
  } catch (error) {
    log(`❌ ${testSuite.name}: Test execution failed`, 'red');
    log(`Error: ${error.message}`, 'red');
    return { name: testSuite.name, status: 'error', passed: 0, failed: 0, total: 0, error: error.message };
  }
}

function generateReport(results) {
  const timestamp = new Date().toISOString();
  const totalTests = results.reduce((sum, r) => sum + r.total, 0);
  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  const passedSuites = results.filter(r => r.status === 'passed').length;
  const failedSuites = results.filter(r => r.status === 'failed').length;
  const errorSuites = results.filter(r => r.status === 'error').length;
  
  const report = {
    timestamp,
    summary: {
      totalSuites: results.length,
      passedSuites,
      failedSuites,
      errorSuites,
      totalTests,
      totalPassed,
      totalFailed,
      successRate: totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0
    },
    results
  };
  
  // Save report to file
  const reportPath = path.join(__dirname, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  return report;
}

function printSummary(report) {
  log('\n' + '='.repeat(60), 'bright');
  log('TEST EXECUTION SUMMARY', 'bright');
  log('='.repeat(60), 'bright');
  
  log(`\n📊 Overall Results:`, 'cyan');
  log(`   Total Test Suites: ${report.summary.totalSuites}`, 'reset');
  log(`   ✅ Passed Suites: ${report.summary.passedSuites}`, 'green');
  log(`   ❌ Failed Suites: ${report.summary.failedSuites}`, 'red');
  log(`   ⚠️  Error Suites: ${report.summary.errorSuites}`, 'yellow');
  log(`   Total Tests: ${report.summary.totalTests}`, 'reset');
  log(`   ✅ Passed Tests: ${report.summary.totalPassed}`, 'green');
  log(`   ❌ Failed Tests: ${report.summary.totalFailed}`, 'red');
  log(`   Success Rate: ${report.summary.successRate}%`, 'bright');
  
  log(`\n📋 Detailed Results:`, 'cyan');
  report.results.forEach(result => {
    const statusIcon = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⚠️';
    const statusColor = result.status === 'passed' ? 'green' : result.status === 'failed' ? 'red' : 'yellow';
    log(`   ${statusIcon} ${result.name}: ${result.passed}/${result.total} passed`, statusColor);
  });
  
  log(`\n📄 Report saved to: test-report.json`, 'cyan');
  log('='.repeat(60), 'bright');
}

async function main() {
  log('🚀 Starting FinT Application Test Suite', 'bright');
  log(`📅 ${new Date().toLocaleString()}`, 'cyan');
  
  const results = [];
  
  for (const testSuite of testSuites) {
    const result = runTest(testSuite);
    results.push(result);
    
    // Add a small delay between test suites
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  const report = generateReport(results);
  printSummary(report);
  
  // Exit with appropriate code
  const hasFailures = report.summary.failedSuites > 0 || report.summary.errorSuites > 0;
  process.exit(hasFailures ? 1 : 0);
}

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    log(`\n💥 Test execution failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runTest, generateReport, printSummary }; 