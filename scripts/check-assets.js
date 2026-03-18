// scripts/check-assets.js
// Checks hero image file size — must be < 500KB for mobile BR performance
const fs = require('fs');
const path = require('path');

const heroPath = path.join(__dirname, '..', 'public', 'images', 'hero-background.webp');

if (!fs.existsSync(heroPath)) {
  console.error('ERROR: Hero image missing at public/images/hero-background.webp');
  process.exit(1);
}

const stats = fs.statSync(heroPath);
const sizeKB = stats.size / 1024;

if (sizeKB > 500) {
  console.error(`ERROR: Hero image is ${sizeKB.toFixed(0)}KB — must be < 500KB for mobile performance`);
  process.exit(1);
}

console.log(`OK: Hero image is ${sizeKB.toFixed(0)}KB (< 500KB limit)`);
