
// This script helps handle environment setup without modifying package.json
// You can run this before building: node src/env-setup.js

const { execSync } = require('child_process');
console.log('Setting up environment...');

try {
  console.log('Updating browserslist database...');
  execSync('npx update-browserslist-db@latest', { stdio: 'inherit' });
  console.log('Browserslist database updated successfully!');
} catch (error) {
  console.warn('Warning: Could not update browserslist database');
  console.warn(error.message);
}

console.log('Environment setup complete.');
