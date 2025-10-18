const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all responsive classes in the codebase
const responsiveClasses = new Set();
const files = glob.sync('./src/**/*.{ts,tsx,js,jsx}');

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');

  // Match className attributes
  const classNameMatches = content.match(/className=["'][^"']*["']/g) || [];

  classNameMatches.forEach(match => {
    // Extract the classes
    const classes = match
      .replace(/className=["']/, '')
      .replace(/["']/, '')
      .split(/\s+/);

    // Filter for responsive classes (sm:, md:, lg:, xl:, 2xl:)
    classes.forEach(cls => {
      if (cls.match(/^(sm|md|lg|xl|2xl):/)) {
        responsiveClasses.add(cls);
      }
    });
  });
});

// Sort and output
const sorted = Array.from(responsiveClasses).sort();
console.log('Found', sorted.length, 'unique responsive classes:\n');
console.log('Safelist array format:');
console.log(JSON.stringify(sorted, null, 2));

// Also save to a file
fs.writeFileSync(
  'responsive-classes-found.json',
  JSON.stringify(sorted, null, 2)
);
console.log('\n✅ Saved to responsive-classes-found.json');
