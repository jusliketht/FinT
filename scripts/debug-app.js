#!/usr/bin/env node

/**
 * FinT Application Debugging Script
 * 
 * This script helps diagnose common issues in the FinT application
 * by checking various components and configurations.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 FinT Application Debugging Script');
console.log('=====================================\n');

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  try {
    if (fs.existsSync(filePath)) {
      log(`✅ ${description}: Found`, 'green');
      return true;
    } else {
      log(`❌ ${description}: Not found`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ${description}: Error checking file`, 'red');
    return false;
  }
}

function checkEnvironmentVariable(filePath, varName, description) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const envVar = lines.find(line => line.startsWith(varName + '='));
      
      if (envVar) {
        log(`✅ ${description}: ${envVar}`, 'green');
        return true;
      } else {
        log(`❌ ${description}: Not found`, 'red');
        return false;
      }
    } else {
      log(`❌ ${description}: File not found`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ${description}: Error reading file`, 'red');
    return false;
  }
}

function checkPort(port, description) {
  try {
    const result = execSync(`netstat -an | findstr :${port}`, { encoding: 'utf8' });
    if (result.includes(`:${port}`)) {
      log(`✅ ${description}: Port ${port} is in use`, 'green');
      return true;
    } else {
      log(`❌ ${description}: Port ${port} is not in use`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ${description}: Port ${port} is not in use`, 'red');
    return false;
  }
}

function checkPackageJson(filePath, description) {
  try {
    if (fs.existsSync(filePath)) {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      log(`✅ ${description}: Found`, 'green');
      
      // Check for proxy configuration
      if (content.proxy) {
        log(`   Proxy: ${content.proxy}`, 'blue');
      } else {
        log(`   Proxy: Not configured`, 'yellow');
      }
      
      return true;
    } else {
      log(`❌ ${description}: Not found`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ${description}: Error parsing file`, 'red');
    return false;
  }
}

// Main debugging function
function runDebugChecks() {
  log('\n📁 File Structure Checks', 'bold');
  log('=======================');
  
  checkFile('client/package.json', 'Client package.json');
  checkFile('server/package.json', 'Server package.json');
  checkFile('client/.env', 'Client environment file');
  checkFile('server/.env', 'Server environment file');
  checkFile('client/src/services/api.js', 'Client API service');
  checkFile('server/src/main.ts', 'Server main file');
  
  log('\n🔧 Configuration Checks', 'bold');
  log('======================');
  
  checkEnvironmentVariable('client/.env', 'REACT_APP_API_URL', 'Client API URL');
  checkPackageJson('client/package.json', 'Client package.json configuration');
  checkPackageJson('server/package.json', 'Server package.json configuration');
  
  log('\n🌐 Network Checks', 'bold');
  log('=================');
  
  checkPort(3000, 'React development server');
  checkPort(5000, 'NestJS server');
  checkPort(5432, 'PostgreSQL database');
  
  log('\n📋 Common Issues Checklist', 'bold');
  log('==========================');
  
  // Check for common issues
  const clientEnvPath = 'client/.env';
  if (fs.existsSync(clientEnvPath)) {
    const content = fs.readFileSync(clientEnvPath, 'utf8');
    
    if (content.includes('REACT_APP_API_URL=http://localhost:5000/api/v1')) {
      log('✅ API URL configuration: Correct', 'green');
    } else {
      log('❌ API URL configuration: May need updating', 'red');
    }
  }
  
  const clientPackagePath = 'client/package.json';
  if (fs.existsSync(clientPackagePath)) {
    const content = JSON.parse(fs.readFileSync(clientPackagePath, 'utf8'));
    
    if (content.proxy === null || content.proxy === undefined) {
      log('✅ Proxy configuration: Correct (disabled)', 'green');
    } else {
      log('❌ Proxy configuration: May cause API issues', 'red');
    }
  }
  
  log('\n🚀 Quick Fixes', 'bold');
  log('==============');
  
  log('If you see issues above, try these steps:', 'yellow');
  log('1. Restart both client and server applications', 'blue');
  log('2. Check that all environment variables are set correctly', 'blue');
  log('3. Verify that the database is running', 'blue');
  log('4. Clear browser cache and localStorage', 'blue');
  log('5. Check browser console for JavaScript errors', 'blue');
  
  log('\n📞 Next Steps', 'bold');
  log('=============');
  
  log('If issues persist:', 'yellow');
  log('1. Check the detailed debugging guide in docs/ISSUES_AND_DEBUGGING.md', 'blue');
  log('2. Review server logs for error messages', 'blue');
  log('3. Check browser developer tools for network errors', 'blue');
  log('4. Verify database connection and migrations', 'blue');
  
  log('\n✨ Debugging complete!', 'green');
}

// Run the debugging checks
runDebugChecks(); 