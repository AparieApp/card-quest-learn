#!/usr/bin/env node

/**
 * Build helper script that handles pre-build tasks
 * without modifying package.json
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Running pre-build tasks...');

// Check if browserslist needs updating
try {
  console.log('📊 Checking browserslist database...');
  execSync('npx update-browserslist-db@latest', { stdio: 'inherit' });
  console.log('✅ Browserslist database updated successfully');
} catch (error) {
  console.warn('⚠️ Warning: Could not update browserslist database');
  console.warn(error.message);
  // Continue with the build even if this fails
}

console.log('✅ Pre-build tasks completed');
