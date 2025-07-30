#!/usr/bin/env node

/**
 * Clear Login Cache Script
 * 
 * This script helps clear any cached login credentials that might be causing issues.
 */

console.log('🧹 Clearing Login Cache');
console.log('=======================\n');

console.log('📋 Instructions:');
console.log('1. Open your browser developer tools (F12)');
console.log('2. Go to the Application/Storage tab');
console.log('3. Find "Local Storage" on the left');
console.log('4. Click on your domain (localhost:3000)');
console.log('5. Look for and delete these keys if they exist:');
console.log('   - fint_remembered_email');
console.log('   - fint_remembered_password');
console.log('   - fint_remember_me');
console.log('   - authToken');
console.log('\n6. Or run this in the browser console:');
console.log('   localStorage.clear();');
console.log('\n7. Then refresh the page');

console.log('\n🔍 Current Expected Credentials:');
console.log('   Email: test@example.com');
console.log('   Password: password123');

console.log('\n💡 If you still see demo@fint.com:');
console.log('   1. Clear browser cache completely');
console.log('   2. Hard refresh the page (Ctrl+Shift+R)');
console.log('   3. Check if there are any other login components');

console.log('\n✅ After clearing cache, the login form should show:');
console.log('   - test@example.com in the email field');
console.log('   - password123 in the password field');
console.log('   - "Development Mode" indicator at the top'); 