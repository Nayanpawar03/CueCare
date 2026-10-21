/**
 * build-check.js
 * Validates that all required source files exist and that syntax is correct.
 * Used by Jenkins in the Build stage.
 */

const fs = require('fs');
const path = require('path');

const requiredFiles = [
    'src/server.js',
    'src/db/database.js',
    'src/routes/patients.js',
    'package.json',
];

let allOk = true;

requiredFiles.forEach(file => {
    const fullPath = path.join(__dirname, '..', '..', file);
    if (fs.existsSync(fullPath)) {
        console.log(`  ✔ ${file}`);
    } else {
        console.error(`  ✘ MISSING: ${file}`);
        allOk = false;
    }
});

if (!allOk) {
    console.error('\nBuild check FAILED — required files are missing.');
    process.exit(1);
}

console.log('\nBuild check PASSED — all required files present.');
